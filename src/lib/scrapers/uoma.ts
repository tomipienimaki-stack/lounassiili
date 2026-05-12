import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://www.ravintolauoma.fi/lounas';

// Uoma serves a single weekly lunch menu (Wed-Fri). We just extract the salad
// table and the main dish options once — no day filtering needed.
export async function scrapeUoma(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];
    const seen = new Set<string>();

    // The page lists each menu line in its own <p> or <span>. Walk paragraphs.
    $('p, span').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (text.length < 5 || text.length > 220) return;
      if (seen.has(text)) return;

      // Heuristic: menu lines either end with allergen codes in parens, or
      // contain a euro price. Skip dates, contact info, headings.
      // Only accept lines that end with a Finnish-allergen paren group.
      const hasParenCodes = /\(([a-zA-ZäöÄÖ]+)(?:\s*,\s*[a-zA-ZäöÄÖ]+)*\)\s*$/.test(text);
      if (!hasParenCodes) return;
      if (/yhteystiedot|varaukset|ilmoitathan|sähköpos|puh\./i.test(text)) return;
      if (/^lounas\b/i.test(text)) return;
      if (/^\d{1,2}\.\d{1,2}/.test(text)) return;
      if (/lapset|alkuruoka|jälkiruoka\b/i.test(text) && text.length < 30) return;

      // Strip leading "..." artifacts from CMS
      const cleanName = text.replace(/^\.{2,}\s*/, '').trim();
      const parsed = extractItem(cleanName);
      if (!parsed || parsed.name.length < 8) return;
      if (seen.has(parsed.name)) return;
      seen.add(parsed.name);
      seen.add(text);
      items.push(parsed);
    });

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
