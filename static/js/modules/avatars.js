/**
 * AvatarScene — drives one SVG avatar pair (see templates/partials/avatars.html).
 * Poses are CSS classes on the <svg>; this class only decides *when* they change.
 */
const POSES = ['wave', 'offer', 'comfort', 'embrace', 'uplift', 'joy', 'calm', 'reading'];

export class AvatarScene {
  constructor(svg, ctx) {
    this.svg = svg;
    this.ctx = ctx;
    this.pose = null;
    this.timers = new Set();
  }

  /** setTimeout that is cancellable as a group and instant under reduced motion. */
  later(fn, ms) {
    const t = setTimeout(() => { this.timers.delete(t); fn(); }, this.ctx.reduced() ? 0 : ms);
    this.timers.add(t);
    return t;
  }

  cancel() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  setPose(pose) {
    this.svg.classList.remove(...POSES.map((p) => `pose-${p}`));
    if (pose) this.svg.classList.add(`pose-${pose}`);
    this.pose = pose || null;
  }

  /** Re-apply a pose so its keyframe animation plays again. */
  replay(pose) {
    this.setPose(null);
    void this.svg.getBoundingClientRect(); // force style flush
    this.setPose(pose);
  }

  wave() {
    if (this.ctx.reduced()) return;
    this.replay('wave');
    this.later(() => { if (this.pose === 'wave') this.setPose(null); }, 2000);
  }

  /** React to a letter. "reading" is a two-step gesture: offer, then hand over. */
  react(pose) {
    this.cancel();
    this.point(false);
    if (pose === 'reading') {
      this.setPose('offer');
      this.later(() => this.setPose('reading'), 950);
    } else if (pose === 'joy') {
      this.replay('joy');
    } else {
      this.setPose(pose);
    }
  }

  point(on) {
    this.svg.classList.toggle('is-pointing', Boolean(on));
  }

  pointBriefly(delay = 1200, duration = 2200) {
    if (this.ctx.reduced()) return;
    this.later(() => {
      this.point(true);
      this.later(() => this.point(false), duration);
    }, delay);
  }

  walkTogether(endPose = 'embrace') {
    if (this.ctx.reduced()) {
      this.svg.classList.remove('is-apart');
      this.setPose(endPose);
      return;
    }
    this.svg.classList.add('is-walking');
    this.svg.classList.remove('is-apart');
    this.setPose(endPose);
    this.later(() => this.svg.classList.remove('is-walking'), 1750);
  }

  /** Eyes gently follow the pointer (desktop only, never under reduced motion). */
  followPointer(area) {
    if (!area || this.ctx.reduced() || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    let idle = 0;
    const reset = () => {
      this.svg.style.removeProperty('--gx');
      this.svg.style.removeProperty('--gy');
    };
    area.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = this.svg.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.38;
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
        this.svg.style.setProperty('--gx', `${(dx * 2.6).toFixed(2)}px`);
        this.svg.style.setProperty('--gy', `${(dy * 2).toFixed(2)}px`);
        clearTimeout(idle);
        idle = setTimeout(reset, 3500);
      });
    }, { passive: true });
    area.addEventListener('pointerleave', reset);
  }
}
