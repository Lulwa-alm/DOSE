/** Window-level pointer (the canvas itself ignores pointer events). x/y in -1..1, sx/sy smoothed. */
export const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

let bound = false;
export function bindPointer() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

let rm: MediaQueryList | null = null;
export const reducedMotion = () => {
  if (typeof window === 'undefined') return false;
  rm ??= window.matchMedia('(prefers-reduced-motion: reduce)');
  return rm.matches;
};
