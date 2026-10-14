/* LUMINA shared site behaviour */
(function () {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
  const header = $('.header');
  document.documentElement.classList.add('js-enabled');

  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const burger = $('.header__burger');
  const nav = $('.nav');
  if (burger && nav) {
    const toggleNav = (open) => {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-locked', open);
    };
    burger.addEventListener('click', () => toggleNav(!nav.classList.contains('is-open')));
    $$('.nav a, .nav button').forEach((item) => item.addEventListener('click', () => toggleNav(false)));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toggleNav(false);
    });
  }

  $$('a[href^="#"]').forEach((link) => {
    const hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;
    link.addEventListener('click', (event) => {
      const target = $(hash);
      if (!target) return;
      event.preventDefault();
      const offset = (header ? header.offsetHeight : 0) + 12;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const today = new Date();
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayString = formatDate(today);
  $$('[data-min-today]').forEach((input) => { input.min = todayString; });

  const arrival = $('#stay-arrival');
  const departure = $('#stay-departure');
  if (arrival && departure) {
    const updateDepartureMin = () => {
      const minimum = arrival.value
        ? new Date(`${arrival.value}T00:00:00`)
        : new Date(`${todayString}T00:00:00`);
      minimum.setDate(minimum.getDate() + 1);
      departure.min = formatDate(minimum);
      if (departure.value && departure.value < departure.min) departure.value = '';
    };
    arrival.addEventListener('change', updateDepartureMin);
    updateDepartureMin();
  }

  const bookingTabs = $$('[data-booking-tab]');
  const bookingForms = $$('[data-booking-form]');
  const activateBookingType = (type) => {
    bookingTabs.forEach((tab) => {
      const active = tab.dataset.bookingTab === type;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
    });
    bookingForms.forEach((form) => { form.hidden = form.dataset.bookingForm !== type; });
  };
  bookingTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateBookingType(tab.dataset.bookingTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? bookingTabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + bookingTabs.length) % bookingTabs.length;
      bookingTabs[nextIndex].focus();
      activateBookingType(bookingTabs[nextIndex].dataset.bookingTab);
    });
  });

  if (bookingTabs.length) {
    const query = new URLSearchParams(window.location.search);
    const initialType = query.get('type') === 'stay' || window.location.hash === '#stay-booking' ? 'stay' : 'table';
    activateBookingType(initialType);
    const requestedRoom = query.get('room');
    const roomNames = { classic: 'Classic Room', deluxe: 'Deluxe Room', suite: 'LUMINA Suite' };
    const roomSelect = $('#stay-room');
    if (roomSelect && roomNames[requestedRoom]) roomSelect.value = roomNames[requestedRoom];
    if (initialType === 'stay' && window.location.hash === '#stay-booking') {
      window.setTimeout(() => $('#stay-booking').scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }

  const lightbox = $('#lightbox');
  if (lightbox) {
    const image = $('.lightbox__img', lightbox);
    const caption = $('.lightbox__caption', lightbox);
    const closeButton = $('.lightbox__close', lightbox);
    const previousButton = $('.lightbox__prev', lightbox);
    const nextButton = $('.lightbox__next', lightbox);
    let items = [];
    let activeIndex = 0;

    const showImage = (index) => {
      const source = items[index]?.querySelector('img');
      if (!source) return;
      activeIndex = index;
      image.src = source.src;
      image.alt = source.alt || '';
      caption.textContent = source.alt || '';
      lightbox.classList.add('is-open');
      document.body.classList.add('nav-locked');
      closeButton.focus();
    };
    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('nav-locked');
    };
    const moveImage = (direction) => {
      if (!items.length) return;
      showImage((activeIndex + direction + items.length) % items.length);
    };

    $$('[data-lightbox] .ambiance__item').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const group = item.closest('[data-lightbox]');
        items = $$('.ambiance__item', group).filter((entry) => !entry.hidden);
        showImage(items.indexOf(item));
      });
    });
    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', () => moveImage(-1));
    nextButton.addEventListener('click', () => moveImage(1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    window.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') moveImage(-1);
      if (event.key === 'ArrowRight') moveImage(1);
    });
  }

  const setStatus = (status, kind, message) => {
    status.className = `form__status form__status--${kind} is-visible`;
    status.textContent = message;
  };

  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const configureForm = (form, endpoint, validators) => {
    if (!form) return;
    const status = $('.form__status', form) || $('.form__status', form.parentElement);
    const submit = $('[type="submit"]', form);
    if (!status || !submit) return;

    const validate = () => {
      let valid = true;
      Object.entries(validators).forEach(([name, test]) => {
        const input = form.elements.namedItem(name);
        if (!input) return;
        const field = input.closest('.form__field');
        const fieldIsValid = test(input.value.trim());
        if (field) field.classList.toggle('is-invalid', !fieldIsValid);
        valid = fieldIsValid && valid;
      });
      return valid;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.classList.remove('is-visible');
      if (!validate()) {
        setStatus(status, 'error', 'Please review the highlighted fields.');
        return;
      }

      const originalLabel = submit.textContent;
      submit.disabled = true;
      submit.classList.add('is-loading');
      submit.textContent = 'Sending…';
      try {
        const payload = Object.fromEntries(new FormData(form).entries());
        if (form.id === 'newsletter-form') {
          payload.email = $('#newsletter-email', form).value.trim();
          payload.subject = 'Newsletter subscription';
          payload.message = 'Subscribed to the LUMINA newsletter.';
        }
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'We could not submit your request. Please try again.');
        }

        const ref = result.bookingId ? ` Reference: ${String(result.bookingId).slice(-6).toUpperCase()}.` : '';
        const message = form.id === 'table-booking'
          ? `Your table request has been received. Our team will contact you to confirm.${ref}`
          : form.id === 'stay-booking'
            ? `Your stay request has been received. We’ll contact you to confirm availability and rates.${ref}`
            : result.message || 'Thank you. We have received your message.';
        setStatus(status, 'ok', message);
        form.reset();
        updateDepartureMin();
      } catch (error) {
        console.error('Form submission error:', error);
        setStatus(status, 'error', error.message || 'Network error. Please try again.');
      } finally {
        submit.disabled = false;
        submit.classList.remove('is-loading');
        submit.textContent = originalLabel;
      }
    });

    form.addEventListener('input', (event) => {
      const field = event.target.closest('.form__field');
      if (field?.classList.contains('is-invalid')) validate();
    });
    form.addEventListener('change', (event) => {
      const field = event.target.closest('.form__field');
      if (field?.classList.contains('is-invalid')) validate();
    });
  };

  const nameIsValid = (value) => value.length >= 2 && value.length <= 100;
  const phoneIsValid = (value) => /^[+\d][\d\s().-]{6,24}$/.test(value);
  const required = (value) => value.length > 0;
  const isCurrentOrLaterDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= todayString;
  const guestCount = (minimum, maximum) => (value) => {
    const count = Number(value);
    return Number.isInteger(count) && count >= minimum && count <= maximum;
  };

  const tableDate = $('#table-date');
  const tableTime = $('#table-time');
  const tableDateValid = (value) => {
    if (!isCurrentOrLaterDate(value)) return false;
    if (value !== todayString) return true;
    const [hours, minutes] = (tableTime?.value || '00:00').split(':').map(Number);
    return hours * 60 + minutes > today.getHours() * 60 + today.getMinutes();
  };

  configureForm($('#table-booking'), '/api/reservations', {
    name: nameIsValid,
    email: validEmail,
    phone: phoneIsValid,
    guests: guestCount(1, 8),
    date: tableDateValid,
    time: required,
    seatingPreference: required,
  });
  configureForm($('#stay-booking'), '/api/stays', {
    name: nameIsValid,
    email: validEmail,
    phone: phoneIsValid,
    roomType: required,
    checkIn: isCurrentOrLaterDate,
    checkOut: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !!arrival?.value && value > arrival.value,
    guests: guestCount(1, 6),
    rooms: guestCount(1, 5),
  });
  configureForm($('#contact-form'), '/api/contact', {
    name: nameIsValid,
    email: validEmail,
    subject: (value) => value.trim().length >= 3,
    message: (value) => value.trim().length >= 10,
  });
  configureForm($('#newsletter-form'), '/api/contact', {
    email: validEmail,
  });

  const toTop = $('.to-top');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    }));
  }

  const placeholder = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#202d28"/><text x="600" y="420" font-family="sans-serif" font-size="44" letter-spacing="8" fill="#d0ad78" text-anchor="middle">LUMINA</text></svg>'
  );
  document.addEventListener('error', (event) => {
    if (event.target.tagName !== 'IMG' || event.target.dataset.fallback) return;
    event.target.dataset.fallback = '1';
    event.target.src = placeholder;
  }, true);

  $$('.js-year').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
})();
