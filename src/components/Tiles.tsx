import { useEffect, useReducer } from 'react';
import type { ZoomTransform } from 'd3-zoom';

// Loaded tiles stay decoded in memory, so revisiting a zoom level is instant.
// While a tile loads, the closest loaded tile covering the same spot is drawn
// instead: sharper children if we just zoomed out, a blurrier parent otherwise.

const loaded = new Map<string, HTMLImageElement>();
const inflight = new Map<string, HTMLImageElement>();
const failed = new Set<string>();
const listeners = new Set<() => void>();
const MAX_CACHED = 900;

function request(key: string, url: string) {
  if (loaded.has(key) || inflight.has(key) || failed.has(key)) return;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    inflight.delete(key);
    loaded.set(key, img);
    // Map keeps insertion order, so the first entries are the oldest.
    if (loaded.size > MAX_CACHED) loaded.delete(loaded.keys().next().value!);
    listeners.forEach((f) => f());
  };
  img.onerror = () => {
    inflight.delete(key);
    failed.add(key);
  };
  inflight.set(key, img);
  img.src = url;
}

type Props = {
  t: ZoomTransform;
  w: number;
  h: number;
  world: number; // world size in px at t.k = 1
  maxZ: number;
  url: (z: number, x: number, y: number) => string;
};

type Draw = { key: string; src: string; x: number; y: number; s: number };

const zoomFor = (k: number, world: number, maxZ: number) =>
  Math.max(0, Math.min(maxZ, Math.round(Math.log2((k * world) / 256))));

// Tile coords (unwrapped x) covering the viewport at level z.
function cover(t: ZoomTransform, w: number, h: number, world: number, z: number) {
  const n = 2 ** z;
  const s = (t.k * world) / n;
  const out: [number, number][] = [];
  const y0 = Math.max(0, Math.floor(-t.y / s));
  const y1 = Math.min(n - 1, Math.floor((h - t.y) / s));
  for (let y = y0; y <= y1; y++)
    for (let x = Math.floor(-t.x / s); x <= Math.floor((w - t.x) / s); x++) out.push([x, y]);
  return out;
}

export default function Tiles({ t, w, h, world, maxZ, url }: Props) {
  const [, redraw] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    let raf = 0;
    const f = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(redraw);
    };
    listeners.add(f);
    return () => {
      listeners.delete(f);
      cancelAnimationFrame(raf);
    };
  }, []);

  const z = zoomFor(t.k, world, maxZ);
  const wrap = (x: number, zz: number) => ((x % 2 ** zz) + 2 ** zz) % 2 ** zz;
  const key = (zz: number, x: number, y: number) => `${zz}/${wrap(x, zz)}/${y}`;
  const place = (zz: number, x: number, y: number): Draw => {
    const s = (t.k * world) / 2 ** zz;
    const k = key(zz, x, y);
    return { key: `${zz}/${x}/${y}`, src: loaded.get(k)?.src ?? url(zz, wrap(x, zz), y), x: t.x + x * s, y: t.y + y * s, s };
  };

  const back: Draw[] = [];
  const mid: Draw[] = [];
  const front: Draw[] = [];
  const seenBack = new Set<string>();

  for (const [x, y] of cover(t, w, h, world, z)) {
    const k = key(z, x, y);
    request(k, url(z, wrap(x, z), y));
    if (loaded.has(k)) {
      front.push(place(z, x, y));
      continue;
    }
    // Children one level down, if they're all here.
    if (z < maxZ) {
      const kids: [number, number][] = [
        [2 * x, 2 * y],
        [2 * x + 1, 2 * y],
        [2 * x, 2 * y + 1],
        [2 * x + 1, 2 * y + 1],
      ];
      if (kids.every(([cx, cy]) => loaded.has(key(z + 1, cx, cy)))) {
        kids.forEach(([cx, cy]) => mid.push(place(z + 1, cx, cy)));
        continue;
      }
    }
    // Otherwise the nearest loaded ancestor, stretched to fit.
    for (let zz = z - 1; zz >= 0; zz--) {
      const f = 2 ** (z - zz);
      const ax = Math.floor(x / f);
      const ay = Math.floor(y / f);
      if (loaded.has(key(zz, ax, ay))) {
        const id = `${zz}/${ax}/${ay}`;
        if (!seenBack.has(id)) {
          seenBack.add(id);
          back.push(place(zz, ax, ay));
        }
        break;
      }
    }
  }

  // Once the view settles, warm up one level in and one level out.
  const settle = `${Math.round(t.x)},${Math.round(t.y)},${t.k.toFixed(3)},${w},${h}`;
  useEffect(() => {
    const id = setTimeout(() => {
      for (const zz of [z + 1, z - 1]) {
        if (zz < 0 || zz > maxZ) continue;
        const tiles = cover(t, w, h, world, zz);
        if (tiles.length > 48) continue;
        for (const [x, y] of tiles) request(key(zz, x, y), url(zz, wrap(x, zz), y));
      }
    }, 350);
    return () => clearTimeout(id);
  }, [settle]);

  return (
    <div className="atlas__tiles" aria-hidden="true">
      {[...back, ...mid, ...front].map((d) => (
        <img
          key={d.key}
          src={d.src}
          alt=""
          draggable={false}
          style={{ left: d.x, top: d.y, width: d.s + 0.5, height: d.s + 0.5 }}
        />
      ))}
    </div>
  );
}
