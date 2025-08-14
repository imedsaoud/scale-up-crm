import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app.state';
import { map, combineLatest, Observable } from 'rxjs';

@Component({
	selector: 'app-clients',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './clients.component.html',
	styleUrl: './clients.component.scss'
})
export class ClientsComponent {
	term = '';
	name = '';
	email = '';
	phone = '';
	street = '';
	postalCode = '';
	city = '';

	filtered$!: Observable<any[]>;

	constructor(private appState: AppStateService) {
		this.filtered$ = combineLatest([this.appState.clients, this.appState.quotes, this.appState.invoices, this.appState.missions]).pipe(
			map(([clients, quotes, invoices, missions]) => {
				const term = this.term.trim().toLowerCase();
				const list = !term ? clients : clients.filter(c => c.name.toLowerCase().includes(term) || (c.email ?? '').toLowerCase().includes(term));
				return list.map(c => ({
					client: c,
					quotes: quotes.filter(q => q.clientId === c.id),
					invoices: invoices.filter(i => i.clientId === c.id),
					missions: missions.filter(m => m.clientId === c.id),
				}));
			})
		);
	}

	addClient(): void {
		if (!this.name.trim()) return;
		this.appState.addClient({ name: this.name.trim(), email: this.email.trim() || undefined, phone: this.phone.trim() || undefined, notes: undefined, addressFrom: { street: this.street, postalCode: this.postalCode, city: this.city }, addressTo: undefined });
		this.name = this.email = this.phone = this.street = this.postalCode = this.city = '';
	}
}