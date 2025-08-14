import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AppStateService } from '../../services/app.state';
import { Observable, map } from 'rxjs';
import { Client, Quote } from '../../models/domain.models';

@Component({
	selector: 'app-devis',
	standalone: true,
	imports: [CommonModule, FormsModule, MatTabsModule, PdfViewerModule],
	templateUrl: './devis.component.html',
	styleUrl: './devis.component.scss'
})
export class DevisComponent {
	// Distance calc demo
	distanceSpinner = false;
	syncDistanceResponse: any[] | null = null;

	// Sync demo
	syncSpinner = false;
	syncGmailResponse: string | null = null;

	// Extraction demo
	extractionSpinner = false;
	promptContent = '';
	inputExtractResponse: string | null = null;

	// Quote creation form
	newClientId: string | null = null;
	newType: 'PREDEVIS' | 'DEVIS' = 'PREDEVIS';
	newFormula: 'Eco' | 'Confort' | 'Premium' = 'Confort';
	newVolume = 20;
	newDistance = 10;
	newItems = [
		{ description: 'Prestation déménagement', unitPrice: 50, quantity: 1 }
	];

	clients$!: Observable<Client[]>;
	quotes$!: Observable<Quote[]>;
	quotesToGenerate$!: Observable<Quote[]>;
	quotesToSend$!: Observable<Quote[]>;

	sendSpinner = false;
	reviewSpinner = false;
	generateSpinner = false;
	counter = 0;

	constructor(private state: AppStateService) {
		this.clients$ = this.state.clients;
		this.quotes$ = this.state.quotes;
		this.quotesToGenerate$ = this.quotes$.pipe(map(qs => qs.filter(q => q.status === 'DRAFT')));
		this.quotesToSend$ = this.quotes$.pipe(map(qs => qs.filter(q => q.status === 'SENT')));
	}

	createQuote(): void {
		if (!this.newClientId) return;
		const id = this.state.createQuote({ clientId: this.newClientId, type: this.newType, formula: this.newFormula, volumeM3: this.newVolume, distanceKm: this.newDistance, items: this.newItems, vatRate: undefined });
		// Attach sample PDF path for preview in this demo
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.state['quotes$'].next(this.state['quotes$'].value.map(q => q.id === id ? { ...q, pdfPath: '/assets/sample.pdf' } as Quote : q));
	}

	sendQuote(_: Event, quote: Quote, _type: 'Devis' | 'Facture') {
		this.sendSpinner = true;
		setTimeout(() => {
			this.state.sendQuote(quote.id);
			this.sendSpinner = false;
			alert(`Devis ${quote.number} envoyé`);
		}, 500);
	}

	sendQuoteToReview(_: Event, quote: Quote, _type: 'Devis') {
		this.reviewSpinner = true;
		setTimeout(() => {
			this.reviewSpinner = false;
			alert(`Devis ${quote.number} envoyé en correction`);
		}, 500);
	}

	acceptQuote(quote: Quote) {
		this.state.acceptQuote(quote.id);
	}

	generateInvoice(quote: Quote) {
		this.state.createInvoiceFromQuote(quote.id);
		alert('Facture générée depuis ' + quote.number);
	}

	returnQuotePath(quote: Quote, _type: 'Devis'): string {
		return quote.pdfPath ?? '/assets/sample.pdf';
	}

	// Distance calc mock
	syncDistanceQuotes(): void {
		this.distanceSpinner = true;
		setTimeout(() => {
			this.syncDistanceResponse = [
				{ name: 'Client A', property_rue_d_part: '1 Rue A', property_cp_ville_d_part: '75001 Paris', property_rue_arriv: '2 Rue B', property_cp_ville_arriv: '69000 Lyon', property_distance_km: 465, property_distance_r_el: 470 },
			];
			this.distanceSpinner = false;
		}, 1000);
	}

	syncGmailQuotes(): void {
		this.syncSpinner = true;
		this.counter++;
		setTimeout(() => {
			this.syncGmailResponse = '3 nouveaux devis importés';
			this.counter--;
			this.syncSpinner = false;
		}, 1000);
	}

	onPromptSubmit(): void {
		this.extractionSpinner = true;
		this.counter++;
		setTimeout(() => {
			this.inputExtractResponse = '{ id: 123, status: "ok" }';
			this.extractionSpinner = false;
			this.counter--;
		}, 1000);
	}
}
