# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page marketing + shop site for EnLaJuega (board-game store, ludoteca and play-based services in Colombia). React 19 + Vite 6 + TypeScript (strict) + Tailwind CSS v4, with `motion` for animation, `vaul` for drawers and `sonner` for toasts. There is no backend: content is static data in `src/data/`, except the game catalog, which is fetched at runtime from a published Google Sheets CSV, and every purchase or booking ends by opening WhatsApp with a pre-filled message. UI copy, comments and identifiers in the data are in Spanish; keep new user-facing text in Spanish.

## Commands

```bash
npm install
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # tsc -b (type check) then vite build → dist/
npm run preview  # serve dist/
```

There is no test suite or linter; `npm run build` (via `tsc -b`, with `noUnusedLocals`) is the only correctness check. `vite.config.ts` sets `base: "./"` so `dist/` can be deployed to any static host or subfolder. Asset paths in data are therefore relative (`assets/games/...`, no leading slash).

## Architecture

- **`src/main.tsx`** composes the whole page: section components in order (Hero, Marquee, Shop, Experiences, Services, About, Contact, Footer) plus three globally mounted drawers (`CartSheet`, `ProductSheet`, `BookingSheet`) and the `Toaster`. There is no router; navigation is anchor scrolling.
- **Catalog loading:** `src/lib/sheet.ts` fetches and parses the CSV at `SITE.catalogSheetUrl` (column format documented there and in the README). The store starts from the last cached download (localStorage `elj-catalog`), or from the bundled `CATALOG` in `catalog.ts` as a fallback, then swaps in the fresh sheet data. The optional `destacado` column sets `Game.featured`, which picks the up-to-5 games in the Hero fan (`components/Hero.tsx`, falls back to the first in-stock games with images). The optional `actualizado` column (first non-empty value, written by the Apps Script `onEdit` in the README) becomes `updated` in the store and is shown in the Footer; without it, `CATALOG_UPDATED` from `catalog.ts` is used. Components must read `catalog`/`games` from `useStore()` and never import `CATALOG` directly. `catalogo.csv` is the seed export used to create the sheet.
- **`src/store.tsx`** is the single React context (`useStore`). It holds the catalog and the cart (`items: Record<gameId, qty>`, persisted to localStorage key `elj-cart`, quantities clamped to `stock` and re-sanitized whenever the catalog changes) and which drawer is open: `cartOpen`, `product` (via `openProduct(id)`), and `bookingId` (via `openBooking(serviceId)`). Any component opens a drawer by calling these setters rather than owning drawer state.
- **`src/data/catalog.ts`** — the `Game` type and the fallback `CATALOG: Game[]` (price in COP, `stock` = copies, `ludoteca` = playable at the Casita, `images` = `[NNb.webp box, NNc.webp components]`). `stock: 0` renders as "Agotado" with an "Encargar" (order via WhatsApp) action. Empty `images` makes `GameCover` (`components/ui.tsx`) generate a colored cover with the name.
- **`src/data/site.ts`** — `SITE` contact info and pickup points, plus `SERVICES` groups. Service `id`s are what `openBooking()` receives, and `price: null` means "a convenir".
- **WhatsApp flow:** `waLink(text)` in `src/lib/utils.ts` builds `wa.me` URLs from `SITE.whatsapp`. Checkout (`CartSheet`) and booking (`BookingSheet` in `Services.tsx`) build a message, `window.open` it, and show a toast. Form data is remembered with the `storage` helper (localStorage wrapped in try/catch).
- **`components/Sheet.tsx`** is the shared drawer wrapper. It renders as a right-side panel at ≥768px and a draggable bottom sheet below that (`useMediaQuery`). New modal UIs should use it.
- **`components/ui.tsx`** holds shared primitives (`Button`/`buttonClass`, `GameCover`, `Stepper`, `Segmented`, `Kicker`, `Reveal`). Use `cx()` from utils for conditional classes.

## Styling

Design tokens live in the `@theme` block of `src/index.css`: colors (`canvas`, `surface`, `sunken`, `ink`–`ink-4`, `line`, `accent`, `lime`), fonts (Geist, Geist Mono, Instrument Serif, loaded from Google Fonts in `index.html`), easings, shadows (`shadow-card`, `shadow-float`) and the marquee animation. Use these Tailwind token classes (`bg-canvas`, `text-ink-3`, `shadow-float`…) instead of raw colors. `MotionConfig reducedMotion="user"` wraps the app.

## Content edits

Most requested changes are data edits: game prices/stock live in the Google Sheet (keep `catalog.ts` as a reasonably current fallback), services/contact in `site.ts`, and images in `public/assets/games/` (named by the game's index, e.g. `07b.webp`/`07c.webp`) and `public/assets/photos/`.
