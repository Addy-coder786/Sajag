import type { MaskType } from './types';

/** Luhn checksum, used to tell card numbers apart from other long digit runs. */
export function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

const PLACEHOLDER: Record<MaskType, string> = {
  otp: '[OTP]',
  aadhaar: '[AADHAAR]',
  pan: '[PAN]',
  card: '[CARD]',
  account: '[ACCOUNT]',
  phone: '[PHONE]',
  upi: '[UPI-ID]',
  email: '[EMAIL]',
};

/**
 * Replaces private identifiers with placeholders before any text leaves the phone.
 * Order matters: longer / more specific patterns run first.
 */
export function maskPrivate(input: string): { masked: string; types: MaskType[] } {
  const found = new Set<MaskType>();
  let text = input;

  const sub = (re: RegExp, type: MaskType, test?: (m: string) => boolean) => {
    text = text.replace(re, (m) => {
      if (test && !test(m)) return m;
      found.add(type);
      return PLACEHOLDER[type];
    });
  };

  // Email before UPI (both contain @)
  sub(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?/g, 'email');
  // UPI IDs: handle@bank (no dot after @)
  sub(/\b[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}\b/g, 'upi');
  // PAN: ABCDE1234F
  sub(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, 'pan');
  // Card numbers first (13-19 digits, spaces/dashes allowed, passing Luhn),
  // so a spaced card number is not half-matched as an Aadhaar number
  sub(/\b(?:\d[\s-]?){12,18}\d\b/g, 'card', (m) => luhnValid(m.replace(/[\s-]/g, '')));
  // Aadhaar: 12 digits, optionally grouped 4-4-4, first digit 2-9
  sub(/\b[2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g, 'aadhaar');
  // Indian phone numbers: optional +91/0, then 10 digits starting 6-9
  sub(/(?:\+91[\s-]?|\b0)?\b[6-9]\d{4}[\s-]?\d{5}\b/g, 'phone');
  // Remaining long digit runs (9-18 digits) are treated as account numbers
  sub(/\b\d{9,18}\b/g, 'account');
  // OTP-like codes: 4-8 digits near an OTP/code keyword (en/hi/mr)
  text = text.replace(
    /((?:otp|one[\s-]?time|code|pin|password|ओटीपी|कोड|पिन|पासवर्ड)[^\d\n]{0,25})(\d{4,8})\b/gi,
    (_m, pre: string) => {
      found.add('otp');
      return pre + PLACEHOLDER.otp;
    },
  );
  text = text.replace(/\b(\d{4,8})(\s*(?:is your|is the)\s*(?:otp|one[\s-]?time|verification))/gi, (_m, _d, post: string) => {
    found.add('otp');
    return PLACEHOLDER.otp + post;
  });

  return { masked: text, types: [...found] };
}
