import { useState } from 'react';
import { projects, smallProjects } from '../data';
import ProtocolDemo from './demos/ProtocolDemo';
import PagingDemo from './demos/PagingDemo';

export default function Projects() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <ol className="entries">
        {projects.map((p) => (
          <li key={p.id} className="entry">
            <div className="entry__when mono">{p.dates}</div>
            <div className="entry__body">
              <h3>
                {p.repo ? (
                  <a href={p.repo} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                ) : (
                  p.name
                )}
              </h3>
              <p>{p.text}</p>
              <div className="entry__meta">
                <span className="mono">{p.stack}</span>
                {p.demo && (
                  <button
                    className="linkbtn"
                    aria-expanded={open === p.id}
                    onClick={() => setOpen(open === p.id ? null : p.id)}
                  >
                    {open === p.id ? 'close' : p.demoLabel}
                  </button>
                )}
              </div>
              {open === p.id && p.demo === 'protocol' && <ProtocolDemo />}
              {open === p.id && p.demo === 'paging' && <PagingDemo />}
            </div>
          </li>
        ))}
      </ol>
      <h3 className="minor">Smaller things</h3>
      <ul className="small-projects">
        {smallProjects.map((p) => (
          <li key={p.name}>
            <a href={p.repo} target="_blank" rel="noreferrer">
              {p.name}
            </a>
            {p.live && (
              <>
                {' '}
                <a className="small-projects__live mono" href={p.live} target="_blank" rel="noreferrer">
                  live
                </a>
              </>
            )}
            <span className="small-projects__text"> {p.text}</span>
            <span className="small-projects__stack mono"> {p.stack}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
