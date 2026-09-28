import { experience, profile } from '../data';

export default function Hero() {
  const latest = experience[0];

  return (
    <section id="top" className="hero">
      <div className="hero__text">
        <h1>{profile.name}</h1>
        <p className="hero__lede">{profile.intro}</p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#projects">
            Projects
          </a>
          <a className="btn" href={`mailto:${profile.email}`}>
            Email
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <dl className="facts">
        <div>
          <dt>Studying</dt>
          <dd>B.S. Computer Science, Penn State · Dec 2027</dd>
        </div>
        <div>
          <dt>Most recently</dt>
          <dd>
            {latest.role}, {latest.org}
          </dd>
        </div>
        <div>
          <dt>Work</dt>
          <dd>Systems programming · Computer vision</dd>
        </div>
        <div>
          <dt>Aiming for</dt>
          <dd>Marine & space science</dd>
        </div>
        <div>
          <dt>Looking for</dt>
          <dd>Summer 2027 internships & research</dd>
        </div>
      </dl>
    </section>
  );
}
