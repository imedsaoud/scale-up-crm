import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MissionService } from '../services/mission.service';
import { 
  Mission, 
  UserRole, 
  MissionFormData, 
  CoordinationFormData, 
  CommercialFormData, 
  ComptableFormData 
} from '../models/mission.interface';

@Component({
  selector: 'app-mission-management',
  templateUrl: './mission-management.component.html',
  styleUrls: ['./mission-management.component.scss']
})
export class MissionManagementComponent implements OnInit {
  activeTab: UserRole = 'chef-equipe';
  missions$!: Observable<Mission[]>;
  selectedMission: Mission | null = null;
  showForm = false;

  // Loading states
  loading = false;

  // Form data
  missionFormData: MissionFormData = this.initializeMissionFormData();
  coordinationFormData: CoordinationFormData = this.initializeCoordinationFormData();
  commercialFormData: CommercialFormData = this.initializeCommercialFormData();
  comptableFormData: ComptableFormData = this.initializeComptableFormData();

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.loadMissionsForRole();
  }

  // Tab management
  onTabChange(role: UserRole): void {
    this.activeTab = role;
    this.loadMissionsForRole();
    this.closeForm();
  }

  private loadMissionsForRole(): void {
    this.missions$ = this.missionService.getMissionsForRole(this.activeTab);
  }

  // Mission and form management
  openForm(mission: Mission): void {
    this.selectedMission = mission;
    this.showForm = true;
    this.initializeFormData(mission);
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedMission = null;
    this.resetFormData();
  }

  // Form submission
  onSubmitForm(): void {
    if (!this.selectedMission) return;

    this.loading = true;

    // Simulate API call delay
    setTimeout(() => {
      let formData: any;
      
      switch (this.activeTab) {
        case 'chef-equipe':
          formData = this.missionFormData;
          break;
        case 'coordinateur':
          formData = this.coordinationFormData;
          break;
        case 'commercial':
          formData = this.commercialFormData;
          break;
        case 'comptable':
          formData = this.comptableFormData;
          break;
      }

      this.missionService.validateMission(this.selectedMission!.id, this.activeTab, formData);
      
      this.loading = false;
      this.closeForm();
      
      // Show success message
      alert('✅ Validation enregistrée avec succès !');
    }, 2000);
  }

  // Form data initialization
  private initializeFormData(mission: Mission): void {
    switch (this.activeTab) {
      case 'chef-equipe':
        this.missionFormData = {
          execution: {
            confirmedVolume: mission.volume,
            volumeStatus: 'OK',
            materials: ''
          },
          team: [...mission.team],
          logistics: {
            tolls: mission.costs.tolls,
            parking: 'OK'
          },
          incidents: {
            description: '',
            photos: []
          }
        };
        break;
      case 'coordinateur':
        this.coordinationFormData = {
          planning: 'OK',
          resources: 'OK',
          overtime: {
            hours: mission.costs.overtime / 25,
            cost: mission.costs.overtime
          },
          additionalCosts: '',
          sav: 'NON',
          notes: ''
        };
        break;
      case 'commercial':
        this.commercialFormData = {
          satisfaction: {
            rating: 'EXCELLENT',
            complaints: 'AUCUNE'
          },
          payment: {
            amountReceived: 0,
            method: '',
            signature: 'NON'
          },
          billing: {
            additionalCosts: mission.billing?.additionalCosts || 0,
            additionalCostsStatus: 'FACTURABLE',
            discountPercent: 0,
            discountAmount: 0
          },
          comments: {
            customerFeedback: '',
            loyaltyActions: ''
          }
        };
        break;
      case 'comptable':
        this.comptableFormData = {
          costs: {
            material: mission.costs.material,
            fuelTolls: mission.costs.fuel,
            labor: mission.costs.labor,
            other: 25
          },
          invoice: {
            number: mission.billing?.invoiceNumber || '',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            paymentMethod: 'VIREMENT'
          },
          profitability: {
            revenue: mission.billing?.totalHT || 0,
            totalCosts: mission.costs.total,
            grossMargin: (mission.billing?.totalHT || 0) - mission.costs.total,
            marginRate: ((mission.billing?.totalHT || 0) - mission.costs.total) / (mission.billing?.totalHT || 1) * 100
          },
          notes: ''
        };
        break;
    }
  }

  private resetFormData(): void {
    this.missionFormData = this.initializeMissionFormData();
    this.coordinationFormData = this.initializeCoordinationFormData();
    this.commercialFormData = this.initializeCommercialFormData();
    this.comptableFormData = this.initializeComptableFormData();
  }

  private initializeMissionFormData(): MissionFormData {
    return {
      execution: {
        confirmedVolume: 0,
        volumeStatus: 'OK',
        materials: ''
      },
      team: [],
      logistics: {
        tolls: 0,
        parking: 'OK'
      },
      incidents: {
        description: '',
        photos: []
      }
    };
  }

  private initializeCoordinationFormData(): CoordinationFormData {
    return {
      planning: 'OK',
      resources: 'OK',
      overtime: {
        hours: 0,
        cost: 0
      },
      additionalCosts: '',
      sav: 'NON',
      notes: ''
    };
  }

  private initializeCommercialFormData(): CommercialFormData {
    return {
      satisfaction: {
        rating: 'EXCELLENT',
        complaints: 'AUCUNE'
      },
      payment: {
        amountReceived: 0,
        method: '',
        signature: 'NON'
      },
      billing: {
        additionalCosts: 0,
        additionalCostsStatus: 'FACTURABLE',
        discountPercent: 0,
        discountAmount: 0
      },
      comments: {
        customerFeedback: '',
        loyaltyActions: ''
      }
    };
  }

  private initializeComptableFormData(): ComptableFormData {
    return {
      costs: {
        material: 0,
        fuelTolls: 0,
        labor: 0,
        other: 0
      },
      invoice: {
        number: '',
        date: '',
        dueDate: '',
        paymentMethod: 'VIREMENT'
      },
      profitability: {
        revenue: 0,
        totalCosts: 0,
        grossMargin: 0,
        marginRate: 0
      },
      notes: ''
    };
  }

  // Utility methods
  getMissionStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'terrain_pending': 'Terrain à valider',
      'coordination_pending': 'Coordination à valider',
      'commercial_pending': 'Commercial à valider',
      'comptable_pending': 'Clôture comptable',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  }

  getMissionStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'terrain_pending': '⏳',
      'coordination_pending': '📋',
      'commercial_pending': '💼',
      'comptable_pending': '🧮',
      'completed': '✅'
    };
    return iconMap[status] || '⏳';
  }

  getRoleBadgeText(role: UserRole): string {
    const roleMap: { [key: string]: string } = {
      'chef-equipe': '👷‍♂️ Chef d\'Équipe - Validation Terrain',
      'coordinateur': '📋 Coordinateur - Validation Opérationnelle',
      'commercial': '💼 Commercial - Validation Client',
      'comptable': '🧮 Comptable - Clôture Financière'
    };
    return roleMap[role] || role;
  }

  getTabTitle(role: UserRole): string {
    const titleMap: { [key: string]: string } = {
      'chef-equipe': 'Missions à valider terrain',
      'coordinateur': 'Missions à valider coordination',
      'commercial': 'Missions à valider commercial',
      'comptable': 'Missions à clôturer'
    };
    return titleMap[role] || role;
  }

  // File upload handling
  onFileUpload(event: any): void {
    const files = event.target.files;
    if (files && this.activeTab === 'chef-equipe') {
      this.missionFormData.incidents.photos = Array.from(files);
    }
  }

  // Team member updates
  updateTeamMember(index: number, field: 'overtimeHours' | 'delayMinutes', value: number): void {
    if (this.missionFormData.team[index]) {
      this.missionFormData.team[index][field] = value;
    }
  }

  // Calculation methods
  calculateOvertimeCost(): number {
    return this.coordinationFormData.overtime.hours * 25;
  }

  calculateTotalCosts(): number {
    const costs = this.comptableFormData.costs;
    return costs.material + costs.fuelTolls + costs.labor + costs.other;
  }

  calculateProfitability(): void {
    const revenue = this.comptableFormData.profitability.revenue;
    const totalCosts = this.calculateTotalCosts();
    this.comptableFormData.profitability.totalCosts = totalCosts;
    this.comptableFormData.profitability.grossMargin = revenue - totalCosts;
    this.comptableFormData.profitability.marginRate = revenue > 0 ? (revenue - totalCosts) / revenue * 100 : 0;
  }
}