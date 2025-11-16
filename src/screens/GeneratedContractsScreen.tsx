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
import { formatContract, removeClauseTitles } from '../utils/contractFormatter';
import { exportToPDF } from '../utils/pdfExporter';

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
      // Se tem formattedContent salvo, usa; senão tenta formatar novamente
      if (contract.formattedContent) {
        const cleaned = removeClauseTitles(contract.formattedContent);
        setFormattedText(cleaned);
      } else {
        const clauses = await getClauses();
        const landlords = await getLandlords();
        const landlord = landlords.find(l => l.id === contract.landlordId);
        
        if (!landlord) {
          setFormattedText('Landlord not found');
          return;
        }

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
            monthlyRent: typeof contract.monthlyRent === 'string' 
              ? parseFloat(contract.monthlyRent.replace(',', '.'))
              : contract.monthlyRent,
            dueDay: contract.dueDay,
          },
          clauses
        );
        const cleaned = removeClauseTitles(formattedOutput);
        setFormattedText(cleaned);
      }
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

  const handleExportPDF = async () => {
    try {
      const fileName = `contrato_${selectedContract?.tenant.name}_${formatDate(new Date(), 'dd_MM_yyyy')}.pdf`;
      await exportToPDF(formattedText, fileName, selectedContract);
    } catch (error) {
      Alert.alert('Error', 'Failed to export PDF');
      console.error('Error exporting PDF:', error);
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
          <View style={styles.cardHeaderTop}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.contractTitle}>{item.tenant.name.toUpperCase()}</Text>
              <Text style={styles.contractProperty}>{item.property.description}</Text>
            </View>
            {isActive ? (
              <View style={styles.activeBadge}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#4caf50" />
                <Text style={styles.activeBadgeText}>{t('activeContracts')}</Text>
              </View>
            ) : (
              <View style={styles.inactiveBadge}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#f44336" />
                <Text style={styles.inactiveBadgeText}>{t('inactiveContract')}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.contractDetail}>
                {formatDate(item.startDate, 'dd/MM/yyyy')} - {formatDate(item.endDate, 'dd/MM/yyyy')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="currency-brl" size={16} color="#666" />
              <Text style={styles.contractDetail}>
                R$ {typeof item.monthlyRent === 'string' ? item.monthlyRent : item.monthlyRent.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {contracts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{t('noContracts')}</Text>
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
        animationType="fade"
        onRequestClose={() => {
          setSelectedContract(null);
          setFormattedText('');
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
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
            <Text style={styles.modalTitle}>{t('contractPreview')}</Text>
            <View style={styles.headerRightButtons}>
              <TouchableOpacity
                onPress={handleExportPDF}
                style={styles.modalButton}
              >
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading contract...</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.modalContent}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
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
    paddingTop: 12,
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
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contractProperty: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#c62828',
  },
  contractDetail: {
    fontSize: 12,
    color: '#666',
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
  headerRightButtons: {
    flexDirection: 'row',
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
