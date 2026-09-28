import { useState } from 'react';
import { places, type Place } from '../data';
import Atlas from './Atlas';

function Skyline() {
  const peaks = places.filter((p) => p.kind === 'summit' && p.feet).sort((a, b) => a.feet! - b.feet!);
  const [active, setActive] = useState<Place>(peaks[peaks.length - 1]);

  const top = 14505;
  const w = 1000;
  const h = 280;
  const base = h - 24;
  const step = w / (peaks.length + 1);
  const spread = Math.min(step * 1.7, 170);
  const y = (ft: number) => base - (ft / top) * (base - 44);

  return (
    <div className="skyline">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Summits by elevation">
        <line className="skyline__ref" x1={0} x2={w} y1={y(top)} y2={y(top)} />
        <text className="skyline__reftext" x={4} y={y(top) - 6}>
          14,505 ft, highest point in the lower 48
        </text>
        {peaks.map((p, i) => {
          const cx = step * (i + 1);
          const py = y(p.feet!);
          const d = `M${cx - spread / 2},${base} L${cx - spread * 0.2},${py + (base - py) * 0.45} L${cx},${py} L${cx + spread * 0.12},${py + (base - py) * 0.22} L${cx + spread / 2},${base} Z`;
          // Neighbouring tall peaks would collide, so stagger their labels.
          const lift = i % 2 === 1 && py < base * 0.5 ? 16 : 0;
          return (
            <g
              key={p.name}
              className={`peak ${active === p ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(p)}
              onClick={() => setActive(p)}
            >
              <path d={d} />
              <text x={cx} y={py - 8 - lift} textAnchor="middle">
                {p.short ?? p.name}
              </text>
            </g>
          );
        })}
        <line className="skyline__base" x1={0} x2={w} y1={base} y2={base} />
      </svg>
      <p className="skyline__detail">
        <b>{active.name}</b>, {active.feet!.toLocaleString()} ft
        {active.note && <span className="muted"> · {active.note}</span>}
      </p>
    </div>
  );
}

export default function Outside() {
  return (
    <>
      <p className="lede">
        Places I've been, mostly parks and mountains, across the US, Canada, Mexico, and Costa Rica. Pick a
        region to zoom in.
      </p>
      <Atlas />
      <h3 className="minor">Summits</h3>
      <Skyline />
    </>
  );
}
