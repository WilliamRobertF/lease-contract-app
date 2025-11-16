import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>Manage your rental contracts efficiently</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionGrid}>
            <QuickActionButton
              icon="account-plus"
              label={t('addLandlord')}
              color="#4caf50"
              onPress={() => navigation.navigate('Home', { screen: 'LandlordProfiles' } as never)}
            />
            <QuickActionButton
              icon="home-plus"
              label={t('addProperty')}
              color="#ff9800"
              onPress={() => navigation.navigate('Home', { screen: 'PropertyProfiles' } as never)}
            />
            <QuickActionButton
              icon="file-document-plus"
              label={t('newContract')}
              color="#1976d2"
              onPress={() => navigation.navigate('Home', { screen: 'ContractGeneration' } as never)}
            />
            <QuickActionButton
              icon="file-check"
              label={t('viewMyContracts')}
              color="#9c27b0"
              onPress={() => navigation.navigate('Home', { screen: 'GeneratedContracts' } as never)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 {t('tips')}</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#ff9800" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Dica 1</Text>
                <Text style={styles.tipText}>Crie cláusulas obrigatórias e opcionais para padronizar seus contratos</Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#4caf50" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Dica 2</Text>
                <Text style={styles.tipText}>Organize seus modelos de contrato por tipo de propriedade</Text>
              </View>
            </View>
            <View style={styles.tipCard}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#2196f3" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Dica 3</Text>
                <Text style={styles.tipText}>Exporte seus contratos em PDF para compartilhamento fácil</Text>
              </View>
            </View>
          </View>
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
});