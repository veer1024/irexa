(function () {
    var overlay = document.getElementById('page-loader');
    if (!overlay) return;

    var fill = overlay.querySelector('.page-loader__fill');
    var pctEl = overlay.querySelector('.page-loader__pct');
    var hidden = false;

    function setProgress(v) {
        v = Math.min(100, Math.max(0, Math.round(v)));
        if (fill) fill.style.width = v + '%';
        if (pctEl) pctEl.textContent = v + '%';
    }

    function hide() {
        if (hidden) return;
        hidden = true;
        setProgress(100);
        overlay.classList.add('page-loader--done');
        setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 480);
    }

    var imgs = Array.prototype.slice.call(document.querySelectorAll('img'));
    var total = imgs.length;
    var loaded = 0;

    function refresh() {
        if (total > 0) setProgress((loaded / total) * 100);
        else setProgress(0);
    }

    function bump() {
        loaded++;
        refresh();
    }

    imgs.forEach(function (img) {
        if (img.complete && img.naturalWidth > 0) {
            loaded++;
        } else {
            img.addEventListener('load', bump, { once: true });
            img.addEventListener('error', bump, { once: true });
        }
    });

    refresh();

    function scheduleHide() {
        setTimeout(hide, 120);
    }

    if (document.readyState === 'complete') {
        scheduleHide();
    } else {
        window.addEventListener('load', scheduleHide);
    }

    // Never leave the site stuck behind a black overlay (slow network, blocked scripts, etc.)
    setTimeout(function () {
        if (!hidden) hide();
    }, 10000);
})();
