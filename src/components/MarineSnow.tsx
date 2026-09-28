import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks';

/** Drifting "marine snow" particles behind the whole page; denser as you dive. */
export default function MarineSnow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number };
    let particles: P[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        vy: Math.random() * 0.25 + 0.05,
        vx: (Math.random() - 0.5) * 0.1,
        a: Math.random() * 0.5 + 0.15,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const reduced = prefersReducedMotion();
    let raf = 0;
    const draw = () => {
      const maxScroll = document.documentElement.scrollHeight - h || 1;
      const depth = Math.min(window.scrollY / maxScroll, 1);
      ctx.clearRect(0, 0, w, h);
      // Fewer particles visible near the surface, all of them in the deep.
      const visible = Math.floor(particles.length * (0.35 + 0.65 * depth));
      for (let i = 0; i < visible; i++) {
        const p = particles[i];
        if (!reduced) {
          p.y += p.vy;
          p.x += p.vx;
          if (p.y > h + 4) p.y = -4;
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 235, 255, ${p.a})`;
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    if (reduced) window.addEventListener('scroll', draw, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', draw);
    };
  }, []);

  return <canvas ref={ref} className="marine-snow" aria-hidden="true" />;
}
