const axios = require('axios');
const cheerio = require('cheerio');

// HALO Food & Events — WordPress REST API, menu HTML content.rendered-kentässä
const API_URL = 'https://halorestaurant.fi/wp-json/wp/v2/pages?slug=lounas&_fields=content,modified';

const DIET_MAP = {
  'g': 'gluteeniton',
  'l': 'laktoositon',
  'm': 'maidoton',
  've': 'vegaaninen',
  'vl': 'vähälaktoosinen'
};

const DAYS_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

function getTodayDayName() {
  return DAYS_FI[new Date().getDay()];
}

function parseDiets(text) {
  const matches = text.match(/\(([^)]+)\)/g) || [];
  if (!matches.length) return [];
  const last = matches[matches.length - 1].replace(/[()]/g, '');
  const codes = last.match(/[A-Za-z]+/g) || [];
  return codes
    .map(c => DIET_MAP[c.toLowerCase()])
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

async function scrapeHalo() {
  const response = await axios.get(API_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  const page = response.data[0];
  if (!page) throw new Error('HALO: lounassivu ei löytynyt');

  const $ = cheerio.load(page.content.rendered);
  const todayName = getTodayDayName();
  const items = [];
  let inToday = false;

  $('p').each((_, el) => {
    const $el = $(el);
    const underline = $el.find('u');
    const strong = $el.find('strong');

    // ── Päiväotsikko ────────────────────────────────────────────────────
    // Muoto A: <p><u>Maanantai 28.4.</u></p>
    // Muoto B: <p>Torstai 30.4.</p>  (ei <u>-tagia)
    let dayText = '';
    if (underline.length) {
      dayText = underline.text().toLowerCase();
    } else if (!strong.length) {
      // Plain <p> ilman <strong> tai <u> — voi olla päiväotsikko
      dayText = $el.text().trim().toLowerCase();
    }

    if (dayText) {
      const matchedDay = DAYS_FI.find(d => dayText.startsWith(d));
      if (matchedDay) {
        inToday = (matchedDay === todayName);
        return;
      }
    }

    if (!inToday) return;

    // ── Annos ────────────────────────────────────────────────────────────
    // Muoto: <p>PICK IT 14 € <strong>– Annos (G, L)</strong></p>
    if (!strong.length) return;

    const fullText = $el.text().trim();
    if (/^dessert it/i.test(fullText)) return;

    // Viiva (– tai -) on nyt <strong>-tagin sisällä
    const strongText = strong.text().trim();
    const dashIdx = strongText.search(/[–—-]/);
    if (dashIdx === -1) return;

    const itemPart = strongText.substring(dashIdx + 1).trim();
    if (itemPart.length < 5) return;

    const name = itemPart.replace(/\([^)]+\)/g, '').trim();
    const diets = parseDiets(itemPart);

    if (name.length >= 5) {
      items.push({ name, diets });
    }
  });

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: 'https://halorestaurant.fi/lounas/'
  };
}

module.exports = scrapeHalo;
