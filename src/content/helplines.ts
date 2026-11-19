import type { Localized } from '@/engine/types';

/**
 * Verified helpline directory. Every entry carries its official source and the
 * date it was last checked. Re-verify all entries before each release.
 * Bank numbers are deliberately NOT listed: users call the number on their own card.
 */
export interface Helpline {
  id: string;
  name: Localized;
  when: Localized;
  phone?: string;
  url?: string;
  hours: Localized;
  source: string;
  lastVerified: string; // ISO date
}

export const HELPLINES: Helpline[] = [
  {
    id: '1930',
    name: { en: 'Cyber fraud helpline 1930', hi: 'साइबर ठगी हेल्पलाइन 1930', mr: 'सायबर फसवणूक हेल्पलाइन 1930' },
    when: { en: 'Money lost or being lost now', hi: 'पैसे गए हैं या अभी जा रहे हैं', mr: 'पैसे गेले किंवा आत्ता जात आहेत' },
    phone: '1930',
    url: 'https://cybercrime.gov.in',
    hours: { en: '24×7', hi: '24×7', mr: '24×7' },
    source: 'https://cybercrime.gov.in',
    lastVerified: '2026-11-20',
  },
  {
    id: 'chakshu',
    name: { en: 'Chakshu on Sanchar Saathi', hi: 'संचार साथी पर चक्षु', mr: 'संचार साथीवर चक्षू' },
    when: {
      en: 'Suspicious call, SMS or WhatsApp, no money lost (report within 30 days)',
      hi: 'संदिग्ध कॉल, SMS या WhatsApp, पैसे नहीं गए (30 दिन के अंदर)',
      mr: 'संशयास्पद कॉल, SMS किंवा WhatsApp, पैसे गेले नाहीत (30 दिवसांत)',
    },
    url: 'https://sancharsaathi.gov.in/sfc/',
    hours: { en: 'Online', hi: 'ऑनलाइन', mr: 'ऑनलाइन' },
    source: 'https://sancharsaathi.gov.in/sfc/',
    lastVerified: '2026-11-20',
  },
  {
    id: '1909',
    name: { en: 'Spam calls and SMS: 1909 / TRAI DND app', hi: 'स्पैम कॉल और SMS: 1909 / TRAI DND ऐप', mr: 'स्पॅम कॉल आणि SMS: 1909 / TRAI DND अ‍ॅप' },
    when: { en: 'Unwanted marketing calls or SMS (complain within 7 days)', hi: 'अनचाही मार्केटिंग कॉल या SMS (7 दिन में शिकायत)', mr: 'नको असलेले मार्केटिंग कॉल किंवा SMS (7 दिवसांत तक्रार)' },
    phone: '1909',
    hours: { en: 'Call or SMS', hi: 'कॉल या SMS', mr: 'कॉल किंवा SMS' },
    source: 'https://www.trai.gov.in/sites/default/files/2026-08/PR_No111of2026.pdf',
    lastVerified: '2026-11-20',
  },
  {
    id: 'rbi-cms',
    name: { en: 'RBI Ombudsman (cms.rbi.org.in)', hi: 'RBI लोकपाल (cms.rbi.org.in)', mr: 'RBI लोकपाल (cms.rbi.org.in)' },
    when: {
      en: 'Bank has not solved your complaint in 30 days. Helpdesk 14448 helps you file.',
      hi: 'बैंक ने 30 दिन में शिकायत हल नहीं की। हेल्पडेस्क 14448 शिकायत दर्ज करने में मदद करता है।',
      mr: 'बँकेने 30 दिवसांत तक्रार सोडवली नाही. हेल्पडेस्क 14448 तक्रार नोंदवायला मदत करतो.',
    },
    phone: '14448',
    url: 'https://cms.rbi.org.in',
    hours: { en: 'Staff 8am–10pm, Mon–Sat', hi: 'स्टाफ़ सुबह 8–रात 10, सोम–शनि', mr: 'कर्मचारी सकाळी 8–रात्री 10, सोम–शनि' },
    source: 'https://www.rbi.org.in/scripts/FAQView.aspx?Id=153',
    lastVerified: '2026-11-20',
  },
  {
    id: 'sebi-check',
    name: { en: 'SEBI Check (investment offers)', hi: 'SEBI Check (निवेश के ऑफ़र)', mr: 'SEBI Check (गुंतवणूक ऑफर)' },
    when: {
      en: 'Check the UPI ID or bank account of an investment adviser before paying. Real ones use @valid UPI IDs.',
      hi: 'भुगतान से पहले निवेश सलाहकार की UPI ID या खाता जाँचें। असली वाले @valid UPI ID इस्तेमाल करते हैं।',
      mr: 'पैसे देण्याआधी गुंतवणूक सल्लागाराचा UPI ID किंवा खाते तपासा. खरे सल्लागार @valid UPI ID वापरतात.',
    },
    url: 'https://www.sebi.gov.in/upi-verification.html',
    hours: { en: 'Online', hi: 'ऑनलाइन', mr: 'ऑनलाइन' },
    source: 'https://www.sebi.gov.in/legal/circulars/jun-2025/adoption-of-standardised-validated-and-exclusive-upi-ids-for-payment-collection-by-sebi-registered-intermediaries-from-investors_94535.html',
    lastVerified: '2026-11-20',
  },
  {
    id: 'uidai',
    name: { en: 'Aadhaar help 1947 / lock biometrics', hi: 'आधार सहायता 1947 / बायोमेट्रिक लॉक', mr: 'आधार मदत 1947 / बायोमेट्रिक लॉक' },
    when: {
      en: 'Aadhaar misuse suspected. Lock biometrics and see login history in the Aadhaar App or myAadhaar.',
      hi: 'आधार के दुरुपयोग का शक। आधार ऐप या myAadhaar पर बायोमेट्रिक लॉक करें और इतिहास देखें।',
      mr: 'आधारचा गैरवापर झाल्याचा संशय. आधार अ‍ॅप किंवा myAadhaar वर बायोमेट्रिक लॉक करा आणि इतिहास पाहा.',
    },
    phone: '1947',
    url: 'https://uidai.gov.in/en/authentication',
    hours: { en: 'Toll-free', hi: 'टोल-फ़्री', mr: 'टोल-फ्री' },
    source: 'https://uidai.gov.in/en/authentication',
    lastVerified: '2026-11-20',
  },
  {
    id: 'elderline',
    name: { en: 'Elderline 14567', hi: 'एल्डरलाइन 14567', mr: 'एल्डरलाइन 14567' },
    when: {
      en: 'Support for senior citizens, including emotional support and elder abuse',
      hi: 'वरिष्ठ नागरिकों के लिए सहायता, भावनात्मक मदद और दुर्व्यवहार सहित',
      mr: 'ज्येष्ठ नागरिकांसाठी मदत, भावनिक आधार आणि गैरवर्तनासह',
    },
    phone: '14567',
    hours: { en: '8am–8pm', hi: 'सुबह 8–रात 8', mr: 'सकाळी 8–रात्री 8' },
    source: 'https://devmosje.negd.in/schemes-and-services/elderline/',
    lastVerified: '2026-11-20',
  },
  {
    id: 'jeevan',
    name: { en: 'Jeevan Pramaan (life certificate)', hi: 'जीवन प्रमाण (जीवन प्रमाण पत्र)', mr: 'जीवन प्रमाण (हयातीचा दाखला)' },
    when: {
      en: 'Pension life certificate. Done through the portal, bank or post office, never by phone.',
      hi: 'पेंशन का जीवन प्रमाण पत्र। पोर्टल, बैंक या डाकघर से, फ़ोन पर कभी नहीं।',
      mr: 'पेन्शनचा हयातीचा दाखला. पोर्टल, बँक किंवा पोस्ट ऑफिसमधून, फोनवर कधीही नाही.',
    },
    url: 'https://jeevanpramaan.gov.in',
    hours: { en: 'Online', hi: 'ऑनलाइन', mr: 'ऑनलाइन' },
    source: 'https://jeevanpramaan.gov.in',
    lastVerified: '2026-11-20',
  },
  {
    id: '112',
    name: { en: 'Emergency 112', hi: 'आपातकाल 112', mr: 'आणीबाणी 112' },
    when: {
      en: 'You are in danger, or someone is coming to collect cash from you',
      hi: 'आप ख़तरे में हैं, या कोई आपसे नकद लेने आ रहा है',
      mr: 'तुम्ही धोक्यात आहात, किंवा कोणी तुमच्याकडून रोख घ्यायला येत आहे',
    },
    phone: '112',
    hours: { en: '24×7', hi: '24×7', mr: '24×7' },
    source: 'https://112.gov.in',
    lastVerified: '2026-11-20',
  },
];

/** RBI customer-liability rules change on 1 Jan 2027 (RBI Third Amendment Directions, 24 Jun 2026). */
export const LIABILITY_SWITCH_DATE = new Date('2027-01-01T00:00:00+05:30');

export function liabilityRuleKey(now: Date = new Date()): 'lost_rights_before' | 'lost_rights_after' {
  return now >= LIABILITY_SWITCH_DATE ? 'lost_rights_after' : 'lost_rights_before';
}
