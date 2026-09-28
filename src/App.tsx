import { useState } from 'react';
import type { FocusId } from './data';
import Nav from './components/Nav';
import MarineSnow from './components/MarineSnow';
import DepthGauge from './components/DepthGauge';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Education from './components/Education';
import Contact from './components/Contact';

export default function App() {
  // Selecting a focus area (systems / vision / marine) highlights related work site-wide.
  const [focus, setFocus] = useState<FocusId | null>(null);

  return (
    <>
      <MarineSnow />
      <Nav />
      <DepthGauge />
      <main>
        <Hero />
        <About focus={focus} setFocus={setFocus} />
        <Experience focus={focus} setFocus={setFocus} />
        <Projects focus={focus} setFocus={setFocus} />
        <Education />
        <Contact />
      </main>
    </>
  );
}
