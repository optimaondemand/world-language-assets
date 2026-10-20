# Builds the student-facing game pages from the data files.
#   python -I tools/build_pages.py        (run from the repository root)
# Each page inlines its game data (the engine reads it from the page) and loads the shared engine from engines/.
# Add a new game page by adding an entry to PAGES.
import html as H, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP = json.load(open(os.path.join(ROOT, 'data', 'map-mediterranean.json'), encoding='utf-8'))

PAGES = [
    {   # Latin 1 · Module 3 · Iter Aenēae (Troy to Sicily) — sits in Lesson 3.05
        'out': 'latin1/m03-iter-aeneae/index.html',
        'data': 'data/latin1/m03-voyage.json',
        'eyebrow': 'Optima Academy Online &middot; Latin 1 &middot; Module 3',
        'title': 'Iter Aenēae', 'subtitle': 'The Journey of Aeneas',
        'lede': 'Sail with Aeneas from burning Troy toward Sicily. Every right answer moves your ship one step closer to the next port. '
                'Get one wrong, and Juno sends a wind to push you back.',
    },
]

TEMPLATE = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · {subtitle}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Uncial+Antiqua&display=swap">
<style>
/* Aged parchment page, old-style book type (EB Garamond), ink and oxblood; the map carries the Roman look. */
:root {{ --parch:#efe3c6; --card:#fbf5e6; --ink:#2b1d0e; --muted:#5e4a32; --ox:#7a2e1f; --rule:#cdb88e;
        --body:"EB Garamond",Garamond,Georgia,serif; color-scheme:light }}
body {{ margin:0; background:var(--parch) radial-gradient(ellipse at 50% 20%, #f6eed8 0%, #efe3c6 55%, #e3d2ab 100%) fixed; color:var(--ink); font:19px/1.55 var(--body); }}
.wrap {{ max-width:820px; margin:0 auto; padding:28px 16px 44px }}
header {{ margin-bottom:16px; text-align:center }}
.eyebrow {{ font-size:16px; letter-spacing:.14em; font-variant:small-caps; text-transform:lowercase; color:var(--ox); margin:0 0 2px }}
h1 {{ font-weight:600; font-size:2.6rem; letter-spacing:.04em; margin:0; text-wrap:balance }}
h1 span {{ display:block; font-size:1.15rem; font-style:italic; font-weight:400; letter-spacing:0; color:var(--muted) }}
.orn {{ color:var(--ox); letter-spacing:.6em; margin:6px 0 0; font-size:15px }}
.lede {{ color:var(--muted); font-size:21px; margin:10px auto 0; max-width:58ch }}
.card {{ background:var(--card); border:1px solid var(--rule); outline:1px solid var(--rule); outline-offset:-6px; border-radius:4px; padding:18px;
        box-shadow:0 4px 14px rgba(60,40,15,.15) }}
footer {{ color:var(--muted); font-size:15px; margin-top:16px; max-width:75ch }}
footer a {{ color:var(--ox) }}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">{eyebrow}</p>
    <h1>{title} <span>{subtitle}</span></h1>
    <p class="orn" aria-hidden="true">&#10086; &#10086; &#10086;</p>
    <p class="lede">{lede}</p>
  </header>
  <div class="card">
    <div class="voyage-game" data-voyage='{data}'></div>
  </div>
  <footer>Coastlines: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> (public domain), simplified.
  Latin of the <em>Aeneid</em> quotations: Dickinson College Commentaries (Francese &amp; Reedy, <em>Vergil: Aeneid Selections</em>, 2016); English translations by Optima Academy Online.
  Fonts: EB Garamond and Uncial Antiqua (SIL Open Font License). &copy; Optima Academy Online.</footer>
</div>
<script src="{engine}"></script>
</body>
</html>
'''

for p in PAGES:
    d = json.load(open(os.path.join(ROOT, p['data']), encoding='utf-8'))
    d['map'] = MAP
    depth = p['out'].count('/')
    page = TEMPLATE.format(data=H.escape(json.dumps(d, ensure_ascii=False), quote=True), engine='../' * depth + 'engines/voyage.js',
                           **{k: p[k] for k in ('eyebrow', 'title', 'subtitle', 'lede')})
    out = os.path.join(ROOT, p['out'])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page)
    print(p['out'], round(len(page.encode('utf-8')) / 1024), 'KB')
