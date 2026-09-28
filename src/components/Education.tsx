import { useState } from 'react';
import { education, experience, projects, skills } from '../data';
import Section from './Section';

// Where each skill shows up, for the hover/click "used in" readout.
function usedIn(skill: string): string[] {
  const s = skill.toLowerCase();
  const hit = (stack: string[]) => stack.some((t) => t.toLowerCase().startsWith(s) || s.startsWith(t.toLowerCase()));
  return [
    ...experience.filter((e) => hit(e.stack)).map((e) => `${e.org}: ${e.role}`),
    ...projects.filter((p) => hit(p.stack)).map((p) => p.name),
  ];
}

export default function Education() {
  const groups = Object.keys(education.coursework);
  const [group, setGroup] = useState(groups[0]);
  const [skill, setSkill] = useState<string | null>(null);
  const uses = skill ? usedIn(skill) : [];

  return (
    <Section id="education" title="Education & skills">
      <div className="edu">
        <div className="edu__card">
          <div className="edu__head">
            <div>
              <h3>{education.school}</h3>
              <p>{education.degree}</p>
            </div>
            <div className="mono muted edu__when">
              <div>{education.dates}</div>
              <div>{education.location}</div>
            </div>
          </div>
          <ul className="honors">
            {education.honors.map((h) => (
              <li key={h}>★ {h}</li>
            ))}
          </ul>
          <div className="seg-toggle seg-toggle--wrap">
            {groups.map((g) => (
              <button key={g} className={group === g ? 'is-active' : ''} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <ul className="courses">
            {education.coursework[group].map((c) => (
              <li key={c.code}>
                <span className="mono courses__code">{c.code}</span>
                {c.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="skills">
          <p className="muted skills__hint">Pick a skill to see where I've used it.</p>
          {Object.entries(skills).map(([cat, list]) => (
            <div key={cat} className="skills__row">
              <span className="skills__cat mono">{cat}</span>
              <ul className="chips">
                {list.map((s) => (
                  <li key={s}>
                    <button
                      className={`chip chip--btn ${skill === s ? 'is-active' : ''}`}
                      onClick={() => setSkill(skill === s ? null : s)}
                      onMouseEnter={() => setSkill(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="skills__uses mono" aria-live="polite">
            {skill === null ? (
              <span className="muted">// nothing selected</span>
            ) : uses.length ? (
              <>
                <span className="accent">{skill}</span> → {uses.join(' · ')}
              </>
            ) : (
              <>
                <span className="accent">{skill}</span> → coursework and side projects
              </>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
