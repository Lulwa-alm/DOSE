'use client';
import dynamic from 'next/dynamic';
import { Component, useEffect, useState } from 'react';
import { SmoothScroll, ThemeSync } from './SmoothScroll';
import Preloader from './Preloader';
import Header from './Header';
import CartDrawer from './CartDrawer';
import Cursor from './Cursor';
import ScrollDirector from './ScrollDirector';
import Hero from './Hero';
import Marquee from './Marquee';
import Story from './Story';
import Flavors from './Flavors';
import Ingredients from './Ingredients';
import Label from './Label';
import Shop from './Shop';
import Why from './Why';
import Waitlist from './Waitlist';
import Footer from './Footer';
import { useDose } from '@/lib/store';

const Stage = dynamic(() => import('./three/Stage'), { ssr: false });

class GLBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useDose.getState().setNoGL(true);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Experience() {
  const [gl, setGl] = useState<boolean | null>(null);
  const setNoGL = useDose((s) => s.setNoGL);

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement('canvas');
      ok = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      ok = false;
    }
    setGl(ok);
    if (!ok) setNoGL(true);
  }, [setNoGL]);

  return (
    <>
      <SmoothScroll />
      <ThemeSync />
      <Preloader />
      <Cursor />
      <Header />
      <CartDrawer />
      {gl && (
        <GLBoundary>
          <Stage />
        </GLBoundary>
      )}
      <ScrollDirector />
      <main id="top">
        <Hero />
        <Marquee words={['Natural caffeine', 'Zero sugar', 'Electrolytes', 'Monk fruit', 'Vegan', 'Gluten free']} />
        <Story />
        <Flavors />
        <Ingredients />
        <Label />
        <Shop />
        <Marquee tone="accent" base={2.6} words={['Raspberry Coconut', 'Orange Beetroot', 'Watermelon Lime', 'Blackberry Ginger']} />
        <Why />
        <Waitlist />
      </main>
      <Footer />
      <div className="grain" aria-hidden />
    </>
  );
}
