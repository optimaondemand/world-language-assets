/* vocab.js — "Vocabulaire" practice tool for Optima world-language courses (2026-10-20).
 * PRACTICE ONLY: never graded. Each module's real Vocabulary Check is a separate Canvas quiz; the page says so.
 * Word lists come from the course's own practice files (the same lists the lessons teach), so the tool never drifts
 * from the lessons. Four modes: Cartes (flip cards with sorting), Écoute (hear → meaning), Écris (type the word,
 * accent bank), Paires (match pairs against the clock). Progress (stars per module) is kept only in this browser.
 *
 * Page markup:
 *   <div class="vocab-tool" data-config='{"lang":"fr", "audioBase":"https://…/audio/",
 *        "modules":[{"n":1,"fr":"La famille en détail","en":"Family & Character","img":"…/m1.jpg","words":"…/practice-m01.json"}, …]}'></div>
 *   (each module's "words" may be a URL to a practice JSON {words:[{t,en,audio}]} or an inline array)
 * One shared file; our own CSS; no libraries.
 */
(function () {
  'use strict';
  var root = document.querySelector('.vocab-tool');
  if (!root) return;
  var C; try { C = JSON.parse(root.getAttribute('data-config')); } catch (e) { return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BANK = { fr: ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'œ', 'ù', 'û', 'ü', 'À', 'Ç', 'É', 'È', 'Ê', 'Î', 'Ô', 'Ù'],
               es: ['á', 'é', 'í', 'ñ', 'ó', 'ú', 'ü', '¿', '¡', 'Á', 'É', 'Í', 'Ñ', 'Ó', 'Ú', 'Ü'] }[C.lang || 'fr'] || [];
  var T = { fr: { know: 'Je sais', again: 'Encore', right: 'Bravo !', almost: 'Presque !', no: 'Pas encore.', check: 'Vérifier', next: 'Suivant →' },
            es: { know: 'Lo sé', again: 'Otra vez', right: '¡Bien!', almost: '¡Casi!', no: 'Todavía no.', check: 'Comprobar', next: 'Siguiente →' } }[C.lang || 'fr'];

  var css =
    '.vocab-tool{font-family:Lato,"Helvetica Neue",Arial,sans-serif;color:#1d2a44}' +
    '.vt-serif{font-family:"EB Garamond",Garamond,Georgia,serif}' +
    '.vt-note{background:#fbf6ea;border:1px solid #e2d6bb;border-left:5px solid #b8892e;border-radius:6px;padding:10px 14px;font-size:15px;margin:0 0 16px}' +
    '.vt-note b{color:#7a2e1f}' +
    '.vt-grid{display:flex;flex-wrap:wrap;gap:14px}' +
    '.vt-mod{flex:0 1 calc(33.333% - 10px);min-width:180px;background:#fff;border:1px solid #e2d6bb;border-radius:6px;overflow:hidden;cursor:pointer;text-align:left;padding:0;font:inherit;color:inherit;box-shadow:0 2px 6px rgba(40,30,10,.10);transition:transform .15s}' +
    '.vt-mod:hover{transform:translateY(-2px)}.vt-mod:focus-visible{outline:3px solid #2b4c8c;outline-offset:2px}' +
    '.vt-mod img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;border-bottom:3px solid #b8892e}' +
    '.vt-mod .k{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#b8892e;font-weight:700;padding:8px 12px 0}' +
    '.vt-mod .t{font-size:21px;line-height:1.2;padding:2px 12px 0}.vt-mod .e{font-size:13.5px;color:#5e5a52;padding:0 12px 4px}' +
    '.vt-mod .s{font-size:15px;color:#b8892e;padding:0 12px 10px;letter-spacing:.1em}' +
    '@media(max-width:620px){.vt-mod{max-width:100%}}' +
    '.vt-head{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 12px}' +
    '.vt-head img{width:120px;aspect-ratio:16/10;object-fit:cover;border-radius:4px;border:2px solid #b8892e}' +
    '.vt-head .t{font-size:28px;line-height:1.15}.vt-head .e{color:#5e5a52;font-size:14.5px}' +
    '.vt-back{background:none;border:0;color:#2b4c8c;font:700 15px inherit;font-family:inherit;cursor:pointer;padding:4px 0;margin:0 0 6px}' +
    '.vt-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}' +
    '.vt-tab{font-family:inherit;font-weight:700;font-size:16px;padding:9px 16px;border-radius:999px;border:2px solid #1d2a44;background:#fff;color:#1d2a44;cursor:pointer}' +
    '.vt-tab[aria-selected=true]{background:#1d2a44;color:#fff}' +
    '.vt-panel{background:#fff;border:1px solid #e2d6bb;border-radius:8px;padding:18px;min-height:260px}' +
    '.vt-card{perspective:1200px;max-width:460px;margin:6px auto 14px;height:220px;cursor:pointer}' +
    '.vt-card-in{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}' +
    '.vt-card.flip .vt-card-in{transform:rotateY(180deg)}' +
    '.vt-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center;' +
      'border:1px solid #e2d6bb;box-shadow:0 4px 12px rgba(40,30,10,.12)}' +
    '.vt-front{background:#fbf6ea}.vt-back{}.vt-face.vt-b{background:#1d2a44;color:#fff;transform:rotateY(180deg)}' +
    '.vt-face .w{font-size:38px;line-height:1.15}.vt-face .h{font-size:13px;color:#8a8478;margin-top:10px}.vt-face.vt-b .h{color:#cfc6b0}' +
    '.vt-say{font-size:20px;border:0;border-radius:50%;width:46px;height:46px;background:#2b4c8c;color:#fff;cursor:pointer;margin-top:10px}' +
    '.vt-say:focus-visible{outline:3px solid #b8892e;outline-offset:2px}' +
    '.vt-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;align-items:center}' +
    '.vt-btn{font-family:inherit;font-weight:700;font-size:17px;padding:10px 22px;border-radius:999px;border:2px solid #1d2a44;background:#1d2a44;color:#fff;cursor:pointer}' +
    '.vt-btn.alt{background:#fff;color:#1d2a44}.vt-btn.good{background:#2f6b3a;border-color:#2f6b3a}.vt-btn.redo{background:#fff;color:#a83232;border-color:#a83232}' +
    '.vt-btn:focus-visible{outline:3px solid #b8892e;outline-offset:3px}' +
    '.vt-meta{text-align:center;color:#5e5a52;font-size:14.5px;margin:6px 0 0}' +
    '.vt-q{text-align:center;font-size:18px;margin:4px 0 12px}' +
    '.vt-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;max-width:640px;margin:0 auto}' +
    '.vt-opt{font-family:inherit;font-size:17px;font-weight:600;padding:12px 14px;border-radius:8px;border:2px solid #d6cdb6;background:#fffdf7;color:#1d2a44;cursor:pointer;text-align:center}' +
    '.vt-opt:hover{background:#f6efdc}.vt-opt.ok{background:#2f6b3a;border-color:#2f6b3a;color:#fff}.vt-opt.no{background:#a83232;border-color:#a83232;color:#fff}' +
    '.vt-fb{text-align:center;font-size:17px;min-height:1.5em;margin:12px 0 0}.vt-fb.ok{color:#2f6b3a;font-weight:700}.vt-fb.no{color:#a83232}.vt-fb.mid{color:#9a6400;font-weight:700}' +
    '.vt-in{display:block;width:100%;max-width:420px;margin:0 auto;font-size:24px;padding:10px 12px;border:2px solid #2b4c8c;border-radius:8px;text-align:center;font-family:inherit;box-sizing:border-box}' +
    '.vt-bank{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:520px;margin:10px auto 4px}' +
    '.vt-bank button{font-family:inherit;font-size:19px;width:38px;height:38px;border:1px solid #9fb3cc;border-radius:6px;background:#fff;cursor:pointer;color:#1d2a44}' +
    '.vt-bank button:hover{background:#eef3fa}' +
    '.vt-bank-l{font-size:12.5px;color:#5e5a52;text-align:center;font-style:italic}' +
    '.vt-pairs{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:620px;margin:0 auto}' +
    '.vt-tile{font-family:inherit;font-size:17px;font-weight:600;padding:12px 10px;border-radius:8px;border:2px solid #d6cdb6;background:#fffdf7;color:#1d2a44;cursor:pointer;min-height:52px}' +
    '.vt-tile.sel{border-color:#2b4c8c;background:#e8eef8}.vt-tile.done{background:#2f6b3a;border-color:#2f6b3a;color:#fff;cursor:default;opacity:.85}.vt-tile.bad{border-color:#a83232;background:#fbeaea}' +
    '.vt-done{text-align:center;padding:16px 8px}.vt-done .t{font-size:30px}' +
    (reduce ? '.vt-card-in{transition:none}' : '');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  if (!document.querySelector('link[data-vt-fonts]')) {
    var fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.setAttribute('data-vt-fonts', '');
    fl.href = 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600&display=swap'; document.head.appendChild(fl);
  }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var store = (function () { try { var k = '__vt'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
  var KEY = 'vocabtool:' + (C.id || location.pathname);
  var prog = {}; try { prog = JSON.parse(store && store.getItem(KEY) || '{}'); } catch (e) {}
  function saveProg() { try { store && store.setItem(KEY, JSON.stringify(prog)); } catch (e) {} }
  function stars(n) { var p = prog[n] || {}; return ['cards', 'listen', 'write', 'pairs'].filter(function (m) { return p[m]; }).length; }
  function award(n, mode) { prog[n] = prog[n] || {}; prog[n][mode] = true; saveProg(); }

  var player = null;
  function say(w) { if (!w || !w.audio) return; try { if (player) player.pause(); player = new Audio((C.audioBase || '') + w.audio); player.play().catch(function () {}); } catch (e) {} }
  function sayBtn(w) { var b = el('button', 'vt-say', '🔊'); b.type = 'button'; b.setAttribute('aria-label', 'Listen'); b.addEventListener('click', function (e) { e.stopPropagation(); say(w); }); return b; }

  function norm(s) { return (s || '').toLowerCase().replace(/[’']/g, "'").replace(/[.!?,;:]/g, '').replace(/\s+/g, ' ').trim(); }
  function bare(s) { return norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe'); }
  function stripArt(s) { return norm(s).replace(/^(le |la |les |l'|un |une |des |el |los |las )/, ''); }
  function answerOf(w) { return w.t.replace(/\s*\(.*\)$/, ''); }      // "gentil (f. gentille)" style notes are on the English side
  function judge(got, want) {
    if (norm(got) === norm(want)) return 'ok';
    if (bare(got) === bare(want)) return 'accent';
    if (norm(got) === stripArt(want)) return 'article';
    return 'no';
  }

  var words = {};
  function load(m) {
    if (words[m.n]) return Promise.resolve(words[m.n]);
    if (Array.isArray(m.words)) { words[m.n] = m.words; return Promise.resolve(m.words); }
    return fetch(m.words).then(function (r) { return r.json(); }).then(function (d) { words[m.n] = d.words || d; return words[m.n]; });
  }

  // ---- screens ----
  function note() {
    var n = el('div', 'vt-note');
    n.innerHTML = '<b>Entraînement · Practice only, not graded.</b> Use this to prepare. Your <b>Vocabulary Check</b> in each module is a separate, graded quiz.';
    return n;
  }
  function home() {
    root.innerHTML = ''; root.appendChild(note());
    var h = el('div', 'vt-serif'); h.style.cssText = 'font-size:26px;margin:0 0 4px'; h.textContent = C.title || 'Vocabulaire';
    root.appendChild(h);
    var sub = el('div'); sub.style.cssText = 'color:#5e5a52;font-size:15px;margin:0 0 14px'; sub.textContent = 'Choose a module you have reached. Each mode you finish earns a star.';
    root.appendChild(sub);
    var g = el('div', 'vt-grid');
    C.modules.forEach(function (m) {
      var b = el('button', 'vt-mod'); b.type = 'button';
      if (m.img) { var i = el('img'); i.src = m.img; i.alt = ''; b.appendChild(i); }
      b.appendChild(el('div', 'k', 'Module ' + m.n));
      var t = el('div', 't vt-serif', m.fr); b.appendChild(t);
      b.appendChild(el('div', 'e', m.en));
      var s = stars(m.n); b.appendChild(el('div', 's', '★'.repeat(s) + '☆'.repeat(4 - s)));
      b.setAttribute('aria-label', 'Module ' + m.n + ': ' + m.fr + ', ' + s + ' of 4 stars');
      b.addEventListener('click', function () { open(m); });
      g.appendChild(b);
    });
    root.appendChild(g);
  }
  function open(m, mode) {
    root.innerHTML = '';
    load(m).then(function (W) {
      root.appendChild(note());
      var back = el('button', 'vt-back', '← All modules'); back.type = 'button'; back.addEventListener('click', home); root.appendChild(back);
      var hd = el('div', 'vt-head');
      if (m.img) { var i = el('img'); i.src = m.img; i.alt = ''; hd.appendChild(i); }
      var tx = el('div'); tx.appendChild(el('div', 't vt-serif', 'Module ' + m.n + ' · ' + m.fr)); tx.appendChild(el('div', 'e', m.en + ' · ' + W.length + ' words'));
      hd.appendChild(tx); root.appendChild(hd);
      var tabs = el('div', 'vt-tabs'); tabs.setAttribute('role', 'tablist');
      var panel = el('div', 'vt-panel'); panel.setAttribute('role', 'tabpanel');
      var MODES = [['cards', '🃏 Cartes'], ['listen', '🎧 Écoute'], ['write', '✍️ Écris'], ['pairs', '🧩 Paires']];
      MODES.forEach(function (md) {
        var b = el('button', 'vt-tab', md[1] + ((prog[m.n] || {})[md[0]] ? ' ★' : '')); b.type = 'button'; b.setAttribute('role', 'tab');
        b.addEventListener('click', function () { Array.prototype.forEach.call(tabs.children, function (x) { x.setAttribute('aria-selected', 'false'); }); b.setAttribute('aria-selected', 'true'); run(md[0], m, W, panel); });
        tabs.appendChild(b);
      });
      root.appendChild(tabs); root.appendChild(panel);
      tabs.children[MODES.map(function (x) { return x[0]; }).indexOf(mode || 'cards')].click();
    }).catch(function () { root.appendChild(el('div', 'vt-note', 'The word list could not be loaded. Check your connection and try again.')); });
  }
  function finish(panel, m, mode, msg) {
    award(m.n, mode); panel.innerHTML = '';
    var d = el('div', 'vt-done'); d.appendChild(el('div', 't vt-serif', T.right));
    d.appendChild(el('p', null, msg + ' You earned a star for this mode.'));
    var again = el('button', 'vt-btn alt', 'Again'); again.type = 'button'; again.addEventListener('click', function () { open(m, mode); });
    var all = el('button', 'vt-btn', 'All modules'); all.type = 'button'; all.addEventListener('click', home);
    var r = el('div', 'vt-row'); r.appendChild(again); r.appendChild(all); d.appendChild(r); panel.appendChild(d);
    try { window.dispatchEvent(new CustomEvent('mw-game', { detail: { name: 'Vocabulaire · Module ' + m.n + ' · ' + mode, done: true, summary: msg } })); } catch (e) {}
  }
  function run(mode, m, W, panel) { ({ cards: cards, listen: listen, write: write, pairs: pairs })[mode](m, W, panel); }

  // Cartes: flip, then sort into "Je sais" / "Encore"; the Encore pile comes back until it is empty
  function cards(m, W, panel) {
    var deck = shuffle(W), knew = 0, rounds = 1;
    function show() {
      panel.innerHTML = '';
      if (!deck.length) return finish(panel, m, 'cards', 'You worked through all ' + W.length + ' words' + (rounds > 1 ? ' in ' + rounds + ' rounds.' : '.'));
      var w = deck[0];
      var card = el('div', 'vt-card'); card.setAttribute('role', 'button'); card.tabIndex = 0; card.setAttribute('aria-label', 'Card: ' + w.t + '. Press to turn over.');
      var inn = el('div', 'vt-card-in');
      var f = el('div', 'vt-face vt-front'); f.appendChild(el('div', 'w vt-serif', w.t)); f.appendChild(sayBtn(w)); f.appendChild(el('div', 'h', 'Tap the card to see the meaning'));
      var b = el('div', 'vt-face vt-b'); b.appendChild(el('div', 'w vt-serif', w.en)); b.appendChild(el('div', 'h', w.t));
      inn.appendChild(f); inn.appendChild(b); card.appendChild(inn);
      function flip() { card.classList.toggle('flip'); }
      card.addEventListener('click', flip); card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
      panel.appendChild(card); say(w);
      var r = el('div', 'vt-row');
      var k = el('button', 'vt-btn good', '✓ ' + T.know); k.type = 'button'; k.addEventListener('click', function () { deck.shift(); knew++; show(); });
      var a = el('button', 'vt-btn redo', '↻ ' + T.again); a.type = 'button'; a.addEventListener('click', function () { deck.push(deck.shift()); if (deck.length && deck[0] === w) rounds++; show(); });
      r.appendChild(a); r.appendChild(k); panel.appendChild(r);
      panel.appendChild(el('div', 'vt-meta', deck.length + ' card' + (deck.length > 1 ? 's' : '') + ' left'));
    }
    show();
  }

  // Écoute: hear the word, choose its meaning (like the listening-based Vocabulary Check)
  function listen(m, W, panel) {
    var order = shuffle(W).slice(0, 10), i = 0, first = 0;
    function q() {
      panel.innerHTML = '';
      if (i >= order.length) return finish(panel, m, 'listen', first + ' of ' + order.length + ' right on the first try.');
      var w = order[i], tried = false;
      panel.appendChild(el('div', 'vt-q', 'Listen, then choose the meaning. (' + (i + 1) + ' of ' + order.length + ')'));
      var r = el('div', 'vt-row'); var sb = sayBtn(w); sb.style.cssText = 'width:64px;height:64px;font-size:28px'; r.appendChild(sb); panel.appendChild(r);
      var opts = el('div', 'vt-opts'); opts.style.marginTop = '14px';
      shuffle([w].concat(shuffle(W.filter(function (x) { return x !== w; })).slice(0, 3))).forEach(function (o) {
        var b = el('button', 'vt-opt', o.en); b.type = 'button';
        b.addEventListener('click', function () {
          if (o === w) { b.classList.add('ok'); if (!tried) first++; fb.className = 'vt-fb ok'; fb.textContent = T.right + ' ' + w.t + ' = ' + w.en;
            Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; }); setTimeout(function () { i++; q(); }, 1100); }
          else { b.classList.add('no'); b.disabled = true; tried = true; fb.className = 'vt-fb no'; fb.textContent = T.no + ' Listen again.'; say(w); }
        });
        opts.appendChild(b);
      });
      panel.appendChild(opts);
      var fb = el('div', 'vt-fb'); fb.setAttribute('aria-live', 'polite'); panel.appendChild(fb);
      say(w);
    }
    q();
  }

  // Écris: hear the word (and see its meaning), type it — with the article; accent bank inserts letters
  function write(m, W, panel) {
    var order = shuffle(W).slice(0, 10), i = 0, first = 0;
    function q() {
      panel.innerHTML = '';
      if (i >= order.length) return finish(panel, m, 'write', first + ' of ' + order.length + ' spelled right on the first try.');
      var w = order[i], tries = 0, want = answerOf(w);
      panel.appendChild(el('div', 'vt-q', 'Type the word in French (with le, la, un… if it has one). (' + (i + 1) + ' of ' + order.length + ')'));
      var r = el('div', 'vt-row'); r.appendChild(sayBtn(w)); var en = el('div', 'vt-serif', w.en); en.style.cssText = 'font-size:24px;margin-left:10px'; r.appendChild(en); panel.appendChild(r);
      var inp = el('input', 'vt-in'); inp.type = 'text'; inp.setAttribute('lang', C.lang || 'fr'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.spellcheck = false;
      inp.setAttribute('aria-label', 'Type the word'); inp.style.marginTop = '12px'; panel.appendChild(inp);
      var bank = el('div', 'vt-bank');
      BANK.forEach(function (ch) { var b = el('button', null, ch); b.type = 'button'; b.setAttribute('aria-label', 'Insert ' + ch);
        b.addEventListener('click', function () { var s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, e2 = inp.selectionEnd == null ? s : inp.selectionEnd;
          inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e2); inp.focus(); inp.setSelectionRange(s + 1, s + 1); }); bank.appendChild(b); });
      panel.appendChild(bank); panel.appendChild(el('div', 'vt-bank-l', 'Accents are part of the word: click a letter to add it.'));
      var row = el('div', 'vt-row'); row.style.marginTop = '12px';
      var chk = el('button', 'vt-btn', T.check); chk.type = 'button'; row.appendChild(chk); panel.appendChild(row);
      var fb = el('div', 'vt-fb'); fb.setAttribute('aria-live', 'polite'); panel.appendChild(fb);
      function check() {
        if (!inp.value.trim()) { fb.className = 'vt-fb'; fb.textContent = 'Type the word first.'; return; }
        tries++; var v = judge(inp.value, want);
        if (v === 'ok') { if (tries === 1) first++; fb.className = 'vt-fb ok'; fb.textContent = T.right + ' ' + want; say(w); chk.disabled = true; setTimeout(function () { i++; q(); }, 1100); return; }
        fb.className = v === 'no' ? 'vt-fb no' : 'vt-fb mid';
        fb.textContent = v === 'accent' ? T.almost + ' Check the accents.' : v === 'article' ? T.almost + ' Add the article (le, la, l’, les, un, une).' : T.no + ' Listen again and try.';
        if (tries >= 2) { fb.textContent += ' The answer: ' + want; var nx = el('button', 'vt-btn alt', T.next); nx.type = 'button'; nx.addEventListener('click', function () { i++; q(); }); row.appendChild(nx); chk.disabled = true; }
      }
      chk.addEventListener('click', check);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!chk.disabled) check(); } });
      say(w); inp.focus({ preventScroll: true });
    }
    q();
  }

  // Paires: 6 French–English pairs; tap one on each side; against a gentle clock
  function pairs(m, W, panel) {
    var set = shuffle(W).slice(0, 6), t0 = Date.now(), left = null, matched = 0, misses = 0;
    panel.innerHTML = '';
    panel.appendChild(el('div', 'vt-q', 'Match each French word to its meaning. Tap a word to hear it.'));
    var g = el('div', 'vt-pairs');
    var L = shuffle(set), R = shuffle(set);
    var tiles = [];
    for (var k = 0; k < set.length; k++) {
      (function (wl, wr) {
        var a = el('button', 'vt-tile vt-serif', wl.t); a.type = 'button'; a._w = wl; a._side = 'fr';
        var b = el('button', 'vt-tile', wr.en); b.type = 'button'; b._w = wr; b._side = 'en';
        g.appendChild(a); g.appendChild(b); tiles.push(a, b);
      })(L[k], R[k]);
    }
    function pick(t) {
      if (t.classList.contains('done')) return;
      if (t._side === 'fr') say(t._w);
      if (!left || left._side === t._side) { tiles.forEach(function (x) { x.classList.remove('sel'); }); left = t; t.classList.add('sel'); return; }
      if (left._w === t._w) { left.classList.remove('sel'); left.classList.add('done'); t.classList.add('done'); left.disabled = t.disabled = true; left = null; matched++;
        if (matched === set.length) { var s = Math.round((Date.now() - t0) / 1000); setTimeout(function () { finish(panel, m, 'pairs', 'All ' + set.length + ' pairs in ' + s + ' seconds' + (misses ? ' (' + misses + ' mismatch' + (misses > 1 ? 'es' : '') + ').' : ', with no mismatches.')); }, 600); } }
      else { misses++; var a = left; a.classList.add('bad'); t.classList.add('bad'); setTimeout(function () { a.classList.remove('bad', 'sel'); t.classList.remove('bad'); }, 500); left = null; }
    }
    tiles.forEach(function (t) { t.addEventListener('click', function () { pick(t); }); });
    panel.appendChild(g);
  }

  // Deep link from a lesson: #m1-listen opens Module 1 on the Écoute tab (modes: cards, listen, write, pairs)
  var dl = /^#m(\d+)(?:-(cards|listen|write|pairs))?$/.exec(location.hash);
  var dm = dl && C.modules.filter(function (m) { return String(m.n) === dl[1]; })[0];
  if (dm) open(dm, dl[2]); else home();
})();
