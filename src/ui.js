const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const SKELETON_COUNT = 8;
const IDLE_MESSAGE = "Start typing to search for movies.";
const ERROR_MESSAGE = "Something went wrong. Check your connection and API token, then try again.";

const status = document.getElementById("status");
const results = document.getElementById("results");

function createSkeletonCard() {
  const card = document.createElement("li");
  card.className = "animate-pulse overflow-hidden rounded-lg bg-white shadow dark:bg-slate-900";
  card.setAttribute("aria-hidden", "true");

  const poster = document.createElement("div");
  poster.className = "aspect-[2/3] bg-slate-200 dark:bg-slate-800";

  const text = document.createElement("div");
  text.className = "space-y-2 p-3";
  for (const width of ["w-3/4", "w-1/2"]) {
    const line = document.createElement("div");
    line.className = `h-4 rounded bg-slate-200 dark:bg-slate-800 ${width}`;
    text.append(line);
  }

  card.append(poster, text);
  return card;
}

export function showIdle() {
  status.textContent = IDLE_MESSAGE;
  results.replaceChildren();
}

export function showLoading() {
  status.textContent = "Searching…";
  results.replaceChildren(...Array.from({ length: SKELETON_COUNT }, createSkeletonCard));
}

export function showEmpty(query) {
  status.textContent = `No movies found for '${query}'`;
  results.replaceChildren();
}

export function showError(onRetry) {
  const message = document.createElement("p");
  message.textContent = ERROR_MESSAGE;

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.textContent = "Retry";
  retryButton.className =
    "mt-3 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950";
  retryButton.addEventListener("click", onRetry);

  status.replaceChildren(message, retryButton);
  results.replaceChildren();
}

function createPoster(movie) {
  if (!movie.poster_path) {
    const placeholder = document.createElement("div");
    placeholder.className =
      "flex aspect-[2/3] items-center justify-center bg-slate-200 p-3 text-center text-sm " +
      "text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    placeholder.textContent = movie.title;
    return placeholder;
  }

  const poster = document.createElement("img");
  poster.src = `${POSTER_BASE_URL}${movie.poster_path}`;
  poster.alt = `Poster for ${movie.title}`;
  poster.loading = "lazy";
  poster.className = "aspect-[2/3] w-full object-cover";
  return poster;
}

function createMovieCard(movie) {
  const card = document.createElement("li");
  card.className = "overflow-hidden rounded-lg bg-white shadow dark:bg-slate-900";

  const title = document.createElement("h2");
  title.className = "truncate font-semibold";
  title.textContent = movie.title;

  const year = document.createElement("span");
  year.textContent = movie.release_date?.slice(0, 4) || "Unknown";

  const rating = document.createElement("span");
  rating.textContent = `★ ${(movie.vote_average ?? 0).toFixed(1)} / 10`;

  const details = document.createElement("p");
  details.className = "mt-1 flex justify-between text-sm text-slate-600 dark:text-slate-400";
  details.append(year, rating);

  const body = document.createElement("div");
  body.className = "p-3";
  body.append(title, details);

  card.append(createPoster(movie), body);
  return card;
}

export function showResults(movies, query) {
  status.textContent = `Found ${movies.length} movies for '${query}'`;
  results.replaceChildren(...movies.map(createMovieCard));
}
