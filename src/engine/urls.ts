import type { UrlFinding, UrlFlag } from './types';

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at',
  'ow.ly', 'tiny.cc', 'rebrand.ly', 'surl.li', 'v.gd', 's.id', 'shorturl.asia',
]);

// TLDs that are cheap to register and common in Indian smishing; a medium signal only.
const RISKY_TLDS = new Set([
  'xyz', 'top', 'icu', 'click', 'link', 'shop', 'online', 'site', 'live', 'buzz', 'cyou',
  'rest', 'cfd', 'sbs', 'vip', 'work', 'support', 'info', 'monster', 'quest',
]);

// Brand words that scammers put into look-alike domains (sbi-kyc-update.xyz).
const BRANDS = [
  'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara', 'paytm', 'phonepe', 'gpay',
  'googlepay', 'bhim', 'npci', 'rbi', 'uidai', 'aadhaar', 'aadhar', 'incometax', 'epfo',
  'indiapost', 'bluedart', 'fedex', 'dhl', 'amazon', 'flipkart', 'mahadiscom', 'msedcl',
  'electricity', 'kyc', 'pmkisan', 'jeevanpramaan', 'trai',
];

/** Official domains are never flagged as look-alikes (exact host or a subdomain of it). */
const OFFICIAL_SUFFIXES = [
  'gov.in', 'nic.in', 'bank.in', 'rbi.org.in', 'npci.org.in', 'onlinesbi.sbi', 'sbi.co.in',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'kotak.com', 'pnbindia.in', 'amazon.in',
  'flipkart.com', 'paytm.com', 'phonepe.com', 'indiapost.gov.in', 'uidai.gov.in',
];

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>"')]+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|xyz|top|icu|click|link|shop|online|site|live|info|apk|ly|co|me|cc|gd|io|app)(?:\/[^\s<>"')]*)?)/gi;

export function extractUrls(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(URL_RE)) {
    const u = m[1].replace(/[.,;:!?]+$/, '');
    if (u.includes('@')) continue; // emails / UPI handles are not links
    out.add(u);
  }
  return [...out];
}

export function hostOf(url: string): string {
  const withScheme = /^https?:\/\//i.test(url) ? url : 'http://' + url;
  try {
    return new URL(withScheme).hostname.toLowerCase();
  } catch {
    return url.split('/')[0].toLowerCase();
  }
}

function isOfficial(host: string): boolean {
  return OFFICIAL_SUFFIXES.some((s) => host === s || host.endsWith('.' + s));
}

/** Offline URL heuristics. These raise suspicion; they never prove a link is safe. */
export function inspectUrl(url: string): UrlFinding {
  const host = hostOf(url);
  const flags: UrlFlag[] = [];
  const lower = url.toLowerCase();

  if (/\.apk(\?|#|$)/.test(lower) || host.endsWith('.apk')) flags.push('apk_download');
  if (SHORTENERS.has(host)) flags.push('shortener');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push('ip_address');
  if (host.split('.').some((p) => p.startsWith('xn--'))) flags.push('punycode');
  const tld = host.split('.').pop() ?? '';
  if (RISKY_TLDS.has(tld)) flags.push('risky_tld');
  if (!isOfficial(host)) {
    const flat = host.replace(/[-.]/g, '');
    if (BRANDS.some((b) => flat.includes(b))) flags.push('brand_lookalike');
  }
  if (/^http:\/\//i.test(url)) flags.push('not_https');
  if (host.split('.').length > 4) flags.push('many_subdomains');

  return { url, host, flags };
}

export const STRONG_URL_FLAGS: UrlFlag[] = ['apk_download', 'ip_address', 'punycode', 'brand_lookalike'];
