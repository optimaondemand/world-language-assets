# Builds the French 1 S2 "Vocabulaire" practice page.
#   python -I tools/build_vocab_fr1.py site       -> french1/vocabulaire/index.html (reads word lists + audio from the
#                                                    live french1-lessons site, paintings from media/french1/)
#   python -I tools/build_vocab_fr1.py preview DIR -> a self-contained copy in DIR (lists inline, audio + images copied)
#                                                    for review as a Claude artifact
import html as H, json, os, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS = os.path.expanduser('~/french1-lessons')
SITE = 'https://optimaondemand.github.io/french1-lessons/'
MODS = [(1, 'La famille en détail', 'Family & Character'), (2, 'Les régions', 'The Regions of France'), (3, 'À table !', 'Food & Dining'),
        (4, 'Le temps libre', 'Leisure & the Past'), (5, 'La ville', 'City Life'), (6, 'L’art et les musées', 'Art & Museums'),
        (7, 'La mode et le shopping', 'Fashion & Shopping'), (8, 'La musique et la fête', 'Music & Celebration'), (9, 'Être français', 'French Identity')]
mode = sys.argv[1] if len(sys.argv) > 1 else 'site'

def config(preview):
    mods = []
    for n, fr, en in MODS:
        f = os.path.join(LESSONS, 's2', 'm%02d' % n, 'practice-m%02d.json' % n)
        words = json.load(open(f, encoding='utf-8'))['words'] if preview else SITE + 's2/m%02d/practice-m%02d.json' % (n, n)
        img = ('img/m%d.jpg' % n) if preview else '../../media/french1/m%d.jpg' % n
        mods.append({'n': n, 'fr': fr, 'en': en, 'img': img, 'words': words})
    return {'id': 'french1-s2', 'lang': 'fr', 'title': 'Vocabulaire · Français 1, semestre 2',
            'audioBase': 'audio/' if preview else SITE + 'audio/', 'modules': mods}

def page(cfg, engine_src, inline_engine=False):
    eng = '<script>\n' + open(os.path.join(ROOT, 'engines', 'vocab.js'), encoding='utf-8').read() + '\n</script>' if inline_engine else '<script src="%s"></script>' % engine_src
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vocabulaire · Français 1</title>
<style>
/* Practice tool page in the French 1 S2 look: cream page, navy ink, gold accents, a tricolour rule. One light look. */
body {{ margin:0; background:#f7f3ea; color:#1d2a44; font-family:Lato,"Helvetica Neue",Arial,sans-serif }}
.wrap {{ max-width:960px; margin:0 auto; padding:20px 16px 40px }}
.top {{ display:flex; align-items:center; gap:12px; margin:0 0 14px }}
.top .rule {{ height:4px; width:72px; background:linear-gradient(90deg,#2b4c8c 0 33%,#fff 33% 66%,#a83232 66% 100%); border:1px solid #e2d6bb }}
.top .k {{ font-size:12.5px; letter-spacing:.2em; text-transform:uppercase; color:#b8892e }}
footer {{ color:#8a8478; font-size:12px; margin-top:18px }}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><span class="rule"></span><span class="k">Optima Academy Online · Français 1 · Boîte à outils</span></div>
  <div class="vocab-tool" data-config='{H.escape(json.dumps(cfg, ensure_ascii=False), quote=True)}'></div>
  <footer>Practice only, not graded. Words and recordings from the French 1 lessons. Paintings: public domain (Les Parapluies: CC0 photograph), via Wikimedia Commons.</footer>
</div>
{eng}
</body>
</html>
'''

if mode == 'site':
    out = os.path.join(ROOT, 'french1', 'vocabulaire', 'index.html'); os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page(config(False), '../../engines/vocab.js')); print(out)
else:
    dst = sys.argv[2]; os.makedirs(os.path.join(dst, 'img'), exist_ok=True)
    cfg = config(True); files = []
    for m in cfg['modules']:
        shutil.copy(os.path.join(ROOT, 'media', 'french1', 'm%d.jpg' % m['n']), os.path.join(dst, 'img', 'm%d.jpg' % m['n'])); files.append('img/m%d.jpg' % m['n'])
        for w in m['words']:
            src = os.path.join(LESSONS, 'audio', *w['audio'].split('/')); to = os.path.join(dst, 'audio', *w['audio'].split('/'))
            os.makedirs(os.path.dirname(to), exist_ok=True); shutil.copy(src, to); files.append('audio/' + w['audio'])
    open(os.path.join(dst, 'index.html'), 'w', encoding='utf-8').write(page(cfg, '', inline_engine=True))
    json.dump(sorted(set(files)), open(os.path.join(dst, '_files.json'), 'w'))
    print(dst, len(set(files)), 'files')
