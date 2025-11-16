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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PropertyProfile, PropertyData } from '../types/contractTypes';
import { getProperties, saveProperty, deleteProperty } from '../utils/storageManager';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const validationSchema = Yup.object().shape({
  description: Yup.string().required('Description is required'),
  street: Yup.string().required('Street is required'),
  number: Yup.string().required('Number is required'),
  zipCode: Yup.string().required('ZIP Code is required'),
  neighborhood: Yup.string().required('Neighborhood is required'),
  city: Yup.string(),
  state: Yup.string(),
});

const initialValues: PropertyData = {
  description: '',
  street: '',
  number: '',
  zipCode: '',
  neighborhood: '',
  city: '',
  state: '',
};

export default function PropertyProfilesScreen() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState<PropertyProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PropertyData | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    const data = await getProperties();
    setProperties(data);
  };

  const handleSave = async (values: PropertyData) => {
    if (editingId) {
      const profile: PropertyProfile = {
        id: editingId,
        createdAt: new Date(),
        data: values,
      };
      await saveProperty(profile);
      setEditingId(null);
      setEditingData(null);
    } else {
      const profile: PropertyProfile = {
        id: generateId(),
        createdAt: new Date(),
        data: values,
      };
      await saveProperty(profile);
    }
    loadProperties();
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('delete'), t('delete') + '?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteProperty(id);
          loadProperties();
        },
      },
    ]);
  };

  const renderPropertyItem = ({ item }: { item: PropertyProfile }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyName}>{item.data.description}</Text>
        <Text style={styles.propertyDetail}>
          {item.data.street}, {item.data.number} - {item.data.neighborhood}
        </Text>
        <Text style={styles.propertyDetail}>{item.data.zipCode}</Text>
      </View>
      <View style={styles.propertyActions}>
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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView style={styles.scrollView}>
          <Formik
            initialValues={editingData || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <View style={styles.formContainer}>
                <Text style={styles.title}>{t('addProperty')}</Text>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('property')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Casa térrea com 2 quartos"
                    value={values.description}
                    onChangeText={handleChange('description')}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('street')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Street name"
                    value={values.street}
                    onChangeText={handleChange('street')}
                  />
                  {touched.street && errors.street && (
                    <Text style={styles.errorText}>{errors.street}</Text>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={styles.section}>
                    <Text style={styles.label}>{t('number')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Number"
                      value={values.number}
                      onChangeText={handleChange('number')}
                    />
                    {touched.number && errors.number && (
                      <Text style={styles.errorText}>{errors.number}</Text>
                    )}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>{t('zipCode')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="ZIP Code"
                      value={values.zipCode}
                      onChangeText={handleChange('zipCode')}
                    />
                    {touched.zipCode && errors.zipCode && (
                      <Text style={styles.errorText}>{errors.zipCode}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>{t('neighborhood')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Neighborhood"
                    value={values.neighborhood}
                    onChangeText={handleChange('neighborhood')}
                  />
                  {touched.neighborhood && errors.neighborhood && (
                    <Text style={styles.errorText}>{errors.neighborhood}</Text>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={styles.section}>
                    <Text style={styles.label}>{t('city')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      value={values.city || ''}
                      onChangeText={handleChange('city')}
                    />
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>{t('state')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="State"
                      maxLength={2}
                      value={values.state || ''}
                      onChangeText={handleChange('state')}
                    />
                  </View>
                </View>

                <View style={styles.buttonGroup}>
                  <PrimaryButton
                    label={t('save')}
                    onPress={() => handleSubmit()}
                    icon="check"
                    style={{ flex: 1 }}
                  />
                  <SecondaryButton
                    label={t('cancel')}
                    onPress={() => {
                      setEditingId(null);
                      setEditingData(null);
                    }}
                    icon="close"
                    style={{ flex: 1, marginLeft: 12 }}
                  />
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {properties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="home-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{t('noProfiles')}</Text>
          <PrimaryButton
            label={t('addProperty')}
            onPress={() => {
              setEditingId('new');
              setEditingData(null);
            }}
            icon="home-plus"
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={properties}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.addButtonContainer}>
            <PrimaryButton
              label={t('addProperty')}
              onPress={() => {
                setEditingId('new');
                setEditingData(null);
              }}
              icon="home-plus"
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
    paddingTop: 12,
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
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
    paddingVertical: 12,
  },
  propertyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  propertyDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  propertyActions: {
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
