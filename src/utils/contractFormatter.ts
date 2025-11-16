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
  monthlyRent?: number;
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
  values['LANDLORD_CPF'] = safe(data.landlord?.data.cpf);
  values['TENANT'] = safe(data.tenant?.name);
  values['TENANT_CPF'] = safe(data.tenant?.cpf);
  values['RENT'] = safe(data.monthlyRent);
  values['DUE_DAY'] = safe(data.dueDay);
  values['START_DATE'] = data.startDate ? format(data.startDate, 'dd/MM/yyyy') : '';
  values['END_DATE'] = data.endDate ? format(data.endDate, 'dd/MM/yyyy') : '';

  const selectedClauses: Clause[] = data.template.clauseIds
    .map((id) => allClauses.find((c) => c.id === id))
    .filter(Boolean) as Clause[];

  const headerParts: string[] = [];
  headerParts.push(`CONTRATO DE LOCAÇÃO`);
  if (values['LANDLORD']) headerParts.push(`LOCADOR: ${values['LANDLORD']} ${values['LANDLORD_CPF'] ? '- CPF: ' + values['LANDLORD_CPF'] : ''}`);
  if (values['TENANT']) headerParts.push(`LOCATÁRIO: ${values['TENANT']} ${values['TENANT_CPF'] ? '- CPF: ' + values['TENANT_CPF'] : ''}`);
  if (values['PROPERTY']) headerParts.push(`IMÓVEL: ${values['PROPERTY']} - ${values['STREET']}, ${values['NUMBER']} - ${values['NEIGHBORHOOD']} - ${values['CITY']}/${values['STATE']}`);
  if (values['START_DATE'] || values['END_DATE']) headerParts.push(`PRAZO: ${values['START_DATE']} a ${values['END_DATE']}`);
  if (values['RENT']) headerParts.push(`ALUGUEL: R$ ${values['RENT']} (vencimento dia ${values['DUE_DAY'] || ''})`);

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
      return `CLÁUSULA ${clauseNumber}: ${c.title}\n${content}`;
    })
    .join('\n\n');

  const full = [...headerParts, '', clausesText].join('\n\n');
  return full;
}

// Remove clause titles from formatted contract text, keeping only "CLÁUSULA X:"
export function removeClauseTitles(formattedText: string): string {
  return formattedText
    .split('\n')
    .map((line: string) => {
      const trimmed = line.trim();
      // Match lines like "CLÁUSULA PRIMEIRA: SEÚNGA - PRAZO DE LOCAÇÃO"
      const match = trimmed.match(/^(CLÁUSULA\s+[A-ZÁÉÍÓÚ\s]+):\s+.+/);
      if (match) {
        // Return just "CLÁUSULA PRIMEIRA:"
        return match[1] + ':';
      }
      return line;
    })
    .join('\n');
}
