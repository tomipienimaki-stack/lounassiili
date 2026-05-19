import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayName, parseDiets, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.myllytupa.fi/lounasravintola';

export async function scrapeMyllytupa(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];
    const seen = new Set<string>();

    const today = getTodayDayName(); // e.g. "tiistai"
    const todayCap = today.charAt(0).toUpperCase() + today.slice(1); // "Tiistai"

    // Day headers are <h4> with <span style="...color: rgb(209, 78, 54)..."> containing the day name.
    // The matching <ul class="defaultList bullet"> sits as a sibling/descendant of the same column.
    $('h4').each((_, el) => {
      const $h4 = $(el);
      const spanText = $h4.find('span').first().text().trim();
      if (spanText.toLowerCase() !== today && spanText !== todayCap) return;

      // Find the column ancestor and then the menu list within it.
      const $col = $h4.closest('.dmRespCol');
      const $list = $col.length ? $col.find('ul').first() : $h4.nextAll('ul').first();
      if (!$list.length) return;

      $list.find('li').each((_, li) => {
        const raw = $(li).text().replace(/­|﻿/g, '').replace(/\s+/g, ' ').trim();
        if (!raw || raw.length < 3) return;

        const diets = parseDiets(raw);
        const name = raw.replace(/\s*\([^)]*\)/g, '').trim();
        if (name.length < 3) return;

        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);

        items.push({ name, diets });
      });
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      date: new Date().toISOString().split('T')[0],
      items: [],
      source: URL,
      error: message
    };
  }
}
