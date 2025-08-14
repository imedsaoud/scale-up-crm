import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DevisService } from '../services/devis.service';
import { 
  PreDevis, 
  Devis, 
  Client, 
  ServiceDevis, 
  OptionDevis 
} from '../models/extended-interfaces';

@Component({
  selector: 'app-devis-generator',
  templateUrl: './devis-generator.component.html',
  styleUrls: ['./devis-generator.component.scss']
})
export class DevisGeneratorComponent implements OnInit {
  // Étapes du workflow
  currentStep = 1;
  totalSteps = 5;

  // Données du devis
  selectedClient: Client | null = null;
  currentPreDevis: PreDevis | null = null;
  
  // États de chargement
  loading = false;
  calculatingDistance = false;
  generatingPDF = false;

  // Observables
  preDevis$!: Observable<PreDevis[]>;
  devis$!: Observable<Devis[]>;
  services$!: Observable<ServiceDevis[]>;
  options$!: Observable<OptionDevis[]>;

  // Formulaire de création
  formData = {
    client: {
      type: 'particulier',
      civilite: 'M',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: {
        rue: '',
        codePostal: '',
        ville: '',
        etage: 0,
        ascenseur: false,
        acces: 'facile',
        parking: false
      }
    },
    demenagement: {
      adresseDepart: {
        rue: '',
        codePostal: '',
        ville: '',
        etage: 0,
        ascenseur: false,
        acces: 'facile',
        parking: false
      },
      adresseArrivee: {
        rue: '',
        codePostal: '',
        ville: '',
        etage: 0,
        ascenseur: false,
        acces: 'facile',
        parking: false
      },
      dateDemenagement: '',
      volumeEstime: 20,
      typeLogement: 'T2'
    },
    services: [] as ServiceDevis[],
    options: [] as OptionDevis[],
    remise: {
      pourcentage: 0,
      motif: ''
    },
    commentaires: ''
  };

  // Options disponibles
  typesLogement = [
    { value: 'studio', label: 'Studio' },
    { value: 'T1', label: 'T1' },
    { value: 'T2', label: 'T2' },
    { value: 'T3', label: 'T3' },
    { value: 'T4', label: 'T4' },
    { value: 'T5+', label: 'T5+' },
    { value: 'maison', label: 'Maison' },
    { value: 'bureau', label: 'Bureau' }
  ];

  accesTypes = [
    { value: 'facile', label: 'Accès facile' },
    { value: 'difficile', label: 'Accès difficile' },
    { value: 'monte-charge', label: 'Monte-charge nécessaire' }
  ];

  constructor(private devisService: DevisService) {}

  ngOnInit(): void {
    this.loadData();
  }

  // ==================== GESTION DES DONNÉES ====================

  private loadData(): void {
    this.preDevis$ = this.devisService.preDevis$;
    this.devis$ = this.devisService.devis$;
    this.services$ = this.devisService.services$;
    this.options$ = this.devisService.options$;
  }

  // ==================== NAVIGATION ÉTAPES ====================

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  canGoToStep(step: number): boolean {
    // Logique de validation des étapes précédentes
    switch (step) {
      case 2:
        return this.isStep1Valid();
      case 3:
        return this.isStep1Valid() && this.isStep2Valid();
      case 4:
        return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid();
      case 5:
        return this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid() && this.isStep4Valid();
      default:
        return true;
    }
  }

  // ==================== VALIDATION DES ÉTAPES ====================

  isStep1Valid(): boolean {
    const client = this.formData.client;
    return !!(client.nom && client.email && client.telephone &&
              client.adresse.rue && client.adresse.codePostal && client.adresse.ville);
  }

  isStep2Valid(): boolean {
    const dem = this.formData.demenagement;
    return !!(dem.adresseDepart.rue && dem.adresseDepart.codePostal && dem.adresseDepart.ville &&
              dem.adresseArrivee.rue && dem.adresseArrivee.codePostal && dem.adresseArrivee.ville &&
              dem.dateDemenagement && dem.volumeEstime > 0);
  }

  isStep3Valid(): boolean {
    return true; // Les services sont optionnels
  }

  isStep4Valid(): boolean {
    return true; // Les options sont optionnelles
  }

  // ==================== GESTION DES SERVICES ====================

  toggleService(service: ServiceDevis): void {
    const index = this.formData.services.findIndex(s => s.id === service.id);
    if (index === -1) {
      // Ajouter le service
      this.formData.services.push({ ...service, quantite: 1 });
    } else {
      // Retirer le service
      this.formData.services.splice(index, 1);
    }
    this.recalculatePreview();
  }

  isServiceSelected(serviceId: string): boolean {
    return this.formData.services.some(s => s.id === serviceId);
  }

  updateServiceQuantity(serviceId: string, quantite: number): void {
    const service = this.formData.services.find(s => s.id === serviceId);
    if (service) {
      service.quantite = Math.max(1, quantite);
      this.recalculatePreview();
    }
  }

  // ==================== GESTION DES OPTIONS ====================

  toggleOption(option: OptionDevis): void {
    const index = this.formData.options.findIndex(o => o.id === option.id);
    if (index === -1) {
      // Ajouter l'option
      this.formData.options.push({ ...option, inclus: true });
    } else {
      // Retirer l'option
      this.formData.options.splice(index, 1);
    }
    this.recalculatePreview();
  }

  isOptionSelected(optionId: string): boolean {
    return this.formData.options.some(o => o.id === optionId);
  }

  // ==================== CALCULS ET PRÉVISUALISATION ====================

  private recalculatePreview(): void {
    if (this.currentPreDevis) {
      this.currentPreDevis.services = [...this.formData.services];
      this.currentPreDevis.options = [...this.formData.options];
      this.devisService.updatePreDevis(this.currentPreDevis).subscribe();
    }
  }

  calculateVolumeEstimate(): void {
    // Estimation basée sur le type de logement
    const volumeMap: { [key: string]: number } = {
      'studio': 15,
      'T1': 20,
      'T2': 30,
      'T3': 45,
      'T4': 60,
      'T5+': 75,
      'maison': 90,
      'bureau': 40
    };

    this.formData.demenagement.volumeEstime = volumeMap[this.formData.demenagement.typeLogement] || 30;
  }

  // ==================== CRÉATION ET GÉNÉRATION ====================

  async createPreDevis(): Promise<void> {
    if (!this.isStep1Valid() || !this.isStep2Valid()) {
      return;
    }

    this.loading = true;

    try {
      // Créer le client temporaire
      const client: Client = {
        id: 'temp_' + Date.now(),
        type: this.formData.client.type as 'particulier' | 'professionnel',
        civilite: this.formData.client.civilite as 'M' | 'Mme' | 'Mlle',
        nom: this.formData.client.nom,
        prenom: this.formData.client.prenom,
        email: this.formData.client.email,
        telephone: this.formData.client.telephone,
        adresse: this.formData.client.adresse,
        dateCreation: new Date(),
        source: 'web',
        statut: 'prospect',
        scoreQualite: 3
      };

      // Créer le pré-devis
      const preDevis = await this.devisService.createPreDevis(client, this.formData.demenagement).toPromise();
      this.currentPreDevis = preDevis;
      this.selectedClient = client;
      
      // Passer à l'étape suivante
      this.nextStep();

    } catch (error) {
      console.error('Erreur lors de la création du pré-devis:', error);
    } finally {
      this.loading = false;
    }
  }

  async generateDevis(): Promise<void> {
    if (!this.currentPreDevis) {
      return;
    }

    this.generatingPDF = true;

    try {
      // Mettre à jour le pré-devis avec les dernières données
      this.currentPreDevis.services = [...this.formData.services];
      this.currentPreDevis.options = [...this.formData.options];
      this.currentPreDevis.commentaires = this.formData.commentaires;
      this.currentPreDevis.tarification.remise = {
        pourcentage: this.formData.remise.pourcentage,
        montant: 0,
        motif: this.formData.remise.motif
      };

      await this.devisService.updatePreDevis(this.currentPreDevis).toPromise();

      // Convertir en devis final
      const devis = await this.devisService.convertirEnDevis(this.currentPreDevis).toPromise();
      
      // Afficher le résultat
      this.nextStep();

    } catch (error) {
      console.error('Erreur lors de la génération du devis:', error);
    } finally {
      this.generatingPDF = false;
    }
  }

  // ==================== ACTIONS DEVIS ====================

  async sendDevis(devis: Devis): Promise<void> {
    this.loading = true;

    const emailData = {
      destinataire: devis.client.email,
      sujet: `Devis de déménagement ${devis.numero}`,
      template: 'devis_standard'
    };

    try {
      await this.devisService.envoyerDevis(devis, emailData).toPromise();
      alert('✅ Devis envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('❌ Erreur lors de l\'envoi du devis');
    } finally {
      this.loading = false;
    }
  }

  downloadPDF(devis: Devis): void {
    if (devis.documentsPDF.devis) {
      // Simuler le téléchargement
      const link = document.createElement('a');
      link.href = devis.documentsPDF.devis;
      link.download = `devis-${devis.numero}.pdf`;
      link.click();
    }
  }

  // ==================== RESET ET NOUVEAU DEVIS ====================

  startNewQuote(): void {
    this.currentStep = 1;
    this.currentPreDevis = null;
    this.selectedClient = null;
    this.formData = {
      client: {
        type: 'particulier',
        civilite: 'M',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: {
          rue: '',
          codePostal: '',
          ville: '',
          etage: 0,
          ascenseur: false,
          acces: 'facile',
          parking: false
        }
      },
      demenagement: {
        adresseDepart: {
          rue: '',
          codePostal: '',
          ville: '',
          etage: 0,
          ascenseur: false,
          acces: 'facile',
          parking: false
        },
        adresseArrivee: {
          rue: '',
          codePostal: '',
          ville: '',
          etage: 0,
          ascenseur: false,
          acces: 'facile',
          parking: false
        },
        dateDemenagement: '',
        volumeEstime: 20,
        typeLogement: 'T2'
      },
      services: [],
      options: [],
      remise: {
        pourcentage: 0,
        motif: ''
      },
      commentaires: ''
    };
  }

  // ==================== HELPERS ====================

  getStepTitle(step: number): string {
    const titles = [
      '',
      'Informations client',
      'Détails du déménagement',
      'Services additionnels',
      'Options et tarification',
      'Génération du devis'
    ];
    return titles[step] || '';
  }

  getStepIcon(step: number): string {
    const icons = [
      '',
      '👤',
      '🏠',
      '📦',
      '💰',
      '📄'
    ];
    return icons[step] || '';
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  }
}