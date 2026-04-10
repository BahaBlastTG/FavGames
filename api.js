const API_KEY = 'a1d89bda2dbe45ac8953efc6a5383411';

      function serializeQuery(params) {
  return new URLSearchParams({ key: API_KEY, ...params }).toString();
}

async function fetchGamesByParams(params = {}) {
  const url = `https://api.rawg.io/api/games?${serializeQuery(params)}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error('RAWG API error', response.status, response.statusText);
    return [];
  }

  const data = await response.json();
  return data.results || [];
}

function normalizeGameName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

async function fetchGameByName(name) {
  const results = await fetchGamesByParams({ search: name, page_size: 5 });
  if (!results.length) return null;

  const exactMatch = results.find(game => normalizeGameName(game.name) === normalizeGameName(name));
  return exactMatch || results[0];
}

async function loadMustPlayGames() {
  const mustPlayNames = [
    'Terraria',
    'Ultrakill',
    'OneShot',
    'Hollow Knight',
    'Dead Cells',
    'Undertale',
    'Deltarune'
  ];

  const games = await Promise.all(mustPlayNames.map(name => fetchGameByName(name)));
  return games.filter(Boolean);
}

function renderGames(containerSelector, games) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = games.map(game => {
    const image = game.background_image || game.background_image_additional ||
      (game.short_screenshots && game.short_screenshots[0] && game.short_screenshots[0].image) ||
      'access/img/Poster.jpg';
    const rating = game.rating ? game.rating.toFixed(1) : 'N/A';
    const release = game.released || 'Unknown';

    return `
      <a href="detail.html?id=${game.id}" class="game-card-link">
        <article class="game-card" style="background-image: url('${image}');">
          <div class="game-card-info">
            <h3>${game.name}</h3>
            <p>Rating: ${rating} / 5</p>
            <p>${release}</p>
          </div>
        </article>
      </a>
    `;
  }).join('');
}

async function loadGames() {
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const formattedNextYear = nextYear.toISOString().split('T')[0];
  const currentYear = today.getFullYear();

  const [mustPlayGames, popularGames, indieGames, gotyGames, topRatedGames, upcomingGames] = await Promise.all([
    loadMustPlayGames(),
    fetchGamesByParams({ ordering: '-added', page_size: 12 }),
    fetchGamesByParams({ genres: 'indie', ordering: '-rating', page_size: 12 }),
    fetchGamesByParams({ dates: `${currentYear - 1}-01-01,${currentYear}-12-31`, ordering: '-rating', page_size: 12 }),
    fetchGamesByParams({ ordering: '-rating', page_size: 12 }),
    fetchGamesByParams({ dates: `${formattedToday},${formattedNextYear}`, ordering: '-released', page_size: 12 }),
  ]);

  renderGames('.must-play-games', mustPlayGames);
  renderGames('.popular-games', popularGames);
  renderGames('.indie-games', indieGames);
  renderGames('.goty-games', gotyGames);
  renderGames('.top-rated-games', topRatedGames);
  renderGames('.upcoming-games', upcomingGames);
}

function bindSearch() {
  const searchBar = document.getElementById('search-bar');

  if (!searchBar) return;

  let timeout = null;

  searchBar.addEventListener('input', (event) => {
    clearTimeout(timeout);
    const query = event.target.value.trim();

    timeout = setTimeout(async () => {
      if (!query) {
        return loadGames();
      }

      const results = await fetchGamesByParams({ search: query, page_size: 12 });
      renderGames('.popular-games', results);
    }, 350);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadGames();
  bindSearch();
});