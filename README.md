# Civil Chartered Path

A static website for civil engineers working towards ICE chartership (CEng MICE).

Live site: https://v1rhl.github.io/civilcharteredpath/

Open `index.html` in a browser; no build step. To publish, upload the whole folder to any
static host (GitHub Pages, Netlify, Cloudflare Pages).

## Pages
| Page | What it does | Where its content lives |
|---|---|---|
| Home, Route, Attributes, Review day, Reference | Guide to the CEng route | `js/content.js` |
| Planner | Works back from a submission date to a dated plan | `PLAN` in `js/content.js` |
| Flashcards | Practice questions plus fact cards, with progress saved in the visitor's browser | `QUESTIONS`, `FACT_CARDS` in `js/content.js` |
| Questions | The practice questions as a list | `QUESTIONS` |
| News | Latest headlines (links out) and a weekly briefing | `js/news-feed.js`, `NEWS` in `js/content.js` |
| Report check | Marked as coming soon; shows an example only | not live yet |
| Community | Forum and mock-review partners, design only, posting off | `FORUM_CATEGORIES`, `EXAMPLE_THREADS` |

## Things that need a decision or a service before going public
1. **Name.** The site is called "Civil Chartered Path". To rename it, change `SITE.name` in `js/content.js` and the title in `index.html`.
2. **Report check.** Not live yet. Switching it on needs a small server holding an AI API key (kept out of this
   repository), then its address in `CRITIQUE_ENDPOINT` in `js/config.js`. Until then the page shows an example and sends nothing.
3. **Forum.** Pick a service (GitHub Discussions via Giscus, or Discourse) and replace the example threads.
4. **News refresh.** `.github/workflows/refresh-news.yml` runs `tools/refresh_news.py` every Monday on GitHub Actions
   (you can also run it from the Actions tab, or locally). The feed URLs in the
   script haven't been tested yet; it reports any that fail and skips sites whose robots.txt says no.
5. **Weekly briefing.** Add a new entry at the top of `NEWS` in `js/content.js` each week.
6. **Privacy page**, if the report check goes live.

## Custom domain
Buy a domain, add it under Settings > Pages > Custom domain in this repository, and point a CNAME record at `<username>.github.io`. GitHub provides the HTTPS certificate.
