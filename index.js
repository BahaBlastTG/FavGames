document.querySelectorAll('.game-carousel').forEach(carousel => {
  const track = carousel.querySelector('.game-grid');
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');

  if (!track || !prevBtn || !nextBtn) return;

  const scrollStep = () => Math.round(track.clientWidth * 0.8);

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollStep(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollStep(), behavior: 'smooth' });
  });

  track.addEventListener('wheel', (event) => {
    if (event.deltaY === 0) return;
    event.preventDefault();
    track.scrollBy({ left: event.deltaY, behavior: 'smooth' });
  }, { passive: false });

  const updateButtons = () => {
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  };

  track.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();
});

async function fetchGamesByParams(params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`https://api.rawg.io/api/games?key=a1d89bda2dbe45ac8953efc6a5383411&${query}`);
  if (!response.ok) {
    console.error('RAWG API error', response.status, response.statusText);
    return [];
  }
  const data = await response.json();
  return data.results || [];
}