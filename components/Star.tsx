/** The DOSE star mascot from the original site, reused as a doodle accent. */
export function Star({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path d="M50 4l13 28 31 4-23 21 6 31-27-15-27 15 6-31L6 36l31-4z" fill="currentColor" stroke="#141414" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="40" cy="48" r="4" fill="#141414" />
      <circle cx="60" cy="48" r="4" fill="#141414" />
      <path d="M41 60q9 9 18 0" fill="none" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Bolt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
