import { useEffect, useMemo, useRef, useState } from 'react';
import { geoAzimuthalEqualArea, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import us from 'us-atlas/states-10m.json';
import neighborsJson from '../geo/neighbors.json';
import { jmt, parkNotes, parks, places, regionOfState, visitedParks, type Place, type Region } from '../data';

const topo = us as unknown as Topology<{ states: GeometryCollection }>;
const states = feature(topo, topo.objects.states) as FeatureCollection;
const stateLines = mesh(topo, topo.objects.states, (a, b) => a !== b);
const neighbors = neighborsJson as unknown as FeatureCollection;
const jmtLine = { type: 'LineString' as const, coordinates: jmt };

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
const KIND_ORDER: Kind[] = ['np', 'park', 'summit', 'ruins', 'other'];
const KIND_NAME: Record<Kind, string> = {
  np: 'US national park',
  park: 'Park',
  summit: 'Summit',
  ruins: 'Ruins',
  other: 'Other',
};
// Label priority when two would overlap.
const PRIORITY: Record<Kind, number> = { np: 4, summit: 3, ruins: 3, park: 2, other: 1 };

export function Sym({ kind, seen = true, size = 7 }: { kind: Kind; seen?: boolean; size?: number }) {
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
    case 'summit':
      return (
        <path
          className="sym sym--summit"
          d={`M${-s * 0.6},${-s * 0.6} L${s * 0.6},${s * 0.6} M${s * 0.6},${-s * 0.6} L${-s * 0.6},${s * 0.6}`}
        />
      );
    case 'ruins':
      return <rect className="sym sym--ruins" x={-s * 0.55} y={-s * 0.55} width={s * 1.1} height={s * 1.1} />;
    default:
      return <circle className="sym sym--other" r={s * 0.4} />;
  }
}

function Icon({ kind, seen }: { kind: Kind; seen?: boolean }) {
  return (
    <svg className="icon" viewBox="-9 -9 18 18" aria-hidden="true">
      <Sym kind={kind} seen={seen} size={7} />
    </svg>
  );
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

  // Size the SVG in real pixels so labels stay a readable size on any screen.
  useEffect(() => {
    const el = wrap.current!;
    const measure = () => {
      const w = el.clientWidth;
      setSize({ w, h: Math.round(Math.max(360, Math.min(w * 0.62, 640))) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const { projectXY, land } = useMemo(() => {
    const lons = seenMarks.map((m) => m.lon);
    const lats = seenMarks.map((m) => m.lat);
    const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];
    const proj = geoAzimuthalEqualArea()
      .rotate([-(x0 + x1) / 2, -(y0 + y1) / 2])
      .fitExtent([[20, 20], [w - 20, h - 20]], {
        type: 'MultiPoint',
        coordinates: [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [(x0 + x1) / 2, y1 + 4]],
      });
    const path = geoPath(proj);
    const land = (
      <>
        <g className="land">
          {neighbors.features.map((f, i) => (
            <path key={`n${i}`} d={path(f) ?? undefined} />
          ))}
          {states.features.map((f, i) => (
            <path key={`s${i}`} d={path(f) ?? undefined} />
          ))}
        </g>
        <path className="state-lines" d={path(stateLines) ?? undefined} />
        <path className="route" d={path(jmtLine) ?? undefined} />
      </>
    );
    return { projectXY: (m: { lon: number; lat: number }) => proj([m.lon, m.lat]), land };
  }, [w, h]);

  useEffect(() => {
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 80])
      .translateExtent([[-w * 0.25, -h * 0.25], [w * 1.25, h * 1.25]])
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
    sel.call(z.transform, zoomIdentity);
    return () => {
      sel.on('.zoom', null);
    };
  }, [w, h]);

  useEffect(() => {
    if (!nudge) return;
    const id = setTimeout(() => setNudge(false), 1400);
    return () => clearTimeout(id);
  }, [nudge]);

  const flyTo = (pts: Mark[], maxK = 14) => {
    const xy = pts.map(projectXY).filter(Boolean) as [number, number][];
    if (!xy.length || !zoomer.current) return;
    const xs = xy.map((p) => p[0]);
    const ys = xy.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const k = Math.max(1, Math.min(maxK, 0.75 / Math.max((x1 - x0) / w, (y1 - y0) / h, 1 / maxK)));
    const next = zoomIdentity
      .translate(w / 2, h / 2)
      .scale(k)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    select(svg.current!).transition().duration(700).call(zoomer.current.transform, next);
  };

  const pick = (r: Region | 'All') => {
    setRegion(r);
    if (r === 'All') select(svg.current!).transition().duration(700).call(zoomer.current!.transform, zoomIdentity);
    else flyTo(seenMarks.filter((m) => m.region === r));
  };

  // Marks in screen space, with labels placed greedily so none overlap.
  const drawn = useMemo(() => {
    const out = marks
      .map((m) => {
        const p = projectXY(m);
        return p ? { m, x: t.applyX(p[0]), y: t.applyY(p[1]) } : null;
      })
      .filter((d): d is { m: Mark; x: number; y: number } => !!d && d.x > -30 && d.x < w + 30 && d.y > -30 && d.y < h + 30);
    const boxes: number[][] = [];
    const labels = new Map<string, 'r' | 'l'>();
    const order = [...out].sort(
      (a, b) =>
        Number(b.m.name === hover) - Number(a.m.name === hover) ||
        Number(b.m.seen) - Number(a.m.seen) ||
        PRIORITY[b.m.kind] - PRIORITY[a.m.kind],
    );
    for (const d of order) boxes.push([d.x - 7, d.y - 7, d.x + 7, d.y + 7]);
    const allow = t.k >= 1.8;
    for (const d of order) {
      if (!allow && d.m.name !== hover) continue;
      if (!d.m.seen && d.m.name !== hover) continue;
      const tw = d.m.name.length * 7.4 + 6;
      for (const side of ['r', 'l'] as const) {
        const x = side === 'r' ? d.x + 11 : d.x - 11 - tw;
        const box = [x, d.y - 10, x + tw, d.y + 8];
        const selfBox = (b: number[]) => b[0] === d.x - 7 && b[1] === d.y - 7;
        const hit = boxes.some((b) => !selfBox(b) && box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
        if ((!hit || d.m.name === hover) && box[0] > 2 && box[2] < w - 2) {
          boxes.push(box);
          labels.set(d.m.name, side);
          break;
        }
      }
    }
    return { out: out.sort((a, b) => Number(a.m.seen) - Number(b.m.seen)), labels };
  }, [t, projectXY, w, h, hover]);

  const listRegions = region === 'All' ? REGIONS : [region];
  const symSize = Math.min(9, 5.5 + t.k * 0.35);

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
        {visitedParks.length} of 63 US national parks · {places.length} other places
      </p>

      <div
        ref={wrap}
        className="atlas__frame"
        onPointerDown={() => {
          engaged.current = true;
          setNudge(false);
        }}
        onPointerLeave={() => (engaged.current = false)}
      >
        <svg ref={svg} width={w} height={h} className="atlas__map" role="img" aria-label="Map of places I've been">
          <rect width={w} height={h} className="water" />
          <g transform={t.toString()}>{land}</g>
          {drawn.out.map(({ m, x, y }) => {
            const side = drawn.labels.get(m.name);
            return (
              <g
                key={m.name}
                className={`mark ${hover === m.name ? 'is-hover' : ''} ${m.seen ? '' : 'mark--unseen'}`}
                transform={`translate(${x},${y})`}
                onMouseEnter={() => setHover(m.name)}
                onMouseLeave={() => setHover(null)}
                onClick={() => flyTo([m], 10)}
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
        <div className={`atlas__nudge ${nudge ? 'is-on' : ''}`} aria-hidden="true">
          Click the map first to zoom with the scroll wheel
        </div>
      </div>
      <p className="atlas__help">
        Drag to move. Pinch, or click the map and scroll, to zoom. Click any place to zoom to it.
      </p>

      <div className="atlas__legend">
        <span><Icon kind="np" /> US national park</span>
        <span><Icon kind="np" seen={false} /> not yet</span>
        <span><Icon kind="park" /> park</span>
        <span><Icon kind="summit" /> summit</span>
        <span><Icon kind="ruins" /> ruins</span>
        <span><Icon kind="other" /> other</span>
        <span><span className="route-key" /> John Muir Trail</span>
      </div>

      <div className={`atlas__list ${region === 'All' ? '' : 'is-single'}`}>
        {listRegions.map((r) => {
          const items = seenMarks
            .filter((m) => m.region === r)
            .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name));
          if (!items.length) return null;
          return (
            <section key={r} className="atlas__group">
              <h4>
                {r} <span className="muted mono">{items.length}</span>
              </h4>
              <ul>
                {items.map((m) => (
                  <li key={m.name}>
                    <button
                      className={hover === m.name ? 'is-hover' : ''}
                      onMouseEnter={() => setHover(m.name)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(m.name)}
                      onBlur={() => setHover(null)}
                      onClick={() => {
                        flyTo([m], 10);
                        wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      title={KIND_NAME[m.kind]}
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
          );
        })}
      </div>
    </div>
  );
}
