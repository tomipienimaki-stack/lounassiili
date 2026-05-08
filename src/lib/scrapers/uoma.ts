import axios from 'axios';
import * as cheerio from 'cheerio';
import { RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.ravintolauoma.fi/lounas';

export async function scrapeUoma(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];

    // Uoma's menu often lists dishes under "Pääruokavaihtoehdot"
    // Let's look for that heading or any list of dishes
    let capturing = false;
    $('p, h2, h3, div').each((_, el) => {
      const text = $(el).text().trim();
      
      if (text.includes('Pääruokavaihtoehdot') || text.includes('Lounaslista')) {
        capturing = true;
        return;
      }
      
      if (capturing) {
        if (text.includes('Kolmen ruokalajin') || text.includes('Ilmoitathan') || text.includes('Yhteystiedot') || text.includes('Varaukset')) {
          capturing = false;
          return;
        }
        
        // If it looks like a dish (long enough, not just a price)
        if (text.length > 5 && !text.match(/^\d+[,.]\d+\s*€$/)) {
          // If the text contains a price at the end, keep it or clean it
          const cleanedText = text.replace(/\d+[,.]\d+\s*€.*$/, '').trim();
          if (cleanedText.length > 5) {
            items.push({
              name: cleanedText,
              diets: []
            });
          } else if (text.length > 10) {
            items.push({ name: text, diets: [] });
          }
        }
      }
    });

    // Fallback if capturing logic failed but we have some content
    if (items.length === 0) {
      const content = $('.et_pb_module_inner').first().text() || $('.entry-content').text();
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
