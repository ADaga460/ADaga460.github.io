import { useEffect, useState } from 'react';
import { projects, type FocusId, type Project } from '../data';
import Section from './Section';
import FocusFilter from './FocusFilter';
import ProjectModal from './ProjectModal';

type Props = { focus: FocusId | null; setFocus: (f: FocusId | null) => void };

export default function Projects({ focus, setFocus }: Props) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [tech, setTech] = useState<string | null>(null);

  // Clear the tech filter when the focus filter changes, so the two don't fight.
  useEffect(() => setTech(null), [focus]);

  const matches = (p: Project) =>
    (focus === null || p.focus.includes(focus)) && (tech === null || p.stack.includes(tech));

  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  const StackChips = ({ p }: { p: Project }) => (
    <ul className="chips">
      {p.stack.map((s) => (
        <li key={s}>
          <span
            role="button"
            tabIndex={0}
            className={`chip chip--mono chip--btn ${tech === s ? 'is-active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setTech(tech === s ? null : s);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                setTech(tech === s ? null : s);
              }
            }}
          >
            {s}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <Section
      id="projects"
      title="Projects"
      kicker="Open a card for details. Two of them have live demos you can play with."
    >
      <FocusFilter focus={focus} setFocus={setFocus} />
      {tech && (
        <p className="tech-filter mono">
          filtering by <strong>{tech}</strong>{' '}
          <button className="link" onClick={() => setTech(null)}>
            clear ×
          </button>
        </p>
      )}

      <div className="project-grid">
        {featured.map((p) => (
          <article
            key={p.id}
            className={`project ${matches(p) ? '' : 'is-dimmed'}`}
            onClick={() => setSelected(p)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(p)}
            tabIndex={0}
            role="button"
            aria-label={`Open ${p.name}`}
          >
            {p.image && <div className="project__img" style={{ backgroundImage: `url(${p.image})` }} />}
            {p.demo && <span className="project__badge mono">▶ live demo</span>}
            <div className="project__body">
              <div className="project__meta mono">{p.dates}</div>
              <h3>{p.name}</h3>
              <p>{p.short}</p>
              <StackChips p={p} />
            </div>
          </article>
        ))}
      </div>

      <h3 className="subhead">More from the workshop</h3>
      <div className="mini-grid">
        {others.map((p) => (
          <article
            key={p.id}
            className={`mini ${matches(p) ? '' : 'is-dimmed'}`}
            onClick={() => setSelected(p)}
            onKeyDown={(e) => e.key === 'Enter' && setSelected(p)}
            tabIndex={0}
            role="button"
            aria-label={`Open ${p.name}`}
          >
            <div className="mini__head">
              <h4>{p.name}</h4>
              <span className="mono muted">{p.dates}</span>
            </div>
            <p>{p.short}</p>
            <StackChips p={p} />
          </article>
        ))}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </Section>
  );
}
