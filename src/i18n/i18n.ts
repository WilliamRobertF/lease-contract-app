import i18n, { t } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from "./en.json";
import pt from "./pt.json";

const resources = {
  en: { translation: en },
  pt: { translation: pt },
};

const LANGUAGE_STORAGE_KEY = '@lease_app_language';

let deviceLanguage = 'pt';

const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      deviceLanguage = savedLanguage;
      return;
    }
  } catch (error) {
    console.error('Error reading saved language:', error);
  }

  try {
    const navLang = (typeof navigator !== 'undefined' && (navigator as any).language) ||
      (typeof Intl !== 'undefined' && Intl?.DateTimeFormat()?.resolvedOptions()?.locale);
    if (navLang) {
      deviceLanguage = String(navLang).split('-')[0];
    }
  } catch {
    deviceLanguage = 'pt';
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const saveLanguage = async (lang: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

initializeLanguage();

export default i18n;
