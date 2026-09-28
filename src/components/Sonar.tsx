import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks';

const CONTACT_LABELS = [
  'C', 'C++', 'Go', 'CUDA', 'NCCL', 'x86_64', 'ESP32', 'PyTorch',
  'Kubernetes', 'ASIO', 'gdb', 'QEMU', 'Linux', 'SQLite', 'TCP/IP', 'NASM',
];

type Contact = { angle: number; dist: number; label: string; lastHit: number };
type Ping = { x: number; y: number; t0: number };

/**
 * A PPI-style sonar display. The sweep lights up skill "contacts" as it passes;
 * clicking the scope sends a ping and drops a new contact where you clicked.
 */
export default function Sonar() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = 0;
    let raf = 0;
    let running = false;
    // (Re)start the draw loop if it has stopped (reduced motion draws on demand).
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const contacts: Contact[] = CONTACT_LABELS.slice(0, 10).map((label, i) => ({
      label,
      angle: (i / 10) * Math.PI * 2 + Math.random() * 0.4,
      dist: 0.3 + Math.random() * 0.6,
      lastHit: -Infinity,
    }));
    const pings: Ping[] = [];
    let labelIdx = 10;

    const resize = () => {
      size = canvas.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      kick(); // resizing clears the canvas
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const r = size / 2 - 8;
      const dist = Math.hypot(x, y) / r;
      if (dist > 1) return;
      const now = performance.now();
      pings.push({ x, y, t0: now });
      contacts.push({
        label: CONTACT_LABELS[labelIdx++ % CONTACT_LABELS.length],
        angle: Math.atan2(y, x),
        dist,
        lastHit: now,
      });
      if (contacts.length > 18) contacts.shift();
      kick();
    };
    canvas.addEventListener('pointerdown', onClick);

    const reduced = prefersReducedMotion();
    const start = performance.now();

    function draw(now: number) {
      const cx = size / 2;
      const cy = size / 2;
      const r = size / 2 - 8;
      if (r < 20) {
        // Not laid out yet; try again next frame.
        raf = requestAnimationFrame(draw);
        return;
      }
      const sweep = reduced ? -Math.PI / 4 : ((now - start) / 4000) * Math.PI * 2;

      ctx.clearRect(0, 0, size, size);

      // Scope face
      const face = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      face.addColorStop(0, 'rgba(10, 60, 70, 0.55)');
      face.addColorStop(1, 'rgba(2, 20, 30, 0.85)');
      ctx.fillStyle = face;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Range rings + crosshair
      ctx.strokeStyle = 'rgba(46, 230, 214, 0.18)';
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r * k) / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Sweep wedge (trailing glow)
      const trail = Math.PI / 2.2;
      const steps = 24;
      for (let s = 0; s < steps; s++) {
        const a0 = sweep - (trail * (s + 1)) / steps;
        const a1 = sweep - (trail * s) / steps;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a0, a1);
        ctx.closePath();
        ctx.fillStyle = `rgba(46, 230, 214, ${0.16 * (1 - s / steps)})`;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(46, 230, 214, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * r, cy + Math.sin(sweep) * r);
      ctx.stroke();

      // Contacts: flash when the sweep passes over them, then fade.
      ctx.font = `500 ${Math.max(10, size / 42)}px "JetBrains Mono", monospace`;
      const sweepNorm = ((sweep % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      for (const c of contacts) {
        const cAngle = ((c.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let diff = sweepNorm - cAngle;
        if (diff < 0) diff += Math.PI * 2;
        if (!reduced && diff < 0.06) c.lastHit = now;
        const age = (now - c.lastHit) / 3200;
        const alpha = reduced ? 0.8 : Math.max(0, 1 - age);
        if (alpha <= 0.02) continue;
        const x = cx + Math.cos(c.angle) * c.dist * r;
        const y = cy + Math.sin(c.angle) * c.dist * r;
        ctx.fillStyle = `rgba(46, 230, 214, ${alpha})`;
        ctx.shadowColor = 'rgba(46, 230, 214, 0.9)';
        ctx.shadowBlur = 10 * alpha;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(200, 255, 250, ${alpha * 0.9})`;
        ctx.fillText(c.label, x + 7, y - 6);
      }

      // Click pings: expanding rings
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        const t = (now - p.t0) / 1400;
        if (t > 1) {
          pings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(255, 180, 84, ${1 - t})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, 4 + t * r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bezel
      ctx.strokeStyle = 'rgba(46, 230, 214, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      if (!reduced || pings.length) raf = requestAnimationFrame(draw);
      else running = false;
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onClick);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="sonar"
      role="img"
      aria-label="Animated sonar display. Click it to send a ping."
    />
  );
}
