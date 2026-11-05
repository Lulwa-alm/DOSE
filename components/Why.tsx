'use client';
import { motion } from 'framer-motion';

const ROWS = [
  ['Energy that lasts the lecture', 'Natural caffeine gives you the lift to start, study and keep going.'],
  ['Hydration built in', 'Electrolytes in every can, so you are not choosing between feeling alert and feeling refreshed.'],
  ['Nothing to decode', 'Zero sugar, real fruit flavours and a short ingredient list you can read on the back.'],
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Why() {
  return (
    <section id="why" className="paper relative z-[6] px-[5vw] py-[clamp(80px,11vw,150px)]">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-5 text-[13px] font-bold uppercase tracking-[.2em]">
          <span className="text-accent">06</span> &nbsp;Why DOSE
        </p>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15%' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-[14ch] font-display text-[clamp(2.8rem,7vw,7.4rem)] leading-[.88] tracking-[-0.035em]"
        >
          One can. <span className="text-outline-ink">Two jobs.</span>
        </motion.h2>
        <ul className="mt-14 border-b-2 border-ink">
          {ROWS.map(([t, d], i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              className="group relative grid gap-3 overflow-hidden border-t-2 border-ink py-8 md:grid-cols-[80px_1fr_1.1fr] md:items-center md:gap-10 md:py-10"
            >
              <span className="absolute inset-0 -z-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-y-100" aria-hidden />
              <span className="relative font-display text-lg text-ink/40 transition-colors group-hover:text-ink">0{i + 1}</span>
              <h3 className="relative font-display text-[clamp(1.6rem,3.2vw,3rem)] leading-[1] transition-transform duration-500 ease-out-expo group-hover:translate-x-3">{t}</h3>
              <p className="relative max-w-[46ch] text-lg text-ink/70 transition-colors group-hover:text-ink">{d}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
