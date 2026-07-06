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
  el.innerHTML = `<strong>Could not load game</strong><p>${message}</p><p>Try a hard refresh. You need internet on first visit for the 3D engine.</p>`;
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Loading…' : label;
}

document.getElementById('btn-play')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-play');
  setButtonLoading(btn, true, 'Enter the City');

  try {
    const { initAvatarPreview } = await import('./main.js');
    showScreen('screen-avatar');
    await initAvatarPreview();
  } catch (err) {
    console.error(err);
    showLoadError(err.message || String(err));
    showScreen('screen-title');
  } finally {
    setButtonLoading(btn, false, 'Enter the City');
  }
});

document.getElementById('btn-enter-world')?.addEventListener('click', async () => {
  const btn = document.getElementById('btn-enter-world');
  setButtonLoading(btn, true, 'Spawn on Marine Drive');

  try {
    const { stopPreview, startGame } = await import('./main.js');
    stopPreview();
    await startGame();
  } catch (err) {
    console.error(err);
    showLoadError(err.message || String(err));
    showScreen('screen-avatar');
  } finally {
    setButtonLoading(btn, false, 'Spawn on Marine Drive');
  }
});

import('./main.js').then((mod) => mod.bindPauseUI?.()).catch(() => {});

// Unregister broken service workers from older versions
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      if (reg.active?.scriptURL?.includes('sw.js')) {
        reg.update();
      }
    });
  });
}
