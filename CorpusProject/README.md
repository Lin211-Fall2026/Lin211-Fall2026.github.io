# Country Lines

A Vite-powered, browser-only explorer for the country music lyrics corpus in `country-corpus.csv`. The app uses Papa Parse so quoted, multi-line lyrics are read correctly; corpus text is not sent to a server.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. Vite writes the static site to `dist/`; `npm run preview` serves that build locally.

## Explore

- **Explore:** compare songs by year and see frequent content words. Select a year bar to narrow the collection; select a word to open its concordance.
- **Find a word:** search for a word or phrase and inspect up to five surrounding words on either side. Whole-word matching is on by default.
- **Browse songs:** search song titles, artists, and lyrics, then expand a song to read its lyrics.
- **Year filters:** apply the same year range throughout the explorer.

The CSV is expected to contain years from 1944–2024; rows outside that range produce a clear load error rather than being silently omitted. Word-frequency counts are case-insensitive and omit common English function words. This collection is a selected set of charting songs, not a complete or representative sample of every country song released in those years.

## GitHub Pages

The Vite base path is `/CorpusProject/`, matching this app's location on the course site's GitHub Pages URL. The repository's Quarto publish workflow builds the app and copies `dist/` into the rendered `CorpusProject/` page before publishing.

## Rebuild the app

After changing the app or its CSV, run these commands from this directory:

```sh
npm ci
npm run build
```

The production files are written to `dist/`. To check the production build locally, run `npm run preview`. To publish the update, push the changes to the repository's `main` branch; the GitHub Actions workflow rebuilds the app and publishes the course site.
