/** The two linked hearts become gentle companions, never rewards or correctness signals. */
export function HeartFriends({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`heart-friends ${className}`}
      viewBox="0 0 240 180"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="120" cy="158" rx="88" ry="9" fill="var(--color-line)" opacity=".5" />
      <g className="heart-friend-left">
        <path
          d="M25 73C12 34 57 20 78 48C100 14 143 43 126 77C115 102 82 126 77 128C71 126 35 101 25 73Z"
          fill="var(--color-link)"
        />
        <path
          d="M45 116L39 143M99 112L108 140"
          stroke="var(--color-ink)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="58" cy="69" rx="3.5" ry="5" fill="var(--color-ink)" />
        <ellipse cx="86" cy="69" rx="3.5" ry="5" fill="var(--color-ink)" />
        <path
          d="M65 83Q72 91 79 83"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M29 91L14 85M112 93L137 85"
          stroke="var(--color-ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
      <g className="heart-friend-right">
        <path
          d="M119 90C105 58 141 31 165 62C185 32 228 50 215 87C208 108 178 136 169 138C160 133 132 113 119 90Z"
          fill="var(--color-brand-soft)"
        />
        <path
          d="M145 128L139 149M189 124L199 147"
          stroke="var(--color-ink)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="153" cy="82" rx="3.5" ry="5" fill="var(--color-ink)" />
        <ellipse cx="180" cy="82" rx="3.5" ry="5" fill="var(--color-ink)" />
        <path
          d="M160 95Q166 101 173 95M212 100Q231 101 226 82"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
