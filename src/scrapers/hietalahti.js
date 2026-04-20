const axios = require('axios');
const cheerio = require('cheerio');

// Hietalahden kauppahalli — yhteinen hakija kaikille hallin ravintoloille
// https://hietalahdenkauppahalli.fi/lounaslistat/

const URL = 'https://hietalahdenkauppahalli.fi/lounaslistat/';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

let _cache = null;
let _cacheDate = null;

async function fetchHietalahtiMenus() {
  const today = new Date().toISOString().split('T')[0];

  // Käytetään päiväkohtaista välimuistia — haetaan sivu vain kerran per päivä
  if (_cache && _cacheDate === today) return _cache;

  const response = await axios.get(URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });

  const $ = cheerio.load(response.data);
  const todayKey = DAY_KEYS[new Date().getDay()];
  const result = {};

  // Jokainen ravintola on .lunch-col -divissä
  $('.lunch-col').each((_, col) => {
    const name = $(col).find('h2').first().text().trim().toLowerCase();
    if (!name) return;

    // Hae tämän päivän menu-kappale
    const menuEl = $(col).find(`p.menu[data-day="${todayKey}"]`);
    if (!menuEl.length) return;

    // Lue rivit br-tagien välistä
    const html = menuEl.find('b').html() || menuEl.html() || '';
    const lines = html
      .split(/<br\s*\/?>/i)
      .map(l => cheerio.load(l).text().trim())
      .filter(l => l.length > 3);

    // Suodata pois pelkät hinnat ja otsikot
    const items = lines
      .filter(l => !/^[\d,]+\s*€$/.test(l))     // ei pelkkä hinta
      .filter(l => !/^lounas\s+klo/i.test(l))    // ei "Lounas klo ..."
      .map(line => {
        // Poista hinnat rivin lopusta: "Dish name – 14,00€"
        const name = line.replace(/[\–\-]\s*[\d,]+\s*€.*$/, '').trim();
        return { name, diets: [] };
      })
      .filter(item => item.name.length >= 4);

    result[name] = items;
  });

  _cache = result;
  _cacheDate = today;
  return result;
}

module.exports = { fetchHietalahtiMenus, URL };
