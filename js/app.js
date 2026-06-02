/* ============================================================
   Autoškola Nečas — sdílený JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav: scroll shadow ── */
  const navEl = document.getElementById('siteNav');
  if (navEl) {
    const onScroll = () => navEl.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Nav: mobilní drawer ── */
  const burger = document.getElementById('burgerBtn');
  const drawer = document.getElementById('navDrawer');
  const drawerClose = document.getElementById('drawerClose');

  if (burger && drawer) {
    burger.addEventListener('click', () => drawer.classList.add('is-open'));
    if (drawerClose) drawerClose.addEventListener('click', () => drawer.classList.remove('is-open'));
    drawer.addEventListener('click', e => {
      if (e.target === drawer) drawer.classList.remove('is-open');
    });
    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => drawer.classList.remove('is-open'))
    );
  }

  /* ── Scroll animations (data-anim) ── */
  const animEls = document.querySelectorAll('[data-anim]');
  if (animEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      animEls.forEach(el => io.observe(el));
    } else {
      animEls.forEach(el => el.classList.add('in'));
    }
  }

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

})();
