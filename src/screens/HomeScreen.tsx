import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LandlordProfile } from '../types/contractTypes';
import { getLandlords } from '../utils/storageManager';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [landlordCount, setLandlordCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  const loadCounts = async () => {
    const landlords = await getLandlords();
    setLandlordCount(landlords.length);
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>Manage your rental contracts efficiently</Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon="account-plus"
              label={t('addLandlord')}
              color="#4caf50"
              onPress={() => navigation.navigate('LandlordProfiles' as never)}
            />
            <QuickActionButton
              icon="home-plus"
              label={t('addProperty')}
              color="#ff9800"
              onPress={() => navigation.navigate('PropertyProfiles' as never)}
            />
            <QuickActionButton
              icon="file-document-plus"
              label={t('newContract')}
              color="#1976d2"
              onPress={() => navigation.navigate('ContractGeneration' as never)}
            />
            <QuickActionButton
              icon="cog"
              label={t('settings')}
              color="#9c27b0"
              onPress={() => navigation.navigate('Settings' as never)}
            />
          </View>
        </View>

        {/* STATS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account" size={32} color="#4caf50" />
              <Text style={styles.statValue}>{landlordCount}</Text>
              <Text style={styles.statLabel}>{t('landlordProfiles')}</Text>
            </View>
          </View>
        </View>

        {/* FEATURES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <FeatureItem
              icon="check-circle"
              title="Landlord Profiles"
              description="Save landlord data to reuse across contracts"
            />
            <FeatureItem
              icon="check-circle"
              title="Property Profiles"
              description="Store property details for quick selection"
            />
            <FeatureItem
              icon="check-circle"
              title="Customizable Clauses"
              description="Edit and create contract templates"
            />
            <FeatureItem
              icon="check-circle"
              title="Multi-Step Workflow"
              description="Generate contracts step by step"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#4caf50" />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
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
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});