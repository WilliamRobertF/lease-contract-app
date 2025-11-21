import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  HomeScreen: undefined;
  ContractForm: undefined;
  ContractGeneration: undefined;
  GeneratedContracts: undefined;
  LandlordProfiles: { returnTo?: keyof RootStackParamList } | undefined;
  PropertyProfiles: { returnTo?: keyof RootStackParamList } | undefined;
  Settings: undefined;
  Clauses: undefined;
  Templates: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
