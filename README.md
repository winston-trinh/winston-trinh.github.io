# winstontrinh.com

Source code for [winstontrinh.com](https://winstontrinh.com), my personal portfolio. Its signature feature is a portrait whose eyes and head follow your cursor.

For the full story of how it was designed and built, read the blog post: [Building a portfolio that looks back at you](https://winstontrinh.com/blog/building-a-portfolio-that-looks-back/).

## Stack

- React 18, TypeScript and Vite 5, with a multi-page build for the homepage and blog
- Plain CSS Modules on shared design tokens, with light and dark themes
- Vitest and Testing Library for tests
- GitHub Actions deploys to GitHub Pages

## How the face works

`public/gaze/` holds 121 pre-generated WebP frames on an 11×11 grid of gaze directions. `useGaze` maps the pointer position to the nearest cell, throttled to `requestAnimationFrame`, and `GazeFace` swaps to that frame. All frames are preloaded. When `prefers-reduced-motion` is set, the face stays centered.

The frames come from `scripts/generate_gaze_ai.py`, which uses Replicate's `fofr/expression-editor` model. The script is resumable and its output is deterministic. It writes `src/gaze/manifest.json`, so the grid size isn't hard-coded in the frontend.

## Project layout

```
src/
  data/resume.ts      All site content (single source of truth)
  components/         Homepage sections, nav, gaze face
  hooks/              Gaze tracking, theme, scroll-spy, reveal
  blog/               Blog index, posts and Mermaid diagrams
blog/                 HTML entry per blog page (one per post)
scripts/              Gaze frame generators (AI and local fallback)
public/               Static assets, gaze frames, résumé PDF
```

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # run the test suite
npm run build      # type-check and build to dist/
```

To regenerate the gaze frames, you need a Replicate API token:

```sh
export REPLICATE_API_TOKEN=...
npm run gaze -- --steps 5 --force
```

## Deployment

Every push to `main` runs the tests and the build, then deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). If any test fails, the deploy doesn't run.

## Adding a blog post

1. Add the content component in `src/blog/posts/`, its metadata in `src/blog/posts.ts`, and map the slug to the component in `src/blog/BlogPages.tsx`.
2. Add `blog/<slug>/index.html` and register it in `vite.config.ts`.
