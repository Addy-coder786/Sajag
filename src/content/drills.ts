import type { Localized, Tactic } from '@/engine/types';

/**
 * Practice drills. All names, numbers and organisations are fictional.
 * Each drill has story variants with the same "ask", so booster drills test
 * the rule rather than memory of one script.
 */
export type ChoiceResult = 'safe' | 'risky' | 'next';

export interface Choice {
  label: Localized;
  result: ChoiceResult;
  feedback?: Localized;
}

export interface Step {
  line: Localized;
  choices: Choice[];
}

export interface Variant {
  id: string;
  from: Localized;
  steps: Step[];
}

export interface Drill {
  id: string;
  kind: 'call' | 'sms' | 'chat';
  tactics: Tactic[];
  title: Localized;
  lesson: Localized;
  variants: Variant[];
}

const hangUp: Choice = {
  label: { en: 'Hang up and press RUKO', hi: 'फ़ोन काटें और रुको दबाएँ', mr: 'फोन ठेवा आणि थांबा दाबा' },
  result: 'safe',
};
const askFamily: Choice = {
  label: { en: 'Stop and ask my family first', hi: 'रुककर पहले परिवार से पूछें', mr: 'थांबून आधी कुटुंबाला विचारा' },
  result: 'safe',
};
const listen: Choice = {
  label: { en: 'Keep listening', hi: 'सुनते रहें', mr: 'ऐकत राहा' },
  result: 'next',
};

export const DRILLS: Drill[] = [
  {
    id: 'digital-arrest',
    kind: 'call',
    tactics: ['authority', 'secrecy', 'payment_request'],
    title: { en: 'A "police officer" on a video call', hi: 'वीडियो कॉल पर "पुलिस अधिकारी"', mr: 'व्हिडिओ कॉलवर "पोलीस अधिकारी"' },
    lesson: {
      en: 'There is no "digital arrest" in Indian law. Real police never ask for money or secrecy on a call.',
      hi: 'भारतीय कानून में "डिजिटल अरेस्ट" नहीं है। असली पुलिस कॉल पर पैसे या गुप्तता नहीं माँगती।',
      mr: 'भारतीय कायद्यात "डिजिटल अटक" नाही. खरी पोलीस फोनवर पैसे किंवा गुपित मागत नाही.',
    },
    variants: [
      {
        id: 'parcel',
        from: { en: 'Inspector R. Verma (fictional) · +91 00000 00000', hi: 'इंस्पेक्टर आर. वर्मा (काल्पनिक) · +91 00000 00000', mr: 'इन्स्पेक्टर आर. वर्मा (काल्पनिक) · +91 00000 00000' },
        steps: [
          {
            line: {
              en: 'This is the Cyber Crime Branch. A parcel with illegal drugs was found in your name.',
              hi: 'मैं साइबर क्राइम ब्रांच से बोल रहा हूँ। आपके नाम के पार्सल में ड्रग्स मिले हैं।',
              mr: 'मी सायबर क्राइम शाखेतून बोलतोय. तुमच्या नावाच्या पार्सलमध्ये ड्रग्स सापडले आहेत.',
            },
            choices: [listen, hangUp],
          },
          {
            line: {
              en: 'You are under digital arrest. Do not tell anyone and do not cut the call.',
              hi: 'आप डिजिटल अरेस्ट में हैं। किसी को मत बताना और कॉल मत काटना।',
              mr: 'तुम्ही डिजिटल अटकेत आहात. कोणालाही सांगू नका आणि कॉल कट करू नका.',
            },
            choices: [
              { label: { en: 'Stay quiet and obey', hi: 'चुप रहकर बात मानें', mr: 'गप्प राहून ऐका' }, result: 'risky', feedback: { en: 'Asking for secrecy is a Four Asks sign. Hang up and call family.', hi: 'गुप्त रखने को कहना चार माँगों में से एक संकेत है। फ़ोन काटें, परिवार को बताएँ।', mr: 'गुपित ठेवायला सांगणे हे चार मागण्यांपैकी एक चिन्ह आहे. फोन ठेवा, कुटुंबाला सांगा.' } },
              hangUp,
            ],
          },
          {
            line: {
              en: 'Transfer your savings to this RBI "safe account" for verification. You will get it back.',
              hi: 'जाँच के लिए अपनी बचत इस RBI "सेफ़ खाते" में ट्रांसफर करें। पैसे वापस मिल जाएँगे।',
              mr: 'तपासणीसाठी तुमची बचत या RBI "सेफ खात्यात" ट्रान्सफर करा. पैसे परत मिळतील.',
            },
            choices: [
              { label: { en: 'Transfer the money', hi: 'पैसे ट्रांसफर करें', mr: 'पैसे ट्रान्सफर करा' }, result: 'risky', feedback: { en: 'No police or RBI ever asks you to move money. This is where people lose savings.', hi: 'पुलिस या RBI कभी पैसे ट्रांसफर करने को नहीं कहते। यहीं लोग अपनी बचत खोते हैं।', mr: 'पोलीस किंवा RBI कधीही पैसे ट्रान्सफर करायला सांगत नाहीत. इथेच लोक बचत गमावतात.' } },
              hangUp,
            ],
          },
        ],
      },
      {
        id: 'sim-misuse',
        from: { en: '"TRAI" automated call (fictional)', hi: '"TRAI" ऑटोमेटेड कॉल (काल्पनिक)', mr: '"TRAI" स्वयंचलित कॉल (काल्पनिक)' },
        steps: [
          {
            line: {
              en: 'Your SIM will be blocked in 2 hours due to illegal activity. Press 1 to speak to an officer.',
              hi: 'गैरकानूनी गतिविधि के कारण आपकी SIM 2 घंटे में बंद होगी। अधिकारी से बात करने के लिए 1 दबाएँ।',
              mr: 'बेकायदेशीर कारवायांमुळे तुमचे SIM 2 तासांत बंद होईल. अधिकाऱ्याशी बोलण्यासाठी 1 दाबा.',
            },
            choices: [
              { label: { en: 'Press 1', hi: '1 दबाएँ', mr: '1 दाबा' }, result: 'next' },
              hangUp,
            ],
          },
          {
            line: {
              en: 'A case is registered against your Aadhaar. Pay a security deposit and keep this confidential.',
              hi: 'आपके आधार पर केस दर्ज है। सिक्योरिटी डिपॉज़िट जमा करें और यह बात गोपनीय रखें।',
              mr: 'तुमच्या आधारवर केस नोंद आहे. सिक्युरिटी डिपॉझिट भरा आणि हे गुपित ठेवा.',
            },
            choices: [
              { label: { en: 'Pay the deposit', hi: 'डिपॉज़िट जमा करें', mr: 'डिपॉझिट भरा' }, result: 'risky', feedback: { en: 'Money plus secrecy: two of the Four Asks. TRAI never threatens to block your SIM by phone.', hi: 'पैसे और गुप्तता: चार माँगों में से दो। TRAI फ़ोन पर SIM बंद करने की धमकी नहीं देता।', mr: 'पैसे आणि गुपित: चार मागण्यांपैकी दोन. TRAI फोनवर SIM बंद करण्याची धमकी देत नाही.' } },
              askFamily,
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kyc-sms',
    kind: 'sms',
    tactics: ['urgency', 'suspicious_link', 'credential_request'],
    title: { en: '"Your account will be blocked" SMS', hi: '"खाता बंद हो जाएगा" SMS', mr: '"खाते बंद होईल" SMS' },
    lesson: {
      en: 'Banks never update KYC or bills through links in SMS. Check in your official app or branch.',
      hi: 'बैंक SMS के लिंक से KYC या बिल अपडेट नहीं करते। आधिकारिक ऐप या शाखा में जाँचें।',
      mr: 'बँका SMS मधील लिंकद्वारे KYC किंवा बिल अपडेट करत नाहीत. अधिकृत अ‍ॅप किंवा शाखेत तपासा.',
    },
    variants: [
      {
        id: 'kyc',
        from: { en: 'VK-BHRTDB (fictional Bharat Demo Bank)', hi: 'VK-BHRTDB (काल्पनिक भारत डेमो बैंक)', mr: 'VK-BHRTDB (काल्पनिक भारत डेमो बँक)' },
        steps: [
          {
            line: {
              en: 'Dear customer, your KYC has expired. Account will be blocked today. Update now: bhrt-kyc-update.xyz',
              hi: 'प्रिय ग्राहक, आपका KYC समाप्त हो गया है। खाता आज बंद होगा। अभी अपडेट करें: bhrt-kyc-update.xyz',
              mr: 'प्रिय ग्राहक, तुमचे KYC संपले आहे. खाते आज बंद होईल. आत्ता अपडेट करा: bhrt-kyc-update.xyz',
            },
            choices: [
              { label: { en: 'Open the link', hi: 'लिंक खोलें', mr: 'लिंक उघडा' }, result: 'risky', feedback: { en: 'Look at the link: a bank name inside a strange website ending (.xyz). Real banks do not send KYC links.', hi: 'लिंक देखें: अजीब वेबसाइट (.xyz) में बैंक का नाम। असली बैंक KYC लिंक नहीं भेजते।', mr: 'लिंक पाहा: विचित्र वेबसाइटमध्ये (.xyz) बँकेचे नाव. खऱ्या बँका KYC लिंक पाठवत नाहीत.' } },
              { label: { en: 'Check it in Sajag first', hi: 'पहले सजग में जाँचें', mr: 'आधी सजगमध्ये तपासा' }, result: 'safe' },
              { label: { en: 'Call the bank on the number on my card', hi: 'कार्ड पर लिखे नंबर पर बैंक को कॉल करें', mr: 'कार्डवरील नंबरवर बँकेला फोन करा' }, result: 'safe' },
            ],
          },
        ],
      },
      {
        id: 'power',
        from: { en: 'AD-POWERX (fictional)', hi: 'AD-POWERX (काल्पनिक)', mr: 'AD-POWERX (काल्पनिक)' },
        steps: [
          {
            line: {
              en: 'Dear consumer, your electricity will be disconnected tonight at 9:30 pm. Last bill not updated. Call officer +91 00000 00000.',
              hi: 'प्रिय उपभोक्ता, आज रात 9:30 बजे आपकी बिजली काटी जाएगी। पिछला बिल अपडेट नहीं है। अधिकारी को कॉल करें +91 00000 00000।',
              mr: 'प्रिय ग्राहक, आज रात्री 9:30 वाजता तुमची वीज खंडित केली जाईल. मागील बिल अपडेट नाही. अधिकाऱ्याला फोन करा +91 00000 00000.',
            },
            choices: [
              { label: { en: 'Call the "officer"', hi: '"अधिकारी" को कॉल करें', mr: '"अधिकाऱ्याला" फोन करा' }, result: 'risky', feedback: { en: 'Power companies do not ask you to call a personal mobile number. The "officer" will ask you to pay or install an app.', hi: 'बिजली कंपनियाँ निजी मोबाइल नंबर पर कॉल करने को नहीं कहतीं। "अधिकारी" पैसे या ऐप माँगेगा।', mr: 'वीज कंपन्या खासगी मोबाईल नंबरवर फोन करायला सांगत नाहीत. "अधिकारी" पैसे किंवा अ‍ॅप मागेल.' } },
              { label: { en: 'Check my bill in the official app', hi: 'आधिकारिक ऐप में बिल देखें', mr: 'अधिकृत अ‍ॅपमध्ये बिल पाहा' }, result: 'safe' },
              askFamily,
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'family-emergency',
    kind: 'chat',
    tactics: ['urgency', 'channel_switch', 'payment_request', 'secrecy'],
    title: { en: '"Papa, I am in trouble" from a new number', hi: 'नए नंबर से "पापा, मैं मुसीबत में हूँ"', mr: 'नवीन नंबरवरून "बाबा, मी अडचणीत आहे"' },
    lesson: {
      en: 'Call back on the saved number and ask for your family safe word. AI can copy voices.',
      hi: 'सेव किए नंबर पर वापस कॉल करें और परिवार का कोड-वर्ड पूछें। AI आवाज़ की नकल कर सकता है।',
      mr: 'सेव्ह केलेल्या नंबरवर परत फोन करा आणि कुटुंबाचा गुप्त शब्द विचारा. AI आवाजाची नक्कल करू शकते.',
    },
    variants: [
      {
        id: 'accident',
        from: { en: 'Unknown number · +91 00000 00000', hi: 'अनजान नंबर · +91 00000 00000', mr: 'अनोळखी नंबर · +91 00000 00000' },
        steps: [
          {
            line: {
              en: 'Papa, this is my new number. I had an accident, I am at the hospital. Please send ₹50,000 urgently. Don\'t tell Mummy.',
              hi: 'पापा, यह मेरा नया नंबर है। मेरा एक्सीडेंट हो गया, अस्पताल में हूँ। जल्दी ₹50,000 भेजो। मम्मी को मत बताना।',
              mr: 'बाबा, हा माझा नवीन नंबर आहे. माझा अपघात झाला, मी हॉस्पिटलमध्ये आहे. लगेच ₹50,000 पाठवा. आईला सांगू नका.',
            },
            choices: [
              { label: { en: 'Send the money quickly', hi: 'जल्दी पैसे भेजें', mr: 'लगेच पैसे पाठवा' }, result: 'risky', feedback: { en: 'New number + hurry + money + secrecy. Call your child on their saved number first.', hi: 'नया नंबर + जल्दबाज़ी + पैसे + गुप्तता। पहले बच्चे को सेव किए नंबर पर कॉल करें।', mr: 'नवीन नंबर + घाई + पैसे + गुपित. आधी मुलाला सेव्ह केलेल्या नंबरवर फोन करा.' } },
              { label: { en: 'Call my son on his saved number', hi: 'बेटे को सेव किए नंबर पर कॉल करें', mr: 'मुलाला सेव्ह केलेल्या नंबरवर फोन करा' }, result: 'safe' },
              { label: { en: 'Ask for our family safe word', hi: 'परिवार का कोड-वर्ड पूछें', mr: 'कुटुंबाचा गुप्त शब्द विचारा' }, result: 'safe' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'upi-qr',
    kind: 'chat',
    tactics: ['payment_request', 'too_good_to_be_true'],
    title: { en: '"Scan to receive your refund"', hi: '"रिफ़ंड पाने के लिए स्कैन करें"', mr: '"रिफंड मिळवण्यासाठी स्कॅन करा"' },
    lesson: {
      en: 'You never scan a QR code or enter your UPI PIN to receive money. The PIN only sends money out.',
      hi: 'पैसे पाने के लिए कभी QR स्कैन या UPI PIN नहीं डालना होता। PIN से सिर्फ़ पैसे जाते हैं।',
      mr: 'पैसे मिळवण्यासाठी कधीही QR स्कॅन किंवा UPI PIN टाकावा लागत नाही. PIN ने फक्त पैसे जातात.',
    },
    variants: [
      {
        id: 'refund',
        from: { en: '"Shop helpdesk" (fictional)', hi: '"दुकान हेल्पडेस्क" (काल्पनिक)', mr: '"दुकान हेल्पडेस्क" (काल्पनिक)' },
        steps: [
          {
            line: {
              en: 'Madam, your ₹2,000 refund is ready. Scan this QR code and enter your UPI PIN to receive it.',
              hi: 'मैडम, आपका ₹2,000 का रिफ़ंड तैयार है। इसे पाने के लिए यह QR स्कैन करें और UPI PIN डालें।',
              mr: 'मॅडम, तुमचा ₹2,000 चा रिफंड तयार आहे. तो मिळवण्यासाठी हा QR स्कॅन करा आणि UPI PIN टाका.',
            },
            choices: [
              { label: { en: 'Scan and enter PIN', hi: 'स्कैन करके PIN डालें', mr: 'स्कॅन करून PIN टाका' }, result: 'risky', feedback: { en: 'Entering your PIN always pays money out. You would lose ₹2,000, not receive it.', hi: 'PIN डालने से हमेशा पैसे जाते हैं। आपको ₹2,000 मिलते नहीं, कटते।', mr: 'PIN टाकल्यावर नेहमी पैसे जातात. तुम्हाला ₹2,000 मिळणार नाहीत, कापले जातील.' } },
              { label: { en: 'Refuse: I never need a PIN to receive', hi: 'मना करें: पैसे पाने के लिए PIN नहीं लगता', mr: 'नकार द्या: पैसे मिळवायला PIN लागत नाही' }, result: 'safe' },
            ],
          },
        ],
      },
    ],
  },
];

/** Simple Leitner schedule: same day, ~1 week, ~1 month, then every ~2.5 months. */
export const BOX_DAYS = [0, 7, 30, 75];

export function nextDueDays(box: number): number {
  return BOX_DAYS[Math.min(box, BOX_DAYS.length - 1)];
}
