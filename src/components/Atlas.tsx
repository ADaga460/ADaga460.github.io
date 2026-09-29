import { useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { feature, mesh, neighbors as topoNeighbors } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import us from 'us-atlas/states-10m.json';
import neighborsJson from '../geo/neighbors.json';
import Tiles from './Tiles';
import {
  jmt,
  parkNotes,
  parks,
  places,
  regionOfState,
  visitedCountries,
  visitedParks,
  visitedStates,
  type Place,
  type Region,
} from '../data';

const topo = us as unknown as Topology<{ states: GeometryCollection }>;
const states = feature(topo, topo.objects.states) as FeatureCollection;
const stateLines = mesh(topo, topo.objects.states, (a, b) => a !== b);
const countries = neighborsJson as unknown as FeatureCollection;
const jmtLine = { type: 'LineString' as const, coordinates: jmt };

// Web Mercator, laid out as a WORLD x WORLD pixel square so it lines up with map tiles.
const WORLD = 4096;
const proj = geoMercator()
  .scale(WORLD / (2 * Math.PI))
  .translate([WORLD / 2, WORLD / 2]);
const path = geoPath(proj);

// Terrain: Esri World Physical Map (US National Park Service Natural Earth style).
// Tiles stop at level 8; past that they're just scaled up, which keeps it simple.
const TILE_URL = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/${z}/${y}/${x}`;
const MAX_TILE_Z = 8;
const MAX_VIEW_Z = 11;

// Plain mode: atlas-style fills, no two bordering states share a color.
const PALETTE = ['#e6d49c', '#c7dcaa', '#efc39b', '#d4c3e0', '#ecc0bd'];
const PAPER = [0xf3, 0xef, 0xe4];
const fade = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${c.map((v, i) => Math.round(v * 0.28 + PAPER[i] * 0.72)).join(',')})`;
};
const stateFill: string[] = (() => {
  const adj = topoNeighbors(topo.objects.states.geometries);
  const out: number[] = [];
  states.features.forEach((_, i) => {
    const taken = new Set(adj[i].map((j) => out[j]));
    out[i] = PALETTE.findIndex((_, k) => !taken.has(k));
  });
  return out.map((k) => PALETTE[Math.max(k, 0)]);
})();
const COUNTRY_FILL: Record<string, string> = {
  Canada: '#ecc0bd',
  Mexico: '#c7dcaa',
  Guatemala: '#efc39b',
  Belize: '#d4c3e0',
  'El Salvador': '#e6d49c',
  Honduras: '#d4c3e0',
  Nicaragua: '#efc39b',
  'Costa Rica': '#e6d49c',
  Panama: '#d4c3e0',
  Cuba: '#efc39b',
};
const beenStates = new Set(visitedStates);
const beenCountries = new Set(visitedCountries);

type Kind = 'np' | Place['kind'];
type Mark = { name: string; kind: Kind; region: Region; lat: number; lon: number; seen: boolean; note?: string };

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
const seenMarks = marks.filter((m) => m.seen);

// Panning stops at North America: Aleutians to Newfoundland, Arctic coast to Panama.
const NA = [proj([-180, 76])!, proj([-48, 5])!] as [[number, number], [number, number]];
const world = (m: { lon: number; lat: number }) => proj([m.lon, m.lat]) as [number, number];

const REGIONS: Region[] = [
  'California',
  'Southwest',
  'Northwest & Rockies',
  'Hawaii',
  'Alaska',
  'East',
  'Canada',
  'Mexico',
  'Costa Rica',
];
const KIND_ORDER: Kind[] = ['np', 'park', 'hike', 'ruins', 'other'];
// [heading, count noun singular, count noun plural]
const KIND_NAME: Record<Kind, [string, string, string]> = {
  np: ['US national parks', 'US national park', 'US national parks'],
  park: ['Parks', 'park', 'parks'],
  hike: ['Hikes', 'hike', 'hikes'],
  ruins: ['Ruins', 'ruin site', 'ruin sites'],
  other: ['Other', 'other', 'other'],
};
const PRIORITY: Record<Kind, number> = { np: 4, hike: 3, ruins: 3, park: 2, other: 1 };

function Sym({ kind, seen = true, size = 7 }: { kind: Kind; seen?: boolean; size?: number }) {
  const s = size;
  switch (kind) {
    case 'np':
      return (
        <path
          className={seen ? 'sym sym--np' : 'sym sym--np sym--unseen'}
          d={`M0,${-s} L${s * 0.9},${s * 0.6} L${-s * 0.9},${s * 0.6} Z`}
        />
      );
    case 'park':
      return <circle className="sym sym--park" r={s * 0.6} />;
    case 'hike': {
      const d = `M${-s * 0.75},${s * 0.45} L${-s * 0.2},${-s * 0.55} L${s * 0.1},${-s * 0.05} L${s * 0.35},${-s * 0.4} L${s * 0.8},${s * 0.45}`;
      return (
        <>
          <path className="sym sym--halo" d={d} />
          <path className="sym sym--hike" d={d} />
        </>
      );
    }
    case 'ruins':
      return <rect className="sym sym--ruins" x={-s * 0.55} y={-s * 0.55} width={s * 1.1} height={s * 1.1} />;
    default:
      return <circle className="sym sym--other" r={s * 0.45} />;
  }
}

function Icon({ kind, seen }: { kind: Kind; seen?: boolean }) {
  return (
    <svg className="icon" viewBox="-9 -9 18 18" aria-hidden="true">
      <Sym kind={kind} seen={seen} size={7} />
    </svg>
  );
}

const byKind = (list: Mark[]) =>
  KIND_ORDER.map((k) => [k, list.filter((m) => m.kind === k).sort((a, b) => a.name.localeCompare(b.name))] as const).filter(
    ([, l]) => l.length,
  );

// The transform that fits a set of world-pixel points into the frame.
function fit(pts: [number, number][], w: number, h: number, maxK: number) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min(maxK, 0.82 / Math.max((x1 - x0) / w, (y1 - y0) / h, 1e-9));
  return zoomIdentity
    .translate(w / 2, h / 2)
    .scale(k)
    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
}

export default function Atlas() {
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const zoomer = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const engaged = useRef(false);
  const [size, setSize] = useState({ w: 900, h: 560 });
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);
  const [region, setRegion] = useState<Region | 'All'>('All');
  const [hover, setHover] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const [base, setBase] = useState<'terrain' | 'plain'>('terrain');

  // Size the SVG in real pixels so labels stay a readable size on any screen.
  useEffect(() => {
    const el = wrap.current!;
    const measure = () => {
      const w = el.clientWidth;
      setSize({ w, h: Math.round(Math.max(380, Math.min(w * 0.64, 660))) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const home = useMemo(() => fit(seenMarks.map(world), w, h, Infinity), [w, h]);
  const k0 = home.k;
  const maxK = (2 ** MAX_VIEW_Z * 256) / WORLD;
  // Don't zoom out past the point where the frame would show more than North America.
  const minK = Math.min(k0, Math.max(k0 * 0.8, w / (NA[1][0] - NA[0][0]), h / (NA[1][1] - NA[0][1])));

  useEffect(() => {
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([minK, maxK])
      .translateExtent(NA)
      .filter((e: Event) => {
        if (e.type === 'wheel') {
          const ok = engaged.current || (e as WheelEvent).ctrlKey || (e as WheelEvent).metaKey;
          if (!ok) setNudge(true);
          return ok;
        }
        // On touch screens one finger scrolls the page; two fingers move the map.
        if (e.type === 'touchstart') return (e as TouchEvent).touches.length > 1;
        return !(e as MouseEvent).button;
      })
      .on('zoom', (e) => setT(e.transform));
    zoomer.current = z;
    const sel = select(svg.current!).call(z);
    sel.call(z.transform, home);
    setRegion('All');
    return () => {
      sel.on('.zoom', null);
    };
  }, [w, h, home, k0, minK, maxK]);

  useEffect(() => {
    if (!nudge) return;
    const id = setTimeout(() => setNudge(false), 1400);
    return () => clearTimeout(id);
  }, [nudge]);

  const go = (next: ZoomTransform, ms = 700) =>
    select(svg.current!).transition().duration(ms).call(zoomer.current!.transform, next);

  const flyTo = (pts: Mark[], zoomCap: number) => go(fit(pts.map(world), w, h, Math.min(maxK, k0 * zoomCap)));

  const pick = (r: Region | 'All') => {
    setRegion(r);
    if (r === 'All') go(home);
    else flyTo(seenMarks.filter((m) => m.region === r), 30);
  };

  const land = useMemo(
    () => (
      <>
        <g className={base === 'plain' ? 'land' : 'land land--terrain'}>
          {countries.features.map((f, i) => {
            const name = String(f.properties?.name);
            const c = COUNTRY_FILL[name] ?? PALETTE[0];
            return (
              <path
                key={`c${i}`}
                d={path(f) ?? undefined}
                fill={base === 'plain' ? (beenCountries.has(name) ? c : fade(c)) : 'none'}
              />
            );
          })}
          {states.features.map((f, i) => {
            const name = String(f.properties?.name);
            return (
              <path
                key={`s${i}`}
                d={path(f) ?? undefined}
                fill={base === 'plain' ? (beenStates.has(name) ? stateFill[i] : fade(stateFill[i])) : 'none'}
              />
            );
          })}
        </g>
        <path className="state-lines" d={path(stateLines) ?? undefined} />
        <path className="route" d={path(jmtLine) ?? undefined} />
      </>
    ),
    [base],
  );

  // Marks in screen space, with labels placed greedily so none overlap.
  const drawn = useMemo(() => {
    const out = marks
      .map((m) => {
        const p = world(m);
        return { m, x: t.applyX(p[0]), y: t.applyY(p[1]) };
      })
      .filter((d) => d.x > -30 && d.x < w + 30 && d.y > -30 && d.y < h + 30);
    const boxes: number[][] = [];
    const labels = new Map<string, 'r' | 'l'>();
    const order = [...out].sort(
      (a, b) =>
        Number(b.m.name === hover) - Number(a.m.name === hover) ||
        Number(b.m.seen) - Number(a.m.seen) ||
        PRIORITY[b.m.kind] - PRIORITY[a.m.kind],
    );
    for (const d of order) boxes.push([d.x - 7, d.y - 7, d.x + 7, d.y + 7]);
    const allow = t.k >= k0 * 1.8;
    for (const d of order) {
      if (!allow && d.m.name !== hover) continue;
      if (!d.m.seen && d.m.name !== hover) continue;
      const tw = d.m.name.length * 7.4 + 6;
      for (const side of ['r', 'l'] as const) {
        const x = side === 'r' ? d.x + 11 : d.x - 11 - tw;
        const box = [x, d.y - 10, x + tw, d.y + 8];
        const own = (b: number[]) => b[0] === d.x - 7 && b[1] === d.y - 7;
        const hit = boxes.some((b) => !own(b) && box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
        if ((!hit || d.m.name === hover) && box[0] > 2 && box[2] < w - 2) {
          boxes.push(box);
          labels.set(d.m.name, side);
          break;
        }
      }
    }
    return { out: out.sort((a, b) => Number(a.m.seen) - Number(b.m.seen)), labels };
  }, [t, w, h, hover, k0]);

  const symSize = Math.min(9.5, 6 + Math.log2(t.k / k0 + 1));
  const here = region === 'All' ? [] : seenMarks.filter((m) => m.region === region);

  return (
    <div className="atlas">
      <div className="tabs" role="tablist" aria-label="Jump to a region">
        {(['All', ...REGIONS.filter((r) => r !== 'East')] as const).map((r) => (
          <button key={r} role="tab" aria-selected={region === r} onClick={() => pick(r)}>
            {r}
          </button>
        ))}
      </div>
      <p className="atlas__count mono">
        {visitedParks.length} of 63 US national parks · {places.filter((p) => p.kind === 'hike').length} hikes ·{' '}
        {visitedStates.length} states · {visitedCountries.length + 1} countries
      </p>

      <div
        ref={wrap}
        className={`atlas__frame atlas__frame--${base}`}
        onPointerDown={() => {
          engaged.current = true;
          setNudge(false);
        }}
        onPointerLeave={() => (engaged.current = false)}
      >
        {base === 'terrain' && <Tiles t={t} w={w} h={h} world={WORLD} maxZ={MAX_TILE_Z} url={TILE_URL} />}
        <svg ref={svg} width={w} height={h} className="atlas__map" role="img" aria-label="Map of places I've been">
          {base === 'plain' && <rect width={w} height={h} className="water" />}
          <g transform={t.toString()}>{land}</g>
          {drawn.out.map(({ m, x, y }) => {
            const side = drawn.labels.get(m.name);
            return (
              <g
                key={m.name}
                className={`mark ${hover === m.name ? 'is-hover' : ''}`}
                transform={`translate(${x},${y})`}
                onMouseEnter={() => setHover(m.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => flyTo([m], 60)}
              >
                <circle r={11} className="mark__hit" />
                <Sym kind={m.kind} seen={m.seen} size={m.seen ? symSize : symSize * 0.8} />
                {side && (
                  <text x={side === 'r' ? 11 : -11} y={5} textAnchor={side === 'r' ? 'start' : 'end'}>
                    {m.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="atlas__controls">
          <button aria-label="Zoom in" onClick={() => select(svg.current!).transition().duration(250).call(zoomer.current!.scaleBy, 1.8)}>
            +
          </button>
          <button aria-label="Zoom out" onClick={() => select(svg.current!).transition().duration(250).call(zoomer.current!.scaleBy, 1 / 1.8)}>
            −
          </button>
          <button aria-label="Reset map" onClick={() => pick('All')}>
            ⟲
          </button>
        </div>
        <div className="atlas__layers" role="group" aria-label="Base map">
          <button aria-pressed={base === 'terrain'} onClick={() => setBase('terrain')}>
            Terrain
          </button>
          <button aria-pressed={base === 'plain'} onClick={() => setBase('plain')}>
            Plain
          </button>
        </div>
        {base === 'terrain' && (
          <div className="atlas__credit">
            Tiles ©{' '}
            <a href="https://www.esri.com" target="_blank" rel="noreferrer">
              Esri
            </a>
            . Source: US National Park Service
          </div>
        )}
        <div className={`atlas__nudge ${nudge ? 'is-on' : ''}`} aria-hidden="true">
          Click the map first to zoom with the scroll wheel
        </div>
      </div>
      <p className="atlas__help">
        Drag to move. Pinch, or click the map and scroll, to zoom. Click any place to zoom to it.
        {base === 'plain' && " Colored states and countries are ones I've been to."}
      </p>

      <div className="atlas__legend">
        <span>
          <Icon kind="np" /> US national park
        </span>
        <span>
          <Icon kind="np" seen={false} /> not yet
        </span>
        <span>
          <Icon kind="park" /> other park
        </span>
        <span>
          <Icon kind="hike" /> hike
        </span>
        <span>
          <Icon kind="ruins" /> ruins
        </span>
        <span>
          <Icon kind="other" /> other
        </span>
        <span>
          <span className="route-key" /> John Muir Trail
        </span>
      </div>

      {region === 'All' ? (
        <div className="atlas__index">
          {REGIONS.map((r) => {
            const list = seenMarks.filter((m) => m.region === r);
            if (!list.length) return null;
            return (
              <button key={r} onClick={() => pick(r)}>
                <span className="atlas__index-name">{r}</span>
                <span className="atlas__index-counts">
                  {byKind(list)
                    .map(([k, l]) => `${l.length} ${KIND_NAME[k][l.length === 1 ? 1 : 2]}`)
                    .join(' · ')}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="atlas__list">
          {byKind(here).map(([k, list]) => (
            <section key={k} className="atlas__group">
              <h4>
                {KIND_NAME[k][0]} <span className="muted mono">{list.length}</span>
              </h4>
              <ul>
                {list.map((m) => (
                  <li key={m.name}>
                    <button
                      className={hover === m.name ? 'is-hover' : ''}
                      onMouseEnter={() => setHover(m.name)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(m.name)}
                      onBlur={() => setHover(null)}
                      onClick={() => {
                        flyTo([m], 60);
                        wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    >
                      <Icon kind={m.kind} />
                      <span>
                        {m.name}
                        {m.note && <span className="atlas__note">{m.note}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
