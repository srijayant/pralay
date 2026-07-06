const INSTALL_DISMISS_KEY = 'pralay-install-dismissed';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

let deferredPrompt = null;

function showInstallBanner() {
  if (isStandalone() || document.getElementById('install-banner')) return;
  if (localStorage.getItem(INSTALL_DISMISS_KEY)) return;

  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.className = 'install-banner';
  banner.innerHTML = `
    <div class="install-banner-text">
      <strong>Install Pralay</strong>
      <span>${isIOS() ? 'Add to Home Screen to play fullscreen and offline.' : 'Add to your home screen to play offline like an app.'}</span>
    </div>
    <div class="install-banner-actions">
      <button type="button" id="btn-install" class="btn-install">${isIOS() ? 'How to' : 'Install'}</button>
      <button type="button" id="btn-install-dismiss" class="btn-install-dismiss" aria-label="Dismiss">✕</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('btn-install-dismiss')?.addEventListener('click', () => {
    localStorage.setItem(INSTALL_DISMISS_KEY, '1');
    banner.remove();
  });

  document.getElementById('btn-install')?.addEventListener('click', async () => {
    if (isIOS()) {
      alert('To install on iPhone:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap Add');
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    banner.remove();
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  showInstallBanner();
});

window.addEventListener('load', () => {
  if (isIOS() && !isStandalone()) {
    setTimeout(showInstallBanner, 1500);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
