import { useState } from 'react';
import { experience, type FocusId } from '../data';
import Section from './Section';
import FocusFilter from './FocusFilter';

type Props = { focus: FocusId | null; setFocus: (f: FocusId | null) => void };

export default function Experience({ focus, setFocus }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="experience" title="Experience" kicker="Click a role to expand it.">
      <FocusFilter focus={focus} setFocus={setFocus} />
      <ol className="timeline">
        {experience.map((e, i) => {
          const isOpen = open === i;
          const dimmed = focus !== null && !e.focus.includes(focus);
          return (
            <li key={i} className={`timeline__item ${dimmed ? 'is-dimmed' : ''} ${isOpen ? 'is-open' : ''}`}>
              <span className="timeline__node" aria-hidden="true" />
              <button className="xp" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <div className="xp__top">
                  <div>
                    <h3>
                      {e.org}
                      {e.via && <span className="muted"> via {e.via}</span>}
                    </h3>
                    <p className="xp__role">{e.role}</p>
                  </div>
                  <div className="xp__when mono">
                    <div>{e.dates}</div>
                    <div className="muted">{e.location}</div>
                  </div>
                </div>
                <p className="xp__summary">{e.summary}</p>
                <div className="stats">
                  {e.stats.map((s) => (
                    <div key={s.label} className="stat">
                      <span className="stat__value">{s.value}</span>
                      <span className="stat__label">{s.label}</span>
                    </div>
                  ))}
                </div>
                <span className="xp__more mono">{isOpen ? '− less' : '+ details'}</span>
              </button>
              <div className="xp__details" hidden={!isOpen}>
                <ul>
                  {e.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
                <ul className="chips">
                  {e.stack.map((s) => (
                    <li key={s} className="chip chip--mono">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
