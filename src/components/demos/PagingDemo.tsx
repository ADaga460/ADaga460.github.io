import { useMemo, useState } from 'react';

const PRESETS = [
  { label: 'VGA text buffer', addr: '0xB8000' },
  { label: 'kernel @ 1 MiB', addr: '0x100000' },
  { label: 'just past 3 GiB', addr: '0xC0FFEE00' },
  { label: 'non-canonical', addr: '0x0000900000000000' },
];

const LEVELS = [
  { name: 'PML4', hi: 47, lo: 39, kind: 'l4' },
  { name: 'PDPT', hi: 38, lo: 30, kind: 'l3' },
  { name: 'PD', hi: 29, lo: 21, kind: 'l2' },
  { name: 'PT', hi: 20, lo: 12, kind: 'l1' },
];

const bits = (v: bigint, hi: number, lo: number) => (v >> BigInt(lo)) & ((1n << BigInt(hi - lo + 1)) - 1n);
const hex = (v: bigint, pad = 0) => '0x' + v.toString(16).toUpperCase().padStart(pad, '0');

function parse(input: string): bigint | null {
  const s = input.trim().replace(/_/g, '');
  if (!/^(0x)?[0-9a-fA-F]{1,16}$/.test(s)) return null;
  return BigInt(s.startsWith('0x') ? s : '0x' + s);
}

export default function PagingDemo() {
  const [input, setInput] = useState('0xB8000');
  const [huge, setHuge] = useState(false);
  const va = parse(input);

  const result = useMemo(() => {
    if (va === null) return null;
    // Canonical: bits 63..48 must all equal bit 47.
    const top = bits(va, 63, 47);
    const canonical = top === 0n || top === (1n << 17n) - 1n;
    const levels = huge ? LEVELS.slice(0, 3) : LEVELS;
    const offBits = huge ? 21 : 12;
    return {
      canonical,
      levels: levels.map((l) => ({ ...l, index: Number(bits(va, l.hi, l.lo)) })),
      offBits,
      offset: bits(va, offBits - 1, 0),
    };
  }, [va, huge]);

  // One cell per bit, 47 → 0, colored by which field it belongs to.
  const strip = useMemo(() => {
    if (va === null) return [];
    return Array.from({ length: 48 }, (_, k) => {
      const b = 47 - k;
      let kind = 'off';
      for (const l of huge ? LEVELS.slice(0, 3) : LEVELS) if (b <= l.hi && b >= l.lo) kind = l.kind;
      return { b, on: (va >> BigInt(b)) & 1n, kind };
    });
  }, [va, huge]);

  return (
    <div className="demo">
      <p className="demo__intro">
        The kernel sets up 4-level paging with an identity map, so every virtual address maps to
        the same physical address. Type a virtual address to see how the MMU splits it into table
        indices and walks from CR3 down to a physical frame.
      </p>
      <div className="demo__controls">
        <label>
          virtual address
          <input value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className="mono" />
        </label>
        <div className="seg-toggle">
          <button className={!huge ? 'is-active' : ''} onClick={() => setHuge(false)}>
            4 KiB pages
          </button>
          <button className={huge ? 'is-active' : ''} onClick={() => setHuge(true)}>
            2 MiB pages
          </button>
        </div>
      </div>
      <div className="presets">
        {PRESETS.map((p) => (
          <button key={p.addr} className="chip chip--btn" onClick={() => setInput(p.addr)}>
            {p.label}
          </button>
        ))}
      </div>

      {va === null && <p className="demo__err mono">✗ not a hex address (up to 64 bits)</p>}

      {result && (
        <>
          <div className="bitstrip mono" aria-label="Address bits 47 to 0">
            {strip.map((c) => (
              <span key={c.b} className={`bit bit--${c.kind} ${c.on ? 'is-on' : ''}`} title={`bit ${c.b}`}>
                {c.on.toString()}
              </span>
            ))}
          </div>
          <div className="bitstrip__legend mono">
            {result.levels.map((l) => (
              <span key={l.name} className={`legend legend--${l.kind}`}>
                {l.name} [{l.hi}:{l.lo}]
              </span>
            ))}
            <span className="legend legend--off">offset [{result.offBits - 1}:0]</span>
          </div>

          {!result.canonical ? (
            <p className="demo__err mono">
              ✗ #GP: non-canonical address. Bits 63:48 must sign-extend bit 47, so the CPU faults
              before any table is touched. That's exception vector 13 in the IDT.
            </p>
          ) : (
            <ol className="walk mono">
              <li>
                <span className="muted">CR3</span> → PML4 base
              </li>
              {result.levels.map((l) => (
                <li key={l.name} className={`walk__${l.kind}`}>
                  {l.name}[<strong>{l.index}</strong>] →{' '}
                  {l.name === 'PT' || (huge && l.name === 'PD') ? 'frame' : 'next table'}
                </li>
              ))}
              <li className="walk__off">
                + offset <strong>{hex(result.offset)}</strong>
              </li>
              <li className="walk__pa">
                physical = <strong>{hex(va!)}</strong> <span className="muted">(identity-mapped)</span>
              </li>
            </ol>
          )}
        </>
      )}
    </div>
  );
}
