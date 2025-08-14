import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Mission, 
  MissionFormData, 
  CoordinationFormData, 
  CommercialFormData, 
  ComptableFormData,
  UserRole,
  TeamMember
} from '../models/mission.interface';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private missionsSubject = new BehaviorSubject<Mission[]>(this.getMockMissions());
  public missions$ = this.missionsSubject.asObservable();

  constructor() { }

  // Get missions for a specific role
  getMissionsForRole(role: UserRole): Observable<Mission[]> {
    return new Observable(observer => {
      this.missions$.subscribe(missions => {
        let filteredMissions: Mission[] = [];
        
        switch (role) {
          case 'chef-equipe':
            filteredMissions = missions.filter(m => m.status === 'terrain_pending');
            break;
          case 'coordinateur':
            filteredMissions = missions.filter(m => m.status === 'coordination_pending');
            break;
          case 'commercial':
            filteredMissions = missions.filter(m => m.status === 'commercial_pending');
            break;
          case 'comptable':
            filteredMissions = missions.filter(m => m.status === 'comptable_pending');
            break;
        }
        
        observer.next(filteredMissions);
      });
    });
  }

  // Update mission after validation
  validateMission(missionId: string, role: UserRole, formData: any): void {
    const missions = this.missionsSubject.value;
    const mission = missions.find(m => m.id === missionId);
    
    if (!mission) return;

    switch (role) {
      case 'chef-equipe':
        this.updateTerrainValidation(mission, formData as MissionFormData);
        mission.status = 'coordination_pending';
        break;
      case 'coordinateur':
        this.updateCoordinationValidation(mission, formData as CoordinationFormData);
        mission.status = 'commercial_pending';
        break;
      case 'commercial':
        this.updateCommercialValidation(mission, formData as CommercialFormData);
        mission.status = 'comptable_pending';
        break;
      case 'comptable':
        this.updateComptableValidation(mission, formData as ComptableFormData);
        mission.status = 'completed';
        break;
    }

    this.missionsSubject.next([...missions]);
  }

  private updateTerrainValidation(mission: Mission, formData: MissionFormData): void {
    mission.validation.terrain.status = 'completed';
    mission.validation.terrain.validatedAt = new Date();
    mission.validation.coordination.status = 'pending';
    
    // Update mission data
    mission.volume = formData.execution.confirmedVolume;
    mission.team = formData.team;
    mission.costs.tolls = formData.logistics.tolls;
    
    // Calculate overtime costs
    const overtimeCost = formData.team.reduce((total, member) => 
      total + (member.overtimeHours * 25), 0);
    mission.costs.overtime = overtimeCost;
  }

  private updateCoordinationValidation(mission: Mission, formData: CoordinationFormData): void {
    mission.validation.coordination.status = 'completed';
    mission.validation.coordination.validatedAt = new Date();
    mission.validation.commercial.status = 'pending';
    
    mission.costs.additional = formData.overtime.cost;
    mission.validation.coordination.notes = formData.notes;
  }

  private updateCommercialValidation(mission: Mission, formData: CommercialFormData): void {
    mission.validation.commercial.status = 'completed';
    mission.validation.commercial.validatedAt = new Date();
    mission.validation.comptable.status = 'pending';
    
    if (mission.satisfaction) {
      mission.satisfaction.rating = this.mapRatingToNumber(formData.satisfaction.rating);
      mission.satisfaction.complaints = this.mapComplaintsToType(formData.satisfaction.complaints);
    }

    if (mission.billing) {
      mission.billing.paidAmount = formData.payment.amountReceived;
      mission.billing.paymentMethod = this.mapPaymentMethod(formData.payment.method);
      mission.billing.signatureStatus = this.mapSignatureStatus(formData.payment.signature);
      mission.billing.additionalCosts = formData.billing.additionalCosts;
      mission.billing.discount = formData.billing.discountAmount || 
        (formData.billing.discountPercent * mission.billing.baseAmount / 100);
    }
  }

  private updateComptableValidation(mission: Mission, formData: ComptableFormData): void {
    mission.validation.comptable.status = 'completed';
    mission.validation.comptable.validatedAt = new Date();
    
    // Update costs
    mission.costs.material = formData.costs.material;
    mission.costs.fuel = formData.costs.fuelTolls;
    mission.costs.labor = formData.costs.labor;
    mission.costs.total = formData.costs.material + formData.costs.fuelTolls + 
                         formData.costs.labor + formData.costs.other;

    if (mission.billing) {
      mission.billing.invoiceNumber = formData.invoice.number;
      mission.billing.totalCosts = mission.costs.total;
      mission.billing.profitMargin = formData.profitability.grossMargin;
      mission.billing.profitRate = formData.profitability.marginRate;
    }
  }

  // Helper methods for data mapping
  private mapRatingToNumber(rating: string): 1 | 2 | 3 | 4 | 5 {
    const ratingMap: { [key: string]: 1 | 2 | 3 | 4 | 5 } = {
      'MAUVAIS': 1,
      'MEDIOCRE': 2,
      'CORRECT': 3,
      'BON': 4,
      'EXCELLENT': 5
    };
    return ratingMap[rating] || 3;
  }

  private mapComplaintsToType(complaints: string): 'none' | 'minor' | 'major' {
    const complaintsMap: { [key: string]: 'none' | 'minor' | 'major' } = {
      'AUCUNE': 'none',
      'MINEURE': 'minor',
      'MAJEURE': 'major'
    };
    return complaintsMap[complaints] || 'none';
  }

  private mapPaymentMethod(method: string): 'especes' | 'cb' | 'cheque' | 'virement' | undefined {
    const methodMap: { [key: string]: 'especes' | 'cb' | 'cheque' | 'virement' } = {
      'ESPECES': 'especes',
      'CB': 'cb',
      'CHEQUE': 'cheque',
      'VIREMENT': 'virement'
    };
    return methodMap[method];
  }

  private mapSignatureStatus(signature: string): 'signed' | 'not_signed' | 'electronic' {
    const signatureMap: { [key: string]: 'signed' | 'not_signed' | 'electronic' } = {
      'OUI': 'signed',
      'NON': 'not_signed',
      'ELECTRONIQUE': 'electronic'
    };
    return signatureMap[signature] || 'not_signed';
  }

  // Mock data generator
  private getMockMissions(): Mission[] {
    return [
      {
        id: '1',
        client: 'DUPONT Marie',
        date: '2025-08-15',
        origin: 'Paris',
        destination: 'Lyon',
        volume: 45,
        truck: 'AB-123-CD',
        team: [
          {
            id: '1',
            name: 'MARTIN Jean',
            role: 'Chef d\'équipe',
            overtimeHours: 0,
            delayMinutes: 0
          },
          {
            id: '2',
            name: 'DURAND Pierre',
            role: 'Déménageur',
            overtimeHours: 0,
            delayMinutes: 0
          }
        ],
        groupage: true,
        groupageClient: 'MARTIN',
        status: 'terrain_pending',
        validation: {
          terrain: { status: 'pending' },
          coordination: { status: 'pending' },
          commercial: { status: 'pending' },
          comptable: { status: 'pending' }
        },
        costs: {
          material: 45,
          fuel: 85,
          labor: 650,
          overtime: 0,
          tolls: 0,
          parking: 0,
          additional: 0,
          total: 780
        },
        satisfaction: {
          rating: 5,
          complaints: 'none'
        },
        billing: {
          invoiceNumber: 'FAC-2025-0847',
          baseAmount: 1250,
          additionalCosts: 0,
          discount: 0,
          totalHT: 1250,
          totalTTC: 1500,
          paidAmount: 0,
          signatureStatus: 'not_signed',
          profitMargin: 470,
          profitRate: 37.6
        }
      },
      {
        id: '2',
        client: 'BERNARD Paul',
        date: '2025-08-14',
        origin: 'Marseille',
        destination: 'Nice',
        volume: 28,
        truck: 'EF-456-GH',
        team: [
          {
            id: '3',
            name: 'LOPEZ Carlos',
            role: 'Chef d\'équipe',
            overtimeHours: 0,
            delayMinutes: 0
          },
          {
            id: '4',
            name: 'DUBOIS Michel',
            role: 'Déménageur',
            overtimeHours: 0,
            delayMinutes: 0
          }
        ],
        groupage: false,
        status: 'terrain_pending',
        validation: {
          terrain: { status: 'pending' },
          coordination: { status: 'pending' },
          commercial: { status: 'pending' },
          comptable: { status: 'pending' }
        },
        costs: {
          material: 30,
          fuel: 65,
          labor: 450,
          overtime: 0,
          tolls: 0,
          parking: 0,
          additional: 0,
          total: 545
        },
        billing: {
          invoiceNumber: 'FAC-2025-0848',
          baseAmount: 890,
          additionalCosts: 0,
          discount: 0,
          totalHT: 890,
          totalTTC: 1068,
          paidAmount: 0,
          signatureStatus: 'not_signed',
          profitMargin: 345,
          profitRate: 38.8
        }
      }
    ];
  }
}