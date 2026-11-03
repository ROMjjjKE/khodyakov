/* Ходяков. Меню, якоря, форма заявки. */
(function () {
  'use strict';

  const PHONE = '+375292483119';
  const WA = '375292483119';

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    burger?.setAttribute('aria-expanded', 'false');
    burger?.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('nav-open');
  }

  burger?.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('nav-open', open);
  });

  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080) closeMenu();
  });

  const onScrollHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // Активная ссылка навигации
  const links = Array.from(document.querySelectorAll('.nav a'));
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Плавные якоря с учётом высоты шапки
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76 - 12;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  // Форма
  const form = document.getElementById('lead-form');
  const success = document.getElementById('form-success');
  const waLink = document.getElementById('wa-link');

  const digits = (v) => (v || '').replace(/\D/g, '').length;

  function setError(field, message) {
    const label = field.closest('.field');
    let node = label?.querySelector('.field__error');
    if (!message) {
      node?.remove();
      field.removeAttribute('aria-invalid');
      return;
    }
    if (!node && label) {
      node = document.createElement('p');
      node.className = 'field__error';
      label.appendChild(node);
    }
    if (node) node.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]');
    const phone = form.querySelector('[name="phone"]');
    const work = form.querySelector('[name="work"]');
    const place = form.querySelector('[name="place"]');
    let ok = true;

    if (!name.value.trim()) { setError(name, 'Как к вам обращаться?'); ok = false; }
    else setError(name, '');

    if (digits(phone.value) < 9) { setError(phone, 'Проверьте номер: нужно не меньше 9 цифр'); ok = false; }
    else setError(phone, '');

    if (!ok) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const text = [
      'Заявка с сайта',
      'Имя: ' + name.value.trim(),
      'Телефон: ' + phone.value.trim(),
      'Работа: ' + (work?.value || ''),
      place.value.trim() ? 'Адрес и объём: ' + place.value.trim() : ''
    ].filter(Boolean).join('\n');

    const url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
    if (waLink) waLink.href = url;
    success?.removeAttribute('hidden');
    form.querySelectorAll('input,textarea,select,button').forEach((el) => { el.disabled = true; });
    try { window.open(url, '_blank', 'noopener'); } catch (err) { /* блокировщик попапов */ }
  });

  // Год в подвале, если понадобится
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
