'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';

/** Pulls its child toward the cursor a little: a tactile hover for primary actions. */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const b = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (b.left + b.width / 2)) * strength);
        y.set((e.clientY - (b.top + b.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ink' | 'paper' | 'accent' | 'ghost' };

/** Pill button with a rolling label on hover. */
export function PillButton({ children, variant = 'ink', className = '', ...rest }: BtnProps) {
  const tone = {
    ink: 'bg-ink text-paper hover:bg-accent',
    paper: 'bg-paper text-ink hover:bg-accent hover:text-paper',
    accent: 'bg-accent text-paper hover:bg-ink',
    ghost: 'border-2 border-current bg-transparent hover:bg-ink hover:text-paper hover:border-ink',
  }[variant];
  return (
    <button
      {...rest}
      className={`group relative inline-flex h-14 items-center gap-3 overflow-hidden whitespace-nowrap rounded-full px-7 text-[15px] font-bold tracking-tight transition-colors duration-300 ease-spring active:scale-[.97] disabled:opacity-40 ${tone} ${className}`}
    >
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
          {children}
        </span>
      </span>
      <span aria-hidden className="grid size-7 place-items-center rounded-full bg-current/0 transition-transform duration-500 ease-out-expo group-hover:rotate-[-45deg]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </button>
  );
}
