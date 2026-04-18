const axios = require('axios');

// Antell Femma — käyttää WordPress REST API:a, ei HTML-scrappausta tarvita
const RESTAURANT_ID = 2027;
const API_URL = `https://antell.fi/wp-json/v1/restaurant/${RESTAURANT_ID}/menu`;

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DIET_MAP = {
  'G': 'gluteeniton',
  'L': 'laktoositon',
  'M': 'maidoton',
  'VEG': 'vegaaninen',
  'VL': 'vähälaktoosinen'
  // 'A' = allergeenitieto, jätetään pois tagista
};

async function scrapeAntell() {
  const response = await axios.get(API_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const apiData = response.data?.data;
  if (!apiData) throw new Error('Antell API ei palauttanut dataa');

  const todayKey = DAY_KEYS[new Date().getDay()];
  const sections = apiData.buffet?.[todayKey] || [];

  const items = [];

  for (const section of sections) {
    // Jätetään jälkiruoka pois
    if (section.option_title_fi?.toLowerCase().includes('jälkiruoka')) continue;

    for (const meal of section.meals || []) {
      const name = meal.recipe_name_fi;
      if (!name || name.length < 3) continue;

      const diets = (meal.special_diets || [])
        .map(code => DIET_MAP[code])
        .filter(Boolean);

      items.push({ name, diets });
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: 'https://www.antell.fi/ravintolat/antell-femma'
  };
}

module.exports = scrapeAntell;
