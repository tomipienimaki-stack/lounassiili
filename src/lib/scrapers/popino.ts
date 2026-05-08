import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayCaps, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.popino.fi/lounas/';

export async function scrapePopino(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const todayCaps = getTodayDayCaps() + ':'; // e.g. "TO:"
    const items: MenuItem[] = [];

    let capturing = false;
    $('.b-text-c p').each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;

      const upperText = text.toUpperCase();
      const days = ['MA:', 'TI:', 'KE:', 'TO:', 'PE:', 'LA:'];
      const startsNewDay = days.some(d => upperText.startsWith(d));

      if (startsNewDay) {
        capturing = upperText.startsWith(todayCaps);
      }

      if (capturing) {
        let dishText = text;
        if (upperText.startsWith(todayCaps)) {
          dishText = text.substring(todayCaps.length).trim();
        }
        
        if (dishText && dishText.length > 2) {
          // Avoid pushing the same day header if it was already handled
          if (!startsNewDay || upperText.startsWith(todayCaps)) {
             items.push({ 
               name: dishText, 
               diets: [] 
             });
          }
        }
      }
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL
    };
  } catch (error: any) {
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: URL,
      error: error.message
    };
  }
}
