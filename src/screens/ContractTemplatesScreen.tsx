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
import { Clause, ContractTemplate } from '../types/contractTypes';
import {
  getClauses,
  getTemplates,
  saveTemplate,
  deleteTemplate,
} from '../utils/storageManager';

export default function ContractTemplatesScreen() {
  const { t } = useTranslation();
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);

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

  const toggleClauseSelection = (id: string) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      Alert.alert('Error', t('errorTemplateNameRequired'));
      return;
    }
    if (selectedClauses.length === 0) {
      Alert.alert('Error', t('errorSelectAtLeastOneClause'));
      return;
    }

    const newTemplate: ContractTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      clauseIds: selectedClauses,
      hasGuarantor: false,
      createdAt: new Date(),
    };

    await saveTemplate(newTemplate);
    setNewTemplateName('');
    setSelectedClauses([]);
    loadData();
  };

  const handleDeleteTemplate = (id: string) => {
    Alert.alert(t('areYouSure'), '', [
      { text: t('cancel') },
      {
        text: t('deleteTemplate'),
        onPress: async () => {
          await deleteTemplate(id);
          loadData();
        },
      },
    ]);
  };

  const renderClauseSelectionItem = ({ item }: { item: Clause }) => (
    <TouchableOpacity
      style={[
        styles.clauseCheckItem,
        selectedClauses.includes(item.id) && styles.clauseCheckItemActive,
      ]}
      onPress={() => toggleClauseSelection(item.id)}
    >
      <MaterialCommunityIcons
        name={
          selectedClauses.includes(item.id)
            ? 'checkbox-marked'
            : 'checkbox-blank-outline'
        }
        size={20}
        color={
          selectedClauses.includes(item.id) ? '#1976d2' : '#ccc'
        }
      />
      <View style={styles.clauseCheckContent}>
        <Text style={styles.clauseCheckTitle}>{item.title}</Text>
        <Text style={styles.clauseCheckCategory}>
          {item.category === 'obligatory' ? t('mandatoryCl') : t('optionalCl')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateItem = ({ item }: { item: ContractTemplate }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => setSelectedTemplate(item)}
    >
      <View style={styles.templateItemContent}>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateClauseCount}>
          {item.clauseIds.length} {t('clauses')}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTemplate}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.createButtonText}>{t('createTemplate')}</Text>
            </TouchableOpacity>
          </View>
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
      </ScrollView>

      <Modal
        visible={selectedTemplate !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTemplate(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedTemplate(null)}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedTemplate?.name}</Text>
            <TouchableOpacity
              onPress={() => {
                handleDeleteTemplate(selectedTemplate!.id);
                setSelectedTemplate(null);
              }}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="delete" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedTemplate?.clauseIds.map((clauseId) => {
              const clause = clauses.find((c) => c.id === clauseId);
              return clause ? (
                <View key={clause.id} style={styles.templateClauseItem}>
                  <Text style={styles.templateClauseTitle}>{clause.title}</Text>
                  <Text style={styles.templateClauseCategory}>
                    {clause.category === 'obligatory'
                      ? t('mandatoryCl')
                      : t('optionalCl')}
                  </Text>
                  <Text style={styles.templateClauseContent}>{clause.content}</Text>
                </View>
              ) : null;
            })}
          </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createSection: {
    marginBottom: 24,
  },
  savedSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templateNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  clauseCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8,
    gap: 10,
  },
  clauseCheckItemActive: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  clauseCheckContent: {
    flex: 1,
  },
  clauseCheckTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  clauseCheckCategory: {
    fontSize: 12,
    color: '#999',
  },
  createButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  templateItemContent: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateClauseCount: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 20,
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
  templateClauseItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  templateClauseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateClauseCategory: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 8,
  },
  templateClauseContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
});
