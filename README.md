# winstontrinh.com

Source code for [winstontrinh.com](https://winstontrinh.com), my personal portfolio. Its signature feature is a portrait whose eyes and head follow your cursor.

For the full story of how it was designed and built, read the blog post: [Building a portfolio that looks back at you](https://winstontrinh.com/blog/building-a-portfolio-that-looks-back/).

## Stack

- React 18, TypeScript and Vite 5, with a multi-page build for the homepage and blog
- Apple's Liquid Glass material via [glisse](https://github.com/0kzh/glisse), on CSS Modules and shared design tokens, with light and dark themes
- Vitest and Testing Library for unit tests; Playwright for browser tests in Chrome and Safari, on a laptop and an iPhone
- GitHub Actions deploys to GitHub Pages

## How the face works

`public/gaze/` holds 121 pre-generated WebP frames on an 11×11 grid of gaze directions. `useGaze` maps the pointer position to the nearest cell, throttled to `requestAnimationFrame`, and `GazeFace` swaps to that frame. All frames are preloaded. When `prefers-reduced-motion` is set, the face stays centered.

The frames were generated with Replicate's `fofr/expression-editor` model. `src/gaze/manifest.json` describes the grid, so its size isn't hard-coded in the frontend.

## Liquid Glass

Buttons, tabs, the search field and the theme switch are glisse components. Links that need to look like buttons use `GlassLink`, which wraps glisse's `Glass`. The hero slider is a native range input styled like iOS, so the browser moves its thumb with no React render. `useGlass` writes `--glass-alpha` and `--lg-blur` to `<html>` once per frame, which makes every glass surface, including the project folders' flaps, change in the same frame as you drag from clear (left) to frosted (right). Glass never goes fully clear: the tint and blur keep a minimum so text stays readable. The value is saved to `localStorage` once dragging stops.

Experience and projects are folders (`Folder.tsx`, shared by both). Each one opens on hover or tap, its sheets rise out, and the glass flap shows whichever sheet you point at. Clicking a sheet further back shuffles it to the front; closing the folder restores the order. A company's roles are its sheets, newest in front. On wide screens the folders pair up in staggered rows. Skills float loose in a scattered cloud (`Skills.tsx`) that straightens and parts around the pointer; drag a skill (press and hold on touch) to rearrange them.

Search (`src/lib/searchIndex.ts`) indexes `DATA` and the blog posts in the browser. It needs no dependency and no network request. Press ⌘K or `/` to open it. Results are grouped by section and keep page order, so experience reads newest first.

## Project layout

```
src/
  data/resume.ts      All site content (single source of truth)
  components/         Homepage sections, folders, skills cloud, glass nav and search, gaze face
  hooks/              Gaze tracking, theme, glass translucency, scroll-spy, reveal
  lib/                Gaze math, site search index, section scrolling
  blog/               Blog index, posts and Mermaid diagrams
blog/                 HTML entry per blog page (one per post)
e2e/                  Playwright browser tests
public/               Static assets, gaze frames, résumé PDF
```

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # run the unit tests
npm run e2e        # build, then run the browser tests (first time: npx playwright install webkit)
npm run build      # type-check and build to dist/
```

## Deployment

Every push to `main` runs the tests and the build, then deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). If any test fails, the deploy doesn't run.

## Adding a blog post

1. Add the content component in `src/blog/posts/`, its metadata in `src/blog/posts.ts`, and map the slug to the component in `src/blog/BlogPages.tsx`.
2. Add `blog/<slug>/index.html` and register it in `vite.config.ts`.
