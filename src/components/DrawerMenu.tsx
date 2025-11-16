import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  isSubItem?: boolean;
}

export default function DrawerMenu() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(true);

  const toggleMenu = () => {
    setVisible(!visible);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'language-header',
      label: languageExpanded ? t('languageMenu') : `${t('languageMenu')} ▼`,
      icon: 'translate',
      onPress: () => setLanguageExpanded(!languageExpanded),
    },
    ...(languageExpanded
      ? [
          {
            id: 'english',
            label: t('english'),
            icon: 'circle' as keyof typeof MaterialCommunityIcons.glyphMap,
            onPress: () => handleLanguageChange('en'),
            isSubItem: true,
          },
          {
            id: 'portuguese',
            label: t('portuguese'),
            icon: 'circle' as keyof typeof MaterialCommunityIcons.glyphMap,
            onPress: () => handleLanguageChange('pt'),
            isSubItem: true,
          },
        ]
      : []),
    {
      id: 'settings',
      label: t('settings'),
      icon: 'settings' as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () => {},
    },
    {
      id: 'about',
      label: t('about'),
      icon: 'information-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      onPress: () => {},
    },
  ];

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const isLanguageActive =
      (item.id === 'english' && i18n.language === 'en') ||
      (item.id === 'portuguese' && i18n.language === 'pt');

    return (
      <TouchableOpacity
        style={[
          styles.menuItem,
          item.isSubItem && styles.subMenuItem,
          isLanguageActive && styles.activeLanguage,
        ]}
        onPress={() => {
          item.onPress();
          if (!item.isSubItem && item.id !== 'language-header') {
            setVisible(false);
          }
        }}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={isLanguageActive ? '#1976d2' : '#333'}
          style={styles.icon}
        />
        <Text
          style={[
            styles.label,
            isLanguageActive && styles.activeLabelText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

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
          <SafeAreaView
            style={styles.drawer}
          >
            <View style={styles.menuContainer}>
              <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
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
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMenuItem: {
    paddingLeft: 56,
    backgroundColor: '#f5f5f5',
  },
  activeLanguage: {
    backgroundColor: '#f0f0f0',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  activeLabelText: {
    fontWeight: '600',
    color: '#1976d2',
  },
});
