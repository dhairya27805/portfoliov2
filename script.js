// script.js - Advanced Interactions (Responsive-Ready)
document.addEventListener('DOMContentLoaded', () => {
  // ─── Device Detection ───
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isDesktop     = !isTouchDevice && window.innerWidth >= 768;

  // ═══════════════════════════════════════════════════════════════
  //  MOBILE HAMBURGER MENU
  // ═══════════════════════════════════════════════════════════════
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu   = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.innerHTML = '&#9776;';
        document.body.style.overflow = '';
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  //  RED DOT CURSOR + FLASHLIGHT
  // ═══════════════════════════════════════════════════════════════
  const cursorDot    = document.querySelector('.cursor-dot');
  const aboutSection = document.querySelector('#about');
  const touchHint    = document.querySelector('.flashlight-touch-hint');
  const filledText   = document.querySelector('.filled-text');

  // Writes the flashlight centre (relative to #about) into CSS custom properties
  function setFlashlightPosition(x, y) {
    const root = document.documentElement.style;
    root.setProperty('--mouse-x', `${x}px`);
    root.setProperty('--mouse-y', `${y}px`);
  }

  // Converts viewport coordinates into coordinates relative to #about
  function toSectionCoords(clientX, clientY) {
    const rect = aboutSection.getBoundingClientRect();
    return {
      x: Math.min(Math.max(clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(clientY - rect.top, 0), rect.height)
    };
  }

  // Centres the flashlight in #about (used on load and orientation change)
  function centerFlashlight() {
    if (!aboutSection) return;
    setFlashlightPosition(aboutSection.offsetWidth / 2, aboutSection.offsetHeight / 2);
  }

  if (isDesktop) {
    // ══════════════════════════════════════════════════════════════
    //  DESKTOP: flashlight follows the mouse everywhere
    // ══════════════════════════════════════════════════════════════
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorDot) cursorDot.style.transform = `translate(${mx}px, ${my}px)`;
      if (aboutSection) {
        const p = toSectionCoords(mx, my);
        setFlashlightPosition(p.x, p.y);
      }
    });

    // Hero reveal follows the mouse
    const heroLoop = () => {
      if (filledText) {
        const rect = filledText.getBoundingClientRect();
        filledText.style.clipPath = `circle(150px at ${mx - rect.left}px ${my - rect.top}px)`;
      }
      requestAnimationFrame(heroLoop);
    };
    heroLoop();

  } else {
    // ══════════════════════════════════════════════════════════════
    //  MOBILE / TABLET: touch-drag flashlight
    //  - Finger down: torch snaps to the touch point and the hint fades
    //  - Finger drag: torch follows the finger
    //  - Finger up: torch eases back to the centre so the section
    //    never sits in total darkness
    // ══════════════════════════════════════════════════════════════
    if (filledText) {
      filledText.style.clipPath = 'circle(100% at 50% 50%)';
    }

    centerFlashlight();

    let isTouching  = false;
    let hasInteracted = false;
    let returnTimer = null;

    // Animates the torch back to centre after the finger lifts
    function glideToCentre() {
      if (!aboutSection) return;
      const targetX = aboutSection.offsetWidth / 2;
      const targetY = aboutSection.offsetHeight / 2;
      const start = performance.now();
      const duration = 600;
      const from = {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mouse-x')) || targetX,
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mouse-y')) || targetY
      };

      function step(now) {
        if (isTouching) return; // Stop if the user touched again
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setFlashlightPosition(
          from.x + (targetX - from.x) * ease,
          from.y + (targetY - from.y) * ease
        );
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (aboutSection) {
      aboutSection.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        isTouching = true;
        clearTimeout(returnTimer);

        if (!hasInteracted && touchHint) {
          hasInteracted = true;
          touchHint.style.transition = 'opacity 0.6s ease';
          touchHint.style.opacity = '0';
          setTimeout(() => { touchHint.style.display = 'none'; }, 600);
        }

        const p = toSectionCoords(e.clientX, e.clientY);
        setFlashlightPosition(p.x, p.y);
      }, { passive: true });

      aboutSection.addEventListener('pointermove', e => {
        if (!isTouching || e.pointerType === 'mouse') return;
        const p = toSectionCoords(e.clientX, e.clientY);
        setFlashlightPosition(p.x, p.y);
      }, { passive: true });

      const endTouch = e => {
        if (e.pointerType === 'mouse') return;
        isTouching = false;
        // Hold the beam where the finger lifted, then ease back to centre
        returnTimer = setTimeout(glideToCentre, 1500);
      };
      aboutSection.addEventListener('pointerup', endTouch, { passive: true });
      aboutSection.addEventListener('pointercancel', endTouch, { passive: true });
    }

    const recenterOnChange = () => {
      if (!isTouching) centerFlashlight();
    };
    window.addEventListener('orientationchange', () => setTimeout(recenterOnChange, 200), { passive: true });
    window.addEventListener('resize', recenterOnChange, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════
  //  GOOEY NAV BLOB (Desktop Only)
  // ═══════════════════════════════════════════════════════════════
  const navLinks = document.querySelectorAll('.nav-item');
  const blob     = document.querySelector('.nav-blob');

  if (isDesktop && blob) {
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', e => {
        const rect       = e.target.getBoundingClientRect();
        const parentRect = e.target.parentElement.getBoundingClientRect();
        blob.style.transform = `translateX(${rect.left - parentRect.left - 10}px)`;
        blob.style.width     = `${rect.width + 20}px`;
      });
    });

    const navContainer = document.querySelector('.nav-links');
    if (navContainer) {
      navContainer.addEventListener('mouseleave', () => {
        blob.style.width = '0px';
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  SCROLL SPY: highlight the nav link for the section in view
  // ═══════════════════════════════════════════════════════════════
  const navAnchors  = document.querySelectorAll('.nav-links .nav-item');
  const spySections = Array.from(navAnchors)
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  function updateActiveNav() {
    const marker = window.innerHeight * 0.35;
    let current = null;
    spySections.forEach(sec => {
      if (sec.getBoundingClientRect().top <= marker) current = sec.id;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom && spySections.length) current = spySections[spySections.length - 1].id;

    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });
  updateActiveNav();

  // ═══════════════════════════════════════════════════════════════
  //  TEXT SCRAMBLE EFFECT
  // ═══════════════════════════════════════════════════════════════
  class Scrambler {
    constructor(el) {
      this.el    = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#_';
      this.originalText = el.getAttribute('data-text') || el.innerText;
    }
    scramble() {
      let iteration = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.el.innerText = this.originalText.split('').map((char, index) => {
          if (index < iteration) return char;
          return this.chars[Math.floor(Math.random() * this.chars.length)];
        }).join('');
        if (iteration >= this.originalText.length) clearInterval(this.interval);
        iteration += 1 / 3;
      }, 30);
    }
  }

  const scrambleEls = document.querySelectorAll('.scramble');
  const scramblers  = Array.from(scrambleEls).map(el => new Scrambler(el));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(scrambleEls).indexOf(entry.target);
        if (scramblers[index]) scramblers[index].scramble();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  scrambleEls.forEach(el => observer.observe(el));

  // ═══════════════════════════════════════════════════════════════
  //  STICKY STACKING PROJECTS SCALING (Desktop Only)
  // ═══════════════════════════════════════════════════════════════
  const stickyPanels = document.querySelectorAll('.sticky-panel');

  if (isDesktop) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        stickyPanels.forEach(panel => {
          const rect  = panel.getBoundingClientRect();
          const inner = panel.querySelector('.project-panel');
          if (!inner) return;

          if (rect.top <= window.innerHeight * 0.15) {
            const scrollPast = (window.innerHeight * 0.15) - rect.top;
            const scale   = Math.max(0.9, 1 - scrollPast * 0.0005);
            const opacity = Math.max(0.5, 1 - scrollPast * 0.001);
            inner.style.transform = `scale(${scale})`;
            inner.style.opacity   = opacity;
          } else {
            inner.style.transform = 'scale(1)';
            inner.style.opacity   = 1;
          }
        });
        ticking = false;
      });
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════
  //  CANVAS VISUALS
  // ═══════════════════════════════════════════════════════════════
  const vizCanvases = document.querySelectorAll('.viz-canvas');
  vizCanvases.forEach(canvas => {
    const ctx    = canvas.getContext('2d');
    const resize = () => {
      canvas.width  = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    let time      = 0;
    let lastFrame = 0;
    const frameInterval = isTouchDevice ? 50 : 16;

    function draw(timestamp) {
      if (timestamp - lastFrame >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#DA1A35';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i += 10) {
          const y = canvas.height / 2 + Math.sin(i * 0.01 + time) * 50;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
        time += 0.05;
        lastFrame = timestamp;
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  });

  // ═══════════════════════════════════════════════════════════════
  //  COPY EMAIL
  // ═══════════════════════════════════════════════════════════════
  const copyBtn = document.getElementById('copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('ddhairyadesai@gmail.com').then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy Email', 2000);
      });
    });
  }
});