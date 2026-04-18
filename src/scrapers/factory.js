const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://ravintolafactory.com/lounasravintolat/ravintolat/factory-ruoholahti/';

// Ruokavaliolyhenteet
const DIET_MAP = {
  'l': 'laktoositon',
  'vl': 'vähälaktoosinen',
  'g': 'gluteeniton',
  've': 'vegaaninen',
  'm': 'maidoton',
  'vs': 'valkosipuli'
};

// Päivän nimi suomeksi -> viikonpäivä (0 = sunnuntai)
const DAYS_FI = {
  'maanantai': 1,
  'tiistai': 2,
  'keskiviikko': 3,
  'torstai': 4,
  'perjantai': 5,
  'lauantai': 6,
  'sunnuntai': 0
};

function parseMenuItems(text) {
  // Parsi ruokavaliotiedot sulkeista
  const dietMatch = text.match(/\(([^)]+)\)/);
  let diets = [];
  let name = text;

  if (dietMatch) {
    name = text.replace(dietMatch[0], '').trim();
    const dietStr = dietMatch[1].toLowerCase();
    // Erottele yksittäiset lyhenteet (esim. "L+G" -> ["l", "g"])
    const dietCodes = dietStr.split('+').map(d => d.trim());
    diets = dietCodes.map(code => DIET_MAP[code] || code).filter(Boolean);
  }

  return { name, diets };
}

function getTodayDayName() {
  const days = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];
  return days[new Date().getDay()];
}

async function scrapeFactory() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const $ = cheerio.load(response.data);
  const todayName = getTodayDayName();
  const items = [];

  // Etsi sivulta tekstisisältö
  const content = $('article, .entry-content, main').text();

  // Etsi päivän osio
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let inTodaySection = false;
  let foundToday = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Tarkista onko tämä päivän otsikko
    const dayMatch = Object.keys(DAYS_FI).find(day => line.includes(day));

    if (dayMatch) {
      if (dayMatch === todayName) {
        inTodaySection = true;
        foundToday = true;
        continue;
      } else if (inTodaySection) {
        // Seuraava päivä alkoi, lopeta
        break;
      }
    }

    if (inTodaySection) {
      const originalLine = lines[i];
      // Ohita tyhjät rivit ja otsikot
      if (originalLine.length < 5) continue;
      if (originalLine.match(/^(lounas|buffet|hinta|€|\d+[,.])/i)) continue;

      // Parsi annos
      const { name, diets } = parseMenuItems(originalLine);

      // Vain järkevät annokset (vähintään 10 merkkiä)
      if (name.length >= 10 && !name.match(/^[A-Z]{2,}$/)) {
        items.push({ name, diets });
      }
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    items: items,
    source: URL
  };
}

module.exports = scrapeFactory;
