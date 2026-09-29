# Learn2Play Bench — project website

Static research homepage, published with GitHub Pages.

## Preview

Run `python3 -m http.server 8791` in this directory, then open http://localhost:8791.
No package installation or build step is needed.

## Update

- `index.html`: research overview, external links, and evaluation description.
- `app.js`: result snapshot and game descriptions.
- `styles.css`: responsive visual design.

The leaderboard uses the manuscript's main backbone/method and harness comparison tables (September 29, 2026). Default ranking is Learning Slope (LS), descending; users can choose Max, Mean, or Learning Gain (LG). Ties share competition ranks (1, 1, 3) at displayed precision. These are point estimates, not statistical-significance ranks or automatically updated results. Methods and harnesses are ranked only within the selected backbone. Preserve comparison groups when updating. The matched-transfer discussion is qualitative and does not claim every model declines.

The game portal is hosted separately and requires sign-in. This repository contains no game server, credentials, private logs, or unfinished manuscript PDF. A benchmark-code button is intentionally omitted: the manuscript's anonymous archive returned HTTP 401 (`not_connected`) during deployment verification. Add a code link once a publicly accessible release is confirmed; do not expose a private repository.

Publishing source: `main`, root directory. Commit and push changes to update the website.
