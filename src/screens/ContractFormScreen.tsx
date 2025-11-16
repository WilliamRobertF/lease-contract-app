import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ContractData } from '../types/contractTypes';
import { format } from 'date-fns';
import PrimaryButton from '../components/PrimaryButton';

const validationSchema = Yup.object().shape({
  landlord: Yup.object().shape({
    name: Yup.string().required('Landlord name is required'),
  }),
  tenant: Yup.object().shape({
    name: Yup.string().required('Tenant name is required'),
  }),
  property: Yup.object().shape({
    description: Yup.string().required('Property description is required'),
  }),
  startDate: Yup.date()
    .required('Start date is required')
    .typeError('Start date must be a valid date'),
  endDate: Yup.date()
    .required('End date is required')
    .typeError('End date must be a valid date')
    .min(
      Yup.ref('startDate'),
      'End date must be after start date'
    ),
  monthlyRent: Yup.string()
    .required('Monthly rent is required')
    .test('positive', 'Monthly rent must be greater than 0', function(value) {
      if (!value) return false;
      const num = parseFloat(value.replace(',', '.'));
      return num > 0;
    }),
  dueDay: Yup.string(),
});

const initialValues: ContractData = {
  landlord: {
    name: '',
    nationality: '',
    maitalStatus: '',
    rg: '',
    cpf: '',
    birthplace: '',
  },
  tenant: {
    name: '',
    nationality: '',
    maitalStatus: '',
    rg: '',
    cpf: '',
    birthplace: '',
  },
  property: {
    description: '',
    street: '',
    number: '',
    zipCode: '',
    neighborhood: '',
  },
  startDate: new Date(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  monthlyRent: '',
  dueDay: '01',
  contractLocation: '',
  guaranteeInstallments: 0,
  adjustmentIndex: '',
  lateFeePercentage: 0,
  monthlyInterestPercentage: 0,
  hasGuarantor: false,
  guarantor: undefined,
};

export default function ContractFormScreen() {
  const { t } = useTranslation();
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      return selectedDate;
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      return selectedDate;
    }
  };

  const handleGenerateContract = (values: ContractData) => {
    console.log(values);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleGenerateContract}
          >
            {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
              <View style={styles.formContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('landlord')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.landlord?.name && errors.landlord?.name
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder={t('landlordName')}
                    value={values.landlord.name}
                    onChangeText={(text) =>
                      setFieldValue('landlord.name', text)
                    }
                  />
                  {touched.landlord?.name && errors.landlord?.name && (
                    <Text style={styles.errorText}>{errors.landlord.name}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('tenant')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.tenant?.name && errors.tenant?.name
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder={t('tenantName')}
                    value={values.tenant.name}
                    onChangeText={(text) => setFieldValue('tenant.name', text)}
                  />
                  {touched.tenant?.name && errors.tenant?.name && (
                    <Text style={styles.errorText}>{errors.tenant.name}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('property')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.property?.description && errors.property?.description
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder={t('propertyDescription')}
                    value={values.property.description}
                    onChangeText={(text) =>
                      setFieldValue('property.description', text)
                    }
                    multiline
                    numberOfLines={3}
                  />
                  {touched.property?.description && errors.property?.description && (
                    <Text style={styles.errorText}>{errors.property.description}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('contractDates')}</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      touched.startDate && errors.startDate
                        ? styles.dateButtonError
                        : undefined,
                    ]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {t('startDate')}: {format(values.startDate, 'MM/dd/yyyy')}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={values.startDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        const date = handleStartDateChange(event, selectedDate);
                        if (date) {
                          setFieldValue('startDate', date);
                        }
                        if (Platform.OS === 'ios') {
                          setShowStartDatePicker(false);
                        }
                      }}
                    />
                  )}
                  {touched.startDate && errors.startDate && (
                    <Text style={styles.errorText}>
                      {typeof errors.startDate === 'string' ? errors.startDate : 'Invalid start date'}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      touched.endDate && errors.endDate
                        ? styles.dateButtonError
                        : undefined,
                    ]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {t('endDate')}: {format(values.endDate, 'MM/dd/yyyy')}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={values.endDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        const date = handleEndDateChange(event, selectedDate);
                        if (date) {
                          setFieldValue('endDate', date);
                        }
                        if (Platform.OS === 'ios') {
                          setShowEndDatePicker(false);
                        }
                      }}
                    />
                  )}
                  {touched.endDate && errors.endDate && (
                    <Text style={styles.errorText}>
                      {typeof errors.endDate === 'string' ? errors.endDate : 'Invalid end date'}
                    </Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('dueDay') || 'Vencimento do Aluguel'}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.dueDay && errors.dueDay
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="01"
                    value={values.dueDay || ''}
                    onChangeText={(text) => {
                      if (text === '' || parseInt(text, 10) <= 31) {
                        setFieldValue('dueDay', text);
                      }
                    }}
                    keyboardType="number-pad"
                  />
                  {touched.dueDay && errors.dueDay && (
                    <Text style={styles.errorText}>{errors.dueDay}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('monthlyRent')}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.monthlyRent && errors.monthlyRent
                        ? styles.inputError
                        : undefined,
                    ]}
                    value={values.monthlyRent}
                    onChangeText={(text) =>
                      setFieldValue('monthlyRent', text)
                    }
                    keyboardType="default"
                  />
                  {touched.monthlyRent && errors.monthlyRent && (
                    <Text style={styles.errorText}>{errors.monthlyRent}</Text>
                  )}
                </View>

                <PrimaryButton
                  label={t('generateContract')}
                  onPress={() => handleSubmit()}
                  icon="file-document-plus"
                  style={{ marginTop: 16, marginBottom: 32 }}
                />
              </View>
            )}
          </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  formContainer: {
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
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
  inputError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  dateButtonError: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingLeft: 12,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  inputWithValue: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
});
