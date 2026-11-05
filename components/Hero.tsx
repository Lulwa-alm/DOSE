'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FLAVORS } from '@/lib/flavors';
import { asset } from '@/lib/asset';
import { scrollTo, useDose } from '@/lib/store';
import { Magnetic, PillButton } from './Magnetic';
import { Star } from './Star';

const EASE = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay, ready }: { children: React.ReactNode; delay: number; ready: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className="block" initial={{ y: '110%' }} animate={{ y: ready ? '0%' : '110%' }} transition={{ duration: 1.1, ease: EASE, delay }}>
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ready = useDose((s) => s.ready);
  const flavor = useDose((s) => s.flavor);
  const setFlavor = useDose((s) => s.setFlavor);
  const noGL = useDose((s) => s.noGL);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const f = FLAVORS[flavor];

  // Gently cycle flavours while the hero is on screen and untouched
  useEffect(() => {
    if (!ready || !auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
    if (ref.current) io.observe(ref.current);
    const t = setInterval(() => visible && setFlavor((useDose.getState().flavor + 1) % FLAVORS.length), 4200);
    return () => {
      clearInterval(t);
      io.disconnect();
    };
  }, [ready, auto, setFlavor]);

  return (
    <section ref={ref} id="hero" className="stage-bg relative h-[100svh] min-h-[640px] overflow-hidden bg-flavor">
      <div className="halftone absolute inset-0" aria-hidden />
      <div className="absolute left-1/2 top-[46%] aspect-square w-[min(80vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/.7),transparent_65%)]" aria-hidden />

      {/* Oversized wordmark behind the can */}
      <div className="absolute inset-x-0 top-[47%] flex -translate-y-1/2 justify-center" aria-hidden>
        <div className="skew-brand flex font-display text-[clamp(7rem,33vw,34rem)] leading-[.8] tracking-[-0.05em] text-ink">
          {'DOSE'.split('').map((ch, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span className="block" initial={{ y: '105%' }} animate={{ y: ready ? '0%' : '105%' }} transition={{ duration: 1.3, ease: EASE, delay: 0.05 + i * 0.07 }}>
                {ch}
              </motion.span>
            </span>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute left-[7%] top-[22%] w-[clamp(44px,6vw,92px)] text-accent"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: ready ? 1 : 0, rotate: ready ? -12 : -40 }}
        transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.9 }}
        aria-hidden
      >
        <motion.div animate={{ rotate: [0, 12, 0], scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
          <Star className="w-full" />
        </motion.div>
      </motion.div>

      {noGL && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(f.img)} alt={`DOSE ${f.name} can`} className="absolute left-1/2 top-[48%] z-[6] h-[62vh] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
      )}

      {/* top meta row */}
      <div className="absolute inset-x-0 top-[86px] z-10 flex items-start justify-between px-[5vw] text-[11px] font-bold uppercase tracking-[.16em] sm:top-[110px] sm:text-[13px]">
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex flex-col gap-1">
          <li>Natural caffeine</li>
          <li>Zero sugar</li>
          <li>250 ml</li>
        </motion.ul>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-right">
          <span className="block text-ink/50">Now pouring</span>
          <span className="relative block h-[1.3em] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={f.id} className="block" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.6, ease: EASE }}>
                0{flavor + 1} · {f.name}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>
      </div>

      {/* bottom: headline left, actions right */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 px-[5vw] pb-[max(24px,4vh)] md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="max-w-[min(620px,100%)]">
          <h1 className="font-display text-[clamp(1.9rem,3.4vw,3.9rem)] leading-[.95] tracking-[-0.03em]">
            <Line ready={ready} delay={0.35}>Energy that keeps</Line>
            <Line ready={ready} delay={0.45}>you topped up.</Line>
          </h1>
          <motion.p
            className="mt-3 max-w-[36ch] text-[15px] font-medium leading-snug text-ink/80 md:mt-4 md:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 16 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          >
            Natural caffeine and electrolytes in one zero sugar can, made for long study days.
          </motion.p>
        </div>

        <motion.div
          className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.75 }}
        >
          <div className="order-2 flex items-center gap-2.5 md:order-none md:gap-3" role="group" aria-label="Pick a flavour">
            {FLAVORS.map((fl, i) => (
              <button
                key={fl.id}
                onClick={() => {
                  setAuto(false);
                  setFlavor(i);
                }}
                aria-label={fl.name}
                aria-pressed={i === flavor}
                data-cursor={fl.top}
                className="relative size-8 rounded-full border-[3px] border-ink transition-transform duration-300 ease-spring hover:scale-110 md:size-10"
                style={{ background: fl.accent }}
              >
                {i === flavor && (
                  <motion.span layoutId="hero-swatch" className="absolute -inset-[6px] rounded-full border-2 border-ink" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Magnetic>
              <PillButton onClick={() => scrollTo('#shop')} data-cursor="Shop" className="max-sm:h-12 max-sm:px-5">
                Shop the drop
              </PillButton>
            </Magnetic>
            <span className="hidden sm:block">
              <PillButton variant="ghost" onClick={() => scrollTo('#flavors')}>
                Flavours
              </PillButton>
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[.3em] lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.2 }}
        aria-hidden
      >
        Scroll
        <span className="relative h-10 w-[2px] overflow-hidden bg-ink/15">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-ink" animate={{ y: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  );
}
