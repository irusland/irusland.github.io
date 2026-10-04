(() => {
    const section = document.querySelector('.scroll-film');
    if (!section) return;
    const video = section.querySelector('video');
    const stage = section.querySelector('.scroll-film__stage');
    const story = section.querySelector('.scroll-film__story');
    const guide = section.querySelector('.scroll-film__guide');
    const clamp = value => Math.max(0, Math.min(1, value));
    const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
    function placeStory() {
        const overlay = ready && !reducedMotion.matches;
        if (overlay) stage.append(story);
        else section.append(story);
        story.inert = overlay;
        section.style.setProperty('--film-blur', '0px');
        section.style.setProperty('--film-scale', '1');
        section.style.setProperty('--story-opacity', '0');
    }
    const status = section.querySelector('.scroll-film__status');
    const progressBar = section.querySelector('.scroll-film__progress span');
    const picker = section.querySelector('input');
    const header = document.querySelector('.header');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let ready = false;
    let frame = 0;
    let targetTime = 0;
    let objectURL;
    let lastFrameTime = 0;
    let sourceEndTime;
    let sourceVersion = 0;
    let guideTimer;
    let previousProgress = null;
    let autoFrame = 0;
    let autoRunning = false;
    let lastAutoTime = null;
    let autoElapsed = 0;
    let inputHeld = false;
    let pageActive = true;
    function canAssist() {
        const bounds = section.getBoundingClientRect();
        const distance = Math.max(1, section.offsetHeight - stage.offsetHeight);
        return ready && video.readyState >= 2 && !reducedMotion.matches && !document.hidden && pageActive && !inputHeld
            && bounds.top <= stage.offsetHeight * 0.15 && -bounds.top < distance * 0.96;
    }
    function stopAssist() {
        clearTimeout(guideTimer);
        guideTimer = undefined;
        cancelAnimationFrame(autoFrame);
        autoFrame = 0;
        autoRunning = false;
        lastAutoTime = null;
        autoElapsed = 0;
        guide.hidden = true;
    }
    function resetGuide() {
        stopAssist();
        previousProgress = null;
    }
    function autoStep(now) {
        autoFrame = 0;
        if (!canAssist()) return stopAssist();
        const dt = lastAutoTime === null ? 0 : Math.min(now - lastAutoTime, 64);
        lastAutoTime = now;
        autoElapsed += dt;
        const remaining = section.getBoundingClientRect().top
            + (section.offsetHeight - stage.offsetHeight) * 0.96;
        // Time-based movement, eased in; never leave the film or skip its final title.
        const pixels = Math.min(remaining, 140 * smooth(autoElapsed / 800) * dt / 1000);
        if (pixels > 0) window.scrollBy({ top: pixels, behavior: 'instant' });
        schedule();
        if (remaining <= 1) return stopAssist();
        autoFrame = requestAnimationFrame(autoStep);
    }
    function updateGuide(progress) {
        const moved = previousProgress !== null && Math.abs(progress - previousProgress) > 0.0001;
        previousProgress = progress;
        if (!canAssist()) return stopAssist();
        if (autoRunning) return;
        if (moved) stopAssist();
        if (guideTimer === undefined) {
            guideTimer = setTimeout(() => {
                guideTimer = undefined;
                if (!canAssist()) return;
                autoRunning = true;
                guide.hidden = false;
                autoFrame = requestAnimationFrame(autoStep);
            }, 3000);
        }
    }
    function manualInput() {
        resetGuide();
        schedule();
    }

    // Serialize seeks so rapid scrolling does not overwhelm the video decoder.
    function seek() {
        if (!ready || reducedMotion.matches || video.seeking || video.readyState < 2) return;
        if (Math.abs(video.currentTime - targetTime) > 0.001) {
            video.currentTime = targetTime;
        }
    }
    function update() {
        frame = 0;
        if (!ready || reducedMotion.matches) return;
        const bounds = section.getBoundingClientRect();
        const top = parseFloat(getComputedStyle(stage).top) || 0;
        const distance = section.offsetHeight - stage.offsetHeight;
        const progress = Math.max(0, Math.min(1, (top - bounds.top) / Math.max(1, distance)));
        updateGuide(progress);
        // Blur and reveal the title while the film is still moving beneath it.
        targetTime = clamp(progress / 0.96) * lastFrameTime;
        const blur = smooth((progress - 0.65) / 0.16);
        const title = smooth((progress - 0.73) / 0.12);
        section.style.setProperty('--film-blur', `${blur * 24}px`);
        section.style.setProperty('--film-scale', String(1 + blur * 0.08));
        section.style.setProperty('--story-opacity', String(title));
        story.inert = title < 0.95;
        progressBar.style.transform = `scaleX(${progress})`;
        seek();
    }
    function schedule() {
        if (!frame) frame = requestAnimationFrame(update);
    }
    function setMode() {
        resetGuide();
        section.classList.toggle('is-reduced', reducedMotion.matches);
        video.controls = reducedMotion.matches;
        video.pause();
        placeStory();
        if (ready) {
            status.textContent = '';
            status.hidden = true;
        }
        schedule();
    }
    function fail() {
        resetGuide();
        ready = false;
        section.classList.remove('is-ready');
        placeStory();
        status.hidden = false;
        status.textContent = 'This video could not be loaded. Try another MP4 or WebM file.';
    }
    function loadSource(src, endTime) {
        sourceVersion += 1;
        resetGuide();
        sourceEndTime = endTime;
        targetTime = 0;
        ready = false;
        section.classList.remove('is-ready');
        placeStory();
        status.hidden = false;
        status.textContent = 'Loading film…';
        video.src = src;
        video.load();
    }
    video.addEventListener('loadedmetadata', () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return fail();
        // Container duration extends past the presentation time of the last video frame.
        // Use the measured final frame for the published clip, or leave a small safety margin.
        lastFrameTime = Number.isFinite(sourceEndTime) && sourceEndTime >= 0
            ? Math.min(sourceEndTime, Math.max(0, video.duration - 0.001))
            : Math.max(0, video.duration - 0.1);
        ready = true;
        section.classList.add('is-ready');
        setMode();
    });
    video.addEventListener('loadeddata', schedule);
    // Coalesce queued scroll changes on the next animation frame instead of seeking
    // again inside the decoder's completion event. The latest scroll position wins.
    video.addEventListener('seeked', schedule);
    video.addEventListener('error', fail);
    // Scroll mode always stays paused, including after native media commands.
    video.addEventListener('play', () => {
        if (!reducedMotion.matches) video.pause();
    });
    picker.addEventListener('change', () => {
        const file = picker.files[0];
        if (!file) return;
        if (objectURL) URL.revokeObjectURL(objectURL);
        objectURL = URL.createObjectURL(file);
        loadSource(objectURL);
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('wheel', manualInput, { passive: true });
    window.addEventListener('keydown', manualInput);
    window.addEventListener('pointerdown', () => { inputHeld = true; manualInput(); }, { passive: true });
    for (const event of ['pointerup', 'pointercancel']) {
        window.addEventListener(event, () => { inputHeld = false; manualInput(); }, { passive: true });
    }
    window.addEventListener('touchstart', () => { inputHeld = true; manualInput(); }, { passive: true });
    for (const event of ['touchend', 'touchcancel']) {
        window.addEventListener(event, () => { inputHeld = false; manualInput(); }, { passive: true });
    }
    window.addEventListener('blur', () => { pageActive = false; resetGuide(); });
    window.addEventListener('focus', () => { pageActive = true; schedule(); });
    document.addEventListener('visibilitychange', () => { resetGuide(); schedule(); });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', setMode);
    const resizeObserver = new ResizeObserver(() => {
        const height = `${header.getBoundingClientRect().height}px`;
        document.documentElement.style.setProperty('--site-header-height', height);
        schedule();
    });
    resizeObserver.observe(header);
    resizeObserver.observe(section);
    section.classList.toggle('is-reduced', reducedMotion.matches);
    async function loadPublishedSource() {
        const src = section.dataset.videoSrc;
        if (!src) return;
        const endTime = Number.parseFloat(section.dataset.videoEnd);
        const version = sourceVersion;
        const cacheName = 'irusland-scroll-video-v1';
        status.hidden = false;
        status.textContent = 'Loading film…';
        try {
            if (!window.isSecureContext || !('caches' in window)) throw new Error('Cache unavailable');
            const url = new URL(src, document.baseURI).href;
            const cache = await caches.open(cacheName);
            let response = await cache.match(url);
            if (!response) {
                response = await fetch(url);
                if (response.status !== 200 || !response.headers.get('Content-Type')?.startsWith('video/')) {
                    throw new Error('Invalid video response');
                }
                // Store only a complete file, never a partial HTTP range response.
                const blob = await response.blob();
                if (!blob.size) throw new Error('Empty video');
                response = new Response(blob, { headers: { 'Content-Type': blob.type } });
                try {
                    await cache.put(url, response.clone());
                    // The content hash in the URL changes when the video is replaced.
                    const keys = await cache.keys();
                    await Promise.all(keys.filter(key => key.url !== url).map(key => cache.delete(key)));
                } catch { /* Storage quota/private mode must not prevent playback. */ }
            }
            const blob = await response.blob();
            if (!blob.size) throw new Error('Empty cached video');
            if (version !== sourceVersion) return; // A locally selected film takes priority.
            if (objectURL) URL.revokeObjectURL(objectURL);
            objectURL = URL.createObjectURL(blob);
            // Blob URLs support native seeking without additional server range requests.
            loadSource(objectURL, endTime);
        } catch {
            if (version === sourceVersion) loadSource(src, endTime);
        }
    }
    loadPublishedSource();
})();
