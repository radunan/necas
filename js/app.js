/* ============================================================
   Autoškola Nečas — sdílený JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Nav: scroll shadow + průhlednost nad hero ── */
  const navEl = document.getElementById('siteNav');
  const heroEl = document.getElementById('hero');
  if (navEl) {
    const updateNav = () => {
      const overHero = heroEl && heroEl.getBoundingClientRect().bottom > navEl.offsetHeight;
      navEl.classList.toggle('is-transparent', !!overHero);
      navEl.classList.toggle('is-scrolled', !overHero && window.scrollY > 8);
    };
    requestAnimationFrame(updateNav);
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ── Nav: mobilní drawer ── */
  const burger = document.getElementById('burgerBtn');
  const drawer = document.getElementById('navDrawer');
  const drawerClose = document.getElementById('drawerClose');

  if (burger && drawer) {
    const openDrawer  = () => { drawer.classList.add('is-open');    document.body.classList.add('drawer-open'); };
    const closeDrawer = () => { drawer.classList.remove('is-open'); document.body.classList.remove('drawer-open'); };

    burger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
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
