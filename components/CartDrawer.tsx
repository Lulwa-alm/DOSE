'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FLAVORS, PACKS } from '@/lib/flavors';
import { asset } from '@/lib/asset';
import { scrollTo, useDose } from '@/lib/store';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function CartDrawer() {
  const open = useDose((s) => s.cartOpen);
  const setOpen = useDose((s) => s.setCartOpen);
  const cart = useDose((s) => s.cart);
  const inc = useDose((s) => s.inc);
  const lenis = useDose((s) => s.lenis);
  const [note, setNote] = useState(false);
  const total = cart.reduce((a, c) => a + c.qty * c.unit, 0);
  const cans = cart.reduce((a, c) => a + c.qty * (PACKS.find((p) => p.id === c.pack)?.cans ?? 1), 0);
  const freeAt = 60;

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    if (!open) setNote(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, lenis, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your cart">
          <motion.button
            aria-label="Close cart"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute inset-y-2 right-2 flex w-[min(460px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px] bg-paper"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ duration: 0.65, ease: EASE }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b-2 border-ink px-6 py-5">
              <h2 className="font-display text-3xl">Your cart</h2>
              <button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full border-2 border-ink transition hover:rotate-90 hover:bg-ink hover:text-paper" aria-label="Close cart">
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="flex justify-between text-sm font-bold">
                <span>{total >= freeAt ? 'Free delivery unlocked' : `AED ${freeAt - total} away from free delivery`}</span>
                <span className="text-ink/50">{cans} cans</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
                <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${Math.min(100, (total / freeAt) * 100)}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <p className="font-display text-2xl">Nothing chilling yet.</p>
                    <p className="mt-2 text-ink/60">Pick a flavour and a pack size to get started.</p>
                    <button
                      className="mt-6 rounded-full bg-ink px-6 py-3 font-bold text-paper transition hover:bg-accent"
                      onClick={() => {
                        setOpen(false);
                        setTimeout(() => scrollTo('#shop'), 350);
                      }}
                    >
                      Browse the shop
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {cart.map((c) => {
                      const f = c.flavor === 'variety' ? null : FLAVORS[c.flavor];
                      const pack = PACKS.find((p) => p.id === c.pack)!;
                      return (
                        <motion.li
                          key={c.key}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="flex items-center gap-4 rounded-2xl p-3"
                          style={{ background: f ? f.bg : '#efe6da' }}
                        >
                          <div className="grid h-20 w-14 shrink-0 place-items-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset(f ? f.img : '/cans/raspberry.jpg')} alt="" className="h-full w-auto mix-blend-multiply" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold">{f ? f.name : 'Variety box'}</p>
                            <p className="text-sm text-ink/60">{pack.label} · AED {c.unit}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-paper/80 p-1">
                            <button className="grid size-8 place-items-center rounded-full font-bold hover:bg-ink hover:text-paper" onClick={() => inc(c.key, -1)} aria-label={`Remove one ${f ? f.name : 'variety box'}`}>
                              −
                            </button>
                            <span className="w-5 text-center font-bold tabular-nums">{c.qty}</span>
                            <button className="grid size-8 place-items-center rounded-full font-bold hover:bg-ink hover:text-paper" onClick={() => inc(c.key, 1)} aria-label={`Add one ${f ? f.name : 'variety box'}`}>
                              +
                            </button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            <div className="border-t-2 border-ink px-6 py-5">
              <div className="mb-4 flex items-end justify-between">
                <span className="font-bold">Subtotal</span>
                <span className="font-display text-3xl tabular-nums">AED {total}</span>
              </div>
              <button
                disabled={!cart.length}
                onClick={() => setNote(true)}
                className="h-14 w-full rounded-full bg-ink font-bold text-paper transition hover:bg-accent disabled:opacity-40"
              >
                Checkout
              </button>
              <AnimatePresence>
                {note && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-center text-sm text-ink/70" role="status">
                    DOSE is a concept brand, so checkout opens at launch.{' '}
                    <button
                      className="font-bold underline decoration-accent decoration-2 underline-offset-4"
                      onClick={() => {
                        setOpen(false);
                        setTimeout(() => scrollTo('#waitlist'), 350);
                      }}
                    >
                      Join the waitlist
                    </button>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
