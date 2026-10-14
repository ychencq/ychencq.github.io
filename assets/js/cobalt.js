(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle?.querySelector('.fas');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const storageKey = 'yc-cobalt-theme';

  const setTheme = (theme) => {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    themeToggle?.setAttribute('aria-pressed', String(dark));
    themeToggle?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeIcon?.classList.toggle('icon-sun', dark);
    themeIcon?.classList.toggle('icon-moon', !dark);
    themeColor?.setAttribute('content', dark ? '#131821' : '#002fa7');
  };

  setTheme(root.dataset.theme);
  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Theme still works without storage. */ }
  });

  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.nav-links');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = navLinks.map((link) => ({
    link,
    section: document.querySelector(link.getAttribute('href')),
  })).filter(({ section }) => section);

  const syncNavigation = () => {
    const marker = (header?.getBoundingClientRect().height || 78) + 60;
    let active = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= marker) active = item.link;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      active = navLinks.at(-1) || active;
    }
    for (const link of navLinks) {
      if (link === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    nav?.classList.toggle('indicator-active', Boolean(active));
    if (nav && active) {
      nav.style.setProperty('--indicator-x', `${active.offsetLeft}px`);
      nav.style.setProperty('--indicator-width', `${active.offsetWidth}px`);
    }
  };

  let pendingFrame = null;
  const scheduleNavigation = () => {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      syncNavigation();
      pendingFrame = null;
    });
  };
  window.addEventListener('scroll', scheduleNavigation, { passive: true });
  window.addEventListener('resize', scheduleNavigation);
  window.addEventListener('hashchange', scheduleNavigation);
  window.addEventListener('load', scheduleNavigation);
  document.fonts?.ready.then(scheduleNavigation);
  if ('ResizeObserver' in window && nav) new ResizeObserver(scheduleNavigation).observe(nav);
  syncNavigation();

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  const dialog = document.querySelector('.image-lightbox');
  const image = dialog?.querySelector('.lightbox-image');
  const caption = dialog?.querySelector('.lightbox-caption');
  const close = dialog?.querySelector('.lightbox-close');
  let trigger = null;

  document.querySelectorAll('.publication-visual[data-full-image]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || !image || !caption) return;
      const preview = button.querySelector('img');
      const title = button.closest('.publication-card')?.querySelector('h3')?.textContent.trim() || '';
      const source = button.dataset.fullImage || preview?.src;
      if (!source) return;
      if (typeof dialog.showModal !== 'function') {
        window.open(source, '_blank', 'noopener,noreferrer');
        return;
      }
      trigger = button;
      image.src = source;
      image.alt = preview?.alt || title;
      caption.textContent = title;
      dialog.showModal();
      document.body.classList.add('lightbox-open');
    });
  });

  close?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    image?.removeAttribute('src');
    trigger?.focus({ preventScroll: true });
    trigger = null;
  });
})();
