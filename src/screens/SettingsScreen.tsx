import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Clause, ContractTemplate } from '../types/contractTypes';
import { getClauses, saveClauses, getTemplates, saveTemplate, deleteTemplate } from '../utils/storageManager';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'clauses' | 'templates'>('clauses');
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);

  useEffect(() => {
    loadClauses();
    loadTemplates();
  }, []);

  const loadClauses = async () => {
    const data = await getClauses();
    setClauses(data);
  };

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
  };

  const toggleClause = (clauseId: string) => {
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
    loadTemplates();
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
          loadTemplates();
        },
      },
    ]);
  };

  const renderClauseItem = ({ item }: { item: Clause }) => (
    <View style={styles.clauseItem}>
      <View style={styles.clauseInfo}>
        <Text style={styles.clauseTitle}>{item.title}</Text>
        <Text style={styles.clauseCategory}>
          {item.category === 'obligatory' ? 'Mandatory' : 'Optional'}
        </Text>
      </View>
      <Switch
        value={selectedClauses.includes(item.id)}
        onValueChange={() => toggleClause(item.id)}
      />
    </View>
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
      >
        <MaterialCommunityIcons name="trash-can" size={20} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clauses' && styles.activeTab]}
          onPress={() => setActiveTab('clauses')}
        >
          <Text style={[styles.tabText, activeTab === 'clauses' && styles.activeTabText]}>
            Clauses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
            Templates
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'clauses' ? (
          <View>
            <Text style={styles.sectionTitle}>Available Clauses</Text>
            <FlatList
              data={clauses}
              renderItem={renderClauseItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View>
            <View style={styles.createTemplateSection}>
              <Text style={styles.sectionTitle}>Create Template</Text>
              
              <View style={styles.templateForm}>
                <TextInput
                  style={styles.templateNameInput}
                  placeholder="Template name"
                  value={newTemplateName}
                  onChangeText={setNewTemplateName}
                />
                
                <Text style={styles.subTitle}>Select clauses:</Text>
                <FlatList
                  data={clauses}
                  renderItem={({ item }) => (
                    <View style={styles.clauseCheckbox}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => toggleClause(item.id)}
                      >
                        {selectedClauses.includes(item.id) && (
                          <MaterialCommunityIcons
                            name="check"
                            size={16}
                            color="#1976d2"
                          />
                        )}
                      </TouchableOpacity>
                      <Text style={styles.checkboxLabel}>{item.title}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateTemplate}
                >
                  <Text style={styles.createButtonText}>Create Template</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.templatesListSection}>
              <Text style={styles.sectionTitle}>Saved Templates</Text>
              {templates.length === 0 ? (
                <Text style={styles.emptyText}>No templates yet</Text>
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
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  clauseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  clauseInfo: {
    flex: 1,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clauseCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  createTemplateSection: {
    marginBottom: 24,
  },
  templateForm: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  templatesListSection: {
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
