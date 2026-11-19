import type { Ask, Localized, Severity, Tactic } from './types';

/**
 * Rule pack v1. Every rule is labelled with the kind of guidance it rests on:
 * 'law' | 'regulator_advice' | 'practical_advice', with a source and review date,
 * so practical advice is never presented as law.
 *
 * NOTE: Hindi and Marathi strings are first drafts by the team and must be
 * reviewed by native speakers before any pilot.
 */
export interface Rule {
  id: string;
  tactic: Tactic;
  severity: Severity;
  ask?: Ask;
  patterns: RegExp[];
  /** Phrases that, when found near the match, turn it into a warning rather than a request. */
  negations?: RegExp;
  title: Localized;
  explain: Localized;
  basis: 'law' | 'regulator_advice' | 'practical_advice';
  source: string;
  reviewBy: string; // ISO date
}

const NEG_EN = /(do not|don'?t|never|not to|will never|won'?t|avoid)/i;
const NEG_HI_MR = /(मत|न करें|ना करें|नहीं|कभी न|करू नका|नका|कधीही)/;
const NEG = new RegExp(`${NEG_EN.source}|${NEG_HI_MR.source}`, 'i');

export const RULES: Rule[] = [
  // ---------------- The Four Asks ----------------
  {
    id: 'ask_code',
    tactic: 'credential_request',
    severity: 'high',
    ask: 'code',
    patterns: [
      /(share|tell|send|give|forward|read out|provide|confirm|batao|bata do|bhejo|bhej do)\W+(?:\w+\W+){0,4}(otp|pin|cvv|password|verification code|code)/i,
      /(otp|pin|cvv|password|code)\W+(?:\w+\W+){0,4}(share karo|batao|bata do|bhej do|bhejo|send it|tell me|share it)/i,
      /(ओटीपी|पिन|कोड|पासवर्ड|सीवीवी)[^।\n]{0,20}(बताएं|बताइए|बताओ|बता दो|भेजें|भेजो|शेयर करें|शेयर करो)/,
      /(ओटीपी|पिन|कोड|पासवर्ड)[^।\n]{0,20}(सांगा|पाठवा|शेअर करा|द्या)/,
    ],
    negations: NEG,
    title: { en: 'Asks for a code (OTP / PIN)', hi: 'कोड (OTP / PIN) माँगा गया', mr: 'कोड (OTP / PIN) मागितला आहे' },
    explain: {
      en: 'No genuine bank, government office or company will ever ask you for your OTP, PIN or password.',
      hi: 'कोई भी असली बैंक, सरकारी दफ़्तर या कंपनी आपसे कभी OTP, PIN या पासवर्ड नहीं माँगती।',
      mr: 'खरी बँक, सरकारी कार्यालय किंवा कंपनी तुमच्याकडे कधीही OTP, PIN किंवा पासवर्ड मागत नाही.',
    },
    basis: 'regulator_advice',
    source: 'RBI public awareness (RBI Kehta Hai); bank advisories',
    reviewBy: '2027-05-01',
  },
  {
    id: 'ask_money',
    tactic: 'payment_request',
    severity: 'medium',
    ask: 'money',
    patterns: [
      /\b(pay now|pay (?:a |the )?(?:small )?(?:fee|amount|charges?)|send money|transfer (?:the )?(?:money|amount|rs|₹)|processing fee|registration fee|clearance fee|release fee|security deposit|pay rs|pay ₹|make (?:a )?payment)/i,
      /(paise? bhejo|paisa bhejo|payment karo|fees? bharo|paise jama karo)/i,
      /(पैसे भेज|भुगतान कर|शुल्क (जमा|भर)|फीस (जमा|भर)|रुपये जमा)/,
      /(पैसे पाठवा|पैसे भरा|शुल्क भरा|फी भरा|रक्कम भरा)/,
    ],
    negations: /(never ask|will never|कभी नहीं|कधीही)/i,
    title: { en: 'Asks you to pay money', hi: 'पैसे भेजने को कहा गया', mr: 'पैसे भरायला सांगितले आहे' },
    explain: {
      en: 'Someone who contacted you is asking for money. Stop and check on a number you already trust before paying.',
      hi: 'जिसने आपसे संपर्क किया वह पैसे माँग रहा है। पैसे देने से पहले रुकें और अपने भरोसेमंद नंबर पर पुष्टि करें।',
      mr: 'ज्याने तुमच्याशी संपर्क केला तो पैसे मागत आहे. पैसे देण्याआधी थांबा आणि ओळखीच्या नंबरवर खात्री करा.',
    },
    basis: 'practical_advice',
    source: 'Team Bit Flare Four Asks rule; UK Take Five "Stop, Challenge, Protect"',
    reviewBy: '2027-05-01',
  },
  {
    id: 'ask_app',
    tactic: 'remote_access',
    severity: 'high',
    ask: 'app',
    patterns: [
      /(install|download)\W+(?:\w+\W+){0,4}(app|application|apk|software)/i,
      /(anydesk|any desk|teamviewer|team viewer|quick ?support|rustdesk|airdroid|screen ?share|screen sharing)/i,
      /app (download|install) kar/i,
      /(ऐप|एप|एप्लिकेशन|अ‍ॅप|ॲप)[^।\n]{0,15}(डाउनलोड|इंस्टॉल|इन्स्टॉल)/,
    ],
    negations: /(do not|don'?t|never|मत|न करें|करू नका)/i,
    title: { en: 'Asks you to install an app', hi: 'ऐप डाउनलोड करने को कहा गया', mr: 'अ‍ॅप डाउनलोड करायला सांगितले आहे' },
    explain: {
      en: 'Apps sent by strangers can read your messages and OTPs or control your phone. Never install an app because someone asked you to.',
      hi: 'अनजान लोगों के भेजे ऐप आपके मैसेज और OTP पढ़ सकते हैं या फ़ोन चला सकते हैं। किसी के कहने पर ऐप न डालें।',
      mr: 'अनोळखी लोकांनी पाठवलेली अ‍ॅप्स तुमचे मेसेज आणि OTP वाचू शकतात किंवा फोन ताब्यात घेऊ शकतात. कोणी सांगितले म्हणून अ‍ॅप टाकू नका.',
    },
    basis: 'regulator_advice',
    source: 'RBI and bank advisories on remote-access apps',
    reviewBy: '2027-05-01',
  },
  {
    id: 'ask_secrecy',
    tactic: 'secrecy',
    severity: 'high',
    ask: 'secrecy',
    patterns: [
      /(don'?t|do not|never) (tell|inform|share this with|discuss (this|it) with) (anyone|anybody|your family|family|bank|police)/i,
      /keep (this|it) (secret|confidential)|confidential (matter|case|investigation)/i,
      /(don'?t|do not) (disconnect|cut|end) (the|this) call/i,
      /(kisi ko (mat|na) batana|kisiko mat batao)/i,
      /(किसी को (मत|न) बता|गोपनीय रख|गुप्त रख|कॉल (मत|न) काट)/,
      /(कोणालाही सांगू नका|कोणाला सांगू नका|गुपित ठेवा|कॉल कट करू नका)/,
    ],
    title: { en: 'Asks you to keep it secret', hi: 'बात छिपाने को कहा गया', mr: 'गोष्ट लपवायला सांगितले आहे' },
    explain: {
      en: 'Scammers ask for secrecy so nobody can stop them. A genuine officer or bank never asks you to hide it from your family.',
      hi: 'ठग बात छिपाने को कहते हैं ताकि कोई उन्हें रोक न सके। असली अधिकारी या बैंक परिवार से छिपाने को कभी नहीं कहते।',
      mr: 'फसवणूक करणारे गुपित ठेवायला सांगतात म्हणजे कोणी त्यांना थांबवू नये. खरा अधिकारी किंवा बँक कुटुंबापासून लपवायला कधीच सांगत नाही.',
    },
    basis: 'practical_advice',
    source: 'MHA/I4C digital-arrest advisories; Team Bit Flare Four Asks rule',
    reviewBy: '2027-05-01',
  },

  // ---------------- India scam patterns ----------------
  {
    id: 'digital_arrest',
    tactic: 'authority',
    severity: 'high',
    patterns: [
      /(digital arrest|arrest warrant|money laundering|narcotics|drugs? (were )?(found|in your)|cbi officer|ed officer|customs officer|cyber ?crime (branch|police|cell))/i,
      /(डिजिटल अरेस्ट|गिरफ्तारी वारंट|गिरफ़्तार|मनी लॉन्ड्रिंग|ड्रग्स)/,
      /(डिजिटल अटक|अटक वॉरंट|अटक होईल)/,
    ],
    title: { en: 'Fake police / "digital arrest" threat', hi: 'नकली पुलिस / "डिजिटल अरेस्ट" की धमकी', mr: 'खोटी पोलीस / "डिजिटल अटक" धमकी' },
    explain: {
      en: 'There is no "digital arrest" in Indian law. Police, CBI or customs never settle a case on a video call or ask for money.',
      hi: 'भारतीय कानून में "डिजिटल अरेस्ट" जैसा कुछ नहीं है। पुलिस, CBI या कस्टम वीडियो कॉल पर केस नहीं निपटाते और पैसे नहीं माँगते।',
      mr: 'भारतीय कायद्यात "डिजिटल अटक" असे काही नाही. पोलीस, CBI किंवा कस्टम व्हिडिओ कॉलवर केस मिटवत नाहीत आणि पैसे मागत नाहीत.',
    },
    basis: 'regulator_advice',
    source: 'MHA / I4C advisories on digital arrest; PIB',
    reviewBy: '2027-05-01',
  },
  {
    id: 'kyc_block',
    tactic: 'urgency',
    severity: 'high',
    patterns: [
      /(kyc|pan|aadhaar|aadhar)\W+(?:\w+\W+){0,5}(update|expire|expired|pending|block|blocked|suspend|deactivat)/i,
      /(account|a\/c|card|sim|wallet)\W+(?:\w+\W+){0,4}(blocked|suspended|deactivated|closed|frozen|on hold)/i,
      /(केवाईसी|खाता (बंद|ब्लॉक)|कार्ड (बंद|ब्लॉक)|सिम (बंद|ब्लॉक))/,
      /(खाते (बंद|ब्लॉक)|कार्ड (बंद|ब्लॉक)|केवायसी)/,
    ],
    title: { en: '"Your account will be blocked" / KYC message', hi: '"खाता बंद हो जाएगा" / KYC मैसेज', mr: '"खाते बंद होईल" / KYC मेसेज' },
    explain: {
      en: 'Banks do not update KYC through links or calls. Check only through your bank branch or official app.',
      hi: 'बैंक लिंक या कॉल से KYC अपडेट नहीं करते। सिर्फ़ अपनी बैंक शाखा या आधिकारिक ऐप से जाँचें।',
      mr: 'बँका लिंक किंवा कॉलद्वारे KYC अपडेट करत नाहीत. फक्त तुमच्या बँक शाखेत किंवा अधिकृत अ‍ॅपवर तपासा.',
    },
    basis: 'regulator_advice',
    source: 'SBI and RBI advisories on KYC fraud',
    reviewBy: '2027-05-01',
  },
  {
    id: 'power_cut',
    tactic: 'urgency',
    severity: 'high',
    patterns: [
      /(electricity|power|bijli|light|connection)\W+(?:\w+\W+){0,6}(disconnect|disconnected|cut off|cutoff|will be cut|will be off)/i,
      /(बिजली|बिजली का कनेक्शन)[^।\n]{0,25}(कट|काट|बंद)/,
      /(वीज|लाईट|वीजपुरवठा)[^।\n]{0,25}(खंडित|कट|बंद)/,
    ],
    title: { en: '"Power will be cut tonight" message', hi: '"आज रात बिजली कटेगी" मैसेज', mr: '"आज रात्री वीज कापली जाईल" मेसेज' },
    explain: {
      en: 'Power companies do not threaten to cut supply by SMS and ask you to call a personal number. Pay only in the official app or office.',
      hi: 'बिजली कंपनियाँ SMS से कनेक्शन काटने की धमकी देकर निजी नंबर पर कॉल करने को नहीं कहतीं। सिर्फ़ आधिकारिक ऐप या दफ़्तर में भुगतान करें।',
      mr: 'वीज कंपन्या SMS ने वीज कापण्याची धमकी देऊन खासगी नंबरवर फोन करायला सांगत नाहीत. फक्त अधिकृत अ‍ॅप किंवा कार्यालयात बिल भरा.',
    },
    basis: 'practical_advice',
    source: 'SBI and state police advisories on electricity-bill scams',
    reviewBy: '2027-05-01',
  },
  {
    id: 'prize',
    tactic: 'too_good_to_be_true',
    severity: 'high',
    patterns: [
      /(lottery|lucky draw|you have won|you won|congratulations[^.]{0,30}won|kbc|kaun banega crorepati|prize money|cash prize|claim your (prize|reward|gift))/i,
      /(लॉटरी|इनाम जीत|आपने जीता|आप जीत गए|केबीसी|कौन बनेगा करोड़पति)/,
      /(बक्षीस|लॉटरी लागली|तुम्ही जिंकला|तुम्ही जिंकलात)/,
    ],
    title: { en: 'Prize or lottery you never entered', hi: 'बिना भाग लिए इनाम या लॉटरी', mr: 'भाग न घेता बक्षीस किंवा लॉटरी' },
    explain: {
      en: 'Real prizes never ask you to pay a fee first. If you did not enter, you did not win.',
      hi: 'असली इनाम के लिए पहले फीस नहीं देनी पड़ती। आपने भाग नहीं लिया, तो आप जीते भी नहीं।',
      mr: 'खऱ्या बक्षिसासाठी आधी शुल्क भरावे लागत नाही. तुम्ही भाग घेतला नसेल, तर तुम्ही जिंकलेले नाही.',
    },
    basis: 'practical_advice',
    source: 'I4C / state cyber police advisories on KBC lottery scams',
    reviewBy: '2027-05-01',
  },
  {
    id: 'investment',
    tactic: 'too_good_to_be_true',
    severity: 'high',
    patterns: [
      /((guaranteed|assured|fixed) (returns?|profits?|income)|double your money|\d+\s?%\s?(daily|per day|weekly|a week|monthly|per month) (returns?|profits?)|stock (market )?tips|trading (group|tips|app)|ipo allotment|vip (group|trading))/i,
      /(गारंटीड (रिटर्न|मुनाफा)|पैसा डबल|निश्चित मुनाफा|शेयर टिप्स)/,
      /(हमखास (परतावा|नफा)|पैसे दुप्पट|शेअर टिप्स)/,
    ],
    title: { en: 'Guaranteed returns / trading tips', hi: 'पक्का मुनाफा / ट्रेडिंग टिप्स', mr: 'हमखास नफा / ट्रेडिंग टिप्स' },
    explain: {
      en: 'Guaranteed returns plus a private group or app means scam. SEBI-registered firms take payments only through @valid UPI IDs, which you can check in SEBI Check.',
      hi: 'पक्का मुनाफा और प्राइवेट ग्रुप या ऐप = ठगी। SEBI-पंजीकृत कंपनियाँ सिर्फ़ @valid UPI ID से पैसे लेती हैं, जिसे SEBI Check में जाँच सकते हैं।',
      mr: 'हमखास नफा आणि खासगी ग्रुप किंवा अ‍ॅप = फसवणूक. SEBI-नोंदणीकृत कंपन्या फक्त @valid UPI ID ने पैसे घेतात, जी SEBI Check मध्ये तपासता येते.',
    },
    basis: 'regulator_advice',
    source: 'SEBI circular on validated @valid UPI IDs (11 Jun 2025); I4C advisory',
    reviewBy: '2027-05-01',
  },
  {
    id: 'receive_with_pin',
    tactic: 'payment_request',
    severity: 'high',
    patterns: [
      /((scan|enter (your )?(upi )?pin)\W+(?:\w+\W+){0,6}(receive|get|credit|claim))|((receive|get|claim) (the )?(money|refund|cashback|payment|amount)\W+(?:\w+\W+){0,6}(scan|enter (your )?(upi )?pin|approve|accept))|collect request/i,
      /(पैसे (पाने|प्राप्त करने) के लिए[^।\n]{0,20}(स्कैन|पिन))/,
      /(पैसे (मिळवण्यासाठी|मिळण्यासाठी)[^।\n]{0,20}(स्कॅन|पिन))/,
    ],
    title: { en: '"Scan / enter PIN to receive money"', hi: '"पैसे पाने के लिए स्कैन करें / PIN डालें"', mr: '"पैसे मिळवण्यासाठी स्कॅन करा / PIN टाका"' },
    explain: {
      en: 'You never scan a QR code or enter your UPI PIN to receive money. Entering the PIN always sends money out.',
      hi: 'पैसे पाने के लिए कभी QR स्कैन नहीं करना होता, न UPI PIN डालना होता है। PIN डालने से पैसे हमेशा आपके खाते से जाते हैं।',
      mr: 'पैसे मिळवण्यासाठी कधीही QR स्कॅन करावा लागत नाही किंवा UPI PIN टाकावा लागत नाही. PIN टाकल्यावर पैसे नेहमी तुमच्या खात्यातून जातात.',
    },
    basis: 'regulator_advice',
    source: 'NPCI UPI safety guidance; P2P collect requests ended 1 Oct 2025',
    reviewBy: '2027-05-01',
  },
  {
    id: 'family_emergency',
    tactic: 'urgency',
    severity: 'high',
    patterns: [
      /(papa|mummy|mom|dad|maa|beta|uncle|aunty|dadi|dada|nana|nani)\W+(?:\w+\W+){0,10}(accident|hospital|police|jail|urgent|emergency|trouble|arrested)/i,
      /(पापा|मम्मी|माँ|बेटा|दादी|नाना)[^।\n]{0,40}(एक्सीडेंट|दुर्घटना|अस्पताल|पुलिस|मुसीबत|जेल)/,
      /(बाबा|आई|मुलगा|मुलगी|आजी|आजोबा)[^।\n]{0,40}(अपघात|हॉस्पिटल|रुग्णालय|पोलीस|अडचण|तुरुंग)/,
    ],
    title: { en: 'Family emergency from a new number', hi: 'नए नंबर से परिवार की इमरजेंसी', mr: 'नवीन नंबरवरून कुटुंबाची इमर्जन्सी' },
    explain: {
      en: 'Hang up and call your relative back on the number you have saved. Ask for your family safe word. Voices can be copied by AI.',
      hi: 'फ़ोन काटें और अपने रिश्तेदार को सेव किए नंबर पर वापस कॉल करें। परिवार का कोड-वर्ड पूछें। AI से आवाज़ नकल की जा सकती है।',
      mr: 'फोन ठेवा आणि नातेवाईकाला सेव्ह केलेल्या नंबरवर परत फोन करा. कुटुंबाचा गुप्त शब्द विचारा. AI ने आवाजाची नक्कल करता येते.',
    },
    basis: 'practical_advice',
    source: 'Police advisories on AI voice-clone scams',
    reviewBy: '2027-05-01',
  },
  {
    id: 'pension',
    tactic: 'authority',
    severity: 'high',
    patterns: [
      /(life certificate|jeevan pramaan|jeevan praman|pension)\W+(?:\w+\W+){0,6}(stop|stopped|update|suspend|expire|blocked|verify|cancel)/i,
      /((जीवन प्रमाण|पेंशन)[^।\n]{0,30}(बंद|अपडेट|रुक))/,
      /((हयात|जीवन प्रमाण|पेन्शन)[^।\n]{0,30}(बंद|अपडेट|थांब))/,
    ],
    title: { en: '"Pension will stop" message', hi: '"पेंशन रुक जाएगी" मैसेज', mr: '"पेन्शन बंद होईल" मेसेज' },
    explain: {
      en: 'No agency phones pensioners to update a life certificate. Use jeevanpramaan.gov.in, your bank or the post office.',
      hi: 'कोई भी विभाग जीवन प्रमाण पत्र के लिए पेंशनर को फ़ोन नहीं करता। jeevanpramaan.gov.in, बैंक या डाकघर का उपयोग करें।',
      mr: 'हयातीच्या दाखल्यासाठी कोणताही विभाग पेन्शनधारकांना फोन करत नाही. jeevanpramaan.gov.in, बँक किंवा पोस्ट ऑफिस वापरा.',
    },
    basis: 'regulator_advice',
    source: 'CPAO advisory on Jeevan Pramaan fraud',
    reviewBy: '2027-05-01',
  },
  {
    id: 'courier',
    tactic: 'authority',
    severity: 'high',
    patterns: [
      /(parcel|courier|package|shipment|consignment)\W+(?:\w+\W+){0,8}(held|seized|customs|illegal|drugs|on hold|address (is )?(incomplete|wrong)|redeliver)/i,
      /(पार्सल[^।\n]{0,30}(रोका|जब्त|कस्टम|गैरकानूनी))/,
      /(पार्सल[^।\n]{0,30}(अडकले|जप्त|कस्टम|बेकायदेशीर))/,
    ],
    title: { en: 'Parcel held / customs message', hi: 'पार्सल रोका गया / कस्टम मैसेज', mr: 'पार्सल अडकले / कस्टम मेसेज' },
    explain: {
      en: 'Courier and customs offices do not collect money or "verify" you through links or calls. Check on the official courier website.',
      hi: 'कूरियर और कस्टम विभाग लिंक या कॉल से पैसे नहीं लेते और "जाँच" नहीं करते। आधिकारिक वेबसाइट पर जाँचें।',
      mr: 'कुरिअर आणि कस्टम विभाग लिंक किंवा कॉलद्वारे पैसे घेत नाहीत किंवा "तपासणी" करत नाहीत. अधिकृत वेबसाइटवर तपासा.',
    },
    basis: 'practical_advice',
    source: 'I4C / state police advisories on courier scams',
    reviewBy: '2027-05-01',
  },
  {
    id: 'apk_file',
    tactic: 'remote_access',
    severity: 'high',
    patterns: [/\.apk\b/i, /(एपीके|APK फ़ाइल|APK फाइल)/],
    title: { en: 'An .apk app file', hi: '.apk ऐप फ़ाइल', mr: '.apk अ‍ॅप फाइल' },
    explain: {
      en: 'A file ending in .apk is an app, not a photo, invitation or bill. Never open .apk files from chats.',
      hi: '.apk वाली फ़ाइल एक ऐप है, फ़ोटो, निमंत्रण या बिल नहीं। चैट से आई .apk फ़ाइल कभी न खोलें।',
      mr: '.apk ने संपणारी फाइल म्हणजे अ‍ॅप आहे, फोटो, निमंत्रण किंवा बिल नाही. चॅटमधून आलेली .apk फाइल कधीही उघडू नका.',
    },
    basis: 'regulator_advice',
    source: 'Rajasthan Police advisory on "marriage.apk" (PTI, Apr 2026); PM-KISAN APK warnings',
    reviewBy: '2027-05-01',
  },

  // ---------------- Medium signals ----------------
  {
    id: 'urgency',
    tactic: 'urgency',
    severity: 'medium',
    patterns: [
      /\b(urgent|urgently|immediately|within (24|12|6|2|1) ?(hours?|hrs?)|today itself|last (chance|warning|reminder)|act now|tonight|turant|abhi ke abhi)\b/i,
      /(तुरंत|अभी के अभी|आज ही|अंतिम चेतावनी|आखिरी मौका)/,
      /(त्वरित|लगेच|आजच|शेवटची संधी|शेवटची सूचना)/,
    ],
    title: { en: 'Creates hurry', hi: 'जल्दबाज़ी करवाई जा रही है', mr: 'घाई करायला लावली जात आहे' },
    explain: {
      en: 'Hurry is a trick to stop you thinking. A genuine matter can wait while you check.',
      hi: 'जल्दबाज़ी एक चाल है ताकि आप सोच न सकें। असली मामला जाँच तक रुक सकता है।',
      mr: 'घाई ही एक युक्ती आहे म्हणजे तुम्ही विचार करू नये. खरे काम तुम्ही तपासेपर्यंत थांबू शकते.',
    },
    basis: 'practical_advice',
    source: 'Kircanski et al. 2018 (arousal and scam compliance)',
    reviewBy: '2027-05-01',
  },
  {
    id: 'authority',
    tactic: 'authority',
    severity: 'medium',
    patterns: [
      /\b(police|cbi|rbi|trai|income tax|customs|court|government|bank manager|head office|officer)\b/i,
      /(पुलिस|सरकार|बैंक मैनेजर|आयकर|अधिकारी)/,
      /(पोलीस|सरकार|बँक व्यवस्थापक|आयकर|अधिकारी)/,
    ],
    title: { en: 'Uses an official-sounding name', hi: 'सरकारी या अधिकारी का नाम लिया गया', mr: 'सरकारी किंवा अधिकाऱ्याचे नाव वापरले आहे' },
    explain: {
      en: 'Scammers pretend to be police, banks or government. Check by calling the official number yourself.',
      hi: 'ठग पुलिस, बैंक या सरकार बनकर बात करते हैं। खुद आधिकारिक नंबर पर कॉल करके जाँचें।',
      mr: 'फसवणूक करणारे पोलीस, बँक किंवा सरकार असल्याचे भासवतात. स्वतः अधिकृत नंबरवर फोन करून तपासा.',
    },
    basis: 'practical_advice',
    source: 'Frontiers in Psychology 2026; CHI 2026 Chennai study',
    reviewBy: '2027-05-01',
  },
  {
    id: 'new_number',
    tactic: 'channel_switch',
    severity: 'medium',
    patterns: [
      /(this is my new number|my new number|new number hai|naya number|old number (is )?(not working|lost))/i,
      /(मेरा नया नंबर|यह मेरा नया नंबर)/,
      /(माझा नवीन नंबर|हा माझा नवीन नंबर)/,
    ],
    title: { en: '"This is my new number"', hi: '"यह मेरा नया नंबर है"', mr: '"हा माझा नवीन नंबर आहे"' },
    explain: {
      en: 'Call the person on their old saved number to confirm before you trust a new one.',
      hi: 'नए नंबर पर भरोसा करने से पहले उस व्यक्ति को पुराने सेव किए नंबर पर कॉल करें।',
      mr: 'नवीन नंबरवर विश्वास ठेवण्याआधी त्या व्यक्तीला जुन्या सेव्ह केलेल्या नंबरवर फोन करा.',
    },
    basis: 'practical_advice',
    source: 'Police advisories on WhatsApp impersonation',
    reviewBy: '2027-05-01',
  },
];

/** A genuine delivery OTP is shared in person at handover; this is the one allowed code-sharing case. */
export const DELIVERY_OTP = [
  /(delivery|deliver|order|shipment|parcel|package)[\s\S]{0,100}(otp|code)/i,
  /(otp|code)[\s\S]{0,100}(delivery (agent|associate|partner|executive|boy)|at the time of delivery|on delivery)/i,
  /(डिलीवरी|डिलिव्हरी)[^।\n]{0,60}(ओटीपी|OTP|कोड)/i,
];

/** Phrases that turn a delivery OTP back into a scam: sharing it on a call or by message. */
export const DELIVERY_OTP_ABUSE = /(over (the )?(phone|call)|on (the )?call|send (it|the otp) (to|on)|whatsapp (it|me))/i;
