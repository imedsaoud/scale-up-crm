import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Client, EmailSequence, EmailTemplate, FollowUpStatus, FollowUpTask, Invoice, InvoiceStatus, Mission, MissionStatus, Quote, QuoteItem, QuoteStatus, QuoteType, RateCard, TeamRole, UUID } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class AppStateService {
	private clients$ = new BehaviorSubject<Client[]>([]);
	private quotes$ = new BehaviorSubject<Quote[]>([]);
	private invoices$ = new BehaviorSubject<Invoice[]>([]);
	private missions$ = new BehaviorSubject<Mission[]>([]);
	private templates$ = new BehaviorSubject<EmailTemplate[]>([]);
	private sequences$ = new BehaviorSubject<EmailSequence[]>([]);
	private followUps$ = new BehaviorSubject<FollowUpTask[]>([]);
	private rateCard$ = new BehaviorSubject<RateCard>({ currency: '€', vatRate: 0.2, hourlyRates: { CHEF_EQUIPE: 28, MANUTENTIONNAIRE: 20, CHAUFFEUR: 24, MONTEUR: 22, DEMONTEUR: 22 }, overtimeMultiplier: 1.25 });

	clients = this.clients$.asObservable();
	quotes = this.quotes$.asObservable();
	invoices = this.invoices$.asObservable();
	missions = this.missions$.asObservable();
	templates = this.templates$.asObservable();
	sequences = this.sequences$.asObservable();
	followUps = this.followUps$.asObservable();
	rateCard = this.rateCard$.asObservable();

	// Clients
	addClient(client: Omit<Client, 'id' | 'createdAt'>): UUID {
		const id = uuid();
		const createdAt = new Date().toISOString();
		this.clients$.next([...this.clients$.value, { id, createdAt, ...client }]);
		return id;
	}

	searchClients(term: string): Client[] {
		const normalized = term.trim().toLowerCase();
		return this.clients$.value.filter(c => c.name.toLowerCase().includes(normalized) || (c.email ?? '').toLowerCase().includes(normalized));
	}

	// Quotes
	createQuote(data: { clientId: UUID; type: QuoteType; items?: QuoteItem[]; formula?: Quote['formula']; volumeM3?: number; distanceKm?: number; vatRate?: number; }): UUID {
		const id = uuid();
		const number = this.generateQuoteNumber(data.type);
		const items = data.items ?? [];
		const vatRate = data.vatRate ?? this.rateCard$.value.vatRate;
		const subtotalHt = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
		const totalTtc = Math.round((subtotalHt * (1 + vatRate)) * 100) / 100;
		const quote: Quote = { id, number, clientId: data.clientId, type: data.type, items, subtotalHt, vatRate, totalTtc, status: 'DRAFT', createdAt: new Date().toISOString(), formula: data.formula, volumeM3: data.volumeM3, distanceKm: data.distanceKm };
		this.quotes$.next([quote, ...this.quotes$.value]);
		return id;
	}

	sendQuote(id: UUID): void {
		this.updateQuote(id, { status: 'SENT' });
	}

	acceptQuote(id: UUID): void {
		this.updateQuote(id, { status: 'ACCEPTED' });
	}

	private updateQuote(id: UUID, patch: Partial<Quote>) {
		this.quotes$.next(this.quotes$.value.map(q => q.id === id ? { ...q, ...patch } : q));
	}

	private generateQuoteNumber(type: QuoteType): string {
		const prefix = type === 'PREDEVIS' ? 'PRD' : 'DEV';
		const seq = (this.quotes$.value.filter(q => q.type === type).length + 1).toString().padStart(4, '0');
		const year = new Date().getFullYear();
		return `${prefix}-${year}-${seq}`;
	}

	// Invoices
	createInvoiceFromQuote(quoteId: UUID): UUID {
		const quote = this.quotes$.value.find(q => q.id === quoteId);
		if (!quote) throw new Error('Quote not found');
		const id = uuid();
		const number = this.generateInvoiceNumber();
		const amountHt = quote.subtotalHt;
		const vatRate = quote.vatRate;
		const amountTtc = quote.totalTtc;
		const invoice: Invoice = { id, number, quoteId, clientId: quote.clientId, amountHt, vatRate, amountTtc, paidTtc: 0, status: 'DRAFT', issuedAt: new Date().toISOString() };
		this.invoices$.next([invoice, ...this.invoices$.value]);
		return id;
	}

	markInvoiceSent(id: UUID) { this.updateInvoice(id, { status: 'SENT' }); }
	markInvoicePaid(id: UUID, amount: number) {
		this.invoices$.next(this.invoices$.value.map(inv => inv.id === id ? { ...inv, paidTtc: inv.paidTtc + amount, status: inv.paidTtc + amount >= inv.amountTtc ? 'PAID' : 'PARTIAL' } : inv));
	}

	private updateInvoice(id: UUID, patch: Partial<Invoice>) {
		this.invoices$.next(this.invoices$.value.map(i => i.id === id ? { ...i, ...patch } : i));
	}

	private generateInvoiceNumber(): string {
		const seq = (this.invoices$.value.length + 1).toString().padStart(4, '0');
		const year = new Date().getFullYear();
		return `FAC-${year}-${seq}`;
	}

	// Missions & pay computation
	addMission(mission: Omit<Mission, 'id' | 'status'>): UUID {
		const id = uuid();
		this.missions$.next([{ id, status: 'PLANNED', ...mission }, ...this.missions$.value]);
		return id;
	}

	updateMissionStatus(id: UUID, status: MissionStatus) {
		this.missions$.next(this.missions$.value.map(m => m.id === id ? { ...m, status } : m));
	}

	computeMissionPayroll(missionId: UUID): { totalLaborCost: number; perRole: Partial<Record<TeamRole, number>> } {
		const mission = this.missions$.value.find(m => m.id === missionId);
		if (!mission) return { totalLaborCost: 0, perRole: {} };
		const rate = this.rateCard$.value;
		const perRole: Partial<Record<TeamRole, number>> = {};
		let total = 0;
		for (const member of mission.team) {
			const base = (rate.hourlyRates[member.role] ?? 0) * member.hours;
			const overtime = (rate.hourlyRates[member.role] ?? 0) * (member.overtimeHours ?? 0) * rate.overtimeMultiplier;
			const cost = Math.round((base + overtime) * 100) / 100;
			perRole[member.role] = (perRole[member.role] ?? 0) + cost;
			total += cost;
		}
		return { totalLaborCost: Math.round(total * 100) / 100, perRole };
	}

	// Email templates & sequences
	addEmailTemplate(t: Omit<EmailTemplate, 'id'>): UUID {
		const id = uuid();
		this.templates$.next([{ id, ...t }, ...this.templates$.value]);
		return id;
	}

	addEmailSequence(s: Omit<EmailSequence, 'id'>): UUID {
		const id = uuid();
		this.sequences$.next([{ id, ...s }, ...this.sequences$.value]);
		return id;
	}

	// Follow-ups (relances)
	addFollowUp(task: Omit<FollowUpTask, 'id' | 'status'>): UUID {
		const id = uuid();
		this.followUps$.next([{ id, status: 'PENDING', ...task }, ...this.followUps$.value]);
		return id;
	}
	completeFollowUp(id: UUID) {
		this.followUps$.next(this.followUps$.value.map(f => f.id === id ? { ...f, status: 'DONE' as FollowUpStatus } : f));
	}
}