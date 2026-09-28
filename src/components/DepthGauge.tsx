import { useEffect, useState } from 'react';
import { zones } from '../data';

/**
 * Fixed dive gauge on the right edge. Depth is interpolated between the
 * top offsets of each section, so scrolling reads as descending through the
 * ocean zones (and down the software stack).
 */
export default function DepthGauge() {
  const [depth, setDepth] = useState(0);
  const [zone, setZone] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      // A section "starts" once its top is 35% of the way down the viewport.
      const lead = window.innerHeight * 0.35;
      const probe = window.scrollY;
      const tops = zones.map((z, i) =>
        i === 0 ? 0 : (document.getElementById(z.id)?.offsetTop ?? 0) - lead,
      );
      let i = 0;
      while (i < tops.length - 1 && probe >= tops[i + 1]) i++;
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom) i = tops.length - 1;
      const next = Math.min(i + 1, tops.length - 1);
      const span = tops[next] - tops[i] || 1;
      const t = next === i ? 0 : Math.min(Math.max((probe - tops[i]) / span, 0), 1);
      // Past the last section's top, finish the dive by the bottom of the page.
      if (i === tops.length - 1) {
        setDepth(zones[i].depth);
      } else {
        setDepth(Math.round(zones[i].depth + t * (zones[next].depth - zones[i].depth)));
      }
      setZone(i);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const max = zones[zones.length - 1].depth;
  const pct = (d: number) => `${(Math.sqrt(d / max) * 100).toFixed(2)}%`;

  return (
    <aside className="gauge" aria-label="Page depth">
      <div className="gauge__readout">
        <span className="gauge__num">{depth.toLocaleString()}</span>
        <span className="gauge__unit">m</span>
      </div>
      <div className="gauge__zone">{zones[zone].label}</div>
      <div className="gauge__ring">{zones[zone].ring}</div>
      <div className="gauge__track">
        <div className="gauge__fill" style={{ height: pct(depth) }} />
        {zones.map((z, i) => (
          <a
            key={z.id}
            href={`#${z.id}`}
            className={`gauge__tick ${i <= zone ? 'is-passed' : ''}`}
            style={{ top: pct(z.depth) }}
            title={`${z.label} · ${z.depth.toLocaleString()} m`}
          >
            <span>{z.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
