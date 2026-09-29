import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { profile, school, work } from './data';
import Projects from './components/Projects';
// The map and its geography data are most of the bundle; load them only near the section.
const Outside = lazy(() => import('./components/Outside'));

// Renders [text](href) inside a string as a link. In-page anchors stay in the tab.
function Inline({ text }: { text: string }) {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 0) return part;
        if (i % 3 === 2) return null;
        const href = parts[i + 1];
        const external = !href.startsWith('#');
        return (
          <a key={i} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {part}
          </a>
        );
      })}
    </>
  );
}

function WhenNear({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '800px' });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={near ? undefined : { minHeight: 900 }}>
      {near && <Suspense fallback={null}>{children}</Suspense>}
    </div>
  );
}

function Section({ id, label, aside, children }: { id: string; label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="section">
      <div className="section__side">
        <h2 className="section__label">{label}</h2>
        {aside}
      </div>
      <div className="section__body">{children}</div>
    </section>
  );
}

const nav = [
  ['about', 'About'],
  ['work', 'Work'],
  ['projects', 'Projects'],
  ['school', 'School'],
  ['outside', 'Outside'],
  ['contact', 'Contact'],
];

export default function App() {
  return (
    <div className="sheet">
      <span className="corner corner--tl mono">40°48′45″N 77°56′15″W</span>
      <span className="corner corner--br mono">40°45′N 77°48′45″W</span>

      <header className="collar">
        <div className="collar__row">
          <span>Aarav Daga · Personal site</span>
          <span>State College quadrangle · Pennsylvania · 7.5-minute series</span>
        </div>
        <h1 className="title">{profile.name}</h1>
        <nav className="nav">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <a href={profile.resume} target="_blank" rel="noreferrer" className="nav__resume">
            Resume
          </a>
        </nav>
      </header>

      <div className="intro">
        <p>{profile.intro}</p>
        <div className="intro__status">
          <p>{profile.status}</p>
          <a className="resume-btn" href={profile.resume} target="_blank" rel="noreferrer">
            Resume (PDF)
          </a>
        </div>
      </div>

      <main>
        <Section
          id="about"
          label="About"
          aside={
            profile.headshot && (
              <figure className="margin-photo">
                <img src={profile.headshot} alt={profile.name} />
                <figcaption className="mono">{profile.home.name}</figcaption>
              </figure>
            )
          }
        >
          <div className="prose">
            {profile.about.map((p, i) => (
              <p key={i}>
                <Inline text={p} />
              </p>
            ))}
          </div>
          <div className="focus">
            {profile.focus.map((f) => (
              <div key={f.title} className="focus__item">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <div className="prose">
            {profile.aboutMore.map((p, i) => (
              <p key={i}>
                <Inline text={p} />
              </p>
            ))}
          </div>
        </Section>

        <Section id="work" label="Work">
          <ol className="entries">
            {work.map((j) => (
              <li key={j.role + j.dates} className="entry">
                <div className="entry__when mono">{j.dates}</div>
                <div className="entry__body">
                  <h3>
                    {j.org}
                    {j.via && <span className="muted"> through {j.via}</span>}
                  </h3>
                  <p className="entry__role">
                    {j.role} · {j.place}
                  </p>
                  <p>{j.summary}</p>
                  <details>
                    <summary>More</summary>
                    <ul>
                      {j.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </details>
                  <div className="entry__meta mono">{j.stack}</div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="projects" label="Projects">
          <Projects />
          <p className="tools">
            <span className="muted">What I use: </span>
            {school.tools}
          </p>
        </Section>

        <Section id="school" label="School">
          <div className="prose">
            <p>
              <b>{school.name}</b>, {school.degree}. {school.dates}. {school.honors}.
            </p>
            <p>
              <span className="muted">Classes: </span>
              {school.courses.join(', ')}.
            </p>
          </div>
        </Section>

        <Section id="outside" label="Outside">
          <WhenNear>
            <Outside />
          </WhenNear>
        </Section>

        <Section id="contact" label="Contact">
          <div className="prose">
            <p>
              Email is best: <a href={`mailto:${profile.email}`}>{profile.email}</a>. I'm also on{' '}
              <a href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>{' '}
              and{' '}
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              , and my resume is{' '}
              <a href={profile.resume} target="_blank" rel="noreferrer">
                here
              </a>
              .
            </p>
          </div>
        </Section>
      </main>

      <footer className="legend">
        <p>
          Set in Source Serif and Barlow Condensed. © {new Date().getFullYear()} Aarav Daga.
        </p>
      </footer>
    </div>
  );
}
