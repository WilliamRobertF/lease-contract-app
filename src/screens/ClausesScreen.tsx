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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Clause } from '../types/contractTypes';
import { getClauses, updateClause, saveClauses } from '../utils/storageManager';

export default function ClausesScreen() {
  const { t } = useTranslation();
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [editingClause, setEditingClause] = useState<Clause | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateClauseModal, setShowCreateClauseModal] = useState(false);
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');

  useEffect(() => {
    loadClauses();
  }, []);

  const loadClauses = async () => {
    const clausesList = await getClauses();
    setClauses(clausesList);
  };

  const handleEditClause = (clause: Clause) => {
    setEditingClause({ ...clause });
    setShowEditModal(true);
  };

  const handleUpdateClause = async () => {
    if (!editingClause) return;
    await updateClause(editingClause.id, editingClause);
    setShowEditModal(false);
    setEditingClause(null);
    loadClauses();
  };

  const handleDeleteClause = (id: string) => {
    Alert.alert(t('areYouSure'), '', [
      { text: t('cancel') },
      {
        text: t('deleteClause'),
        onPress: async () => {
          const updated = clauses.filter((c) => c.id !== id);
          await saveClauses(updated);
          loadClauses();
        },
      },
    ]);
  };

  const handleCreateClause = async () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newClause: Clause = {
      id: Date.now().toString(),
      title: newClauseTitle,
      content: newClauseContent,
    };

    const updated = [...clauses, newClause];
    await saveClauses(updated);
    setClauses(updated);
    setShowCreateClauseModal(false);
    setNewClauseTitle('');
    setNewClauseContent('');

  };

  const renderClauseItem = ({ item }: { item: Clause }) => (
    <TouchableOpacity
      style={styles.clauseItem}
      onPress={() => setSelectedClause(item)}
    >
      <View style={styles.clauseItemContent}>
        <Text style={styles.clauseTitle}>{item.title}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.clausesHeader}>
          <Text style={styles.sectionTitle}>{t('availableClauses')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateClauseModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{t('addClause')}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={clauses}
          renderItem={renderClauseItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      <Modal
        visible={selectedClause !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSelectedClause(null);
          setEditingClause(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setSelectedClause(null);
                setEditingClause(null);
              }}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedClause?.title}</Text>
            <TouchableOpacity
              onPress={() => handleEditClause(selectedClause!)}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="pencil" size={24} color="#1976d2" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.clauseContent}>{selectedClause?.content}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.modalButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('editClause')}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.editFormContent}>
              <Text style={styles.label}>{t('clauseTitle')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('clauseTitle')}
                value={editingClause?.title}
                onChangeText={(text) =>
                  setEditingClause(editingClause ? { ...editingClause, title: text } : null)
                }
              />

              <Text style={styles.label}>{t('clauseContent')}</Text>
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                placeholder={t('clauseContent')}
                multiline
                value={editingClause?.content}
                onChangeText={(text) =>
                  setEditingClause(editingClause ? { ...editingClause, content: text } : null)
                }
              />



              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => {
                    handleDeleteClause(editingClause!.id);
                    setShowEditModal(false);
                  }}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>{t('delete')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateClause}
                >
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={styles.buttonText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showCreateClauseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateClauseModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowCreateClauseModal(false)}
                style={styles.modalButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('createClause')}</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.editFormContent}>
              <Text style={styles.label}>{t('clauseTitle')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('clauseTitle')}
                value={newClauseTitle}
                onChangeText={setNewClauseTitle}
              />

              <Text style={styles.label}>{t('clauseContent')}</Text>
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                placeholder={t('clauseContent')}
                multiline
                value={newClauseContent}
                onChangeText={setNewClauseContent}
              />



              <TouchableOpacity style={styles.createButton} onPress={handleCreateClause}>
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.buttonText}>{t('createClause')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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
  clausesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clauseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  clauseItemContent: {
    flex: 1,
  },
  clauseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  clauseCategory: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clauseContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },
  editModalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editFormContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
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
    marginBottom: 16,
  },
  textAreaInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: '#1976d2',
    backgroundColor: '#f0f7ff',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  categoryButtonTextActive: {
    color: '#1976d2',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
