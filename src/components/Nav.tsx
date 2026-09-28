import { useState } from 'react';
import { useActiveSection } from '../hooks';

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];
const ids = ['top', ...links.map((l) => l.id)];

export default function Nav() {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
        Aarav Daga
      </a>
      <button
        className="nav__toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
      <nav className={`nav__links ${open ? 'is-open' : ''}`}>
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={active === l.id ? 'is-active' : ''}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
