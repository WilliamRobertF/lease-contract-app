export interface PersonData {
    name: string;
    nationality: string;
    maritalStatus: string;
    rg: string;
    cpf: string;
    birthplace: string;
}

export interface PropertyData {
    description: string;
    street: string;
    number: string;
    zipCode: string;
    neighborhood: string;
    city?: string;
    state?: string;
    rooms?: number;
    bathrooms?: number;
}

export interface PropertyProfile {
    id: string;
    createdAt: Date;
    data: PropertyData;
}

export interface ContractData {
    landlord: PersonData;
    tenant: PersonData;
    guarantor?: PersonData;
    hasGuarantor: boolean;
    property: PropertyData;
    startDate: Date;
    endDate: Date;
    monthlyRent: string;
    dueDay: string;
    contractLocation: string;
    contractDate?: Date;
    guaranteeInstallments: number;
    lateFeePercentage: number;
    monthlyInterestPercentage: number;
}

export interface LandlordProfile {
    id: string;
    createdAt: Date;
    data: PersonData;
}

export interface Clause {
    id: string;
    title: string;
    content: string;
    category?: 'obligatory' | 'optional';
}

export interface ContractTemplate {
    id: string;
    name: string;
    clauseIds: string[];
    hasGuarantor: boolean;
    createdAt: Date;
}

export interface GeneratedContract {
    id: string;
    templateId: string;
    landlordId: string;
    tenant: PersonData;
    guarantor?: PersonData;
    property: PropertyData;
    startDate: Date;
    endDate: Date;
    monthlyRent: string;
    dueDay: string;
    contractLocation: string;
    contractDate?: Date;
    guaranteeInstallments: number;
    lateFeePercentage: number;
    monthlyInterestPercentage: number;
    generatedAt: Date;
    formattedContent?: string;
}