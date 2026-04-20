const axios = require('axios');
const cheerio = require('cheerio');

// Ravintola Sewa — staattinen HTML, Elementor-välilehdet
const URL = 'https://www.sewa.fi/';

const DIET_MAP = {
  'g':  'gluteeniton',
  'l':  'laktoositon',
  'm':  'maidoton',
  've': 'vegaaninen',
  'vl': 'vähälaktoosinen'
};

// Sewa käyttää isoja kirjaimia: MAANANTAI, TIISTAI jne.
const DAYS_UPPER = ['SUNNUNTAI', 'MAANANTAI', 'TIISTAI', 'KESKIVIIKKO', 'TORSTAI', 'PERJANTAI', 'LAUANTAI'];

function getTodayDayUpper() {
  return DAYS_UPPER[new Date().getDay()];
}

function parseDiets(text) {
  // Ruokavaliot sulkeissa: (G,L) tai (G, L)
  const match = text.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1]
    .split(/[,\s]+/)
    .map(c => DIET_MAP[c.trim().toLowerCase()])
    .filter(Boolean);
}

async function scrapeSewa() {
  const response = await axios.get(URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  const $ = cheerio.load(response.data);
  const todayUpper = getTodayDayUpper();
  const items = [];

  // Elementor välilehdet: etsi tämän päivän sisältölohko
  // Haetaan kaikki teksti body:stä rivitasolla
  const bodyText = $('body').text();
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

  let inToday = false;

  for (const line of lines) {
    const lineUpper = line.toUpperCase().trim();

    // Päiväotsikko (esim. "MAANANTAI" tai "MAANANTAI 20.4.")
    const isDay = DAYS_UPPER.some(d => lineUpper === d || lineUpper.startsWith(d + ' '));
    if (isDay) {
      inToday = lineUpper === todayUpper || lineUpper.startsWith(todayUpper + ' ');
      continue;
    }

    if (!inToday) continue;
    if (line.length < 5) continue;

    // Annos: alkaa numerolla (esim. "1.Veg kofta chilli (G,L)*")
    // tai sisältää ruokavaliolyhenteen
    const isMenuItem = /^\d+\./.test(line) || /\([A-Z,\s]+\)/.test(line);
    if (!isMenuItem) continue;

    // Poista järjestysnumero: "1.Veg kofta" → "Veg kofta"
    const withoutNum = line.replace(/^\d+\./, '').trim();

    // Poista ruokavaliosulkeet ja tähti nimestä
    const name = withoutNum
      .replace(/\([^)]+\)/g, '')
      .replace(/\*.*$/, '')       // tähden jälkeen tuleva (mausteinfo)
      .replace(/vegaani\s*\/\s*vegan/gi, '')
      .trim();

    const diets = parseDiets(withoutNum);
    // Tarkista myös onko "Vegaani" tekstinä
    if (/vegaani/i.test(line) && !diets.includes('vegaaninen')) {
      diets.push('vegaaninen');
    }

    if (name.length >= 5) {
      items.push({ name, diets });
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapeSewa;
