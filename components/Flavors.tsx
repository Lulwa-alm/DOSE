'use client';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { FLAVORS, PACKS } from '@/lib/flavors';
import { useDose } from '@/lib/store';
import { Magnetic, PillButton } from './Magnetic';
import { Star } from './Star';

gsap.registerPlugin(ScrollTrigger, useGSAP);
const EASE = [0.16, 1, 0.3, 1] as const;

export default function Flavors() {
  const root = useRef<HTMLElement>(null);
  const flavor = useDose((s) => s.flavor);
  const setFlavor = useDose((s) => s.setFlavor);
  const add = useDose((s) => s.add);
  const lenis = useDose((s) => s.lenis);
  const [added, setAdded] = useState(-1);
  const st = useRef<ScrollTrigger | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const f = FLAVORS[flavor];

  useGSAP(
    () => {
      st.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const i = Math.min(FLAVORS.length - 1, Math.floor(self.progress * FLAVORS.length));
          useDose.getState().setFlavor(i);
          if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
        },
      });
      // background word drifts sideways with scroll
      gsap.fromTo('[data-drift]', { xPercent: 8 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    },
    { scope: root },
  );

  const jump = (i: number) => {
    const s = st.current;
    if (!s) return setFlavor(i);
    const y = s.start + (s.end - s.start) * ((i + 0.5) / FLAVORS.length);
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <section ref={root} id="flavors" className="stage-bg relative h-[420vh] bg-flavor">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="halftone absolute inset-0 opacity-70" aria-hidden />
        {/* giant drifting outline word */}
        <div data-drift className="pointer-events-none absolute left-0 top-[10%] whitespace-nowrap md:top-[8%]" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={f.id}
              className="text-outline block font-display text-[clamp(6rem,22vw,22rem)] leading-none tracking-[-0.04em] opacity-35"
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-40%', opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {f.top} {f.bottom} {f.top}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.div
          key={`star-${f.id}`}
          className="absolute left-[8%] top-[24%] w-[clamp(56px,7vw,110px)] text-accent max-md:hidden"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          aria-hidden
        >
          <Star className="w-full" />
        </motion.div>

        <div className="relative grid h-full grid-rows-[1fr_auto] px-[5vw] pb-[5vh] md:grid-cols-[1fr_1fr] md:grid-rows-1 md:items-center md:pb-0">
          <div className="max-md:row-start-1" aria-hidden />
          <div className="relative z-10 max-md:row-start-2 md:pl-[2vw]">
            <p className="mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[.2em]">
              <span>02</span>
              <span className="h-[2px] w-16 bg-ink/15">
                <span ref={bar} className="block h-full origin-left scale-x-0 bg-ink" />
              </span>
              Flavours
              <span className="ml-auto font-display text-base tracking-normal tabular-nums md:hidden">
                0{flavor + 1}/0{FLAVORS.length}
              </span>
            </p>

            <h2 className="font-display text-[clamp(2.6rem,6.4vw,7rem)] leading-[.9] tracking-[-0.035em]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={f.id} className="block" initial="hide" animate="show" exit="out">
                  {[f.top, f.bottom].map((w, i) => (
                    <span key={w} className="block overflow-hidden pb-[0.05em]">
                      <motion.span
                        className={`block ${i === 0 ? 'text-accent' : ''}`}
                        variants={{ hide: { y: '105%' }, show: { y: '0%' }, out: { y: '-105%' } }}
                        transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </h2>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={f.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="mt-5 max-w-[42ch] text-[17px] font-medium leading-snug md:text-lg">{f.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {f.notes.map((n) => (
                    <li key={n} className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-transform duration-300 hover:-translate-y-1 hover:-rotate-2 hover:bg-ink hover:text-paper">
                      {n}
                    </li>
                  ))}
                  <li className="rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper">{f.mood}</li>
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Magnetic>
                <PillButton
                  data-cursor="Add"
                  onClick={() => {
                    add(flavor, 'four');
                    setAdded(flavor);
                    setTimeout(() => setAdded(-1), 1600);
                  }}
                >
                  {added === flavor ? 'Added to cart' : `Add 4-pack · AED ${PACKS[1].price}`}
                </PillButton>
              </Magnetic>
              <div className="flex gap-2" role="group" aria-label="Jump to flavour">
                {FLAVORS.map((fl, i) => (
                  <button
                    key={fl.id}
                    onClick={() => jump(i)}
                    aria-label={fl.name}
                    aria-pressed={i === flavor}
                    className="group flex h-10 items-center"
                  >
                    <span className="h-[6px] rounded-full bg-ink transition-all duration-500 ease-spring" style={{ width: i === flavor ? 40 : 14, opacity: i === flavor ? 1 : 0.3 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <span className="absolute bottom-6 right-[5vw] hidden font-display text-[clamp(3rem,6vw,6rem)] leading-none tabular-nums text-ink/90 md:block" aria-hidden>
          0{flavor + 1}
          <span className="text-ink/25">/0{FLAVORS.length}</span>
        </span>
      </div>
    </section>
  );
}
