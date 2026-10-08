"""
For You — Love Letters
Flask application (Vercel-ready: Vercel's Python runtime serves the `app` object).
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from flask import Flask, Response, abort, make_response, redirect, render_template, request, url_for

from config.settings import settings

BASE_DIR = Path(__file__).resolve().parent

app = Flask(
    __name__,
    static_folder=str(BASE_DIR / "static"),
    template_folder=str(BASE_DIR / "templates"),
)


# ---------------------------------------------------------------------------
# Content
# ---------------------------------------------------------------------------
@lru_cache(maxsize=None)
def load_content(lang: str) -> dict:
    """Load all copy for one language from content/<lang>.json (cached per process)."""
    path = BASE_DIR / "content" / f"{lang}.json"
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def asset(filename: str) -> str:
    """Static URL with a cache-busting version parameter."""
    return url_for("static", filename=filename, v=settings.ASSET_VERSION)


app.jinja_env.globals["asset"] = asset


def base_url() -> str:
    return settings.SITE_URL or request.url_root.rstrip("/")


def preferred_language() -> str:
    cookie = request.cookies.get("lang")
    if cookie in settings.LANGUAGES:
        return cookie
    return request.accept_languages.best_match(settings.LANGUAGES) or settings.DEFAULT_LANG


def client_payload(content: dict, lang: str) -> dict:
    """The small JSON blob the browser needs for the interactive letters."""
    letters = []
    for letter in content["letters"]:
        item = dict(letter)
        item["img"] = asset(f"images/illustrations/{letter['image']}.webp")
        letters.append(item)
    return {
        "lang": lang,
        "checkoutUrl": settings.checkout_url(lang),
        "letters": letters,
        "moods": content["moods"],
        "ui": content["ui"],
    }


def render_page(lang: str, canonical_path: str) -> Response:
    content = load_content(lang)
    other = "pt" if lang == "en" else "en"
    html = render_template(
        "index.html",
        c=content,
        lang=lang,
        other_lang=other,
        other_c=load_content(other),
        checkout_url=settings.checkout_url(lang),
        site_url=base_url(),
        canonical=base_url() + canonical_path,
        payload=client_payload(content, lang),
        settings=settings,
    )
    return make_response(html)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def home():
    """Root: serve the visitor's preferred language (cookie > browser language)."""
    lang = preferred_language()
    resp = render_page(lang, f"/{lang}")
    resp.headers["Vary"] = "Cookie, Accept-Language"
    resp.headers["Cache-Control"] = "private, max-age=0, must-revalidate"
    return resp


@app.route("/<lang>")
@app.route("/<lang>/")
def localized(lang: str):
    if lang not in settings.LANGUAGES:
        abort(404)
    resp = render_page(lang, f"/{lang}")
    resp.headers["Cache-Control"] = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400"
    return resp


@app.route("/checkout/<lang>")
def checkout(lang: str):
    """Shareable checkout shortcut, e.g. /checkout/pt — uses the same central config."""
    if lang not in settings.LANGUAGES:
        lang = settings.DEFAULT_LANG
    return redirect(settings.checkout_url(lang), code=302)


@app.route("/robots.txt")
def robots():
    body = f"User-agent: *\nAllow: /\n\nSitemap: {base_url()}/sitemap.xml\n"
    return Response(body, mimetype="text/plain")


@app.route("/sitemap.xml")
def sitemap():
    root = base_url()
    urls = "".join(
        f"<url><loc>{root}/{lang}</loc>"
        + "".join(
            f'<xhtml:link rel="alternate" hreflang="{alt}" href="{root}/{alt}"/>'
            for alt in settings.LANGUAGES
        )
        + "</url>"
        for lang in settings.LANGUAGES
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">' + urls + "</urlset>"
    )
    return Response(xml, mimetype="application/xml")


@app.route("/favicon.ico")
def favicon():
    return redirect(asset("favicon.svg"), code=301)


@app.route("/health")
def health():
    return {"status": "ok"}


@app.errorhandler(404)
def not_found(_error):
    lang = preferred_language()
    return render_template("404.html", c=load_content(lang), lang=lang), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
