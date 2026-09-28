import { useState } from 'react';
import { places, type Place } from '../data';
import Atlas from './Atlas';

const W = 1000;
const H = 360;
const LEFT = 64; // room for the elevation axis
const RIGHT = 16;
const TOP = 34;
const BASE = 250; // baseline; names hang below it
const CEIL = 15000;
const y = (ft: number) => BASE - (ft / CEIL) * (BASE - TOP);

// A little variety so the peaks don't look stamped out: each gets its own
// shoulder heights and lean, derived from its name.
function shape(name: string) {
  let hsh = 0;
  for (const c of name) hsh = (hsh * 31 + c.charCodeAt(0)) >>> 0;
  const r = (n: number) => ((hsh >>> n) & 255) / 255;
  return { lean: (r(0) - 0.5) * 0.25, left: 0.35 + r(8) * 0.25, right: 0.2 + r(16) * 0.3 };
}

function Skyline() {
  const peaks = places.filter((p) => p.kind === 'hike' && p.feet).sort((a, b) => a.feet! - b.feet!);
  const [active, setActive] = useState<Place>(peaks[peaks.length - 1]);
  const step = (W - LEFT - RIGHT) / peaks.length;
  const half = Math.min(step * 0.62, 70);
  const rank = [...peaks].reverse().indexOf(active) + 1;

  return (
    <div className="skyline">
      <p className="skyline__summary">
        {peaks.length} summits, {peaks.filter((p) => p.feet! >= 14000).length} of them over 14,000 ft. Hover or tap
        one for details.
      </p>
      <div className="skyline__scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Summits by elevation">
          <defs>
            {/* Color by actual elevation: foothills, rock, then snow. */}
            <linearGradient id="elev" gradientUnits="userSpaceOnUse" x1="0" y1={y(0)} x2="0" y2={y(CEIL)}>
              <stop offset="0" stopColor="#cdbf8f" />
              <stop offset={5000 / CEIL} stopColor="#b9ab82" />
              <stop offset={9000 / CEIL} stopColor="#8f877c" />
              <stop offset={11800 / CEIL} stopColor="#8a8580" />
              <stop offset={12100 / CEIL} stopColor="#f1efea" />
              <stop offset="1" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {[2000, 4000, 6000, 8000, 10000, 12000, 14000].map((ft) => (
            <g key={ft} className={ft % 4000 === 0 ? 'grid grid--index' : 'grid'}>
              <line x1={LEFT} x2={W - RIGHT} y1={y(ft)} y2={y(ft)} />
              <text x={LEFT - 8} y={y(ft) + 4} textAnchor="end">
                {ft.toLocaleString()}
              </text>
            </g>
          ))}
          <text className="grid__unit" x={LEFT - 8} y={TOP - 14} textAnchor="end">
            feet
          </text>

          {peaks.map((p, i) => {
            const cx = LEFT + step * (i + 0.5);
            const py = y(p.feet!);
            const s = shape(p.name);
            const tip = cx + s.lean * half;
            // Base, a shoulder on each side, and the summit.
            const d = [
              `M${cx - half},${BASE}`,
              `L${cx - half * 0.5},${py + (BASE - py) * s.left}`,
              `L${tip},${py}`,
              `L${cx + half * 0.45},${py + (BASE - py) * s.right}`,
              `L${cx + half},${BASE}`,
              'Z',
            ].join(' ');
            const on = active === p;
            return (
              <g
                key={p.name}
                className={`peak ${on ? 'is-active' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`${p.name}, ${p.feet!.toLocaleString()} feet`}
                onMouseEnter={() => setActive(p)}
                onFocus={() => setActive(p)}
                onClick={() => setActive(p)}
              >
                <path d={d} fill="url(#elev)" />
                <text className="peak__ft" x={tip} y={py - 7} textAnchor="middle">
                  {p.feet!.toLocaleString()}
                </text>
                <text className="peak__name" transform={`translate(${cx + 4},${BASE + 14}) rotate(-38)`} textAnchor="end">
                  {p.short ?? p.name}
                </text>
              </g>
            );
          })}
          <line className="skyline__base" x1={LEFT} x2={W - RIGHT} y1={BASE} y2={BASE} />
        </svg>
      </div>
      <p className="skyline__detail">
        <b>{active.name}</b>
        <span className="mono">
          {' '}
          {active.feet!.toLocaleString()} ft · {Math.round(active.feet! * 0.3048).toLocaleString()} m
        </span>
        <span className="muted">
          {' '}
          · {[active.range, active.region === 'Canada' ? 'Canada' : null].filter(Boolean).join(', ')} · #{rank} of{' '}
          {peaks.length}
        </span>
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
