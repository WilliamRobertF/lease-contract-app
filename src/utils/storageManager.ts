import AsyncStorage from '@react-native-async-storage/async-storage';
import { LandlordProfile, PropertyProfile, Clause, ContractTemplate } from '../types/contractTypes';

const LANDLORDS_KEY = '@lease_app_landlords';
const PROPERTIES_KEY = '@lease_app_properties';
const CLAUSES_KEY = '@lease_app_clauses';
const TEMPLATES_KEY = '@lease_app_templates';

const DEFAULT_CLAUSES: Clause[] = [
  {
    id: '1',
    title: 'Objeto do Contrato',
    content: 'O LOCADOR aluga ao LOCATÁRIO e este aceita alugar o imóvel descrito neste contrato, para uso exclusivamente residencial.',
    category: 'obligatory',
  },
  {
    id: '2',
    title: 'Duração',
    content: 'O contrato vigorará pelo período de [PERIOD] meses, iniciando-se em [START_DATE] e terminando em [END_DATE].',
    category: 'obligatory',
  },
  {
    id: '3',
    title: 'Aluguel',
    content: 'O LOCATÁRIO pagará mensalmente o valor de R$ [RENT] como aluguel, devido até o dia [DUE_DAY] de cada mês.',
    category: 'obligatory',
  },
  {
    id: '4',
    title: 'Reajuste',
    content: 'O aluguel será reajustado anualmente pelo índice [INDEX], a partir do vencimento do contrato.',
    category: 'optional',
  },
  {
    id: '5',
    title: 'Multa por Atraso',
    content: 'Sobre o valor do aluguel em atraso incidirá multa de [LATE_FEE]% e juros de [INTEREST]% ao mês.',
    category: 'optional',
  },
  {
    id: '6',
    title: 'Depósito Caução',
    content: 'O LOCATÁRIO depositará como caução o valor equivalente a [GUARANTEE]% do aluguel mensal.',
    category: 'optional',
  },
  {
    id: '7',
    title: 'Acessórios',
    content: 'O LOCATÁRIO é responsável pelo pagamento de água, energia elétrica, gás, internet e demais despesas do imóvel.',
    category: 'optional',
  },
  {
    id: '8',
    title: 'Manutenção e Conservação',
    content: 'O LOCATÁRIO se responsabiliza pela manutenção e conservação do imóvel, realizando pequenos reparos de sua conta.',
    category: 'optional',
  },
  {
    id: '9',
    title: 'Proibições',
    content: 'É proibido ao LOCATÁRIO: subarrendar, modificar a estrutura, manter animais (exceto conforme acordado), exercer comércio ou indústria.',
    category: 'optional',
  },
  {
    id: '10',
    title: 'Rescisão',
    content: 'O contrato pode ser rescindido por ambas as partes com [NOTICE_DAYS] dias de aviso prévio.',
    category: 'optional',
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
