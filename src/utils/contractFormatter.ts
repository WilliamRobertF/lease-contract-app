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
      return `${idx + 1}. ${c.title}\n${content}`;
    })
    .join('\n\n');

  const full = [...headerParts, '', clausesText].join('\n\n');
  return full;
}
