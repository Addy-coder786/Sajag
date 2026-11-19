import { analyzeText, FORBIDDEN_VERDICT_WORDS } from '../analyze';
import { luhnValid, maskPrivate } from '../mask';
import { inspectUrl, extractUrls } from '../urls';

// All messages below are fictional examples written for testing.

describe('masking', () => {
  it('masks OTP, Aadhaar, PAN, card, phone and UPI ID', () => {
    const { masked, types } = maskPrivate(
      'OTP is 482913. Aadhaar 2345 6789 0123, PAN ABCDE1234F, card 4111 1111 1111 1111, call 9876543210, pay to ramesh@okhdfc',
    );
    expect(masked).not.toMatch(/482913|2345 6789 0123|ABCDE1234F|4111 1111|9876543210|ramesh@okhdfc/);
    expect(types).toEqual(expect.arrayContaining(['otp', 'aadhaar', 'pan', 'card', 'phone', 'upi']));
  });

  it('checks card numbers with Luhn', () => {
    expect(luhnValid('4111111111111111')).toBe(true);
    expect(luhnValid('4111111111111112')).toBe(false);
  });

  it('masks Hindi OTP phrasing', () => {
    expect(maskPrivate('आपका ओटीपी 553201 है').masked).toContain('[OTP]');
  });
});

describe('urls', () => {
  it('extracts links and flags look-alikes', () => {
    const urls = extractUrls('Update now at http://sbi-kyc-update.xyz/login or bit.ly/abc12');
    expect(urls).toHaveLength(2);
    const f = inspectUrl(urls[0]);
    expect(f.flags).toEqual(expect.arrayContaining(['brand_lookalike', 'risky_tld', 'not_https']));
    expect(inspectUrl(urls[1]).flags).toContain('shortener');
  });

  it('does not flag official domains as look-alikes', () => {
    expect(inspectUrl('https://www.onlinesbi.sbi/').flags).not.toContain('brand_lookalike');
    expect(inspectUrl('https://cybercrime.gov.in').flags).toHaveLength(0);
  });

  it('flags apk downloads', () => {
    expect(inspectUrl('https://files.example.com/marriage-card.apk').flags).toContain('apk_download');
  });
});

describe('verdicts on scam messages', () => {
  const scams: [string, string][] = [
    ['KYC SMS', 'Dear customer your SBI account will be blocked today. Update KYC immediately at http://sbi-kyc-update.xyz'],
    ['power cut', 'Dear consumer your electricity will be disconnected tonight at 9:30 pm. Call officer 9876543210 immediately.'],
    ['digital arrest', 'This is CBI officer. A parcel with drugs was found in your name. You are under digital arrest. Do not tell anyone and do not disconnect the call.'],
    ['OTP request', 'Sir I am calling from bank, please share the OTP you received to stop the transaction'],
    ['remote app', 'To get your refund please install AnyDesk and read me the code'],
    ['QR receive', 'Congrats! Scan this QR code to receive your cashback of Rs 2000'],
    ['family emergency', 'Papa I had an accident, this is my new number, send money urgently, dont tell mummy'],
    ['investment', 'Join our VIP trading group, guaranteed returns 5% daily. Pay registration fee Rs 999.'],
    ['lottery', 'Congratulations you have won KBC lottery 25 lakh. Pay processing fee to claim your prize.'],
    ['apk invite', 'Shaadi ka card dekhiye: wedding-invite.apk'],
    ['pension', 'Your pension will stop. Update life certificate now on this link http://jeevan-update.top'],
    ['hindi OTP', 'मैं बैंक से बोल रहा हूँ, आपके फ़ोन पर आया ओटीपी बताएं'],
    ['hindi power', 'प्रिय उपभोक्ता, आज रात आपकी बिजली कट जाएगी। तुरंत इस नंबर पर कॉल करें।'],
    ['marathi power', 'प्रिय ग्राहक, आज रात्री तुमची वीज खंडित केली जाईल. लगेच संपर्क करा.'],
    ['marathi secrecy', 'हे प्रकरण गोपनीय आहे, कोणालाही सांगू नका आणि पैसे पाठवा'],
    ['hinglish', 'Aapka account block ho jayega, turant OTP batao'],
  ];

  it.each(scams)('%s → scam_signs', (_name, text) => {
    const a = analyzeText(text);
    expect(a.tier).toBe('scam_signs');
    expect(a.actions).toContain('ruko');
  });

  it('detects the Four Asks in a digital-arrest script', () => {
    const a = analyzeText(
      'You are under digital arrest. Transfer the money for verification. Do not tell anyone. Install Skype app now.',
    );
    expect(a.asks).toEqual({ money: true, code: false, app: true, secrecy: true });
  });
});

describe('verdicts on genuine messages', () => {
  const genuine: [string, string][] = [
    ['bank OTP', '482913 is your OTP for txn of INR 1,250.00 at AMAZON. Valid for 5 mins. Do not share this OTP with anyone. -HDFC Bank'],
    ['delivery OTP', 'Share OTP 4821 with the delivery associate in person at the time of delivery only. Do not share the OTP over the phone. -Amazon'],
    ['debit alert', 'Rs 500.00 debited from A/c XX1234 on 12-11-26 to VPA shop@ybl. Not you? Call 18001234567. -SBI'],
    ['family chat', 'Beta dinner is ready, come home by 8'],
    ['hindi greeting', 'नमस्ते, आज मंदिर में कीर्तन शाम 6 बजे है।'],
  ];

  it.each(genuine)('%s → not scam_signs', (_name, text) => {
    expect(analyzeText(text).tier).not.toBe('scam_signs');
  });

  it('uses the delivery-OTP exception', () => {
    const a = analyzeText(genuine[1][1]);
    expect(a.deliveryOtpException).toBe(true);
    expect(a.asks.code).toBe(false);
  });

  it('a delivery OTP asked for on a call is still a scam sign', () => {
    const a = analyzeText('Your parcel delivery is pending. Share the OTP with me over the phone to confirm address. Pay Rs 25 redelivery fee.');
    expect(a.tier).toBe('scam_signs');
  });
});

describe('verdict policy', () => {
  it('never produces a "safe" label and has exactly three tiers', () => {
    const tiers = new Set(['scam_signs', 'unsure', 'no_common_signs']);
    for (const t of ['hello', 'urgent call police', 'share otp now', '']) {
      const a = analyzeText(t);
      expect(tiers.has(a.tier)).toBe(true);
      expect(FORBIDDEN_VERDICT_WORDS.test(a.tier)).toBe(false);
    }
  });

  it('medium-only signals give "unsure"', () => {
    expect(analyzeText('Please call the bank manager urgently regarding your loan file.').tier).toBe('unsure');
  });

  it('handles empty and very long input', () => {
    expect(analyzeText('').tier).toBe('no_common_signs');
    expect(() => analyzeText('a'.repeat(100000))).not.toThrow();
  });

  it('masks private data in the output text', () => {
    const a = analyzeText('Share OTP 482913 now, my number 9876543210');
    expect(a.maskedText).not.toMatch(/482913|9876543210/);
  });
});
