import * as THREE from 'three';
import type { Flavor } from './flavors';

/** Label wrap aspect: circumference (2π·r) over body height, matches the 3072×2520 wraps. */
export const LABEL_AR = 3072 / 2520;
export const CAN_H = (Math.PI * 2) / LABEL_AR; // ≈ 5.154 for r = 1

function ean(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, font: string) {
  const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const Q = L.map((s) => [...s].map((b) => (b === '1' ? '0' : '1')).join(''));
  const G = Q.map((s) => [...s].reverse().join(''));
  const P = 'LGGGLL';
  const d = '6297256061708';
  let b = '101';
  for (let i = 1; i < 7; i++) b += (P[i - 1] === 'L' ? L : G)[+d[i]];
  b += '01010';
  for (let i = 7; i < 13; i++) b += Q[+d[i]];
  b += '101';
  const m = w / b.length;
  c.fillStyle = '#141414';
  [...b].forEach((v, i) => v === '1' && c.fillRect(x + i * m, y, m + 0.5, h));
  c.font = `600 ${h * 0.2}px ${font}`;
  c.textAlign = 'center';
  c.fillText(d, x + w / 2, y + h * 1.24);
}

/** Crisp nutrition panel painted over the blurry back of the wrap (ported from the original site). */
function card(c: CanvasRenderingContext2D, W: number, H: number, f: Flavor, font: string) {
  const cw = W * 0.27, ch = H * 0.84, x0 = W / 2 - cw / 2, y0 = H * 0.08, s = cw / 100, p = 7 * s, xl = x0 + p, xr = x0 + cw - p;
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else c.rect(x, y, w, h);
  };
  rr(x0, y0, cw, ch, 5 * s);
  c.fillStyle = '#fffaf3';
  c.fill();
  c.lineWidth = 1.4 * s;
  c.strokeStyle = f.accent;
  c.stroke();
  const T = (t: string, x: number, y: number, z: number, w: number, al: CanvasTextAlign = 'left') => {
    c.font = `${w} ${z * s}px ${font}`;
    c.textAlign = al;
    c.fillStyle = '#141414';
    c.fillText(t, x, y);
  };
  const B = (y: number, k: number) => {
    c.fillStyle = '#141414';
    c.fillRect(xl, y, xr - xl, k * s);
  };
  let y = y0 + p + 14 * s;
  T('Nutrition Facts', xl, y, 13, 700);
  y += 3 * s; B(y, 0.8);
  y += 9 * s; T('Serving size', xl, y, 5.6, 500); T('1 can (250 ml)', xr, y, 5.6, 700, 'right');
  y += 3.5 * s; B(y, 3);
  y += 17 * s; T('Calories', xl, y, 10, 700); T('0', xr, y, 16, 700, 'right');
  y += 3 * s; B(y, 2);
  ([
    ['Total Fat 0g', '0%'], ['Sodium 0mg', '0%'], ['Total Carbohydrate 0g', '0%'],
    ['Total Sugars 0g', ''], ['Includes 0g Added Sugars', '0%'], ['Protein 0g', '0%'],
  ] as const).forEach(([a, b], i) => {
    y += 9 * s;
    T(a, i === 4 ? xl + 5 * s : xl, y, 5.6, i === 4 ? 400 : 700);
    if (b) T(b, xr, y, 5.6, 700, 'right');
    y += 2.6 * s; B(y, 0.35);
  });
  y = y0 + ch * 0.54;
  T('Ingredients', xl, y, 5.8, 700);
  const t = `Carbonated Water, Natural Caffeine (Green Coffee Bean Extract), Citric Acid, Natural Flavours (${f.top}, ${f.bottom}), Monk Fruit Extract, L-Theanine, Vitamins (B3, B6, B12), Electrolytes (Potassium, Magnesium), Natural Colour.`;
  c.font = `400 ${4 * s}px ${font}`;
  c.textAlign = 'left';
  y += 6.5 * s;
  let ln = '';
  t.split(' ').forEach((w) => {
    const q = ln + w + ' ';
    if (c.measureText(q).width > xr - xl && ln) { c.fillText(ln, xl, y); y += 5.4 * s; ln = w + ' '; } else ln = q;
  });
  c.fillText(ln, xl, y);
  y = y0 + ch * 0.75;
  let x = xl;
  c.font = `700 ${3.5 * s}px ${font}`;
  c.lineWidth = 0.5 * s;
  c.strokeStyle = '#141414';
  ['Natural caffeine', 'B3 B6 B12', 'L-theanine', 'Electrolytes', 'Vegan', 'Gluten free', 'No artificial sweeteners'].forEach((q) => {
    const w = c.measureText(q).width + 6 * s;
    if (x + w > xr) { x = xl; y += 8.4 * s; }
    rr(x, y, w, 6.6 * s, 3.3 * s);
    c.stroke();
    c.fillText(q, x + 3 * s, y + 4.6 * s);
    x += w + 2 * s;
  });
  ean(c, xl + (xr - xl) * 0.1, y0 + ch - p - 22 * s, (xr - xl) * 0.8, 15 * s, font);
}

export function makeLabelTexture(img: HTMLImageElement, f: Flavor, font: string, size = 2048) {
  const W = size, H = Math.round(size / LABEL_AR);
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const cx = cv.getContext('2d')!;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const paint = () => {
    cx.drawImage(img, 0, 0, W, H);
    card(cx, W, H, f, font);
    tex.needsUpdate = true;
  };
  paint();
  return { tex, paint };
}

/** Procedural condensation: a tangent-space normal map of droplets and a few runs. */
export function makeDropletNormalMap(size = 1024, seed = 7) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const cx = cv.getContext('2d')!;
  const im = cx.createImageData(size, size);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 255; d[i + 3] = 255; }
  const drop = (x0: number, y0: number, rx: number, ry: number) => {
    const xmin = Math.floor(x0 - rx), xmax = Math.ceil(x0 + rx), ymin = Math.floor(y0 - ry), ymax = Math.ceil(y0 + ry);
    for (let y = ymin; y <= ymax; y++) for (let x = xmin; x <= xmax; x++) {
      const nx = (x - x0) / rx, ny = (y - y0) / ry, q = nx * nx + ny * ny;
      if (q >= 1) continue;
      const nz = Math.sqrt(1 - q);
      const px = ((y % size) + size) % size, py = ((x % size) + size) % size;
      const k = (px * size + py) * 4;
      d[k] = (nx * 0.5 + 0.5) * 255;
      d[k + 1] = (-ny * 0.5 + 0.5) * 255; // canvas y is down, GL normal y is up
      d[k + 2] = (nz * 0.5 + 0.5) * 255;
    }
  };
  for (let i = 0; i < 2600; i++) { const r = 1.2 + rnd() ** 3 * 5; drop(rnd() * size, rnd() * size, r, r * (1 + rnd() * 0.25)); }
  for (let i = 0; i < 140; i++) { const r = 5 + rnd() * 7; drop(rnd() * size, rnd() * size, r, r * (1.1 + rnd() * 0.5)); }
  // a few slow runs of water
  for (let i = 0; i < 14; i++) {
    let x = rnd() * size, y = rnd() * size * 0.6; const r = 3 + rnd() * 3, len = 60 + rnd() * 220;
    for (let t = 0; t < len; t += 1.5) { drop(x, y + t, r * (1 - (t / len) * 0.5), r); x += (rnd() - 0.5) * 0.8; }
    drop(x, y + len, r * 1.5, r * 1.8);
  }
  cx.putImageData(im, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 1.8);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** Soft radial sprite used for mist, bubbles and the ground shadow. */
export function makeSoftSprite(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const cx = cv.getContext('2d')!;
  const g = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  cx.fillStyle = g;
  cx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  return tex;
}
