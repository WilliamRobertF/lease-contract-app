import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DEFAULT_CLAUSES } from '../utils/defaultClauses';
import { saveClauses, getDefaultCity, setDefaultCity } from '../utils/storageManager';
import LanguageSelector from '../components/LanguageSelector';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [defaultCity, setDefaultCityState] = useState('Salvador, Bahia');
  const [isEditingCity, setIsEditingCity] = useState(false);

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
              await saveClauses(DEFAULT_CLAUSES);
              Alert.alert('Sucesso', t('resetSuccess'));
            } catch (error) {
              Alert.alert('Erro', t('resetError'));
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        <View style={styles.advancedSection}>
          <SettingItem
            icon={showAdvancedSettings ? "chevron-up" : "chevron-down"}
            title={t('advancedSettings')}
            onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
          />

          {showAdvancedSettings && (
            <View style={styles.advancedContent}>
              <SettingItem
                icon="map-marker"
                title={t('defaultCityForContracts')}
                description={t('defaultCityForContracts')}
                onPress={() => setIsEditingCity(!isEditingCity)}
              />
              {isEditingCity && (
                <View style={styles.cityEditContainer}>
                  <TextInput
                    style={styles.cityInput}
                    value={defaultCity}
                    onChangeText={setDefaultCityState}
                    placeholder="e.g., Salvador, Bahia"
                  />
                  <TouchableOpacity
                    style={styles.saveCityButton}
                    onPress={async () => {
                      await setDefaultCity(defaultCity);
                      setIsEditingCity(false);
                      Alert.alert('Sucesso', 'Cidade padrão atualizada');
                    }}
                  >
                    <Text style={styles.saveCityButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <SettingItem
                icon="refresh"
                title={t('resetToFactoryDefaults')}
                description={t('resetDescription')}
                onPress={handleResetFactory}
                isDangerous={true}
              />
            </View>
          )}
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
  advancedSection: {
    marginBottom: 32,
  },
  advancedContent: {
    marginTop: 8,
  },
  cityEditContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  cityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  saveCityButton: {
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveCityButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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

