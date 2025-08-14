export type UUID = string;

export type QuoteType = 'PREDEVIS' | 'DEVIS';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
export type FollowUpStatus = 'PENDING' | 'DONE' | 'SKIPPED';

export type TeamRole = 'CHEF_EQUIPE' | 'MANUTENTIONNAIRE' | 'CHAUFFEUR' | 'MONTEUR' | 'DEMONTEUR';

export interface ClientAddress {
	street: string;
	postalCode: string;
	city: string;
	country?: string;
}

export interface Client {
	id: UUID;
	name: string;
	email?: string;
	phone?: string;
	notes?: string;
	addressFrom?: ClientAddress;
	addressTo?: ClientAddress;
	createdAt: string;
}

export interface QuoteItem {
	description: string;
	unitPrice: number;
	quantity: number;
}

export interface Quote {
	id: UUID;
	number: string;
	clientId: UUID;
	type: QuoteType;
	formula?: 'Eco' | 'Confort' | 'Premium';
	volumeM3?: number;
	distanceKm?: number;
	items: QuoteItem[];
	subtotalHt: number;
	vatRate: number; // e.g. 0.2
	totalTtc: number;
	status: QuoteStatus;
	createdAt: string;
	pdfPath?: string; // path or data url
}

export interface Invoice {
	id: UUID;
	number: string;
	quoteId?: UUID;
	clientId: UUID;
	amountHt: number;
	vatRate: number;
	amountTtc: number;
	paidTtc: number;
	status: InvoiceStatus;
	issuedAt: string;
	pdfPath?: string;
}

export interface TeamMemberAssignment {
	name: string;
	role: TeamRole;
	hours: number; // base hours
	overtimeHours?: number;
	delayMinutes?: number;
}

export interface Mission {
	id: UUID;
	clientId: UUID;
	plannedDate: string; // ISO date
	startAddress: ClientAddress;
	endAddress: ClientAddress;
	truckPlate?: string;
	volumeM3?: number;
	groupageWith?: string;
	status: MissionStatus;
	team: TeamMemberAssignment[];
	incidents?: string;
	proofsCount?: number;
	coordinationNotes?: string;
	commercialNotes?: string;
	financialSummary?: {
		materialCost?: number;
		fuelTollCost?: number;
		laborCost?: number;
		otherCharges?: number;
		discount?: number;
		totalHt?: number;
	};
}

export interface EmailTemplate {
	id: UUID;
	name: string;
	subject: string;
	body: string; // can include {{placeholders}}
}

export interface EmailSequenceStep {
	templateId: UUID;
	delayDays: number; // after previous step
	ifStatusIn?: QuoteStatus[]; // optional condition
}

export interface EmailSequence {
	id: UUID;
	name: string;
	steps: EmailSequenceStep[];
}

export interface FollowUpTask {
	id: UUID;
	clientId?: UUID;
	quoteId?: UUID;
	dueAt: string; // ISO date
	note: string;
	status: FollowUpStatus;
}

export interface RateCard {
	currency: string;
	vatRate: number;
	hourlyRates: Partial<Record<TeamRole, number>>; // €/h
	overtimeMultiplier: number; // e.g. 1.25
}