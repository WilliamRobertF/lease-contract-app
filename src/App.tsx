import './i18n/i18n';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, StyleSheet, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const { t } = useTranslation();
  
  const getBackButtonLabel = (routeName: string) => {
    const labels: { [key: string]: string } = {
      'HomeScreen': t('home'),
      'ContractForm': t('contractForm'),
      'ContractGeneration': t('newContract'),
      'GeneratedContracts': t('generatedContracts'),
      'LandlordProfiles': t('landlordProfiles'),
      'PropertyProfiles': t('propertyProfiles'),
      'Settings': t('settings'),
      'Clauses': t('clauses'),
      'Templates': t('templates'),
    };
    return labels[routeName] || t('back');
  };

  return (
    <Stack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: {
          backgroundColor: '#f8f9fa',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#1976d2',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#333',
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        headerBackTitleVisible: false,
        headerLeftContainerStyle: { paddingLeft: 0 },
        
        headerLeft: () => {
          if (!navigation.canGoBack()) return null;
          
          const state = navigation.getState();
          const previousRoute = state.routes[state.index - 1];
          const backLabel = previousRoute ? getBackButtonLabel(previousRoute.name) : t('back');
          
          return (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 8 }}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color="#1976d2" />
              <Text style={{ fontSize: 16, color: '#1976d2', marginLeft: -4 }}>
                {backLabel}
              </Text>
            </TouchableOpacity>
          );
        },
      })}
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
        }} 
      />
      <Stack.Screen 
        name="ContractGeneration" 
        component={ContractGenerationScreen} 
        options={{
          title: t('newContract'),
        }} 
      />
      <Stack.Screen 
        name="GeneratedContracts" 
        component={GeneratedContractsScreen} 
        options={{
          title: t('generatedContracts'),
        }} 
      />
      <Stack.Screen 
        name="LandlordProfiles" 
        component={LandlordProfilesScreen} 
        options={{
          title: t('landlordProfiles'),
        }} 
      />
      <Stack.Screen 
        name="PropertyProfiles" 
        component={PropertyProfilesScreen} 
        options={{
          title: t('propertyProfiles'),
        }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          title: t('settings'),
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Clauses" 
        component={ClausesScreen} 
        options={{
          title: t('clauses'),
        }} 
      />
      <Stack.Screen 
        name="Templates" 
        component={ContractTemplatesScreen} 
        options={{
          title: t('templates'),
        }} 
      />
    </Stack.Navigator>
  );
}



function RootBottomTabNavigator() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },
        headerShown: false,
        lazy: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={({ route, navigation }) => {
          const state = navigation.getState();
          const currentRoute = state.routes[state.index];
          const nestedState = currentRoute.state as any;
          const currentScreen = nestedState?.routes?.[nestedState?.index]?.name;
          const isHomeActive = !currentScreen || currentScreen === 'HomeScreen';
          
          return {
            title: t('home'),
            tabBarIcon: ({ size }) => (
              <MaterialCommunityIcons 
                name="home-outline" 
                size={size} 
                color={isHomeActive ? '#1976d2' : '#999'} 
              />
            ),
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 4,
              color: isHomeActive ? '#1976d2' : '#999',
            },
          };
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={HomeStack} 
        options={({ route, navigation }) => {
          const state = navigation.getState();
          const currentRoute = state.routes[state.index];
          const nestedState = currentRoute.state as any;
          const isSettingsActive = nestedState?.routes?.[nestedState?.index]?.name === 'Settings';
          
          return {
            title: t('settings'),
            tabBarIcon: ({ size }) => (
              <MaterialCommunityIcons 
                name="cog-outline" 
                size={size} 
                color={isSettingsActive ? '#1976d2' : '#999'} 
              />
            ),
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 4,
              color: isSettingsActive ? '#1976d2' : '#999',
            },
          };
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Home', { screen: 'Settings' });
          },
        })}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { t } = useTranslation();

  React.useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) {
        // Não verifica updates em desenvolvimento
        return;
      }

      try {
        const update = await Updates.checkForUpdateAsync();
        
        if (update.isAvailable) {
          Alert.alert(
            t('updateAvailable') || 'Atualização Disponível',
            t('updateMessage') || 'Uma nova versão do app está disponível. Deseja atualizar agora?',
            [
              {
                text: t('later') || 'Depois',
                style: 'cancel',
              },
              {
                text: t('update') || 'Atualizar',
                onPress: async () => {
                  try {
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } catch (e) {
                    console.error('Erro ao baixar atualização:', e);
                  }
                },
              },
            ]
          );
        }
      } catch (e) {
        console.error('Erro ao verificar atualização:', e);
      }
    }

    checkForUpdates();
  }, [t]);

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