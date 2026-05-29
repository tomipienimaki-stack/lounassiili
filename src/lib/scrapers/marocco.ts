import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/kahvila-marocco/helsinki';

export async function scrapeMarocco() {
  return scrapeFromLounaatInfo(URL);
}
