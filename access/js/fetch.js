async function GetData(enemyName) {
    const response = await fetch('access/json/enemy.json');
    if (!response.ok) {
        throw new Error(`Failed to load enemy data: ${response.status}`);
    }

    const enemyData = await response.json();
    if (!enemyName) {
        // Trả về mảng theo đúng thứ tự trong file JSON
        return Object.entries(enemyData).map(([name, data]) => ({ name, ...data }));
    }

    const key = enemyName.toString().trim();
    return enemyData[key] ?? null;
}
function createEnemyCard(enemy) {
    const cardLink = document.createElement('a');
    cardLink.className = 'game-card-link';
    cardLink.href = `access/html/detail.html?enemy=${encodeURIComponent(enemy.name)}`;

    const card = document.createElement('div');
    card.className = 'game-card';
    const imageUrl = enemy.General?.Icon || '';
    card.style.backgroundImage = imageUrl ? `url('${imageUrl}')` : 'none';

    const info = document.createElement('div');
    info.className = 'game-card-info';

    const title = document.createElement('h3');
    title.textContent = enemy.name;

    const subtitle = document.createElement('p');
    subtitle.textContent = enemy.General?.Class || 'Enemy';

    info.appendChild(title);
    info.appendChild(subtitle);
    card.appendChild(info);
    cardLink.appendChild(card);

    return cardLink;
}

function renderEnemyCards(containerSelector, enemies) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';
    enemies.forEach(enemy => {
        container.appendChild(createEnemyCard(enemy));
    });
}

GetData().then(enemies => {
    renderEnemyCards('.must-play-games', enemies);
}).catch(error => {
    console.error('Failed to render enemy cards:', error);
});
// Example usage:
GetData('Filth').then(data => console.log(data));
GetData().then(list => console.log(list));