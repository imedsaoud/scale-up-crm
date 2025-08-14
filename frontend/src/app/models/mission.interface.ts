export interface Mission {
  id: string;
  client: string;
  date: string;
  origin: string;
  destination: string;
  volume: number;
  truck: string;
  team: TeamMember[];
  groupage: boolean;
  groupageClient?: string;
  status: MissionStatus;
  validation: ValidationSteps;
  costs: MissionCosts;
  satisfaction?: CustomerSatisfaction;
  billing?: BillingInfo;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Chef d\'équipe' | 'Déménageur';
  overtimeHours: number;
  delayMinutes: number;
}

export interface ValidationSteps {
  terrain: ValidationStep;
  coordination: ValidationStep;
  commercial: ValidationStep;
  comptable: ValidationStep;
}

export interface ValidationStep {
  status: 'pending' | 'current' | 'completed' | 'cancelled';
  validatedBy?: string;
  validatedAt?: Date;
  notes?: string;
}

export interface MissionCosts {
  material: number;
  fuel: number;
  labor: number;
  overtime: number;
  tolls: number;
  parking: number;
  additional: number;
  total: number;
}

export interface CustomerSatisfaction {
  rating: 1 | 2 | 3 | 4 | 5;
  complaints: 'none' | 'minor' | 'major';
  comments?: string;
}

export interface BillingInfo {
  invoiceNumber: string;
  baseAmount: number;
  additionalCosts: number;
  discount: number;
  totalHT: number;
  totalTTC: number;
  paidAmount: number;
  paymentMethod?: 'especes' | 'cb' | 'cheque' | 'virement';
  signatureStatus: 'signed' | 'not_signed' | 'electronic';
  profitMargin: number;
  profitRate: number;
}

export interface MissionFormData {
  execution: {
    confirmedVolume: number;
    volumeStatus: 'OK' | 'NOK';
    materials: string;
  };
  team: TeamMember[];
  logistics: {
    tolls: number;
    parking: 'OK' | 'Amende' | 'Panneaux';
  };
  incidents: {
    description: string;
    photos: File[];
  };
}

export interface CoordinationFormData {
  planning: 'OK' | 'Retard' | 'Probleme';
  resources: 'OK' | 'Depassement' | 'Probleme';
  overtime: {
    hours: number;
    cost: number;
  };
  additionalCosts: string;
  sav: 'NON' | 'MINEUR' | 'MAJEUR';
  notes: string;
}

export interface CommercialFormData {
  satisfaction: {
    rating: 'EXCELLENT' | 'BON' | 'CORRECT' | 'MEDIOCRE' | 'MAUVAIS';
    complaints: 'AUCUNE' | 'MINEURE' | 'MAJEURE';
  };
  payment: {
    amountReceived: number;
    method: 'ESPECES' | 'CB' | 'CHEQUE' | 'VIREMENT' | '';
    signature: 'OUI' | 'NON' | 'ELECTRONIQUE';
  };
  billing: {
    additionalCosts: number;
    additionalCostsStatus: 'FACTURABLE' | 'NON_FACTURABLE' | 'NEGOCIE';
    discountPercent: number;
    discountAmount: number;
  };
  comments: {
    customerFeedback: string;
    loyaltyActions: string;
  };
}

export interface ComptableFormData {
  costs: {
    material: number;
    fuelTolls: number;
    labor: number;
    other: number;
  };
  invoice: {
    number: string;
    date: string;
    dueDate: string;
    paymentMethod: 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'CB';
  };
  profitability: {
    revenue: number;
    totalCosts: number;
    grossMargin: number;
    marginRate: number;
  };
  notes: string;
}

export type MissionStatus = 'terrain_pending' | 'coordination_pending' | 'commercial_pending' | 'comptable_pending' | 'completed';

export type UserRole = 'chef-equipe' | 'coordinateur' | 'commercial' | 'comptable';