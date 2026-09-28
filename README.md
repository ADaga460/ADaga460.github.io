# adaga460.github.io

My personal site: React + TypeScript + Vite, no UI framework.

Interactive pieces:

- **Project demos**: a byte-level encoder for the `dist-kv-store` wire protocol, and an x86_64 page-walk visualizer for the microkernel.
- **Filters**: click a tech tag on a project to filter by it; click a skill to see where it's been used.
- **Terminal**: a small shell in the contact section (`help`, `ls`, `cat kv`, ...).

## Develop

```bash
npm install
npm run dev
```

## Editing content

Everything lives in [`src/data.ts`](src/data.ts). To add a headshot, drop it at `public/headshot.jpg` and set `profile.headshot = '/headshot.jpg'`.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. (One-time setup: in the repo's Settings → Pages, set Source to **GitHub Actions**.)
