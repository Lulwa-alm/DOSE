'use client';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState } from 'react';
import { FLAVORS, PACKS } from '@/lib/flavors';
import { asset } from '@/lib/asset';
import { useDose } from '@/lib/store';

const EASE = [0.16, 1, 0.3, 1] as const;

function TiltCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glare = useTransform(glareX, (g) => `radial-gradient(circle at ${g} 20%, rgb(255 255 255 / .55), transparent 45%)`);
  return (
    <motion.div
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - b.left) / b.width);
        my.set((e.clientY - b.top) / b.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
      <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light" style={{ background: glare }} aria-hidden />
    </motion.div>
  );
}

export default function Shop() {
  const [pack, setPack] = useState('four');
  const [pulse, setPulse] = useState<string | null>(null);
  const add = useDose((s) => s.add);
  const setCartOpen = useDose((s) => s.setCartOpen);
  const p = PACKS.find((x) => x.id === pack)!;
  // the variety box needs at least four cans to hold every flavour
  const vp = pack === 'single' ? PACKS[1] : p;

  const onAdd = (id: number | 'variety') => {
    add(id, id === 'variety' ? vp.id : pack);
    setPulse(String(id));
    setTimeout(() => setPulse(null), 1400);
  };

  return (
    <section id="shop" className="relative z-[6] bg-ink px-[5vw] py-[clamp(80px,11vw,150px)] text-paper">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-[13px] font-bold uppercase tracking-[.2em] text-paper/50">
              <span className="text-accent">05</span> &nbsp;Shop
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="font-display text-[clamp(2.8rem,7vw,7.4rem)] leading-[.88] tracking-[-0.035em]"
            >
              Stock the
              <br />
              <span className="text-accent">fridge.</span>
            </motion.h2>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold text-paper/60">Pack size</p>
            <div className="relative flex rounded-full bg-paper/10 p-1.5" role="radiogroup" aria-label="Pack size">
              {PACKS.map((x) => (
                <button
                  key={x.id}
                  role="radio"
                  aria-checked={pack === x.id}
                  onClick={() => setPack(x.id)}
                  className={`relative z-10 rounded-full px-5 py-3 text-sm font-bold transition-colors sm:px-7 ${pack === x.id ? 'text-ink' : 'text-paper/80 hover:text-paper'}`}
                >
                  {pack === x.id && <motion.span layoutId="pack-pill" className="absolute inset-0 -z-10 rounded-full bg-paper" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  {x.label}
                  <span className="ml-1.5 hidden text-xs opacity-60 sm:inline">{x.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FLAVORS.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
            >
              <TiltCard className="group flex h-full flex-col overflow-hidden rounded-[28px] p-5 text-ink" style={{ background: f.bg }}>
                <div className="flex items-start justify-between">
                  <span className="font-display text-sm">0{i + 1}</span>
                  <span className="rounded-full bg-ink/90 px-3 py-1 text-xs font-bold text-paper">{f.mood}</span>
                </div>
                <div className="relative my-4 grid h-[300px] place-items-center [transform:translateZ(40px)]">
                  <div className="absolute bottom-3 h-6 w-28 rounded-[50%] bg-ink/20 blur-md transition-all duration-500 group-hover:w-20 group-hover:bg-ink/15" aria-hidden />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(f.img)}
                    alt={`DOSE ${f.name} can`}
                    loading="lazy"
                    className="relative h-[280px] w-auto max-w-none mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover:-translate-y-3 group-hover:rotate-[-4deg] group-hover:scale-105"
                  />
                </div>
                <h3 className="font-display text-2xl leading-none">
                  <span style={{ color: f.deep }}>{f.top}</span>
                  <br />
                  {f.bottom}
                </h3>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.p key={p.id} className="font-display text-2xl tabular-nums" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
                        AED {p.price}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-xs font-bold text-ink/60">
                      {p.cans} {p.cans > 1 ? 'cans' : 'can'}
                    </p>
                  </div>
                  <button
                    onClick={() => onAdd(i)}
                    data-cursor="Add"
                    aria-label={`Add ${p.label} of ${f.name} to cart`}
                    className="relative grid size-14 place-items-center overflow-hidden rounded-full bg-ink text-paper transition-transform duration-300 hover:scale-110 active:scale-95"
                    style={{ ['--tw-shadow-color' as string]: f.accent }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {pulse === String(i) ? (
                        <motion.svg key="ok" width="20" height="20" viewBox="0 0 20 20" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          <path d="M4 10.5 8.5 15 16 6" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      ) : (
                        <motion.svg key="plus" width="20" height="20" viewBox="0 0 20 20" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, rotate: 90 }}>
                          <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Variety box */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-5 grid overflow-hidden rounded-[28px] bg-[#efe6da] text-ink md:grid-cols-[1.25fr_1fr]"
        >
          <div className="relative min-h-[260px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/images/lineup.webp')} alt="All four DOSE flavours side by side" loading="lazy" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-[1.4s] ease-out-expo hover:scale-105" />
          </div>
          <div className="flex flex-col justify-center gap-5 p-7 md:p-12">
            <span className="w-fit rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper">Best for first timers</span>
            <h3 className="font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-[.95]">The variety box</h3>
            <p className="max-w-[40ch] text-ink/70">All four flavours in one box, split evenly. Find your favourite before you commit to a case.</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-display text-3xl tabular-nums">AED {vp.price + 2}</span>
              <span className="text-sm font-bold text-ink/60">{vp.cans} cans, {vp.cans / 4} of each</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onAdd('variety')}
                data-cursor="Add"
                className="h-14 rounded-full bg-ink px-7 font-bold text-paper transition-colors hover:bg-accent"
              >
                {pulse === 'variety' ? 'Added ✓' : 'Add variety box'}
              </button>
              <button onClick={() => setCartOpen(true)} className="h-14 rounded-full border-2 border-ink px-7 font-bold transition-colors hover:bg-ink hover:text-paper">
                View cart
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
