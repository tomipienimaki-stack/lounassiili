const axios = require('axios');
const cheerio = require('cheerio');

// Ravintola Gresa — Nordrest, palvelinpuolella renderöity HTML
// Rakenne: <p><strong><u>Maanantai</u></strong></p> + <p><strong>annos</strong></p>
const URL = 'https://nordrest.fi/restaurang/gresa/';

const DIET_MAP = {
  'g':  'gluteeniton',
  'l':  'laktoositon',
  'm':  'maidoton',
  've': 'vegaaninen',
  'veg':'vegaaninen',
  'vl': 'vähälaktoosinen'
};

const DAYS_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

function getTodayDayName() {
  return DAYS_FI[new Date().getDay()];
}

function parseDiets(text) {
  const match = text.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1]
    .split(/[,\s/]+/)
    .map(c => DIET_MAP[c.trim().toLowerCase()])
    .filter(Boolean);
}

async function scrapeGresa() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'fi-FI,fi;q=0.9'
    }
  });

  const $ = cheerio.load(response.data);
  const todayName = getTodayDayName();
  const items = [];
  let inToday = false;
  let foundOnce = false; // Sivu voi toistaa menun kahdesti (mobiilinäkymä)
  const seen = new Set();

  // Käy <p>-elementit läpi — päivät ovat <p><strong><u>Maanantai</u></strong></p>
  $('p').each((_, el) => {
    const underline = $(el).find('u');

    if (underline.length) {
      const dayText = underline.text().trim().toLowerCase();
      // includes() eikä startsWith() koska joillain päivillä on erikoisotsikko
      // esim. "Burger-barrikaadi-torstai!" sisältää "torstai" mutta ei aloita sillä
      const matchedDay = DAYS_FI.find(d => dayText.includes(d));
      if (matchedDay) {
        if (matchedDay === todayName) {
          if (foundOnce) return false; // Lopeta jos nähtiin jo toisen kerran
          inToday = true;
          foundOnce = true;
        } else {
          if (inToday) return false; // Seuraava päivä alkoi — lopeta
          inToday = false;
        }
        return;
      }
    }

    if (!inToday) return;

    // Annos: <p><strong>Nimi (koodit)</strong></p>
    const strong = $(el).find('strong');
    if (!strong.length) return;

    const text = strong.text().trim();
    if (!text || text.length < 4) return;

    // Ohita viikkopäivämäärät kuten "20.4.-24.4.2026"
    if (/^\d{1,2}\.\d{1,2}\./.test(text)) return;

    const name = text.replace(/\([^)]+\)/g, '').trim();
    const diets = parseDiets(text);

    // Deduplication (sivulla saattaa olla duplikaatteja)
    if (!seen.has(name) && name.length >= 4) {
      seen.add(name);
      items.push({ name, diets });
    }
  });

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapeGresa;
