import i18n, { t } from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";
import en from "./en.json";
import pt from "./pt.json";

const resources = {
  en: { translation: en },
  pt: { translation: pt },
};

i18n.use(initReactI18next).init({
  resources,
  lng: RNLocalize.getLocales()[0].languageCode || 'pt', // detecta o idioma do dispositivo
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
