import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, getTodayDayIndex, MenuItem, RestaurantMenu, DIET_MAP } from './utils';

const DAY_PARTITIVE = ['maanantaina', 'tiistaina', 'keskiviikkona', 'torstaina', 'perjantaina', 'lauantaina', 'sunnuntaina'];

// lounaat.info uses a uniform structure across restaurant pages:
//   <div class="item">
//     <div class="item-header"><h3>Tiistaina 12.5.</h3></div>
//     <div class="item-body">
//       <ul>
//         <li class="menu-item item-diet-X">
//           <p class="price">13,80e</p>
//           <p class="dish">Dish name  <a class="diet diet-X" title="...">x</a>  ks</p>
//         </li>
export async function scrapeFromLounaatInfo(url: string): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(url);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const todayLabel = DAY_PARTITIVE[today];
    const items: MenuItem[] = [];

    $('div.item').each((_, el) => {
      const header = $(el).find('.item-header h3').first().text().trim().toLowerCase();
      if (!header.startsWith(todayLabel)) return;

      $(el).find('.menu-item').each((_, li) => {
        const dishEl = $(li).find('p.dish');
        // Diet codes are <a class="diet diet-X" title="Laktoositon">
        const diets: string[] = [];
        dishEl.find('a.diet').each((_, a) => {
          const cls = $(a).attr('class') || '';
          const m = cls.match(/diet-([a-z]+)/);
          if (m) {
            const mapped = DIET_MAP[m[1]];
            if (mapped && !diets.includes(mapped)) diets.push(mapped);
          }
        });
        // Strip the diet anchors before reading the dish text
        const clone = dishEl.clone();
        clone.find('a').remove();
        const name = clone.text()
          .replace(/[\x00-\x1f]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          // Strip trailing sub-allergen markers (ks, pg, k, kr, etc) that appear as plain text
          .replace(/[\s,]+(?:ks|kr|pg|p|k|v|veg)(?:\s*,?\s*(?:ks|kr|pg|p|k|v|veg))*[\s,]*$/i, '')
          .trim();
        if (!name || name.length < 3) return;
        if (/^lounasbuffet\b/i.test(name) && /^\d/.test(name.replace(/^lounasbuffet\s*/i, ''))) return;
        items.push({ name, diets });
      });
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: url,
    };
  } catch (error: unknown) {
    return emptyMenu(url, (error as Error).message);
  }
}
