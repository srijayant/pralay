function showScreen(id) {
  ['screen-title', 'screen-avatar', 'screen-game', 'screen-pause'].forEach((s) => {
    document.getElementById(s)?.classList.remove('active');
  });
  document.getElementById(id)?.classList.add('active');
}

function showLoadError(message) {
  let el = document.getElementById('load-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'load-error';
    el.className = 'load-error';
    document.body.appendChild(el);
  }
  el.innerHTML = `<strong>Could not load game</strong><p>${message}</p><p>Check your internet connection and refresh. Three.js loads from CDN on first visit.</p>`;
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Loading…' : label;
}

document.getElementById('btn-play')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-play');
  setButtonLoading(btn, true, 'Enter the City');
  showScreen('screen-avatar');

  try {
    const { initAvatarPreview } = await import('./main.js');
    await initAvatarPreview();
  } catch (err) {
    console.error(err);
    showLoadError(err.message || 'Unknown error');
    showScreen('screen-title');
  } finally {
    setButtonLoading(btn, false, 'Enter the City');
  }
});

document.getElementById('btn-enter-world')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-enter-world');
  setButtonLoading(btn, true, 'Spawn in Navi Ruins');
  try {
    const { stopPreview, startGame } = await import('./main.js');
    stopPreview();
    startGame();
  } catch (err) {
    console.error(err);
    showLoadError(err.message || 'Unknown error');
  } finally {
    setButtonLoading(btn, false, 'Spawn in Navi Ruins');
  }
});

// Resume / quit wired after main loads
import('./main.js').then((mod) => mod.bindPauseUI?.()).catch(() => {});
