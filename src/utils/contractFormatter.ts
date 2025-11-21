import { ContractTemplate, Clause } from '../types/contractTypes';
import { LandlordProfile, PropertyProfile, PersonData } from '../types/contractTypes';
import { format } from 'date-fns';
import i18n from '../i18n/i18n';

interface ContractDataForFormat {
  landlord?: LandlordProfile;
  property?: PropertyProfile;
  tenant?: PersonData;
  template?: ContractTemplate;
  startDate?: Date;
  endDate?: Date;
  monthlyRent?: string;
  dueDay?: string;
  contractLocation?: string;
  guarantor?: PersonData;
  hasGuarantor?: boolean;
}

function safe(val: any) {
  return val === undefined || val === null ? '' : String(val);
}

// Convert marital status key to translated text
function getMaritalStatusText(status: string): string {
  if (!status) return '';
  if (status === 'single') return i18n.t('single');
  if (status === 'married') return i18n.t('married');
  // If it's already text (old data), return as is
  return status;
}

// Convert number to Portuguese ordinal in words (feminine)
export function numberToPortugueseOrdinal(n: number): string {
  if (n < 1 || n > 999) return `${n}ª`; // Fallback for out of range

  const units = [
    '', 'PRIMEIRA', 'SEGUNDA', 'TERCEIRA', 'QUARTA', 'QUINTA', 
    'SEXTA', 'SÉTIMA', 'OITAVA', 'NONA'
  ];
  const tens = [
    '', 'DÉCIMA', 'VIGÉSIMA', 'TRIGÉSIMA', 'QUADRAGÉSIMA', 
    'QUINQUAGÉSIMA', 'SEXAGÉSIMA', 'SEPTUAGÉSIMA', 'OCTOGÉSIMA', 'NONAGÉSIMA'
  ];
  const hundreds = [
    '', 'CENTÉSIMA', 'DUCENTÉSIMA', 'TRECENTÉSIMA', 'QUADRIGENTÉSIMA', 
    'QUINGENTÉSIMA', 'SEXCENTÉSIMA', 'SEPTINGENTÉSIMA', 'OCTINGENTÉSIMA', 'NONINGENTÉSIMA'
  ];

  const parts: string[] = [];

  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (h > 0) parts.push(hundreds[h]);
  if (t > 0) parts.push(tens[t]);
  if (u > 0) parts.push(units[u]);

  return parts.join(' ');
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
  values['LANDLORD_MARITAL_STATUS'] = getMaritalStatusText(data.landlord?.data.maritalStatus || '');
  values['LANDLORD_RG'] = safe(data.landlord?.data.rg);
  values['LANDLORD_CPF'] = safe(data.landlord?.data.cpf);
  values['LANDLORD_BIRTHPLACE'] = safe(data.landlord?.data.birthplace);
  values['TENANT'] = safe(data.tenant?.name);
  values['TENANT_NATIONALITY'] = safe(data.tenant?.nationality);
  values['TENANT_MARITAL_STATUS'] = getMaritalStatusText(data.tenant?.maritalStatus || '');
  values['TENANT_RG'] = safe(data.tenant?.rg);
  values['TENANT_CPF'] = safe(data.tenant?.cpf);
  values['TENANT_BIRTHPLACE'] = safe(data.tenant?.birthplace);
  values['GUARANTOR'] = safe(data.guarantor?.name);
  values['GUARANTOR_NATIONALITY'] = safe(data.guarantor?.nationality);
  values['GUARANTOR_RG'] = safe(data.guarantor?.rg);
  values['GUARANTOR_CPF'] = safe(data.guarantor?.cpf);
  values['GUARANTOR_BIRTHPLACE'] = safe(data.guarantor?.birthplace);
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
    headerParts.push(`LOCADOR(A): ${values['LANDLORD']}, ${values['LANDLORD_NATIONALITY'] || ''}, ${values['LANDLORD_MARITAL_STATUS'] || ''}, portador do RG nº ${values['LANDLORD_RG'] || ''} e inscrito no CPF/MF nº ${values['LANDLORD_CPF'] || ''}, nascido em ${values['LANDLORD_BIRTHPLACE'] || ''}.`);
  }

  if (values['TENANT']) {
    headerParts.push(`LOCATÁRIO(A): Senhor ${values['TENANT']}, ${values['TENANT_NATIONALITY'] || ''}, ${values['TENANT_MARITAL_STATUS'] || ''}, portador do RG nº ${values['TENANT_RG'] || ''} e inscrito no CPF nº ${values['TENANT_CPF'] || ''}, nascido em ${values['TENANT_BIRTHPLACE'] || ''}.`);
  }

  if (data.guarantor?.name) {
    headerParts.push(`FIADOR(A): ${values['GUARANTOR']}, ${values['GUARANTOR_NATIONALITY'] || ''}, portador do RG nº ${values['GUARANTOR_RG'] || ''} e inscrito no CPF nº ${values['GUARANTOR_CPF'] || ''}.`);
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
