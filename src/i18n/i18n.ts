import i18n, { t } from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";
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
  console.warn('RNLocalize not available, using default locale');
}

i18n.use(initReactI18next).init({
  resources,
  lng: RNLocalize.getLocales()[0].languageCode || 'pt', // detects device language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
