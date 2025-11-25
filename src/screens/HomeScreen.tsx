import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp } from '../types/navigationTypes';
import { GeneratedContract } from '../types/contractTypes';
import { getGeneratedContracts } from '../utils/storageManager';
import { formatDate } from 'date-fns';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [expiringContracts, setExpiringContracts] = useState<GeneratedContract[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadExpiringContracts();
    }, [])
  );

  const loadExpiringContracts = async () => {
    try {
      const contracts = await getGeneratedContracts();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      

      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const expiring = contracts.filter(contract => {
        const endDate = new Date(contract.endDate);
        endDate.setHours(0, 0, 0, 0);
        return endDate <= thirtyDaysLater && endDate > today;
      }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
      
      setExpiringContracts(expiring);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const getNextContractToExpire = () => {
    if (expiringContracts.length > 0) {
      return expiringContracts[0];
    }

    return null;
  };

  const QuickActionButton = ({
    icon,
    label,
    onPress,
    color = '#1976d2',
  }: {
    icon: string;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor: color }]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>{t('appTitle')}</Text>
          <Text style={styles.subtitle}>{t('manageContracts')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon="account-plus"
              label={t('landlords')}
              color="#4caf50"
              onPress={() => navigation.navigate('LandlordProfiles')}
            />
            <QuickActionButton
              icon="home-plus"
              label={t('properties')}
              color="#ff9800"
              onPress={() => navigation.navigate('PropertyProfiles')}
            />
            <QuickActionButton
              icon="file-document-plus"
              label={t('newContract')}
              color="#1976d2"
              onPress={() => navigation.navigate('ContractGeneration')}
            />
            <QuickActionButton
              icon="file-check"
              label={t('viewMyContracts')}
              color="#9c27b0"
              onPress={() => navigation.navigate('GeneratedContracts')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alerts').charAt(0).toUpperCase() + t('alerts').slice(1)}</Text>
          {expiringContracts.length > 0 ? (
            <View style={styles.alertsContainer}>
              {expiringContracts.map(contract => {
                const daysLeft = Math.ceil(
                  (new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <View key={contract.id} style={styles.alertCard}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>{contract.tenant.name}</Text>
                      <Text style={styles.alertText}>
                        {`${t('expiresIn')} ${daysLeft} ${daysLeft === 1 ? t('day') : t('days')} (${formatDate(contract.endDate, 'dd/MM/yyyy')})`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noAlertCard}>
              <View style={styles.alertContent}>
                <Text style={styles.noAlertTitle}>{t('noAlerts')}</Text>
                <Text style={styles.alertText}>{t('noContractsExpiring')}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fffbea',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  noAlertCard: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  noAlertTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});