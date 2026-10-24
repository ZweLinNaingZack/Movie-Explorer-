import { fetchMovies } from "./api.js";
import { showEmpty, showError, showIdle, showLoading, showResults } from "./ui.js";
import { debounce } from "./utils.js";

const DEBOUNCE_MS = 400;

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const clearButton = document.getElementById("clear-button");

let currentController;

async function search(query) {
  currentController?.abort();
  if (!query) {
    showIdle();
    return;
  }

  currentController = new AbortController();
  showLoading();
  try {
    const movies = await fetchMovies(query, currentController.signal);
    if (movies.length === 0) showEmpty(query);
    else showResults(movies, query);
  } catch (error) {
    if (error.name === "AbortError") return;
    showError(() => search(query));
  }
}

// Read the input when the timer fires, so a pending search can't revive cleared text
const runSearch = () => search(input.value.trim());

input.addEventListener("input", debounce(runSearch, DEBOUNCE_MS));

// Enter would reload the page; the debounced input handler already covers searching
form.addEventListener("submit", (event) => event.preventDefault());

clearButton.addEventListener("click", () => {
  input.value = "";
  runSearch();
  input.focus();
});
