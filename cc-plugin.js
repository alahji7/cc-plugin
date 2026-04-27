/* cc-plugin v1.0.0 | MIT | https://github.com/alahji7/cc-plugin */
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
    position: ['bottom', 'top', 'bottom-left', 'bottom-right'].indexOf(d.position) !== -1 ? d.position : 'bottom',
    privacyUrl: d.privacyUrl || '/datenschutz',
    gaId: d.gaId || ''
  });

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
      euTitle: 'Wir verwenden Cookies',
      euBody: 'Wir nutzen Cookies und ähnliche Technologien, um Inhalte und Funktionen bereitzustellen. Sie können selbst entscheiden, welche Kategorien Sie zulassen möchten.',
      privacyLink: 'Datenschutzerklärung',
      accept: 'Akzeptieren',
      acceptAll: 'Alles akzeptieren',
      rejectAll: 'Alles ablehnen',
      settings: 'Einstellungen',
      saveSelection: 'Auswahl speichern',
      necessary: 'Notwendig',
      necessaryDesc: 'Erforderlich für Login, Warenkorb und Sicherheit.',
      preferences: 'Präferenzen',
      preferencesDesc: 'Sprache, Region und gespeicherte Einstellungen.',
      statistics: 'Statistiken',
      statisticsDesc: 'Anonyme Nutzungsstatistik (z.B. Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Personalisierte Werbung und Retargeting.',
      placeholderTitle: 'Externer Inhalt',
      placeholderBody: 'Dieser Inhalt wird von einem Drittanbieter bereitgestellt. Mit dem Laden akzeptieren Sie die entsprechenden Cookies.',
      loadContent: 'Inhalt laden'
    },
    en: {
      chTitle: 'Privacy notice',
      chBody: 'This website uses cookies to provide you with the best experience.',
      euTitle: 'We use cookies',
      euBody: 'We use cookies and similar technologies to provide content and features. You can choose which categories to allow.',
      privacyLink: 'Privacy policy',
      accept: 'Accept',
      acceptAll: 'Accept all',
      rejectAll: 'Reject all',
      settings: 'Settings',
      saveSelection: 'Save selection',
      necessary: 'Necessary',
      necessaryDesc: 'Required for login, cart and security.',
      preferences: 'Preferences',
      preferencesDesc: 'Language, region and saved settings.',
      statistics: 'Statistics',
      statisticsDesc: 'Anonymous usage tracking (e.g. Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Personalised advertising and retargeting.',
      placeholderTitle: 'External content',
      placeholderBody: 'This content is provided by a third party. Loading it accepts the related cookies.',
      loadContent: 'Load content'
    },
    fr: {
      chTitle: 'Avis de confidentialité',
      chBody: 'Ce site utilise des cookies pour vous offrir la meilleure expérience.',
      euTitle: 'Nous utilisons des cookies',
      euBody: 'Nous utilisons des cookies et des technologies similaires pour fournir du contenu et des fonctionnalités. Vous pouvez choisir les catégories à autoriser.',
      privacyLink: 'Politique de confidentialité',
      accept: 'Accepter',
      acceptAll: 'Tout accepter',
      rejectAll: 'Tout refuser',
      settings: 'Paramètres',
      saveSelection: 'Enregistrer la sélection',
      necessary: 'Nécessaires',
      necessaryDesc: 'Requis pour la connexion, le panier et la sécurité.',
      preferences: 'Préférences',
      preferencesDesc: 'Langue, région et paramètres enregistrés.',
      statistics: 'Statistiques',
      statisticsDesc: 'Suivi d’utilisation anonyme (p.ex. Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Publicité personnalisée et reciblage.',
      placeholderTitle: 'Contenu externe',
      placeholderBody: 'Ce contenu est fourni par un tiers. Le charger accepte les cookies associés.',
      loadContent: 'Charger le contenu'
    },
    it: {
      chTitle: 'Informativa sulla privacy',
      chBody: 'Questo sito utilizza cookie per offrirti la migliore esperienza.',
      euTitle: 'Utilizziamo i cookie',
      euBody: 'Utilizziamo cookie e tecnologie simili per fornire contenuti e funzionalità. Puoi scegliere quali categorie consentire.',
      privacyLink: 'Informativa sulla privacy',
      accept: 'Accetta',
      acceptAll: 'Accetta tutto',
      rejectAll: 'Rifiuta tutto',
      settings: 'Impostazioni',
      saveSelection: 'Salva selezione',
      necessary: 'Necessari',
      necessaryDesc: 'Richiesti per login, carrello e sicurezza.',
      preferences: 'Preferenze',
      preferencesDesc: 'Lingua, regione e impostazioni salvate.',
      statistics: 'Statistiche',
      statisticsDesc: 'Tracciamento anonimo (es. Google Analytics).',
      marketing: 'Marketing',
      marketingDesc: 'Pubblicità personalizzata e retargeting.',
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
        '--cc-bg:#ffffff;',
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
      '#cc-banner .cc-categories{margin:16px 0 8px;border-top:1px solid var(--cc-border);padding-top:16px}',
      '#cc-banner .cc-cat{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--cc-border)}',
      '#cc-banner .cc-cat:last-child{border-bottom:none}',
      '#cc-banner .cc-cat-info{flex:1;min-width:0}',
      '#cc-banner .cc-cat-name{font-weight:600;margin-bottom:2px}',
      '#cc-banner .cc-cat-desc{color:var(--cc-muted);font-size:13px}',
      '#cc-banner .cc-toggle{position:relative;flex-shrink:0;width:40px;height:22px;display:inline-block;cursor:pointer;margin-top:2px}',
      '#cc-banner .cc-toggle input{opacity:0;width:0;height:0;position:absolute}',
      '#cc-banner .cc-toggle .cc-slider{position:absolute;inset:0;background:#cbd5e1;border-radius:22px;transition:.2s}',
      '#cc-banner .cc-toggle .cc-slider:before{content:"";position:absolute;left:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:.2s}',
      '#cc-banner .cc-toggle input:checked + .cc-slider{background:var(--cc-accent)}',
      '#cc-banner .cc-toggle input:checked + .cc-slider:before{transform:translateX(18px)}',
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

  function buildCategoryRow(key, isNecessary, checked) {
    var row = document.createElement('div');
    row.className = 'cc-cat';

    var info = document.createElement('div');
    info.className = 'cc-cat-info';

    var name = document.createElement('div');
    name.className = 'cc-cat-name';
    name.textContent = t[key];
    info.appendChild(name);

    var desc = document.createElement('div');
    desc.className = 'cc-cat-desc';
    desc.textContent = t[key + 'Desc'];
    info.appendChild(desc);

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

    row.appendChild(info);
    row.appendChild(label);
    return row;
  }

  function renderBanner() {
    removeBanner();
    injectStyles();

    var current = getConsent() || getDefaults(config.mode);

    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.className = 'cc-pos-' + config.position + ' cc-mode-' + config.mode;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', config.mode === 'ch' ? t.chTitle : t.euTitle);

    var title = document.createElement('h2');
    title.textContent = config.mode === 'ch' ? t.chTitle : t.euTitle;
    el.appendChild(title);

    var body = document.createElement('p');
    body.textContent = (config.mode === 'ch' ? t.chBody : t.euBody) + ' ';
    var link = document.createElement('a');
    link.href = config.privacyUrl;
    link.textContent = t.privacyLink;
    body.appendChild(link);
    el.appendChild(body);

    if (config.mode === 'ch') {
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
    if (src) el.setAttribute('src', src);
    el.style.display = '';
    delete el.dataset.ccBlocked;
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
          el.setAttribute('src', el.getAttribute('data-src'));
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
