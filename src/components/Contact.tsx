import { profile } from '../data';
import Section from './Section';
import Terminal from './Terminal';

export default function Contact() {
  return (
    <Section id="contact" title="Contact">
      <div className="contact">
        <div className="contact__text">
          <p>
            I'm looking for internships and research positions in systems and computer vision,
            especially for ocean, space, or environmental science. If you're working on something
            like that, I'd like to hear about it.
          </p>
          <div className="contact__links">
            <a className="btn btn--primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
          <p className="muted small">You can also browse this site from the terminal. Type help to list the commands.</p>
        </div>
        <Terminal />
      </div>
      <footer className="footer mono">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span className="muted">Built with React and Vite</span>
      </footer>
    </Section>
  );
}
