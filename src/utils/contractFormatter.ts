import { ContractTemplate, Clause } from '../types/contractTypes';
import { LandlordProfile, PropertyProfile, PersonData } from '../types/contractTypes';
import { format } from 'date-fns';

interface ContractDataForFormat {
  landlord?: LandlordProfile;
  property?: PropertyProfile;
  tenant?: PersonData;
  template?: ContractTemplate;
  startDate?: Date;
  endDate?: Date;
  monthlyRent?: string;
  dueDay?: number;
}

function safe(val: any) {
  return val === undefined || val === null ? '' : String(val);
}

// Convert number to Portuguese ordinal in words
export function numberToPortugueseOrdinal(n: number): string {
  const ordinals: { [key: number]: string } = {
    1: 'PRIMEIRA',
    2: 'SEGUNDA',
    3: 'TERCEIRA',
    4: 'QUARTA',
    5: 'QUINTA',
    6: 'SEXTA',
    7: 'SÉTIMA',
    8: 'OITAVA',
    9: 'NONA',
    10: 'DÉCIMA',
    11: 'DÉCIMA PRIMEIRA',
    12: 'DÉCIMA SEGUNDA',
    13: 'DÉCIMA TERCEIRA',
    14: 'DÉCIMA QUARTA',
    15: 'DÉCIMA QUINTA',
    16: 'DÉCIMA SEXTA',
    17: 'DÉCIMA SÉTIMA',
    18: 'DÉCIMA OITAVA',
    19: 'DÉCIMA NONA',
    20: 'VIGÉSIMA',
  };
  return ordinals[n] || `${n}ª`;
}

export function formatContract(data: ContractDataForFormat, allClauses: Clause[]): string {
  if (!data.template) return '';

  const values: Record<string, string> = {};
  values['PROPERTY'] = safe(data.property?.data.description);
  values['STREET'] = safe(data.property?.data.street);
  values['NUMBER'] = safe(data.property?.data.number);
  values['ZIPCODE'] = safe(data.property?.data.zipCode);
  values['NEIGHBORHOOD'] = safe(data.property?.data.neighborhood);
  values['CITY'] = safe(data.property?.data.city);
  values['STATE'] = safe(data.property?.data.state);
  values['LANDLORD'] = safe(data.landlord?.data.name);
  values['LANDLORD_NATIONALITY'] = safe(data.landlord?.data.nationality);
  values['LANDLORD_MARITAL_STATUS'] = safe(data.landlord?.data.maitalStatus);
  values['LANDLORD_RG'] = safe(data.landlord?.data.rg);
  values['LANDLORD_CPF'] = safe(data.landlord?.data.cpf);
  values['LANDLORD_BIRTHPLACE'] = safe(data.landlord?.data.birthplace);
  values['TENANT'] = safe(data.tenant?.name);
  values['TENANT_NATIONALITY'] = safe(data.tenant?.nationality);
  values['TENANT_RG'] = safe(data.tenant?.rg);
  values['TENANT_CPF'] = safe(data.tenant?.cpf);
  values['TENANT_BIRTHPLACE'] = safe(data.tenant?.birthplace);
  values['RENT'] = safe(data.monthlyRent);
  values['DUE_DAY'] = safe(data.dueDay);
  values['START_DATE'] = data.startDate ? format(data.startDate, 'dd/MM/yyyy') : '';
  values['END_DATE'] = data.endDate ? format(data.endDate, 'dd/MM/yyyy') : '';

  // Use clauses from template
  const selectedClauses: Clause[] = data.template.clauseIds
    .map((id) => allClauses.find((c) => c.id === id))
    .filter(Boolean) as Clause[];

  // Build header with parties information
  const headerParts: string[] = [];
  headerParts.push(`São partes neste instrumento:`);
  
  if (values['LANDLORD']) {
    headerParts.push(`LOCADOR(A): ${values['LANDLORD']}, ${values['LANDLORD_NATIONALITY'] || ''}, ${values['LANDLORD_MARITAL_STATUS'] || ''}, portador(a) do RG nº ${values['LANDLORD_RG'] || ''} e inscrito(a) no CPF/MF nº ${values['LANDLORD_CPF'] || ''}, nascido(a) em ${values['LANDLORD_BIRTHPLACE'] || ''}.`);
  }

  if (values['TENANT']) {
    headerParts.push(`LOCATÁRIO(A): Senhor(a) ${values['TENANT']}, ${values['TENANT_NATIONALITY'] || ''}, portador(a) do RG nº ${values['TENANT_RG'] || ''} e inscrito(a) no CPF nº ${values['TENANT_CPF'] || ''}, nascido(a) em ${values['TENANT_BIRTHPLACE'] || ''}.`);
  }

  if (data.tenant?.nationality) {
    headerParts.push(''); // empty line for spacing
  }

  const clausesText = selectedClauses
    .map((c, idx) => {
      let content = c.content;
      // replace {KEY}, [KEY], ${KEY}
      Object.keys(values).forEach((key) => {
        const re1 = new RegExp(`\\{${key}\\}`, 'g');
        const re2 = new RegExp(`\\[${key}\\]`, 'g');
        const re3 = new RegExp(`\\$\\{${key}\\}`, 'g');
        const re4 = new RegExp(key, 'g'); // fallback: bare key occurrences
        content = content.replace(re1, values[key]);
        content = content.replace(re2, values[key]);
        content = content.replace(re3, values[key]);
        // do not aggressively replace bare KEY to avoid accidental replacement, skip re4
      });
      const clauseNumber = numberToPortugueseOrdinal(idx + 1);
      return `CLÁUSULA ${clauseNumber}: ${content}`;
    })
    .join('\n\n');

  const full = [...headerParts, clausesText].join('\n\n');
  return full;
}

// This function is kept for backward compatibility but is now a no-op
// since clause titles are already removed during formatting
export function removeClauseTitles(formattedText: string): string {
  return formattedText;
}
