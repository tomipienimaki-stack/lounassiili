const axios = require('axios');
const cheerio = require('cheerio');

// Pompier Albertinkatu — Beaver Builder -accordion, haetaan pompier.fi:stä
// (pompier.fi/albertinkatu/ ohjaa takaisin etusivulle)
const URL = 'https://pompier.fi/';

async function scrapePompier() {
  const response = await axios.get(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const $ = cheerio.load(response.data);

  // Maanantai=0 ... Perjantai=4 accordion-indeksinä
  // getDay(): sunnuntai=0, maanantai=1 ... lauantai=6
  const dayIndex = new Date().getDay() - 1; // ma=0 ... pe=4

  // Viikonloput: ei lounasta
  if (dayIndex < 0 || dayIndex > 4) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: URL
    };
  }

  const accordionItems = $('#albertinkatu-lounas-haitari .fl-accordion-item');
  const todayItem = accordionItems.eq(dayIndex);

  if (!todayItem.length) {
    throw new Error('Pompier: Päivän lounastietoja ei löytynyt');
  }

  // Lue menu-kappaleet br-tagien välistä
  const menuHtml = todayItem.find('.fl-accordion-content p').html() || '';
  const lines = menuHtml
    .split(/<br\s*\/?>/i)
    .map(line => cheerio.load(line).text().trim())
    .filter(Boolean);

  const items = lines
    // Jätetään pois "Kaikki herkut X €" -rivi (hinnan yhteenveto)
    .filter(line => !/^kaikki herkut/i.test(line))
    .map(line => ({ name: line, diets: [] }));

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapePompier;
