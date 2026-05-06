const axios = require('axios');
const cheerio = require('cheerio');

const DIET_MAP = {
  'l':   'laktoositon',
  'g':   'gluteeniton',
  'm':   'maidoton',
  'vl':  'vähälaktoosinen',
  'veg': 'vegaaninen',
  've':  'vegaaninen'
};

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
  const match = text.match(/\[([^\]]+)\]/);
  if (!match) return [];
  return match[1]
    .split(/[,\s]+/)
    .map(c => DIET_MAP[c.trim().toLowerCase()])
    .filter(Boolean);
}

/**
 * Luo lounaat.info-skreipperin annetulle URL-osoitteelle
 * @param {string} url Lounaat.info-ravintolasivun URL
 */
function createLounaatInfoScraper(url) {
  return async function() {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayInflected = getTodayDayInflected();
    const items = [];
    const seen = new Set();
    let inToday = false;

    // Lounaat.info rakenteessa lounaat ovat usein div.menu tai h3/h4 + li listauksissa
    // Käydään läpi kaikki mahdolliset elementit
    $('h3, h4, li, p, .item-body').each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().trim();
      if (!text) return;

      const textLower = text.toLowerCase();

      // Päiväotsikon tunnistus
      if (tag === 'h3' || tag === 'h4' || $(el).hasClass('item-header')) {
        const isDay = DAYS_FI_INFLECTED.some(d => textLower.startsWith(d));
        if (isDay) {
          inToday = textLower.startsWith(todayInflected);
          return;
        }
      }

      if (!inToday) return;
      if (text.length < 5) return;

      // Suodata pois turhat rivit kuten "Lounas tarjolla..."
      if (textLower.includes('lounas tarjolla') || textLower.includes('hinta:')) return;

      const name = text.replace(/\[[^\]]+\]/g, '').trim();
      const diets = parseBracketDiets(text);

      if (name.length >= 5 && !seen.has(name)) {
        seen.add(name);
        items.push({ name, diets });
      }
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: url
    };
  };
}

module.exports = createLounaatInfoScraper;
