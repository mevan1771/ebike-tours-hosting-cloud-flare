// Main JS for navigation and small UI behaviors
(function () {
  const header = document.getElementById('siteHeader') || document.querySelector('header');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const mobileNav = document.getElementById('mobileNav');

  // Mobile menu
  const openMenu = () => mobileNav && (mobileNav.style.transform = 'translateX(0)');
  const closeMenu = () => mobileNav && (mobileNav.style.transform = 'translateX(100%)');
  menuToggle && menuToggle.addEventListener('click', openMenu);
  menuClose && menuClose.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-link').forEach((el) => el.addEventListener('click', closeMenu));

  // Header scroll effect
  const toggleHeader = () => {
    if (!header) return;
    const scrolled = window.scrollY > 10;
    header.classList.toggle('nav-scrolled', scrolled);
  };
  window.addEventListener('scroll', toggleHeader);
  toggleHeader();

  // Smooth scroll with offset for same-page anchors
  const getHeaderHeight = () => (header ? header.getBoundingClientRect().height : 0);
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - 8;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', targetId);
      }
    });
  });

  // Active nav link highlight based on pathname
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((a) => {
    const isActive = (a.getAttribute('href') || '') === path;
    if (isActive) {
      a.classList.add('text-emerald');
    } else {
      a.classList.add('text-white/90', 'hover:text-white');
    }
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach((el) => {
    el.classList.add('opacity-0', 'translate-y-6', 'transition', 'duration-700');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-6');
        entry.target.classList.add('opacity-100', 'translate-y-0');
        // fade in any nested reveal image
        const revealImg = entry.target.querySelector('[data-reveal-img]');
        if (revealImg) {
          setTimeout(() => {
            revealImg.classList.remove('opacity-0');
            revealImg.classList.add('opacity-100');
          }, 120);
        }
        // Staggered children
        if (entry.target.hasAttribute('data-stagger')) {
          const items = entry.target.querySelectorAll('[data-stagger-item]');
          items.forEach((it, idx) => {
            setTimeout(() => {
              it.classList.remove('opacity-0', 'translate-y-4');
              it.classList.add('opacity-100', 'translate-y-0');
              const line = it.querySelector('[data-hero-line]');
              if (line) {
                // animate vertical line growth
                setTimeout(() => {
                  line.classList.remove('scale-y-0');
                  line.classList.add('scale-y-100');
                }, 100);
              }
            }, 120 * idx);
          });
        }
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));

  // Filters (tours page)
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('bg-emerald');
      pill.classList.toggle('text-white');
    });
  });
  const priceVal = document.getElementById('priceVal');
  const priceRange = document.querySelector('input[type="range"]');
  if (priceVal && priceRange) {
    const sync = () => (priceVal.textContent = priceRange.value);
    priceRange.addEventListener('input', sync);
    sync();
  }

  // FAQ native <details> already works; ensure only one open if desired
  document.querySelectorAll('[data-accordion]').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        document.querySelectorAll('[data-accordion]').forEach((d) => {
          if (d !== details) d.open = false;
        });
      }
    });
  });

  // Multi-step form (book page)
  function setStep(step) {
    const steps = ['step1','step2','step3'];
    steps.forEach((id, idx) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('hidden', idx !== step - 1);
    });
    const b = document.getElementById('stepB');
    const c = document.getElementById('stepC');
    if (b) b.className = 'h-2 rounded-full ' + (step >= 2 ? 'bg-emerald' : 'bg-gray-200');
    if (c) c.className = 'h-2 rounded-full ' + (step >= 3 ? 'bg-emerald' : 'bg-gray-200');
  }
  document.querySelectorAll('.next-step').forEach((btn) => btn.addEventListener('click', () => setStep(Number(btn.dataset.next || '2'))));
  document.querySelectorAll('.prev-step').forEach((btn) => btn.addEventListener('click', () => setStep(Number(btn.dataset.prev || '1'))));

  // Footer year
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // Intercept Formspree submit to avoid redirect; show success and clear fields
  const tailorForm = document.getElementById('tailorForm');
  if (tailorForm) {
    // Interests selector logic
    const interestPills = document.querySelectorAll('.interest-pill');
    const interestsHidden = document.getElementById('tmInterests');
    const selected = new Set();
    interestPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const val = pill.getAttribute('data-interest') || pill.textContent.trim();
        const img = pill.querySelector('.interest-img');
        const label = pill.querySelector('.interest-label');
        const isActive = selected.has(val);
        if (isActive) {
          selected.delete(val);
          pill.setAttribute('aria-pressed', 'false');
          pill.classList.remove('text-emerald');
          pill.classList.add('text-white/90');
          if (img) img.style.transform = 'scale(1)';
          if (label) label.style.color = '';
        } else {
          selected.add(val);
          pill.setAttribute('aria-pressed', 'true');
          pill.classList.add('text-emerald');
          pill.classList.remove('text-white/90');
          if (img) img.style.transform = 'scale(1.08)';
          if (label) label.style.color = '#5FEC00';
        }
        if (interestsHidden) interestsHidden.value = Array.from(selected).join(', ');
      });
    });

    tailorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const status = document.getElementById('tmStatus');
      const submitBtn = form.querySelector('button[type="submit"]');
      const nameInput = document.getElementById('tmName');
      const subjectInput = form.querySelector('input[name="_subject"]');
      const nameVal = nameInput && nameInput.value ? nameInput.value.trim() : '';
      if (subjectInput && nameVal) {
        subjectInput.value = `Tailor‑made tour request from ${nameVal}`;
      }
      try {
        submitBtn && (submitBtn.disabled = true);
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = 'Thanks! Your request was sent.';
            status.classList.remove('text-white/80');
            status.classList.add('text-[#5FEC00]');
          }
        } else {
          if (status) status.textContent = 'Something went wrong. Please try again.';
        }
      } catch (err) {
        if (status) status.textContent = 'Network error. Please try again.';
      } finally {
        submitBtn && (submitBtn.disabled = false);
      }
    });
  }

  // Grand Tour secure form (Formspree async submit)
  const secureForm = document.getElementById('secureForm');
  if (secureForm) {
    secureForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const status = document.getElementById('secureStatus');
      const submitBtn = form.querySelector('button[type="submit"]');
      try {
        submitBtn && (submitBtn.disabled = true);
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: form.method || 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = 'Thanks! We received your interest.';
            status.classList.remove('text-white/80');
            status.classList.add('text-[#5FEC00]');
          }
        } else {
          if (status) status.textContent = 'Something went wrong. Please try again.';
        }
      } catch (_) {
        if (status) status.textContent = 'Network error. Please try again.';
      } finally {
        submitBtn && (submitBtn.disabled = false);
      }
    });
  }

  // Lazy-load iframes with data-src when they enter viewport
  const lazyIframes = document.querySelectorAll('iframe[data-src]');
  if (lazyIframes.length) {
    const iframeObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const ifr = entry.target;
          const src = ifr.getAttribute('data-src');
          if (src && !ifr.getAttribute('src')) {
            ifr.setAttribute('src', src);
          }
          obs.unobserve(ifr);
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    lazyIframes.forEach((ifr) => iframeObserver.observe(ifr));
  }

  // Simple tabs
  document.querySelectorAll('[data-tabs]').forEach((tabsRoot) => {
    const tabButtons = tabsRoot.querySelectorAll('[data-tab]');
    const panels = tabsRoot.querySelectorAll('[data-tab-panel]');
    function activateTab(name) {
      panels.forEach((p) => {
        const isActive = p.getAttribute('data-tab-panel') === name;
        p.classList.toggle('hidden', !isActive);
      });
      tabButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-tab') === name;
        if (isActive) {
          btn.classList.add('tab-active-green');
          btn.classList.remove('bg-gray-50', 'bg-white', 'text-gunmetal', 'border-gray-200');
        } else {
          btn.classList.add('bg-gray-50', 'text-gunmetal', 'border-gray-200');
          btn.classList.remove('tab-active-green');
          btn.classList.remove('bg-white');
        }
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      // Lazy init iframes inside active panel
      const ifr = tabsRoot.querySelector(`[data-tab-panel="${name}"] iframe[data-src]`);
      if (ifr && !ifr.getAttribute('src')) {
        ifr.setAttribute('src', ifr.getAttribute('data-src'));
      }
    }
    tabButtons.forEach((btn) => btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab') || '')));
    // Activate first tab by default
    const first = tabButtons[0];
    if (first) activateTab(first.getAttribute('data-tab') || '');
  });

  // Accordion (only one open at a time)
  document.querySelectorAll('[data-accordion-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-accordion-item]');
    function closeAll(except) {
      items.forEach((it) => {
        if (it !== except) {
          const body = it.querySelector('[data-acc-body]');
          const icon = it.querySelector('[data-acc-icon]');
          if (body) body.style.maxHeight = '0px';
          if (icon) icon.style.transform = 'rotate(0deg)';
        }
      });
    }
    items.forEach((it) => {
      const btn = it.querySelector('[data-acc-btn]');
      const body = it.querySelector('[data-acc-body]');
      const icon = it.querySelector('[data-acc-icon]');
      if (!btn || !body) return;
      btn.addEventListener('click', () => {
        const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
        closeAll(isOpen ? null : it);
        if (isOpen) {
          body.style.maxHeight = '0px';
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          body.style.maxHeight = body.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(90deg)';
        }
      });
    });
  });

  // Countdown (grand tour page)
  const countdownEls = document.querySelectorAll('[data-countdown]');
  if (countdownEls.length) {
    const update = () => {
      countdownEls.forEach((el) => {
        const dateStr = el.getAttribute('data-countdown-date');
        if (!dateStr) return;
        const target = new Date(dateStr).getTime();
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) {
          el.textContent = 'Starts now';
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        el.textContent = `${days} days, ${hours} hrs`;
      });
    };
    update();
    setInterval(update, 60 * 1000);
  }

  // Animate capacity bar in hero
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fills = document.querySelectorAll('.progress-fill[data-progress]');
  if (fills.length) {
    fills.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-progress') || '0');
      if (!prefersReduced) {
        requestAnimationFrame(() => {
          el.style.width = `${Math.max(0, Math.min(1, target)) * 100}%`;
        });
      } else {
        el.style.width = `${Math.max(0, Math.min(1, target)) * 100}%`;
      }
    });
  }

  // Currency selection and price conversion
  const currencySelect = document.getElementById('currencySelect');
  const currencySelectMobile = document.getElementById('currencySelectMobile');

  const formatters = {
    USD: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    EUR: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
    GBP: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }),
    BTC: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'BTC', maximumFractionDigits: 8 })
  };
  // Static rates; can be replaced with live API later
  const rates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.78,
    // approximate BTC price: 1 BTC ≈ 65000 USD → 1 USD ≈ 1/65000 BTC
    BTC: 1 / 65000
  };
  function getCurrency() {
    return localStorage.getItem('currency') || 'USD';
  }
  function setCurrency(cur) {
    localStorage.setItem('currency', cur);
    if (currencySelect) currencySelect.value = cur;
    if (currencySelectMobile) currencySelectMobile.value = cur;
  }
  function updatePrices() {
    const cur = getCurrency();
    const rate = rates[cur] || 1;
    const fmt = formatters[cur] || formatters.USD;
    document.querySelectorAll('.price[data-price-usd]').forEach((el) => {
      const usd = parseFloat(el.getAttribute('data-price-usd') || '0');
      const conv = usd * rate;
      if (cur === 'BTC') {
        // Show up to 6 decimals for BTC but trim trailing zeros
        el.textContent = `${fmt.format(conv).replace(/\u00A4/, '₿')}`;
      } else {
        el.textContent = fmt.format(conv);
      }
    });
  }
  const initCurrency = () => {
    setCurrency(getCurrency());
    updatePrices();
  };
  currencySelect && currencySelect.addEventListener('change', (e) => {
    setCurrency(e.target.value);
    updatePrices();
  });
  currencySelectMobile && currencySelectMobile.addEventListener('change', (e) => {
    setCurrency(e.target.value);
    updatePrices();
  });
  initCurrency();

  // E‑Bike hero simple crossfade slideshow in the Rent a bike section
  try {
    const ebikePanel = document.querySelector('[data-tab-panel="ebike"] .relative');
    if (ebikePanel) {
      const slides = ebikePanel.querySelectorAll('.fade-slide');
      if (slides.length > 1) {
        let i = 0;
        setInterval(() => {
          slides[i].classList.remove('active');
          i = (i + 1) % slides.length;
          slides[i].classList.add('active');
        }, 3500);
      }
    }
  } catch (_e) {}
})(); 