import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { education, experience, profile, projects, skills } from '../data';

type Line = { kind: 'in' | 'out'; content: ReactNode };

const link = (href: string, text = href) => (
  <a href={href} target="_blank" rel="noreferrer">
    {text}
  </a>
);

const COMMANDS: Record<string, { help: string; run: (args: string[]) => ReactNode }> = {
  help: {
    help: 'list commands',
    run: () => (
      <div className="term__table">
        {Object.entries(COMMANDS).map(([k, v]) => (
          <div key={k}>
            <span className="accent">{k.padEnd(10)}</span> {v.help}
          </div>
        ))}
      </div>
    ),
  },
  whoami: { help: 'short bio', run: () => profile.bio.join('\n\n') },
  plans: { help: 'grad school & career plans', run: () => profile.plans },
  experience: {
    help: 'where I have worked',
    run: () => experience.map((e) => `${e.dates.padEnd(22)} ${e.role} @ ${e.org}`).join('\n'),
  },
  ls: {
    help: 'list projects (try: ls projects)',
    run: () => projects.map((p) => p.id + (p.repo ? '/' : '')).join('  '),
  },
  cat: {
    help: 'cat <project-id> for details',
    run: ([id]) => {
      const p = projects.find((x) => x.id === id);
      if (!p) return `cat: ${id ?? ''}: No such file or directory. Try "ls".`;
      return (
        <>
          <strong>{p.name}</strong> [{p.stack.join(', ')}]{'\n'}
          {p.short}
          {p.repo && (
            <>
              {'\n'}
              {link(p.repo)}
            </>
          )}
        </>
      );
    },
  },
  skills: {
    help: 'languages & tools',
    run: () =>
      Object.entries(skills)
        .map(([k, v]) => `${k.padEnd(10)} ${v.join(', ')}`)
        .join('\n'),
  },
  school: { help: 'education', run: () => `${education.school}\n${education.degree}\n${education.dates}` },
  contact: {
    help: 'how to reach me',
    run: () => (
      <>
        email    {link(`mailto:${profile.email}`, profile.email)}
        {'\n'}github   {link(profile.github)}
        {'\n'}linkedin {link(profile.linkedin)}
      </>
    ),
  },
  clear: { help: 'clear the screen', run: () => null },
};

const BANNER: Line[] = [
  { kind: 'out', content: 'Type "help" to list commands. Tab completes, ↑/↓ for history.' },
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const cmdline = raw.trim();
    if (!cmdline) return;
    setHistory((h) => [cmdline, ...h]);
    setHIdx(-1);
    const [name, ...args] = cmdline.split(/\s+/);
    if (name === 'clear') return setLines([]);
    let out: ReactNode;
    if (COMMANDS[name]) out = COMMANDS[name].run(name === 'ls' ? [] : args);
    else out = `${name}: command not found. Type "help".`;
    setLines((l) => [...l, { kind: 'in', content: cmdline }, { kind: 'out', content: out }]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(hIdx + 1, history.length - 1);
      if (i >= 0) {
        setHIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = hIdx - 1;
      setHIdx(Math.max(i, -1));
      setInput(i >= 0 ? history[i] : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const [name, arg] = input.split(/\s+/);
      if (arg !== undefined && name === 'cat') {
        const m = projects.map((p) => p.id).filter((id) => id.startsWith(arg));
        if (m.length === 1) setInput(`cat ${m[0]}`);
      } else {
        const m = Object.keys(COMMANDS).filter((c) => c.startsWith(name));
        if (m.length === 1) setInput(m[0] + ' ');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const quick = ['help', 'whoami', 'plans', 'ls', 'cat kv', 'contact'];

  return (
    <div className="term" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div className="term__bar">
        <span className="term__dot" />
        <span className="term__dot" />
        <span className="term__dot" />
        <span className="term__title mono">guest@aarav: ~</span>
      </div>
      <div className="term__body mono" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className={`term__line term__line--${l.kind}`}>
            {l.kind === 'in' && <span className="term__ps">guest@aarav:~$ </span>}
            {l.content}
          </div>
        ))}
        <div className="term__line term__line--in">
          <span className="term__ps">guest@aarav:~$ </span>
          <input
            ref={inputRef}
            className="term__input mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            aria-label="Terminal input"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>
      <div className="term__quick">
        {quick.map((q) => (
          <button
            key={q}
            className="chip chip--btn chip--mono"
            onClick={(e) => {
              e.stopPropagation();
              run(q);
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
