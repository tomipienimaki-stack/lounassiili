// Ravintola Paakari Kangasala — ravintolapaakari.fi staattinen HTML (kiertävä viikkolista)

const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function() {
  const response = await axios.get('https://ravintolapaakari.fi/fi/lounas/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    timeout: 10000
  });

  const $ = cheerio.load(response.data);
  const items = [];
  const seen = new Set();

  $('p.wp-block-paragraph, .entry-content p').each((i, el) => {
    const $el = $(el);
    const fullText = $el.text().trim();
    if (!fullText.match(/\d+,\d{2}/)) return;

    const rawHtml = $el.html() || '';
    const parts = rawHtml.split(/<br\s*\/?>/i);

    parts.forEach(part => {
      const text = cheerio.load(part).text().trim();
      if (!text.match(/\d+,\d{2}/) || text.length < 4) return;

      let name = text.replace(/\s+\d+,\d{2}.*$/, '').trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      items.push({ name });
    });
  });

  return { items };
};
