import axios from 'axios';

const TTL_MS = 60 * 60 * 1000; // 1h
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

type Entry = { at: number; data: unknown };
const cache = new Map<string, Entry>();

export async function cachedGet<T = string>(url: string, opts?: { timeoutMs?: number }): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data as T;
  }
  const res = await axios.get(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8' },
    timeout: opts?.timeoutMs ?? 10_000,
    responseType: 'text',
    transformResponse: [(d) => d],
  });
  cache.set(url, { at: Date.now(), data: res.data });
  return res.data as T;
}
