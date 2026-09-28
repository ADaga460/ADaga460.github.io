import { focusAreas, type FocusId } from '../data';

type Props = { focus: FocusId | null; setFocus: (f: FocusId | null) => void };

export default function FocusFilter({ focus, setFocus }: Props) {
  return (
    <div className="filter" role="group" aria-label="Filter by focus area">
      <button className={focus === null ? 'is-active' : ''} onClick={() => setFocus(null)}>
        All
      </button>
      {focusAreas.map((f) => (
        <button
          key={f.id}
          className={focus === f.id ? 'is-active' : ''}
          onClick={() => setFocus(focus === f.id ? null : f.id)}
        >
          {f.title}
        </button>
      ))}
    </div>
  );
}
