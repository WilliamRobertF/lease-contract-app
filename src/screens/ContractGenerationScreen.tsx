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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { formatDate } from 'date-fns';
import { LandlordProfile, PropertyProfile, ContractTemplate, PersonData, GeneratedContract } from '../types/contractTypes';
import { getLandlords, getProperties, getTemplates, getClauses, saveGeneratedContract } from '../utils/storageManager';
import { formatContract, removeClauseTitles } from '../utils/contractFormatter';
import { exportToPDF } from '../utils/pdfExporter';

type Step = 'landlord' | 'property' | 'tenant' | 'template' | 'preview' | 'complete';

interface ContractData {
  landlord: LandlordProfile;
  property: PropertyProfile;
  tenant: PersonData;
  guarantor?: PersonData;
  hasGuarantor: boolean;
  template: ContractTemplate;
  startDate: Date;
  endDate: Date;
  monthlyRent: string;
  dueDay: number;
}

export default function ContractGenerationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [step, setStep] = useState<Step>('landlord');
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [properties, setProperties] = useState<PropertyProfile[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [clauses, setClauses] = useState<any[]>([]);
  const [formattedContract, setFormattedContract] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [contractData, setContractData] = useState<Partial<ContractData>>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    monthlyRent: '',
    dueDay: 1,
    hasGuarantor: false,
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

  const handleTenantSubmit = (tenant: PersonData, hasGuarantor: boolean, guarantor?: PersonData) => {
    setContractData({ 
      ...contractData, 
      tenant,
      hasGuarantor,
      guarantor 
    });
    setStep('template');
  };

  const handleTemplateSelect = (template: ContractTemplate) => {
    const next = { ...contractData, template } as Partial<ContractData>;
    setContractData(next);
    try {
      const full = formatContract(next, clauses);
      const cleaned = removeClauseTitles(full);
      setFormattedContract(cleaned);
    } catch (e) {
      setFormattedContract('');
    }
    setStep('preview');
  };

  const handleGenerateContract = async () => {
    if (!contractData.landlord || !contractData.property || !contractData.tenant || !contractData.template) {
      Alert.alert('Error', 'Missing contract data');
      return;
    }

    try {
      const generatedContract: GeneratedContract = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: contractData.template.id,
        landlordId: contractData.landlord.id,
        tenant: contractData.tenant,
        guarantor: contractData.guarantor,
        property: contractData.property.data,
        startDate: contractData.startDate || new Date(),
        endDate: contractData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        monthlyRent: String(contractData.monthlyRent || ''),
        dueDay: contractData.dueDay || 1,
        guaranteeInstallments: 0,
        adjustmentIndex: '',
        lateFeePercentage: 0,
        monthlyInterestPercentage: 0,
        generatedAt: new Date(),
        formattedContent: formattedContract,
      };

      await saveGeneratedContract(generatedContract);
      
      Alert.alert(t('contractGenerated'), t('contractSuccess'), [
        {
          text: 'OK',
          onPress: () => {
            setStep('complete');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save contract');
      console.error('Error generating contract:', error);
    }
  };

  const handleStartOver = () => {
    setStep('landlord');
    setContractData({
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      monthlyRent: '',
      dueDay: 1,
    });
  };

  const renderLandlordSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('selectLandlord')}</Text>
      <Text style={styles.stepSubtitle}>{t('chooseALandlordProfile')}</Text>

      {landlords.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="inbox" size={48} color="#999" />
          <Text style={styles.emptyText}>{t('noLandlordsYet')}</Text>
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
      <Text style={styles.stepSubtitle}>{t('chooseAProperty')}</Text>

      {properties.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="home-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>{t('noPropertiesYet')}</Text>
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

  const renderTenantForm = () => {
    const [hasGuarantorLocal, setHasGuarantorLocal] = useState(false);
    const [guarantorFormVisible, setGuarantorFormVisible] = useState(false);

    return (
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
          guarantorName: contractData.guarantor?.name || '',
          guarantorNationality: contractData.guarantor?.nationality || 'brasileiro(a)',
          guarantorRg: contractData.guarantor?.rg || '',
          guarantorCpf: contractData.guarantor?.cpf || '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required(t('tenantNameRequired')),
          cpf: Yup.string().required(t('cpfRequired')),
          rg: Yup.string().required(t('rgRequired')),
          nationality: Yup.string().required(t('nationalityRequired')),
          maitalStatus: Yup.string().required(t('maritalStatusRequired')),
          birthplace: Yup.string().required(t('birthplaceRequired')),
          guarantorName: hasGuarantorLocal ? Yup.string().required(t('guarantorNameRequired')) : Yup.string(),
          guarantorCpf: hasGuarantorLocal ? Yup.string().required(t('cpfRequired')) : Yup.string(),
          guarantorRg: hasGuarantorLocal ? Yup.string().required(t('rgRequired')) : Yup.string(),
        })}
        onSubmit={(values) => {
          const tenantData: PersonData = {
            name: values.name,
            nationality: values.nationality,
            maitalStatus: values.maitalStatus,
            rg: values.rg,
            cpf: values.cpf,
            birthplace: values.birthplace,
          };

          const guarantorData = hasGuarantorLocal ? {
            name: values.guarantorName,
            nationality: values.guarantorNationality,
            rg: values.guarantorRg,
            cpf: values.guarantorCpf,
            maitalStatus: '',
            birthplace: '',
          } : undefined;

          handleTenantSubmit(tenantData, hasGuarantorLocal, guarantorData);
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit, isValid }) => (
          <View style={styles.formContainer}>
            <FormField
              label={t('tenantName')}
              value={values.name}
              onChangeText={(text) => setFieldValue('name', text)}
              error={touched.name && errors.name}
            />
            <FormField
              label={t('cpf')}
              value={values.cpf}
              onChangeText={(text) => setFieldValue('cpf', text)}
              error={touched.cpf && errors.cpf}
            />
            <FormField
              label={t('rg')}
              value={values.rg}
              onChangeText={(text) => setFieldValue('rg', text)}
              error={touched.rg && errors.rg}
            />
            <FormField
              label={t('nationality')}
              value={values.nationality}
              onChangeText={(text) => setFieldValue('nationality', text)}
              error={touched.nationality && errors.nationality}
            />
            <FormField
              label={t('maritalStatus')}
              value={values.maitalStatus}
              onChangeText={(text) => setFieldValue('maitalStatus', text)}
              error={touched.maitalStatus && errors.maitalStatus}
            />
            <FormField
              label={t('birthplace')}
              value={values.birthplace}
              onChangeText={(text) => setFieldValue('birthplace', text)}
              error={touched.birthplace && errors.birthplace}
            />

            <View style={styles.formField}>
              <Text style={styles.label}>{t('startDate')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
                <Text style={styles.dateButtonText}>
                  {formatDate(contractData.startDate || new Date(), 'dd/MM/yyyy')}
                </Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={contractData.startDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowStartDatePicker(false);
                    }
                    if (selectedDate) {
                      setContractData({
                        ...contractData,
                        startDate: selectedDate,
                      });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>{t('endDate')}</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#1976d2" />
                <Text style={styles.dateButtonText}>
                  {formatDate(contractData.endDate || new Date(), 'dd/MM/yyyy')}
                </Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={contractData.endDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowEndDatePicker(false);
                    }
                    if (selectedDate) {
                      setContractData({
                        ...contractData,
                        endDate: selectedDate,
                      });
                    }
                  }}
                />
              )}
            </View>

            <FormField
              label={t('monthlyRent')}
              value={String(contractData.monthlyRent || '')}
              onChangeText={(text) =>
                setContractData({
                  ...contractData,
                  monthlyRent: text,
                })
              }
              keyboardType="default"
            />

            <FormField
              label={t('dueDay') || 'Vencimento do Aluguel'}
              value={String(contractData.dueDay || '1')}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                if (num >= 1 && num <= 31) {
                  setContractData({
                    ...contractData,
                    dueDay: num,
                  });
                }
              }}
              keyboardType="number-pad"
              placeholder="1-31"
            />

            {/* Fiador Section */}
            <View style={styles.separatorContainer}>
              <TouchableOpacity
                style={[styles.button, hasGuarantorLocal && styles.buttonActive]}
                onPress={() => {
                  setHasGuarantorLocal(!hasGuarantorLocal);
                  setGuarantorFormVisible(!hasGuarantorLocal);
                }}
              >
                <MaterialCommunityIcons
                  name={hasGuarantorLocal ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={hasGuarantorLocal ? '#1976d2' : '#999'}
                />
                <Text style={styles.buttonText}>{t('hasGuarantor')}</Text>
              </TouchableOpacity>
            </View>

            {guarantorFormVisible && (
              <View style={styles.guarantorFormContainer}>
                <Text style={styles.guarantorFormTitle}>{t('guarantor')} {t('details')}</Text>
                
                <FormField
                  label={t('guarantorName')}
                  value={values.guarantorName}
                  onChangeText={(text) => setFieldValue('guarantorName', text)}
                  error={touched.guarantorName && errors.guarantorName}
                />
                <FormField
                  label={t('cpf')}
                  value={values.guarantorCpf}
                  onChangeText={(text) => setFieldValue('guarantorCpf', text)}
                  error={touched.guarantorCpf && errors.guarantorCpf}
                />
                <FormField
                  label={t('rg')}
                  value={values.guarantorRg}
                  onChangeText={(text) => setFieldValue('guarantorRg', text)}
                  error={touched.guarantorRg && errors.guarantorRg}
                />
                <FormField
                  label={t('nationality')}
                  value={values.guarantorNationality}
                  onChangeText={(text) => setFieldValue('guarantorNationality', text)}
                />
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep('property')}>
                <Text style={styles.backButtonText}>{t('back')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !isValid && styles.submitButtonDisabled]} 
                onPress={() => handleSubmit()}
                disabled={!isValid}
              >
                <Text style={styles.submitButtonText}>{t('next') || 'Próximo'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </View>
    );
  };

  const renderTemplateSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('selectTemplate')}</Text>
      <Text style={styles.stepSubtitle}>{t('selectTemplateSubtitle')}</Text>

      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>{t('noTemplates')}</Text>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{t('preview')}</Text>

        <ScrollView style={styles.previewContent} scrollEnabled={true} keyboardShouldPersistTaps="handled">
          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>{t('contractPreview')}</Text>
            {formattedContract ? (
              <View style={styles.formattedContainer}>
                <Text style={styles.formattedText}>{formattedContract}</Text>
              </View>
            ) : (
              <Text style={styles.formattedText}>Nenhuma cláusula selecionada</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep('template')}>
            <Text style={styles.backButtonText}>{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => {
              if (formattedContract) {
                const fileName = `contrato_${contractData.tenant?.name}_${formatDate(new Date(), 'dd_MM_yyyy')}.pdf`;
                exportToPDF(formattedContract, fileName, contractData);
              }
            }}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>{t('exportPDF')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleGenerateContract}>
            <MaterialCommunityIcons name="file-check" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>{t('saveContract')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeContainer}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4caf50" />
        <Text style={styles.completeTitle}>{t('contractGenerated')}</Text>
        <Text style={styles.completeMessage}>{t('contractSuccess')}</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.submitButton} onPress={() => {
          navigation.navigate('GeneratedContracts' as never);
        }}>
          <MaterialCommunityIcons name="file-check" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>{t('viewMyContracts')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleStartOver}>
          <Text style={styles.backButtonText}>{t('createAnother')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
  formattedContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  formattedText: {
    fontSize: 13,
    color: '#222',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  docxButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2196f3',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#e3f2fd',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  separatorContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  guarantorFormContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  guarantorFormTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
