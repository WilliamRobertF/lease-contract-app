import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PropertyProfile, PropertyData } from '../types/contractTypes';
import { getProperties, saveProperty, deleteProperty } from '../utils/storageManager';
import { RootStackParamList, NavigationProp } from '../types/navigationTypes';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import AutocompleteInput from '../components/AutocompleteInput';
import { BRAZILIAN_CITIES, BRAZILIAN_NEIGHBORHOODS } from '../utils/constants';

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
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'PropertyProfiles'>>();
  const insets = useSafeAreaInsets();
  const [properties, setProperties] = useState<PropertyProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PropertyData | null>(null);
  const [cityStateValue, setCityStateValue] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ [key: string]: number }>({});

  const handleFocus = (section: string) => {
    const y = sectionY.current[section] || 0;
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - 20), // Scroll to top with small padding
        animated: true,
      });
    }, 100);
  };



  const loadProperties = async () => {
    const data = await getProperties();
    setProperties(data);
  };

  useEffect(() => {
    loadProperties();
    if (route.params?.returnTo) {
      setEditingId('new');
    }
  }, [route.params?.returnTo]);

  useEffect(() => {
    if (editingData) {
      if (editingData.city && editingData.state) {
        setCityStateValue(`${editingData.city}, ${editingData.state}`);
      } else {
        setCityStateValue('');
      }
    } else {
      setCityStateValue('');
    }
  }, [editingData]);

  const handleSave = async (values: PropertyData) => {
    const id = (editingId && editingId !== 'new') ? editingId : generateId();

    const profile: PropertyProfile = {
      id,
      createdAt: new Date(),
      data: values,
    };
    
    await saveProperty(profile);
    await loadProperties();

    if (route.params?.returnTo) {
      navigation.goBack();
    } else {
      setEditingId(null);
      setEditingData(null);
      setCityStateValue('');
    }
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => Keyboard.dismiss()}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={styles.scrollContentContainer}
            scrollEventThrottle={16}
          >
            <Formik
              initialValues={editingData || initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSave}
            >
            {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
              <View style={styles.formContainer}>
                <Text style={styles.title}>{t('addProperty')}</Text>

                <View 
                  style={styles.section}
                  onLayout={(e) => {
                    sectionY.current['description'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.label}>{t('property')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Casa térrea com 2 quartos"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onFocus={() => handleFocus('description')}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                <View 
                  style={styles.section}
                  onLayout={(e) => {
                    sectionY.current['street'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.label}>{t('street')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('street')}
                    value={values.street}
                    onChangeText={handleChange('street')}
                    onFocus={() => handleFocus('street')}
                  />
                  {touched.street && errors.street && (
                    <Text style={styles.errorText}>{errors.street}</Text>
                  )}
                </View>

                <View 
                  style={styles.row}
                  onLayout={(e) => {
                    const y = e.nativeEvent.layout.y;
                    sectionY.current['number'] = y;
                    sectionY.current['zipCode'] = y;
                  }}
                >
                  <View style={styles.section}>
                    <Text style={styles.label}>{t('number')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('number')}
                      value={values.number}
                      onChangeText={handleChange('number')}
                      onFocus={() => handleFocus('number')}
                    />
                    {touched.number && errors.number && (
                      <Text style={styles.errorText}>{errors.number}</Text>
                    )}
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>{t('zipCode')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('zipCode')}
                      value={values.zipCode}
                      onChangeText={handleChange('zipCode')}
                      onFocus={() => handleFocus('zipCode')}
                    />
                    {touched.zipCode && errors.zipCode && (
                      <Text style={styles.errorText}>{errors.zipCode}</Text>
                    )}
                  </View>
                </View>

                <View 
                  style={styles.section}
                  onLayout={(e) => {
                    sectionY.current['neighborhood'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.label}>{t('neighborhood')}</Text>
                  <AutocompleteInput
                    value={values.neighborhood}
                    onChangeText={handleChange('neighborhood')}
                    placeholder={t('neighborhood')}
                    suggestions={BRAZILIAN_NEIGHBORHOODS}
                    allowCustom={true}
                    onFocus={() => handleFocus('neighborhood')}
                  />
                  {touched.neighborhood && errors.neighborhood && (
                    <Text style={styles.errorText}>{errors.neighborhood}</Text>
                  )}
                </View>

                <View 
                  style={styles.section}
                  onLayout={(e) => {
                    sectionY.current['city'] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.label}>{t('city')} e Estado</Text>
                  <AutocompleteInput
                    value={cityStateValue}
                    onChangeText={(text) => {
                      setCityStateValue(text);
                      // Parse "City, State" format (state is already abbreviated)
                      const parts = text.split(',').map(p => p.trim());
                      if (parts.length >= 2) {
                        setFieldValue('city', parts[0]);
                        setFieldValue('state', parts[1]);
                      } else {
                        setFieldValue('city', text);
                        setFieldValue('state', '');
                      }
                    }}
                    placeholder={`${t('city')}, ${t('state')}`}
                    suggestions={BRAZILIAN_CITIES}
                    allowCustom={true}
                    onFocus={() => handleFocus('city')}
                  />
                </View>

                <View style={styles.buttonGroup}>
                  <SecondaryButton
                    label={t('cancel')}
                    onPress={() => {
                      setEditingId(null);
                      setEditingData(null);
                      setCityStateValue('');
                    }}
                    icon="close"
                    style={{ flex: 1 }}
                  />
                  <PrimaryButton
                    label={t('save')}
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
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <View style={[styles.addButtonContainer, { paddingBottom: insets.bottom + 12 }]}>
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
  scrollContentContainer: {
    paddingBottom: 300, // Extra space for autocomplete dropdown visibility when keyboard is open
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
    paddingVertical: 0,
    gap: 8,
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
