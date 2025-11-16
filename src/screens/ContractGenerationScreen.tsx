import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { formatDate } from 'date-fns';
import { LandlordProfile, PropertyProfile, ContractTemplate, PersonData } from '../types/contractTypes';
import { getLandlords, getProperties, getTemplates, getClauses } from '../utils/storageManager';

type Step = 'landlord' | 'property' | 'tenant' | 'template' | 'preview' | 'complete';

interface ContractData {
  landlord: LandlordProfile;
  property: PropertyProfile;
  tenant: PersonData;
  template: ContractTemplate;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  dueDay: number;
}

export default function ContractGenerationScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('landlord');
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [properties, setProperties] = useState<PropertyProfile[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clauses, setClauses] = useState<any[]>([]);
  const [contractData, setContractData] = useState<Partial<ContractData>>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    monthlyRent: 0,
    dueDay: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [landlordsList, propertiesList, templatesList, clausesList] = await Promise.all([
      getLandlords(),
      getProperties(),
      getTemplates(),
      getClauses(),
    ]);
    setLandlords(landlordsList);
    setProperties(propertiesList);
    setTemplates(templatesList);
    setClauses(clausesList);
  };

  const handleLandlordSelect = (landlord: LandlordProfile) => {
    setContractData({ ...contractData, landlord });
    setStep('property');
  };

  const handlePropertySelect = (property: PropertyProfile) => {
    setContractData({ ...contractData, property });
    setStep('tenant');
  };

  const handleTenantSubmit = (tenant: PersonData) => {
    setContractData({ ...contractData, tenant });
    setStep('template');
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setContractData({ ...contractData, template });
    setStep('preview');
  };

  const handleGenerateContract = () => {
    Alert.alert('Success', 'Contract generated successfully!', [
      {
        text: 'OK',
        onPress: () => {
          setStep('complete');
        },
      },
    ]);
  };

  const handleStartOver = () => {
    setStep('landlord');
    setContractData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      monthlyRent: 0,
      dueDay: 1,
    });
  };

  const renderLandlordSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('selectLandlord')}</Text>
      <Text style={styles.stepSubtitle}>Choose a landlord profile</Text>

      {landlords.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="inbox" size={48} color="#999" />
          <Text style={styles.emptyText}>No landlords yet</Text>
        </View>
      ) : (
        <FlatList
          data={landlords}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleLandlordSelect(item)}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.data.name}</Text>
                <Text style={styles.itemDetail}>{item.data.cpf}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  const renderPropertySelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('selectProperty')}</Text>
      <Text style={styles.stepSubtitle}>Choose a property</Text>

      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="home-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No properties yet</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handlePropertySelect(item)}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.data.description}</Text>
                <Text style={styles.itemDetail}>
                  {item.data.street}, {item.data.number}
                </Text>
                <Text style={styles.itemDetail}>{item.data.zipCode}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => setStep('landlord')}>
        <Text style={styles.backButtonText}>{t('back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTenantForm = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('fillTenantData')}</Text>

      <Formik
        initialValues={{
          name: '',
          nationality: '',
          maitalStatus: '',
          rg: '',
          cpf: '',
          birthplace: '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(t('tenantNameRequired')),
          cpf: Yup.string().required('CPF required'),
        })}
        onSubmit={(values) => handleTenantSubmit(values)}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View style={styles.formContainer}>
            <FormField
              label={t('tenantName')}
              value={values.name}
              onChangeText={(text) => setFieldValue('name', text)}
              error={touched.name && errors.name}
            />
            <FormField
              label="CPF"
              value={values.cpf}
              onChangeText={(text) => setFieldValue('cpf', text)}
              error={touched.cpf && errors.cpf}
            />
            <FormField
              label="RG"
              value={values.rg}
              onChangeText={(text) => setFieldValue('rg', text)}
            />
            <FormField
              label="Nationality"
              value={values.nationality}
              onChangeText={(text) => setFieldValue('nationality', text)}
            />

            <View style={styles.formField}>
              <Text style={styles.label}>{t('startDate')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  // Date picker would go here
                }}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
                <Text style={styles.dateButtonText}>
                  {formatDate(contractData.startDate || new Date(), 'dd/MM/yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>{t('endDate')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  // Date picker would go here
                }}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
                <Text style={styles.dateButtonText}>
                  {formatDate(contractData.endDate || new Date(), 'dd/MM/yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <FormField
              label={t('monthlyRent')}
              value={String(contractData.monthlyRent || '')}
              onChangeText={(text) =>
                setContractData({
                  ...contractData,
                  monthlyRent: parseFloat(text) || 0,
                })
              }
              keyboardType="decimal-pad"
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep('property')}>
                <Text style={styles.backButtonText}>{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
                <Text style={styles.submitButtonText}>{t('generateContract')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );

  const renderTemplateSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Template</Text>
      <Text style={styles.stepSubtitle}>Choose contract clauses template</Text>

      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No templates yet</Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleTemplateSelect(item)}
            >
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetail}>{item.clauseIds.length} clauses</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => setStep('tenant')}>
        <Text style={styles.backButtonText}>{t('back')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('preview')}</Text>

      <ScrollView style={styles.previewContent}>
        <PreviewSection title={t('landlord')} value={contractData.landlord?.data.name} />
        <PreviewSection title={t('property')} value={contractData.property?.data.description} />
        <PreviewSection title={t('tenantName')} value={contractData.tenant?.name} />
        <PreviewSection
          title={t('startDate')}
          value={formatDate(contractData.startDate || new Date(), 'dd/MM/yyyy')}
        />
        <PreviewSection
          title={t('endDate')}
          value={formatDate(contractData.endDate || new Date(), 'dd/MM/yyyy')}
        />
        <PreviewSection title={t('monthlyRent')} value={`R$ ${contractData.monthlyRent}`} />

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Clauses ({contractData.template?.clauseIds.length})</Text>
          {contractData.template?.clauseIds.map((clauseId) => {
            const clause = clauses.find((c) => c.id === clauseId);
            return clause ? (
              <View key={clauseId} style={styles.clausePreview}>
                <Text style={styles.clauseTitle}>{clause.title}</Text>
              </View>
            ) : null;
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('template')}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleGenerateContract}>
          <MaterialCommunityIcons name="file-export" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>{t('generate')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContainer}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4caf50" />
        <Text style={styles.completeTitle}>{t('contractGenerated')}</Text>
        <Text style={styles.completeMessage}>{t('contractSuccess')}</Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleStartOver}>
        <Text style={styles.submitButtonText}>{t('createAnother')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {step === 'landlord' && renderLandlordSelection()}
        {step === 'property' && renderPropertySelection()}
        {step === 'tenant' && renderTenantForm()}
        {step === 'template' && renderTemplateSelection()}
        {step === 'preview' && renderPreview()}
        {step === 'complete' && renderComplete()}
      </ScrollView>
    </SafeAreaView>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'email-address' | 'phone-pad';
}

function FormField({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
}: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function PreviewSection({ title, value }: { title: string; value?: string }) {
  return (
    <View style={styles.previewSection}>
      <Text style={styles.previewLabel}>{title}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
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
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemDetail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
  },
  formField: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  previewContent: {
    marginBottom: 16,
  },
  previewSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  previewValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  clausePreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  clauseTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  completeContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  completeMessage: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
