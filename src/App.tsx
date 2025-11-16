import './i18n/i18n';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import HomeScreen from './screens/HomeScreen';
import DrawerMenu from './components/DrawerMenu';

const Stack = createNativeStackNavigator();

function RootStackNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerLeft: () => <DrawerMenu />,
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