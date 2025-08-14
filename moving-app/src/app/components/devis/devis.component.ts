import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
	selector: 'app-devis',
	standalone: true,
	imports: [CommonModule, FormsModule, MatTabsModule, PdfViewerModule],
	templateUrl: './devis.component.html',
	styleUrl: './devis.component.scss'
})
export class DevisComponent {
	distanceSpinner = false;
	syncDistanceResponse: any[] | null = null;
	syncSpinner = false;
	syncGmailResponse: string | null = null;
	extractionSpinner = false;
	promptContent = '';
	inputExtractResponse: string | null = null;
	quotesToGenerate: any[] = [];
	quotesToSend: any[] = [];
	spinner = false;
	generateSpinner = false;
	sendSpinner = false;
	reviewSpinner = false;
	counter = 0;

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
			this.quotesToGenerate = [
				{ 'nom - prenom': 'DUPONT Marie', formule: 'Confort' },
				{ 'nom - prenom': 'BERNARD Paul', formule: 'Eco' },
			];
		}, 1000);
	}

	generateQuotes(kind: 'Devis' | 'Facture'): void {
		this.generateSpinner = true;
		this.counter++;
		setTimeout(() => {
			this.generateSpinner = false;
			this.counter--;
			this.quotesToSend = [
				{ 'nom - prenom': 'DUPONT Marie', 'type_mail': 'Gmail', 'devis n°': 'D-2025-0001' },
			];
		}, 1000);
	}

	returnQuotePath(quote: any, type: 'Devis' | 'Facture'): string {
		return '/assets/sample.pdf';
	}

	sendQuote(event: Event, quote: any, type: 'Devis' | 'Facture'): void {
		event.preventDefault();
		this.sendSpinner = true;
		setTimeout(() => {
			this.sendSpinner = false;
			alert(`${type} envoyé à ${quote['nom - prenom']}`);
		}, 800);
	}

	sendQuoteToReview(event: Event, quote: any, type: 'Devis' | 'Facture'): void {
		event.preventDefault();
		this.reviewSpinner = true;
		setTimeout(() => {
			this.reviewSpinner = false;
			alert(`${type} envoyé en correction pour ${quote['nom - prenom']}`);
		}, 800);
	}
}
