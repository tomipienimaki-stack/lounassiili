import axios from 'axios';
import { emptyMenu, MenuItem, RestaurantMenu, DIET_MAP } from './utils';

const SHORT_DAY: Record<string, string> = {
  maanantai: 'MA',
  tiistai: 'TI',
  keskiviikko: 'KE',
  torstai: 'TO',
  perjantai: 'PE',
  lauantai: 'LA',
  sunnuntai: 'SU',
};

interface LounastajaLunch {
  title?: { fi?: string };
  description?: { fi?: string };
  allergens?: Array<{ title?: { fi?: string }; abbreviation?: { fi?: string } }>;
  isWeekMenuLunch?: boolean;
}
interface LounastajaDay {
  dayName?: { fi?: string };
  dateString?: string;
  isHidden?: boolean;
  isClosed?: boolean;
  lunches?: LounastajaLunch[];
}
interface LounastajaResponse {
  data?: { week?: { days?: LounastajaDay[] } };
}

function allergensToDiets(allergens: LounastajaLunch['allergens']): string[] {
  if (!allergens?.length) return [];
  const diets: string[] = [];
  for (const a of allergens) {
    const title = a.title?.fi?.toLowerCase().trim();
    const abbr = a.abbreviation?.fi?.toLowerCase().trim();
    const mapped = (title && DIET_MAP[title]) || (abbr && DIET_MAP[abbr]) || title;
    if (mapped && !diets.includes(mapped)) diets.push(mapped);
  }
  return diets;
}

export async function scrapeLounastajaWeek(
  widgetId: string,
  apiKey: string,
  source: string,
): Promise<RestaurantMenu> {
  const url = `https://lounastaja.app/api/v1/widget/${apiKey}/${widgetId}`;
  const todayString = new Date().toISOString().split('T')[0];
  try {
    const res = await axios.get<LounastajaResponse>(url, { timeout: 10_000 });
    const days = res.data?.data?.week?.days ?? [];
    const items: MenuItem[] = [];
    for (const day of days) {
      if (day.isHidden) continue;
      const dayKey = day.dayName?.fi?.toLowerCase().trim() ?? '';
      const short = SHORT_DAY[dayKey] ?? '';
      const isToday = day.dateString === todayString;
      if (day.isClosed || !day.lunches?.length) continue;
      for (const lunch of day.lunches) {
        const title = lunch.title?.fi?.trim();
        if (!title) continue;
        const prefix = short ? `${short} – ` : '';
        items.push({
          name: `${prefix}${title}`,
          diets: allergensToDiets(lunch.allergens),
          today: isToday,
        });
      }
    }
    return {
      date: new Date().toISOString().split('T')[0],
      items,
      source,
    };
  } catch (error: unknown) {
    return emptyMenu(source, (error as Error).message);
  }
}
