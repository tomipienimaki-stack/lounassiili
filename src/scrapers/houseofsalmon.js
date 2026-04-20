const { fetchHietalahtiMenus, URL } = require('./hietalahti');

async function scrapeHouseOfSalmon() {
  const menus = await fetchHietalahtiMenus();
  const key = Object.keys(menus).find(k => k.includes('house of salmon') || k.includes('salmon'));
  const items = key ? menus[key] : [];

  return {
    date: new Date().toISOString().split('T')[0],
    items,
    source: URL
  };
}

module.exports = scrapeHouseOfSalmon;
