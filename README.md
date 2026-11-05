# DOSE — landing page

Next.js 16 · Tailwind CSS 4 · React Three Fiber · GSAP ScrollTrigger · Framer Motion · Lenis

Built on top of the original `DOSE_Elegant_Enhanced.html` (its label wraps, product shots, copy,
palette and nutrition-panel painter were extracted into `public/` and `lib/`).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (branch `main`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the static export and publishes it.

The workflow reads the Pages base path automatically, so it works for project sites
(`username.github.io/repo-name/`), user sites (`username.github.io`) and custom domains.
Locally, set `BASE_PATH=/repo-name npm run build` to reproduce a project-site build.

## Where things live

| Path | What |
| --- | --- |
| `components/three/` | The 3D can (label wrap + procedural condensation normal map), cold vapour, fizz, flavour flecks, jelly drops, studio lighting |
| `components/ScrollDirector.tsx` | Scroll keyframes that move the single fixed can between sections (desktop and mobile poses) |
| `components/*.tsx` | Page sections, header, cart drawer, preloader, cursor |
| `lib/flavors.ts` | Flavour data, colours and (concept) pack pricing |
| `lib/canTexture.ts` | Label texture painter, droplet normal map, soft sprites |
