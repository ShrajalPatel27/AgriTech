import { createContext, useContext, useState } from 'react';

export const LANGS = { en: 'English', hi: 'हिन्दी', ta: 'தமிழ்' };

const dict = {
  en: {
    appName: 'AgriTech', dashboard: 'Dashboard', farms: 'My Farms', crops: 'Crops', soil: 'Soil Health', weather: 'Weather',
    alerts: 'Pest Alerts', shop: 'Resources Shop', consult: 'Expert Help', forum: 'Community', admin: 'Admin',
    login: 'Login', register: 'Register', logout: 'Logout', email: 'Email', password: 'Password', name: 'Name',
    phone: 'Phone', location: 'Location', add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel',
    actions: 'Actions', loading: 'Loading...', welcome: 'Welcome', noData: 'No records yet', language: 'Language',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?', demo: 'Demo accounts',
  },
  hi: {
    appName: 'एग्रीटेक', dashboard: 'डैशबोर्ड', farms: 'मेरे खेत', crops: 'फसलें', soil: 'मिट्टी स्वास्थ्य', weather: 'मौसम',
    alerts: 'कीट चेतावनी', shop: 'संसाधन दुकान', consult: 'विशेषज्ञ सलाह', forum: 'समुदाय', admin: 'एडमिन',
    login: 'लॉगिन', register: 'पंजीकरण', logout: 'लॉगआउट', email: 'ईमेल', password: 'पासवर्ड', name: 'नाम',
    phone: 'फ़ोन', location: 'स्थान', add: 'जोड़ें', edit: 'संपादित करें', delete: 'हटाएं', save: 'सहेजें', cancel: 'रद्द करें',
    actions: 'कार्रवाई', loading: 'लोड हो रहा है...', welcome: 'स्वागत है', noData: 'अभी कोई रिकॉर्ड नहीं', language: 'भाषा',
    noAccount: 'खाता नहीं है?', haveAccount: 'पहले से खाता है?', demo: 'डेमो खाते',
  },
  ta: {
    appName: 'அக்ரிடெக்', dashboard: 'டாஷ்போர்டு', farms: 'என் பண்ணைகள்', crops: 'பயிர்கள்', soil: 'மண் ஆரோக்கியம்', weather: 'வானிலை',
    alerts: 'பூச்சி எச்சரிக்கைகள்', shop: 'வளக் கடை', consult: 'நிபுணர் உதவி', forum: 'சமூகம்', admin: 'நிர்வாகி',
    login: 'உள்நுழை', register: 'பதிவு', logout: 'வெளியேறு', email: 'மின்னஞ்சல்', password: 'கடவுச்சொல்', name: 'பெயர்',
    phone: 'தொலைபேசி', location: 'இடம்', add: 'சேர்', edit: 'திருத்து', delete: 'நீக்கு', save: 'சேமி', cancel: 'ரத்து',
    actions: 'செயல்கள்', loading: 'ஏற்றுகிறது...', welcome: 'வரவேற்கிறோம்', noData: 'பதிவுகள் இல்லை', language: 'மொழி',
    noAccount: 'கணக்கு இல்லையா?', haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?', demo: 'டெமோ கணக்குகள்',
  },
};

const Ctx = createContext(null);
export const useLang = () => useContext(Ctx);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'en');
  const setLang = (l) => {
    localStorage.setItem('lang', l);
    setLangState(l);
  };
  const t = (k) => dict[lang]?.[k] ?? dict.en[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}
