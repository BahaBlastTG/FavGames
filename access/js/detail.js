async function fetchEnemyData() {
    try {
        const response = await fetch('../json/enemy.json');
        if (!response.ok) {
            throw new Error(`Failed to load enemy data: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

function getQueryEnemy() {
    return new URLSearchParams(window.location.search).get('enemy')?.trim() || '';
}

// Functions for user management
function getUsers() {
  const raw = localStorage.getItem('favgames_users');
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem('favgames_users', JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem('favgames_current_user');
}

function createMetaPill(label, value) {
    const pill = document.createElement('span');
    pill.className = 'meta-pill';
    pill.textContent = `${label}: ${value}`;
    return pill;
}

function renderList(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = '<div class="detail-list-item">No data available.</div>';
        return;
    }

    Object.entries(data).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'detail-list-item';

        const label = document.createElement('span');
        label.textContent = key;

        const valueNode = document.createElement('span');
        if (Array.isArray(value)) {
            valueNode.textContent = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            valueNode.textContent = JSON.stringify(value);
        } else {
            valueNode.textContent = String(value);
        }

        item.appendChild(label);
        item.appendChild(valueNode);
        container.appendChild(item);
    });
}

function renderArray(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!value) {
        container.innerHTML = '<span class="detail-array-item">None</span>';
        return;
    }

    const values = Array.isArray(value) ? value : [value];
    values.forEach(itemValue => {
        const pill = document.createElement('span');
        pill.className = 'detail-array-item';
        pill.textContent = Array.isArray(itemValue) ? itemValue.join(', ') : String(itemValue);
        container.appendChild(pill);
    });
}

function normalizeAssetPath(assetPath) {
    if (!assetPath) return '';
    if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('/')) {
        return assetPath;
    }
    if (assetPath.startsWith('./') || assetPath.startsWith('../')) {
        return assetPath;
    }
    return `/${assetPath.replace(/^\/+/, '')}`;
}

function renderEnemyDetail(enemyName, enemyData) {
    const titleEl = document.getElementById('detail-title');
    const posterEl = document.getElementById('detail-poster');
    const genresEl = document.getElementById('detail-genres');
    const releaseEl = document.getElementById('detail-release');
    const gametagEl = document.getElementById('detail-gametag');
    const platformEl = document.getElementById('detail-platform');
    const descEl = document.getElementById('detail-description');
    const trailerContainer = document.getElementById('detail-trailer-container');

    const general = enemyData?.General || {};
    const icon = normalizeAssetPath(general.Icon || '');
    const image = normalizeAssetPath(general.Img || icon || '../img/Poster.jpg');

    titleEl.textContent = enemyData ? enemyName : 'Enemy not found';
    genresEl.textContent = general.Class || (enemyData ? 'Unknown Type' : 'Unknown Enemy');
    releaseEl.textContent = `Health: ${general['Máu'] ?? '--'}`;
    gametagEl.textContent = `Weight: ${general['Trọng lượng'] ?? '--'}`;
    platformEl.textContent = `Rank: ${general['Hạng'] ?? '--'}`;
    descEl.textContent = general['Mô tả'] || (enemyData ? 'No description provided for this enemy.' : 'No enemy data is available for this selection.');
    posterEl.src = image;
    posterEl.alt = `${enemyName} image`;

    if (trailerContainer) {
        trailerContainer.innerHTML = '';
        const detailImage = document.createElement('img');
        detailImage.src = image;
        detailImage.alt = `${enemyName} detail image`;
        detailImage.style.width = '100%';
        detailImage.style.borderRadius = '18px';
        trailerContainer.appendChild(detailImage);
    }

    if (!enemyData) {
        renderList('detail-stats', null);
        renderArray('detail-appearance', null);
        renderList('detail-conditional', null);
        renderList('detail-damage', null);
        renderList('detail-radiance', null);
        return;
    }

    const stats = { ...general };
    delete stats['Mô tả'];
    delete stats['Class'];
    delete stats['Icon'];
    delete stats['Img'];

    renderList('detail-stats', stats);
    renderArray('detail-appearance', enemyData['Xuất hiện']);
    renderList('detail-conditional', enemyData['Bộ sửa đổi có điều kiện'] || {});
    renderList('detail-damage', enemyData['Bộ sửa đổi loại tổn thương'] || {});
    renderList('detail-radiance', enemyData['Bộ nhân Radiance'] || {});
}

async function initDetailPage() {
    const enemyName = getQueryEnemy();
    const allEnemies = await fetchEnemyData();

    if (!enemyName || !allEnemies || !allEnemies[enemyName]) {
        renderEnemyDetail(enemyName || 'Unknown', null);
        return;
    }

    renderEnemyDetail(enemyName, allEnemies[enemyName]);
}


initDetailPage();