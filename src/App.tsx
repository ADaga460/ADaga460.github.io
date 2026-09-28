import type { ReactNode } from 'react';
import { profile, school, work } from './data';
import Topo from './components/Topo';
import Projects from './components/Projects';
import Outside from './components/Outside';

function Section({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section id={id} className="section">
      <h2 className="section__label">{label}</h2>
      <div className="section__body">{children}</div>
    </section>
  );
}

const nav = [
  ['about', 'About'],
  ['work', 'Work'],
  ['projects', 'Projects'],
  ['outside', 'Outside'],
  ['school', 'School'],
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
        </nav>
      </header>

      <div className="intro">
        <p>{profile.intro}</p>
        <p className="intro__status">{profile.status}</p>
      </div>

      <Topo />

      <main>
        <Section id="about" label="About">
          <div className={profile.headshot ? 'about about--photo' : 'about'}>
            {profile.headshot && <img src={profile.headshot} alt={profile.name} className="about__photo" />}
            <div className="prose">
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
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
        </Section>

        <Section id="outside" label="Outside">
          <Outside />
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
            <p>
              <span className="muted">What I use: </span>
              {school.tools}
            </p>
          </div>
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
              .
            </p>
          </div>
        </Section>
      </main>

      <footer className="legend">
        <div className="scale" aria-hidden="true">
          <div className="scale__bar">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="scale__labels mono">
            <span>0</span>
            <span>½</span>
            <span>1 mile</span>
          </div>
        </div>
        <p>
          Contour interval about 100 feet. The terrain up top is generated, not real. Set in Source Serif
          and Barlow Condensed. © {new Date().getFullYear()} Aarav Daga.
        </p>
      </footer>
    </div>
  );
}
