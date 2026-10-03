import type { Domain } from '@/content/schema'

/** Home's pictograms use the same local icon assets as the lesson engine. */
export function DomainArt({ domain }: { domain: Domain }) {
  return (
    <span className={`domain-art domain-art--${domain}`} aria-hidden="true">
      <svg viewBox="0 0 240 160" fill="none" className="domain-art-line">
        <path
          d="M16 117C38 146 60 117 75 92S126 35 149 63s38 74 75 32"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="26" cy="43" r="6" fill="currentColor" stroke="none" />
        <circle cx="209" cy="125" r="4" fill="currentColor" stroke="none" />
      </svg>
      <span className="domain-art-disc">
        <img src={`/icons/domain/${domain}.svg`} alt="" width="96" height="96" />
      </span>
    </span>
  )
}
