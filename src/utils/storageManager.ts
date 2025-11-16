import AsyncStorage from '@react-native-async-storage/async-storage';
import { LandlordProfile, PropertyProfile, Clause, ContractTemplate, GeneratedContract } from '../types/contractTypes';
import { DEFAULT_CLAUSES } from './defaultClauses';

const LANDLORDS_KEY = '@lease_app_landlords';
const PROPERTIES_KEY = '@lease_app_properties';
const CLAUSES_KEY = '@lease_app_clauses';
const TEMPLATES_KEY = '@lease_app_templates';
const GENERATED_CONTRACTS_KEY = '@lease_app_generated_contracts';

export async function getLandlords(): Promise<LandlordProfile[]> {
  try {
    const data = await AsyncStorage.getItem(LANDLORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting landlords:', error);
    return [];
  }
}

export async function saveLandlord(profile: LandlordProfile): Promise<void> {
  try {
    const landlords = await getLandlords();
    const index = landlords.findIndex(l => l.id === profile.id);
    if (index >= 0) {
      landlords[index] = profile;
    } else {
      landlords.push(profile);
    }
    await AsyncStorage.setItem(LANDLORDS_KEY, JSON.stringify(landlords));
  } catch (error) {
    console.error('Error saving landlord:', error);
  }
}

export async function deleteLandlord(id: string): Promise<void> {
  try {
    const landlords = await getLandlords();
    const filtered = landlords.filter(l => l.id !== id);
    await AsyncStorage.setItem(LANDLORDS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting landlord:', error);
  }
}

export async function getClauses(): Promise<Clause[]> {
  try {
    const data = await AsyncStorage.getItem(CLAUSES_KEY);
    return data ? JSON.parse(data) : DEFAULT_CLAUSES;
  } catch (error) {
    console.error('Error getting clauses:', error);
    return DEFAULT_CLAUSES;
  }
}

export async function saveClauses(clauses: Clause[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAUSES_KEY, JSON.stringify(clauses));
  } catch (error) {
    console.error('Error saving clauses:', error);
  }
}

export async function getTemplates(): Promise<ContractTemplate[]> {
  try {
    const data = await AsyncStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
}

export async function saveTemplate(template: ContractTemplate): Promise<void> {
  try {
    const templates = await getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving template:', error);
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    const templates = await getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting template:', error);
  }
}

export async function getProperties(): Promise<PropertyProfile[]> {
  try {
    const data = await AsyncStorage.getItem(PROPERTIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting properties:', error);
    return [];
  }
}

export async function saveProperty(profile: PropertyProfile): Promise<void> {
  try {
    const properties = await getProperties();
    const index = properties.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      properties[index] = profile;
    } else {
      properties.push(profile);
    }
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
  } catch (error) {
    console.error('Error saving property:', error);
  }
}

export async function deleteProperty(id: string): Promise<void> {
  try {
    const properties = await getProperties();
    const filtered = properties.filter(p => p.id !== id);
    await AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting property:', error);
  }
}

export async function updateClause(id: string, updatedClause: Clause): Promise<void> {
  try {
    const clauses = await getClauses();
    const index = clauses.findIndex(c => c.id === id);
    if (index >= 0) {
      clauses[index] = updatedClause;
      await saveClauses(clauses);
    }
  } catch (error) {
    console.error('Error updating clause:', error);
  }
}

export async function getGeneratedContracts(): Promise<GeneratedContract[]> {
  try {
    const data = await AsyncStorage.getItem(GENERATED_CONTRACTS_KEY);
    if (!data) return [];
    const contracts = JSON.parse(data);
    return contracts.map((c: any) => ({
      ...c,
      startDate: new Date(c.startDate),
      endDate: new Date(c.endDate),
      generatedAt: new Date(c.generatedAt),
    }));
  } catch (error) {
    console.error('Error getting generated contracts:', error);
    return [];
  }
}

export async function saveGeneratedContract(contract: GeneratedContract): Promise<void> {
  try {
    const contracts = await getGeneratedContracts();
    const index = contracts.findIndex(c => c.id === contract.id);
    if (index >= 0) {
      contracts[index] = contract;
    } else {
      contracts.push(contract);
    }
    await AsyncStorage.setItem(GENERATED_CONTRACTS_KEY, JSON.stringify(contracts));
  } catch (error) {
    console.error('Error saving generated contract:', error);
  }
}

export async function deleteGeneratedContract(id: string): Promise<void> {
  try {
    const contracts = await getGeneratedContracts();
    const filtered = contracts.filter(c => c.id !== id);
    await AsyncStorage.setItem(GENERATED_CONTRACTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting generated contract:', error);
  }
}
