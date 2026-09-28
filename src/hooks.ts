import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds `is-visible` once the element scrolls into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Cycles through `words`, typing and deleting each one. */
export function useTypewriter(words: string[], speed = 70, hold = 1400) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (prefersReducedMotion()) {
      setText(words[0]);
      return;
    }
    let word = 0;
    let i = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const w = words[word];
      i += deleting ? -1 : 1;
      setText(w.slice(0, i));
      let delay = deleting ? speed / 2 : speed;
      if (!deleting && i === w.length) {
        deleting = true;
        delay = hold;
      } else if (deleting && i === 0) {
        deleting = false;
        word = (word + 1) % words.length;
        delay = 300;
      }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [words, speed, hold]);
  return text;
}

/** Id of the section currently nearest the top of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const probe = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ids]);
  return active;
}
