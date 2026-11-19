export type Lang = 'en' | 'hi' | 'mr';

/** Shared tactic list: rules, drills and explanations all use these codes. */
export type Tactic =
  | 'payment_request'
  | 'credential_request'
  | 'remote_access'
  | 'secrecy'
  | 'urgency'
  | 'authority'
  | 'too_good_to_be_true'
  | 'channel_switch'
  | 'suspicious_link';

export type Severity = 'high' | 'medium';

/** The Four Asks: what a scammer wants the victim to do. */
export type Ask = 'money' | 'code' | 'app' | 'secrecy';

/**
 * Three verdict tiers. There is deliberately no "safe" tier:
 * automated checks can never prove a message is genuine.
 */
export type Tier = 'scam_signs' | 'unsure' | 'no_common_signs';

export type Localized = Record<Lang, string>;

export interface RuleHit {
  ruleId: string;
  tactic: Tactic;
  severity: Severity;
  /** Text that triggered the rule (from the masked text), for highlighting. */
  match: string;
  title: Localized;
  explain: Localized;
}

export interface UrlFinding {
  url: string;
  host: string;
  flags: UrlFlag[];
}

export type UrlFlag =
  | 'apk_download'
  | 'shortener'
  | 'ip_address'
  | 'punycode'
  | 'risky_tld'
  | 'brand_lookalike'
  | 'not_https'
  | 'many_subdomains';

export type ActionCode =
  | 'ruko'
  | 'dont_click'
  | 'dont_share_code'
  | 'call_bank_known_number'
  | 'ask_family'
  | 'report_chakshu'
  | 'call_1930';

export interface Analysis {
  tier: Tier;
  asks: Record<Ask, boolean>;
  hits: RuleHit[];
  urls: UrlFinding[];
  maskedText: string;
  maskedTypes: MaskType[];
  actions: ActionCode[];
  /** True when a delivery-OTP pattern suppressed the code rule. */
  deliveryOtpException: boolean;
}

export type MaskType = 'otp' | 'aadhaar' | 'pan' | 'card' | 'account' | 'phone' | 'upi' | 'email';
