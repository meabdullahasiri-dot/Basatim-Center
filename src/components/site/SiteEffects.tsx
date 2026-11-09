'use client';
import { useEffect } from 'react';

/** حركات هادئة من موقع السيرة الذاتية: ظهور تدريجي، توهج يتبع المؤشر، وعدّاد للأرقام، وتمييز رابط القسم الظاهر. */
export function SiteEffects() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $$ = <T extends Element>(s: string) => Array.from(document.querySelectorAll<T>(s));

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const el = e.target as HTMLElement;
            el.style.transitionDelay = `${i * 70}ms`;
            el.classList.add('in');
            if (!reduce) el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
            io.unobserve(el);
          });
      },
      { threshold: 0.12 },
    );
    $$<HTMLElement>('.reveal').forEach((el) => io.observe(el));

    function countUp(el: HTMLElement) {
      const end = Number(el.dataset.count);
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1200);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const links = $$<HTMLAnchorElement>('[data-spy] a[href^="#"]');
    const spy = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.hash === '#' + e.target.id));
        }),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    links.forEach((a) => {
      const s = document.querySelector(a.hash);
      if (s) spy.observe(s);
    });

    const cleanups: (() => void)[] = [];
    if (!reduce && matchMedia('(pointer: fine)').matches) {
      $$<HTMLElement>('.glow-card').forEach((card) => {
        const move = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        };
        card.addEventListener('mousemove', move);
        cleanups.push(() => card.removeEventListener('mousemove', move));
      });
      const hero = document.querySelector<HTMLElement>('[data-hero]');
      const g = document.querySelector<HTMLElement>('[data-hero-glow]');
      if (hero && g) {
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        const drift = () => {
          cx += (tx - cx) * 0.06;
          cy += (ty - cy) * 0.06;
          g.style.transform = `translate3d(${cx}px,${cy}px,0)`;
          raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(drift) : 0;
        };
        const move = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          tx = (e.clientX - r.right + r.width * 0.25) * 0.3;
          ty = (e.clientY - r.top - r.height * 0.3) * 0.3;
          if (!raf) raf = requestAnimationFrame(drift);
        };
        hero.addEventListener('mousemove', move);
        cleanups.push(() => hero.removeEventListener('mousemove', move));
      }
    }
    return () => {
      io.disconnect();
      spy.disconnect();
      cleanups.forEach((c) => c());
    };
  }, []);
  return null;
}
