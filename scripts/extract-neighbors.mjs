// Pulls Canada, Mexico, and Central America out of world-atlas into a small
// GeoJSON file for the Outside map. Run: node scripts/extract-neighbors.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const KEEP = {
  124: 'Canada', 484: 'Mexico', 320: 'Guatemala', 84: 'Belize', 340: 'Honduras',
  222: 'El Salvador', 558: 'Nicaragua', 188: 'Costa Rica', 591: 'Panama', 192: 'Cuba',
};
const world = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const all = feature(world, world.objects.countries);

const round = (ring) => ring.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
// Shoelace area in square degrees; used to drop specks of islands.
const area = (ring) => Math.abs(ring.reduce((s, [x, y], i) => {
  const [x2, y2] = ring[(i + 1) % ring.length];
  return s + x * y2 - x2 * y;
}, 0)) / 2;

const features = all.features
  .filter((f) => KEEP[+f.id])
  .map((f) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const kept = polys.filter((p) => area(p[0]) > 0.05).map((p) => p.map(round));
    return { type: 'Feature', id: f.id, properties: { name: KEEP[+f.id] },
             geometry: { type: 'MultiPolygon', coordinates: kept } };
  });

writeFileSync('src/geo/neighbors.json', JSON.stringify({ type: 'FeatureCollection', features }));
console.log(features.map((f) => f.properties.name).join(', '));
