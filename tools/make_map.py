# Builds the voyage map's land shapes from Natural Earth 1:50m land polygons (public domain, naturalearthdata.com).
# Clips to the central/eastern Mediterranean, projects (equirectangular, true proportions at 36.5° N), simplifies,
# and writes data/map-mediterranean.json = {W, H, lon0, lat0, kx, ky, land: [svg path d, ...]}.
# Usage: python -I tools/make_map.py <path to ne_50m_land.geojson>
import json, math, sys, os
LON0, LON1, LAT0, LAT1 = 8.0, 30.5, 32.0, 42.5          # west, east, south, north edges
W = 640
KX = W / (LON1 - LON0)                                     # px per degree of longitude
KY = KX / math.cos(math.radians(36.5))                     # px per degree of latitude (true shape at 36.5° N)
H = round((LAT1 - LAT0) * KY)

def proj(lon, lat): return ((lon - LON0) * KX, (LAT1 - lat) * KY)

def clip(poly, edge):                                      # Sutherland–Hodgman against one edge of the box
    inside, cross = edge
    out = []
    for i in range(len(poly)):
        a, b = poly[i - 1], poly[i]
        ia, ib = inside(a), inside(b)
        if ib:
            if not ia: out.append(cross(a, b))
            out.append(b)
        elif ia: out.append(cross(a, b))
    return out
def lerp_x(a, b, x): t = (x - a[0]) / (b[0] - a[0]); return (x, a[1] + t * (b[1] - a[1]))
def lerp_y(a, b, y): t = (y - a[1]) / (b[1] - a[1]); return (a[0] + t * (b[0] - a[0]), y)
EDGES = [(lambda p: p[0] >= LON0, lambda a, b: lerp_x(a, b, LON0)), (lambda p: p[0] <= LON1, lambda a, b: lerp_x(a, b, LON1)),
         (lambda p: p[1] >= LAT0, lambda a, b: lerp_y(a, b, LAT0)), (lambda p: p[1] <= LAT1, lambda a, b: lerp_y(a, b, LAT1))]

def dp(pts, tol):                                          # Douglas–Peucker simplification
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + x2 * y1 - y2 * x1) / L
        if d > dmax: i, dmax = k, d
    if dmax <= tol: return [pts[0], pts[-1]]
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)
def area(pts): return abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2

src = json.load(open(sys.argv[1], encoding='utf-8'))
paths = []
for f in src['features']:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        ring = [tuple(p) for p in poly[0]]                 # outer ring only (no lakes at this scale here)
        if not any(LON0 - 1 <= p[0] <= LON1 + 1 and LAT0 - 1 <= p[1] <= LAT1 + 1 for p in ring): continue
        for e in EDGES:
            ring = clip(ring, e)
            if not ring: break
        if len(ring) < 3: continue
        pts = [proj(*p) for p in ring]
        if area(pts) < 2.5: continue                       # drop specks smaller than a few pixels
        far = max(range(len(pts)), key=lambda k: math.hypot(pts[k][0] - pts[0][0], pts[k][1] - pts[0][1]))
        pts = dp(pts[:far + 1], 0.35)[:-1] + dp(pts[far:] + [pts[0]], 0.35)[:-1]   # a closed ring: simplify in two halves
        if len(pts) < 3: continue
        paths.append('M' + ' L'.join('%.1f %.1f' % p for p in pts) + ' Z')
out = {'W': W, 'H': H, 'lon0': LON0, 'lat1': LAT1, 'kx': round(KX, 4), 'ky': round(KY, 4), 'land': paths,
       'source': 'Natural Earth 1:50m land (public domain), clipped and simplified'}
dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'map-mediterranean.json')   # repo: data/
json.dump(out, open(dst, 'w', encoding='utf-8'))
print(dst, 'W', W, 'H', H, 'polygons', len(paths), 'points', sum(p.count('L') + 1 for p in paths), 'KB', round(os.path.getsize(dst) / 1024))
