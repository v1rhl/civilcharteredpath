# Civil Chartered Path

A static website for civil engineers working towards ICE chartership (CEng MICE).

Live site: https://civilcharteredpath.co.uk (also https://v1rhl.github.io/civilcharteredpath/, which redirects there once the domain is set up)

Open `index.html` in a browser; no build step. To publish, upload the whole folder to any
static host (GitHub Pages, Netlify, Cloudflare Pages).

## Pages
The top nav has four sections: **Chartership** (route, planner, attributes, review day, presentation, flashcards,
questions, cheat sheet), **Guidance** (technical resources, careers), **Tools** and **News**. The sections and their
sub-pages are `SECTIONS` in `js/site.js`. A **Learning** tab is already in the nav but stays hidden until a
`<section id="view-learning">` exists; add any sub-pages to `SECTIONS.learning`.

| Page | What it does | Where its content lives |
|---|---|---|
| Home, Route, Attributes, Review day, Reference | Guide to the CEng route | `js/content.js` |
| Planner | Works back from a submission date to a dated plan | `PLAN` in `js/content.js` |
| Flashcards | Practice questions plus fact cards, with progress saved in the visitor's browser | `QUESTIONS`, `FACT_CARDS` in `js/content.js` |
| Questions | The practice questions as a list | `QUESTIONS` |
| Learning | Learning summaries: NEC4 contracts, CDM 2015 by role (with a role and project-type switcher and an F10 check), and how engineers learn (learning cycle, reflection, CPD, with a reflection drafter). Our own words, pointing to the source documents | `js/learn.js` |
| News | Latest headlines (links out) and a weekly briefing | `js/news-feed.js`, `NEWS` in `js/content.js` |
| Community | Forum and mock-review partners, design only, posting off | `FORUM_CATEGORIES`, `EXAMPLE_THREADS` |
| Tools | Hub listing every tool; built from `window.CP_TOOLS` | `js/site.js` |
| Sketch pad | Freehand and beam/frame diagram sketching on A4 sheets with a title block, typical details, image underlay, PNG/JPEG/SVG/PDF export; saved in the visitor's browser | `js/tools/sketch.js`, `js/tools/sketch-templates.js` |
| Retaining wall | Indicative first-pass check of cantilever and gravity retaining walls, with a live section, calc sheet and CSV/XLSX/PNG/PDF export. Not for construction. | `js/tools/retaining-wall.js` (page), `js/tools/retaining-wall-calc.js` (engine, tested by `node tools/test_retaining_wall.js`), `js/tools/export.js` (shared `CPExport`) |
| Site diary | Site visit record built for a phone: header details, photos from the camera or device, a plan from an image or PDF page with each photo pinned and a direction-of-view arrow, photo and plan markup with commentary, a PDF report, and visit files to back up or move a visit. Photos and plans stay on the device (IndexedDB); pdf.js and jsPDF load from cdnjs when first used | `js/tools/site-diary.js` |

## Look and feel
Colours and fonts are CSS custom properties at the top of the `<style>` block in `index.html`, built from five base
colours: Yale Blue `#0B4F6C`, Bright Snow `#FBFBFF`, Grey `#757575`, Jade Green `#20BF55` and Bright Sky `#01BAEF`.
Fonts are self-hosted in `fonts/` (Palanquin for the UI, PT Sans Caption for small labels); see `fonts/README.md`.

## Adding a tool
Put the script in `js/tools/<id>.js`, load it before `js/site.js` in `index.html`, and add a
`<section class="view wrap" id="view-<id>" data-view="<id>" hidden>` for it. The script registers itself with
`window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: "<id>", label: "Name", blurb: "One line for the hub card" }]);`
and `js/site.js` adds it to the routes, the Tools menu, the subnav and the hub. Keep its CSS scoped under `#view-<id>`.
Other tools can send a drawing to the sketch pad with `window.CPSketch.importDetail({ svg, title, scale, source })`
(an SVG whose viewBox is in paper millimetres); it lands on the sheet's underlay layer.

## Things that need a decision or a service before going public
1. **Name.** The site is called "Civil Chartered Path". To rename it, change `SITE.name` in `js/content.js` and the title in `index.html`.
2. **Forum.** Pick a service (GitHub Discussions via Giscus, or Discourse) and replace the example threads.
3. **News refresh.** `.github/workflows/refresh-news.yml` runs `tools/refresh_news.py` every Monday on GitHub Actions
   (you can also run it from the Actions tab, or locally). The feed URLs in the
   script haven't been tested yet; it reports any that fail and skips sites whose robots.txt says no.
4. **Weekly briefing.** Add a new entry at the top of `NEWS` in `js/content.js` each week.

## Custom domain
The site uses civilcharteredpath.co.uk. The `CNAME` file in this repository tells GitHub Pages the domain;
check it also shows under Settings > Pages > Custom domain.

DNS records at the domain registrar:

| Type | Name / host | Value |
|---|---|---|
| A | @ (the bare domain) | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | v1rhl.github.io |

Optional IPv6 (AAAA, name @): 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153.
After DNS resolves, GitHub issues the HTTPS certificate (can take up to a day); then tick Enforce HTTPS.
