import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { ContractData } from '../types/contractTypes';
import { format } from 'date-fns';

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
  monthlyRent: Yup.number()
    .required('Monthly rent is required')
    .positive('Monthly rent must be greater than 0'),
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
  monthlyRent: 0,
  dueDay: 1,
  guaranteeInstallments: 0,
  adjustmentIndex: '',
  lateFeePercentage: 0,
  monthlyInterestPercentage: 0,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleGenerateContract}
          >
            {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
              <View style={styles.formContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Landlord</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.landlord?.name && errors.landlord?.name
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Landlord Name"
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
                  <Text style={styles.sectionTitle}>Tenant</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.tenant?.name && errors.tenant?.name
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Tenant Name"
                    value={values.tenant.name}
                    onChangeText={(text) => setFieldValue('tenant.name', text)}
                  />
                  {touched.tenant?.name && errors.tenant?.name && (
                    <Text style={styles.errorText}>{errors.tenant.name}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Property</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.property?.description && errors.property?.description
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Property Description"
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
                  <Text style={styles.sectionTitle}>Contract Dates</Text>
                  
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
                      Start Date: {format(values.startDate, 'MM/dd/yyyy')}
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
                      End Date: {format(values.endDate, 'MM/dd/yyyy')}
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
                  <Text style={styles.sectionTitle}>Monthly Rent</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.monthlyRent && errors.monthlyRent
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={values.monthlyRent.toString()}
                    onChangeText={(text) =>
                      setFieldValue('monthlyRent', parseFloat(text) || 0)
                    }
                  />
                  {touched.monthlyRent && errors.monthlyRent && (
                    <Text style={styles.errorText}>{errors.monthlyRent}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleSubmit()}
                >
                  <Text style={styles.submitButtonText}>Generate Contract</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
