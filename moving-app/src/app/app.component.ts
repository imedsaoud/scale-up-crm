import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MissionsComponent } from './components/missions/missions.component';
import { DevisComponent } from './components/devis/devis.component';
import { FactureComponent } from './components/facture/facture.component';
import { ClientsComponent } from './components/clients/clients.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [MatTabsModule, MissionsComponent, DevisComponent, FactureComponent, ClientsComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent {
	title = 'moving-app';
}
