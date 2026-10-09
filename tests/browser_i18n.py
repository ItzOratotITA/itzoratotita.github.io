"""Offline browser integration test; requires a Jekyll build and Chromium."""

import functools
import http.server
import json
import re
import shutil
import subprocess
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "_site"
TRANSLATIONS = {
    file.stem: json.loads(file.read_text())
    for file in (ROOT / "_data/locales/it").glob("*.json")
}
PAGES = [
    "/",
    "/about",
    "/socials",
    "/credits",
    "/discord",
    "/404.html",
    "/pack/",
    "/utils/nether",
    "/utils/qrcode",
    "/utils/charts/",
    "/utils/charts/alt",
    "/utils/charts/svg_disclaimer",
    "/c23H43jd90C4.html",
]
HARNESS = """<!doctype html><html><body><pre id="results">RUNNING</pre><script>
const dictionaries = DICTIONARIES;
const pages = PAGES;
let assertions = 0;
function check(condition, message) {
  if (!condition) throw new Error(message);
  assertions++;
}
function lookup(key) { const [section, name] = key.split('.'); return dictionaries[section][name]; }
function load(frame, url) {
  return new Promise((resolve) => { frame.onload = resolve; frame.src = url; });
}
(async () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  for (const language of ['it', 'en']) {
    for (const page of pages) {
      await load(frame, page + '?lang=' + language);
      const doc = frame.contentDocument;
      check(doc.documentElement.lang === language, page + ': document language');
      if (language === 'it') {
        for (const node of doc.querySelectorAll('[data-i18n]')) {
          check(node.textContent === lookup(node.dataset.i18n), page + ': ' + node.dataset.i18n);
        }
        for (const node of doc.querySelectorAll('[data-i18n-html]')) {
          const template = doc.createElement('template');
          template.innerHTML = lookup(node.dataset.i18nHtml);
          check(node.textContent === template.content.textContent, page + ': ' + node.dataset.i18nHtml);
        }
        for (const attribute of ['aria-label', 'placeholder', 'alt', 'title']) {
          for (const node of doc.querySelectorAll('[data-i18n-' + attribute + ']')) {
            check(node.getAttribute(attribute) === lookup(node.getAttribute('data-i18n-' + attribute)), page + ': ' + attribute);
          }
        }
        if (doc.body.dataset.pageI18nTitle) {
          check(doc.title.includes(lookup(doc.body.dataset.pageI18nTitle)), page + ': title');
        }
        if (doc.body.dataset.pageI18nDescription) {
          check(doc.querySelector('meta[name="description"]').content === lookup(doc.body.dataset.pageI18nDescription), page + ': metadata');
        }
      }
      const selector = doc.getElementById('languageSelect');
      if (selector) {
        check(selector.value === language && !selector.closest('.language-switcher').hidden, page + ': selector');
      }
      for (const node of doc.querySelectorAll('a[href]')) {
        const href = node.getAttribute('href');
        if (href.startsWith('#') || node.hasAttribute('download')) continue;
        const target = new URL(href, frame.src);
        if (target.origin === location.origin && !/\\.[a-z0-9]+$/i.test(target.pathname)) {
          check(target.searchParams.get('lang') === language, page + ': internal link ' + href);
        }
      }
      if (page === '/utils/nether') {
        doc.getElementById('x').value = '80';
        doc.getElementById('z').value = '-160';
        doc.getElementById('netherForm').dispatchEvent(new frame.contentWindow.Event('submit', { cancelable: true }));
        const result = doc.getElementById('result').textContent;
        check(result.includes('X: 10') && result.includes('Z: -20'), 'Nether arithmetic unchanged');
        check(result.includes(language === 'it' ? 'Coordinate Nether:' : 'Nether coordinates:'), 'Nether localized runtime');
        doc.getElementById('resetNether').click();
        check(doc.getElementById('result').textContent === (language === 'it' ? dictionaries.utilities.result_placeholder : 'Result will appear here.'), 'Nether reset');
      }
      if (page === '/utils/qrcode') {
        check(doc.getElementById('qrText').value === 'https://www.oratot.com/c23H43jd90C4', 'QR input unchanged');
        check(doc.getElementById('qrStatus').textContent === (language === 'it' ? dictionaries.utilities.qr_library_unavailable : 'The QR library could not be loaded. Try refreshing the page.'), 'QR localized runtime');
      }
      if (page === '/utils/charts/' || page === '/utils/charts/alt') {
        check(doc.getElementById('chartLabels').value === 'Apples, Bananas, Oranges', 'Chart input unchanged');
        check(doc.getElementById('chartStatus').textContent.includes(language === 'it' ? 'caricare' : 'could not be loaded'), 'Chart localized runtime');
      }
    }
  }
  await load(frame, '/about?lang=it&keep=1#my-pc-specs');
  const switched = new Promise((resolve) => { frame.onload = resolve; });
  const selector = frame.contentDocument.getElementById('languageSelect');
  selector.value = 'en';
  selector.dispatchEvent(new frame.contentWindow.Event('change'));
  await switched;
  check(frame.contentDocument.documentElement.lang === 'en', 'Switch to English');
  check(frame.contentWindow.location.search.includes('keep=1'), 'Switch preserves parameters');
  check(frame.contentWindow.location.hash === '#my-pc-specs', 'Switch preserves fragment');
  await load(frame, '/about');
  check(frame.contentDocument.documentElement.lang === 'en', 'Remember English');
  await load(frame, '/about?lang=it');
  await load(frame, '/socials');
  check(frame.contentDocument.documentElement.lang === 'it', 'Remember Italian');
  document.getElementById('results').textContent = 'PASS: ' + assertions + ' browser assertions across ' + pages.length + ' pages in both languages';
  frame.remove();
})().catch((error) => { document.getElementById('results').textContent = 'FAIL: ' + error.stack; });
</script></body></html>""".replace("DICTIONARIES", json.dumps(TRANSLATIONS)).replace(
    "PAGES", json.dumps(PAGES)
)


class Handler(http.server.SimpleHTTPRequestHandler):
    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            # Navigating the iframe cancels any unfinished image requests.
            pass

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        pathname = self.path.split("?", 1)[0]
        if pathname == "/__i18n_test":
            content = HARNESS
        else:
            filename = SITE / pathname.lstrip("/")
            if filename.is_dir():
                filename = filename / "index.html"
            if not filename.exists() and not filename.suffix:
                filename = filename.with_suffix(".html")
            if filename.suffix != ".html" or not filename.exists():
                return super().do_GET()
            content = filename.read_text()
            # Run entirely offline without changing the actual built site.
            content = re.sub(
                r'<script\b[^>]*src="(?:https?://|/js/(?:skinview|background)\.js)[^"]*"[^>]*>\s*</script>',
                "",
                content,
            )
            content = re.sub(r'<link\b[^>]*href="https?://[^"]*"[^>]*>', "", content)
            content = re.sub(r'<meta\b[^>]*http-equiv="refresh"[^>]*>', "", content)
        payload = content.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


chromium = shutil.which("chromium") or shutil.which("chromium-browser")
if not chromium:
    raise SystemExit("Chromium is required for this optional browser test")
server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(SITE))
)
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with tempfile.TemporaryDirectory(prefix="oratot-browser-") as profile:
        result = subprocess.run(
            [
                chromium,
                "--headless",
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-background-networking",
                "--no-first-run",
                "--no-default-browser-check",
                "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
                f"--user-data-dir={profile}",
                "--virtual-time-budget=20000",
                "--dump-dom",
                f"http://127.0.0.1:{server.server_port}/__i18n_test",
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        report = re.search(r'<pre id="results">(.*?)</pre>', result.stdout, re.DOTALL)
        if not report or not report.group(1).startswith("PASS:"):
            raise SystemExit(report.group(1) if report else result.stderr)
        print(report.group(1))
finally:
    server.shutdown()
    server.server_close()
