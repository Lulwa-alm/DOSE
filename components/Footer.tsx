'use client';
import { scrollTo } from '@/lib/store';

export default function Footer() {
  return (
    <footer className="relative z-[6] overflow-hidden bg-ink px-[5vw] pt-16 text-paper">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-[34ch]">
          <p className="font-display text-2xl">Natural energy. Zero sugar.</p>
          <p className="mt-3 text-paper/60">Four flavours, sweetened with monk fruit, with electrolytes in every can.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-3 font-bold">
          {[
            ['Flavours', '#flavors'],
            ['Inside', '#ingredients'],
            ['Label', '#label'],
            ['Shop', '#shop'],
            ['Why DOSE', '#why'],
            ['Waitlist', '#waitlist'],
          ].map(([l, h]) => (
            <a
              key={h}
              href={h}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(h);
              }}
              className="w-fit bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 hover:bg-[length:100%_2px] hover:text-accent"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>
      <p className="skew-brand mt-14 select-none text-center font-display text-[25vw] leading-[.78] tracking-[-0.05em] text-paper" aria-hidden>
        DOSE
      </p>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-paper/15 py-6 text-sm text-paper/55 md:flex-row md:justify-between">
        <span>DOSE is a concept brand created for a university marketing project.</span>
        <span>Drink responsibly. Not for children or anyone sensitive to caffeine.</span>
      </div>
    </footer>
  );
}
