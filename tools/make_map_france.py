# Builds the France map for the map-voyage engine ("Le Tour de France", French 1 S2 Lesson 2.03) from Natural Earth
# 1:50m admin-0 countries (public domain, naturalearthdata.com). Clips to France and its neighbours, projects
# (equirectangular, true proportions at 46.5° N), simplifies, and writes data/map-france.json =
# {W, H, lon0, lat1, kx, ky, land: [neighbours' svg paths], france: [France's paths]}. French overseas regions are dropped.
# Usage: python -I tools/make_map_france.py <path to ne_50m_admin_0_countries.geojson>
import json, math, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LON0, LON1, LAT0, LAT1 = -5.8, 10.4, 41.0, 51.5
W = 640
KX = W / (LON1 - LON0)
KY = KX / math.cos(math.radians(46.5))
H = round((LAT1 - LAT0) * KY)


def proj(lon, lat): return ((lon - LON0) * KX, (LAT1 - lat) * KY)


def clip(poly, edge):
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


def dp(pts, tol):
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
land, france = [], []
for f in src['features']:
    name = f['properties'].get('ADMIN'); g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        ring = [tuple(p) for p in poly[0]]
        if not any(LON0 - 1 <= p[0] <= LON1 + 1 and LAT0 - 1 <= p[1] <= LAT1 + 1 for p in ring): continue
        for e in EDGES:
            ring = clip(ring, e)
            if not ring: break
        if len(ring) < 3: continue
        pts = [proj(*p) for p in ring]
        if area(pts) < 2.5: continue
        far = max(range(len(pts)), key=lambda k: math.hypot(pts[k][0] - pts[0][0], pts[k][1] - pts[0][1]))
        pts = dp(pts[:far + 1], 0.35)[:-1] + dp(pts[far:] + [pts[0]], 0.35)[:-1]
        if len(pts) < 3: continue
        (france if name == 'France' else land).append('M' + ' L'.join('%.1f %.1f' % p for p in pts) + ' Z')
out = {'W': W, 'H': H, 'lon0': LON0, 'lat1': LAT1, 'kx': round(KX, 4), 'ky': round(KY, 4), 'land': land, 'france': france,
       'source': 'Natural Earth 1:50m admin-0 countries (public domain), clipped and simplified'}
json.dump(out, open(os.path.join(HERE, 'data', 'map-france.json'), 'w', encoding='utf-8'), separators=(',', ':'))
print('map-france.json', W, 'x', H, '|', len(land), 'neighbour shapes,', len(france), 'France shapes')
