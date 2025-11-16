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
import { LandlordProfile, PersonData } from '../types/contractTypes';
import { getLandlords, saveLandlord, deleteLandlord } from '../utils/storageManager';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  nationality: Yup.string().required('Nationality is required'),
  maitalStatus: Yup.string().required('Marital status is required'),
  rg: Yup.string().required('RG is required'),
  cpf: Yup.string().required('CPF is required'),
  birthplace: Yup.string().required('Birthplace is required'),
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
  const { t } = useTranslation();
  const [landlords, setLandlords] = useState<LandlordProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<PersonData | null>(null);

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
    Alert.alert('Delete Profile', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Formik
            initialValues={editingData || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ values, errors, touched, handleChange, handleSubmit }) => (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Edit Landlord Profile</Text>

                <View style={styles.section}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Nationality</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nationality"
                    value={values.nationality}
                    onChangeText={handleChange('nationality')}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Marital Status</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Marital Status"
                    value={values.maitalStatus}
                    onChangeText={handleChange('maitalStatus')}
                  />
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
                  <Text style={styles.label}>Birthplace</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Birthplace"
                    value={values.birthplace}
                    onChangeText={handleChange('birthplace')}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleSubmit()}
                >
                  <Text style={styles.submitButtonText}>Save Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditingId(null);
                    setEditingData(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Landlord Profiles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingId('new');
            setEditingData(null);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {landlords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="folder-open" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No profiles yet</Text>
        </View>
      ) : (
        <FlatList
          data={landlords}
          renderItem={renderLandlordItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1976d2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 16,
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
  submitButton: {
    backgroundColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
