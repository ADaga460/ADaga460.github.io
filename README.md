# adaga460.github.io

My personal site: React + TypeScript + Vite, no UI framework.

It's laid out like a USGS topo sheet. The terrain at the top is generated in the browser: hover for elevation, click to drop a benchmark. The two big projects have inline demos (a byte-level encoder for the `dist-kv-store` protocol, and an x86_64 page-table walker). The Outside section maps national parks and draws peaks as a skyline by elevation.

## Develop

```bash
npm install
npm run dev
```

## Editing content

Everything lives in [`src/data.ts`](src/data.ts). Mark parks in `visitedParks` (names must match the `parks` list) and add mountains to `peaks`. To add a headshot, drop it at `public/headshot.jpg` and set `profile.headshot = '/headshot.jpg'`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. (One-time setup: in the repo's Settings → Pages, set Source to **GitHub Actions**.)
