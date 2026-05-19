import axios from 'axios';
import * as cheerio from 'cheerio';
import { getTodayDayCaps, parseDiets, RestaurantMenu, MenuItem } from './utils';

const URL = 'https://www.bora.fi/lounas';

// Day-header tokens that may appear inside <strong> tags in Bora's table.
// Includes a known typo "KESKIIVIKKO" found in the real HTML.
const DAY_HEADERS = [
  'MAANANTAI',
  'TIISTAI',
  'KESKIVIIKKO',
  'KESKIIVIKKO',
  'TORSTAI',
  'PERJANTAI',
  'LAUANTAI',
  'SUNNUNTAI'
];

function isDayHeader(text: string): boolean {
  const t = text.trim().toUpperCase().replace(/[^A-ZÄÖ]/g, '');
  return DAY_HEADERS.some(d => d === t);
}

function todayMatchesHeader(headerText: string): boolean {
  const todayCaps = getTodayDayCaps(); // "TI", "KE", etc.
  const t = headerText.trim().toUpperCase().replace(/[^A-ZÄÖ]/g, '');
  return t.startsWith(todayCaps);
}

export async function scrapeBora(): Promise<RestaurantMenu> {
  try {
    const response = await axios.get(URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);
    const items: MenuItem[] = [];
    const seen = new Set<string>();

    // Walk through all <tr> rows. Track which day section we're inside.
    let inToday = false;
    $('tr').each((_, tr) => {
      const text = $(tr).text().replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
      if (!text) return;

      // Day header row: a <strong> child whose text is a day name.
      const strongText = $(tr).find('strong').first().text().trim();
      if (strongText && isDayHeader(strongText)) {
        inToday = todayMatchesHeader(strongText);
        return;
      }

      if (!inToday) return;

      // Each menu row may contain multiple items separated by <br>. Split on
      // line breaks AND on newline-equivalents inside the cell text.
      const html = $(tr).find('td').first().html() || '';
      const parts = html
        .replace(/<br\s*\/?>/gi, '\n')
        .split('\n')
        .map(s => cheerio.load('<x>' + s + '</x>')('x').text())
        .map(s => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      for (const part of parts) {
        // Strip trailing price like "13,50€" or "€13.50" and currency artifacts.
        let cleaned = part.replace(/\d+[.,]\d{1,2}\s*€/g, '').trim();
        cleaned = cleaned.replace(/€\s*\d+[.,]\d{1,2}/g, '').trim();
        cleaned = cleaned.replace(/[—–-]\s*$/, '').trim();

        if (!cleaned || cleaned.length < 3) continue;

        // Skip notes / boilerplate.
        const upper = cleaned.toUpperCase();
        if (
          upper.includes('AVATAAN') ||
          upper.includes('ALA CARTE') ||
          upper.includes('KAIKKIIN ANNOKSIIN') ||
          upper.includes('RAAKA-AINEISTA') ||
          upper.includes('HENKILÖKUNNALTA') ||
          upper.includes('SALAATTI JA KAHVI') ||
          isDayHeader(cleaned)
        ) {
          continue;
        }

        const diets = parseDiets(cleaned);
        // Bora uses dash-joined codes like "(G-L)" — parseDiets only catches alpha letters,
        // so it returns the first letter only. Manually expand "G-L", "G-V" etc.
        const parenMatches = cleaned.match(/\(([^)]+)\)/g) || [];
        const extra: string[] = [];
        for (const m of parenMatches) {
          const inside = m.replace(/[()]/g, '');
          const codes = inside.split(/[-,\s/]+/).filter(Boolean);
          for (const c of codes) {
            const norm = c.toLowerCase();
            const mapped: Record<string, string> = {
              g: 'gluteeniton',
              l: 'laktoositon',
              m: 'maidoton',
              v: 'vegaaninen',
              ve: 'vegaaninen',
              veg: 'vegaaninen',
              vl: 'vähälaktoosinen'
            };
            const val = mapped[norm];
            if (val) extra.push(val);
          }
        }
        const allDiets = Array.from(new Set([...diets, ...extra]));

        const name = cleaned.replace(/\s*\([^)]*\)/g, '').trim();
        if (name.length < 3) continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        items.push({ name, diets: allDiets });
      }
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
