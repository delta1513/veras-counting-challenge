/**
 * Every icon is inline SVG rather than an emoji. The whole interface carries its
 * meaning through these shapes, and emoji glyphs change shape — or fail to a
 * blank box — depending on the device, browser and OS version. Drawing them
 * ourselves means the player sees the same picture everywhere, every time.
 */

type IconProps = { className?: string };

export function HeartIcon({ full, className }: IconProps & { full: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.7-9.4-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.4 12c-1.9 4.3-9.4 9-9.4 9Z"
        fill={full ? "#e0393e" : "#ffffff"}
        stroke={full ? "#9c1f23" : "#c9c2b8"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3.5 11 12 3.5 20.5 11"
        fill="none"
        stroke="#2b2118"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8 11.5V20h12.4v-8.5"
        fill="#ffc83d"
        stroke="#2b2118"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 20v-5h4v5" fill="#ffffff" stroke="#2b2118" strokeWidth="2" />
    </svg>
  );
}

/** Forward triangle: "go on to the next one". */
export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7 4.5 20 12 7 19.5Z"
        fill="#2b2118"
        stroke="#2b2118"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Circling arrow: "go around again". */
export function RestartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M20 12a8 8 0 1 1-2.6-5.9"
        fill="none"
        stroke="#2b2118"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M19.8 2.6v5.2h-5.2Z"
        fill="#2b2118"
        stroke="#2b2118"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="#ffffff" />
      <path
        d="m6.5 12.5 3.8 4 7.2-8.4"
        fill="none"
        stroke="#35b14a"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SadFaceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill="#ffd45e"
        stroke="#c98a12"
        strokeWidth="1.2"
      />
      <circle cx="8.6" cy="9.8" r="1.4" fill="#2b2118" />
      <circle cx="15.4" cy="9.8" r="1.4" fill="#2b2118" />
      <path
        d="M7.8 17.2a5.2 5.2 0 0 1 8.4 0"
        fill="none"
        stroke="#2b2118"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* A tear, so the feeling reads even at a glance. */}
      <path d="M8.6 12.4c1.5 2 1.5 3.6 0 3.6s-1.5-1.6 0-3.6Z" fill="#4aa3df" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7 3h10v5.5a5 5 0 0 1-10 0Z"
        fill="#ffd45e"
        stroke="#9c6b08"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 4.5H4.2v1.8A3.4 3.4 0 0 0 7.4 9.7M17 4.5h2.8v1.8a3.4 3.4 0 0 1-3.2 3.4"
        fill="none"
        stroke="#9c6b08"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 13.5V17m-3.5 4h7l-1-4h-5Z"
        fill="#ffd45e"
        stroke="#9c6b08"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
