(function () {
  'use strict';

  const STORAGE_KEY = 'mmaug.buildQuest.progress';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function BuildQuest(root) {
    this.root = root;
    this.steps = $all('.bq-step', root);
    this.current = 0;
    this.prevBtn = $('.bq-prev', root);
    this.nextBtn = $('.bq-next', root);
    this.progressFill = $('.bq-progress-fill', root);

    this.load();
    this.bind();
    this.render();
  }

  BuildQuest.prototype.bind = function () {
    this.nextBtn.addEventListener('click', () => this.go(this.current + 1));
    this.prevBtn.addEventListener('click', () => this.go(this.current - 1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.go(this.current + 1);
      if (e.key === 'ArrowLeft') this.go(this.current - 1);
    });
  };

  BuildQuest.prototype.save = function () {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.current));
    } catch (e) {
      // ignore
    }
  };

  BuildQuest.prototype.load = function () {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v !== null) this.current = Math.max(0, Math.min(this.steps.length -1, Number(v)));
    } catch (e) {
      this.current = 0;
    }
  };

  BuildQuest.prototype.go = function (index) {
    const next = Math.max(0, Math.min(this.steps.length - 1, index));
    if (next === this.current) return;
    this.current = next;
    this.save();
    this.render();
  };

  BuildQuest.prototype.render = function () {
    this.steps.forEach((el, i) => {
      el.style.display = (i === this.current) ? 'block' : 'none';
    });

    this.prevBtn.disabled = (this.current === 0);
    this.nextBtn.disabled = (this.current === this.steps.length - 1);

    const pct = Math.round(((this.current + 1) / this.steps.length) * 100);
    this.progressFill.style.width = pct + '%';
    this.progressFill.setAttribute('aria-valuenow', String(pct));
  };

  document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('build-quest');
    if (!root) return;
    // graceful: avoid blocking if localStorage is restricted
    try { new BuildQuest(root); } catch (e) { console.error('Build Quest init failed', e); }
  });

})();
