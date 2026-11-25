
// 1. API 


const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNjRjNGYzNjBkZjdkMGI1MjFhMzI4ZWJjMTRmMmQ4ZSIsIm5iZiI6MTc5NDQ5ODc3Ny43MzcsInN1YiI6IjZhZjVlMGQ5YzgxYzU1MWI1NmNjNmY4MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hED4hrI5UJSLE0j36pB1IDDUA8rolZXs_sV8iGzP_Js";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const ITUNES_URL = "https://itunes.apple.com/search";

// 2. SELECT HTML ELEMENTS

const search = document.querySelector("#search_here");
const searchForm = document.querySelector("#search_form");
const searchStatus = document.querySelector("#search_status");

const movieCards = document.querySelector("#movie_cards");
const popularMovieCards = document.querySelector("#popular_movie_cards");
const musicCards = document.querySelector("#music_cards");

const movieDetails = document.querySelector("#movie_details");
const poster = document.querySelector("#poster");

const addWatchlistBtn = document.querySelector("#add_watchlist");
const savedMovies = document.querySelector("#saved_movies");

const themeBtn = document.querySelector("#theme_btn");
const themeText = document.querySelector("#theme_text");

const menuBtn = document.querySelector("#menu_btn");
const menuPanel = document.querySelector("#menu_panel");

const categoryBtns = document.querySelectorAll(".category-btn");
const subTabs = document.querySelectorAll(".sub-tab");

let selectedCategory = "all";
let selectedMovie = null;



menuBtn.addEventListener("click", () => {
    menuPanel.hidden = !menuPanel.hidden;
});



themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    themeText.textContent =
        document.body.classList.contains("light-mode")
            ? "Dark"
            : "Light";
});



async function getMovies(endpoint) {

    const response = await fetch(
        `${TMDB_BASE}${endpoint}`,
        {
            headers: {
                Authorization: `Bearer ${TMDB_TOKEN}`,
                accept: "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error("Movie API request failed");
    }

    return await response.json();
}



function displayMovies(movies, container) {

    container.innerHTML = "";

    if (!movies.length) {
        container.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.slice(0, 10).forEach(movie => {

        const card = document.createElement("article");
        card.className = "movie-card";
        card.dataset.movieId = movie.id;

        const image = movie.poster_path
            ? `${IMAGE_BASE}${movie.poster_path}`
            : "";

        const year = movie.release_date
            ? movie.release_date.slice(0, 4)
            : "Unknown";

        card.innerHTML = `
            <div class="poster">
                ${image
                    ? `<img src="${image}" alt="Movie poster"
                         style="width:100%;height:100%;
                         object-fit:cover;">`
                    : "<span>No Poster Available</span>"
                }

                <span class="media-label">MOVIE</span>

                <span class="rating">
                    ★ ${movie.vote_average?.toFixed(1) || "N/A"}
                </span>
            </div>

            <div class="card-info">
                <h3></h3>
                <p>Release year: ${year}</p>
            </div>
        `;

        card.querySelector("h3").textContent = movie.title;

        container.appendChild(card);
    });
}



async function loadTrendingMovies() {

    try {

        movieCards.innerHTML = "<p>Loading movies...</p>";

        const data = await getMovies("/trending/movie/day");

        displayMovies(data.results, movieCards);

    } catch (error) {

        movieCards.textContent = "Unable to load trending movies.";

        console.error(error);
    }
}



async function loadPopularMovies() {

    try {

        popularMovieCards.innerHTML = "Loading popular movies...";

        const data = await getMovies("/movie/popular");

        popularMovieCards.className = "media-grid";

        displayMovies(data.results, popularMovieCards);

    } catch (error) {

        popularMovieCards.textContent =
            "Unable to load popular movies.";

        console.error(error);
    }
}



async function searchMovies(query) {

    const data = await getMovies(
        `/search/movie?query=${encodeURIComponent(query)}`
    );

    displayMovies(data.results, movieCards);
}



async function showMovieDetails(movieId) {

    try {

        const movie = await getMovies(`/movie/${movieId}`);

        selectedMovie = movie;

        poster.innerHTML = movie.poster_path
            ? `<img src="${IMAGE_BASE}${movie.poster_path}"
                 alt="Movie poster"
                 style="width:100%;height:100%;
                 object-fit:cover;border-radius:10px;">`
            : "Poster not available";

        movieDetails.innerHTML = `
            <h2></h2>
            <p><strong>Release date:</strong> ${movie.release_date || "Unknown"}</p>
            <p><strong>Rating:</strong> ⭐ ${movie.vote_average?.toFixed(1) || "N/A"}/10</p>
            <p><strong>Runtime:</strong> ${movie.runtime || "Unknown"} minutes</p>
            <p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(", ")}</p>
            <p class="movie-overview"></p>
            <button id="add_watchlist" class="primary-btn" type="button">
                + Add to Watchlist
            </button>
            <button id="watch_trailer" class="primary-btn" type="button">
            Watch Trailer
            </button>

            <div id="trailer_player"></div>
        `;

        movieDetails.querySelector("h2").textContent = movie.title;
        movieDetails.querySelector(".movie-overview").textContent =
            movie.overview || "No description available.";
            document.querySelector("#watch_trailer")
    .addEventListener("click", async () => {

        const player = document.querySelector("#trailer_player");

        player.innerHTML = "Loading trailer...";

        try {
            const data = await getMovies(`/movie/${movieId}/videos`);

            const trailer = data.results.find(video =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.key
            );

            if (trailer) {
                player.innerHTML = `
                    <iframe
                        width="100%"
                        height="315"
                        src="https://www.youtube.com/embed/${trailer.key}"
                        title="Movie Trailer"
                        frameborder="0"
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                player.textContent = "Trailer not available.";
            }

        } catch (error) {
            player.textContent = "Unable to load trailer.";
            console.error(error);
        }
    });

        document.querySelector("#add_watchlist")
            .addEventListener("click", saveMovie);

        document.querySelector("#movie_details_section")
            .scrollIntoView({ behavior: "smooth" });

    } catch (error) {

        movieDetails.textContent = "Unable to load movie details.";

        console.error(error);
    }
}



movieCards.addEventListener("click", event => {

    const card = event.target.closest(".movie-card");

    if (card) {
        showMovieDetails(card.dataset.movieId);
    }
});

popularMovieCards.addEventListener("click", event => {

    const card = event.target.closest(".movie-card");

    if (card) {
        showMovieDetails(card.dataset.movieId);
    }
});



function saveMovie() {

    if (!selectedMovie) return;

    let watchlist = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
    );

    if (watchlist.some(movie => movie.id === selectedMovie.id)) {
        alert("Movie already saved!");
        return;
    }

    watchlist.push({
        id: selectedMovie.id,
        title: selectedMovie.title,
        poster_path: selectedMovie.poster_path
    });

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    displayWatchlist();

    alert("Movie added to watchlist!");
}

function displayWatchlist() {

    const watchlist = JSON.parse(
        localStorage.getItem("watchlist") || "[]"
    );

    savedMovies.innerHTML = "";

    if (!watchlist.length) {
        savedMovies.textContent = "Your saved movies will appear here.";
        savedMovies.className = "empty-state";
        return;
    }

    savedMovies.className = "media-grid";

    watchlist.forEach(movie => {

        const card = document.createElement("article");
        card.className = "movie-card";

        card.innerHTML = `
            <div class="poster">
                ${movie.poster_path
                    ? `<img src="${IMAGE_BASE}${movie.poster_path}"
                         alt="Movie poster"
                         style="width:100%;height:100%;object-fit:cover;">`
                    : "No poster"
                }
            </div>
            <div class="card-info"><h3></h3></div>
        `;

        card.querySelector("h3").textContent = movie.title;

        savedMovies.appendChild(card);
    });
}

// ==========================================
// 13. ITUNES MUSIC API
// ==========================================

async function searchMusic(query) {

    try {

        musicCards.innerHTML = "<p>Loading songs...</p>";

        const url =
            `${ITUNES_URL}?term=${encodeURIComponent(query)}&entity=song&limit=10&country=IN`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Music API request failed");
        }

        const data = await response.json();

        displayMusic(data.results);

    } catch (error) {

        musicCards.textContent = "Unable to load songs.";

        console.error(error);
    }
}



function displayMusic(songs) {

    musicCards.innerHTML = "";

    if (!songs.length) {
        musicCards.textContent = "No songs found.";
        return;
    }

    songs.forEach(song => {

        const card = document.createElement("article");
        card.className = "music-card";

        card.innerHTML = `
            <div class="album-cover">
                <img src="${song.artworkUrl100
                    ? song.artworkUrl100.replace("100x100", "300x300")
                    : ""
                }" alt="Album artwork"
                style="width:100%;height:100%;
                object-fit:cover;border-radius:12px;">
            </div>
            <div class="card-info">
                <h3></h3>
                <p></p>
                <audio controls preload="none" style="width:100%;">
                    <source src="${song.previewUrl || ""}">
                </audio>
            </div>
        `;

        card.querySelector("h3").textContent = song.trackName;
        card.querySelector("p").textContent = song.artistName;

        musicCards.appendChild(card);
    });}


const movieSections = document.querySelectorAll(
    "#trending_movies, #popular_movies, #movie_details_section, #watchlist"
);

const musicSection = document.querySelector("#popular_music");

categoryBtns.forEach(button => {

    button.addEventListener("click", () => {

        categoryBtns.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        movieSections.forEach(section => {
            section.hidden = selectedCategory === "music";
        });

        musicSection.hidden = selectedCategory === "movies";
    });
});


searchForm.addEventListener("submit", async event => {

    event.preventDefault();

    const query = search.value.trim();

    if (!query) {
        searchStatus.textContent = "Please enter a search term.";
        return;
    }

    searchStatus.textContent = `Searching for: ${query}`;

    try {

        if (selectedCategory === "movies") {

            await searchMovies(query);

        } else if (selectedCategory === "music") {

            await searchMusic(query);

        } else {

            await Promise.all([
                searchMovies(query),
                searchMusic(query)
            ]);
        }

        searchStatus.textContent = `Search results for: ${query}`;

        search.value = "";

    } catch (error) {

        searchStatus.textContent = "Something went wrong. Please try again.";

        console.error(error);
    }
});



subTabs.forEach(button => {

    button.addEventListener("click", async () => {

        const section = button.closest(".content-section");

        section.querySelectorAll(".sub-tab")
            .forEach(tab => tab.classList.remove("active"));

        button.classList.add("active");

        const list = button.dataset.list;

        if (section.id === "trending_movies") {

            const endpoints = {
                "trending-movies": "/trending/movie/day",
                "popular-movies": "/movie/popular",
                "now-playing": "/movie/now_playing",
                "upcoming": "/movie/upcoming",
                "top-rated": "/movie/top_rated"
            };

            try {

                const data = await getMovies(endpoints[list]);

                displayMovies(data.results, movieCards);

            } catch (error) {
                movieCards.textContent = "Unable to load movies.";
                console.error(error);
            }
        }

        if (section.id === "popular_music") {

            const terms = {
                "popular-songs": "popular music",
                "top-songs": "top hits",
                "new-music": "new music"
            };

            searchMusic(terms[list]);
        }
    });
});



loadTrendingMovies();
loadPopularMovies();
searchMusic("popular music");
displayWatchlist();
