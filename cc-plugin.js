/* cc-plugin v1.1.3 | MIT | https://github.com/alahji7/cc-plugin */
(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────────────
  // CONFIG
  // ────────────────────────────────────────────────────────────────────
  var scriptEl = document.currentScript;
  if (!scriptEl) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf('cc-plugin') !== -1) {
        scriptEl = scripts[i];
        break;
      }
    }
  }
  if (!scriptEl) return;

  var d = scriptEl.dataset;
  var config = Object.freeze({
    mode: d.mode === 'eu' ? 'eu' : 'ch',
    lang: ['de', 'en', 'fr', 'it'].indexOf(d.lang) !== -1 ? d.lang : 'de',
    accent: d.accent || '#2563eb',
    bg: d.bg || '#ffffff',
    position: ['bottom', 'top', 'bottom-left', 'bottom-right'].indexOf(d.position) !== -1 ? d.position : 'bottom',
    privacyUrl: d.privacyUrl || '/datenschutz',
    gaId: d.gaId || '',
    acknowledged: d.acknowledged === 'true',
    allowMarketing: d.allowMarketing === 'true'
  });

  if (!config.acknowledged && typeof console !== 'undefined' && console.warn) {
    console.warn(
      '[cc-plugin] Hinweis: data-acknowledged="true" fehlt am Script-Tag. ' +
      'Bitte LICENSE und Disclaimer lesen und das Attribut setzen, um Kenntnisnahme zu bestätigen. ' +
      'Details: https://github.com/alahji7/cc-plugin#-not-for-professional-use-without-review'
    );
  }

  var STORAGE_KEY = 'cc_consent';
  var CONSENT_VERSION = 1;
  var EXPIRY_DAYS = 30;
  var CATEGORIES = ['necessary', 'preferences', 'statistics', 'marketing'];

  // ────────────────────────────────────────────────────────────────────
  // I18N
  // ────────────────────────────────────────────────────────────────────
  var i18n = {
    de: {
      chTitle: 'Datenschutzhinweis',
      chBody: 'Diese Website verwendet Cookies, um Ihnen das beste Erlebnis zu bieten.',
      chBodyMarketing: 'Diese Website verwendet Cookies für Statistik und Marketing. Sie können einzelne Kategorien jederzeit deaktivieren.',
      marketingDescDetailed: 'Personalisierte Werbung und Cross-Site-Profiling (z.B. Meta Pixel).',
      euTitle: 'Wir verwenden Cookies',
      euBody: 'Wir nutzen Cookies und ähnliche Technologien, um Inhalte und Funktionen bereitzustellen. Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten.',
      privacyLink: 'Datenschutzerklärung',
      accept: 'Akzeptieren',
      acceptAll: 'Alles akzeptieren',
      rejectAll: 'Alles ablehnen',
      settings: 'Einstellungen',
      saveSelection: 'Auswahl speichern',
      necessary: 'Notwendige Cookies zulassen',
      necessaryDesc: 'Unverzichtbar für die Funktionalität der Website.',
      preferences: 'Präferenz-Cookies zulassen',
      preferencesDesc: 'Speichern Ihrer Sprache, Region und Einstellungen.',
      statistics: 'Statistik-Cookies zulassen',
      statisticsDesc: 'Helfen uns, unsere Website zu verbessern.',
      marketing: 'Marketing-Cookies zulassen',
      marketingDesc: 'Personalisierte Werbung.',
      placeholderTitle: 'Externer Inhalt',
      placeholderBody: 'Dieser Inhalt wird von einem Drittanbieter bereitgestellt. Mit dem Laden akzeptieren Sie die entsprechenden Cookies.',
      loadContent: 'Inhalt laden'
    },
    en: {
      chTitle: 'Privacy notice',
      chBody: 'This website uses cookies to provide you with the best experience.',
      chBodyMarketing: 'This website uses cookies for statistics and marketing. You can disable individual categories at any time.',
      marketingDescDetailed: 'Personalised advertising and cross-site profiling (e.g. Meta Pixel).',
      euTitle: 'We use cookies',
      euBody: 'We use cookies and similar technologies to provide content and features. You can choose which categories to allow.',
      privacyLink: 'Privacy policy',
      accept: 'Accept',
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      settings: 'Settings',
      saveSelection: 'Save selection',
      necessary: 'Allow necessary cookies',
      necessaryDesc: 'Essential for the website to function.',
      preferences: 'Allow preference cookies',
      preferencesDesc: 'Save your language, region and settings.',
      statistics: 'Allow statistics cookies',
      statisticsDesc: 'Help us improve our website.',
      marketing: 'Allow marketing cookies',
      marketingDesc: 'Personalised advertising.',
      placeholderTitle: 'External content',
      placeholderBody: 'This content is provided by a third party. Loading it accepts the related cookies.',
      loadContent: 'Load content'
    },
    fr: {
      chTitle: 'Avis de confidentialité',
      chBody: 'Ce site utilise des cookies pour vous offrir la meilleure expérience.',
      chBodyMarketing: 'Ce site utilise des cookies à des fins statistiques et marketing. Vous pouvez désactiver chaque catégorie à tout moment.',
      marketingDescDetailed: 'Publicité personnalisée et profilage entre sites (p.ex. Meta Pixel).',
      euTitle: 'Nous utilisons des cookies',
      euBody: 'Nous utilisons des cookies et des technologies similaires pour fournir du contenu et des fonctionnalités. Vous pouvez choisir les catégories à autoriser.',
      privacyLink: 'Politique de confidentialité',
      accept: 'Accepter',
      acceptAll: 'Tout accepter',
      rejectAll: 'Tout refuser',
      settings: 'Paramètres',
      saveSelection: 'Enregistrer la sélection',
      necessary: 'Autoriser les cookies nécessaires',
      necessaryDesc: 'Indispensables au fonctionnement du site.',
      preferences: 'Autoriser les cookies de préférences',
      preferencesDesc: 'Enregistrer votre langue, région et préférences.',
      statistics: 'Autoriser les cookies statistiques',
      statisticsDesc: 'Nous aident à améliorer notre site.',
      marketing: 'Autoriser les cookies marketing',
      marketingDesc: 'Publicité personnalisée.',
      placeholderTitle: 'Contenu externe',
      placeholderBody: 'Ce contenu est fourni par un tiers. Le charger accepte les cookies associés.',
      loadContent: 'Charger le contenu'
    },
    it: {
      chTitle: 'Informativa sulla privacy',
      chBody: 'Questo sito utilizza cookie per offrirti la migliore esperienza.',
      chBodyMarketing: 'Questo sito utilizza cookie a fini statistici e di marketing. Puoi disattivare singole categorie in qualsiasi momento.',
      marketingDescDetailed: 'Pubblicità personalizzata e profilazione tra siti (es. Meta Pixel).',
      euTitle: 'Utilizziamo i cookie',
      euBody: 'Utilizziamo cookie e tecnologie simili per fornire contenuti e funzionalità. Puoi scegliere quali categorie consentire.',
      privacyLink: 'Informativa sulla privacy',
      accept: 'Accetta',
      acceptAll: 'Accetta tutto',
      rejectAll: 'Rifiuta tutto',
      settings: 'Impostazioni',
      saveSelection: 'Salva selezione',
      necessary: 'Consenti i cookie necessari',
      necessaryDesc: 'Indispensabili per il funzionamento del sito.',
      preferences: 'Consenti i cookie di preferenza',
      preferencesDesc: 'Salvano lingua, regione e impostazioni.',
      statistics: 'Consenti i cookie di statistica',
      statisticsDesc: 'Ci aiutano a migliorare il sito.',
      marketing: 'Consenti i cookie di marketing',
      marketingDesc: 'Pubblicità personalizzata.',
      placeholderTitle: 'Contenuto esterno',
      placeholderBody: 'Questo contenuto è fornito da terzi. Caricarlo accetta i cookie correlati.',
      loadContent: 'Carica contenuto'
    }
  };
  var t = i18n[config.lang];

  // ────────────────────────────────────────────────────────────────────
  // CONSENT STATE
  // ────────────────────────────────────────────────────────────────────
  function getDefaults(mode) {
    if (mode === 'ch') {
      return { necessary: true, preferences: true, statistics: true, marketing: false };
    }
    return { necessary: true, preferences: false, statistics: false, marketing: false };
  }

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      var ageMs = Date.now() - (data.timestamp || 0);
      if (ageMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function setConsent(categories) {
    var record = {
      necessary: true,
      preferences: !!categories.preferences,
      statistics: !!categories.statistics,
      marketing: !!categories.marketing,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {}
    document.dispatchEvent(new CustomEvent('cc:change', { detail: record }));
    return record;
  }

  // ────────────────────────────────────────────────────────────────────
  // GOOGLE ANALYTICS CONSENT MODE V2
  // ────────────────────────────────────────────────────────────────────
  function consentToSignals(c) {
    return {
      security_storage: c.necessary ? 'granted' : 'denied',
      functionality_storage: c.preferences ? 'granted' : 'denied',
      personalization_storage: c.preferences ? 'granted' : 'denied',
      analytics_storage: c.statistics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    };
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  function initGA(consent) {
    if (!config.gaId) return;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', consentToSignals(consent));
    gtag('js', new Date());
    gtag('config', config.gaId);

    if (!document.querySelector('script[data-cc-ga]')) {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.gaId);
      s.setAttribute('data-cc-ga', '1');
      document.head.appendChild(s);
    }
  }

  function updateGA(consent) {
    if (!config.gaId || !window.dataLayer) return;
    gtag('consent', 'update', consentToSignals(consent));
  }

  // ────────────────────────────────────────────────────────────────────
  // STYLES
  // ────────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cc-plugin-styles')) return;
    var css = [
      ':root{',
        '--cc-accent:', config.accent, ';',
        '--cc-bg:', config.bg, ';',
        '--cc-text:#1a1a1a;',
        '--cc-muted:#6b7280;',
        '--cc-border:#e5e7eb;',
        '--cc-radius:12px;',
        '--cc-z:2147483000;',
      '}',
      '#cc-banner,#cc-banner *{box-sizing:border-box;font-family:inherit}',
      '#cc-banner{position:fixed;z-index:var(--cc-z);background:var(--cc-bg);color:var(--cc-text);',
        'border:1px solid var(--cc-border);border-radius:var(--cc-radius);box-shadow:0 10px 40px rgba(0,0,0,.15);',
        'padding:20px;font-size:14px;line-height:1.5;max-width:560px}',
      '#cc-banner.cc-pos-bottom{left:50%;transform:translateX(-50%);bottom:20px;width:calc(100% - 40px);max-width:760px}',
      '#cc-banner.cc-pos-top{left:50%;transform:translateX(-50%);top:20px;width:calc(100% - 40px);max-width:760px}',
      '#cc-banner.cc-pos-bottom-left{left:20px;bottom:20px;width:calc(100% - 40px);max-width:420px}',
      '#cc-banner.cc-pos-bottom-right{right:20px;bottom:20px;width:calc(100% - 40px);max-width:420px}',
      '#cc-banner.cc-mode-ch.cc-pos-bottom,#cc-banner.cc-mode-ch.cc-pos-top{max-width:520px}',
      '#cc-banner.cc-marketing{max-width:460px}',
      '#cc-banner h2{font-size:16px;font-weight:600;margin:0 0 8px}',
      '#cc-banner p{margin:0 0 12px;color:var(--cc-text)}',
      '#cc-banner a{color:var(--cc-accent);text-decoration:underline}',
      '#cc-banner .cc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
      '#cc-banner .cc-actions.cc-end{justify-content:flex-end}',
      '#cc-banner button{appearance:none;border:1px solid var(--cc-border);background:#fff;color:var(--cc-text);',
        'padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit}',
      '#cc-banner button:hover{border-color:var(--cc-accent)}',
      '#cc-banner button.cc-primary{background:var(--cc-accent);color:#fff;border-color:var(--cc-accent)}',
      '#cc-banner button.cc-primary:hover{filter:brightness(1.1)}',
      '#cc-banner .cc-categories{margin:16px 0 8px;padding:16px;border:1px solid var(--cc-border);border-radius:8px}',
      '#cc-banner .cc-cat{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}',
      '#cc-banner .cc-cat:last-child{margin-bottom:0}',
      '#cc-banner .cc-cat-name{flex:1;font-weight:300;font-size:14px;color:var(--cc-muted)}',
      '#cc-banner .cc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
      '#cc-banner .cc-toggle{position:relative;flex-shrink:0;width:44px;height:24px;display:inline-block;cursor:pointer}',
      '#cc-banner .cc-toggle input{opacity:0;width:0;height:0;position:absolute}',
      '#cc-banner .cc-toggle .cc-slider{position:absolute;inset:0;background:#e5e7eb;border-radius:12px;transition:.2s}',
      '#cc-banner .cc-toggle .cc-slider:before{content:"";position:absolute;left:2px;top:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:.2s}',
      '#cc-banner .cc-toggle input:checked + .cc-slider{background:var(--cc-accent)}',
      '#cc-banner .cc-toggle input:checked + .cc-slider:before{transform:translateX(20px)}',
      '#cc-banner .cc-toggle input:disabled + .cc-slider{opacity:.5;cursor:not-allowed}',
      '#cc-banner .cc-customize{display:none}',
      '#cc-banner.cc-show-customize .cc-customize{display:block}',
      '#cc-banner.cc-show-customize .cc-default-actions{display:none}',
      '@media (max-width:600px){',
        '#cc-banner .cc-actions{flex-direction:column}',
        '#cc-banner .cc-actions button{width:100%}',
      '}',
      '.cc-placeholder{position:relative;display:flex;align-items:center;justify-content:center;',
        'background:#f3f4f6;border:1px solid var(--cc-border);border-radius:8px;padding:24px;text-align:center;',
        'min-height:200px;color:var(--cc-text);font-family:inherit;font-size:14px;line-height:1.5}',
      '.cc-placeholder-inner{max-width:360px}',
      '.cc-placeholder-title{font-weight:600;margin-bottom:6px}',
      '.cc-placeholder-body{color:var(--cc-muted);margin-bottom:12px;font-size:13px}',
      '.cc-placeholder button{appearance:none;border:none;background:var(--cc-accent);color:#fff;',
        'padding:10px 16px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit}',
      '.cc-placeholder button:hover{filter:brightness(1.1)}'
    ].join('');

    var style = document.createElement('style');
    style.id = 'cc-plugin-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ────────────────────────────────────────────────────────────────────
  // BANNER UI
  // ────────────────────────────────────────────────────────────────────
  var bannerEl = null;

  function buildCategoryRow(key, isNecessary, checked, descOverride) {
    var row = document.createElement('div');
    row.className = 'cc-cat';
    var description = descOverride || t[key + 'Desc'];
    row.title = description;

    var nameLabel = document.createElement('span');
    nameLabel.className = 'cc-cat-name';
    nameLabel.textContent = t[key];
    row.appendChild(nameLabel);

    var srDesc = document.createElement('span');
    srDesc.className = 'cc-sr-only';
    srDesc.textContent = description;
    row.appendChild(srDesc);

    var label = document.createElement('label');
    label.className = 'cc-toggle';

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.cat = key;
    input.checked = checked;
    if (isNecessary) input.disabled = true;

    var slider = document.createElement('span');
    slider.className = 'cc-slider';

    label.appendChild(input);
    label.appendChild(slider);

    row.appendChild(label);
    return row;
  }

  function renderBanner() {
    removeBanner();
    injectStyles();

    var current = getConsent() || getDefaults(config.mode);

    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.className = 'cc-pos-' + config.position + ' cc-mode-' + config.mode + (config.mode === 'ch' && config.allowMarketing ? ' cc-marketing' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', config.mode === 'ch' ? t.chTitle : t.euTitle);

    var title = document.createElement('h2');
    title.textContent = config.mode === 'ch' ? t.chTitle : t.euTitle;
    el.appendChild(title);

    var bodyText;
    if (config.mode === 'ch') {
      bodyText = config.allowMarketing ? t.chBodyMarketing : t.chBody;
    } else {
      bodyText = t.euBody;
    }
    var body = document.createElement('p');
    body.textContent = bodyText + ' ';
    var link = document.createElement('a');
    link.href = config.privacyUrl;
    link.textContent = t.privacyLink;
    body.appendChild(link);
    el.appendChild(body);

    if (config.mode === 'ch' && !config.allowMarketing) {
      var chActions = document.createElement('div');
      chActions.className = 'cc-actions';
      var acceptBtn = document.createElement('button');
      acceptBtn.className = 'cc-primary';
      acceptBtn.textContent = t.accept;
      acceptBtn.addEventListener('click', function () {
        applyConsent(getDefaults('ch'));
      });
      chActions.appendChild(acceptBtn);
      el.appendChild(chActions);
    } else if (config.mode === 'ch' && config.allowMarketing) {
      // CH-Modus mit Marketing-Opt-in: 3-Button-Layout + Customize-Panel
      var chmActions = document.createElement('div');
      chmActions.className = 'cc-actions cc-default-actions';

      var chmRejectBtn = document.createElement('button');
      chmRejectBtn.textContent = t.rejectAll;
      chmRejectBtn.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: false, statistics: false, marketing: false });
      });

      var chmSettingsBtn = document.createElement('button');
      chmSettingsBtn.textContent = t.settings;
      chmSettingsBtn.addEventListener('click', function () {
        el.classList.add('cc-show-customize');
      });

      var chmAcceptBtn = document.createElement('button');
      chmAcceptBtn.className = 'cc-primary';
      chmAcceptBtn.textContent = t.acceptAll;
      chmAcceptBtn.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: true, statistics: true, marketing: true });
      });

      chmActions.appendChild(chmRejectBtn);
      chmActions.appendChild(chmSettingsBtn);
      chmActions.appendChild(chmAcceptBtn);
      el.appendChild(chmActions);

      var chmCustomize = document.createElement('div');
      chmCustomize.className = 'cc-customize';

      var chmCats = document.createElement('div');
      chmCats.className = 'cc-categories';
      chmCats.appendChild(buildCategoryRow('necessary', true, true));
      // Statistics: im CH-Modus default-on (entspricht getDefaults('ch'))
      chmCats.appendChild(buildCategoryRow('statistics', false, current.statistics));
      // Marketing: default-off, ausführlichere Beschreibung wegen Profiling-Charakter
      chmCats.appendChild(buildCategoryRow('marketing', false, current.marketing, t.marketingDescDetailed));
      chmCustomize.appendChild(chmCats);

      var chmCustomActions = document.createElement('div');
      chmCustomActions.className = 'cc-actions cc-end';

      var chmSaveBtn = document.createElement('button');
      chmSaveBtn.textContent = t.saveSelection;
      chmSaveBtn.addEventListener('click', function () {
        var picked = { necessary: true, preferences: true };
        var inputs = el.querySelectorAll('.cc-toggle input[data-cat]');
        for (var i = 0; i < inputs.length; i++) {
          picked[inputs[i].dataset.cat] = inputs[i].checked;
        }
        applyConsent(picked);
      });

      var chmAcceptAllBtn = document.createElement('button');
      chmAcceptAllBtn.className = 'cc-primary';
      chmAcceptAllBtn.textContent = t.acceptAll;
      chmAcceptAllBtn.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: true, statistics: true, marketing: true });
      });

      chmCustomActions.appendChild(chmSaveBtn);
      chmCustomActions.appendChild(chmAcceptAllBtn);
      chmCustomize.appendChild(chmCustomActions);

      el.appendChild(chmCustomize);
    } else {
      var defaultActions = document.createElement('div');
      defaultActions.className = 'cc-actions cc-default-actions';

      var rejectBtn = document.createElement('button');
      rejectBtn.textContent = t.rejectAll;
      rejectBtn.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: false, statistics: false, marketing: false });
      });

      var settingsBtn = document.createElement('button');
      settingsBtn.textContent = t.settings;
      settingsBtn.addEventListener('click', function () {
        el.classList.add('cc-show-customize');
      });

      var acceptAllBtn = document.createElement('button');
      acceptAllBtn.className = 'cc-primary';
      acceptAllBtn.textContent = t.acceptAll;
      acceptAllBtn.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: true, statistics: true, marketing: true });
      });

      defaultActions.appendChild(rejectBtn);
      defaultActions.appendChild(settingsBtn);
      defaultActions.appendChild(acceptAllBtn);
      el.appendChild(defaultActions);

      var customize = document.createElement('div');
      customize.className = 'cc-customize';

      var cats = document.createElement('div');
      cats.className = 'cc-categories';
      cats.appendChild(buildCategoryRow('necessary', true, true));
      cats.appendChild(buildCategoryRow('preferences', false, current.preferences));
      cats.appendChild(buildCategoryRow('statistics', false, current.statistics));
      cats.appendChild(buildCategoryRow('marketing', false, current.marketing));
      customize.appendChild(cats);

      var customActions = document.createElement('div');
      customActions.className = 'cc-actions cc-end';

      var saveBtn = document.createElement('button');
      saveBtn.textContent = t.saveSelection;
      saveBtn.addEventListener('click', function () {
        var picked = { necessary: true };
        var inputs = el.querySelectorAll('.cc-toggle input[data-cat]');
        for (var i = 0; i < inputs.length; i++) {
          picked[inputs[i].dataset.cat] = inputs[i].checked;
        }
        applyConsent(picked);
      });

      var acceptAllBtn2 = document.createElement('button');
      acceptAllBtn2.className = 'cc-primary';
      acceptAllBtn2.textContent = t.acceptAll;
      acceptAllBtn2.addEventListener('click', function () {
        applyConsent({ necessary: true, preferences: true, statistics: true, marketing: true });
      });

      customActions.appendChild(saveBtn);
      customActions.appendChild(acceptAllBtn2);
      customize.appendChild(customActions);

      el.appendChild(customize);
    }

    document.body.appendChild(el);
    bannerEl = el;
  }

  function removeBanner() {
    if (bannerEl && bannerEl.parentNode) {
      bannerEl.parentNode.removeChild(bannerEl);
    }
    bannerEl = null;
  }

  function applyConsent(categories) {
    var record = setConsent(categories);
    updateGA(record);
    removeBanner();
  }

  // ────────────────────────────────────────────────────────────────────
  // EMBED BLOCKER
  // ────────────────────────────────────────────────────────────────────
  var EMBED_CATEGORY_MAP = {
    youtube: 'marketing',
    maps: 'statistics',
    vimeo: 'marketing'
  };

  function categoryForElement(el) {
    if (el.dataset.ccCategory) return el.dataset.ccCategory;
    var key = el.dataset.cc;
    return EMBED_CATEGORY_MAP[key] || 'marketing';
  }

  function blockElement(el) {
    if (el.dataset.ccBlocked === '1') return;
    el.dataset.ccBlocked = '1';

    var originalSrc = el.getAttribute('data-src') || el.getAttribute('src') || '';
    if (originalSrc) {
      el.setAttribute('data-src', originalSrc);
      el.removeAttribute('src');
    }

    var placeholder = document.createElement('div');
    placeholder.className = 'cc-placeholder';
    placeholder.dataset.ccFor = el.dataset.cc;

    var rect = el.getBoundingClientRect();
    if (rect.width) placeholder.style.width = rect.width + 'px';
    if (rect.height) placeholder.style.height = rect.height + 'px';

    var inner = document.createElement('div');
    inner.className = 'cc-placeholder-inner';

    var title = document.createElement('div');
    title.className = 'cc-placeholder-title';
    title.textContent = t.placeholderTitle;
    inner.appendChild(title);

    var body = document.createElement('div');
    body.className = 'cc-placeholder-body';
    body.textContent = t.placeholderBody;
    inner.appendChild(body);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t.loadContent;
    btn.addEventListener('click', function () {
      var current = getConsent() || getDefaults(config.mode);
      var category = categoryForElement(el);
      current[category] = true;
      applyConsent(current);
    });
    inner.appendChild(btn);

    placeholder.appendChild(inner);

    el.style.display = 'none';
    el.parentNode.insertBefore(placeholder, el);
  }

  function unblockElement(el) {
    if (el.dataset.ccBlocked !== '1') return;
    var placeholder = el.previousElementSibling;
    if (placeholder && placeholder.classList.contains('cc-placeholder')) {
      placeholder.parentNode.removeChild(placeholder);
    }
    var src = el.getAttribute('data-src');
    delete el.dataset.ccBlocked;
    if (src) {
      // Replace with a clone so third-party scripts (e.g. Webflow's lazy
      // loader) that watch the original element cannot clear the src again.
      var clone = el.cloneNode(false);
      clone.setAttribute('src', src);
      clone.style.display = '';
      el.parentNode.replaceChild(clone, el);
    } else {
      el.style.display = '';
    }
  }

  function scanEmbeds() {
    var consent = getConsent() || getDefaults(config.mode);
    var nodes = document.querySelectorAll('[data-cc]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var category = categoryForElement(el);
      if (consent[category]) {
        if (el.dataset.ccBlocked === '1') unblockElement(el);
        else if (!el.getAttribute('src') && el.getAttribute('data-src')) {
          var lazySrc = el.getAttribute('data-src');
          var lazyClone = el.cloneNode(false);
          lazyClone.setAttribute('src', lazySrc);
          el.parentNode.replaceChild(lazyClone, el);
        }
      } else {
        blockElement(el);
      }
    }
  }

  function watchEmbeds() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('[data-cc]')) scanEmbeds();
          else if (n.querySelector && n.querySelector('[data-cc]')) scanEmbeds();
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ────────────────────────────────────────────────────────────────────
  // BOOTSTRAP
  // ────────────────────────────────────────────────────────────────────
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  var stored = getConsent();
  var initialConsent = stored || getDefaults(config.mode);
  initGA(initialConsent);

  document.addEventListener('cc:change', function () {
    scanEmbeds();
  });

  ready(function () {
    injectStyles();
    scanEmbeds();
    watchEmbeds();
    if (!stored) renderBanner();
  });

  window.ccConsent = {
    open: function () { renderBanner(); },
    getConsent: function () { return getConsent() || getDefaults(config.mode); },
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.reload();
    }
  };
})();
