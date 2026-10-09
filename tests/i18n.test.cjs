const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "_site/js/i18n.js"), "utf8");
const dictionaries = Object.fromEntries(
  fs
    .readdirSync(path.join(root, "_data/locales/it"))
    .map((file) => [
      path.basename(file, ".json"),
      JSON.parse(
        fs.readFileSync(path.join(root, "_data/locales/it", file), "utf8"),
      ),
    ]),
);

function element(attributes = {}, text = "English") {
  return {
    attributes: { ...attributes },
    dataset: Object.fromEntries(
      Object.entries(attributes)
        .filter(([key]) => key.startsWith("data-"))
        .map(([key, value]) => [
          key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
          value,
        ]),
    ),
    textContent: text,
    innerHTML: text,
    content: text,
    hasAttribute(name) {
      return Object.hasOwn(this.attributes, name);
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
}

function initialize({
  query = "",
  saved,
  blocked = false,
  elements = [],
  anchors = [],
} = {}) {
  let ready;
  let assigned;
  let changed;
  const stored = new Map(saved ? [["oratot.language", saved]] : []);
  const wrapper = { hidden: true };
  const selector = {
    value: "en",
    closest: () => wrapper,
    addEventListener: (_, callback) => {
      changed = callback;
    },
  };
  const meta = element({}, "About this website and its creator, Paride.");
  const document = {
    documentElement: { lang: "en" },
    body: {
      dataset: {
        pageTitle: "About Me",
        pageI18nTitle: "pages.about_title",
        pageI18nDescription: "pages.about_description",
      },
    },
    title: "About Me | oratot.com",
    addEventListener: (_, callback) => {
      ready = callback;
    },
    getElementById: () => selector,
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === "a[href]") return anchors;
      if (selector.includes("meta[")) return [meta];
      if (selector === "[data-i18n], [data-i18n-html]")
        return elements.filter(
          (entry) =>
            entry.hasAttribute("data-i18n") ||
            entry.hasAttribute("data-i18n-html"),
        );
      const attribute = selector.slice(1, -1);
      return elements.filter((entry) => entry.hasAttribute(attribute));
    },
  };
  const window = {
    location: {
      href: `https://www.oratot.com/about${query}`,
      assign: (href) => {
        assigned = href;
      },
    },
    localStorage: {
      getItem: (key) => {
        if (blocked) throw Error("Blocked");
        return stored.get(key);
      },
      setItem: (key, value) => {
        if (blocked) throw Error("Blocked");
        stored.set(key, value);
      },
    },
  };
  vm.runInNewContext(source, { window, document, URL });
  return {
    window,
    document,
    stored,
    ready,
    wrapper,
    selector,
    change: () => changed(),
    assigned: () => assigned,
  };
}

test("explicit language wins over storage; English is the default", () => {
  for (const [options, expected] of [
    [{}, "en"],
    [{ saved: "it" }, "it"],
    [{ query: "?lang=en", saved: "it" }, "en"],
    [{ query: "?lang=it", saved: "en" }, "it"],
    [{ query: "?lang=invalid", saved: "it" }, "it"],
    [{ saved: "invalid" }, "en"],
    [{ blocked: true }, "en"],
    [{ blocked: true, query: "?lang=it" }, "it"],
  ]) {
    const result = initialize(options);
    assert.equal(result.window.SiteI18n.language, expected);
    assert.equal(result.document.documentElement.lang, expected);
  }
});

test("translations support missing-key fallback and interpolation without interpreting HTML", () => {
  const { window } = initialize({ query: "?lang=it" });
  assert.equal(window.SiteI18n.t("common.about", "ABOUT"), "CHI SONO");
  assert.equal(window.SiteI18n.t("unknown.missing", "Fallback"), "Fallback");
  assert.equal(
    window.SiteI18n.t("utilities.coordinates", "{dimension} coordinates:", {
      dimension: "<b>Nether</b>",
    }),
    "Coordinate <b>Nether</b>:",
  );
  assert.equal(
    initialize().window.SiteI18n.t("common.about", "ABOUT"),
    "ABOUT",
  );
});

test("DOM text, trusted prose, accessibility attributes and metadata are localized", () => {
  const text = element({ "data-i18n": "common.about" }, "ABOUT");
  const prose = element(
    { "data-i18n-html": "pages.home_intro" },
    "English intro",
  );
  const input = element({
    "data-i18n-placeholder": "utilities.x_placeholder",
    placeholder: "Example: 123.5",
    "data-i18n-aria-label": "common.language",
    "aria-label": "Language",
  });
  input.value = "User content";
  const state = initialize({
    query: "?lang=it",
    elements: [text, prose, input],
  });
  state.ready();
  assert.equal(text.textContent, "CHI SONO");
  assert.match(prose.innerHTML, /Benvenuto/);
  assert.equal(input.attributes.placeholder, "Esempio: 123.5");
  assert.equal(input.attributes["aria-label"], "Lingua");
  assert.equal(input.value, "User content");
  assert.equal(state.document.title, "Chi sono | oratot.com");
  assert.equal(state.wrapper.hidden, false);
  assert.equal(state.selector.value, "it");
});

test("internal page links retain language, parameters and fragments; downloads and external links do not change", () => {
  const links = [
    "/socials?test=1#section",
    "#downloads",
    "/pack/file.zip",
    "https://example.com/about",
    "mailto:paride@oratot.com",
    "/assets/skin.png",
    "/pack",
  ].map((href) => element({ href }));
  links[6].attributes.download = "pack.zip";
  const state = initialize({ query: "?lang=it&extra=1#specs", anchors: links });
  state.ready();
  assert.equal(
    links[0].href,
    "https://www.oratot.com/socials?test=1&lang=it#section",
  );
  for (const link of links.slice(1)) assert.equal(link.href, undefined);
  state.selector.value = "en";
  state.change();
  assert.equal(
    state.assigned(),
    "https://www.oratot.com/about?lang=en&extra=1#specs",
  );
});

function filesUnder(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(filename) : [filename];
  });
}

test("every built translation annotation and runtime key has an Italian entry", () => {
  const filenames = filesUnder(path.join(root, "_site")).filter((file) =>
    /\.(html|js)$/.test(file),
  );
  let keys = 0;
  for (const file of filenames) {
    const content = fs.readFileSync(file, "utf8");
    const matches = [
      ...content.matchAll(
        /data-(?:page-)?i18n(?:-html|-aria-label|-placeholder|-title|-description|-alt)?="([\w]+\.[\w]+)"/g,
      ),
      ...content.matchAll(
        /["']((?:common|pages|pack|charts|utilities)\.[\w]+)["']/g,
      ),
    ];
    for (const [, key] of matches) {
      const [section, name] = key.split(".");
      assert.equal(
        typeof dictionaries[section]?.[name],
        "string",
        `${path.relative(root, file)}: ${key}`,
      );
      keys++;
    }
  }
  assert.ok(keys > 200);
});
