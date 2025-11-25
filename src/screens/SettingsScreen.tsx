import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp } from '../types/navigationTypes';
import Collapsible from 'react-native-collapsible';
import { DEFAULT_CLAUSES } from '../utils/defaultClauses';
import { saveClauses } from '../utils/storageManager';
import { saveLanguage } from '../i18n/i18n';
import { useOnboarding } from '../context/OnboardingContext';
import { exportData, importData } from '../utils/backupManager';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { resetOnboarding } = useOnboarding();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleResetFactory = () => {
    Alert.alert(
      t('areYouSure'),
      t('resetConfirmMessage'),
      [
        { text: t('cancel') },
        {
          text: t('resetToFactoryDefaults'),
          onPress: async () => {
            try {
              await resetOnboarding();
            } catch (error) {
              Alert.alert('Erro', t('resetError'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExport = async () => {
    await exportData(t);
  };

  const handleImport = async () => {
    const success = await importData(t);
    // if (success) {
    // }
  };

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    isDangerous = false,
    hideChevron = false,
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress: () => void;
    isDangerous?: boolean;
    hideChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, isDangerous && styles.settingItemDangerous]}
      onPress={onPress}
    >
      <View style={styles.settingItemContent}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={isDangerous ? '#f44336' : '#1976d2'}
        />
        <View style={styles.settingItemText}>
          <Text
            style={[
              styles.settingItemTitle,
              isDangerous && styles.settingItemTitleDangerous,
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={styles.settingItemDescription}>{description}</Text>
          )}
        </View>
      </View>
      {!hideChevron && (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>

          <SettingItem
            icon={showLanguageSelector ? "chevron-up" : "chevron-down"}
            title={t('changeLanguage')}
            description={`${t('english')} / ${t('portuguese')}`}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            hideChevron={true}
          />

          <Collapsible collapsed={!showLanguageSelector} duration={300}>
            <View style={styles.collapsibleContent}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  i18n.language === 'en' && styles.languageOptionActive,
                ]}
                onPress={() => {
                  saveLanguage('en');
                }}
              >
                <MaterialCommunityIcons
                  name={i18n.language === 'en' ? 'check-circle' : 'circle-outline'}
                  size={20}
                  color={i18n.language === 'en' ? '#1976d2' : '#999'}
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
                onPress={() => {
                  saveLanguage('pt');
                }}
              >
                <MaterialCommunityIcons
                  name={i18n.language === 'pt' ? 'check-circle' : 'circle-outline'}
                  size={20}
                  color={i18n.language === 'pt' ? '#1976d2' : '#999'}
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
          </Collapsible>

          <SettingItem
            icon="file-document"
            title={t('clauses')}
            description={t('manageClausesDescription')}
            onPress={() =>
              navigation.navigate('Clauses')
            }
          />

          <SettingItem
            icon="file-multiple"
            title={t('templates')}
            description={t('manageTemplatesDescription')}
            onPress={() =>
              navigation.navigate('Templates')
            }
          />
        </View>

        <View style={styles.advancedSection}>
          <SettingItem
            icon={showAdvancedSettings ? "chevron-up" : "chevron-down"}
            title={t('advancedSettings')}
            onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
            hideChevron={true}
          />

          <Collapsible collapsed={!showAdvancedSettings} duration={300}>
            <View style={styles.collapsibleContent}>
              <SettingItem
                icon="download"
                title={t('importData')}
                description={t('importDescription')}
                onPress={handleImport}
              />
              <SettingItem
                icon="upload"
                title={t('exportData')}
                description={t('exportDescription')}
                onPress={handleExport}
              />
              <View style={styles.separator} />
              <SettingItem
                icon="refresh"
                title={t('resetToFactoryDefaults')}
                description={t('resetDescription')}
                onPress={handleResetFactory}
                isDangerous={true}
              />
            </View>
          </Collapsible>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  advancedSection: {
    marginBottom: 32,
    borderRadius: 8,
    overflow: 'hidden',
  },
  advancedContent: {
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    overflow: 'hidden',
  },
  collapsibleContent: {
    backgroundColor: '#f5f5f5',
    paddingTop: 12,
    paddingHorizontal: 16
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  advancedItem: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  settingItemDangerous: {
    backgroundColor: '#ffebee',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  settingItemTitleDangerous: {
    color: '#f44336',
  },
  settingItemDescription: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageOptionActive: {
    backgroundColor: '#f0f7ff',
    borderColor: '#1976d2',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
});

