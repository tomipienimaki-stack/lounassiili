const axios = require('axios');
const cheerio = require('cheerio');

// The Pantry Ruoholahti — lounaat.info aggregaattori (ravintola-ID 4253)
const URL = 'https://www.lounaat.info/lounas/the-pantry/helsinki';

const DIET_MAP = {
  'l':   'laktoositon',
  'g':   'gluteeniton',
  'm':   'maidoton',
  'vl':  'vähälaktoosinen',
  'veg': 'vegaaninen',
  've':  'vegaaninen'
};

// lounaat.info käyttää taivutettua muotoa: "maanantaina", "tiistaina" jne.
const DAYS_FI_INFLECTED = [
  'sunnuntaina',  // 0
  'maanantaina',  // 1
  'tiistaina',    // 2
  'keskiviikkona',// 3
  'torstaina',    // 4
  'perjantaina',  // 5
  'lauantaina'    // 6
];

function getTodayDayInflected() {
  return DAYS_FI_INFLECTED[new Date().getDay()];
}

function parseBracketDiets(text) {
  // Ruokavaliot hakasulkeissa: [l, g] tai [Veg]
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1]
    .split(/[,\s]+/)
    .map(c => DIET_MAP[c.trim().toLowerCase()])
    .filter(Boolean);
}

async function scrapePantry() {
  const response = await axios.get(URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  const $ = cheerio.load(response.data);
  const todayInflected = getTodayDayInflected();
  const items = [];
  let inToday = false;

  // Käy läpi kaikki elementit järjestyksessä
  $('h3, h4, li, p').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (!text) return;

    const textLower = text.toLowerCase();

    // Päiväotsikko tunnistus (esim. "Maanantaina 20.4.")
    if (tag === 'h3' || tag === 'h4') {
      const isDay = DAYS_FI_INFLECTED.some(d => textLower.startsWith(d));
      if (isDay) {
        inToday = textLower.startsWith(todayInflected);
        return;
      }
    }

    if (!inToday) return;
    if (text.length < 5) return;

    // Poista hakasulkeet nimestä, kerää ruokavaliot
    const name = text.replace(/\[[^\]]+\]/g, '').trim();
    const diets = parseBracketDiets(text);

    if (name.length >= 5) {
      items.push({ name, diets });
    }
  });

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapePantry;
