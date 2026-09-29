# Learn2Play Bench — project website

Static research homepage, published with GitHub Pages.

## Preview

Run `python3 -m http.server 8791` in this directory, then open http://localhost:8791.
No package installation or build step is needed.

## Update

- `index.html`: research overview, external links, and evaluation description.
- `app.js`: result snapshot and game descriptions.
- `styles.css`: responsive visual design.
- `assets/performance-cost.png`: unchanged manuscript performance–cost figure (copied September 29, 2026). Performance is normalized Max; cost is estimated mean USD per episode, using the manuscript's August 30, 2026 pricing snapshot and cache assumptions. It is not a billing record or a current price quote. Retain the axis scale, legend, and caveats when updating.

The leaderboard uses the manuscript's main backbone/method and harness comparison tables (September 29, 2026). Default ranking is Max, descending; users can choose Mean, Learning Gain (LG), or Learning Slope (LS). Ties share competition ranks (1, 1, 3) at displayed precision. These are point estimates, not statistical-significance ranks or automatically updated results. Methods and harnesses are ranked only within the selected backbone. Preserve comparison groups when updating. The matched-transfer discussion is qualitative and does not claim every model declines.

The game portal is hosted separately and requires sign-in. This repository contains no game server, credentials, private logs, or unfinished manuscript PDF. A benchmark-code button is intentionally omitted: the manuscript's anonymous archive returned HTTP 401 (`not_connected`) during deployment verification. Add a code link once a publicly accessible release is confirmed; do not expose a private repository.

Publishing source: `main`, root directory. Commit and push changes to update the website.
