import { focusAreas, profile, type FocusId } from '../data';
import Section from './Section';

type Props = { focus: FocusId | null; setFocus: (f: FocusId | null) => void };

export default function About({ focus, setFocus }: Props) {
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <Section id="about" title="About me">
      <div className="about">
        <div className="about__photo">
          {profile.headshot ? (
            <img src={profile.headshot} alt={profile.name} />
          ) : (
            <div className="about__initials" aria-label={profile.name}>
              {initials}
            </div>
          )}
          <div className="about__meta mono">
            <div>
              <span className="muted">loc</span> {profile.location}
            </div>
            <div>
              <span className="muted">edu</span> Penn State, CS
            </div>
            <div>
              <span className="muted">prev</span> Lockheed Martin
            </div>
          </div>
        </div>
        <div className="about__text">
          {profile.bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="goal">
            <span className="goal__label mono">where I'm headed</span>
            <p>{profile.goals}</p>
          </div>
        </div>
      </div>

      <h3 className="subhead">
        Three directions I'm working toward <span className="muted">(pick one to highlight related work)</span>
      </h3>
      <div className="focus-grid">
        {focusAreas.map((f) => {
          const selected = focus === f.id;
          return (
            <button
              key={f.id}
              className={`focus-card ${selected ? 'is-selected' : ''} ${focus && !selected ? 'is-dimmed' : ''}`}
              onClick={() => setFocus(selected ? null : f.id)}
              aria-pressed={selected}
            >
              <div className="focus-card__img" style={{ backgroundImage: `url(${f.image})` }} />
              <div className="focus-card__body">
                <h4>{f.title}</h4>
                <p>{f.blurb}</p>
                <ul className="chips">
                  {f.interests.map((i) => (
                    <li key={i} className="chip">
                      {i}
                    </li>
                  ))}
                </ul>
                <span className="focus-card__cta mono">
                  {selected ? '✓ highlighting below' : 'highlight related work →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
