import './i18n/i18n';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import i18n from './i18n/i18n';
import HomeScreen from './screens/HomeScreen';
import ContractFormScreen from './screens/ContractFormScreen';
import LandlordProfilesScreen from './screens/LandlordProfilesScreen';
import PropertyProfilesScreen from './screens/PropertyProfilesScreen';
import ContractGenerationScreen from './screens/ContractGenerationScreen';
import SettingsScreen from './screens/SettingsScreen';
import GeneratedContractsScreen from './screens/GeneratedContractsScreen';
import ClausesScreen from './screens/ClausesScreen';
import ContractTemplatesScreen from './screens/ContractTemplatesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: t('home'), headerShown: false }} 
      />
      <Stack.Screen 
        name="ContractForm" 
        component={ContractFormScreen} 
        options={{
          title: t('contractForm'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="ContractGeneration" 
        component={ContractGenerationScreen} 
        options={{
          title: t('newContract'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="GeneratedContracts" 
        component={GeneratedContractsScreen} 
        options={{
          title: t('generatedContracts'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="LandlordProfiles" 
        component={LandlordProfilesScreen} 
        options={{
          title: t('landlordProfiles'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="PropertyProfiles" 
        component={PropertyProfilesScreen} 
        options={{
          title: t('propertyProfiles'),
          headerBackTitle: t('back'),
        }} 
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ 
          title: t('settings'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="Clauses" 
        component={ClausesScreen} 
        options={{
          title: t('clauses'),
          headerBackTitle: t('back'),
        }} 
      />
      <Stack.Screen 
        name="Templates" 
        component={ContractTemplatesScreen} 
        options={{
          title: t('templates'),
          headerBackTitle: t('back'),
        }} 
      />
    </Stack.Navigator>
  );
}

function RootBottomTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack} 
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootBottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}