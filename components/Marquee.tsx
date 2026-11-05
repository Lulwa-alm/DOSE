'use client';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useRef } from 'react';
import { Star } from './Star';

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Infinite band whose speed and direction follow scroll velocity. */
export default function Marquee({ words, base = 2, tone = 'ink' }: { words: string[]; base?: number; tone?: 'ink' | 'accent' }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [0, 1000], [0, 5], { clamp: false });
  const dir = useRef(1);
  const pos = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    x.set(x.get() + dir.current * -base * (delta / 1000) * (1 + Math.abs(f)));
  });

  const cls = tone === 'ink' ? 'bg-ink text-paper' : 'stage-bg bg-accent text-ink';
  const items = [...words, ...words];
  return (
    <div className={`relative z-[6] overflow-hidden border-y-2 border-ink py-4 ${cls}`} aria-hidden>
      <motion.div className="flex w-max" style={{ x: pos }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((w, i) => (
              <span key={i} className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-[clamp(1.4rem,2.6vw,2.4rem)] leading-none">
                {w}
                <Star className={`size-[1.2em] ${tone === 'ink' ? 'text-accent' : 'text-paper'}`} />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
