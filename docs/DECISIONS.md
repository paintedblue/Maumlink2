# Decisions log

Decisions made during implementation that the PRD left open or that deviate from it.
Format: date · decision · why · PRD reference.

## 2026-10-03 — M0

- **Why SPA, not Next (D13).** Fully static, offline-first PWA with two routes, no server, no data fetching, no SEO. A meta-framework adds a server mental model and PWA friction with no benefit. Revisit only if v2 adds accounts or a teacher dashboard with a backend.
- **Pinned versions at M0** (verified with `pnpm view`): React 19.2.x, Vite 8.3, TypeScript ~6.0 (the official Vite template pins 6; TS 7 native compiler is available but the template has not adopted it — follow the template for build stability), Tailwind 4.3 via `@tailwindcss/vite`, React Router 8.4 (data mode, `createBrowserRouter`), Zustand 5, Zod 4, vite-plugin-pwa 1.3, Vitest 5, Playwright 1.63.
- **oxlint instead of ESLint.** The official Vite React template now ships oxlint; it covers rules-of-hooks and TypeScript rules at a fraction of the setup. Prettier kept for formatting. PRD D13 named ESLint; tooling choice, no product impact.
- **Fonts via `@fontsource/noto-sans-kr`** (400/700). Self-hosted and bundled, satisfying D14/D15, and already split into unicode-range subsets so a browser downloads only the glyph ranges a screen uses — this is how the §9 font budget is met without a custom subsetting step.
- **Breakpoint naming.** Tailwind `md:` is remapped to 640 px and `lg:` stays 1024 px so classes read `base / md: / lg:` matching the PRD's `sm / md / lg` tiers. A `short:` variant covers phone-landscape (height < 500 px).
- **Emotion label mapping (PRD §7.1 note).** 창피해요 → "Embarrassed", 당황스러워요 → "Flustered", 부끄러워요 → "Shy" (differs from the `eng-ver` PDFs; English is dev-only under D17 so this has no child-facing effect).
- **Validator severity.** Missing *emotion* icon files are warnings during M0–M1 (icons are produced in M1/M2); missing *outcome* icon files are errors as the PRD specifies. Missing `en` is a warning (D17).
- **Repo location.** The app lives in `maumlink/` beside the client's original decks; the three planning documents are copied into the repo root per PRD §11.2 so the agent and CI have them in-tree.
