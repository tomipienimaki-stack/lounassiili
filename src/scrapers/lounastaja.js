// Shared fetcher for restaurants using the lounastaja.app platform

const axios = require('axios');

async function fetchLounastaja(apiKey, widgetId, origin) {
  const url = `https://lounastaja.app/api/v1/widget/${apiKey}/${widgetId}`;

  const response = await axios.get(url, {
    headers: {
      'Origin': origin,
      'Referer': origin + '/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    },
    timeout: 10000
  });

  const days = response.data?.data?.week?.days || [];

  // Find today by dateString (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  let todayData = days.find(d => d.dateString === todayStr);

  // Fallback: match by Finnish day name
  if (!todayData) {
    const DAY_NAMES = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'];
    const todayName = DAY_NAMES[new Date().getDay()].toLowerCase();
    todayData = days.find(d => d.dayName?.fi?.toLowerCase() === todayName);
  }

  if (!todayData || !todayData.lunches?.length) {
    return { items: [] };
  }

  const items = todayData.lunches
    .filter(l => l.title?.fi && !l.title.fi.match(/ei lounasta/i))
    .map(l => ({ name: l.title.fi }));

  return { items };
}

module.exports = fetchLounastaja;
