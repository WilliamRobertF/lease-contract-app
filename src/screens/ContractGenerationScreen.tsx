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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { formatDate } from 'date-fns';
import { LandlordProfile, ContractTemplate, ContractData, PersonData, PropertyData } from '../types/contractTypes';
import { getLandlords, getTemplates, getClauses } from '../utils/storageManager';

type Step = 'landlord' | 'template' | 'form' | 'preview' | 'complete';

export default function ContractGenerationScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('landlord');
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clauses, setClauses] = useState<any[]>([]);
  const [selectedLandlord, setSelectedLandlord] = useState<LandlordProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedClauses, setSelectedClauses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [landlordsList, templatesList, clausesList] = await Promise.all([
      getLandlords(),
      getTemplates(),
      getClauses(),
    ]);
    setLandlords(landlordsList);
    setTemplates(templatesList);
    setClauses(clausesList);
  };

  const handleLandlordSelect = (landlord: LandlordProfile) => {
    setSelectedLandlord(landlord);
    setStep('template');
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    const selectedClausesList = clauses.filter(c => template.clauseIds.includes(c.id));
    setSelectedClauses(selectedClausesList);
    setStep('form');
  };

  const handleCreateNewTemplate = () => {
    setSelectedTemplate(null);
    setSelectedClauses(clauses.filter(c => c.category === 'obligatory'));
    setStep('form');
  };

  const handleFormSubmit = (values: ContractData) => {
    // Store the generated contract data and move to preview
    setStep('preview');
  };

  const renderLandlordSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('landlordProfiles')}</Text>
      <Text style={styles.stepSubtitle}>Select a landlord or create a new contract</Text>
      
      {landlords.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="inbox" size={48} color="#999" />
          <Text style={styles.emptyText}>No landlords yet. Create one first.</Text>
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

  const renderTemplateSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Template</Text>
      <Text style={styles.stepSubtitle}>Choose a saved template or use default clauses</Text>

      <TouchableOpacity
        style={styles.newButton}
        onPress={handleCreateNewTemplate}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.newButtonText}>Use Default Clauses</Text>
      </TouchableOpacity>

      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No templates yet. Create one in Settings.</Text>
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

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setSelectedLandlord(null);
          setStep('landlord');
        }}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFormStep = () => (
    <ContractFormContent
      landlord={selectedLandlord}
      onSubmit={handleFormSubmit}
      onBack={() => setStep('template')}
    />
  );

  const renderPreview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Preview Contract</Text>
      
      <ScrollView style={styles.previewContent}>
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Landlord</Text>
          <Text style={styles.previewValue}>{selectedLandlord?.data.name}</Text>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Selected Clauses</Text>
          {selectedClauses.map(clause => (
            <View key={clause.id} style={styles.clausePreview}>
              <Text style={styles.clauseTitle}>{clause.title}</Text>
              <Text style={styles.clauseContent} numberOfLines={2}>{clause.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('form')}
        >
          <Text style={styles.backButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            Alert.alert('Success', 'Contract generated successfully!');
            setStep('complete');
          }}
        >
          <MaterialCommunityIcons name="file-export" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Generate Contract</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContainer}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4caf50" />
        <Text style={styles.completeTitle}>Contract Generated!</Text>
        <Text style={styles.completeMessage}>
          Your contract has been generated successfully.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => {
          setStep('landlord');
          setSelectedLandlord(null);
          setSelectedTemplate(null);
          setSelectedClauses([]);
        }}
      >
        <Text style={styles.submitButtonText}>Create Another</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {step === 'landlord' && renderLandlordSelection()}
        {step === 'template' && renderTemplateSelection()}
        {step === 'form' && renderFormStep()}
        {step === 'preview' && renderPreview()}
        {step === 'complete' && renderComplete()}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ContractFormContentProps {
  landlord: LandlordProfile | null;
  onSubmit: (values: ContractData) => void;
  onBack: () => void;
}

function ContractFormContent({ landlord, onSubmit, onBack }: ContractFormContentProps) {
  const { t } = useTranslation();
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const validationSchema = Yup.object().shape({
    tenant: Yup.object().shape({
      name: Yup.string().required(t('tenantNameRequired')),
      nationality: Yup.string().required('Nationality is required'),
      rg: Yup.string(),
      cpf: Yup.string().required('CPF is required'),
    }),
    property: Yup.object().shape({
      description: Yup.string().required(t('propertyDescriptionRequired')),
    }),
    startDate: Yup.date().required(t('startDateRequired')),
    endDate: Yup.date().required(t('endDateRequired')).typeError(t('endDateRequired')),
    monthlyRent: Yup.number()
      .positive(t('monthlyRentPositive'))
      .required(t('monthlyRentRequired')),
  });

  const initialValues = {
    landlord: landlord?.data || ({} as PersonData),
    tenant: { name: '', nationality: '', maitalStatus: '', rg: '', cpf: '', birthplace: '' },
    guarantor: { name: '', nationality: '', maitalStatus: '', rg: '', cpf: '', birthplace: '' },
    property: { description: '', street: '', number: '', zipCode: '', neighborhood: '' },
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    monthlyRent: 0,
    dueDay: 1,
    guaranteeInstallments: 3,
    adjustmentIndex: 'INPC',
    lateFeePercentage: 2,
    monthlyInterestPercentage: 0.1,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, setFieldValue, handleSubmit }) => (
        <ScrollView style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('tenant')}</Text>
            <FormField
              label={t('tenantName')}
              value={values.tenant.name}
              onChangeText={(text) => setFieldValue('tenant.name', text)}
              error={touched.tenant?.name && errors.tenant?.name}
            />
            <FormField
              label="CPF"
              value={values.tenant.cpf}
              onChangeText={(text) => setFieldValue('tenant.cpf', text)}
              error={touched.tenant?.cpf && errors.tenant?.cpf}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('property')}</Text>
            <FormField
              label={t('propertyDescription')}
              value={values.property.description}
              onChangeText={(text) => setFieldValue('property.description', text)}
              error={touched.property?.description && errors.property?.description}
              multiline
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('contractDates')}</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDate(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
              <Text style={styles.dateButtonText}>
                {t('startDate')}: {formatDate(values.startDate, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
            {showStartDate && (
              <DateTimePicker
                value={values.startDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartDate(false);
                  if (date) setFieldValue('startDate', date);
                }}
              />
            )}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDate(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
              <Text style={styles.dateButtonText}>
                {t('endDate')}: {formatDate(values.endDate, 'dd/MM/yyyy')}
              </Text>
            </TouchableOpacity>
            {showEndDate && (
              <DateTimePicker
                value={values.endDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndDate(false);
                  if (date) setFieldValue('endDate', date);
                }}
              />
            )}
            {errors.endDate && touched.endDate && (
              <Text style={styles.errorText}>{String(errors.endDate)}</Text>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('monthlyRent')}</Text>
            <FormField
              label={t('monthlyRent')}
              value={values.monthlyRent.toString()}
              onChangeText={(text) => setFieldValue('monthlyRent', parseFloat(text) || 0)}
              keyboardType="decimal-pad"
              error={touched.monthlyRent && errors.monthlyRent}
            />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
              <Text style={styles.submitButtonText}>Preview</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Formik>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | boolean;
  keyboardType?: 'default' | 'decimal-pad' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

function FormField({
  label,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  multiline = false,
}: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
    marginBottom: 12,
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
    marginBottom: 20,
    paddingBottom: 16,
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
    padding: 12,
    marginBottom: 8,
  },
  clauseTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clauseContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
