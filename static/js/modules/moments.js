/**
 * "What does your heart need today?"
 * Choosing a feeling opens the envelope, lifts the matching letter out,
 * shifts the section's atmosphere and makes the avatars respond.
 */
export function initMoments(ctx, scene) {
  const section = document.querySelector('[data-moments]');
  if (!section) return;

  const envelope = section.querySelector('[data-envelope]');
  const content = section.querySelector('[data-paper-content]');
  const buttons = [...section.querySelectorAll('.mood')];
  const letters = new Map(ctx.data.letters.map((l) => [l.n, l]));
  const ui = ctx.data.ui || {};
  let current = null;
  let token = 0;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ctx.reduced() ? 0 : ms));
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  function render(letter) {
    const img = el('img', 'paper__img');
    img.src = letter.img;
    img.alt = '';
    img.width = 74;
    img.height = 64;
    img.decoding = 'async';
    content.replaceChildren(
      img,
      el('p', 'paper__no', `${ui.letter} ${String(letter.n).padStart(2, '0')}`),
      el('h3', 'paper__title', letter.title),
      el('p', 'paper__epigraph', letter.epigraph),
      el('p', 'paper__line', letter.line),
      el('p', 'paper__closing', letter.closing),
    );
  }

  async function choose(button) {
    const n = Number(button.dataset.letter);
    const letter = letters.get(n);
    if (!letter || n === current) return;
    current = n;
    const mine = ++token;
    const stale = () => mine !== token;

    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    section.dataset.atmosphere = letter.atmosphere;
    section.classList.add('has-letter');
    scene?.react(letter.pose);

    if (envelope.dataset.state === 'out') {
      // Already open: let the paper breathe while the words change.
      content.classList.add('is-swapping');
      await wait(340);
      if (stale()) return;
      render(letter);
      content.classList.remove('is-swapping');
    } else {
      render(letter);
      if (envelope.dataset.state === 'closed') {
        envelope.dataset.state = 'opening';
        await wait(520);
        if (stale()) return;
      }
      if (envelope.dataset.state !== 'risen') {
        envelope.dataset.state = 'risen';
        await wait(820);
        if (stale()) return;
      }
      envelope.dataset.state = 'out';
    }

    // On wide screens the writer gestures toward the call to action, once.
    if (window.matchMedia('(min-width: 1081px)').matches) scene?.pointBriefly(900, 2200);
  }

  envelope.dataset.state = 'closed';
  buttons.forEach((b) => b.addEventListener('click', () => choose(b)));

  // A small hello the first time the section comes into view.
  if ('IntersectionObserver' in window && scene) {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        if (!current) scene.later(() => { if (!current) scene.wave(); }, 500);
      }
    }, { threshold: 0.5 });
    io.observe(section);
  }
}
