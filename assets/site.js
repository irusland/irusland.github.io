(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const options = document.querySelectorAll('.theme-option');
    let selectedTheme = 'dark';
    try {
        const saved = localStorage.getItem('theme');
        if (['dark', 'light', 'auto'].includes(saved)) selectedTheme = saved;
    } catch { /* The site also works when storage is unavailable. */ }
    function applyTheme() {
        document.body.dataset.theme = selectedTheme === 'auto'
            ? (systemTheme.matches ? 'dark' : 'light') : selectedTheme;
        options.forEach(option => {
            option.setAttribute('aria-pressed', String(option.dataset.theme === selectedTheme));
        });
    }
    options.forEach(option => option.addEventListener('click', () => {
        selectedTheme = option.dataset.theme;
        try { localStorage.setItem('theme', selectedTheme); } catch { /* Optional persistence. */ }
        applyTheme();
    }));
    systemTheme.addEventListener('change', () => {
        if (selectedTheme === 'auto') applyTheme();
    });
    applyTheme();
    document.getElementById('year').textContent = new Date().getFullYear();
})();

// Static caching is optional; the page still works when storage is disabled.
if (window.isSecureContext && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register(new URL('sw.js', document.baseURI), {
        updateViaCache: 'none',
    }).catch(() => {});
}
