import { useEffect, useRef } from 'react';
import type { Project } from '../data';
import ProtocolDemo from './demos/ProtocolDemo';
import PagingDemo from './demos/PagingDemo';

export default function ProjectModal({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal__body">
          <div className="project__meta mono">{p.dates}</div>
          <h3 id="modal-title">{p.name}</h3>
          <p className="modal__lede">{p.short}</p>
          {p.bullets.length > 0 && (
            <ul className="bullets">
              {p.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          <ul className="chips">
            {p.stack.map((s) => (
              <li key={s} className="chip chip--mono">
                {s}
              </li>
            ))}
          </ul>
          {p.repo && (
            <a className="btn btn--sm" href={p.repo} target="_blank" rel="noreferrer">
              Source on GitHub
            </a>
          )}
          {p.demo === 'protocol' && <ProtocolDemo />}
          {p.demo === 'paging' && <PagingDemo />}
        </div>
      </div>
    </div>
  );
}
