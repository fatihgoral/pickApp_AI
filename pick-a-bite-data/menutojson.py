"""
Restoran menü sayfalarindan menüyü çekip JSON formatina dönüstürür.

Desteklenen yapilar:
  - Waiterio  (*.waiterio.com)
  - item-name / item-price / menu-section (ornek: kebapcitamer.com)
  - menu-post-desc (ornek: hobipaket.com)
  - Metin tabanli yedek parser

Gereksinim: pip install playwright && playwright install chromium
"""

import json
import re
import sys
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

# --- Ayarlar ---
MENU_URL = "https://www.kebapcitamer.com/menu/"
CIKTI_DOSYASI = "menu.json"  # None yaparsan sadece terminale yazar
HEADLESS = True
BEKLEME_MS = 5000

# Menü icerigi için beklenecek seçiciler (herhangi biri yeterli)
MENU_BEKLE_SECICILERI = [
    ".tamer-menu-wrapper",
    ".menu-section",
    ".item-name",
    '[data-testid="icon-collapse"]',
    ".menu-post-desc",
]


def menuyu_jsona_cevir(url: str) -> dict:
    """Verilen menü URL'sinden yapilandirilmis menü JSON'u üretir."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS)
        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        page.wait_for_timeout(BEKLEME_MS)

        # Lazy-load içerik için kaydir
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1500)

        _menu_icerigini_bekle(page)

        platform, veri = _parse_et(page, url)
        restoran_adi = page.title() or urlparse(url).netloc

        if not veri.get("kategoriler"):
            veri = _metin_tabanli_parcala(page.inner_text("body"))
            platform = "metin-yedek"

        browser.close()

    kategoriler = veri.get("kategoriler", [])
    return {
        "kaynak_url": url,
        "restoran_adi": restoran_adi,
        "platform": platform,
        "kategoriler": kategoriler,
        "toplam_urun": sum(len(k.get("urunler", [])) for k in kategoriler),
    }


def _menu_icerigini_bekle(page) -> None:
    """Menü elementlerinden biri görünene kadar dene; bulunamazsa devam et."""
    for secici in MENU_BEKLE_SECICILERI:
        try:
            page.wait_for_selector(secici, timeout=8_000)
            return
        except Exception:
            continue


def _parse_et(page, url: str) -> tuple[str, dict]:
    """URL ve DOM'a göre uygun parser'i seç."""
    host = urlparse(url).netloc.lower()

    if "waiterio.com" in host:
        veri = page.evaluate(_WAITERIO_PARSE_JS)
        if veri.get("kategoriler"):
            return "waiterio", veri

    if page.locator(".item-name").count() > 0:
        veri = page.evaluate(_ITEM_NAME_PRICE_JS)
        if veri.get("kategoriler"):
            return "item-name-price", veri

    if page.locator(".menu-post-desc").count() > 0:
        veri = _parse_menu_post_desc(page)
        if veri.get("kategoriler"):
            return "menu-post-desc", veri

    # Waiterio benzeri yapı baska domainde olabilir
    veri = page.evaluate(_WAITERIO_PARSE_JS)
    if veri.get("kategoriler"):
        return "waiterio-benzeri", veri

    return "bilinmiyor", {"kategoriler": []}


def _parse_menu_post_desc(page) -> dict:
    """hobipaket.com tarzi .menu-post-desc yapisi."""
    kategoriler = [{"kategori": "Menü", "urunler": []}]
    items = page.query_selector_all(".menu-post-desc")
    for item in items:
        name_el = item.query_selector(".menu-title")
        price_el = item.query_selector(".menu-price")
        desc_el = item.query_selector(".menu-text")
        if not name_el or not price_el:
            continue
        ad = name_el.inner_text().strip()
        fiyat_metin = price_el.inner_text().strip()
        fiyat = _fiyat_cikar(fiyat_metin)
        urun = {"ad": ad, "fiyat": fiyat, "para_birimi": _para_birimi(fiyat_metin), "fiyat_metin": fiyat_metin}
        if desc_el:
            urun["aciklama"] = desc_el.inner_text().strip()
        kategoriler[0]["urunler"].append(urun)
    return {"kategoriler": kategoriler} if kategoriler[0]["urunler"] else {"kategoriler": []}


def _fiyat_cikar(metin: str) -> float | None:
    m = re.search(r"[\d]+(?:[.,]\d+)?", metin.replace(" ", ""))
    if not m:
        return None
    return float(m.group().replace(",", "."))


def _para_birimi(metin: str) -> str:
    if "€" in metin or "EUR" in metin.upper():
        return "EUR"
    if "$" in metin or "USD" in metin.upper():
        return "USD"
    return "TRY"


_WAITERIO_PARSE_JS = """
() => {
  const h3 = [...document.querySelectorAll('h3')]
    .find(h => h.textContent.trim().toLowerCase() === 'menu');
  if (!h3) return { kategoriler: [] };

  const section = h3.closest('section') || h3.parentElement?.parentElement?.parentElement;
  if (!section) return { kategoriler: [] };

  const kategoriler = [];

  section.querySelectorAll('[data-testid="icon-collapse"]').forEach(icon => {
    const catBlock = icon.parentElement?.parentElement;
    if (!catBlock) return;

    const header = icon.parentElement;
    const kategoriEl = header?.querySelector(':scope > div');
    const kategori = (kategoriEl?.textContent || '').trim();
    if (!kategori) return;

    const urunler = [];
    const seen = new Set();

    catBlock.querySelectorAll('motion, div').forEach(row => {
      const kids = [...row.children];
      if (kids.length !== 2) return;
      if (kids[0].children.length > 0 || kids[1].children.length > 0) return;

      const ad = kids[0].textContent.trim();
      const fiyatStr = kids[1].textContent.trim();
      if (!ad || !/^\\d+([.,]\\d+)?$/.test(fiyatStr)) return;

      const key = ad + '|' + fiyatStr;
      if (seen.has(key)) return;
      seen.add(key);

      urunler.push({
        ad,
        fiyat: parseFloat(fiyatStr.replace(',', '.')),
        para_birimi: 'TRY'
      });
    });

    if (urunler.length > 0) {
      kategoriler.push({ kategori, urunler });
    }
  });

  return { kategoriler };
}
"""

_ITEM_NAME_PRICE_JS = """
() => {
  const fiyatCikar = (metin) => {
    const m = metin.replace(/\\s/g, '').match(/[\\d]+(?:[.,]\\d+)?/);
    return m ? parseFloat(m[0].replace(',', '.')) : null;
  };
  const paraBirimi = (metin) => {
    if (metin.includes('€') || /EUR/i.test(metin)) return 'EUR';
    if (metin.includes('$') || /USD/i.test(metin)) return 'USD';
    return 'TRY';
  };

  const kategoriler = [];

  document.querySelectorAll('.menu-section').forEach(section => {
    const kategori = section.querySelector('.section-title')?.textContent?.trim() || 'Genel';
    const aciklama = section.querySelector('.section-desc')?.textContent?.trim() || '';
    const urunler = [];

    section.querySelectorAll('.menu-row').forEach(row => {
      const ad = row.querySelector('.item-name')?.textContent?.trim();
      const fiyatMetin = row.querySelector('.item-price')?.textContent?.trim();
      if (!ad || !fiyatMetin) return;

      const fiyat = fiyatCikar(fiyatMetin);
      const urun = { ad, fiyat, para_birimi: paraBirimi(fiyatMetin), fiyat_metin: fiyatMetin };

      const subDesc = row.nextElementSibling;
      if (subDesc?.classList?.contains('sub-desc')) {
        urun.aciklama = subDesc.textContent.trim();
      }
      urunler.push(urun);
    });

    if (urunler.length > 0) {
      const kat = { kategori, urunler };
      if (aciklama) kat.aciklama = aciklama;
      kategoriler.push(kat);
    }
  });

  // menu-section yoksa düz item-name / item-price çiftleri
  if (kategoriler.length === 0) {
    const names = [...document.querySelectorAll('.item-name')];
    const prices = [...document.querySelectorAll('.item-price')];
    const urunler = [];
    for (let i = 0; i < Math.min(names.length, prices.length); i++) {
      const ad = names[i].textContent.trim();
      const fiyatMetin = prices[i].textContent.trim();
      urunler.push({
        ad,
        fiyat: fiyatCikar(fiyatMetin),
        para_birimi: paraBirimi(fiyatMetin),
        fiyat_metin: fiyatMetin
      });
    }
    if (urunler.length > 0) {
      kategoriler.push({ kategori: 'Menü', urunler });
    }
  }

  return { kategoriler };
}
"""


def _metin_tabanli_parcala(metin: str) -> dict:
    """DOM parse edilemezse gövde metninden menü çıkarir (Waiterio metin yapisi)."""
    satirlar = [s.strip() for s in metin.splitlines() if s.strip()]

    bas = 0
    for i, s in enumerate(satirlar):
        if s.lower() in ("menu", "menü", "menü ve fiyat listesi"):
            bas = i + 1
            break

    bit = len(satirlar)
    for stop in ("Address", "Adres", "İletişim", "Iletisim", "Contact", "Copyright"):
        try:
            bit = min(bit, satirlar.index(stop))
        except ValueError:
            pass

    satirlar = satirlar[bas:bit]
    kategoriler = []
    mevcut_kategori = None
    mevcut_urunler = []
    i = 0

    while i < len(satirlar):
        satir = satirlar[i]
        if i + 1 < len(satirlar) and re.fullmatch(r"\d+([.,]\d+)?", satirlar[i + 1]):
            mevcut_urunler.append({
                "ad": satir,
                "fiyat": float(satirlar[i + 1].replace(",", ".")),
                "para_birimi": "TRY",
            })
            i += 2
            continue

        if mevcut_kategori and mevcut_urunler:
            kategoriler.append({"kategori": mevcut_kategori, "urunler": mevcut_urunler})
        mevcut_kategori = satir
        mevcut_urunler = []
        i += 1

    if mevcut_kategori and mevcut_urunler:
        kategoriler.append({"kategori": mevcut_kategori, "urunler": mevcut_urunler})

    return {"kategoriler": kategoriler}


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else MENU_URL
    print(f"Menü çekiliyor: {url}")

    menu_json = menuyu_jsona_cevir(url)
    cikti = json.dumps(menu_json, ensure_ascii=False, indent=2)

    print(cikti)

    if CIKTI_DOSYASI:
        with open(CIKTI_DOSYASI, "w", encoding="utf-8") as f:
            f.write(cikti)
        print(
            f"\n{menu_json['toplam_urun']} ürün, {len(menu_json['kategoriler'])} kategori "
            f"({menu_json['platform']}) -> '{CIKTI_DOSYASI}'"
        )


if __name__ == "__main__":
    main()
