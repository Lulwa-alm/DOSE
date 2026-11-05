'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAVORS } from '@/lib/flavors';
import { useDose } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

/** Lenis inertia scrolling driven by GSAP's ticker so ScrollTrigger and Lenis stay in lockstep. */
export function SmoothScroll() {
  const setLenis = useDose((s) => s.setLenis);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [setLenis]);
  return null;
}

/** Push the active flavour palette into CSS custom properties. */
export function ThemeSync() {
  const flavor = useDose((s) => s.flavor);
  useEffect(() => {
    const f = FLAVORS[flavor];
    const r = document.documentElement.style;
    r.setProperty('--c', f.bg);
    r.setProperty('--a', f.accent);
    r.setProperty('--d', f.deep);
  }, [flavor]);
  return null;
}
