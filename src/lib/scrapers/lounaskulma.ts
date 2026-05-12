import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, MenuItem, RestaurantMenu } from './utils';

const URL = 'https://www.maaritinlounaskulma.fi/';

const DAY_TOKENS = ['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su'];

function isDayHeader(text: string): number | null {
  const m = text.trim().toLowerCase().match(/^(ma|ti|ke|to|pe|la|su)\s+\d{1,2}\.\d{1,2}\.?/);
  if (!m) return null;
  return DAY_TOKENS.indexOf(m[1]);
}

function isStopMarker(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t.startsWith('suljettu') || t.startsWith('olemme kiinni');
}

export async function scrapeLounaskulma(): Promise<RestaurantMenu> {
  try {
    const html = await cachedGet<string>(URL);
    const $ = cheerio.load(html);
    const today = getTodayDayIndex();
    const items: MenuItem[] = [];

    const paragraphs = $('p').toArray();
    const raw: string[] = [];
    let capturing = false;

    for (const p of paragraphs) {
      // Normalize non-breaking and Apple-converted spaces, collapse runs
      const text = $(p).text().replace(/[  ]/g, ' ').replace(/[ \t]+/g, ' ');
      const trimmed = text.trim();
      if (!trimmed) continue;

      const dayIdx = isDayHeader(trimmed);
      if (dayIdx !== null) {
        capturing = dayIdx === today;
        continue;
      }
      if (capturing && isStopMarker(trimmed)) {
        capturing = false;
        continue;
      }
      if (!capturing) continue;
      if (/^(tervetuloa|maarit|niina|n[äa]hd|olemme)/i.test(trimmed)) continue;
      raw.push(text);
    }

    // Merge wrapped lines (continuation starts with lowercase)
    const merged: string[] = [];
    for (const line of raw) {
      const t = line.trim();
      const startsLower = /^[a-zäöå]/.test(t);
      if (startsLower && merged.length > 0) {
        merged[merged.length - 1] = (merged[merged.length - 1].trim() + ' ' + t).replace(/\s+/g, ' ');
      } else {
        merged.push(t);
      }
    }

    for (const line of merged) {
      const parsed = extractItem(line);
      if (parsed && parsed.name.length > 2) items.push(parsed);
    }

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: URL,
    };
  } catch (error: unknown) {
    return emptyMenu(URL, (error as Error).message);
  }
}
