'use client';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';
import { scrollTo, useDose } from '@/lib/store';

const LINKS = [
  ['Flavours', '#flavors'],
  ['Inside', '#ingredients'],
  ['Shop', '#shop'],
  ['Why DOSE', '#why'],
] as const;

export default function Header() {
  const ready = useDose((s) => s.ready);
  const cart = useDose((s) => s.cart);
  const setCartOpen = useDose((s) => s.setCartOpen);
  const count = cart.reduce((a, c) => a + c.qty, 0);
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const h = y > prev && y > 400;
    if (h !== hidden) setHidden(h);
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
      initial={{ y: -120 }}
      animate={{ y: !ready ? -120 : hidden ? -120 : 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex w-full max-w-[1400px] items-center justify-between gap-3 overflow-hidden rounded-full border border-ink/10 bg-paper/75 py-2 pl-5 pr-2 shadow-[0_10px_40px_-12px_rgb(20_20_20/0.25)] backdrop-blur-xl backdrop-saturate-150">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollTo(0);
          }}
          className="skew-brand font-display text-[26px] leading-none transition-colors hover:text-accent"
          aria-label="DOSE home"
        >
          DOSE
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(href);
              }}
              className="group relative rounded-full px-4 py-2 text-[15px] font-bold"
            >
              <span className="relative z-10 transition-colors group-hover:text-paper">{label}</span>
              <span className="absolute inset-0 scale-50 rounded-full bg-ink opacity-0 transition duration-300 ease-spring group-hover:scale-100 group-hover:opacity-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#shop"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('#shop');
            }}
            className="hidden h-11 items-center rounded-full border-2 border-ink px-5 text-sm font-bold transition-colors hover:bg-ink hover:text-paper sm:flex"
          >
            Shop now
          </a>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 items-center gap-2 rounded-full bg-ink pl-4 pr-1.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
            aria-label={`Open cart, ${count} items`}
            data-cursor="Cart"
          >
            Cart
            <span className="relative grid size-8 place-items-center overflow-hidden rounded-full bg-accent text-paper">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="tabular-nums"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        </div>
        <motion.span className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} aria-hidden />
      </div>
    </motion.header>
  );
}
