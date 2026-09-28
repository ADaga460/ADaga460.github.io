import { useMemo, useState } from 'react';

// Mirrors include/protocol.h + src/protocol.cpp in ADaga460/dist-kv-store:
//   frame   = u32 BE length | payload
//   request = u8 cmd | u32 LE key_len | key | u32 LE val_len | value
//   response= u8 status | u32 LE data_len | data
const CMD = { SET: 0x01, GET: 0x02 } as const;
const STATUS = { OK: 0x00, NOT_FOUND: 0x01, ERR: 0x02 } as const;
type Cmd = keyof typeof CMD;

type Seg = { label: string; bytes: number[]; kind: string };

const enc = new TextEncoder();
const u32le = (n: number) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
const u32be = (n: number) => u32le(n).reverse();
const hex = (b: number) => b.toString(16).padStart(2, '0');

function frame(payload: Seg[]): Seg[] {
  const len = payload.reduce((s, p) => s + p.bytes.length, 0);
  return [{ label: `frame len = ${len} (BE)`, bytes: u32be(len), kind: 'frame' }, ...payload];
}

function Frame({ segs }: { segs: Seg[] }) {
  return (
    <div className="frame">
      {segs.map((s, i) => (
        <div key={i} className={`frame__seg frame__seg--${s.kind}`} title={s.label}>
          <div className="frame__bytes mono">
            {s.bytes.length ? s.bytes.map(hex).join(' ') : '∅'}
          </div>
          <div className="frame__label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProtocolDemo() {
  const [cmd, setCmd] = useState<Cmd>('SET');
  const [key, setKey] = useState('acct:alice');
  const [value, setValue] = useState('1500');
  const [store, setStore] = useState<Record<string, string>>({ 'acct:bob': '320' });
  const [last, setLast] = useState<{ status: keyof typeof STATUS; data: string } | null>(null);

  const request = useMemo(() => {
    const k = [...enc.encode(key)];
    const v = cmd === 'SET' ? [...enc.encode(value)] : [];
    return frame([
      { label: `cmd ${cmd}`, bytes: [CMD[cmd]], kind: 'cmd' },
      { label: `key_len = ${k.length} (LE)`, bytes: u32le(k.length), kind: 'len' },
      { label: `key "${key}"`, bytes: k, kind: 'key' },
      { label: `val_len = ${v.length} (LE)`, bytes: u32le(v.length), kind: 'len' },
      { label: cmd === 'SET' ? `value "${value}"` : 'value (empty)', bytes: v, kind: 'val' },
    ]);
  }, [cmd, key, value]);

  const response = useMemo(() => {
    if (!last) return null;
    const d = [...enc.encode(last.data)];
    return frame([
      { label: `status ${last.status}`, bytes: [STATUS[last.status]], kind: 'cmd' },
      { label: `data_len = ${d.length} (LE)`, bytes: u32le(d.length), kind: 'len' },
      { label: d.length ? `data "${last.data}"` : 'data (empty)', bytes: d, kind: 'val' },
    ]);
  }, [last]);

  const send = () => {
    if (!key || key.length > 256) return setLast({ status: 'ERR', data: 'bad key' });
    if (cmd === 'SET') {
      setStore((s) => ({ ...s, [key]: value }));
      setLast({ status: 'OK', data: '' });
    } else {
      setLast(key in store ? { status: 'OK', data: store[key] } : { status: 'NOT_FOUND', data: '' });
    }
  };

  return (
    <div className="demo">
      <p className="demo__intro">
        Build a request and watch it get encoded byte-for-byte in the same wire format the server
        uses. Hit <strong>send</strong> to run it against a tiny in-browser store.
      </p>
      <div className="demo__controls">
        <div className="seg-toggle">
          {(Object.keys(CMD) as Cmd[]).map((c) => (
            <button key={c} className={cmd === c ? 'is-active' : ''} onClick={() => setCmd(c)}>
              {c}
            </button>
          ))}
        </div>
        <label>
          key
          <input value={key} maxLength={40} onChange={(e) => setKey(e.target.value)} spellCheck={false} />
        </label>
        {cmd === 'SET' && (
          <label>
            value
            <input value={value} maxLength={40} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
          </label>
        )}
        <button className="btn btn--primary btn--sm" onClick={send}>
          send ⏎
        </button>
      </div>

      <h5 className="demo__h">request → server</h5>
      <Frame segs={request} />
      {response && (
        <>
          <h5 className="demo__h">server → response</h5>
          <Frame segs={response} />
        </>
      )}

      <h5 className="demo__h">store</h5>
      <table className="kv-table mono">
        <tbody>
          {Object.entries(store).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
