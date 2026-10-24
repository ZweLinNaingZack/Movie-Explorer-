import { TMDB_TOKEN } from "../config.js";

const API_URL = "https://api.themoviedb.org/3";

async function request(url, signal) {
  const res = await fetch(url, {
    signal,
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  });

  // fetch only rejects on network failure, so HTTP errors must be checked by hand
  if (!res.ok) {
    throw new Error(`TMDB request failed with status ${res.status}`);
  }

  return res.json();
}

// Series use name/first_air_date; map them onto the movie field names the UI already reads
function normalizeTitle(item) {
  if (item.media_type === "tv") {
    return { ...item, title: item.name, release_date: item.first_air_date };
  }
  return { ...item, media_type: "movie" };
}

export async function fetchMovies(query, signal) {
  const data = await request(`${API_URL}/search/movie?${new URLSearchParams({ query })}`, signal);
  return data.results.map(normalizeTitle);
}

// type: "all" | "movie" | "tv"; the "all" feed also contains people, which we skip
export async function fetchTrending(type, signal) {
  const data = await request(`${API_URL}/trending/${type}/day`, signal);
  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map(normalizeTitle);
}

export async function fetchGenres(signal) {
  const data = await request(`${API_URL}/genre/movie/list`, signal);
  return data.genres;
}

export async function fetchMoviesByGenre(genreId, signal) {
  const params = new URLSearchParams({ with_genres: genreId, sort_by: "popularity.desc" });
  const data = await request(`${API_URL}/discover/movie?${params}`, signal);
  return data.results.map(normalizeTitle);
}

export async function fetchDetails(id, mediaType, signal) {
  const details = await request(`${API_URL}/${mediaType}/${encodeURIComponent(id)}`, signal);
  return { ...details, runtime: details.runtime ?? details.episode_run_time?.[0] };
}
