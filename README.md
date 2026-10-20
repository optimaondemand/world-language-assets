# World Language Games

Interactive games and tools for Optima Academy Online's world-language courses (Latin, Spanish, French),
published with GitHub Pages so lesson pages and Canvas can embed them.

**Site:** https://optimaondemand.github.io/world-language-games/

## How games get here

1. **Prototype:** a game is built and reviewed as a private Claude artifact.
2. **Approved:** once David approves it, the game moves here.
3. **Used selectively:** a game is placed in a lesson only where it fits that lesson. There is no rule
   that every module gets every game.

## Rules every game follows

- **Nothing untaught:** a game uses only language taught *before* the lesson it sits in.
- **Accents:** any game that needs typed accents provides a way to type them.
- **No student data leaves the device:** games keep progress only in the student's own browser. Nothing is
  sent anywhere. In a lesson, results can feed the "All Your Work" summary.
- **Media licensing:** only public domain, CC0, CC BY or CC BY-SA, with credits shown on the page and listed
  in `CREDITS.md`. No NC licences. Optima is a private tuition school.
- **Accessibility:** large text, keyboard use, and a calm version when a device asks for reduced motion.

## Layout

| Path | What it is |
|---|---|
| `engines/` | One file per game type, shared by every course (`voyage.js` = map voyage) |
| `data/` | The content of each game: questions, ports, story cards, map data |
| `<course>/<module>-<game>/index.html` | A ready-to-use game page, e.g. `latin1/m03-iter-aeneae/` |
| `tools/` | `build_pages.py` builds the pages from `data/`; `make_map.py` rebuilds the map from Natural Earth |

After changing data or an engine, run `python -I tools/build_pages.py`, check the page in a browser,
then commit and push. GitHub Pages republishes automatically. Afterwards, refresh the OneDrive mirror
(`_Shared/deployment-mirrors/refresh-mirrors.sh world-language-games`).

## Games

| Game | Course · where it fits | Page |
|---|---|---|
| *Iter Aenēae* (the journey of Aeneas) | Latin 1 · Module 3, Lesson 3.05 | `latin1/m03-iter-aeneae/` |

## Using a game in a lesson

Embed the page in a lesson page or a Canvas page with an iframe:

```html
<iframe src="https://optimaondemand.github.io/world-language-games/latin1/m03-iter-aeneae/"
        title="Iter Aenēae" style="width:100%;height:1250px;border:0" loading="lazy"></iframe>
```
