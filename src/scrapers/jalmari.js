// Kulttuuriravintola Jalmari Kangasala — kangasala-talo.fi staattinen HTML

const axios = require('axios');
const cheerio = require('cheerio');

const DAY_NAMES = ['', 'MAANANTAI', 'TIISTAI', 'KESKIVIIKKO', 'TORSTAI', 'PERJANTAI', 'LAUANTAI'];

module.exports = async function() {
  const dayIndex = new Date().getDay();
  if (dayIndex === 0) return { items: [] };

  const todayName = DAY_NAMES[dayIndex];

  const response = await axios.get('https://kangasala-talo.fi/ravintola/lounaslista/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    timeout: 10000
  });

  const $ = cheerio.load(response.data);
  const items = [];

  $('.entry-content p').each((i, el) => {
    const $el = $(el);
    const strongText = $el.find('strong').first().text().trim().toUpperCase();

    if (strongText.startsWith(todayName)) {
      const rawHtml = $el.html() || '';
      const parts = rawHtml.split(/<br\s*\/?>/i);

      parts.forEach(part => {
        const text = cheerio.load(part).text().trim();
        if (text.startsWith('●')) {
          let name = text.replace(/^●\s*/, '').trim();
          name = name.replace(/\s+\d+,\d{2}\s*€?\s*$/, '').trim();
          name = name.replace(/\s*\([^)]+\)\s*$/, '').trim();
          if (name) items.push({ name });
        }
      });
      return false;
    }
  });

  return { items };
};
