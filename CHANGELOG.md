# Changelog

All notable changes to cc-plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-04-28

### Added
- `data-acknowledged="true"` Attribut am Script-Tag, um Kenntnisnahme von Lizenz und Disclaimer zu bestätigen. Fehlt das Attribut, erscheint eine Warnung in der Browser-Konsole — die Funktionalität bleibt unverändert.
- Prominenter Disclaimer-Block im README (NOT FOR PROFESSIONAL USE WITHOUT REVIEW).
- Vorlagentext für die Datenschutzerklärung im README, der den Einsatz des Plugins dokumentiert.

### Changed
- Dev-Sandbox (`index.html`) setzt `data-acknowledged="true"`, um die Konsolen-Warnung im lokalen Test zu unterdrücken.

## [1.0.0] - 2026-04-27

### Added
- Initial release.
- Two compliance modes: `ch` (nDSG informational) and `eu` (GDPR opt-in).
- Four consent categories: `necessary`, `preferences`, `statistics`, `marketing`.
- Google Analytics Consent Mode v2 integration via `data-ga-id`.
- Embed blocker for `[data-cc]` elements (YouTube, Google Maps, Vimeo) with branded placeholder.
- `MutationObserver` for dynamically added embeds (e.g. Webflow CMS).
- Translations for `de`, `en`, `fr`, `it`.
- Theming via CSS custom properties (`--cc-accent`, `--cc-bg`, `--cc-text`, `--cc-radius`, `--cc-z`).
- Banner positions: `bottom`, `top`, `bottom-left`, `bottom-right`.
- Public API: `window.ccConsent.open()`, `getConsent()`, `reset()`.
- 30-day re-prompt window for existing consent records.
