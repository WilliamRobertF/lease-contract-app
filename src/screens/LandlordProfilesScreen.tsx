import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LandlordProfile, PersonData } from '../types/contractTypes';
import { getLandlords, saveLandlord, deleteLandlord } from '../utils/storageManager';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import AutocompleteInput from '../components/AutocompleteInput';
import MaritalStatusPicker from '../components/MaritalStatusPicker';
import {
  NATIONALITIES_PT,
  NATIONALITIES_EN,
  ALL_BIRTHPLACES_PT,
  ALL_BIRTHPLACES_EN,
} from '../utils/constants';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  nationality: Yup.string().required('Nationality is required'),
  maitalStatus: Yup.string(),
  rg: Yup.string(),
  cpf: Yup.string(),
  birthplace: Yup.string(),
});

const initialValues: PersonData = {
  name: '',
  nationality: '',
  maitalStatus: '',
  rg: '',
  cpf: '',
  birthplace: '',
};

export default function LandlordProfilesScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PersonData | null>(null);

  const nationalities = i18n.language === 'pt' ? NATIONALITIES_PT : NATIONALITIES_EN;
  const birthplaces = i18n.language === 'pt' ? ALL_BIRTHPLACES_PT : ALL_BIRTHPLACES_EN;

  useEffect(() => {
    loadLandlords();
  }, []);

  const loadLandlords = async () => {
    const data = await getLandlords();
    setLandlords(data);
  };

  const handleSave = async (values: PersonData) => {
    if (editingId) {
      const profile: LandlordProfile = {
        id: editingId,
        createdAt: new Date(),
        data: values,
      };
      await saveLandlord(profile);
      setEditingId(null);
      setEditingData(null);
    } else {
      const profile: LandlordProfile = {
        id: generateId(),
        createdAt: new Date(),
        data: values,
      };
      await saveLandlord(profile);
    }
    loadLandlords();
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('deleteProfile'), t('areYouSure'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteLandlord(id);
          loadLandlords();
        },
      },
    ]);
  };

  const renderLandlordItem = ({ item }: { item: LandlordProfile }) => (
    <View style={styles.profileCard}>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.data.name}</Text>
        <Text style={styles.profileDetail}>{item.data.cpf}</Text>
      </View>
      <View style={styles.profileActions}>
        <TouchableOpacity
          onPress={() => {
            setEditingId(item.id);
            setEditingData(item.data);
          }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#1976d2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ marginLeft: 12 }}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (editingId || editingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <Formik
              initialValues={editingData || initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSave}
            >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <View style={styles.formContainer}>
                <Text style={styles.title}>{t('editLandlordProfile')}</Text>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('fullName')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('fullName')}
                    value={values.name}
                    onChangeText={handleChange('name')}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('nationality')}</Text>
                  <AutocompleteInput
                    value={values.nationality}
                    onChangeText={handleChange('nationality')}
                    placeholder={t('nationality')}
                    suggestions={nationalities}
                    allowCustom={true}
                  />
                  {touched.nationality && errors.nationality && (
                    <Text style={styles.errorText}>{errors.nationality}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('maritalStatus')}</Text>
                  <MaritalStatusPicker
                    value={values.maitalStatus}
                    onValueChange={handleChange('maitalStatus')}
                  />
                  {touched.maitalStatus && errors.maitalStatus && (
                    <Text style={styles.errorText}>{errors.maitalStatus}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>RG</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="RG"
                    value={values.rg}
                    onChangeText={handleChange('rg')}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="CPF"
                    value={values.cpf}
                    onChangeText={handleChange('cpf')}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('birthplace')}</Text>
                  <AutocompleteInput
                    value={values.birthplace}
                    onChangeText={handleChange('birthplace')}
                    placeholder={t('birthplace')}
                    suggestions={birthplaces}
                    allowCustom={true}
                  />
                  {touched.birthplace && errors.birthplace && (
                    <Text style={styles.errorText}>{errors.birthplace}</Text>
                  )}
                </View>

                <View style={styles.buttonGroup}>
                  <SecondaryButton
                    label={t('cancel')}
                    onPress={() => {
                      setEditingId(null);
                      setEditingData(null);
                    }}
                    icon="close"
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    label={t('saveProfile')}
                    onPress={() => handleSubmit()}
                    icon="check"
                    style={{ flex: 1, marginLeft: 12 }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {landlords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="folder-open" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{t('noLandlordsYet')}</Text>
          <PrimaryButton
            label={t('addLandlord')}
            onPress={() => {
              setEditingId('new');
              setEditingData(null);
            }}
            icon="account-plus"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={landlords}
            renderItem={renderLandlordItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
          <View style={[styles.addButtonContainer, { paddingBottom: insets.bottom + 12 }]}>
            <PrimaryButton
              label={t('addLandlord')}
              onPress={() => {
                setEditingId('new');
                setEditingData(null);
              }}
              icon="account-plus"
              style={{ width: '100%' }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 8,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  profileDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  profileActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
