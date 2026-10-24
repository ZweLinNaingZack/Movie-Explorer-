const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w780";
const SKELETON_COUNT = 8;
const IDLE_MESSAGE = "Start typing to search for movies.";
const ERROR_MESSAGE = "Something went wrong. Check your connection and API token, then try again.";

const TAB_BASE = "rounded-full px-4 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500";
const TAB_ACTIVE = "bg-yellow-400 text-black shadow";
const TAB_INACTIVE = "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white";
const GENRE_PILL_BASE = "rounded-full px-4 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500";
const GENRE_PILL_INACTIVE =
  "bg-white/70 text-zinc-700 ring-1 ring-zinc-900/10 hover:bg-yellow-400/20 dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-yellow-400/15";

const status = document.getElementById("status");
const results = document.getElementById("results");
const landing = document.getElementById("landing");
const landingTabs = document.getElementById("landing-tabs");
const trendingPanel = document.getElementById("trending-panel");
const genresPanel = document.getElementById("genres-panel");
const genreList = document.getElementById("genre-list");
const genreHeading = document.getElementById("genre-heading");
const genreStatus = document.getElementById("genre-status");
const genreResults = document.getElementById("genre-results");
const trendingTabs = document.getElementById("trending-tabs");
const trendingStatus = document.getElementById("trending-status");
const trendingResults = document.getElementById("trending-results");
const trendingUpdated = document.getElementById("trending-updated");
const dialog = document.getElementById("movie-dialog");
const dialogBody = document.getElementById("movie-dialog-body");

// Filled in by showMovieDetails once GET /movie/{id} resolves
let detailsSlot;

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const releaseYear = (movie) => movie.release_date?.slice(0, 4) || "Unknown";
const formatRating = (movie) => (movie.vote_average ?? 0).toFixed(1);
const formatRuntime = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

function createSkeletonCard() {
  const card = createElement("li", "animate-pulse overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-900/70 dark:ring-white/10");
  card.setAttribute("aria-hidden", "true");

  const text = createElement("div", "space-y-2 p-3");
  for (const width of ["w-3/4", "w-1/3"]) {
    text.append(createElement("div", `h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 ${width}`));
  }

  card.append(createElement("div", "aspect-[2/3] bg-zinc-200 dark:bg-zinc-800"), text);
  return card;
}

const createSkeletons = () => Array.from({ length: SKELETON_COUNT }, createSkeletonCard);

function createRetryButton(onRetry) {
  const retryButton = createElement(
    "button",
    "mt-4 rounded-full bg-yellow-400 px-6 py-2.5 font-bold text-black " +
      "shadow-lg shadow-yellow-500/25 transition hover:scale-105 focus:outline-none " +
      "focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 " +
      "motion-reduce:transition-none motion-reduce:hover:scale-100",
    "Retry",
  );
  retryButton.type = "button";
  retryButton.addEventListener("click", onRetry);
  return retryButton;
}

function createPoster(movie) {
  if (!movie.poster_path) {
    return createElement(
      "div",
      "flex aspect-[2/3] items-center justify-center bg-gradient-to-br from-yellow-400/25 to-zinc-500/20 p-4 " +
        "text-center text-sm font-medium text-zinc-600 dark:text-zinc-300",
      movie.title,
    );
  }

  const poster = createElement(
    "img",
    "aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-110 motion-reduce:transition-none",
  );
  poster.src = `${POSTER_BASE_URL}${movie.poster_path}`;
  poster.alt = `Poster for ${movie.title}`;
  poster.loading = "lazy";
  return poster;
}

function createMovieCard(movie, index, onSelect) {
  const ratingBadge = createElement(
    "span",
    "absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-yellow-400 backdrop-blur",
    `★ ${formatRating(movie)}/10`,
  );

  const hoverOverlay = createElement(
    "div",
    "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-12 text-sm font-semibold " +
      "text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none",
    "View details →",
  );

  const posterFrame = createElement("div", "relative overflow-hidden");
  posterFrame.append(createPoster(movie), ratingBadge, hoverOverlay);
  if (movie.media_type === "tv") {
    posterFrame.append(
      createElement("span", "absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black", "SERIES"),
    );
  }

  const body = createElement("div", "p-3");
  body.append(
    createElement("h2", "truncate font-semibold", movie.title),
    createElement("p", "mt-0.5 text-sm text-zinc-500 dark:text-zinc-400", releaseYear(movie)),
  );

  const button = createElement(
    "button",
    "group block w-full overflow-hidden rounded-2xl bg-white text-left shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-900/5 " +
      "transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-yellow-500/20 " +
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 " +
      "motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-zinc-900/70 dark:ring-white/10",
  );
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.addEventListener("click", () => onSelect(movie));
  button.append(posterFrame, body);

  const card = createElement("li", "card-enter");
  card.style.setProperty("--i", index);
  card.append(button);
  return card;
}

export function showIdle() {
  status.textContent = IDLE_MESSAGE;
  results.replaceChildren();
}

export function showLoading() {
  status.textContent = "Searching…";
  results.replaceChildren(...createSkeletons());
}

export function showEmpty(query) {
  status.textContent = `No movies found for '${query}'`;
  results.replaceChildren();
}

export function showError(onRetry) {
  status.replaceChildren(createElement("p", "", ERROR_MESSAGE), createRetryButton(onRetry));
  results.replaceChildren();
}

export function showResults(movies, query, onSelect) {
  status.textContent = `Found ${movies.length} movies for '${query}'`;
  results.replaceChildren(...movies.map((movie, index) => createMovieCard(movie, index, onSelect)));
}

export function setLandingVisible(visible) {
  landing.classList.toggle("hidden", !visible);
}

function setActiveTab(container, tab) {
  for (const button of container.querySelectorAll("button")) {
    const isActive = button.dataset.tab === tab;
    button.setAttribute("aria-pressed", String(isActive));
    button.className = `${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_INACTIVE}`;
  }
}

function onTabClick(container, handler) {
  container.addEventListener("click", (event) => {
    const tab = event.target.closest("button")?.dataset.tab;
    if (tab) handler(tab);
  });
}

export const setTrendingTab = (tab) => setActiveTab(trendingTabs, tab);
export const onTrendingTabClick = (handler) => onTabClick(trendingTabs, handler);
export const onLandingTabClick = (handler) => onTabClick(landingTabs, handler);

export function setLandingTab(tab) {
  setActiveTab(landingTabs, tab);
  trendingPanel.classList.toggle("hidden", tab !== "trending");
  genresPanel.classList.toggle("hidden", tab !== "genres");
}

export function showGenreList(genres, onSelect) {
  genreList.replaceChildren(
    ...genres.map((genre) => {
      const pill = createElement("button", "");
      pill.type = "button";
      pill.dataset.genre = genre.id;
      pill.textContent = genre.name;
      pill.addEventListener("click", () => onSelect(genre));
      return pill;
    }),
  );
}

export function setActiveGenre(genreId) {
  for (const pill of genreList.querySelectorAll("button")) {
    const isActive = pill.dataset.genre === String(genreId);
    pill.setAttribute("aria-pressed", String(isActive));
    pill.className = `${GENRE_PILL_BASE} ${isActive ? TAB_ACTIVE : GENRE_PILL_INACTIVE}`;
  }
}

export function showGenreLoading(genreName) {
  genreHeading.textContent = genreName ? `Popular ${genreName} movies` : "";
  genreStatus.replaceChildren();
  genreResults.replaceChildren(...createSkeletons());
}

export function showGenreMovies(movies, onSelect) {
  genreStatus.textContent = movies.length === 0 ? "No movies found for this genre." : "";
  genreResults.replaceChildren(...movies.map((movie, index) => createMovieCard(movie, index, onSelect)));
}

export function showGenreError(onRetry) {
  genreStatus.replaceChildren(createElement("p", "", ERROR_MESSAGE), createRetryButton(onRetry));
  genreResults.replaceChildren();
}

export function showTrendingLoading() {
  trendingStatus.replaceChildren();
  trendingResults.replaceChildren(...createSkeletons());
  delete trendingResults.dataset.ids;
}

export function showTrending(items, onSelect) {
  trendingStatus.textContent = items.length === 0 ? "Nothing is trending right now." : "";
  trendingUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  // A background refresh that returns the same list shouldn't replay the card animation
  const ids = items.map((item) => `${item.media_type}${item.id}`).join();
  if (ids === trendingResults.dataset.ids) return;

  trendingResults.dataset.ids = ids;
  trendingResults.replaceChildren(...items.map((item, index) => createMovieCard(item, index, onSelect)));
}

export function showTrendingError(onRetry) {
  trendingStatus.replaceChildren(createElement("p", "", ERROR_MESSAGE), createRetryButton(onRetry));
  trendingResults.replaceChildren();
  delete trendingResults.dataset.ids;
}

function createDialogBanner(movie) {
  const banner = createElement("div", "relative h-40 overflow-hidden sm:h-56");
  if (movie.backdrop_path) {
    const backdrop = createElement("img", "h-full w-full object-cover");
    backdrop.src = `${BACKDROP_BASE_URL}${movie.backdrop_path}`;
    backdrop.alt = "";
    banner.append(backdrop);
  } else {
    banner.classList.add("bg-gradient-to-br", "from-yellow-400", "via-amber-500", "to-zinc-800");
  }
  // Fades the banner into the dialog background so the title stays readable
  banner.append(createElement("div", "absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900"));
  return banner;
}

function createChip(text, className) {
  return createElement("span", `rounded-full px-3 py-1 text-sm font-medium ${className}`, text);
}

function createDialogContent(movie) {
  const poster = createPoster(movie);
  poster.classList.add("rounded-xl", "shadow-2xl", "ring-1", "ring-white/20");
  const posterColumn = createElement("div", "-mt-20 mx-auto w-36 shrink-0 sm:-mt-24 sm:mx-0 sm:w-44");
  posterColumn.append(poster);

  const title = createElement("h2", "text-2xl font-extrabold leading-tight sm:text-3xl", movie.title);
  title.id = "movie-dialog-title";

  const chips = createElement("div", "mt-3 flex flex-wrap items-center gap-2");
  chips.append(
    createChip(`★ ${formatRating(movie)} / 10`, "bg-yellow-400 font-bold text-black"),
    createChip(`${(movie.vote_count ?? 0).toLocaleString()} votes`, "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300"),
    createChip(releaseYear(movie), "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300"),
  );
  if (movie.media_type === "tv") {
    chips.append(createChip("Series", "bg-yellow-400/15 font-semibold text-yellow-700 dark:text-yellow-300"));
  }

  detailsSlot = createElement("div", "mt-4 text-sm text-zinc-500 dark:text-zinc-400", "Loading details…");

  const info = createElement("div", "min-w-0 flex-1 sm:pt-4");
  info.append(
    title,
    chips,
    createElement("h3", "mt-5 text-xs font-semibold uppercase tracking-widest text-zinc-500", "Summary"),
    createElement("p", "mt-1 leading-relaxed text-zinc-700 dark:text-zinc-300", movie.overview || "No summary available."),
    detailsSlot,
  );

  const row = createElement("div", "flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:px-6");
  row.append(posterColumn, info);
  return [createDialogBanner(movie), row];
}

export function openMovieDialog(movie) {
  dialogBody.replaceChildren(...createDialogContent(movie));
  dialog.showModal();
}

export function showMovieDetails(details) {
  const parts = [];
  if (details.tagline) {
    parts.push(createElement("p", "mb-3 italic text-zinc-600 dark:text-zinc-300", `“${details.tagline}”`));
  }

  const pills = createElement("div", "flex flex-wrap gap-2");
  for (const genre of details.genres ?? []) {
    pills.append(createChip(genre.name, "bg-yellow-400/15 text-xs text-yellow-700 dark:text-yellow-300"));
  }
  if (details.number_of_seasons) {
    const seasons = `${details.number_of_seasons} ${details.number_of_seasons === 1 ? "season" : "seasons"}`;
    pills.append(createChip(seasons, "bg-zinc-500/10 text-xs text-zinc-600 dark:text-zinc-300"));
  }
  if (details.runtime) {
    pills.append(createChip(formatRuntime(details.runtime), "bg-zinc-500/10 text-xs text-zinc-600 dark:text-zinc-300"));
  }
  parts.push(pills);

  detailsSlot.replaceChildren(...parts);
}

export function showDetailsUnavailable() {
  detailsSlot.textContent = "Extra details couldn't be loaded.";
}

// A click on the backdrop lands on the <dialog> itself, since its content fills the box
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
