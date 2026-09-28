import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

// A generated USGS-style topo map. Hover reads elevation, click drops a benchmark.

const CELL = 5; // px per grid cell
const WATER = 0.3; // normalized elevation of the waterline
const LEVELS = 40; // contour lines between 0 and 1
const FT_MIN = 620;
const FT_MAX = 4820;
// Fake the sheet onto the State College quad so the readout looks right.
const LAT0 = 40.8125;
const LAT1 = 40.75;
const LON0 = -77.9375;
const LON1 = -77.8125;

const toFeet = (h: number) => Math.round(FT_MIN + h * (FT_MAX - FT_MIN));

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number) {
  const rand = rng(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number, x: number, y: number) => {
    const g = h & 3;
    return (g & 1 ? -x : x) + (g & 2 ? -y : y);
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const perlin = (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return x1 + v * (x2 - x1); // roughly -1..1
  };
  return (x: number, y: number, octaves = 5) => {
    let amp = 1;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * perlin(x * freq, y * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}

type Field = { cols: number; rows: number; h: Float32Array; veg: Float32Array };

function buildField(w: number, h: number, seed: number): Field {
  const cols = Math.ceil(w / CELL) + 1;
  const rows = Math.ceil(h / CELL) + 1;
  const elev = makeNoise(seed);
  const woods = makeNoise(seed + 99);
  const H = new Float32Array(cols * rows);
  const V = new Float32Array(cols * rows);
  const scale = 1 / 260; // noise units per px
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * CELL * scale;
      const y = j * CELL * scale;
      // Ridge-and-valley bias, a bit like central PA.
      const ridge = Math.sin(x * 0.9 + y * 0.35 + elev(x * 0.2, y * 0.2, 2) * 2) * 0.18;
      let v = elev(x, y, 4) * 1.05 + ridge + 0.5;
      v = Math.min(Math.max(v, 0), 1);
      H[j * cols + i] = v;
      V[j * cols + i] = woods(x * 1.6, y * 1.6, 3);
    }
  }
  return { cols, rows, h: H, veg: V };
}

function drawMap(ctx: CanvasRenderingContext2D, f: Field, css: Record<string, string>) {
  const { cols, rows, h, veg } = f;
  const at = (i: number, j: number) => h[j * cols + i];

  ctx.fillStyle = css.paper;
  ctx.fillRect(0, 0, cols * CELL, rows * CELL);

  // Woodland tint and water fill, cell by cell.
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const e = at(i, j);
      if (e < WATER) {
        ctx.fillStyle = css.waterFill;
        ctx.fillRect(i * CELL, j * CELL, CELL + 0.5, CELL + 0.5);
      } else if (veg[j * cols + i] > 0.08 && e < 0.82) {
        ctx.fillStyle = css.woods;
        ctx.fillRect(i * CELL, j * CELL, CELL + 0.5, CELL + 0.5);
      }
    }
  }

  // Marching squares, one path per contour level.
  const seg = (level: number) => {
    ctx.beginPath();
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = at(i, j);
        const b = at(i + 1, j);
        const c = at(i + 1, j + 1);
        const d = at(i, j + 1);
        let idx = 0;
        if (a > level) idx |= 8;
        if (b > level) idx |= 4;
        if (c > level) idx |= 2;
        if (d > level) idx |= 1;
        if (idx === 0 || idx === 15) continue;
        const x = i * CELL;
        const y = j * CELL;
        const lerp = (p: number, q: number) => (level - p) / (q - p);
        const top: [number, number] = [x + CELL * lerp(a, b), y];
        const right: [number, number] = [x + CELL, y + CELL * lerp(b, c)];
        const bottom: [number, number] = [x + CELL * lerp(d, c), y + CELL];
        const left: [number, number] = [x, y + CELL * lerp(a, d)];
        const line = (p: [number, number], q: [number, number]) => {
          ctx.moveTo(p[0], p[1]);
          ctx.lineTo(q[0], q[1]);
        };
        switch (idx) {
          case 1: case 14: line(left, bottom); break;
          case 2: case 13: line(bottom, right); break;
          case 3: case 12: line(left, right); break;
          case 4: case 11: line(top, right); break;
          case 6: case 9: line(top, bottom); break;
          case 7: case 8: line(left, top); break;
          case 5: line(left, top); line(bottom, right); break;
          case 10: line(top, right); line(left, bottom); break;
        }
      }
    }
    ctx.stroke();
  };

  ctx.lineJoin = 'round';
  for (let k = 1; k < LEVELS; k++) {
    const level = k / LEVELS;
    if (level < WATER) continue;
    const index = k % 5 === 0;
    ctx.strokeStyle = index ? css.contourIndex : css.contour;
    ctx.lineWidth = index ? 1.25 : 0.6;
    seg(level);
  }
  ctx.strokeStyle = css.water;
  ctx.lineWidth = 1.3;
  seg(WATER);

  // Spot heights on local maxima.
  const spots: { i: number; j: number; e: number }[] = [];
  const R = 14;
  for (let j = R; j < rows - R; j += 2) {
    for (let i = R; i < cols - R; i += 2) {
      const e = at(i, j);
      if (e < 0.7) continue;
      let top = true;
      for (let dj = -R; dj <= R && top; dj += 2)
        for (let di = -R; di <= R; di += 2)
          if (at(i + di, j + dj) > e) {
            top = false;
            break;
          }
      // Flat summits pass the test at several neighbouring cells; keep one.
      if (top && !spots.some((s) => Math.abs(s.i - i) < 2 * R && Math.abs(s.j - j) < 2 * R))
        spots.push({ i, j, e });
    }
  }
  ctx.font = `500 11px ${css.mono}`;
  for (const s of spots.slice(0, 12)) {
    const x = s.i * CELL;
    const y = s.j * CELL;
    ctx.fillStyle = css.ink;
    ctx.fillText('×', x - 3, y + 4);
    ctx.fillStyle = css.contourIndex;
    ctx.fillText(toFeet(s.e).toLocaleString(), x + 6, y + 4);
  }
}

export default function Topo() {
  const wrap = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLCanvasElement>(null);
  const field = useRef<Field | null>(null);
  const marks = useRef<{ x: number; y: number; ft: number }[]>([]);
  const [seed, setSeed] = useState(1872);
  const [read, setRead] = useState<{ lat: string; lon: string; ft: number } | null>(null);

  const css = useCallback(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim();
    return {
      paper: v('--paper'),
      ink: v('--ink'),
      contour: v('--contour'),
      contourIndex: v('--contour-index'),
      water: v('--water'),
      waterFill: v('--water-fill'),
      woods: v('--woods'),
      mono: v('--mono'),
      red: v('--red'),
    };
  }, []);

  const drawOverlay = useCallback(
    (cursor?: { x: number; y: number }) => {
      const c = over.current;
      if (!c) return;
      const ctx = c.getContext('2d')!;
      const dpr = c.width / c.clientWidth;
      const colors = css();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
      ctx.font = `500 11px ${colors.mono}`;
      for (const m of marks.current) {
        ctx.fillStyle = colors.red;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y - 6);
        ctx.lineTo(m.x + 5, m.y + 3);
        ctx.lineTo(m.x - 5, m.y + 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = colors.ink;
        ctx.fillText(`BM ${m.ft.toLocaleString()}`, m.x + 8, m.y + 3);
      }
      if (cursor) {
        ctx.strokeStyle = colors.red;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cursor.x - 10, cursor.y);
        ctx.lineTo(cursor.x - 3, cursor.y);
        ctx.moveTo(cursor.x + 3, cursor.y);
        ctx.lineTo(cursor.x + 10, cursor.y);
        ctx.moveTo(cursor.x, cursor.y - 10);
        ctx.lineTo(cursor.x, cursor.y - 3);
        ctx.moveTo(cursor.x, cursor.y + 3);
        ctx.lineTo(cursor.x, cursor.y + 10);
        ctx.stroke();
      }
    },
    [css],
  );

  useEffect(() => {
    const el = wrap.current!;
    const render = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [base.current!, over.current!]) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      const ctx = base.current!.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field.current = buildField(w, h, seed);
      drawMap(ctx, field.current, css());
      drawOverlay();
    };
    render();
    let last = el.clientWidth;
    const ro = new ResizeObserver(() => {
      // Only rebuild on width changes; height is fixed by CSS.
      if (el.clientWidth !== last) {
        last = el.clientWidth;
        marks.current = [];
        render();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [seed, css, drawOverlay]);

  const sample = (e: ReactPointerEvent<HTMLDivElement>) => {
    const f = field.current;
    if (!f) return null;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const i = Math.min(Math.max(Math.round(x / CELL), 0), f.cols - 1);
    const j = Math.min(Math.max(Math.round(y / CELL), 0), f.rows - 1);
    const hgt = f.h[j * f.cols + i];
    const lat = LAT0 + (LAT1 - LAT0) * (y / r.height);
    const lon = LON0 + (LON1 - LON0) * (x / r.width);
    return { x, y, ft: toFeet(Math.max(hgt, WATER)), water: hgt < WATER, lat, lon };
  };

  const dms = (deg: number, pos: string, neg: string) => {
    const a = Math.abs(deg);
    const d = Math.floor(a);
    const m = Math.floor((a - d) * 60);
    const s = Math.round(((a - d) * 60 - m) * 60);
    return `${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″ ${deg >= 0 ? pos : neg}`;
  };

  return (
    <figure className="topo">
      <div
        ref={wrap}
        className="topo__map"
        onPointerMove={(e) => {
          const s = sample(e);
          if (!s) return;
          setRead({ lat: dms(s.lat, 'N', 'S'), lon: dms(s.lon, 'E', 'W'), ft: s.ft });
          drawOverlay(s);
        }}
        onPointerLeave={() => {
          setRead(null);
          drawOverlay();
        }}
        onPointerDown={(e) => {
          const s = sample(e);
          if (!s || s.water) return;
          marks.current.push({ x: s.x, y: s.y, ft: s.ft });
          drawOverlay(s);
        }}
      >
        <canvas ref={base} aria-hidden="true" />
        <canvas ref={over} aria-hidden="true" />
      </div>
      <figcaption className="topo__caption">
        <span className="topo__read">
          {read ? (
            <>
              {read.lat}&nbsp;&nbsp;{read.lon}&nbsp;&nbsp;<b>{read.ft.toLocaleString()} ft</b>
            </>
          ) : (
            'Hover for elevation. Click to set a benchmark.'
          )}
        </span>
        <button
          className="linkbtn"
          onClick={() => {
            marks.current = [];
            setSeed((s) => (s * 7919 + 13) % 100000);
          }}
        >
          new terrain
        </button>
      </figcaption>
    </figure>
  );
}
