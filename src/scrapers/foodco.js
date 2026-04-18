const axios = require('axios');

// Food & Co Ruoholahti — Compass Group JSON API, ei HTML-scrappausta tarvita
const COST_CENTER = '3130';
const API_URL = 'https://www.compass-group.fi/menuapi/day-menus';

const DIET_MAP = {
  'G': 'gluteeniton',
  'L': 'laktoositon',
  'M': 'maidoton',
  'Veg': 'vegaaninen',
  'VL': 'vähälaktoosinen'
  // '*' = sydänmerkki, 'ILM' = ilmastoystävällinen, 'A' = allergeenitieto, 'VS' = valkosipuli — jätetään pois tageista
};

async function scrapeFoodCo() {
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const response = await axios.get(API_URL, {
    params: { costCenter: COST_CENTER, language: 'fi', date: dateStr },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const data = response.data;
  const menuPackages = data?.menuPackages || [];

  const items = [];

  for (const pkg of menuPackages) {
    for (const meal of pkg.meals || []) {
      const name = meal.name;
      if (!name || name.length < 3) continue;

      const diets = (meal.diets || [])
        .map(code => DIET_MAP[code])
        .filter(Boolean);

      items.push({ name, diets });
    }
  }

  return {
    date: dateStr,
    items,
    source: 'https://www.compass-group.fi/ravintolat-ja-ruokalistat/foodco/kaupungit/helsinki/ruoholahti/'
  };
}

module.exports = scrapeFoodCo;
