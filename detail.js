function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function fetchGameDetail(gameId) {
  const url = `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error('RAWG detail fetch error', response.status, response.statusText);
    return null;
  }
  return response.json();
}

async function fetchGameScreenshots(gameId) {
  const url = `https://api.rawg.io/api/games/${gameId}/screenshots?key=${API_KEY}&page_size=6`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results || [];
}

async function fetchGameTrailers(gameId) {
  const url = `https://api.rawg.io/api/games/${gameId}/movies?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return data.results || [];
}

function formatReleaseDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setImage(selector, src, alt) {
  const element = document.querySelector(selector);
  if (element && element.tagName === 'IMG') {
    element.src = src;
    element.alt = alt;
  }
}

function renderGallery(images) {
  const gallery = document.querySelector('.detail-gallery');
  if (!gallery) return;
  gallery.innerHTML = images.slice(0, 3).map(image => `
    <img src="${image.image}" alt="Game screenshot">
  `).join('');
}

function renderTrailer(trailers) {
  const trailerContainer = document.getElementById('detail-trailer-container');
  if (!trailerContainer) return;

  if (!trailers.length) {
    trailerContainer.innerHTML = '<p>No trailer available for this game.</p>';
    return;
  }

  const trailer = trailers[0];
  const videoUrl = (trailer.data && trailer.data.max) || (trailer.data && trailer.data['480']) || trailer.preview;

  if (videoUrl) {
    trailerContainer.innerHTML = `
      <video controls muted playsinline poster="${trailer.preview || ''}" style="width: 100%; border-radius: 18px;">
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support video playback.
      </video>
    `;
    return;
  }

  trailerContainer.innerHTML = '<p>No trailer available for this game.</p>';
}

function renderDetail(game) {
  const poster = game.background_image || game.background_image_additional || 'access/img/Poster.jpg';
  const genres = game.genres && game.genres.length ? game.genres.map(g => g.name).join(', ') : 'Unknown Genre';
  const platforms = game.platforms && game.platforms.length ? game.platforms.map(p => p.platform.name).join(', ') : 'Any Platform';
  const gametag = game.tags && game.tags.length ? `#${game.tags[0].name.replace(/\s+/g, '').toUpperCase()}` : '#FAVGAMES';

  setImage('#detail-poster', poster, game.name);
  setText('#detail-title', game.name);
  setText('#detail-release', `Release: ${formatReleaseDate(game.released)}`);
  setText('#detail-gametag', `GameTag: ${gametag}`);
  setText('#detail-platform', `Platform: ${platforms}`);
  setText('#detail-genres', genres);
  setText('#detail-description', game.description_raw || game.description || 'No description available.');
  setText('#detail-rating', `Rating: ${game.rating ? game.rating.toFixed(1) : 'N/A'} / 5`);
}

async function loadDetailPage() {
  const gameId = getQueryParam('id');
  if (!gameId) {
    document.body.innerHTML = '<main class="main__container container"><p>Game not found. Please return to the home page.</p></main>';
    return;
  }

  const [game, screenshots, trailers] = await Promise.all([
    fetchGameDetail(gameId),
    fetchGameScreenshots(gameId),
    fetchGameTrailers(gameId),
  ]);

  if (!game) {
    document.body.innerHTML = '<main class="main__container container"><p>Unable to load game details. Please try again later.</p></main>';
    return;
  }

  renderDetail(game);

  const fallbackImages = [
    game.background_image,
    game.background_image_additional,
    game.background_image
  ].filter(Boolean).map(src => ({ image: src }));

  renderGallery(screenshots.length ? screenshots : fallbackImages);
  renderTrailer(trailers);
}

document.addEventListener('DOMContentLoaded', loadDetailPage);
