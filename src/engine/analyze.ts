import { maskPrivate } from './mask';
import { DELIVERY_OTP, DELIVERY_OTP_ABUSE, RULES, type Rule } from './rules';
import { extractUrls, inspectUrl, STRONG_URL_FLAGS } from './urls';
import type { ActionCode, Analysis, Ask, RuleHit, Tier } from './types';

const NEG_WINDOW = 30;

/** Finds the first match of a rule that is not negated ("do not share your OTP"). */
function firstMatch(rule: Rule, text: string): string | null {
  for (const re of rule.patterns) {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of text.matchAll(global)) {
      if (rule.negations) {
        const start = Math.max(0, (m.index ?? 0) - NEG_WINDOW);
        // Only look back within the same sentence ("Do not tell anyone. Install X" is still a request)
        const before = sameSentence(text.slice(start, m.index ?? 0));
        const inside = m[0];
        if (rule.negations.test(before) || rule.negations.test(inside)) continue;
      }
      return m[0];
    }
  }
  return null;
}

function sameSentence(before: string): string {
  const cut = Math.max(before.lastIndexOf('.'), before.lastIndexOf('!'), before.lastIndexOf('?'), before.lastIndexOf('।'), before.lastIndexOf('\n'));
  return cut >= 0 ? before.slice(cut + 1) : before;
}

function negatedNearby(text: string, re: RegExp): boolean {
  const m = re.exec(text);
  if (!m) return true; // nothing to negate
  const before = sameSentence(text.slice(Math.max(0, m.index - NEG_WINDOW), m.index));
  return /(do not|don'?t|never|not)\s*(share|give|tell)?[\s\w]*$/i.test(before);
}

export interface AnalyzeOptions {
  /** Rules to skip, e.g. for A/B testing. */
  disabledRules?: string[];
}

/**
 * Offline analysis. Deterministic rules set the minimum risk tier; any later
 * cloud explanation may raise the tier but never lower it.
 */
export function analyzeText(input: string, opts: AnalyzeOptions = {}): Analysis {
  const raw = (input ?? '').normalize('NFC').replace(/​/g, '').slice(0, 5000);
  const { masked, types } = maskPrivate(raw);

  // Rules run on the original (unmasked) text so number-based cues still work,
  // but the stored match is taken from the masked text where possible.
  const hits: RuleHit[] = [];
  for (const rule of RULES) {
    if (opts.disabledRules?.includes(rule.id)) continue;
    const m = firstMatch(rule, raw);
    if (m) {
      hits.push({
        ruleId: rule.id,
        tactic: rule.tactic,
        severity: rule.severity,
        match: maskPrivate(m).masked,
        title: rule.title,
        explain: rule.explain,
      });
    }
  }

  // Delivery-OTP exception: an OTP shared in person at handover is genuine.
  const isDeliveryOtp = DELIVERY_OTP.some((re) => re.test(raw));
  const abuse = DELIVERY_OTP_ABUSE.test(raw) && !negatedNearby(raw, DELIVERY_OTP_ABUSE);
  const otherAsks = hits.some((h) => ['ask_money', 'ask_app', 'ask_secrecy'].includes(h.ruleId));
  let deliveryOtpException = false;
  if (isDeliveryOtp && !abuse && !otherAsks) {
    const idx = hits.findIndex((h) => h.ruleId === 'ask_code');
    if (idx >= 0) {
      hits.splice(idx, 1);
      deliveryOtpException = true;
    }
  }

  const urls = extractUrls(raw).map(inspectUrl);

  const asks: Record<Ask, boolean> = { money: false, code: false, app: false, secrecy: false };
  for (const h of hits) {
    const rule = RULES.find((r) => r.id === h.ruleId);
    if (rule?.ask) asks[rule.ask] = true;
  }
  if (urls.some((u) => u.flags.includes('apk_download'))) asks.app = true;

  const askCount = Object.values(asks).filter(Boolean).length;
  const strongRule = hits.some((h) => h.severity === 'high');
  const strongUrl = urls.some((u) => u.flags.some((f) => STRONG_URL_FLAGS.includes(f)));
  const anyUrlFlag = urls.some((u) => u.flags.length > 0);

  let tier: Tier;
  if (strongRule || strongUrl || askCount >= 2) tier = 'scam_signs';
  else if (hits.length > 0 || anyUrlFlag) tier = 'unsure';
  else tier = 'no_common_signs';

  return {
    tier,
    asks,
    hits: sortHits(hits),
    urls,
    maskedText: masked,
    maskedTypes: types,
    actions: actionsFor(tier, asks, hits, urls.length > 0),
    deliveryOtpException,
  };
}

function sortHits(hits: RuleHit[]): RuleHit[] {
  const sev = (h: RuleHit) => (h.severity === 'high' ? 0 : 1);
  const ask = (h: RuleHit) => (h.ruleId.startsWith('ask_') ? 0 : 1);
  return [...hits].sort((a, b) => sev(a) - sev(b) || ask(b) - ask(a));
}

function actionsFor(tier: Tier, asks: Record<Ask, boolean>, hits: RuleHit[], hasUrl: boolean): ActionCode[] {
  if (tier === 'no_common_signs') return ['ruko'];
  const out: ActionCode[] = ['ruko'];
  if (asks.code) out.push('dont_share_code');
  if (hasUrl || asks.app) out.push('dont_click');
  const bankish = hits.some((h) => ['kyc_block', 'ask_code', 'receive_with_pin', 'pension'].includes(h.ruleId));
  if (bankish || tier === 'unsure') out.push('call_bank_known_number');
  out.push('ask_family');
  if (tier === 'scam_signs') out.push('report_chakshu', 'call_1930');
  return out;
}

/** Words that must never appear in a verdict label in any language. */
export const FORBIDDEN_VERDICT_WORDS = /(\bsafe\b|सुरक्षित|सेफ)/i;
