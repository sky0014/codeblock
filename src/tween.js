const getTimer = Date.now;
const raf = window.requestAnimationFrame;
const caf = window.cancelAnimationFrame;

class Tween {
  constructor(target, duration, vars) {
    this.target = target;
    this.duration = duration;
    this.vars = vars;

    this.playing = true;
    this.time = 0;

    this.listeners = {
      onComplete: this.vars.onComplete
    };

    this.from = {};
    this.to = {};
    for (const k in vars) {
      if (!this.listeners.hasOwnProperty(k)) {
        this.from[k] = this.target[k];
        this.to[k] = this.vars[k];
      }
    }
  }

  start() {
    this.time = 0;
    this.playing = true;
    this.timeline(0);
  }

  pause() {
    caf(this.id);
    this.playing = false;
  }

  resume() {
    this.playing = true;
    this.timeline(this.time);
  }

  complete() {
    this.timeline(this.duration);
  }

  timeline(time) {
    this.lastUpdate = getTimer();
    this.update(this.time);
  }

  update() {
    const cur = getTimer();
    this.time += cur - this.lastUpdate;
    this.lastUpdate = cur;

    let per = this.time / this.duration;
    if (per > 1) per = 1;
    for (const prop in this.to) {
      this.target[prop] = this.from[prop] +
        (this.to[prop] - this.from[prop]) * per;
    }
    if (per >= 1) {
      //complete
      this.playing = false;
      if (this.listeners.onComplete) this.listeners.onComplete();
    }
    if (this.playing) this.id = raf(this.update.bind(this));
  }

  static to(target, duration, vars) {
    return new Tween(target, duration, vars);
  }
}

export default Tween;
