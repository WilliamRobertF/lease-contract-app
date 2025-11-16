import './i18n/i18n';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import HomeScreen from './screens/HomeScreen';
import ContractFormScreen from './screens/ContractFormScreen';
import LandlordProfilesScreen from './screens/LandlordProfilesScreen';
import ContractGenerationScreen from './screens/ContractGenerationScreen';
import SettingsScreen from './screens/SettingsScreen';
import DrawerMenu from './components/DrawerMenu';

const Stack = createNativeStackNavigator();

function RootStackNavigator() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerLeft: () => <DrawerMenu navigation={navigation} />,
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('home') }} 
      />
      <Stack.Screen 
        name="ContractForm" 
        component={ContractFormScreen} 
        options={{ title: t('contractForm') }} 
      />
      <Stack.Screen 
        name="LandlordProfiles" 
        component={LandlordProfilesScreen} 
        options={{ title: t('landlordProfiles') }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: t('settings') }} 
      />
      <Stack.Screen 
        name="ContractGeneration" 
        component={ContractGenerationScreen} 
        options={{ title: t('newContract') }} 
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStackNavigator />
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