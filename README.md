# 🎬 Movie Explorer

Search movies, browse what's trending right now, and explore by genre, all in a fast, responsive
single-page app built with **vanilla JavaScript** and the [TMDB API](https://developer.themoviedb.org/docs).

[![Live demo](https://img.shields.io/badge/live%20demo-open-facc15?style=for-the-badge&labelColor=000000)](https://zwelinnaingzack.github.io/Movie-Explorer-/)
![JavaScript ES modules](https://img.shields.io/badge/JavaScript-ES%20modules-facc15?style=flat-square&labelColor=000000)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-facc15?style=flat-square&labelColor=000000)
![No build step](https://img.shields.io/badge/build%20step-none-facc15?style=flat-square&labelColor=000000)

<!--
Add a demo GIF here once recorded (type a search, click a card, switch to Genres), then uncomment:
![Movie Explorer demo](docs/demo.gif)
-->

## What this project demonstrates

| Skill | Where to look |
|---|---|
| Async JavaScript and API integration | `src/api.js`: one `request()` helper with auth headers and a manual `res.ok` check |
| Race-condition handling | `src/main.js`: an `AbortController` per feature cancels stale requests |
| Debouncing | `src/utils.js`: search waits for a 400 ms pause instead of firing on every keystroke |
| Loading, empty and error states | `src/ui.js`: skeleton loaders, empty messages, and a Retry button |
| Safe DOM rendering | No `innerHTML`: every API string goes through `textContent` |
| Responsive, accessible UI | Works from 360 px up, native `<dialog>`, `aria-live`, visible focus, reduced-motion support |

## Features

**Search**
- Debounced search (400 ms): typing "inception" sends one request, not nine
- Typing "inc" then "inception" can never show the stale "inc" results, because the earlier request is cancelled
- Clear button, and whitespace-only input is treated as empty

**Browse**
- **Trending now:** movies and series trending today, with All / Movies / Series tabs, refreshed automatically every 5 minutes
- **Genres:** every TMDB movie genre, fetched live; picking one shows its most popular movies

**Details**
- Click any card to open a dialog with a backdrop banner, rating, vote count, summary, tagline, genres, and runtime or season count

**Polish**
- Black and yellow design with light and dark themes that follow your OS setting
- Card hover animation (lift, poster zoom, "View details" overlay), disabled for users who prefer reduced motion
- Skeleton loaders while fetching, and clear empty and error states with Retry

## TMDB endpoints used

| Endpoint | Used for |
|---|---|
| `GET /search/movie` | Title search |
| `GET /trending/{all\|movie\|tv}/day` | Trending tab |
| `GET /genre/movie/list` | Genre pills |
| `GET /discover/movie` | Movies for a selected genre |
| `GET /movie/{id}` and `GET /tv/{id}` | Details dialog |

## Getting started

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

## Deploying to GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the site on every push to `master`. Because
`config.js` is git-ignored, it generates that file from a repository secret at deploy time, so the
token is never committed.

1. Repo **Settings → Secrets and variables → Actions → New repository secret**: name `TMDB_TOKEN`, value your Read Access Token.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Push to `master` (or run the workflow from the **Actions** tab). The site goes live at the demo link above.

## Project structure

```
index.html         page layout and Tailwind classes
src/main.js        event wiring and the search, trending and genre flows
src/api.js         request helper and the TMDB calls
src/ui.js          skeletons, cards, details dialog, empty and error states
src/utils.js       debounce helper
src/style.css      keyframe animations Tailwind utilities don't cover
config.example.js  token template (copy to config.js)
.github/workflows  GitHub Pages deployment
```

## Design decisions

- **Tech choices:** plain ES modules and the Tailwind Play CDN keep the project free of a build step and dependencies, so the code is easy to read and run.
- **Cancel, don't ignore:** every new search aborts the previous request, so a slow response for "inc" can never overwrite the results for "inception". `AbortError` is swallowed; any other failure shows the error state.
- **Manual `res.ok` check:** `fetch` only rejects on network failure, so 401, 404 and 500 responses are turned into errors explicitly. An invalid token shows the error state instead of a blank page.
- **Debounce reads the input when it fires:** a pending search can't bring back text the user just cleared.
- **No `innerHTML`:** all API data is inserted with `createElement` and `textContent` (and the `img` `src` and `alt` properties), so a hostile movie title is rendered as plain text.
- **Details dialog:** it uses the native `<dialog>` for Esc-to-close, focus handling and a backdrop. The summary comes from the search response and appears instantly; genres and runtime come from a second request that degrades to a short message if it fails, and is aborted if the dialog closes first.
- **Trending is near-live, not streaming:** TMDB rebuilds its trending lists once a day and has no push API, so the app polls every 5 minutes. A background refresh keeps the cards on screen, ignores failures, and skips re-rendering when the list hasn't changed, so nothing flickers.
- **Series reuse the movie UI:** series use `name` and `first_air_date`, so `api.js` maps them onto the movie field names once and the cards need no special cases beyond a "Series" label.
- **Missing data:** no poster shows a placeholder with the title; no release date shows "Unknown".

## Security note

This is a client-only app, so the TMDB token is sent to every visitor's browser and can be read
there, including on the deployed site. The deployment workflow keeps it out of the repository and
git history, but not out of the browser. That is acceptable for a read-only TMDB token in a portfolio
project; a production app would keep the token on a server (for example a serverless function or a
Next.js route handler) and call TMDB from there.

## Possible next steps

- Save the last 5 searches in `localStorage` and show them as chips
- Keyboard navigation between result cards
- "Load more" paging for genre results
- Move the token behind a serverless proxy so it never reaches the browser

## Credits

Movie data and images from [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is
not endorsed or certified by TMDB.
