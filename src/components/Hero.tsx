import { profile } from '../data';
import { useTypewriter } from '../hooks';
import Sonar from './Sonar';

export default function Hero() {
  const role = useTypewriter(profile.roles);

  return (
    <section id="surface" className="hero">
      <div className="hero__text">
        <p className="eyebrow">
          <span className="dot" /> Open to Summer 2027 internships & research
        </p>
        <h1>
          Hi, I'm <span className="grad">{profile.name.split(' ')[0]}</span>.
        </h1>
        <p className="hero__role mono">
          <span className="muted">$</span> {role}
          <span className="caret" aria-hidden="true" />
        </p>
        <p className="hero__lede">
          {profile.tagline} I work on kernels, distributed systems, and GPU code, and I'm aiming
          that toward <strong>computer vision</strong> and <strong>marine robotics</strong>.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#projects">
            Dive into projects ↓
          </a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
      <div className="hero__scope">
        <Sonar />
        <p className="hero__hint mono">click the scope to ping</p>
      </div>
      <a href="#about" className="hero__scroll" aria-label="Scroll down">
        <span />
      </a>
    </section>
  );
}
