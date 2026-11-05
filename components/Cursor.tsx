'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

/** Dot + trailing ring. Grows over interactive elements and shows a short label from data-cursor. */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 });
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;
    setOn(true);
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('a,button,[data-cursor],input,label');
      setHover(t ? t.dataset.cursor ?? '' : null);
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', d);
    window.addEventListener('pointerup', u);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', d);
      window.removeEventListener('pointerup', u);
    };
  }, [x, y]);

  if (!on) return null;
  const big = hover !== null;
  const label = hover && hover.length ? hover : null;
  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" style={{ x, y }} aria-hidden />
      <motion.div
        className={`pointer-events-none fixed left-0 top-0 z-[90] grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[11px] font-bold uppercase tracking-wider text-paper ${label ? 'border-ink' : 'border-white mix-blend-difference'}`}
        style={{ x: rx, y: ry }}
        animate={{
          width: label ? 76 : big ? 54 : 34,
          height: label ? 76 : big ? 54 : 34,
          backgroundColor: label ? 'rgb(20 20 20 / 1)' : 'rgb(255 255 255 / 0)',
          scale: down ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        aria-hidden
      >
        {label}
      </motion.div>
    </>
  );
}
