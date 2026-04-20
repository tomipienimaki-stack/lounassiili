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
  // Etsi viimeinen sulkulauseke: (G, L) tai (G, M, Ve) tai (L saatavilla G, M, Ve)
  const matches = text.match(/\(([^)]+)\)/g) || [];
  if (!matches.length) return [];
  const last = matches[matches.length - 1].replace(/[()]/g, '');
  const codes = last.match(/[A-Za-z]+/g) || [];
  return codes
    .map(c => DIET_MAP[c.toLowerCase()])
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i); // uniikki
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
    const underline = $(el).find('u');

    if (underline.length) {
      // Päiväotsikko: <p><u>Maanantai 20.4.</u></p>
      const dayText = underline.text().toLowerCase();
      const matchedDay = DAYS_FI.find(d => dayText.startsWith(d));
      if (matchedDay) {
        inToday = (matchedDay === todayName);
        return;
      }
    }

    if (!inToday) return;

    const fullText = $(el).text().trim();
    if (!fullText) return;

    // Jätetään dessert pois
    if (/^dessert it/i.test(fullText)) return;

    // Annos alkaa "–" tai "-" merkillä (em dash tai tavallinen viiva)
    const dashIdx = fullText.search(/[–-]/);
    if (dashIdx === -1) return;

    const itemPart = fullText.substring(dashIdx + 1).trim();
    if (itemPart.length < 5) return;

    // Poista ruokavaliokoodi-sulkulauseke nimestä
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
