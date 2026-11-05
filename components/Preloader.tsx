'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { FLAVORS } from '@/lib/flavors';
import { useDose } from '@/lib/store';

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Preloader() {
  const { progress, active } = useProgress();
  const noGL = useDose((s) => s.noGL);
  const setReady = useDose((s) => s.setReady);
  const lenis = useDose((s) => s.lenis);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const start = useRef(0);

  const real = useRef(0);
  real.current = noGL ? 100 : progress;

  // Ease the counter toward real loading progress (never jumps, never stalls at 0)
  useEffect(() => {
    start.current = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start.current;
      const floor = Math.min(elapsed / 25, 60); // feel alive while the first bytes arrive
      const goal = Math.max(real.current, floor);
      setShown((v) => (v >= 100 ? 100 : Math.min(goal, v + Math.max(0.6, (goal - v) * 0.1))));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const finished = (noGL || (progress >= 100 && !active)) && shown >= 99.5;
    const elapsed = performance.now() - start.current;
    if (finished && !done) {
      const t = setTimeout(() => setDone(true), Math.max(0, 900 - elapsed));
      return () => clearTimeout(t);
    }
  }, [progress, active, shown, done, noGL]);

  // Safety net: never trap the visitor behind the loader
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 9000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.documentElement.style.overflow = '';
    }
  }, [done, lenis]);

  const n = Math.min(100, Math.floor(shown));

  return (
    <AnimatePresence onExitComplete={setReady}>
      {!done && (
        <motion.div key="loader" className="fixed inset-0 z-[100] flex" aria-live="polite" aria-label={`Loading ${n}%`}>
          {/* four flavour curtains */}
          {FLAVORS.map((f, i) => (
            <motion.div
              key={f.id}
              className="h-full flex-1"
              style={{ background: f.accent }}
              initial={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.07 }}
            />
          ))}
          <motion.div
            className="absolute inset-0 flex flex-col justify-between bg-ink p-[5vw] text-paper"
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            initial={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className="flex items-start justify-between">
              <span className="skew-brand font-display text-3xl">DOSE</span>
              <span className="max-w-[22ch] text-right text-sm font-medium text-paper/60">Chilling the cans. Natural caffeine, zero sugar.</span>
            </div>
            <div>
              <div className="mb-6 flex gap-2">
                {FLAVORS.map((f, i) => {
                  const local = Math.min(1, Math.max(0, (shown - i * 25) / 25));
                  return (
                    <div key={f.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper/10">
                      <div className="h-full origin-left rounded-full" style={{ background: f.accent, transform: `scaleX(${local})` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold uppercase tracking-[.2em] text-paper/50">Loading</span>
                <span className="font-display text-[clamp(5rem,20vw,16rem)] leading-[.8] tabular-nums">
                  {String(n).padStart(3, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
