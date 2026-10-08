/**
 * Site chrome: header state, language switch, mobile sticky CTA, checkout hooks.
 */
export function initChrome(ctx) {
  const root = document.documentElement;

  // Header becomes solid once the page moves.
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-solid', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Language switch: remember the choice, then a soft fade before navigating.
  document.querySelectorAll('[data-lang-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const lang = link.dataset.langLink;
      document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || ctx.reduced()) return;
      if (link.getAttribute('aria-current') === 'true') { e.preventDefault(); return; }
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(() => { window.location.href = link.href; }, 220);
    });
  });
  // Coming back via the browser's back button should never show a faded page.
  window.addEventListener('pageshow', () => root.classList.remove('is-leaving'));

  // Mobile sticky CTA: visible after the hero CTA scrolls away, hidden near the final CTA.
  const sticky = document.querySelector('[data-sticky]');
  const heroCta = document.querySelector('[data-hero-cta]');
  const finalSection = document.querySelector('[data-final]');
  if (sticky && heroCta && 'IntersectionObserver' in window) {
    const stickyLink = sticky.querySelector('a');
    let pastHero = false;
    let nearEnd = false;
    const update = () => {
      const show = pastHero && !nearEnd;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      stickyLink.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);
    if (finalSection) {
      new IntersectionObserver(([e]) => {
        nearEnd = e.isIntersecting || e.boundingClientRect.top < 0;
        update();
      }, { rootMargin: '0px 0px -10% 0px' }).observe(finalSection);
    }
  }

  // Checkout clicks: links already point at the right EscalePay URL (rendered from
  // config/settings.py). This only emits an event you can hook analytics onto.
  document.querySelectorAll('[data-checkout]').forEach((a) => {
    a.addEventListener('click', () => {
      const detail = { placement: a.dataset.cta, lang: ctx.data.lang, url: a.href };
      window.dispatchEvent(new CustomEvent('checkout:click', { detail }));
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'begin_checkout', ...detail });
    });
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}
