import { useMemo, useState } from 'react';
import { geoAlbers, geoAlbersUsa, geoPath, type GeoProjection } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { Feature, FeatureCollection } from 'geojson';
import us from 'us-atlas/states-10m.json';
import { parks, peaks, visitedParks, type Peak } from '../data';

const W = 960;
const H = 600;
const topo = us as unknown as Topology<{ states: GeometryCollection }>;
const states = feature(topo, topo.objects.states) as FeatureCollection;
const borders = mesh(topo, topo.objects.states, (a, b) => a !== b);
const california = states.features.find((f) => f.id === '06') as Feature;

const Tri = ({ seen }: { seen?: boolean }) => (
  <svg className={`park swatch ${seen ? 'is-seen' : ''}`} viewBox="-8 -9 16 15" aria-hidden="true">
    <path d="M0,-7 L6.3,4.2 L-6.3,4.2 Z" />
  </svg>
);

function ParkMap() {
  const [view, setView] = useState<'us' | 'ca'>('us');
  const [hover, setHover] = useState<string | null>(null);
  const visited = new Set(visitedParks);

  const { path, project } = useMemo(() => {
    const proj: GeoProjection =
      view === 'us'
        ? (geoAlbersUsa().fitExtent([[10, 10], [W - 10, H - 10]], states) as unknown as GeoProjection)
        : geoAlbers().rotate([120, 0]).center([0, 37.3]).fitExtent([[40, 20], [W - 40, H - 20]], california);
    return { path: geoPath(proj), project: (lon: number, lat: number) => proj([lon, lat]) };
  }, [view]);

  const shown = parks
    .filter((p) => view === 'us' || p.state === 'CA')
    .map((p) => ({ ...p, xy: project(p.lon, p.lat), seen: visited.has(p.name) }));
  const offMap = shown.filter((p) => !p.xy);
  const count = parks.filter((p) => visited.has(p.name)).length;
  const caCount = parks.filter((p) => p.state === 'CA' && visited.has(p.name)).length;

  return (
    <div className="parks">
      <div className="parks__bar">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={view === 'us'} onClick={() => setView('us')}>
            United States
          </button>
          <button role="tab" aria-selected={view === 'ca'} onClick={() => setView('ca')}>
            California
          </button>
        </div>
        <span className="parks__count mono">
          {view === 'us' ? `${count} of 63 national parks` : `${caCount} of 9 in California`}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="parks__map" role="img" aria-label="Map of national parks">
        <g className="parks__land">
          {(view === 'us' ? states.features : [california]).map((f, i) => (
            <path key={i} d={path(f) ?? undefined} />
          ))}
        </g>
        {view === 'us' && <path className="parks__borders" d={path(borders) ?? undefined} />}
        {shown
          .filter((p) => p.xy)
          .sort((a, b) => Number(a.seen) - Number(b.seen))
          .map((p) => {
            const [x, y] = p.xy!;
            const s = view === 'us' ? 7 : 11;
            return (
              <g
                key={p.name}
                className={`park ${p.seen ? 'is-seen' : ''} ${hover === p.name ? 'is-hover' : ''}`}
                transform={`translate(${x},${y})`}
                onMouseEnter={() => setHover(p.name)}
                onMouseLeave={() => setHover(null)}
              >
                <path d={`M0,${-s} L${s * 0.9},${s * 0.6} L${-s * 0.9},${s * 0.6} Z`} />
                {(view === 'ca' || hover === p.name) && (
                  <text x={s + 4} y={4}>
                    {p.name}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
      <p className="parks__legend">
        <Tri seen /> been there <Tri /> not yet
        {offMap.length > 0 && <span className="muted"> · not shown: {offMap.map((p) => p.name).join(', ')}</span>}
      </p>
    </div>
  );
}

function Skyline() {
  const [active, setActive] = useState<Peak | null>(null);
  if (peaks.length === 0) return <p className="muted">Peaks list coming soon.</p>;

  const sorted = [...peaks].sort((a, b) => a.feet - b.feet);
  const top = Math.max(14505, ...sorted.map((p) => p.feet));
  const w = 1000;
  const h = 260;
  const base = h - 30;
  const step = w / (sorted.length + 1);
  const spread = Math.min(step * 1.5, 170);
  const y = (ft: number) => base - (ft / top) * (base - 20);
  const shown = active ?? sorted[sorted.length - 1];

  return (
    <div className="skyline">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Peaks by elevation">
        <line className="skyline__ref" x1={0} x2={w} y1={y(14505)} y2={y(14505)} />
        <text className="skyline__reftext" x={4} y={y(14505) - 6}>
          14,505 ft (Mt. Whitney, highest in the lower 48)
        </text>
        {sorted.map((p, i) => {
          const cx = step * (i + 1);
          const py = y(p.feet);
          const shoulder = py + (base - py) * 0.45;
          const d = `M${cx - spread / 2},${base} L${cx - spread * 0.18},${shoulder} L${cx},${py} L${cx + spread * 0.12},${py + (base - py) * 0.25} L${cx + spread / 2},${base} Z`;
          return (
            <g
              key={p.name}
              className={`peak ${shown === p ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(p)}
              onClick={() => setActive(p)}
            >
              <path d={d} />
              <text x={cx} y={py - 8} textAnchor="middle">
                {p.name}
              </text>
            </g>
          );
        })}
        <line className="skyline__base" x1={0} x2={w} y1={base} y2={base} />
      </svg>
      <p className="skyline__detail">
        <b>{shown.name}</b>, {shown.feet.toLocaleString()} ft, {shown.where}
        {shown.when && <span className="muted"> · {shown.when}</span>}
        {shown.note && <> · {shown.note}</>}
      </p>
    </div>
  );
}

export default function Outside() {
  return (
    <>
      <p className="lede">National parks I've been to, and mountains I've hiked.</p>
      <ParkMap />
      <h3 className="minor">Peaks</h3>
      <Skyline />
    </>
  );
}
