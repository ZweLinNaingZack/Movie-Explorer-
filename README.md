# Movie Explorer

A single-page movie search app. Type a title, pause, and the app queries the
[TMDB API](https://developer.themoviedb.org/docs) and shows the results as a responsive grid of
cards with posters, release year, and rating.

**Live demo:** _add link here_

![Movie Explorer demo](docs/demo.gif)
<!-- Record a short GIF (type a query, show skeletons, results, an error + Retry) and save it as docs/demo.gif -->

## Features

- Debounced search (400 ms): typing "inception" sends one request, not nine
- Skeleton loaders while fetching
- Clear empty and error states, with a Retry button that repeats the last query
- Responsive grid: 2 columns on mobile, 3 on `md`, 4 on `lg`; works from 360 px up
- Dark mode that follows the OS preference
- Accessible: labelled input, `aria-live` status region, visible focus styles, keyboard-usable Retry

## Tech stack

HTML5, Tailwind CSS (Play CDN), vanilla JavaScript (ES modules), TMDB API v3. No framework, no build step, no backend.

## Setup

1. Create a free TMDB account and copy your **API Read Access Token** from your account's API settings.
2. Copy the config template and paste in your token:

   ```bash
   cp config.example.js config.js
   ```

   `config.js` is listed in `.gitignore`, so it is never committed.
3. Serve the folder with any static server. ES modules don't load from `file://`, so opening
   `index.html` directly won't work. For example:

   ```bash
   npx serve
   ```

4. Open the printed local URL.

## Project structure

```
index.html        page layout and Tailwind classes
src/main.js       event wiring and the search flow
src/api.js        fetchMovies(query, signal)
src/ui.js         skeletons, cards, empty and error states
src/utils.js      debounce helper
config.example.js token template (copy to config.js)
```

## Design decisions

- **Race conditions:** every new search aborts the previous request with an `AbortController`,
  so a slow response for "inc" can never overwrite the results for "inception". `AbortError` is
  ignored; any other failure shows the error state.
- **Manual `res.ok` check:** `fetch` only rejects on network failure, so 401/404/500 responses are
  turned into errors explicitly. An invalid token shows the error state instead of a blank page.
- **Debounce reads the input when it fires:** a pending search can't bring back text the user just cleared.
- **No `innerHTML`:** all API data is inserted with `createElement` and `textContent` (and the `img`
  `src`/`alt` properties), so a hostile movie title is rendered as plain text.
- **Missing data:** no poster shows a placeholder with the title; no release date shows "Unknown".
- **Small modules:** each file has one job, which keeps the diff and the review surface small.

## Security note

This is a client-only app, so the TMDB token is sent to every visitor's browser and can be read
there. That is acceptable for a read-only TMDB token in a portfolio project, but a production app
should keep the token on a server (for example in a Next.js route handler) and call TMDB from there.

## Possible next steps

- Save the last 5 searches in `localStorage` and show them as chips
- Movie detail modal using `GET /movie/{id}`
- "Trending this week" section on load
- Keyboard navigation between result cards
- Move the token behind a server-side route handler

## Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.
