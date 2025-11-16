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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Clause, ContractTemplate } from '../types/contractTypes';
import { getClauses, getTemplates, saveTemplate, deleteTemplate, updateClause } from '../utils/storageManager';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'clauses' | 'templates'>('clauses');
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [editingClause, setEditingClause] = useState<Clause | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clausesList, templatesList] = await Promise.all([
      getClauses(),
      getTemplates(),
    ]);
    setClauses(clausesList);
    setTemplates(templatesList);
  };

  const handleEditClause = (clause: Clause) => {
    setEditingClause({ ...clause });
    setShowEditModal(true);
  };

  const handleSaveClause = async () => {
    if (editingClause) {
      await updateClause(editingClause.id, editingClause);
      setShowEditModal(false);
      setEditingClause(null);
      loadData();
      Alert.alert('Success', 'Clause updated successfully');
    }
  };

  const toggleClauseSelection = (clauseId: string) => {
    setSelectedClauses(prev =>
      prev.includes(clauseId)
        ? prev.filter(id => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      Alert.alert('Error', 'Template name is required');
      return;
    }

    if (selectedClauses.length === 0) {
      Alert.alert('Error', 'Select at least one clause');
      return;
    }

    const template: ContractTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newTemplateName,
      clauseIds: selectedClauses,
      hasGuarantor: false,
      createdAt: new Date(),
    };

    await saveTemplate(template);
    setNewTemplateName('');
    setSelectedClauses([]);
    loadData();
    Alert.alert('Success', 'Template created successfully');
  };

  const handleDeleteTemplate = (id: string) => {
    Alert.alert('Delete Template', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTemplate(id);
          loadData();
        },
      },
    ]);
  };

  const renderClauseItem = ({ item }: { item: Clause }) => (
    <TouchableOpacity
      style={styles.clauseItem}
      onPress={() => setSelectedClause(item)}
    >
      <View style={styles.clauseInfo}>
        <Text style={styles.clauseTitle}>{item.title}</Text>
        <View style={styles.clauseMeta}>
          <Text style={styles.clauseCategory}>
            {item.category === 'obligatory' ? '📌 Mandatory' : '⭐ Optional'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#999"
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateItem = ({ item }: { item: ContractTemplate }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateInfo}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateDetail}>
          {item.clauseIds.length} clauses
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteTemplate(item.id)}
        style={styles.deleteIconContainer}
      >
        <MaterialCommunityIcons name="trash-can" size={20} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  );

  const renderClauseSelectionItem = ({ item }: { item: Clause }) => (
    <TouchableOpacity
      style={styles.clauseCheckbox}
      onPress={() => toggleClauseSelection(item.id)}
    >
      <View style={styles.checkbox}>
        {selectedClauses.includes(item.id) && (
          <MaterialCommunityIcons
            name="check"
            size={16}
            color="#1976d2"
          />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clauses' && styles.activeTab]}
          onPress={() => setActiveTab('clauses')}
        >
          <Text style={[styles.tabText, activeTab === 'clauses' && styles.activeTabText]}>
            {t('clauses')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            {t('templates')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'clauses' ? (
          <View>
            <Text style={styles.sectionTitle}>{t('availableClauses')}</Text>
            <FlatList
              data={clauses}
              renderItem={renderClauseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View>
            <View style={styles.createSection}>
              <Text style={styles.sectionTitle}>{t('createTemplate')}</Text>

              <TextInput
                style={styles.templateNameInput}
                placeholder={t('templateName')}
                value={newTemplateName}
                onChangeText={setNewTemplateName}
              />

              <Text style={styles.subTitle}>{t('selectClauses')}</Text>
              <FlatList
                data={clauses}
                renderItem={renderClauseSelectionItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateTemplate}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                <Text style={styles.createButtonText}>{t('createTemplate')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.savedSection}>
              <Text style={styles.sectionTitle}>{t('savedTemplates')}</Text>
              {templates.length === 0 ? (
                <Text style={styles.emptyText}>{t('noTemplates')}</Text>
              ) : (
                <FlatList
                  data={templates}
                  renderItem={renderTemplateItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedClause !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedClause(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedClause(null)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('clauseContent')}</Text>
            {selectedClause && (
              <TouchableOpacity onPress={() => handleEditClause(selectedClause)}>
                <MaterialCommunityIcons name="pencil" size={24} color="#1976d2" />
              </TouchableOpacity>
            )}
          </View>

          {selectedClause && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.clauseDetailCard}>
                <Text style={styles.detailTitle}>{selectedClause.title}</Text>
                <Text style={styles.detailCategory}>
                  {selectedClause.category === 'obligatory'
                    ? '📌 Mandatory Clause'
                    : '⭐ Optional Clause'}
                </Text>
                <Text style={styles.detailContent}>{selectedClause.content}</Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('editClause')}</Text>
            <TouchableOpacity onPress={handleSaveClause}>
              <MaterialCommunityIcons name="check" size={24} color="#4caf50" />
            </TouchableOpacity>
          </View>

          {editingClause && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.editForm}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={editingClause.title}
                  onChangeText={(text) =>
                    setEditingClause({ ...editingClause, title: text })
                  }
                />

                <Text style={[styles.label, { marginTop: 16 }]}>
                  {t('clauseContent')}
                </Text>
                <TextInput
                  style={[styles.input, styles.textAreaInput]}
                  value={editingClause.content}
                  onChangeText={(text) =>
                    setEditingClause({ ...editingClause, content: text })
                  }
                  multiline
                  numberOfLines={6}
                />

                <Text style={[styles.hint, { marginTop: 12 }]}>
                  Use variable names like: PROPERTY, LANDLORD, TENANT, RENT, DUE_DAY
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#1976d2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#1976d2',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  clauseItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  clauseInfo: {
    gap: 6,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clauseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clauseCategory: {
    fontSize: 12,
    color: '#999',
  },
  createSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  templateNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  clauseCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  savedSection: {
    marginBottom: 24,
  },
  templateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  templateDetail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteIconContainer: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clauseDetailCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  detailCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  detailContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  editForm: {
    paddingBottom: 20,
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
  textAreaInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#1976d2',
    fontStyle: 'italic',
  },
});
