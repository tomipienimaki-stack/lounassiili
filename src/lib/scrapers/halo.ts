import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, parseDiets, RestaurantMenu, MenuItem } from './utils';

const API_URL = 'https://halorestaurant.fi/wp-json/wp/v2/pages?slug=lounas&_fields=content,modified';
const DAYS_FI = ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'];

export async function scrapeHalo(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(API_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const page = response.data[0];
    if (!page) throw new Error('HALO: lounassivu ei löytynyt');

    const $ = cheerio.load(page.content.rendered);
    const todayName = getTodayDayName();
    const items: MenuItem[] = [];
    let inToday = false;

    $('p').each((_, el) => {
      const $el = $(el);
      const underline = $el.find('u');
      const strong = $el.find('strong');

      let dayText = '';
      if (underline.length) {
        dayText = underline.text().toLowerCase();
      } else if (!strong.length) {
        dayText = $el.text().trim().toLowerCase();
      }

      if (dayText) {
        const matchedDay = DAYS_FI.find(d => dayText.startsWith(d));
        if (matchedDay) {
          inToday = (matchedDay === todayName);
          return;
        }
      }

      if (!inToday) return;
      if (!strong.length) return;

      const fullText = $el.text().trim();
      if (/^dessert it/i.test(fullText)) return;

      const strongText = strong.text().trim();
      const dashIdx = strongText.search(/[–—-]/);
      if (dashIdx === -1) return;

      const itemPart = strongText.substring(dashIdx + 1).trim();
      if (itemPart.length < 5) return;

      const name = itemPart.replace(/\([^)]+\)/g, '').trim();
      const diets = parseDiets(itemPart);

      if (name.length >= 5) {
        items.push({ name, diets });
      }
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: 'https://halorestaurant.fi/lounas/'
    };
  } catch (error: any) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: 'https://halorestaurant.fi/lounas/',
      error: error.message
    };
  }
}
