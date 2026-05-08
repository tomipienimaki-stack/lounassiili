import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, RestaurantMenu, MenuItem, DAYS_FI } from './utils';

const URL = 'https://lounasmesta.fi/lounaslista/';

export async function scrapeLounasMesta(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];
    const today = getTodayDayName(); // e.g. "torstai"
    const todayFull = today.charAt(0).toUpperCase() + today.slice(1); // e.g. "Torstai"

    const content = $('.entry-content').text();
    
    if (content) {
      // Find today's section
      const sections = content.split(new RegExp(`(${DAYS_FI.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join('|')})`, 'g'));
      
      let capturing = false;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i] === todayFull) {
          capturing = true;
          continue;
        }
        
        if (capturing && i + 1 < sections.length && DAYS_FI.some(d => sections[i+1] === (d.charAt(0).toUpperCase() + d.slice(1)))) {
          // This section is today's menu
          const menuText = sections[i].trim();
          const lines = menuText.split('\n').filter(l => l.trim().length > 5);
          lines.forEach(line => {
            const l = line.trim();
            if (!l.includes('ÄITIENPÄIVÄ') && !l.includes('AIKUISET') && !l.includes('LAPSET') && !l.includes('PÖYTÄVARAUKSIA') && !l.includes('Yhteystiedot') && !l.includes('Vanajantie') && !l.includes('Oiva-raportti') && !l.includes('klo')) {
              items.push({
                name: l,
                diets: []
              });
            }
          });
          break;
        }
        
        // Handle last section
        if (capturing && i === sections.length - 1) {
          const menuText = sections[i].trim();
          const lines = menuText.split('\n').filter(l => l.trim().length > 5);
          lines.forEach(line => {
            const l = line.trim();
            if (!l.includes('ÄITIENPÄIVÄ') && !l.includes('AIKUISET') && !l.includes('LAPSET') && !l.includes('PÖYTÄVARAUKSIA') && !l.includes('Yhteystiedot') && !l.includes('Vanajantie') && !l.includes('Oiva-raportti') && !l.includes('klo')) {
              items.push({
                name: l,
                diets: []
              });
            }
          });
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
