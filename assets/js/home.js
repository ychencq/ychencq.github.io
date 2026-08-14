const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('.fas');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a')];
const navLinksContainer = document.querySelector('.nav-links');

const updateNavIndicator = (activeLink) => {
  if (!navLinksContainer || !activeLink) {
    navLinksContainer?.classList.remove('indicator-active');
    return;
  }

  navLinksContainer.style.setProperty('--indicator-x', `${Math.round(activeLink.offsetLeft)}px`);
  navLinksContainer.style.setProperty('--indicator-width', `${Math.round(activeLink.offsetWidth)}px`);
  navLinksContainer.classList.add('indicator-active');
};

const setTheme = (theme) => {
  const isDark = theme === 'dark';
  root.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  themeIcon?.classList.toggle('icon-sun', !isDark);
  themeIcon?.classList.toggle('icon-moon', isDark);
};

const savedTheme = localStorage.getItem('yc-theme');
setTheme(savedTheme || 'light');

themeToggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  localStorage.setItem('yc-theme', nextTheme);
});

const trackedSections = sections.filter((section) =>
  navLinks.some((link) => link.getAttribute('href') === `#${section.id}`),
);

const syncNavigation = () => {
  const marker = window.scrollY + Math.min(240, window.innerHeight * 0.3);
  let activeLink = null;

  trackedSections.forEach((section) => {
    if (marker >= section.offsetTop) {
      activeLink = navLinks.find((link) => link.getAttribute('href') === `#${section.id}`) || activeLink;
    }
  });

  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
    activeLink = navLinks.at(-1) || activeLink;
  }

  navLinks.forEach((link) => {
    if (link === activeLink) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  updateNavIndicator(activeLink);
};

let scrollFrame = null;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    syncNavigation();
    scrollFrame = null;
  });
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => updateNavIndicator(link));
});

window.addEventListener('resize', () => {
  syncNavigation();
});

window.addEventListener('load', syncNavigation);
syncNavigation();

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const lightbox = document.querySelector('.image-lightbox');
const lightboxImage = lightbox?.querySelector('.lightbox-image');
const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
const lightboxClose = lightbox?.querySelector('.lightbox-close');
const publicationVisuals = [...document.querySelectorAll('.publication-visual[data-full-image]')];
let lightboxTrigger = null;

const closeLightbox = () => {
  if (!lightbox?.open) return;
  lightbox.close();
};

publicationVisuals.forEach((visual) => {
  visual.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    const previewImage = visual.querySelector('img');
    const publicationTitle = visual.closest('.publication-card')?.querySelector('h3')?.textContent?.trim() || '';

    lightboxTrigger = visual;
    lightboxImage.src = visual.dataset.fullImage || previewImage?.src || '';
    lightboxImage.alt = previewImage?.alt || publicationTitle;
    lightboxCaption.textContent = publicationTitle;
    document.body.classList.add('lightbox-open');
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox?.addEventListener('close', () => {
  document.body.classList.remove('lightbox-open');
  lightboxImage?.removeAttribute('src');
  lightboxTrigger?.focus();
  lightboxTrigger = null;
});
