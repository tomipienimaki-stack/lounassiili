import { scrapeLounastajaWeek } from './lounastaja';
import { RestaurantMenu } from './utils';

const WIDGET_ID = '49gSiQAW6ZNmM8dpGOjg';
const API_KEY = 'e08fc9fa-62d7-4309-b983-181feed999d6';
const SOURCE = 'https://www.pazzi.fi/lounas/';

export async function scrapePazzi(): Promise<RestaurantMenu> {
  return scrapeLounastajaWeek(WIDGET_ID, API_KEY, SOURCE);
}
