# cc-plugin

Ein leichtgewichtiger Cookie Consent Manager als einzelnes JavaScript-File. Entwickelt für den Agentur-Einsatz auf Webflow, WordPress und Next.js. Kein Build-Step, keine Dependencies, ca. 10 KB minified.

> ## ⚠️ NOT FOR PROFESSIONAL USE WITHOUT REVIEW
>
> Dieses Plugin ist ein **technisches Hilfsmittel ohne Gewährleistung**. Es ersetzt keine
> rechtliche Prüfung, keine Cookie-Inventur und keine Datenschutzerklärung. Die
> rechtskonforme Konfiguration (insb. Auswahl des Modus, Kategorien-Mapping, Embed-Markierung,
> Privacy-URL) **liegt vollständig in der Verantwortung des Einbinders**. Bei kommerzieller
> Nutzung — insbesondere bei Auftragsarbeiten für Dritte — empfehlen wir vor Produktiveinsatz
> eine rechtliche Prüfung durch einen qualifizierten Anwalt sowie einen entsprechenden
> Werkvertrag mit dem Endkunden.
>
> Mit dem Setzen von `data-acknowledged="true"` am Script-Tag bestätigst du, diesen Hinweis
> sowie die [LICENSE](./LICENSE) gelesen und akzeptiert zu haben. Fehlt das Attribut, wird
> beim Laden eine Warnung in der Browser-Konsole ausgegeben.

- **Zwei Compliance-Modi** — `ch` (nDSG, informativ) und `eu` (DSGVO, Opt-in)
- **Vier Standard-Kategorien** — Notwendig, Präferenzen, Statistiken, Marketing
- **Google Analytics Consent Mode v2** integriert
- **Embed-Blocker** für YouTube und Google Maps via einfaches `data-cc` Attribut
- **Vier Sprachen** — DE, EN, FR, IT
- **Theming** über CSS Variables (3 Zeilen pro Kunde)
- **Auslieferung über jsDelivr** — automatische Minifizierung, immutable URLs

## Installation

Script-Tag im `<head>` einbinden:

```html
<script
  src="https://cdn.jsdelivr.net/gh/alahji7/cc-plugin@1.1.1/cc-plugin.min.js"
  data-mode="ch"
  data-lang="de"
  data-accent="#2563eb"
  data-position="bottom"
  data-privacy-url="/datenschutz"
  data-ga-id="G-XXXXXXXX"
  data-acknowledged="true"
></script>
```

## Konfiguration

Alle Optionen werden als `data-*` Attribute am Script-Tag gesetzt.

| Attribut | Werte | Default | Beschreibung |
|----------|-------|---------|--------------|
| `data-mode` | `ch` \| `eu` | `ch` | Compliance-Modus |
| `data-lang` | `de` \| `en` \| `fr` \| `it` | `de` | Banner-Sprache |
| `data-accent` | CSS-Farbe | `#2563eb` | Akzentfarbe für Buttons |
| `data-position` | `bottom` \| `top` \| `bottom-left` \| `bottom-right` | `bottom` | Position und Größe |
| `data-privacy-url` | URL | `/datenschutz` | Link zur Datenschutzerklärung |
| `data-ga-id` | GA4 Measurement ID | — | Optional: aktiviert Consent Mode v2 |
| `data-acknowledged` | `true` | — | Bestätigt Kenntnisnahme von [LICENSE](./LICENSE) und Disclaimer. Ohne dieses Attribut erscheint eine Warnung in der Browser-Konsole. |
| `data-allow-marketing` | `true` | — | **Nur im CH-Modus relevant.** Aktiviert ein 3-Button-Layout (Ablehnen/Einstellungen/Akzeptieren) mit Marketing-Opt-in für nDSG-konformes Cross-Site-Profiling. Siehe [Abschnitt CH-Modus mit Marketing-Tools](#ch-modus-mit-marketing-tools). |

### Position und Größe

- `bottom` und `top` — zentriert, breit (760px im EU-Modus, 520px im CH-Modus)
- `bottom-left` und `bottom-right` — kompakt (420px), an der Seite ausgerichtet

## Compliance-Modi

### `ch` Modus (nDSG – Schweiz)

Reiner Hinweis-Banner mit "Akzeptieren"-Button und Link zur Datenschutzerklärung. Standardmäßig sind Notwendig, Präferenzen und Statistiken aktiv; Marketing ist deaktiviert. Nutzt die Tatsache, dass das nDSG kein explizites Opt-in verlangt, sondern Transparenz und Widerspruchsmöglichkeit.

### `eu` Modus (DSGVO – EU)

Vollständiges Opt-in mit drei Buttons (Alles ablehnen / Einstellungen / Alles akzeptieren) und einem ausklappbaren Customize-Panel. Standardmäßig sind nur die notwendigen Cookies aktiv. Erst nach expliziter Zustimmung werden weitere Kategorien aktiviert.

### CH-Modus mit Marketing-Tools

Mit `data-allow-marketing="true"` zeigt der CH-Banner stattdessen ein **3-Button-Layout** mit symmetrischen Wahlmöglichkeiten:

- **„Ablehnen"** → keine Statistik, kein Marketing
- **„Einstellungen"** → Customize-Panel mit granularen Toggles (Statistik default-on, Marketing default-off)
- **„Akzeptieren"** → alle Kategorien aktiv inkl. Marketing

Wann verwenden? Sobald auf der Seite **Marketing-Tools wie Meta Pixel, Google Ads, TikTok Pixel oder LinkedIn Insight** eingebunden sind. Solche Cross-Site-Profiling-Tools fallen unter Art. 5 lit. g + Art. 22 nDSG („Bearbeitung mit hohem Risiko") und benötigen nach EDÖB-Praxis eine ausdrückliche Einwilligung — ein rein informativer Banner reicht hier nicht.

**Wann NICHT verwenden?** Auf reinen Analytics-Setups (z.B. nur GA4 mit anonymisierten IPs) ohne Marketing-Tools — dort genügt der Standard-CH-Modus. Marketing-Toggle wäre dann irreführend.

**Pixel-Code richtig einbinden** — im Webflow-Custom-Code, nicht im Head:

```html
<script>
document.addEventListener('cc:change', function (e) {
  if (e.detail.marketing && !window._pixelLoaded) {
    window._pixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  }
});
</script>
```

Der Pixel lädt erst nach expliziter Zustimmung. Das `cc:change` Event vom Plugin ist genau dafür da.

## Kategorien

Vier Standard-Kategorien (entspricht Cookiebot/OneTrust/Usercentrics):

| Key | Zweck | GA Consent Mode v2 Signale |
|-----|-------|----------------------------|
| `necessary` | Login, Warenkorb, Sicherheit (immer aktiv, Toggle disabled) | `security_storage` |
| `preferences` | Sprache, Region, gespeicherte Einstellungen | `functionality_storage`, `personalization_storage` |
| `statistics` | GA4, Matomo, Plausible | `analytics_storage` |
| `marketing` | Google Ads, Meta Pixel, Retargeting | `ad_storage`, `ad_user_data`, `ad_personalization` |

## Embed-Blocker

Drittanbieter-Inhalte werden automatisch geblockt, bis die passende Kategorie zugestimmt wurde. Markiere ein Element einfach mit `data-cc`:

```html
<!-- YouTube – braucht "marketing" -->
<iframe
  data-cc="youtube"
  data-src="https://www.youtube.com/embed/xxx"
  allowfullscreen></iframe>

<!-- Google Maps – braucht "statistics" -->
<iframe
  data-cc="maps"
  data-src="https://www.google.com/maps/embed?pb=..."></iframe>
```

Wichtig: Die URL gehört in `data-src`, **nicht** in `src`. Das Plugin verschiebt den Wert automatisch in `src`, sobald Consent vorliegt.

### Override pro Element

Wenn ein Element zu einer anderen Kategorie gehören soll:

```html
<iframe data-cc="youtube" data-cc-category="statistics" data-src="..."></iframe>
```

## Theming

Alle Farben und Maße sind als CSS Variables definiert. Drei Zeilen reichen für die Markenanpassung:

```css
:root {
  --cc-accent: #ff6b35;
  --cc-radius: 4px;
  --cc-bg: #1a1a1a;
}
```

Verfügbare Variables: `--cc-accent`, `--cc-bg`, `--cc-text`, `--cc-muted`, `--cc-border`, `--cc-radius`, `--cc-z`.

## Public API

```js
// Banner / Settings-Panel erneut öffnen (z.B. für Footer-Link)
window.ccConsent.open();

// Aktuellen Consent-Status abfragen
window.ccConsent.getConsent();
// → { necessary: true, preferences: false, statistics: true, marketing: false, timestamp: 1714..., version: 1 }

// Consent zurücksetzen und Seite neu laden
window.ccConsent.reset();
```

### Custom Event

Das Plugin feuert ein `cc:change` Event auf `document`, sobald der Consent-Status ändert:

```js
document.addEventListener('cc:change', function (e) {
  console.log('Neuer Consent:', e.detail);
});
```

## Datenschutzerklärung-Vorlage

Folgender Textbaustein kann (in angepasster Form) in die Datenschutzerklärung der einbindenden Website übernommen werden, um den Einsatz des Plugins zu dokumentieren:

> ### Cookie-Einwilligungs-Management
>
> Diese Website nutzt **cc-plugin** (Open Source, MIT-Lizenz, [github.com/alahji7/cc-plugin](https://github.com/alahji7/cc-plugin)) zur Verwaltung Ihrer Einwilligung in den Einsatz von Cookies und ähnlichen Technologien. Das Plugin wird über das öffentliche Content Delivery Network jsDelivr (jsDelivr Ltd., GB) ausgeliefert; dabei wird Ihre IP-Adresse technisch bedingt an den CDN-Provider übermittelt. Die Verarbeitung erfolgt zur Bereitstellung der Website ([Art. 6 Abs. 1 lit. f DSGVO](https://dsgvo-gesetz.de/art-6-dsgvo/) bzw. Art. 31 nDSG, berechtigtes Interesse).
>
> Ihre Einwilligungs-Entscheidung wird ausschließlich lokal in Ihrem Browser (`localStorage`, Schlüssel `cc_consent`) für 30 Tage gespeichert und **nicht an Server übertragen**. Sie können Ihre Auswahl jederzeit über den Link „Cookie-Einstellungen" im Footer anpassen oder durch Löschen Ihrer Browserdaten zurücksetzen.

Anpassen pro Kunde: ggf. Hinweis auf eingebundene Drittanbieter (Google Analytics, YouTube, Google Maps etc.) ergänzen, je nach tatsächlicher Konfiguration.

## Versioning

Das Plugin folgt [Semantic Versioning](https://semver.org/lang/de/). Versionen werden über Git-Tags veröffentlicht und sind über jsDelivr unveränderlich abrufbar:

- **Pinned (empfohlen):** `@1.0.1` — fixe Version, ändert sich nie
- **Major-pinned:** `@1` — automatische Patch-Updates innerhalb der Major-Version

Siehe [CHANGELOG.md](./CHANGELOG.md) für die Versionshistorie.

## Disclaimer

Dieses Plugin ist ein **technisches Werkzeug** zur Umsetzung von Consent-Management auf Webseiten. Es ersetzt **keine rechtliche Beratung**. Die rechtskonforme Konfiguration, vollständige Cookie-Inventarisierung und Aktualisierung der Datenschutzerklärung liegt in der Verantwortung des Website-Betreibers.

**Was dieses Plugin nicht leistet:**
- Keine IAB TCF-Zertifizierung (relevant für programmatic Ad-Netzwerke wie Google Ad Manager)
- Kein automatisches Scannen der Seite nach gesetzten Cookies
- Keine Generierung von Datenschutzerklärungen
- Keine garantierte DSGVO/nDSG-Konformität — diese hängt von der korrekten Integration und den eingesetzten Drittanbietern ab

Das Plugin wird "AS IS" zur Verfügung gestellt. Siehe [LICENSE](./LICENSE).

## License

MIT — siehe [LICENSE](./LICENSE).
