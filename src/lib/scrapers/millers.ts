import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const URL = 'https://millersbbq.fi/menu/';

export async function scrapeMillers(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];

    // Miller's BBQ has a menu page with items in .menu-item or similar
    // Since they don't have a rotating weekly menu, we'll capture their main offerings
    $('.elementor-widget-container h3, .elementor-widget-container p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 5 && text.length < 100 && !text.includes('€')) {
        items.push({ name: text, diets: [] });
      }
    });

    // Fallback
    if (items.length === 0) {
      const content = $('.elementor-page').text();
      if (content) {
        const cleaned = content.replace(/\s+/g, ' ').trim();
        if (cleaned.length > 20) {
           items.push({ name: cleaned, diets: [] });
        }
      }
    }

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
