'use client';
import { motion } from 'framer-motion';
import { FLAVORS } from '@/lib/flavors';
import { useDose } from '@/lib/store';

const ROWS = [
  ['Total Fat 0g', '0%'],
  ['Sodium 0mg', '0%'],
  ['Total Carbohydrate 0g', '0%'],
  ['Total Sugars 0g', ''],
  ['Includes 0g Added Sugars', '0%', true],
  ['Protein 0g', '0%'],
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Label() {
  const flavor = useDose((s) => s.flavor);
  const f = FLAVORS[flavor];
  return (
    <section id="label" className="relative z-[6] overflow-hidden bg-paper px-[5vw] py-[clamp(80px,12vw,160px)]">
      <div className="mx-auto grid max-w-[1300px] items-center gap-14 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div>
          <p className="mb-5 text-[13px] font-bold uppercase tracking-[.2em]">
            <span className="text-accent">04</span> &nbsp;Read the label
          </p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="font-display text-[clamp(2.6rem,6.4vw,6.6rem)] leading-[.9] tracking-[-0.035em]"
          >
            Nothing
            <br />
            to <span className="text-outline-ink">decode.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-8 max-w-[52ch] text-lg leading-relaxed text-ink/75"
          >
            Carbonated water, natural caffeine from green coffee bean extract, citric acid, natural fruit flavours, monk fruit extract, L-theanine, vitamins B3, B6
            and B12, potassium and magnesium, and natural colour. That is the whole list.
          </motion.p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {['Natural caffeine', 'B3 B6 B12', 'L-theanine', 'Electrolytes', 'Vegan', 'Gluten free', 'No artificial sweeteners'].map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 + i * 0.05 }}
                className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-colors hover:bg-ink hover:text-paper"
              >
                {b}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, rotate: 8, y: 80 }}
          whileInView={{ opacity: 1, rotate: -3, y: 0 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ type: 'spring', stiffness: 90, damping: 16 }}
          className="relative mx-auto w-full max-w-[440px]"
        >
          <div className="stage-bg absolute -inset-4 -z-10 rounded-[36px] bg-flavor" aria-hidden />
          <div className="rounded-2xl border-2 border-ink bg-[#fffaf3] p-6 shadow-[10px_10px_0_#141414]" style={{ borderColor: f.accent }}>
            <h3 className="text-[2.4rem] font-bold leading-none tracking-tight">Nutrition Facts</h3>
            <div className="mt-2 h-[2px] bg-ink" />
            <div className="flex justify-between py-1.5 text-sm">
              <span>Serving size</span>
              <b>1 can (250 ml)</b>
            </div>
            <div className="h-2 bg-ink" />
            <div className="flex items-end justify-between py-1">
              <span className="text-2xl font-bold">Calories</span>
              <span className="text-5xl font-bold leading-none">0</span>
            </div>
            <div className="h-1 bg-ink" />
            {ROWS.map(([a, b, indent]) => (
              <div key={a} className={`flex justify-between border-b border-ink/60 py-1.5 text-sm ${indent ? 'pl-5 font-normal' : 'font-bold'}`}>
                <span>{a}</span>
                <span>{b}</span>
              </div>
            ))}
            <p className="mt-4 text-sm font-bold">Ingredients</p>
            <p className="mt-1 text-[12px] leading-snug text-ink/80">
              Carbonated Water, Natural Caffeine (Green Coffee Bean Extract), Citric Acid, Natural Flavours ({f.top}, {f.bottom}), Monk Fruit Extract, L-Theanine, Vitamins
              (B3, B6, B12), Electrolytes (Potassium, Magnesium), Natural Colour.
            </p>
            <div className="mt-4 flex h-12 items-end gap-[2px]" aria-hidden>
              {'101001101001100100110111101010001101100010101111010101110010110011011011001101000100101'.split('').map((b, i) => (
                <span key={i} className={`h-full flex-1 ${b === '1' ? 'bg-ink' : ''}`} />
              ))}
            </div>
            <p className="mt-1 text-center text-xs font-bold tracking-[.3em]">6297256061708</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
