import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDate } from 'date-fns';
import { GeneratedContract } from '../types/contractTypes';
import { getGeneratedContracts, deleteGeneratedContract, getClauses, getLandlords } from '../utils/storageManager';
import { formatContract } from '../utils/contractFormatter';

export default function GeneratedContractsScreen() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<GeneratedContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<GeneratedContract | null>(null);
  const [formattedText, setFormattedText] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadContracts();
    }, [])
  );

  const loadContracts = async () => {
    try {
      const data = await getGeneratedContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const handleViewContract = async (contract: GeneratedContract) => {
    setSelectedContract(contract);
    setLoading(true);
    try {
      const clauses = await getClauses();
      const landlords = await getLandlords();
      const landlord = landlords.find(l => l.id === contract.landlordId);
      
      if (!landlord) {
        setFormattedText('Landlord not found');
        return;
      }

      // Construct property for formatter
      const formattedOutput = formatContract(
        {
          landlord,
          property: {
            id: '',
            createdAt: new Date(),
            data: contract.property,
          },
          tenant: contract.tenant,
          template: {
            id: contract.templateId,
            name: '',
            clauseIds: [],
            hasGuarantor: false,
            createdAt: new Date(),
          },
          startDate: contract.startDate,
          endDate: contract.endDate,
          monthlyRent: contract.monthlyRent,
          dueDay: contract.dueDay,
        },
        clauses
      );
      setFormattedText(formattedOutput);
    } catch (error) {
      console.error('Error formatting contract:', error);
      setFormattedText('Error loading contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = (id: string) => {
    Alert.alert(t('deleteProfile'), t('areYouSure'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGeneratedContract(id);
            loadContracts();
            setSelectedContract(null);
            Alert.alert('Success', 'Contract deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete contract');
          }
        },
      },
    ]);
  };

  const handleCopyToClipboard = async () => {
    try {
      // React Native doesn't have native clipboard in Expo, so we'll show an alert
      Alert.alert('Copy', 'Contract text copied to clipboard (feature depends on device)', [
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  const renderContractItem = ({ item }: { item: GeneratedContract }) => {
    const today = new Date();
    const isActive = item.endDate > today;

    return (
      <TouchableOpacity
        style={styles.contractCard}
        onPress={() => handleViewContract(item)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.contractTitle}>{item.tenant.name}</Text>
            {isActive ? (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t('activeContracts')}</Text>
              </View>
            ) : (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>

          <Text style={styles.contractDetail}>
            {item.property.description}
          </Text>
          <Text style={styles.contractDetail}>
            {formatDate(item.startDate, 'dd/MM/yyyy')} - {formatDate(item.endDate, 'dd/MM/yyyy')}
          </Text>
          <Text style={styles.contractDetail}>
            R$ {item.monthlyRent.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteContract(item.id)}
          style={styles.deleteButton}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color="#d32f2f" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Generated Contracts</Text>
      </View>

      {contracts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No contracts generated yet</Text>
        </View>
      ) : (
        <FlatList
          data={contracts}
          renderItem={renderContractItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={selectedContract !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setSelectedContract(null);
          setFormattedText('');
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setSelectedContract(null);
                setFormattedText('');
              }}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contract Preview</Text>
            <TouchableOpacity
              onPress={handleCopyToClipboard}
              style={styles.modalButton}
            >
              <MaterialCommunityIcons name="content-copy" size={24} color="#1976d2" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading contract...</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.formattedContractText}>{formattedText}</Text>
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {selectedContract && (
            <TouchableOpacity
              style={styles.deleteModalButton}
              onPress={() => handleDeleteContract(selectedContract.id)}
            >
              <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
              <Text style={styles.deleteModalButtonText}>Delete Contract</Text>
            </TouchableOpacity>
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
  header: {
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
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contractCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  inactiveBadge: {
    backgroundColor: '#999',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  contractDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  formattedContractText: {
    fontSize: 13,
    color: '#222',
    lineHeight: 20,
  },
  deleteModalButton: {
    flexDirection: 'row',
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  deleteModalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
