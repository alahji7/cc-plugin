# Changelog

All notable changes to cc-plugin are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-04-28

### Changed
- **Customize-Panel kompakter** — Kategorie-Zeilen jetzt einzeilig mit Action-Form-Labels („Notwendige Cookies zulassen", „Allow statistics cookies", etc.). Beschreibungen wurden in das `title`-Attribut verschoben (Tooltip beim Hover) und sind weiterhin für Screenreader via `cc-sr-only` verfügbar.
- Toggle-Schalter leicht vergrössert (44×24 statt 40×22) für bessere Klickbarkeit.
- Panel-Container hat jetzt einen umrahmten Look mit `border-radius`, statt Trennlinien zwischen Zeilen.

### Why
Reduzierte visuelle Last, schnellerer Scan-Read durch User. Beschreibungstext bleibt zugänglich (Tooltip + Screenreader), ist aber nicht permanent sichtbar.

## [1.1.0] - 2026-04-28

### Added
- **CH-Modus mit Marketing-Opt-in** über neues `data-allow-marketing="true"` Attribut. Im aktivierten Zustand zeigt der CH-Banner ein 3-Button-Layout (Ablehnen / Einstellungen / Akzeptieren) mit symmetrischer Wahlmöglichkeit, plus Customize-Panel mit granularen Toggles. Statistik default-on, Marketing default-off — entspricht EDÖB-Praxis für „high-risk profiling" (Art. 5 lit. g + Art. 22 nDSG) bei gleichzeitiger Wahrung der nDSG-typischen Informational-Charakteristik.
- Ausführlichere Marketing-Beschreibung im CH+Marketing-Modus (Hinweis auf Cross-Site-Profiling).
- Neuer i18n-Key `chBodyMarketing` und `marketingDescDetailed` in allen 4 Sprachen.
- Sandbox unterstützt einen dritten Modus „CH + Marketing" zum Testen.

### Changed
- `buildCategoryRow()` akzeptiert optional einen `descOverride` Parameter für individuelle Kategorie-Beschreibungen pro Kontext.

### Backwards Compatibility
- CH-Modus ohne `data-allow-marketing` verhält sich identisch zu v1.0.1 — keine Regression für bestehende Einbindungen.

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
