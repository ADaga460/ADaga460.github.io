import { useState } from 'react';
import { projects, type Project } from '../data';
import Section from './Section';
import ProjectModal from './ProjectModal';

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [tech, setTech] = useState<string | null>(null);

  const matches = (p: Project) => tech === null || p.stack.includes(tech);

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
      kicker="Click a project for details. The first two include interactive demos. Click a tag to filter."
    >
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
            <div className="project__body">
              <div className="project__meta mono">
                {p.dates}
                {p.demo && <span className="project__badge">interactive demo</span>}
              </div>
              <h3>{p.name}</h3>
              <p>{p.short}</p>
              <StackChips p={p} />
            </div>
          </article>
        ))}
      </div>

      <h3 className="subhead">Other projects</h3>
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
