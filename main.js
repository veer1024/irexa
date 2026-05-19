/* ═══════════════════════════════════════════════════════════
   IREXA — Cursor, nav spy, fades, tilt cards, radar, contact form
   (Hero WebGL lives in hero-three.js — particles only, no blob mesh.)
   ═══════════════════════════════════════════════════════════ */

function init() {
    initCursor();
    initScrollSpy();
    initAboutFadeIn();
    initTiltCards();
    initRobot();
    initFormHandler();
    initProductImageLightbox();
}

function initProductImageLightbox() {
    const lb = document.getElementById('product-image-lightbox');
    const triggers = document.querySelectorAll('.product-screenshot--zoomable');
    const lbImg = document.getElementById('product-lightbox-img');
    if (!lb || !triggers.length || !lbImg) return;

    function open(trigger) {
        lbImg.src = trigger.currentSrc || trigger.getAttribute('src') || '';
        lbImg.alt = trigger.getAttribute('alt') || '';
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            open(trigger);
        });
    });

    lb.querySelectorAll('[data-lightbox-close]').forEach((el) => {
        el.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lb.classList.contains('is-open')) {
            close();
        }
    });
}

function initTiltCards() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
        const inner = card.querySelector('.id-card-inner');
        if (!inner) return;

        let curX = 0, curY = 0, tX = 0, tY = 0, raf = null;

        function lerp() {
            curX += (tX - curX) * 0.1;
            curY += (tY - curY) * 0.1;
            inner.style.transform = `perspective(800px) rotateX(${curY * 6}deg) rotateY(${-curX * 6}deg) translateZ(6px)`;
            if (Math.abs(tX - curX) > 0.001 || Math.abs(tY - curY) > 0.001) {
                raf = requestAnimationFrame(lerp);
            } else { raf = null; }
        }

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            tX = ((e.clientX - r.left) / r.width - 0.5) * 2;
            tY = ((e.clientY - r.top) / r.height - 0.5) * 2;
            if (!raf) raf = requestAnimationFrame(lerp);
        });
        card.addEventListener('mouseleave', () => {
            tX = 0; tY = 0;
            if (!raf) raf = requestAnimationFrame(lerp);
        });
    });
}

function initScrollSpy() {
    const secs = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[href^="#"]');
    if (!links.length) return;
    function update() {
        const sy = window.scrollY;
        const wh = window.innerHeight;
        let cur = '';
        secs.forEach(s => {
            const t = s.offsetTop - wh * 0.4;
            if (sy >= t && sy < t + s.offsetHeight) cur = s.id;
        });
        links.forEach(l => {
            l.classList.toggle('nav-link-active', l.getAttribute('href').substring(1) === cur);
        });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    if (!dot) return;
    document.addEventListener('mousemove', (e) => {
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
}

function initAboutFadeIn() {
    const els = document.querySelectorAll('.fade-el');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
            } else {
                e.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
}

// ── 2D Radar Animation ──
function initRobot() {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
        const parentWidth = canvas.parentElement?.clientWidth || 340;
        const size = Math.min(parentWidth, 340);
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate random blips
    const blips = [];
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.2 + Math.random() * 0.72;
        blips.push({ angle, dist, alpha: 0, life: Math.random() * 6 + 2 });
    }

    const sweepSpeed = 0.8; // radians per second
    let sweepAngle = -Math.PI / 2; // start from top (12 o'clock)

    function drawRadar(timestamp) {
        const t = timestamp / 1000;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.min(cx, cy) - 8;

        ctx.clearRect(0, 0, w, h);
        if (maxR <= 0) {
            requestAnimationFrame(drawRadar);
            return;
        }

        // Background glow
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        bgGrad.addColorStop(0, 'rgba(20, 40, 10, 0.12)');
        bgGrad.addColorStop(0.5, 'rgba(10, 25, 5, 0.06)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Concentric rings (4 rings)
        for (let i = 1; i <= 4; i++) {
            const r = (maxR / 4) * i;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(140, 180, 61, ${i === 4 ? 0.25 : 0.12})`;
            ctx.lineWidth = i === 4 ? 1.2 : 0.7;
            ctx.stroke();
        }

        // Crosshair lines
        ctx.strokeStyle = 'rgba(140, 180, 61, 0.1)';
        ctx.lineWidth = 0.5;
        // Horizontal
        ctx.beginPath(); ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy); ctx.stroke();
        // Vertical
        ctx.beginPath(); ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR); ctx.stroke();
        // Diagonals
        const d = maxR * 0.707;
        ctx.beginPath(); ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d); ctx.stroke();

        // Tick marks on the outer ring
        ctx.strokeStyle = 'rgba(140, 180, 61, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 72; i++) {
            const a = (i / 72) * Math.PI * 2;
            const inner = i % 9 === 0 ? maxR - 8 : maxR - 4;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
            ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
            ctx.stroke();
        }

        // Cardinal direction labels
        ctx.fillStyle = 'rgba(140, 180, 61, 0.45)';
        ctx.font = '10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labelR = maxR + 2;
        ctx.fillText('0°', cx, cy - labelR - 6);
        ctx.fillText('180°', cx, cy + labelR + 6);
        ctx.fillText('90°', cx + labelR + 10, cy);
        ctx.fillText('270°', cx - labelR - 12, cy);
        // Intermediate
        ctx.fillStyle = 'rgba(140, 180, 61, 0.25)';
        ctx.font = '8px "Outfit", sans-serif';
        const lr2 = labelR + 4;
        ctx.fillText('45°', cx + lr2 * 0.707, cy - lr2 * 0.707 - 2);
        ctx.fillText('135°', cx + lr2 * 0.707, cy + lr2 * 0.707 + 2);
        ctx.fillText('225°', cx - lr2 * 0.707, cy + lr2 * 0.707 + 2);
        ctx.fillText('315°', cx - lr2 * 0.707, cy - lr2 * 0.707 - 2);

        // Sweep beam
        sweepAngle = (-Math.PI / 2) + t * sweepSpeed;
        const currentAngle = sweepAngle % (Math.PI * 2);

        // Sweep trail (gradient arc)
        const trailLength = Math.PI * 0.45; // ~80 degree trail
        for (let i = 0; i < 60; i++) {
            const frac = i / 60;
            const a = currentAngle - frac * trailLength;
            const alpha = (1 - frac) * 0.18;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, maxR, a - 0.02, a + 0.02);
            ctx.closePath();
            ctx.fillStyle = `rgba(140, 180, 61, ${alpha})`;
            ctx.fill();
        }

        // Main sweep line
        const grad = ctx.createLinearGradient(
            cx, cy,
            cx + Math.cos(currentAngle) * maxR,
            cy + Math.sin(currentAngle) * maxR
        );
        grad.addColorStop(0, 'rgba(140, 180, 61, 0.0)');
        grad.addColorStop(0.3, 'rgba(140, 180, 61, 0.5)');
        grad.addColorStop(1, 'rgba(140, 180, 61, 0.9)');
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(currentAngle) * maxR, cy + Math.sin(currentAngle) * maxR);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Sweep line glow
        ctx.shadowColor = 'rgba(140, 180, 61, 0.6)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(currentAngle) * maxR, cy + Math.sin(currentAngle) * maxR);
        ctx.strokeStyle = 'rgba(140, 180, 61, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Blips — brighten when sweep passes over them
        blips.forEach(b => {
            let angleDiff = ((currentAngle - b.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            if (angleDiff < 0.2) {
                b.alpha = 1;
            }
            b.alpha *= 0.985;

            if (b.alpha > 0.02) {
                const bx = cx + Math.cos(b.angle) * (b.dist * maxR);
                const by = cy + Math.sin(b.angle) * (b.dist * maxR);

                // Blip glow
                const blipGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 8);
                blipGrad.addColorStop(0, `rgba(140, 180, 61, ${b.alpha * 0.6})`);
                blipGrad.addColorStop(1, 'rgba(140, 180, 61, 0)');
                ctx.fillStyle = blipGrad;
                ctx.beginPath();
                ctx.arc(bx, by, 8, 0, Math.PI * 2);
                ctx.fill();

                // Blip dot
                ctx.fillStyle = `rgba(160, 210, 70, ${b.alpha * 0.9})`;
                ctx.beginPath();
                ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Center dot
        ctx.fillStyle = 'rgba(140, 180, 61, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Center glow
        const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        centerGlow.addColorStop(0, 'rgba(140, 180, 61, 0.25)');
        centerGlow.addColorStop(1, 'rgba(140, 180, 61, 0)');
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();

        requestAnimationFrame(drawRadar);
    }
    requestAnimationFrame(drawRadar);
}

// ── Contact Form Handler — saves to Firebase Firestore ──
function initFormHandler() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    function showToast(message, isError = false) {
        let toast = document.getElementById('form-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'form-toast';
            toast.style.cssText = `
                position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%) translateY(20px);
                padding: 16px 32px; border-radius: 14px; font-family: var(--font-primary); font-size: 15px;
                font-weight: 600; letter-spacing: 0.02em; z-index: 9999; opacity: 0;
                transition: opacity 0.4s ease, transform 0.4s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.style.background = isError ? 'rgba(220, 60, 60, 0.95)' : 'rgba(140,180,61,0.95)';
        toast.style.color = isError ? '#fff' : '#000';
        toast.style.boxShadow = isError ? '0 8px 30px rgba(220,60,60,0.3)' : '0 8px 30px rgba(140,180,61,0.3)';
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 5000);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.contact-submit');
        const btnText = submitBtn.querySelector('span');
        const originalText = btnText.textContent;

        // Disable button & show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        submitBtn.style.opacity = '0.6';

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        try {
            if (!window.db) {
                showToast('Contact form is unavailable (Firebase not configured).', true);
                return;
            }
            // Save to Firestore 'contacts' collection
            await window.db.collection('contacts').add({
                name: name,
                email: email,
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            showToast('Thank you for contacting us! Our team will get back to you shortly.');
            form.reset();
        } catch (err) {
            console.error('Firebase error:', err);
            showToast('Something went wrong. Please try again later.', true);
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            btnText.textContent = originalText;
            submitBtn.style.opacity = '1';
        }
    });
}

init();
