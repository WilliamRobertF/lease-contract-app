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
        setFormattedText(contract.formattedContent);
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
            monthlyRent: contract.monthlyRent,
            dueDay: contract.dueDay,
          },
          clauses
        );
        setFormattedText(formattedOutput);
      }
    } catch (error) {
      console.error('Error formatting contract:', error);
      setFormattedText('Error loading contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = (id: string) => {
    Alert.alert(t('deleteContract'), t('areYouSure'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGeneratedContract(id);
            loadContracts();
            setSelectedContract(null);
            Alert.alert(t('delete'), t('contractDeletedSuccess'));
          } catch (error) {
            Alert.alert(t('delete'), t('contractDeleteError'));
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
        activeOpacity={0.7}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.contractTitle}>{item.tenant.name.toUpperCase()}</Text>
            <Text style={styles.contractProperty}>{item.property.description}</Text>
          </View>
          <View style={styles.statusBadge}>
            {isActive ? (
              <View style={styles.activeBadgeSmall}>
                <Text style={styles.activeBadgeTextSmall}>{t('activeContracts')}</Text>
              </View>
            ) : (
              <View style={styles.inactiveBadgeSmall}>
                <Text style={styles.inactiveBadgeTextSmall}>{t('inactiveContract')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={14} color="#999" />
            <Text style={styles.contractDetail}>
              {formatDate(item.startDate, 'dd/MM/yyyy')} - {formatDate(item.endDate, 'dd/MM/yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="currency-brl" size={14} color="#999" />
            <Text style={styles.contractDetail}>
              {item.monthlyRent}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteContract(item.id)}
          style={styles.deleteButtonSmall}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#d32f2f" />
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
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
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
                style={styles.scrollContent}
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
        </View>
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
    gap: 12,
  },
  contractCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    gap: 8,
  },
  contractCard: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusBadge: {
    marginLeft: 8,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 48,
    zIndex: 5,
  },
  cardHeader: {
    marginBottom: 12,
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
  activeBadgeSmall: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadgeTextSmall: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
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
  inactiveBadgeSmall: {
    backgroundColor: '#f44336',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  inactiveBadgeTextSmall: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  contractDetail: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 6,
    zIndex: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
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
    backgroundColor: '#fff',
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
