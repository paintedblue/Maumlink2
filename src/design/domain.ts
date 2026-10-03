import type { Domain } from '@/content/schema'

/** Tailwind classes for a domain-tinted surface + edge (tokens §6.3). */
export const domainSurface: Record<Domain, string> = {
  self: 'bg-domain-self border-domain-self-edge',
  social: 'bg-domain-social border-domain-social-edge',
  relation: 'bg-domain-relation border-domain-relation-edge',
  mind: 'bg-domain-mind border-domain-mind-edge',
  reserved: 'bg-domain-reserved border-domain-reserved-edge',
}
