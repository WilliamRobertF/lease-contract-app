import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { saveLanguage } from "../i18n/i18n";

interface DrawerMenuProps {
  navigation?: any;
}

export default function DrawerMenu({ navigation }: DrawerMenuProps) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => {
    setVisible(!visible);
  };

  const handleLanguageChange = (language: string) => {
    saveLanguage(language);
  };

  const MenuItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        onPress();
        setVisible(false);
      }}
    >
      <MaterialCommunityIcons name={icon as any} size={22} color="#1976d2" />
      <Text style={styles.menuItemText}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
        <MaterialCommunityIcons name="menu" size={24} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <SafeAreaView style={styles.drawer}>
            <ScrollView style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuHeaderText}>{t('menuTitle')}</Text>
                <TouchableOpacity onPress={toggleMenu}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <MenuItem
                icon="home-outline"
                label={t('home')}
                onPress={() => navigation?.navigate('Home')}
              />

              <MenuItem
                icon="file-document-plus-outline"
                label={t('contractForm')}
                onPress={() => navigation?.navigate('ContractGeneration')}
              />

              <MenuItem
                icon="file-document-outline"
                label={t('generatedContracts')}
                onPress={() => navigation?.navigate('GeneratedContracts')}
              />

              <MenuItem
                icon="account-outline"
                label={t('landlordProfiles')}
                onPress={() => navigation?.navigate('LandlordProfiles')}
              />

              <MenuItem
                icon="home-outline"
                label={t('propertyProfiles')}
                onPress={() => navigation?.navigate('PropertyProfiles')}
              />

              <MenuItem
                icon="cog-outline"
                label={t('settings')}
                onPress={() => navigation?.navigate('Settings')}
              />

              <View style={styles.divider} />

              <View style={styles.languageSection}>
                <Text style={styles.languageSectionTitle}>{t('changeLanguage')}</Text>
                
                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    i18n.language === 'en' && styles.languageButtonActive
                  ]}
                  onPress={() => handleLanguageChange('en')}
                >
                  <MaterialCommunityIcons 
                    name={i18n.language === 'en' ? 'check-circle' : 'circle-outline'} 
                    size={20} 
                    color={i18n.language === 'en' ? '#1976d2' : '#999'} 
                  />
                  <Text style={[
                    styles.languageButtonText,
                    i18n.language === 'en' && styles.languageButtonTextActive
                  ]}>
                    {t('english')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    i18n.language === 'pt' && styles.languageButtonActive
                  ]}
                  onPress={() => handleLanguageChange('pt')}
                >
                  <MaterialCommunityIcons 
                    name={i18n.language === 'pt' ? 'check-circle' : 'circle-outline'} 
                    size={20} 
                    color={i18n.language === 'pt' ? '#1976d2' : '#999'} 
                  />
                  <Text style={[
                    styles.languageButtonText,
                    i18n.language === 'pt' && styles.languageButtonTextActive
                  ]}>
                    {t('portuguese')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburger: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  languageSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  languageSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 6,
    gap: 10,
  },
  languageButtonActive: {
    backgroundColor: "#f0f7ff",
  },
  languageButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  languageButtonTextActive: {
    color: "#1976d2",
    fontWeight: "600",
  },
});
