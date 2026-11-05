'use client';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS = [
  { k: 'Natural caffeine', v: 'From green coffee bean extract, for steady focus.', tag: 'Focus', pos: 'md:left-[5vw] md:top-[26%]', line: 'right' },
  { k: 'Electrolytes', v: 'Potassium and magnesium to help you stay hydrated.', tag: 'K · Mg', pos: 'md:right-[5vw] md:top-[26%]', line: 'left' },
  { k: 'L-theanine + B vitamins', v: 'B3, B6 and B12 alongside L-theanine.', tag: 'B3 B6 B12', pos: 'md:left-[5vw] md:bottom-[12%]', line: 'right' },
  { k: 'Zero sugar', v: 'Sweetened with monk fruit. No artificial sweeteners.', tag: '0 g', pos: 'md:right-[5vw] md:bottom-[12%]', line: 'left' },
] as const;

export default function Ingredients() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.7 } });
      tl.fromTo('[data-title] span', { yPercent: 100 }, { yPercent: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 0);
      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((el, i) => {
        tl.fromTo(el, { autoAlpha: 0, y: 40, rotate: i % 2 ? 3 : -3 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.6, ease: 'power3.out' }, 0.35 + i * 0.35);
        tl.fromTo(el.querySelector('[data-line]'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'power2.out' }, 0.6 + i * 0.35);
      });
      tl.fromTo('[data-badges] li', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.4 }, '>-0.1');
      tl.to({}, { duration: 0.6 });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ingredients" className="paper relative h-[320vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-x-0 top-[13%] flex flex-col items-center px-[5vw] text-center md:top-[11%]">
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[.2em]">
            <span className="text-accent">03</span> &nbsp;Inside the can
          </p>
          <h2 data-title className="font-display text-[clamp(2.2rem,6vw,6.4rem)] leading-[.9] tracking-[-0.035em]">
            <span className="inline-block overflow-hidden align-bottom">
              <span className="inline-block">Short list.&nbsp;</span>
            </span>
            <span className="inline-block overflow-hidden align-bottom">
              <span className="inline-block text-accent">Real lift.</span>
            </span>
          </h2>
        </div>

        <ul className="absolute inset-x-[4vw] bottom-[4vh] grid grid-cols-2 gap-2 md:static md:contents">
          {ITEMS.map((it) => (
            <li
              key={it.k}
              data-card
              className={`relative rounded-2xl border-2 border-ink bg-paper p-3 shadow-[6px_6px_0_#141414] md:absolute md:w-[min(25vw,340px)] md:rounded-3xl md:p-6 ${it.pos}`}
            >
              <span
                data-line
                className={`absolute top-1/2 hidden h-[2px] w-[7vw] bg-ink md:block ${it.line === 'right' ? 'left-full origin-left' : 'right-full origin-right'}`}
                aria-hidden
              >
                <span className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-ink bg-accent ${it.line === 'right' ? 'right-0' : 'left-0'}`} />
              </span>
              <span className="mb-1 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-paper md:mb-3 md:text-xs">{it.tag}</span>
              <h3 className="font-display text-[15px] leading-tight md:text-2xl">{it.k}</h3>
              <p className="mt-1 text-[12px] leading-snug text-ink/70 md:mt-2 md:text-[15px]">{it.v}</p>
            </li>
          ))}
        </ul>

        <ul data-badges className="absolute bottom-[4vh] left-1/2 hidden -translate-x-1/2 gap-2 md:flex">
          {['Vegan', 'Gluten free', 'No artificial sweeteners'].map((b) => (
            <li key={b} className="whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
