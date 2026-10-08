/**
 * Letter preview dialog, opened from the "Open when…" wall and the contents list.
 * Native <dialog> for focus handling and Escape-to-close; arrow keys browse letters.
 */
export function initLetterDialog(ctx) {
  const dialog = document.querySelector('[data-dialog]');
  if (!dialog) return;

  const letters = ctx.data.letters;
  const ui = ctx.data.ui || {};
  const q = (s) => dialog.querySelector(s);
  const sheet = q('.letter-dialog__sheet');
  const f = {
    img: q('[data-d-img]'), no: q('[data-d-no]'), title: q('[data-d-title]'),
    epigraph: q('[data-d-epigraph]'), label: q('[data-d-label]'),
    quote: q('[data-d-quote]'), closing: q('[data-d-closing]'),
  };
  let index = 0;
  let opener = null;

  function fill(i) {
    const l = letters[i];
    index = i;
    f.img.src = l.img;
    f.img.alt = l.img_alt;
    f.no.textContent = `${ui.letter} ${String(l.n).padStart(2, '0')}`;
    f.title.textContent = l.title;
    f.epigraph.textContent = l.epigraph;
    f.label.textContent = l.label;
    f.quote.textContent = l.quote;
    f.closing.textContent = l.closing;
    dialog.dataset.atmosphere = l.atmosphere;
  }

  async function go(delta) {
    const next = (index + delta + letters.length) % letters.length;
    if (ctx.reduced()) { fill(next); return; }
    sheet.classList.add('is-swapping');
    await new Promise((r) => setTimeout(r, 260));
    fill(next);
    sheet.classList.remove('is-swapping');
  }

  function open(n, trigger) {
    const i = letters.findIndex((l) => l.n === n);
    if (i < 0) return;
    opener = trigger;
    fill(i);
    document.documentElement.classList.add('dialog-open');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    q('[data-dialog-close]').focus();
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); dialog.dispatchEvent(new Event('close')); }
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.env[data-letter], .contents__item[data-letter]');
    if (!trigger) return;
    e.preventDefault();
    open(Number(trigger.dataset.letter), trigger);
  });

  q('[data-dialog-close]').addEventListener('click', close);
  q('[data-dialog-prev]').addEventListener('click', () => go(-1));
  q('[data-dialog-next]').addEventListener('click', () => go(1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // backdrop
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialog-open');
    opener?.focus({ preventScroll: true });
  });
}
