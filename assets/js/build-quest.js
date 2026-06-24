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
    this.celebration = $('.bq-celebration', root);

    this.load();
    this.bind();
    this.render();
  }

  BuildQuest.prototype.bind = function () {
    // Use event delegation on the root element to avoid missing handlers
    if (this.root && this.root.addEventListener) {
      const delegateHandler = (e) => {
          const target = e.target || e.srcElement;
          const closest = (target && target.closest) ? target.closest('.bq-next, .bq-prev') : null;
          if (!closest) return;
          e.preventDefault();
          if (closest.classList.contains('bq-next')) {
          console.debug('BuildQuest: next clicked');
          this.go(this.current + 1);
          } else if (closest.classList.contains('bq-prev')) {
          console.debug('BuildQuest: prev clicked');
          this.go(this.current - 1);
        }
        };

        this.root.addEventListener('click', delegateHandler);
        // also listen for pointer/touch events for better responsiveness on mobile
        if (window.PointerEvent) this.root.addEventListener('pointerdown', delegateHandler);
        else this.root.addEventListener('touchstart', delegateHandler, { passive: true });
    } else {
      // fallback to direct binding
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.go(this.current + 1));
      } else {
        console.warn('BuildQuest: next button not found');
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.go(this.current - 1));
      } else {
        console.warn('BuildQuest: prev button not found');
      }
    }

    // Keyboard navigation is global; keep it but guard calls
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

    const isLastStep = this.current === this.steps.length - 1;
    if (this.prevBtn) this.prevBtn.disabled = (this.current === 0);
    if (this.nextBtn) this.nextBtn.disabled = isLastStep; // Only disable Next on last step

    // Show celebration ribbon on last step, hide otherwise
    if (this.celebration) {
      this.celebration.style.display = isLastStep ? 'block' : 'none';
      this.celebration.setAttribute('aria-hidden', isLastStep ? 'false' : 'true');
    }

    const pct = Math.round(((this.current + 1) / this.steps.length) * 100);
    if (this.progressFill) {
      this.progressFill.style.width = pct + '%';
      this.progressFill.setAttribute('aria-valuenow', String(pct));
    }
  };

  function initBuildQuest() {
    const root = document.getElementById('build-quest');
    if (!root) return;
    // graceful: avoid blocking if localStorage is restricted
    try { new BuildQuest(root); } catch (e) { console.error('Build Quest init failed', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuildQuest);
  } else {
    // DOM already ready
    initBuildQuest();
  }

})();
