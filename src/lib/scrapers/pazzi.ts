import { scrapeFromLounaatInfo } from './lounaat-info';

const URL = 'https://www.lounaat.info/lounas/trattoria-pazzi/kangasala';

export async function scrapePazzi() {
  return scrapeFromLounaatInfo(URL);
}
