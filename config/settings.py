"""
Central configuration for the "For You — Love Letters" website.

Everything that might change after launch lives here (or in environment
variables), so you never have to hunt through templates or JavaScript.

  * Checkout links ........ CHECKOUT_URLS  (or env CHECKOUT_URL_EN / CHECKOUT_URL_PT)
  * Public site URL ....... SITE_URL       (or env SITE_URL) — used for canonical/OG tags
  * Cache-busting ......... ASSET_VERSION  (or env ASSET_VERSION) — bump after replacing images/CSS/JS
"""

import os


def _env(name: str, default: str) -> str:
    value = os.environ.get(name, "").strip()
    return value or default


class Settings:
    SITE_NAME = "For You — Love Letters"

    # Leave empty to auto-detect from the incoming request (works on any Vercel
    # preview URL). Set SITE_URL in Vercel once you have your final domain.
    SITE_URL = _env("SITE_URL", "").rstrip("/")

    LANGUAGES = ("en", "pt")
    DEFAULT_LANG = "en"

    # ------------------------------------------------------------------
    # CHECKOUT — the ONLY place these links are defined.
    # Every purchase button on the site reads from here.
    # ------------------------------------------------------------------
    CHECKOUT_URLS = {
        "en": _env("CHECKOUT_URL_EN", "https://checkout.escalepay.com/2859029"),
        "pt": _env("CHECKOUT_URL_PT", "https://checkout.escalepay.com/5931168"),
    }

    ASSET_VERSION = _env("ASSET_VERSION", "1.0.0")

    def checkout_url(self, lang: str) -> str:
        return self.CHECKOUT_URLS.get(lang) or self.CHECKOUT_URLS[self.DEFAULT_LANG]


settings = Settings()
