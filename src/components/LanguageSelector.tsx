import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n/i18n';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (language: string) => {
    saveLanguage(language);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('changeLanguage')}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  i18n.language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <MaterialCommunityIcons
                  name={i18n.language === 'en' ? 'check-circle' : 'circle-outline'}
                  size={24}
                  color={i18n.language === 'en' ? '#1976d2' : '#ccc'}
                />
                <Text
                  style={[
                    styles.languageText,
                    i18n.language === 'en' && styles.languageTextActive,
                  ]}
                >
                  {t('english')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  i18n.language === 'pt' && styles.languageOptionActive,
                ]}
                onPress={() => handleLanguageChange('pt')}
              >
                <MaterialCommunityIcons
                  name={i18n.language === 'pt' ? 'check-circle' : 'circle-outline'}
                  size={24}
                  color={i18n.language === 'pt' ? '#1976d2' : '#ccc'}
                />
                <Text
                  style={[
                    styles.languageText,
                    i18n.language === 'pt' && styles.languageTextActive,
                  ]}
                >
                  {t('portuguese')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
    backgroundColor: '#f9f9f9',
  },
  languageOptionActive: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  languageText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
});
