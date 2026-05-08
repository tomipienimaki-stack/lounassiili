import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.ravintolaseiska.com/lounas';

export async function scrapeSeiska(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];

    // Seiska is a Wix site. Menu is usually in richText elements.
    $('[data-testid="richTextElement"]').each((_, el) => {
      const text = $(el).text().trim();
      // Look for lines that look like menu items (contain Finnish day names or are in the right section)
      if (text.length > 20 && (text.includes('Maanantai') || text.includes('Perjantai') || text.includes('Lounas'))) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        lines.forEach(line => {
          if (!line.includes('LOUNAS') && !line.includes('Hinnat')) {
            items.push({ name: line, diets: [] });
          }
        });
      }
    });

    // Fallback
    if (items.length === 0) {
      const content = $('main').text();
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
