import * as cheerio from 'cheerio';
import { cachedGet } from './cache';
import { emptyMenu, extractItem, getTodayDayIndex, MenuItem, RestaurantMenu } from './utils';

const HOME_URL = 'https://himalayakitchen.fi/';
const DAY_LABELS = ['MAANANTAI', 'TIISTAI', 'KESKIVIIKKO', 'TORSTAI', 'PERJANTAI'];

async function resolveDayUrl(today: number): Promise<string | null> {
  if (today > 4) return null;
  const html = await cachedGet<string>(HOME_URL);
  const $ = cheerio.load(html);
  let match: string | null = null;
  $('a').each((_, a) => {
    const text = $(a).text().trim().toUpperCase();
    const href = $(a).attr('href') || '';
    if (text === DAY_LABELS[today] && href.includes('restadeal.fi/menu/')) {
      match = href;
      return false;
    }
  });
  return match;
}

// The day-page contains ALL weekday buffets stacked, separated by uppercase
// "MAANANTAI"/"TIISTAI"/... markers. We walk the document in order, track the
// currently-active day section, and collect labels only for today.
export async function scrapeHimalaya(): Promise<RestaurantMenu> {
  const today = getTodayDayIndex();
  try {
    const dayUrl = await resolveDayUrl(today);
    if (!dayUrl) {
      return { date: new Date().toISOString().split('T')[0], items: [], source: HOME_URL };
    }

    const html = await cachedGet<string>(dayUrl);
    const $ = cheerio.load(html);
    const items: MenuItem[] = [];
    const seen = new Set<string>();

    // Find the menu container — the one that holds the day stack. The dishes
    // sit in a container alongside <p> tags whose text equals "MAANANTAI" etc.
    // We walk all elements in order under <body> and inspect text/labels.
    const bodyHtml = $('body').html() || '';

    // Token-stream approach: scan the html, splitting by day markers placed in
    // a navigation strip vs the actual section headers. The section headers
    // appear as `>MAANANTAI<` inside heading-like wrappers near the labels.
    // Heuristic: between the two occurrences of "TIISTAI" that bracket label
    // ids ~1729-1735, the dish labels belong to Tuesday. We scan all label
    // positions and day positions, then take labels whose preceding day marker
    // matches today.
    type Marker = { pos: number; type: 'day' | 'label'; value: string; raw?: string };
    const markers: Marker[] = [];

    const dayRe = /\b(MAANANTAI|TIISTAI|KESKIVIIKKO|TORSTAI|PERJANTAI)\b/g;
    let m: RegExpExecArray | null;
    while ((m = dayRe.exec(bodyHtml))) {
      markers.push({ pos: m.index, type: 'day', value: m[1] });
    }
    const labelRe = /<label for="(\d+)">([^<]+)<\/label>/g;
    while ((m = labelRe.exec(bodyHtml))) {
      markers.push({ pos: m.index, type: 'label', value: m[2], raw: m[1] });
    }
    markers.sort((a, b) => a.pos - b.pos);

    // Track current day section. We only want labels strictly between today's
    // day marker and the next day marker, but we need to skip the navigation
    // strips (where day markers appear consecutively without labels between).
    let currentDay = DAY_LABELS[today];
    let activeDay: string | null = null;
    const todayLabels: string[] = [];

    for (const marker of markers) {
      if (marker.type === 'day') {
        activeDay = marker.value;
        continue;
      }
      if (activeDay === currentDay) {
        todayLabels.push(marker.value);
      }
    }

    // Dedupe: the page renders each section twice (mobile + desktop).
    for (const raw of todayLabels) {
      // Strip stray truncated allergen-paren tails like "JEERA ALOO(G,L,P,"
      const text = raw.replace(/\s+/g, ' ').replace(/\([A-Za-z,\s]*$/, '').trim();
      if (!text) continue;
      if (/lounas buffet/i.test(text)) continue;
      if (seen.has(text)) continue;
      seen.add(text);
      const parsed = extractItem(text);
      if (parsed && parsed.name.length > 1) items.push(parsed);
    }

    void currentDay;

    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source: dayUrl,
    };
  } catch (error: unknown) {
    return emptyMenu(HOME_URL, (error as Error).message);
  }
}
