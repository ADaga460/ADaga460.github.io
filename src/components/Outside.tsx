import { useMemo, useState } from 'react';
import { geoAzimuthalEqualArea, geoGraticule, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import us from 'us-atlas/states-10m.json';
import neighborsJson from '../geo/neighbors.json';
import {
  jmt,
  parkNotes,
  parks,
  places,
  regionOfState,
  visitedParks,
  type Place,
  type Region,
} from '../data';

const W = 960;
const H = 620;
const topo = us as unknown as Topology<{ states: GeometryCollection }>;
const states = feature(topo, topo.objects.states) as FeatureCollection;
const stateLines = mesh(topo, topo.objects.states, (a, b) => a !== b);
const neighbors = neighborsJson as unknown as FeatureCollection;

type Kind = 'np' | Place['kind'];
type Mark = {
  name: string;
  kind: Kind;
  region: Region;
  lat: number;
  lon: number;
  seen: boolean;
  note?: string;
};

const visited = new Set(visitedParks);
const marks: Mark[] = [
  ...parks.map((p) => ({
    name: p.name,
    kind: 'np' as const,
    region: regionOfState(p.state),
    lat: p.lat,
    lon: p.lon,
    seen: visited.has(p.name),
    note: parkNotes[p.name],
  })),
  ...places.map((p) => ({ ...p, seen: true })),
];

const TABS: ('All' | Region)[] = [
  'All',
  'California',
  'Southwest',
  'Northwest & Rockies',
  'Hawaii',
  'Alaska',
  'Canada',
  'Mexico',
  'Costa Rica',
];

const KIND_LABEL: Record<Kind, string> = {
  np: 'US national parks',
  park: 'Other parks',
  summit: 'Summits',
  ruins: 'Ruins',
  other: 'Other',
};

function Symbol({ kind, seen, size }: { kind: Kind; seen: boolean; size: number }) {
  const s = size;
  if (kind === 'np' || kind === 'park')
    return kind === 'np' ? (
      <path className={seen ? 'sym sym--np' : 'sym sym--np sym--unseen'} d={`M0,${-s} L${s * 0.9},${s * 0.6} L${-s * 0.9},${s * 0.6} Z`} />
    ) : (
      <circle className="sym sym--park" r={s * 0.55} />
    );
  if (kind === 'summit')
    return <path className="sym sym--summit" d={`M${-s * 0.6},${-s * 0.6} L${s * 0.6},${s * 0.6} M${s * 0.6},${-s * 0.6} L${-s * 0.6},${s * 0.6}`} />;
  if (kind === 'ruins') return <rect className="sym sym--ruins" x={-s * 0.5} y={-s * 0.5} width={s} height={s} />;
  return <circle className="sym sym--other" r={s * 0.35} />;
}

function LegendSym({ kind, seen = true }: { kind: Kind; seen?: boolean }) {
  return (
    <svg className="legend-sym" viewBox="-8 -8 16 16" aria-hidden="true">
      <Symbol kind={kind} seen={seen} size={6} />
    </svg>
  );
}

function PlaceMap() {
  const [tab, setTab] = useState<'All' | Region>('All');
  const [hover, setHover] = useState<string | null>(null);

  const shown = useMemo(() => marks.filter((m) => tab === 'All' || m.region === tab), [tab]);

  const { path, project } = useMemo(() => {
    // Fit to what's been visited in this view, padded, with a minimum span.
    const pts = marks.filter((m) => m.seen && (tab === 'All' || m.region === tab));
    const lons = pts.map((m) => m.lon);
    const lats = pts.map((m) => m.lat);
    let [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
    const minSpan = tab === 'All' ? 0 : 2.4;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const sx = Math.max(x1 - x0, minSpan) * 0.58;
    const sy = Math.max(y1 - y0, minSpan) * 0.58;
    [x0, x1, y0, y1] = [cx - sx, cx + sx, cy - sy, cy + sy];
    const proj = geoAzimuthalEqualArea()
      .rotate([-cx, -cy])
      .fitExtent([[16, 16], [W - 16, H - 16]], {
        type: 'MultiPoint',
        coordinates: [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [cx, y0], [cx, y1]],
      });
    return { path: geoPath(proj), project: (lon: number, lat: number) => proj([lon, lat]) };
  }, [tab]);

  // Place labels greedily, skipping any that would overlap one already placed.
  const labels = useMemo(() => {
    if (tab === 'All') return new Map<string, 'r' | 'l'>();
    const boxes: [number, number, number, number][] = [];
    const out = new Map<string, 'r' | 'l'>();
    const order = [...shown].sort((a, b) => Number(b.seen) - Number(a.seen));
    for (const m of order) {
      const xy = project(m.lon, m.lat);
      if (!xy) continue;
      const w = m.name.length * 6.6 + 4;
      for (const side of ['r', 'l'] as const) {
        const x = side === 'r' ? xy[0] + 10 : xy[0] - 10 - w;
        const box: [number, number, number, number] = [x, xy[1] - 9, x + w, xy[1] + 7];
        const hit = boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
        if (!hit && box[0] > 0 && box[2] < W) {
          boxes.push(box, [xy[0] - 6, xy[1] - 6, xy[0] + 6, xy[1] + 6]);
          out.set(m.name, side);
          break;
        }
      }
    }
    return out;
  }, [tab, shown, project]);

  const npSeen = visitedParks.length;
  const seenHere = shown.filter((m) => m.seen);
  const groups = (Object.keys(KIND_LABEL) as Kind[])
    .map((k) => [k, seenHere.filter((m) => m.kind === k)] as const)
    .filter(([, list]) => list.length);
  const size = tab === 'All' ? 6 : 8;
  const jmtLine = { type: 'LineString' as const, coordinates: jmt };
  const grid = geoGraticule().step(tab === 'All' ? [10, 10] : [1, 1])();

  return (
    <div className="places">
      <div className="tabs tabs--wrap" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <p className="places__count mono">
        {tab === 'All'
          ? `${npSeen} of 63 US national parks, plus ${places.length} other places`
          : `${seenHere.length} place${seenHere.length === 1 ? '' : 's'}`}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="places__map" role="img" aria-label={`Map of places I've been: ${tab}`}>
        <g className="land">
          {neighbors.features.map((f, i) => (
            <path key={`n${i}`} d={path(f) ?? undefined} />
          ))}
          {states.features.map((f, i) => (
            <path key={`s${i}`} d={path(f) ?? undefined} />
          ))}
        </g>
        <path className="state-lines" d={path(stateLines) ?? undefined} />
        <path className="graticule" d={path(grid) ?? undefined} />
        {(tab === 'All' || tab === 'California') && (
          <path className="route" d={path(jmtLine) ?? undefined}>
            <title>John Muir Trail</title>
          </path>
        )}
        {shown
          .map((m) => ({ m, xy: project(m.lon, m.lat) }))
          .filter(({ xy }) => xy && xy[0] > -20 && xy[0] < W + 20 && xy[1] > -20 && xy[1] < H + 20)
          .sort((a, b) => Number(a.m.seen) - Number(b.m.seen))
          .map(({ m, xy }) => {
            const side = labels.get(m.name) ?? (hover === m.name ? 'r' : null);
            return (
              <g
                key={m.name}
                className={`mark ${hover === m.name ? 'is-hover' : ''}`}
                transform={`translate(${xy![0]},${xy![1]})`}
                onMouseEnter={() => setHover(m.name)}
                onMouseLeave={() => setHover(null)}
              >
                <circle r={12} className="mark__hit" />
                <Symbol kind={m.kind} seen={m.seen} size={size} />
                {side && (
                  <text x={side === 'r' ? 10 : -10} y={4} textAnchor={side === 'r' ? 'start' : 'end'}>
                    {m.name}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
      <p className="places__legend">
        <LegendSym kind="np" /> US national park <LegendSym kind="np" seen={false} /> not yet{' '}
        <LegendSym kind="park" /> other park <LegendSym kind="summit" /> summit <LegendSym kind="ruins" /> ruins{' '}
        <LegendSym kind="other" /> other
        {(tab === 'All' || tab === 'California') && (
          <>
            {' '}
            <span className="route-key" /> John Muir Trail
          </>
        )}
      </p>
      {tab !== 'All' && (
        <dl className="places__list">
          {groups.map(([k, list]) => (
            <div key={k}>
              <dt>{KIND_LABEL[k]}</dt>
              <dd>
                {list.map((m, i) => (
                  <span key={m.name}>
                    {m.name}
                    {m.note && <span className="muted"> ({m.note})</span>}
                    {i < list.length - 1 && ', '}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

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
      <PlaceMap />
      <h3 className="minor">Summits</h3>
      <Skyline />
    </>
  );
}
