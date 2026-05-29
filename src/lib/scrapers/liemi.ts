import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/lie-mi/helsinki';

export async function scrapeLiemi() {
  return scrapeFromLounaatInfo(URL);
}
