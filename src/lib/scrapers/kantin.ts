import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/kantin-lunch-club/helsinki';

export async function scrapeKantin() {
  return scrapeFromLounaatInfo(URL);
}
