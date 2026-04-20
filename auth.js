const USERS_KEY = 'favgames_users';
const SESSION_KEY = 'favgames_current_user';

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserEmail() {
  return localStorage.getItem(SESSION_KEY);
}

function setCurrentUserEmail(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY);
}

function findUserByEmail(email) {
  return getUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
}

function showMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', isError);
}

function buildHandle(name) {
  return `@${name.trim().toLowerCase().replace(/\s+/g, '')}`;
}

function renderProfile(user) {
  const nameEl = document.getElementById('profile-name');
  const handleEl = document.getElementById('profile-handle');
  const descriptionEl = document.getElementById('profile-description');
  const joinedEl = document.getElementById('profile-joined');
  const emailEl = document.getElementById('profile-email');
  const favoritesCountEl = document.getElementById('profile-favorites-count');
  const avatarEl = document.getElementById('profile-avatar');
  const favoritesGrid = document.getElementById('favorites-grid');

  if (!user || !nameEl || !handleEl || !descriptionEl || !joinedEl || !emailEl || !favoritesCountEl || !avatarEl || !favoritesGrid) {
    return;
  }

  nameEl.textContent = user.name;
  handleEl.textContent = user.handle || buildHandle(user.name);
  descriptionEl.textContent = user.description || 'A passionate player building a library of favorites one game at a time.';
  joinedEl.textContent = user.joinedAt || 'Unknown';
  emailEl.textContent = user.email;
  favoritesCountEl.textContent = user.favorites?.length || 0;
  avatarEl.src = user.avatar || 'access/img/ryou yamada avatar.jpg';
  avatarEl.alt = `${user.name} avatar`;

  favoritesGrid.innerHTML = '';
  const favorites = user.favorites || [];
  if (!favorites.length) {
    favoritesGrid.innerHTML = '<p class="empty-favorites-message">No favorited games yet. Add some from the home page to see them here.</p>';
    return;
  }

  favorites.forEach(item => {
    const card = document.createElement('article');
    card.className = 'favorite-card';
    card.innerHTML = `
      <img src="${item.image || 'access/img/Poster.jpg'}" alt="${item.title} artwork">
      <div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;
    favoritesGrid.appendChild(card);
  });
}

function requireSession() {
  const currentEmail = getCurrentUserEmail();
  if (!currentEmail) {
    window.location.href = 'login.html';
    return null;
  }
  const user = findUserByEmail(currentEmail);
  if (!user) {
    clearCurrentUser();
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function handleLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    showMessage('login-message', '');

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showMessage('login-message', 'Please fill in both email and password.', true);
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      showMessage('login-message', 'No account found with that email.', true);
      return;
    }

    if (user.password !== password) {
      showMessage('login-message', 'Incorrect password. Please try again.', true);
      return;
    }

    setCurrentUserEmail(user.email);
    window.location.href = 'profile.html';
  });
}

function handleSignupPage() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    showMessage('signup-message', '');

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form['confirm-password'].value;

    if (!name || !email || !password || !confirmPassword) {
      showMessage('signup-message', 'Please complete all fields.', true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage('signup-message', 'Passwords do not match.', true);
      return;
    }

    if (findUserByEmail(email)) {
      showMessage('signup-message', 'An account already exists with that email.', true);
      return;
    }

    const users = getUsers();
    const newUser = {
      name,
      handle: buildHandle(name),
      email,
      password,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      avatar: 'access/img/ryou yamada avatar.jpg',
      description: 'A passionate player building a library of favorites one game at a time.',
      favorites: []
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUserEmail(email);
    showMessage('signup-message', 'Account created! Redirecting…', false);
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 600);
  });
}

function handleProfilePage() {
  const profileName = document.getElementById('profile-name');
  if (!profileName) return;

  const user = requireSession();
  if (!user) return;

  renderProfile(user);

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  handleLoginPage();
  handleSignupPage();
  handleProfilePage();
});
