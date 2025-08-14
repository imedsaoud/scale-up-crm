import { Component } from '@angular/core';

@Component({
	selector: 'app-missions',
	standalone: true,
	imports: [],
	templateUrl: './missions.component.html',
	styleUrl: './missions.component.scss'
})
export class MissionsComponent {
	activeTab: 'chef-equipe' | 'coordinateur' | 'commercial' | 'comptable' = 'chef-equipe';
	activeFormId: string | null = null;

	selectTab(tab: 'chef-equipe' | 'coordinateur' | 'commercial' | 'comptable'): void {
		this.activeTab = tab;
		this.activeFormId = null;
	}

	openForm(formId: string): void {
		this.activeFormId = formId;
	}

	closeForm(formId: string): void {
		if (this.activeFormId === formId) {
			this.activeFormId = null;
		}
	}

	triggerFileInput(input: HTMLInputElement): void {
		input.click();
	}

	onSubmit(event: Event): void {
		event.preventDefault();
		alert('✅ Validation enregistrée avec succès !');
		this.activeFormId = null;
	}
}
