'use client';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COPY =
  'Made for long study days. Natural caffeine from green coffee beans, electrolytes to keep you hydrated, and not a single gram of sugar.';
const HIGHLIGHT = new Set(['caffeine', 'electrolytes', 'sugar.']);

const STATS = [
  ['0', 'g sugar'],
  ['0', 'calories'],
  ['250', 'ml can'],
] as const;

export default function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>('[data-word]');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      });
      tl.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.12, ease: 'none', duration: 0.6 }, 0);
      tl.fromTo('[data-stat]', { yPercent: 110 }, { yPercent: 0, stagger: 0.15, ease: 'power3.out', duration: 1 }, '>-0.6');
      tl.fromTo('[data-rule]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 2 }, 0);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="story" className="relative h-[300vh] bg-ink text-paper">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-end overflow-hidden px-[5vw] pb-[8vh] pt-[18vh] md:justify-center md:pb-0 md:pt-0">
        <div className="pointer-events-none absolute -right-[10vw] top-1/2 aspect-square w-[70vw] max-w-[900px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--a)_35%,transparent),transparent_62%)] opacity-60 blur-2xl transition-[background] duration-700" aria-hidden />
        <div className="relative max-w-[min(56vw,880px)] max-md:max-w-none">
          <p className="mb-6 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[.2em] text-paper/50">
            <span className="text-accent">01</span>
            <span className="relative h-[2px] w-16 bg-paper/15">
              <span data-rule className="absolute inset-0 origin-left bg-accent" />
            </span>
            The idea
          </p>
          <p className="font-display text-[clamp(1.7rem,3.4vw,3.6rem)] leading-[1.06] tracking-[-0.02em]">
            {COPY.split(' ').map((w, i) => (
              <span key={i} data-word className={`inline-block pr-[0.28em] ${HIGHLIGHT.has(w) ? 'text-accent' : ''}`}>
                {w}
              </span>
            ))}
          </p>
          <dl className="mt-10 grid max-w-[640px] grid-cols-3 gap-4 border-t border-paper/15 pt-6">
            {STATS.map(([n, l]) => (
              <div key={l} className="overflow-hidden">
                <div data-stat>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-none">{n}</dd>
                  <dd className="mt-2 text-sm font-bold uppercase tracking-[.14em] text-paper/60">{l}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
