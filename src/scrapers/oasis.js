const axios = require('axios');
const cheerio = require('cheerio');

// Ravintola Oasis Ruoholahti — Nordrest, palvelinpuolella renderöity HTML
// Rakenne: .lunch-day > h3.lunch-day-title + ul.lunch-list > li.lunch-item
const URL = 'https://nordrest.fi/restaurang/ravintola-oasis/';

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

async function scrapeOasis() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'fi-FI,fi;q=0.9'
    }
  });

  const $ = cheerio.load(response.data);
  const todayName = getTodayDayName();
  const items = [];
  const seen = new Set();
  let foundOnce = false;

  // Etsi tämän päivän lohko: <h3 class="lunch-day-title">Maanantai</h3>
  // Sivu voi sisältää saman päivän kahdesti (mobiili/desktop) — käsitellään vain ensimmäinen
  $('div.lunch-day').each((_, day) => {
    const title = $(day).find('h3.lunch-day-title').text().trim().toLowerCase();
    if (title !== todayName) return;
    if (foundOnce) return false; // duplikaattilohko — lopeta
    foundOnce = true;

    $(day).find('ul.lunch-list li.lunch-item').each((_, item) => {
      const text = $(item).text().trim();
      if (!text || text.length < 4) return;

      const name = text.replace(/\([^)]+\)/g, '').trim();
      const diets = parseDiets(text);

      if (name.length >= 4 && !seen.has(name)) {
        seen.add(name);
        items.push({ name, diets });
      }
    });
  });

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapeOasis;
