import AsyncStorage from '@react-native-async-storage/async-storage';
import { LandlordProfile, PropertyProfile, Clause, ContractTemplate, GeneratedContract } from '../types/contractTypes';
import { DEFAULT_CLAUSES } from './defaultClauses';

const LANDLORDS_KEY = '@lease_app_landlords';
const PROPERTIES_KEY = '@lease_app_properties';
const CLAUSES_KEY = '@lease_app_clauses';
const TEMPLATES_KEY = '@lease_app_templates';
const GENERATED_CONTRACTS_KEY = '@lease_app_generated_contracts';
const ONBOARDING_KEY = '@lease_app_has_seen_onboarding';

const DEFAULT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'template-default-complete',
    name: 'Modelo Padrão Completo',
    clauseIds: [
      'clause-1', 'clause-2', 'clause-3', 'clause-4', 'clause-5',
      'clause-6', 'clause-7', 'clause-8', 'clause-9', 'clause-10',
      'clause-11', 'clause-12', 'clause-13', 'clause-14', 'clause-15',
      'clause-16', 'clause-17', 'clause-18'
    ],
    hasGuarantor: true,
    createdAt: new Date(),
  },
  {
    id: 'template-default-no-guarantor',
    name: 'Modelo Padrão sem Fiador',
    clauseIds: [
      'clause-1', 'clause-2', 'clause-3', 'clause-4', 'clause-5',
      'clause-6', 'clause-7', 'clause-8', 'clause-9', 'clause-10',
      'clause-11', 'clause-12', 'clause-13', 'clause-14', 'clause-15',
      'clause-16', 'clause-18'
    ],
    hasGuarantor: false,
    createdAt: new Date(),
  },
];

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
    if (data) {
      const clauses = JSON.parse(data);
      const clause16 = clauses.find((c: Clause) => c.id === 'clause-16');
      if (clause16 && (clause16.title.includes('Foro') || clause16.title.includes('Competente'))) {
        console.log('Migrating clauses to new default order...');
        await AsyncStorage.setItem(CLAUSES_KEY, JSON.stringify(DEFAULT_CLAUSES));
        return DEFAULT_CLAUSES;
      }
      return clauses;
    }
    return DEFAULT_CLAUSES;
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
    if (!data) {
      return DEFAULT_TEMPLATES;
    }
    const customTemplates = JSON.parse(data);

    const allTemplates = [...DEFAULT_TEMPLATES];
    customTemplates.forEach((ct: ContractTemplate) => {
      if (!allTemplates.find(t => t.id === ct.id)) {
        allTemplates.push(ct);
      }
    });
    return allTemplates;
  } catch (error) {
    console.error('Error getting templates:', error);
    return DEFAULT_TEMPLATES;
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

    if (id.startsWith('template-default-')) {
      console.warn('Cannot delete default templates');
      return;
    }
    const templates = await getTemplates();
    const filtered = templates.filter(t => t.id !== id);

    const customTemplates = filtered.filter(t => !t.id.startsWith('template-default-'));
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
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

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
}
