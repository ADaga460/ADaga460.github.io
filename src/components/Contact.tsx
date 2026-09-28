import { profile } from '../data';
import Section from './Section';
import Terminal from './Terminal';

export default function Contact() {
  return (
    <Section id="contact" title="Get in touch" kicker="You've reached the bottom. It's quiet down here.">
      <div className="contact">
        <div className="contact__text">
          <p>
            I'm looking for <strong>internships</strong> and <strong>research</strong> in systems
            programming, computer vision, and marine robotics, and I'm applying to{' '}
            <strong>grad school</strong>. If you're working on something in that space, I'd love
            to hear about it.
          </p>
          <div className="contact__links">
            <a className="btn btn--primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
          <p className="muted small">Or poke around the shell. There are a few easter eggs.</p>
        </div>
        <Terminal />
      </div>
      <footer className="footer mono">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="muted">built with React + Vite · photos from Unsplash</span>
      </footer>
    </Section>
  );
}
