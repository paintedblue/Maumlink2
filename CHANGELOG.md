# Changelog

## 1.0.0 — 2026-10-03

First versioned release of 마음잇다 (Maum:Link), a Korean social-emotional learning app.

### Included

- Four illustrated scenarios following 상황 → 감정 → 생각 → 행동 → 피드백, with a personal learning recap.
- A cream and blueberry storybook design, linked-heart characters, illustrated story shelf, contextual questions and expressive choices.
- Compact lesson navigation, smaller default typography, a separate large-text setting and completion badges at the top right.
- Voice on/off controls, automatic narration, Korean voice loading and fallback, playback status and an 음성 확인 control in Settings.
- Keyboard navigation, focus management, reduced-motion support, large touch targets and responsive layouts.
- Local progress and lesson recovery, bundled artwork and fonts, and an installable offline-first PWA. No accounts, backend or analytics.

### Release checks

- 85 unit, component and integration tests pass.
- Lint, content validation, TypeScript and production/PWA build pass.
- Four scenarios validate; 18 existing draft lesson strings remain marked for content-team approval.

### Known limitations

- The reported silent automatic Korean narration on Mac Chrome has not been verified as resolved on a real device. This release includes playback recovery and diagnostics; an enabled voice icon does not establish audible output.
- Browser rendering, responsive viewport checks, accessibility scans, offline behavior and real-device acceptance need revalidation for the current design. This environment cannot start the preview server or connect to Chrome; historical browser results and screenshots do not certify this release.
- Content-team approval of the 18 draft lesson strings and generated illustrations remains pending.
- A pushed release does not confirm that the Vercel deployment is live; production deployment must be checked separately.
