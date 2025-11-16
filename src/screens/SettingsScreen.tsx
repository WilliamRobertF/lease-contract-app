import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DEFAULT_CLAUSES } from '../utils/defaultClauses';
import { saveClauses } from '../utils/storageManager';
import LanguageSelector from '../components/LanguageSelector';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const handleResetFactory = () => {
    Alert.alert(
      t('areYouSure'),
      'This will reset all data to factory defaults and delete all custom clauses.',
      [
        { text: t('cancel') },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await saveClauses(DEFAULT_CLAUSES);
              Alert.alert('Success', 'App has been reset to factory defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    isDangerous = false,
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress: () => void;
    isDangerous?: boolean;
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
      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>

          <SettingItem
            icon="translate"
            title={t('changeLanguage')}
            description={`${t('english')} / ${t('portuguese')}`}
            onPress={() => setShowLanguageSelector(true)}
          />

          <SettingItem
            icon="file-document"
            title={t('clauses')}
            description="Manage and create clauses"
            onPress={() =>
              (navigation as any).navigate('Clauses')
            }
          />

          <SettingItem
            icon="file-multiple"
            title={t('templates')}
            description="Manage contract templates"
            onPress={() =>
              (navigation as any).navigate('Templates')
            }
          />
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <SettingItem
            icon="refresh"
            title="Reset to Factory Defaults"
            description="Delete all data and restore default clauses"
            onPress={handleResetFactory}
            isDangerous={true}
          />
        </View>
      </ScrollView>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
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
    marginBottom: 24,
  },
  dangerSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
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
});

