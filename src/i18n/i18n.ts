import i18n, { t } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import pt from "./pt.json";

const resources = {
  en: { translation: en },
  pt: { translation: pt },
};


let deviceLanguage = 'pt';

try {
  const RNLocalize = require('react-native-localize');
  if (RNLocalize && RNLocalize.getLocales) {
    const locale = RNLocalize.getLocales()[0];
    deviceLanguage = locale?.languageCode || 'pt';
  }
} catch (error) {
  // RNLocalize not available (web or not properly installed)
  try {
    const navLang = (typeof navigator !== 'undefined' && (navigator as any).language) ||
      (typeof Intl !== 'undefined' && Intl?.DateTimeFormat()?.resolvedOptions()?.locale);
    if (navLang) {
      deviceLanguage = String(navLang).split('-')[0];
    }
  } catch {
    // ignore
  }
  console.warn('RNLocalize not available, using default locale', deviceLanguage);
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
