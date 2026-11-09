'use client';

import { useEffect } from 'react';

/**
 * Phones and narrow windows: scales each A4 sheet (.print-page) down to the
 * screen width, so the whole document is visible like a PDF preview instead
 * of being cut off. Pinch-zoom still works, and printing always uses the real
 * size (the print stylesheet resets the zoom).
 */
export function PrintFit() {
  useEffect(() => {
    const fit = () => {
      const available = document.documentElement.clientWidth - 16;
      for (const el of document.querySelectorAll<HTMLElement>('.print-page')) {
        el.style.zoom = '';
        const width = el.offsetWidth;
        el.style.zoom = width > available ? String(available / width) : '';
      }
    };
    const reset = () => {
      for (const el of document.querySelectorAll<HTMLElement>('.print-page')) el.style.zoom = '';
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('beforeprint', reset);
    window.addEventListener('afterprint', fit);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('beforeprint', reset);
      window.removeEventListener('afterprint', fit);
    };
  }, []);
  return null;
}
