export type Flavor = {
  id: string;
  name: string;
  top: string;
  bottom: string;
  bg: string; // pastel stage colour
  accent: string; // punchy accent
  deep: string; // darker tone for text on pastel
  description: string;
  notes: string[];
  mood: string;
  tex: string;
  img: string;
};

export const FLAVORS: Flavor[] = [
  {
    id: 'raspberry-coconut',
    name: 'Raspberry Coconut',
    top: 'Raspberry',
    bottom: 'Coconut',
    bg: '#ffd3e2',
    accent: '#ff2d78',
    deep: '#9e0b45',
    description:
      'Bright raspberry with a smooth coconut finish. Light, juicy and easy to drink all afternoon.',
    notes: ['Juicy raspberry', 'Creamy coconut', 'Soft finish'],
    mood: 'All-afternoon chill',
    tex: '/textures/raspberry.webp',
    img: '/cans/raspberry.jpg',
  },
  {
    id: 'orange-beetroot',
    name: 'Orange Beetroot',
    top: 'Orange',
    bottom: 'Beetroot',
    bg: '#ffd9b8',
    accent: '#ff7a00',
    deep: '#a2410a',
    description:
      'Sunny orange with a gentle earthy beetroot note. The one that wakes up a slow morning.',
    notes: ['Sun-ripe orange', 'Earthy beetroot', 'Zesty lift'],
    mood: 'Slow-morning starter',
    tex: '/textures/orange.webp',
    img: '/cans/orange.jpg',
  },
  {
    id: 'watermelon-lime',
    name: 'Watermelon Lime',
    top: 'Watermelon',
    bottom: 'Lime',
    bg: '#dcf7b0',
    accent: '#4fae00',
    deep: '#2d6a00',
    description:
      'Cool watermelon sharpened with fresh lime. Made for hot days between classes.',
    notes: ['Cool watermelon', 'Fresh lime', 'Crisp fizz'],
    mood: 'Hot-day refresher',
    tex: '/textures/watermelon.webp',
    img: '/cans/watermelon.jpg',
  },
  {
    id: 'blackberry-ginger',
    name: 'Blackberry Ginger',
    top: 'Blackberry',
    bottom: 'Ginger',
    bg: '#dccbff',
    accent: '#7a3cff',
    deep: '#4316a8',
    description:
      'Deep blackberry with a warm ginger kick. Built for late nights and big deadlines.',
    notes: ['Dark blackberry', 'Warm ginger', 'Spiced kick'],
    mood: 'Deadline fuel',
    tex: '/textures/blackberry.webp',
    img: '/cans/blackberry.jpg',
  },
];

export type Pack = { id: string; label: string; cans: number; price: number; note: string };

// Concept pricing (AED) for the demo storefront.
export const PACKS: Pack[] = [
  { id: 'single', label: 'Single', cans: 1, price: 9, note: 'Try one' },
  { id: 'four', label: '4-Pack', cans: 4, price: 32, note: 'Save 11%' },
  { id: 'twelve', label: '12-Pack', cans: 12, price: 89, note: 'Save 18%' },
];
