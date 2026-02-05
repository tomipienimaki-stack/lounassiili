"""
Ruoholahden Lounas - Scraping-moduuli
Hakee tarkat paivan lounaslistat 7 ravintolasta suoraan ravintoloiden omilta sivuilta.

Ravintolat:
1. Oasis (Nordrest) - nordrest.fi
2. Gresa (Nordrest) - nordrest.fi
3. HALO Food & Events - halorestaurant.fi
4. Konttiravintola Morton - morton.fi
5. The Pantry Ruoholahti - thepantry.fi
6. Pompier Albertinkatu - pompier.fi
7. Salve - lounaat.info (fallback)
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, date
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fi-FI,fi;q=0.9,en;q=0.8",
}

WEEKDAYS_FI = ["Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai", "Sunnuntai"]
WEEKDAYS_FI_LOWER = [d.lower() for d in WEEKDAYS_FI]


def get_today_weekday_fi():
    return WEEKDAYS_FI[date.today().weekday()]


def get_today_weekday_index():
    return date.today().weekday()


def _safe_request(url, timeout=15):
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp
    except Exception as e:
        logger.warning(f"HTTP-pyynto epaonnistui ({url}): {e}")
        return None


# ============================================================
# 1. OASIS (Nordrest)
# Rakenne: h3.lunch-day-title + ul.lunch-list > li.lunch-item
# ============================================================

def fetch_oasis():
    url = "https://nordrest.fi/restaurang/ravintola-oasis/"
    today_weekday = get_today_weekday_fi().lower()

    resp = _safe_request(url)
    if not resp:
        return _make_result("Ravintola Oasis", "Mechelininkatu 1a, 00180 Helsinki",
                            "nordrest.fi", [], url, "Ma-Pe lounas", "Lounas 14 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []

        # Etsi h3.lunch-day-title joka sisaltaa tanaan viikonpaivan
        for h3 in soup.find_all("h3", class_="lunch-day-title"):
            if today_weekday in h3.get_text(strip=True).lower():
                # Seuraava sibling on ul.lunch-list
                ul = h3.find_next_sibling("ul", class_="lunch-list")
                if ul:
                    for li in ul.find_all("li", class_="lunch-item"):
                        text = li.get_text(strip=True)
                        if text and len(text) > 3:
                            menu_items.append({"food": text, "price": ""})
                break

        # Fallback: jos lunch-day-title ei loydy, kokeile tavallisia h3-tageja
        if not menu_items:
            for h3 in soup.find_all("h3"):
                h3_text = h3.get_text(strip=True).lower()
                if today_weekday == h3_text:
                    # Seuraava sibling on div jossa menu
                    sib = h3.find_next_sibling()
                    while sib:
                        sib_text = sib.get_text(strip=True).lower()
                        if any(d == sib_text for d in WEEKDAYS_FI_LOWER[:5] if d != today_weekday):
                            break
                        if sib.name == "div" and len(sib.get_text(strip=True)) > 10:
                            text = sib.get_text(strip=True)
                            # Parsitaan rivit
                            parts = re.split(r'(?=Päivän keitto:|Tarjoillaan )', text)
                            for part in parts:
                                part = part.strip()
                                if part and len(part) > 5 and not part.startswith("Lounaslistaviikko"):
                                    menu_items.append({"food": part, "price": ""})
                        sib = sib.find_next_sibling()
                    break

        return _make_result("Ravintola Oasis", "Mechelininkatu 1a, 00180 Helsinki",
                            "nordrest.fi", menu_items, url, "Ma-Pe lounas", "Lounas 14 \u20ac")
    except Exception as e:
        logger.warning(f"Oasis parsinta epaonnistui: {e}")
        return _make_result("Ravintola Oasis", "Mechelininkatu 1a, 00180 Helsinki",
                            "nordrest.fi", [], url, "Ma-Pe lounas", "Lounas 14 \u20ac")


# ============================================================
# 2. GRESA (Nordrest)
# Rakenne: p "VIIKKO 6 & 7" -> p "Torstai" -> p (ruokalaji) x N -> p (seuraava paiva)
# Gresa kayttaa p-tageja, viikonpaiva on erillinen p, seuraavat p:t ovat ruokalajeja
# ============================================================

def fetch_gresa():
    url = "https://nordrest.fi/restaurang/gresa/"
    today_weekday = get_today_weekday_fi()

    resp = _safe_request(url)
    if not resp:
        return _make_result("Gresa", "Itämerenkatu 1, 00180 Helsinki",
                            "nordrest.fi", [], url, "Ma-Pe 10:45-13:45", "Lounas 13,70 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []

        # Etsi ensimmainen p-tagi joka on tasan viikonpaiva ("Torstai")
        all_ps = soup.find_all("p")
        capture = False
        for p in all_ps:
            text = p.get_text(strip=True)

            if text.lower() == today_weekday.lower() and not capture:
                capture = True
                continue

            if capture:
                # Lopeta kun seuraava viikonpaiva loytyy (tai englanninkielinen kaannos)
                if text.lower() in WEEKDAYS_FI_LOWER[:5] and text.lower() != today_weekday.lower():
                    break
                # Ohita tyhjat ja englanninkieliset kaannokset
                if not text or len(text) < 3:
                    continue
                # Ohita englanninkieliset rivit (alkavat isolla ja sisaltavat "and", "with")
                if any(kw in text.lower() for kw in [" and ", " with ", "served with", "potato mash", "fried "]):
                    continue
                # Ohita rivit jotka sisaltavat "Runebergin" jalkeen tulevat ylimaaraiset
                menu_items.append({"food": text, "price": ""})

                # Maks 6 ruokalajia per paiva
                if len(menu_items) >= 6:
                    break

        return _make_result("Gresa", "Itämerenkatu 1, 00180 Helsinki",
                            "nordrest.fi", menu_items, url, "Ma-Pe 10:45-13:45", "Lounas 13,70 \u20ac")
    except Exception as e:
        logger.warning(f"Gresa parsinta epaonnistui: {e}")
        return _make_result("Gresa", "Itämerenkatu 1, 00180 Helsinki",
                            "nordrest.fi", [], url, "Ma-Pe 10:45-13:45", "Lounas 13,70 \u20ac")


# ============================================================
# 3. HALO Food & Events
# Rakenne: p "Torstai 5.2." -> p "PICK IT 14 €- ruokalaji" x 4
# ============================================================

def fetch_halo():
    url = "https://halorestaurant.fi/lounas/"
    today_weekday = get_today_weekday_fi().lower()

    resp = _safe_request(url)
    if not resp:
        return _make_result("HALO Food & Events", "Ruoholahdenkatu 21, 00180 Helsinki",
                            "halorestaurant.fi", [], url, "Ma-Pe 11:00-13:30",
                            "14 \u20ac / Love it 14,70 \u20ac / Keitto 12,90 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []
        capture = False

        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if not text:
                continue

            # Paivan otsikko: "Torstai 5.2."
            if today_weekday in text.lower() and re.search(r'\d+\.\d+', text):
                capture = True
                continue

            if capture:
                # Seuraava paiva -> lopeta
                is_next_day = False
                for d in WEEKDAYS_FI_LOWER[:5]:
                    if d != today_weekday and d in text.lower() and re.search(r'\d+\.\d+', text):
                        is_next_day = True
                        break
                if is_next_day:
                    break

                if len(text) > 5:
                    text = re.sub(r'\s+', ' ', text)
                    menu_items.append({"food": text, "price": ""})

        return _make_result("HALO Food & Events", "Ruoholahdenkatu 21, 00180 Helsinki",
                            "halorestaurant.fi", menu_items, url, "Ma-Pe 11:00-13:30",
                            "14 \u20ac / Love it 14,70 \u20ac / Keitto 12,90 \u20ac")
    except Exception as e:
        logger.warning(f"HALO parsinta epaonnistui: {e}")
        return _make_result("HALO Food & Events", "Ruoholahdenkatu 21, 00180 Helsinki",
                            "halorestaurant.fi", [], url, "Ma-Pe 11:00-13:30",
                            "14 \u20ac / Love it 14,70 \u20ac / Keitto 12,90 \u20ac")


# ============================================================
# 4. MORTON
# Rakenne: li.fdm-section-header (h3 "Torstaisin") -> li (fdm-item-title, fdm-item-price, fdm-item-content)
# ============================================================

def fetch_morton():
    url = "https://morton.fi/lounas/"
    today_idx = get_today_weekday_index()
    morton_days = ["maanantaisin", "tiistaisin", "keskiviikkoisin", "torstaisin", "perjantaisin"]
    if today_idx >= 5:
        return _make_result("Konttiravintola Morton", "Ruoholahdenranta 8, 00180 Helsinki",
                            "morton.fi", [], url, "Ma-Pe 11:00-14:00", "Lounas 14,50 \u20ac")
    today_morton = morton_days[today_idx]

    resp = _safe_request(url)
    if not resp:
        return _make_result("Konttiravintola Morton", "Ruoholahdenranta 8, 00180 Helsinki",
                            "morton.fi", [], url, "Ma-Pe 11:00-14:00", "Lounas 14,50 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []

        # Etsi li.fdm-section-header jossa on tanaan paiva
        for li_header in soup.find_all("li", class_="fdm-section-header"):
            header_text = li_header.get_text(strip=True).lower()
            if today_morton in header_text:
                # Seuraavat sibling-li:t ovat ruokalajeja
                sib = li_header.find_next_sibling()
                while sib:
                    if sib.name == "li":
                        cls = sib.get("class", [])
                        if "fdm-section-header" in cls:
                            break  # seuraava paiva
                        # Ruokalaji
                        title_el = sib.find(class_="fdm-item-title")
                        price_el = sib.find(class_="fdm-item-price")
                        desc_el = sib.find(class_="fdm-item-content")

                        title = title_el.get_text(strip=True) if title_el else ""
                        price = price_el.get_text(strip=True) if price_el else ""
                        desc = desc_el.get_text(strip=True) if desc_el else ""

                        if title and "Lasten lounas" not in title and "Juomatarjoukset" not in title:
                            food_text = f"{title} - {desc}" if desc else title
                            # Siisti kuvaus
                            food_text = re.sub(r'(laktoositon|gluteeniton|vähälaktoosinen|saatavana vegaanisena|saatavana laktoosittomana|saatavana gluteenittomana \+\d+€)', '', food_text)
                            food_text = re.sub(r'\s+', ' ', food_text).strip()
                            menu_items.append({"food": food_text, "price": "14,50 \u20ac"})
                    sib = sib.find_next_sibling()
                break

        return _make_result("Konttiravintola Morton", "Ruoholahdenranta 8, 00180 Helsinki",
                            "morton.fi", menu_items, url, "Ma-Pe 11:00-14:00", "Lounas 14,50 \u20ac")
    except Exception as e:
        logger.warning(f"Morton parsinta epaonnistui: {e}")
        return _make_result("Konttiravintola Morton", "Ruoholahdenranta 8, 00180 Helsinki",
                            "morton.fi", [], url, "Ma-Pe 11:00-14:00", "Lounas 14,50 \u20ac")


# ============================================================
# 5. THE PANTRY RUOHOLAHTI
# Rakenne: h3 "TORSTAI 5.2.2026" -> h4 "PAIVAN KASVIS" -> p (ruoka + kuvaus)
# ============================================================

def fetch_pantry():
    url = "https://thepantry.fi/ruoholahti/"
    today_weekday = get_today_weekday_fi().upper()

    resp = _safe_request(url)
    if not resp:
        return _make_result("The Pantry Ruoholahti", "Itämerenkatu 3, 00180 Helsinki",
                            "thepantry.fi", [], url, "Ma-Pe 11:00-13:30", "Kasvis 14 \u20ac / Kala-Liha 15 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []
        found_today = False

        for tag in soup.find_all(["h3", "h4", "p"]):
            text = tag.get_text(strip=True)

            if tag.name == "h3" and today_weekday in text.upper():
                found_today = True
                continue

            if found_today and tag.name == "h3":
                weekdays_upper = [d.upper() for d in WEEKDAYS_FI[:5]]
                if any(d in text.upper() for d in weekdays_upper if d != today_weekday):
                    break

            if found_today and tag.name == "h4":
                category = text  # "PAIVAN KASVIS", "PAIVAN KALA", "PAIVAN LIHA"
                next_p = tag.find_next("p")
                if next_p:
                    food_text = next_p.get_text(strip=True)
                    if food_text and len(food_text) > 3:
                        price = "14 \u20ac" if "KASVIS" in category.upper() else "15 \u20ac"
                        menu_items.append({
                            "food": f"{category}: {food_text}",
                            "price": price,
                        })

        return _make_result("The Pantry Ruoholahti", "Itämerenkatu 3, 00180 Helsinki",
                            "thepantry.fi", menu_items, url, "Ma-Pe 11:00-13:30", "Kasvis 14 \u20ac / Kala-Liha 15 \u20ac")
    except Exception as e:
        logger.warning(f"Pantry parsinta epaonnistui: {e}")
        return _make_result("The Pantry Ruoholahti", "Itämerenkatu 3, 00180 Helsinki",
                            "thepantry.fi", [], url, "Ma-Pe 11:00-13:30", "Kasvis 14 \u20ac / Kala-Liha 15 \u20ac")


# ============================================================
# 6. POMPIER ALBERTINKATU
# Rakenne: div.fl-accordion-item -> a.fl-accordion-button-label (paiva)
#          -> div.fl-accordion-content > p (menu)
# ============================================================

def fetch_pompier():
    url = "https://pompier.fi/albertinkatu/albertinkatu-menu/"
    today_weekday = get_today_weekday_fi().lower()
    today_day = date.today().day

    resp = _safe_request(url)
    if not resp:
        return _make_result("Pompier Albertinkatu", "Albertinkatu 29, 00180 Helsinki",
                            "pompier.fi", [], url, "Ma-Pe 10:45-14:00", "Lounas 14,50 \u20ac / Kaikki 19 \u20ac")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []

        for item in soup.find_all("div", class_="fl-accordion-item"):
            label = item.find(class_="fl-accordion-button-label")
            content = item.find(class_="fl-accordion-content")
            if not label or not content:
                continue

            label_text = label.get_text(strip=True).lower()
            # Etsi tanaan paiva: "Torstai 5.2."
            if today_weekday in label_text:
                menu_text = content.get_text(strip=True)
                if menu_text:
                    # Parsitaan hintojen mukaan
                    parts = re.split(r'(\d+[,\.]\d{2}\s*€)', menu_text)
                    i = 0
                    while i < len(parts):
                        food = parts[i].strip()
                        price = ""
                        if i + 1 < len(parts) and re.match(r'\d+[,\.]\d{2}\s*€', parts[i + 1]):
                            price = parts[i + 1].strip()
                            i += 2
                        else:
                            i += 1
                        if food and len(food) > 3:
                            menu_items.append({"food": food, "price": price})
                break

        return _make_result("Pompier Albertinkatu", "Albertinkatu 29, 00180 Helsinki",
                            "pompier.fi", menu_items, url, "Ma-Pe 10:45-14:00",
                            "Lounas 14,50 \u20ac / Kaikki 19 \u20ac")
    except Exception as e:
        logger.warning(f"Pompier parsinta epaonnistui: {e}")
        return _make_result("Pompier Albertinkatu", "Albertinkatu 29, 00180 Helsinki",
                            "pompier.fi", [], url, "Ma-Pe 10:45-14:00", "Lounas 14,50 \u20ac / Kaikki 19 \u20ac")


# ============================================================
# 7. SALVE (lounaat.info)
# Rakenne: .menu-item -> p.price, p.dish, p.info
# Salve nayttaa koko viikon - parsitaan vain tanaan paiva
# ============================================================

def fetch_salve():
    """Hakee Salven paivan lounaslistanlounaat.info address-hausta."""
    # Kaytamme address-hakua joka nayttaa vain tanaan paivan menun
    url = "https://www.lounaat.info/ruoholahdenkatu-21-helsinki"

    resp = _safe_request(url)
    if not resp:
        return _make_result("Salve", "Hietalahdenranta 5, 00120 Helsinki",
                            "lounaat.info", [], "https://ravintolasalve.fi",
                            "Ma-Pe 11:00-14:00", "")

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        menu_items = []

        # Etsi Salve-ravintola lounaat.info:n tuloksista
        for item in soup.select(".menu"):
            name_el = item.select_one(".item-header h3 a")
            if not name_el:
                continue
            name = name_el.get_text(strip=True).lower()
            if "salve" not in name:
                continue

            # Loydetty Salve - parsitaan menu
            for li in item.select(".item-body .menu-item"):
                price_el = li.select_one("p.price")
                dish_el = li.select_one("p.dish")
                info_el = li.select_one("p.info")

                price = price_el.get_text(strip=True) if price_el else ""
                dish = dish_el.get_text(strip=True) if dish_el else ""
                info = ""
                if info_el:
                    info = info_el.get_text(strip=True)
                    info = re.sub(r'\s+', ' ', info).strip()

                food_text = f"{dish} {info}".strip() if dish else info.strip()
                if food_text and len(food_text) > 3:
                    menu_items.append({"food": food_text, "price": price})

            # Aukioloaika
            hours_el = item.select_one(".item-header p.lunch")
            hours = hours_el.get_text(strip=True) if hours_el else "Ma-Pe 11:00-14:00"

            return _make_result("Salve", "Hietalahdenranta 5, 00120 Helsinki",
                                "lounaat.info", menu_items, "https://ravintolasalve.fi",
                                hours, "")

        # Salve ei loytynyt hausta
        return _make_result("Salve", "Hietalahdenranta 5, 00120 Helsinki",
                            "lounaat.info", [], "https://ravintolasalve.fi",
                            "Ma-Pe 11:00-14:00", "")
    except Exception as e:
        logger.warning(f"Salve parsinta epaonnistui: {e}")
        return _make_result("Salve", "Hietalahdenranta 5, 00120 Helsinki",
                            "lounaat.info", [], "https://ravintolasalve.fi",
                            "Ma-Pe 11:00-14:00", "")


# ============================================================
# APUFUNKTIOT
# ============================================================

def _make_result(name, address, source, menu, url, hours, price_info):
    return {
        "name": name,
        "address": address,
        "source": source,
        "menu": menu,
        "url": url,
        "hours": hours,
        "price_info": price_info,
    }


def fetch_all_restaurants():
    """Hakee kaikkien 7 ravintolan paivan lounaslistat."""
    today = date.today()

    if today.weekday() >= 5:
        return {
            "restaurants": [],
            "date": today.strftime("%d.%m.%Y"),
            "weekday": get_today_weekday_fi(),
            "fetch_time": datetime.now().strftime("%H:%M"),
            "message": "Viikonloppuna ei lounaslistoja saatavilla. Tule takaisin maanantaina!",
        }

    fetchers = [
        fetch_oasis,
        fetch_gresa,
        fetch_halo,
        fetch_morton,
        fetch_pantry,
        fetch_pompier,
        fetch_salve,
    ]

    restaurants = []
    for fetcher in fetchers:
        try:
            result = fetcher()
            if result:
                restaurants.append(result)
        except Exception as e:
            logger.error(f"Ravintolan haku epaonnistui: {e}")

    return {
        "restaurants": restaurants,
        "date": today.strftime("%d.%m.%Y"),
        "weekday": get_today_weekday_fi(),
        "fetch_time": datetime.now().strftime("%H:%M"),
        "message": None,
    }


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    print("Haetaan Ruoholahden lounaslistat (7 ravintolaa)...\n")
    result = fetch_all_restaurants()
    print(f"Paiva: {result['weekday']} {result['date']}")
    print(f"Haettu klo {result['fetch_time']}")
    print(f"Loydetty {len(result['restaurants'])} ravintolaa\n")
    for r in result["restaurants"]:
        print(f"\n{'=' * 60}")
        print(f"  {r['name']}")
        print(f"  {r.get('address', '')}")
        print(f"  {r.get('hours', '')}  |  {r.get('price_info', '')}")
        print(f"  Lahde: {r['source']}")
        print(f"  {'-' * 50}")
        if r["menu"]:
            for item in r["menu"]:
                price_str = f"  [{item['price']}]" if item.get("price") else ""
                print(f"  * {item['food']}{price_str}")
        else:
            print("  (Lounaslistaa ei saatavilla)")
        print()
