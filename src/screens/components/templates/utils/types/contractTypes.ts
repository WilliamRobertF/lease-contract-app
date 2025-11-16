export interface PersonData {
    name: string;
    nationality: string;
    maitalStatus: string;
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
}

export interface ContractData {
    landlord: PersonData;
    tenant: PersonData;
    guarantor?: PersonData;
    property: PropertyData;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    dueDay: number;
    guaranteeInstallments: number;
    adjustmentIndex: string; //IGP-M, IPCA, etc.
    lateFeePercentage: number;
    monthlyInterestPercentage: number;
}