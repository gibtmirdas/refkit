# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`hockeyref` — a referee PWA with two sections: **Signaux**, a flash-card deck of the 35 official
signals of Appendix I of the IIHF Official Rule Book 2026/27, and **Fiches**, 37 pocket cheat sheets
(penalties, game rules, procedures, SEAF specifics) taken from the printed A7 deck. React 18 +
TypeScript + Vite, no test framework, no linter. The UI text and the code comments about content are
in French; the source comments are in English.

## Commands

```bash
npm install
npm run dev        # dev server at http://localhost:5173/hockeyref/ — note the base path
npm run typecheck  # tsc --noEmit
npm run build      # typecheck, then vite build into dist/
npm run preview    # serve dist/ — the ONLY way to exercise the service worker
```

The service worker is disabled in `dev` (`devOptions: { enabled: false }`). To test offline
behaviour, install prompts, or the update banner, you must `npm run build && npm run preview`.

To test on a phone on the local network: `npm run preview -- --host`.

## Architecture

Five source files, two data files, no router and no state library. `App.tsx` holds the current
section (`hs.section`, persisted) and switches between the deck and the sheets; a collapsible menu in
the sticky bar is the only navigation.

- `src/signals.ts` — the whole content model. `Signal` records (rule number, FR/EN name, gesture
  description, `memo`, page, `family`, image filenames) plus the `FAMILIES` filter list. It is
  generated from the rulebook; the header comment says not to hand-edit it without carrying the
  change back to the source. Each `imgs` entry names a file in `public/signals/`; a signal with two
  images is a two-step gesture and is rendered as a numbered pair.
- `src/sheets.ts` — the pocket sheets. Each `Sheet` carries its printed number `n` (identical to
  the A7 card), a `theme` key (`a`-`f`, one colour each), a plain-text `title`, an `html` fragment
  and a `search` string (lowercased, accent-free) used by the filter. Generated like `signals.ts`,
  from the source document in the HockeyReferee project — do not hand-edit without carrying the
  change back. The `html` is static generated content and is injected with
  `dangerouslySetInnerHTML`; nothing there comes from user input.
- `src/Sheet.tsx` — presentational: coloured header button, body, footer. Open state is owned by
  `App.tsx`.
- `src/App.tsx` — all state. Deck: card `order` (an index permutation into `SIGNALS`), the global
  `side`, `showDesc`, and a `flipped` set of individually-turned card ids. A card shows its back
  when `flipped.has(id) !== (side === 'back')` — the global side is a base, and a tap toggles
  against it. Shuffle and side changes clear `flipped`. Sheets use the same idiom: a sheet is open
  when `toggled.has(n) !== openBase`, where `openBase` is true if "Déplier" is on **or** a search is
  active — so a query opens every match and a tap still toggles one. Changing the query, the theme
  or the section clears `toggled`. Keyboard: `M` shuffle, `R` flip all, `D` toggle the description
  (deck only); `/` focuses the search and `Esc` clears it (sheets); shortcuts are ignored while
  typing in a field.
- `src/usePersisted.ts` — `useState` mirrored into `localStorage` under `hs.*` keys, with every
  access wrapped in try/catch (private windows block storage). Order and `flipped` are deliberately
  *not* persisted.
- `src/Card.tsx` — presentational only. Builds image URLs from `import.meta.env.BASE_URL`, so never
  hardcode `/hockeyref/` in a path. Eager-loads the first 8 images, lazy for the rest.
- `src/styles.css` — one stylesheet, CSS custom properties in `:root` with a
  `prefers-color-scheme: dark` override. One accent colour per signal family (`--red`, `--blue`,
  `--green`, `--slate`; the family key is also the card's CSS class) and one per sheet theme
  (`--th-a` … `--th-f`, exposed to a sheet as `--tc` through the `th-*` class). Sheet content is
  styled under `.sh-body`, which is the only place the generated HTML's class names
  (`t`, `sm`, `tx`, `sig`, `codes`, `src`, `warn`, `box`, `ref`, `mut`) are used.
- The `UpdateToast` component in `App.tsx` wires `useRegisterSW` from `virtual:pwa-register/react`
  to the "ready offline" / "new version" banner.

## Base path

`BASE = '/hockeyref/'` in `vite.config.ts` must match the GitHub repository name. It feeds `base`,
the manifest `id`/`start_url`/`scope`, and `import.meta.env.BASE_URL`. If the repo is renamed,
change this constant, or the manifest and the service worker scope point elsewhere and installation
fails.

## PWA caching

Everything local is precached (`globPatterns` covers js/css/html/svg/png/jpg/webmanifest,
`assetsInlineLimit: 0` keeps images as separate cacheable files) so the app works with no network in
a rink. Google Fonts are cross-origin and cannot be precached at build time; they use runtime
`StaleWhileRevalidate` / `CacheFirst` rules, and the CSS declares system font fallbacks for the
first offline run.

## Deployment

`.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`
(`configure-pages` with `enablement: true`, so no manual Pages setup is needed). Live at
<https://gibtmirdas.github.io/hockeyref/>.

## Content licence

The photos come from the IIHF Official Rule Book and stay IIHF property; they are here for personal
training use. A GitHub Pages site is public even when the repository is private — keep this in mind
before you suggest anything that widens distribution.
