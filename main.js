/* ============================================================
   UDINYX – main.js
   Shared interactivity across all pages
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. NAVBAR SCROLL SHADOW ---- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ---- 2. MOBILE DRAWER ---- */
  const mobileMenuBtn   = document.getElementById('mobileMenuBtn');
  const mobileCloseBtn  = document.getElementById('mobileCloseBtn');
  const mobileDrawer    = document.getElementById('mobileDrawer');
  const drawerOverlay   = document.getElementById('drawerOverlay');

  function openDrawer() {
    mobileDrawer?.classList.add('open');
    drawerOverlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('drawer-open');
  }
  function closeDrawer() {
    mobileDrawer?.classList.remove('open');
    drawerOverlay?.classList.remove('show');
    document.body.style.overflow = '';
    document.body.classList.remove('drawer-open');
  }

  mobileMenuBtn?.addEventListener('click', openDrawer);
  mobileCloseBtn?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  /* ---- 3. SCROLL-REVEAL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll(
    '.feature-card, .diff-card, .mentor-card, .step-item, .testimonial-card, ' +
    '.diff-visual-card, .verify-info-card, .section-header, .trust-bar'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // staggered delay for grid children
        const siblings = [...entry.target.parentElement.children];
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 60}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- 4. ANIMATED COUNTERS (hero stats) ---- */
  function animateCounter(el, target, suffix = '') {
    const duration = 1400;
    const start = performance.now();
    const isFloat = String(target).includes('.');

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isFloat
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(el => {
          const text = el.textContent.trim();
          const num  = parseFloat(text.replace(/[^0-9.]/g, ''));
          const suffix = text.replace(/[0-9.]/g, '');
          if (!isNaN(num)) animateCounter(el, num, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ---- 5. TRUST METER ANIMATION (verify page) ---- */
  const trustFill = document.querySelector('.trust-meter-fill');
  if (trustFill) {
    const targetWidth = trustFill.style.width;
    trustFill.style.width = '0%';
    const trustObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => { trustFill.style.width = targetWidth; }, 200);
        trustObserver.disconnect();
      }
    }, { threshold: 0.5 });
    trustObserver.observe(trustFill.closest('.trust-meter'));
  }

  /* ---- 6. PERF BARS ANIMATION (verify page) ---- */
  const perfSection = document.querySelector('.result-perf');
  if (perfSection) {
    const fills = perfSection.querySelectorAll('.perf-fill');
    const targets = [];
    let hasInitialValue = false;

    fills.forEach(f => {
      const width = f.style.width || '0%';
      targets.push(width);
      if (width !== '0%' && width !== '') hasInitialValue = true;
      f.style.width = '0%';
    });

    if (hasInitialValue) {
      const perfObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fills.forEach((f, i) => {
            setTimeout(() => { f.style.width = targets[i]; }, 150 * i);
          });
          perfObserver.disconnect();
        }
      }, { threshold: 0.4 });
      perfObserver.observe(perfSection);
    }
  }

  /* ---- 7. SMOOTH INTERNAL LINK SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeDrawer();
        const navH = navbar ? navbar.offsetHeight : 0;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- 8. VERIFY PAGE – GitHub / Download button feedback ---- */
  const githubBtn  = document.getElementById('githubBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  githubBtn?.addEventListener('click', () => {
    githubBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Opened GitHub';
    githubBtn.style.color = 'var(--success)';
    setTimeout(() => {
      githubBtn.innerHTML = '<span class="material-symbols-outlined">code</span> GitHub Project Commits';
      githubBtn.style.color = '';
    }, 2200);
  });

  downloadBtn?.addEventListener('click', () => {
    downloadBtn.innerHTML = '<span class="material-symbols-outlined spin">sync</span> Generating...';
    setTimeout(() => {
      downloadBtn.innerHTML = '<span class="material-symbols-outlined">check</span> Downloaded!';
      setTimeout(() => {
        downloadBtn.innerHTML = '<span class="material-symbols-outlined">download</span> Download PDF';
      }, 2000);
    }, 1200);
  });

  /* ---- 9. ACTIVE NAV-LINK HIGHLIGHT ON SCROLL (landing page) ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ---- 10. HERO FLOATING CARD PARALLAX ---- */
  const floatCards = document.querySelectorAll('.hero-float-card');
  if (floatCards.length) {
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      floatCards.forEach((card, i) => {
        const factor = (i + 1) * 8;
        const sign   = i % 2 === 0 ? 1 : -1;
        card.style.transform = `translate(${dx * factor * sign}px, ${dy * factor * sign}px)`;
      });
    }, { passive: true });
  }

  /* ---- 11. DIFF CARD SELECTION ---- */
  const diffCards = document.querySelectorAll('.diff-card');
  diffCards.forEach(card => {
    card.addEventListener('click', () => {
      diffCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  console.log('%cUdinyx ✓ Ready', 'color:#DC143C;font-weight:800;font-size:16px');
});
