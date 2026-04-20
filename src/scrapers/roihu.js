const axios = require('axios');

// Ravintola Roihu — Compass Group JSON API (sama rakenne kuin Food & Co)
const COST_CENTER = '3060';
const API_URL = 'https://www.compass-group.fi/menuapi/day-menus';

const DIET_MAP = {
  'G':   'gluteeniton',
  'L':   'laktoositon',
  'M':   'maidoton',
  'Veg': 'vegaaninen',
  'VS':  'vegaaninen',
  'VL':  'vähälaktoosinen'
};

async function scrapeRoihu() {
  const dateStr = new Date().toISOString().split('T')[0];

  const response = await axios.get(API_URL, {
    params: { costCenter: COST_CENTER, language: 'fi', date: dateStr },
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  const menuPackages = response.data?.menuPackages || [];
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
    source: 'https://www.compass-group.fi/ravintolat-ja-ruokalistat/muut-avoimet-ravintolat/kaupungit/helsinki/roihu/'
  };
}

module.exports = scrapeRoihu;
