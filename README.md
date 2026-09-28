# adaga460.github.io

My personal site: React + TypeScript + Vite, no UI framework.

Scrolling the page is a dive: a depth gauge tracks you from the surface (userspace) down to the hadal zone (bare metal).

- **Sonar hero**: a canvas PPI scope. Click it to ping.
- **Focus areas**: pick systems, computer vision, or marine robotics and related work lights up across the page.
- **Project demos**: a byte-level encoder for the `dist-kv-store` wire protocol, and an x86_64 page-walk visualizer for the microkernel.
- **Terminal**: a small shell at the bottom (`help`, `ls`, `cat kv`, ...).

## Develop

```bash
npm install
npm run dev
```

## Editing content

Everything lives in [`src/data.ts`](src/data.ts). To add a headshot, drop it at `public/headshot.jpg` and set `profile.headshot = '/headshot.jpg'`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. (One-time setup: in the repo's Settings → Pages, set Source to **GitHub Actions**.)
