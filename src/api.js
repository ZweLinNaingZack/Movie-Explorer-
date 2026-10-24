import { TMDB_TOKEN } from "../config.js";

const SEARCH_URL = "https://api.themoviedb.org/3/search/movie";

export async function fetchMovies(query, signal) {
  const url = `${SEARCH_URL}?${new URLSearchParams({ query })}`;
  const res = await fetch(url, {
    signal,
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  });

  // fetch only rejects on network failure, so HTTP errors must be checked by hand
  if (!res.ok) {
    throw new Error(`TMDB request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.results;
}
