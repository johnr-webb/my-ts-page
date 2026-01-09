# Housing Hunt — Housing Analysis Website

A small single-page TypeScript app to explore and compare apartment locations on a map. It includes a map view, an Add Location form, and a table to list saved locations.

Key features

- Compare apartments and nearby locations visually on a map.
- Add new locations (address geocoding) and persist them locally.
- Lightweight component structure (map, form, table) written in TypeScript.

Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server (Vite):

```bash
npm run dev
```

3. Open http://localhost:5173 (or the port Vite reports)

Project structure (high-level)

- `index.html` — app entry
- `src/main.ts` — bootstraps the app and router
- `src/pages/` — page-level views (e.g. `compare.ts`)
- `src/components/` — small UI components (`mapView.ts`, `addLocationCard.ts`, `locationsTable.ts`, `navBar.ts`)
- `src/map.ts` & `src/mapLoader.ts` — map and geocoding helpers

Persistence

- The app currently uses `localStorage` to persist user-added locations. You can seed or replace that with a `locations.json` file or a remote API if you need sharable or server-backed data.

Contributing

For contribution guidelines, see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
