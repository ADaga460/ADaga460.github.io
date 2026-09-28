import type { ReactNode } from 'react';
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

  return (
    <section id={id} ref={ref} className="section reveal">
      <header className="section__head">
        <h2>{title}</h2>
        {kicker && <p className="section__kicker">{kicker}</p>}
      </header>
      {children}
    </section>
  );
}
