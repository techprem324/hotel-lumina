/* ============================================================
   LUMINA — shared site behaviour
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Sticky header ---------- */
  const header = $('.header');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const burger = $('.header__burger');
  const nav = $('.nav');
  if (burger && nav) {
    const toggleNav = (open) => {
      burger.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-locked', open);
    };
    burger.addEventListener('click', () => toggleNav(!nav.classList.contains('is-open')));
    $$('.nav a, .nav button').forEach((el) => el.addEventListener('click', () => toggleNav(false)));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleNav(false);
    });
  }

  /* ---------- Smooth anchor scrolling with header offset ---------- */
  $$('a[href^="#"]').forEach((link) => {
    const hash = link.getAttribute('href');
    if (hash.length < 2) return; // bare "#" links (social icons, lightbox anchors)
    link.addEventListener('click', (e) => {
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Hero slider ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide', hero);
    const dots = $$('.hero__dot', hero);
    let index = 0;
    let timer;

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === index));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === index));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5000);
    };

    dots.forEach((d, i) => d.addEventListener('click', () => {
      show(i);
      play();
    }));

    show(0);
    play();
  }

  /* ---------- Testimonial carousel ---------- */
  const testi = $('.testi');
  if (testi) {
    const slides = $$('.testi__slide', testi);
    let index = 0;
    let timer;

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('is-active', j === index));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 6000);
    };

    const prev = $('.testi__btn--prev', testi);
    const next = $('.testi__btn--next', testi);
    prev && prev.addEventListener('click', () => { show(index - 1); play(); });
    next && next.addEventListener('click', () => { show(index + 1); play(); });

    testi.addEventListener('mouseenter', () => clearInterval(timer));
    testi.addEventListener('mouseleave', play);

    show(0);
    play();
  }

  /* ---------- Back to top ---------- */
  const toTop = $('.to-top');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Favourite toggles ---------- */
  $$('.card-dish__fav').forEach((btn) => {
    btn.addEventListener('click', () => btn.classList.toggle('is-fav'));
  });

  /* ---------- Lightbox ---------- */
  const lightbox = $('#lightbox');
  if (lightbox) {
    const img = $('.lightbox__img', lightbox);
    const caption = $('.lightbox__caption', lightbox);
    const close = $('.lightbox__close', lightbox);
    const prev = $('.lightbox__prev', lightbox);
    const next = $('.lightbox__next', lightbox);
    let items = [];
    let index = 0;

    const open = (i) => {
      const item = items[i];
      if (!item) return;
      const source = item.querySelector('img');
      img.src = source.src;
      img.alt = source.alt || '';
      caption.textContent = img.alt || '';
      lightbox.classList.add('is-open');
      document.body.classList.add('nav-locked');
    };

    const closeBox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('nav-locked');
    };

    const step = (dir) => {
      index = (index + dir + items.length) % items.length;
      open(index);
    };

    // Collect the visible items in the clicked group each time, so filtered
    // galleries and the homepage both navigate correctly.
    $$('[data-lightbox] .ambiance__item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const group = item.closest('[data-lightbox]');
        items = $$('.ambiance__item', group).filter((it) => !it.hidden);
        index = items.indexOf(item);
        open(index);
      });
    });

    close.addEventListener('click', closeBox);
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeBox();
    });
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeBox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Image fallback ---------- */
  const PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#121b28"/><stop offset="1" stop-color="#2c2c2c"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="420" font-family="sans-serif" font-size="44" font-weight="bold" letter-spacing="8" fill="#ff7b00" text-anchor="middle">LUMINA</text></svg>`
    );

  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
      e.target.dataset.fallback = '1';
      e.target.src = PLACEHOLDER;
    }
  }, true);

  /* ---------- Forms ---------- */
  const handleForm = (form, fields) => {
    if (!form) return;
    // The status line lives inside the form, except the footer newsletter where
    // it sits next to it in the same wrapper.
    const status = $('.form__status', form) || $('.form__status', form.parentElement);
    if (!status) return;
    const submit = $('[type="submit"]', form);

    const validate = () => {
      let valid = true;
      fields.forEach(([input, test]) => {
        const ok = test(input.value.trim());
        const field = input.closest('.form__field');
        if (field) field.classList.toggle('is-invalid', !ok);
        valid = valid && ok;
      });
      return valid;
    };

    const setStatus = (kind, msg) => {
      status.className = `form__status form__status--${kind} is-visible`;
      status.innerHTML = `<span class="spinner"></span>${msg}`;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) {
        setStatus('error', 'Please review the highlighted fields.');
        setTimeout(() => status.classList.remove('is-visible'), 4000);
        return;
      }

      const sending = submit.cloneNode(true);
      sending.disabled = true;
      sending.classList.add('is-loading');
      sending.innerHTML = '<span class="spinner"></span>Sending…';
      submit.replaceWith(sending);

      let endpoint = '/api/contact';
      let payload = {};

      if (form.id === 'reserve-form') {
        endpoint = '/api/reservations';
        payload = {
          name: $('#reserve-name', form)?.value || '',
          email: $('#reserve-email', form)?.value || '',
          phone: $('#reserve-phone', form)?.value || '',
          guests: $('#reserve-guests', form)?.value || '',
          date: $('#reserve-date', form)?.value || '',
          time: $('#reserve-time', form)?.value || '',
          requests: $('#reserve-requests', form)?.value || ''
        };
      } else if (form.id === 'contact-form') {
        endpoint = '/api/contact';
        payload = {
          name: $('#contact-name', form)?.value || '',
          email: $('#contact-email', form)?.value || '',
          phone: $('#contact-phone', form)?.value || '',
          subject: $('#contact-subject', form)?.value || '',
          message: $('#contact-message', form)?.value || ''
        };
      } else {
        endpoint = '/api/contact';
        payload = {
          email: $('#newsletter-email', form)?.value || '',
          subject: 'Newsletter Subscription',
          message: 'Subscribed to monthly Lumina newsletter'
        };
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((res) => {
          sending.replaceWith(submit);
          if (res.success) {
            const msg = form.id === 'reserve-form'
              ? `🎉 Reservation Confirmed! Stored securely in MongoDB. Booking Ref: #${res.bookingId ? res.bookingId.slice(-6).toUpperCase() : 'LUMINA'}`
              : (res.message || 'Thank you — we have received your request.');
            setStatus('ok', msg);
            form.reset();
            setTimeout(() => status.classList.remove('is-visible'), 10000);
          } else {
            setStatus('error', res.error || 'Failed to submit. Please try again.');
          }
        })
        .catch((err) => {
          console.error('Form submission error:', err);
          sending.replaceWith(submit);
          setStatus('error', 'Network error. Unable to reach database server.');
        });
    });

    form.addEventListener('input', (e) => {
      const field = e.target.closest('.form__field');
      if (field && field.classList.contains('is-invalid')) validate();
    });
  };

  handleForm($('#reserve-form'), [
    [$('#reserve-name'), (v) => v.length >= 2],
    [$('#reserve-email'), (v) => /.+@.+\..+/.test(v)],
    [$('#reserve-phone'), (v) => v.length >= 7],
    [$('#reserve-date'), (v) => !!v],
    [$('#reserve-time'), (v) => !!v],
    [$('#reserve-guests'), (v) => parseInt(v, 10) > 0],
  ]);

  handleForm($('#contact-form'), [
    [$('#contact-name'), (v) => v.length >= 2],
    [$('#contact-email'), (v) => /.+@.+\..+/.test(v)],
    [$('#contact-subject'), (v) => v.length >= 3],
    [$('#contact-message'), (v) => v.length >= 10],
  ]);

  handleForm($('#newsletter-form'), [
    [$('#newsletter-email'), (v) => /.+@.+\..+/.test(v)],
  ]);

  /* ---------- Global Image Error Fallback Handler ---------- */
  const fallbackGourmetImage = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80';
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG' && !e.target.dataset.fallbackApplied) {
      e.target.dataset.fallbackApplied = 'true';
      e.target.src = fallbackGourmetImage;
    }
  }, true);

  /* ---------- Footer year ---------- */
  $$('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();

