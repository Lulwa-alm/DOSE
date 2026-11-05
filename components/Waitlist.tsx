'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Star } from './Star';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Waitlist() {
  const [sent, setSent] = useState(false);
  return (
    <section id="waitlist" className="stage-bg relative z-[6] overflow-hidden bg-flavor px-[5vw] py-[clamp(90px,13vw,180px)] text-center">
      <div className="halftone absolute inset-0" aria-hidden />
      <motion.div className="absolute -left-6 top-10 w-[clamp(70px,10vw,140px)] text-accent" animate={{ rotate: [-8, 10, -8] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} aria-hidden>
        <Star className="w-full" />
      </motion.div>
      <motion.div className="absolute -right-4 bottom-12 w-[clamp(54px,7vw,100px)] text-paper" animate={{ rotate: [10, -10, 10], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} aria-hidden>
        <Star className="w-full" />
      </motion.div>
      <div className="relative mx-auto max-w-[1000px]">
        <motion.h2
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 1, ease: EASE }}
          className="font-display text-[clamp(2.8rem,8vw,8.4rem)] leading-[.86] tracking-[-0.04em]"
        >
          Be first to
          <br />
          try DOSE
        </motion.h2>
        <p className="mx-auto mt-6 max-w-[40ch] text-lg font-medium">Leave your email and we’ll tell you when the cans land on campus.</p>
        <form
          className="mx-auto mt-10 flex max-w-[560px] flex-col gap-3 rounded-[32px] border-2 border-ink bg-paper p-2 shadow-[8px_8px_0_#141414] sm:flex-row sm:rounded-full"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            (e.target as HTMLFormElement).reset();
          }}
        >
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input id="email" type="email" required placeholder="you@university.edu" className="h-14 min-w-0 flex-1 rounded-full bg-transparent px-6 text-[17px] font-medium outline-none placeholder:text-ink/40" />
          <button type="submit" data-cursor="Join" className="h-14 rounded-full bg-ink px-8 font-bold text-paper transition-colors hover:bg-accent">
            Join the list
          </button>
        </form>
        <div className="mt-5 min-h-8" role="status">
          <AnimatePresence>
            {sent && (
              <motion.p initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="font-bold">
                You’re on the list. Thank you!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
