import { interests, profile } from '../data';
import Section from './Section';

export default function About() {
  return (
    <Section id="about" title="About">
      <div className={`about ${profile.headshot ? '' : 'about--no-photo'}`}>
        {profile.headshot && (
          <img className="about__photo" src={profile.headshot} alt={profile.name} />
        )}
        <div className="about__text">
          {profile.bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="about__plans">{profile.plans}</p>
        </div>
      </div>

      <div className="interests">
        <div>
          <h3 className="subhead">What I like building</h3>
          {interests.building.map((i) => (
            <div key={i.title} className="interest">
              <h4>{i.title}</h4>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="subhead">Where I want to apply it</h3>
          {interests.applying.map((i) => (
            <div key={i.title} className="interest">
              <h4>{i.title}</h4>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
