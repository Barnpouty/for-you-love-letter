/**
 * Motion choreography. Deliberately restrained:
 *  - one orchestrated hero entrance,
 *  - letters "laid on the table" once,
 *  - avatars that respond to the visitor rather than loop endlessly.
 */
export function initMotion(ctx, scenes) {
  const root = document.documentElement;
  const ready = () => root.classList.add('is-ready');
  if (ctx.reduced()) ready();
  else {
    (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(ready));
    setTimeout(ready, 1200);
  }

  // ---- Hero avatars ----
  const hero = scenes['av-hero'];
  if (hero) {
    hero.later(() => hero.wave(), 1300);
    hero.followPointer(document.querySelector('[data-hero]'));

    // Hovering/focusing the purchase button: the writer offers the letters.
    const cta = document.querySelector('[data-hero-cta]');
    const offer = () => { hero.cancel(); hero.setPose('offer'); };
    const rest = () => { if (hero.pose === 'offer') hero.setPose(null); };
    cta?.addEventListener('pointerenter', offer);
    cta?.addEventListener('pointerleave', rest);
    cta?.addEventListener('focus', offer);
    cta?.addEventListener('blur', rest);

    // The first scroll: a letter changes hands, then they settle.
    let scrolled = false;
    const onFirstScroll = () => {
      if (scrolled || window.scrollY < 80) return;
      scrolled = true;
      window.removeEventListener('scroll', onFirstScroll);
      hero.cancel();
      hero.setPose('offer');
      hero.later(() => { if (hero.pose === 'offer') hero.setPose('reading'); }, 1000);
      hero.later(() => { if (hero.pose === 'reading') hero.setPose(null); }, 4600);
    };
    window.addEventListener('scroll', onFirstScroll, { passive: true });
  }

  // ---- One-time entrances ----
  const once = (selector, cls, options) => {
    const els = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add(cls)); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add(cls); io.unobserve(e.target); }
      });
    }, options);
    els.forEach((el) => io.observe(el));
  };
  once('.wall', 'is-in', { threshold: 0.12 });
  once('.product', 'is-in', { threshold: 0.25 });

  // ---- Final scene: they walk toward each other ----
  const fin = scenes['av-final'];
  if (fin) {
    if (ctx.reduced() || !('IntersectionObserver' in window)) {
      fin.setPose('embrace');
    } else {
      fin.svg.classList.add('is-apart');
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        fin.later(() => fin.walkTogether('embrace'), 250);
      }, { threshold: 0.5 });
      io.observe(fin.svg);
    }
  }

  // ---- Book mockup: subtle perspective follow ----
  const visual = document.querySelector('[data-book]');
  const body = visual?.querySelector('.book__body');
  if (body && !ctx.reduced() && window.matchMedia('(pointer: fine)').matches) {
    let frame = 0;
    visual.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = visual.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        body.style.setProperty('--ry', `${(-24 + dx * 16).toFixed(1)}deg`);
        body.style.setProperty('--rx', `${(5 - dy * 8).toFixed(1)}deg`);
      });
    }, { passive: true });
    visual.addEventListener('pointerleave', () => {
      body.style.removeProperty('--ry');
      body.style.removeProperty('--rx');
    });
  }
}
