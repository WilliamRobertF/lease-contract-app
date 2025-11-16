import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Menu, IconButton } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language || "pt");
  }, [i18n.language]);

  const openMenu = () => setMenuVisible(true);
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("welcome")}</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="translate"
            size={28}
            onPress={openMenu}
            mode="outlined"
            style={styles.languageIcon}
          />
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          onPress={() => changeLanguage("en")}
          title={t("english")}
          {...(currentLanguage === "en" ? { leadingIcon: "check" } : {})}
        />
        <Menu.Item
          onPress={() => changeLanguage("pt")}
          title={t("portuguese")}
          {...(currentLanguage === "pt" ? { leadingIcon: "check" } : {})}
        />
      </Menu>
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
  languageIcon: {
    marginTop: 10,
  },
  menuContent: {
    backgroundColor: "#fff",
  },
});
