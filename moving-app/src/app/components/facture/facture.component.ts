import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
	selector: 'app-facture',
	standalone: true,
	imports: [CommonModule, PdfViewerModule],
	templateUrl: './facture.component.html',
	styleUrl: './facture.component.scss'
})
export class FactureComponent {
	generateSpinner = false;
	sendSpinner = false;
	reviewSpinner = false;
	counter = 0;
	invoicesToGenerate: any[] = [
		{ 'nom - prenom': 'DUPONT Marie', formule: 'Confort', type_mail: 'Gmail' },
	];
	invoicesToSend: any[] = [];

	generateQuotes(kind: 'Facture'): void {
		this.generateSpinner = true;
		this.counter++;
		setTimeout(() => {
			this.generateSpinner = false;
			this.counter--;
			this.invoicesToSend = [
				{ 'nom - prenom': 'DUPONT Marie', 'type_mail': 'Gmail', 'facture n°': 'F-2025-0001' },
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
