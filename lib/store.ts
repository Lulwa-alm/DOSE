'use client';
import { create } from 'zustand';
import type Lenis from 'lenis';
import { FLAVORS, PACKS } from './flavors';

export type CartItem = { key: string; flavor: number | 'variety'; pack: string; qty: number; unit: number };

type State = {
  flavor: number;
  setFlavor: (i: number) => void;
  ready: boolean; // preloader finished
  setReady: () => void;
  noGL: boolean; // WebGL unavailable: show 2D fallbacks
  setNoGL: (v: boolean) => void;
  stageOn: boolean; // 3D canvas visible
  setStageOn: (v: boolean) => void;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  add: (flavor: number | 'variety', pack: string) => void;
  inc: (key: string, d: number) => void;
  lenis: Lenis | null;
  setLenis: (l: Lenis | null) => void;
};

export const useDose = create<State>((set, get) => ({
  flavor: 0,
  setFlavor: (i) => {
    if (i !== get().flavor) set({ flavor: ((i % FLAVORS.length) + FLAVORS.length) % FLAVORS.length });
  },
  ready: false,
  setReady: () => set({ ready: true }),
  noGL: false,
  setNoGL: (v) => set({ noGL: v }),
  stageOn: true,
  setStageOn: (v) => get().stageOn !== v && set({ stageOn: v }),
  cart: [],
  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  add: (flavor, pack) => {
    const key = `${flavor}-${pack}`;
    const p = PACKS.find((x) => x.id === pack) ?? PACKS[0];
    const unit = flavor === 'variety' ? p.price + 2 : p.price;
    const cart = get().cart;
    const hit = cart.find((c) => c.key === key);
    set({
      cart: hit
        ? cart.map((c) => (c.key === key ? { ...c, qty: c.qty + 1 } : c))
        : [...cart, { key, flavor, pack, qty: 1, unit }],
    });
  },
  inc: (key, d) =>
    set({
      cart: get()
        .cart.map((c) => (c.key === key ? { ...c, qty: c.qty + d } : c))
        .filter((c) => c.qty > 0),
    }),
  lenis: null,
  setLenis: (l) => set({ lenis: l }),
}));

/**
 * Mutable rig the scroll timeline writes into and the 3D scene reads every frame.
 * Kept outside React so GSAP scrubbing never triggers re-renders.
 */
export const canRig = {
  x: 0,
  y: 0,
  z: 0,
  scale: 1,
  rotY: 0, // extra scroll-driven turn
  tiltZ: -0.12,
  face: 0, // 0 = free idle spin, 1 = settle to the front, 2-ish handled via rotY
  intro: 0, // 0 -> 1 entrance
  dark: 0, // 0 light bg, 1 dark bg (lighting tweak)
};

export const scrollTo = (target: string | number) => {
  const l = useDose.getState().lenis;
  if (l) l.scrollTo(target as string, { offset: 0, duration: 1.4 });
  else if (typeof target === 'string') document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  else window.scrollTo({ top: target, behavior: 'smooth' });
};

