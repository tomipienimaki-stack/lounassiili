const { fetchHietalahtiMenus, URL } = require('./hietalahti');

async function scrapeChaoPhhraya() {
  const menus = await fetchHietalahtiMenus();
  // Etsi nimi case-insensitively (avain on lowercasettu hietalahti.js:ssä)
  const key = Object.keys(menus).find(k => k.includes('chao phraya'));
  const items = key ? menus[key] : [];

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapeChaoPhhraya;
