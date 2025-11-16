import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language || "pt");
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "pt" : "en";
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("welcome")}</Text>
      <Button
        mode="contained"
        onPress={toggleLanguage}
        style={styles.languageButton}
      >
        {t("change_language")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  languageButton: { marginTop: 10 },
});
