import type { ReactNode } from 'react';
import { zones } from '../data';
import { useReveal } from '../hooks';

export default function Section({
  id,
  title,
  kicker,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  const ref = useReveal<HTMLElement>();
  const zone = zones.find((z) => z.id === id);

  return (
    <section id={id} ref={ref} className="section reveal">
      <header className="section__head">
        {zone && (
          <span className="section__depth mono">
            {zone.depth.toLocaleString()} m · {zone.label.toLowerCase()}
          </span>
        )}
        <h2>{title}</h2>
        {kicker && <p className="section__kicker">{kicker}</p>}
      </header>
      {children}
    </section>
  );
}
