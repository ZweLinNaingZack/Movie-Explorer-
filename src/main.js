import { fetchDetails, fetchGenres, fetchMovies, fetchMoviesByGenre, fetchTrending } from "./api.js";
import {
  onLandingTabClick,
  onTrendingTabClick,
  openMovieDialog,
  setActiveGenre,
  setLandingTab,
  setLandingVisible,
  setTrendingTab,
  showDetailsUnavailable,
  showEmpty,
  showError,
  showGenreError,
  showGenreList,
  showGenreLoading,
  showGenreMovies,
  showIdle,
  showLoading,
  showMovieDetails,
  showResults,
  showTrending,
  showTrendingError,
  showTrendingLoading,
} from "./ui.js";
import { debounce } from "./utils.js";

const DEBOUNCE_MS = 400;
// TMDB rebuilds its trending lists daily, so polling faster than this gains nothing
const TRENDING_REFRESH_MS = 5 * 60 * 1000;

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");
const dialog = document.getElementById("movie-dialog");

let currentController;
let detailsController;
let trendingController;
let genreController;
let landingTab = "trending";
let trendingTab = "all";
let genres;
let selectedGenre;

const isSearchEmpty = () => input.value.trim() === "";

async function openMovie(item) {
  detailsController?.abort();
  detailsController = new AbortController();
  openMovieDialog(item);
  try {
    showMovieDetails(await fetchDetails(item.id, item.media_type ?? "movie", detailsController.signal));
  } catch (error) {
    if (error.name !== "AbortError") showDetailsUnavailable();
  }
}

// A silent refresh keeps the current cards on screen and ignores failures
async function loadTrending({ silent = false } = {}) {
  trendingController?.abort();
  trendingController = new AbortController();
  if (!silent) showTrendingLoading();
  try {
    showTrending(await fetchTrending(trendingTab, trendingController.signal), openMovie);
  } catch (error) {
    if (error.name === "AbortError" || silent) return;
    showTrendingError(() => loadTrending());
  }
}

async function loadGenreMovies() {
  genreController?.abort();
  genreController = new AbortController();
  setActiveGenre(selectedGenre.id);
  showGenreLoading(selectedGenre.name);
  try {
    showGenreMovies(await fetchMoviesByGenre(selectedGenre.id, genreController.signal), openMovie);
  } catch (error) {
    if (error.name !== "AbortError") showGenreError(loadGenreMovies);
  }
}

function selectGenre(genre) {
  selectedGenre = genre;
  loadGenreMovies();
}

// The genre list is fetched once; the first genre is preselected so the grid is never empty
async function loadGenres() {
  if (genres) {
    loadGenreMovies();
    return;
  }

  genreController?.abort();
  genreController = new AbortController();
  showGenreLoading();
  try {
    genres = await fetchGenres(genreController.signal);
    showGenreList(genres, selectGenre);
    selectGenre(genres[0]);
  } catch (error) {
    if (error.name !== "AbortError") showGenreError(loadGenres);
  }
}

const refreshLanding = () => (landingTab === "trending" ? loadTrending() : loadGenres());

async function search(query) {
  currentController?.abort();
  if (!query) {
    showIdle();
    setLandingVisible(true);
    refreshLanding();
    return;
  }

  trendingController?.abort();
  genreController?.abort();
  setLandingVisible(false);
  currentController = new AbortController();
  showLoading();
  try {
    const movies = await fetchMovies(query, currentController.signal);
    if (movies.length === 0) showEmpty(query);
    else showResults(movies, query, openMovie);
  } catch (error) {
    if (error.name === "AbortError") return;
    showError(() => search(query));
  }
}

const syncClearButton = () => clearButton.classList.toggle("hidden", input.value === "");

// Read the input when the timer fires, so a pending search can't revive cleared text
const runSearch = () => search(input.value.trim());

input.addEventListener("input", syncClearButton);
input.addEventListener("input", debounce(runSearch, DEBOUNCE_MS));

// Enter would reload the page; the debounced input handler already covers searching
form.addEventListener("submit", (event) => event.preventDefault());

clearButton.addEventListener("click", () => {
  input.value = "";
  syncClearButton();
  runSearch();
  input.focus();
});

// Don't leave a details request running for a dialog nobody can see
dialog.addEventListener("close", () => detailsController?.abort());

onLandingTabClick((tab) => {
  landingTab = tab;
  setLandingTab(tab);
  // Leaving a tab mid-request must not leave its skeletons stuck
  trendingController?.abort();
  genreController?.abort();
  refreshLanding();
});

onTrendingTabClick((tab) => {
  trendingTab = tab;
  setTrendingTab(tab);
  loadTrending();
});

setInterval(() => {
  if (isSearchEmpty() && landingTab === "trending" && !document.hidden) loadTrending({ silent: true });
}, TRENDING_REFRESH_MS);

setLandingTab(landingTab);
setTrendingTab(trendingTab);
loadTrending();
