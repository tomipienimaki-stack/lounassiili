const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://ravintolakasi.fi/lounas';

// Ruokavaliolyhenteet
const DIET_MAP = {
  'l': 'laktoositon',
  'g': 'gluteeniton',
  'v': 'vegaaninen',
  've': 'vegaaninen',
  'mu': 'maidoton',
  'm': 'maidoton',
  'vl': 'vähälaktoosinen'
};

// Päivän nimi suomeksi -> viikonpäivä
const DAYS_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

function parseMenuItem(text) {
  // Parsi ruokavaliotiedot sulkeista
  const dietMatch = text.match(/\(([^)]+)\)/g);
  let diets = [];
  let name = text;

  if (dietMatch) {
    dietMatch.forEach(match => {
      name = name.replace(match, '');
      const dietStr = match.replace(/[()]/g, '').toLowerCase();
      const dietCodes = dietStr.split(/[,+]/).map(d => d.trim());
      dietCodes.forEach(code => {
        const diet = DIET_MAP[code];
        if (diet && !diets.includes(diet)) {
          diets.push(diet);
        }
      });
    });
  }

  // Poista ylimääräiset välilyönnit
  name = name.replace(/\s+/g, ' ').trim();

  // Poista "KEITTO:", "PÄÄRUOKA:" jne. prefixejä mutta säilytä nimi
  const prefixes = ['keitto:', 'pääruoka:', 'kasvis:', 'vegetariano:', 'jälkiruoka:', 'buffet:'];
  let category = null;

  for (const prefix of prefixes) {
    if (name.toLowerCase().startsWith(prefix)) {
      category = prefix.replace(':', '');
      name = name.substring(prefix.length).trim();
      break;
    }
  }

  return { name, diets, category };
}

function getTodayDayName() {
  return DAYS_FI[new Date().getDay()];
}

async function scrapeKasi() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const $ = cheerio.load(response.data);
  const todayName = getTodayDayName().toUpperCase();
  const items = [];

  // Etsi sivulta kaikki tekstisisältö
  const content = $('body').text();
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let inTodaySection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineUpper = line.toUpperCase();

    // Tarkista onko tämä päivän otsikko
    const isDayHeader = DAYS_FI.some(day => lineUpper === day.toUpperCase());

    if (isDayHeader) {
      if (lineUpper === todayName) {
        inTodaySection = true;
        continue;
      } else if (inTodaySection) {
        // Seuraava päivä alkoi, lopeta
        break;
      }
      continue;
    }

    if (inTodaySection) {
      // Ohita liian lyhyet rivit ja yleisiä otsikoita
      if (line.length < 8) continue;
      if (lineUpper.match(/^(LOUNAS|VIIKKO|HINTA|€|\d+[,.]|CAFE|MENU)/)) continue;

      // Tarkista sisältääkö rivi ruoka-annoksen
      if (line.includes(':') || line.match(/\([LGVM,]+\)/i)) {
        const { name, diets, category } = parseMenuItem(line);

        if (name.length >= 5) {
          items.push({ name, diets, category });
        }
      }
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    items: items,
    source: URL
  };
}

module.exports = scrapeKasi;
