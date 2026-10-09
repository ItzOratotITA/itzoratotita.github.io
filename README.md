# oratot.com

A static Jekyll site with shared English/Italian pages. No translation service,
additional Jekyll plugin, or separate copy of the website is needed.

## Languages

Use the **EN / IT** selector in the navigation bar. Language selection reloads
that same page, so unsaved form input is reset. The selected language is stored
in `localStorage` under `oratot.language` and carried through internal page links.

- Share an Italian page with `?lang=it`, for example `/about?lang=it`.
- Force English with `?lang=en`.
- An explicit supported URL language takes priority over the saved preference.
- New visitors see English; browser language is not automatically inferred.
- If browser storage is blocked, URL selection and translated navigation still work.
- Without JavaScript, the original English site remains usable; the selector is hidden.

### How translations work

English content stays in the existing pages and scripts. Italian strings live in
`_data/locales/it/`, grouped into `common`, `pages`, `pack`, `utilities`, and `charts`.
Jekyll embeds these small dictionaries into `/js/i18n.js` at build time using
`js/i18n.liquid` (the `.liquid` extension distinguishes the template from plain
JavaScript; its permalink keeps the public URL unchanged). Both
languages share every layout, image, stylesheet, download, and utility implementation.
The script does not fetch translations or send visitor content to external services.

Annotate an English text element with a translation key:

```html
<h1 data-i18n="utilities.qr_title">QR Code Generator</h1>
<input
  placeholder="Write a link or some text..."
  data-i18n-placeholder="utilities.qr_text_placeholder"
/>
```

Supported attribute translations are `data-i18n-placeholder`,
`data-i18n-aria-label`, `data-i18n-title`, and `data-i18n-alt`.
Use `data-i18n-html` only for trusted translated prose containing markup or links.
**Never put it on a form, interactive container, or an element with event-bound
children**, since it replaces the element's contents. Do not put user input in
HTML translations. With Markdown, a `<div markdown="1" data-i18n-html="...">`
can retain the existing English Markdown while the dictionary supplies Italian HTML.

Localize a runtime message with an English fallback:

```js
window.SiteI18n.t("utilities.coordinates", "{dimension} coordinates:", {
  dimension: "Nether",
});
```

Add `i18n_title` and `i18n_description` keys to page front matter to translate the
browser title and description/Open Graph metadata in the DOM. Missing entries
fall back to the original English. Proper names, user-entered data, original
third-party attribution lists, and the verbatim MIT license text are not translated.

### SEO trade-off

This is client-side translation: the generated HTML, canonical URLs, sitemap,
and structured data remain English. Italian links are shareable but are **not
separate, server-rendered localized pages**. If independent Italian search indexing
becomes important, generate `/it/` pages at build time from the same templates and
dictionaries rather than copying the website. No `hreflang` claims are made for
these client-side variants.

## Validation

With Jekyll and Node installed:

```sh
jekyll build
node --test tests/i18n.test.cjs
```

An optional offline integration test uses an installed Chromium and Python 3:

```sh
python3 tests/browser_i18n.py
```

The browser test starts and stops its own loopback HTTP server. It checks every
page in both languages, metadata, translation attributes, navigation, preference
persistence, switching, and utility runtime messages. External CDN resources are
omitted **only in test responses**, so this test covers unavailable-library messages
without fetching ApexCharts or other dependencies. It does not test rendering by
those external libraries or Bootstrap's visual layout.
