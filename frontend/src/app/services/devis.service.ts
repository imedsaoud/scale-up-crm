import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  PreDevis, 
  Devis, 
  Client, 
  ServiceDevis, 
  OptionDevis, 
  TarificationDevis,
  HistoriqueDevis 
} from '../models/extended-interfaces';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private devisSubject = new BehaviorSubject<Devis[]>(this.getMockDevis());
  private preDevisSubject = new BehaviorSubject<PreDevis[]>(this.getMockPreDevis());
  private servicesSubject = new BehaviorSubject<ServiceDevis[]>(this.getMockServices());
  private optionsSubject = new BehaviorSubject<OptionDevis[]>(this.getMockOptions());

  public devis$ = this.devisSubject.asObservable();
  public preDevis$ = this.preDevisSubject.asObservable();
  public services$ = this.servicesSubject.asObservable();
  public options$ = this.optionsSubject.asObservable();

  constructor() {}

  // ==================== GESTION DES PRÉ-DEVIS ====================
  
  createPreDevis(client: Client, donnees: any): Observable<PreDevis> {
    const preDevis: PreDevis = {
      id: this.generateId(),
      clientId: client.id,
      client: client,
      dateCreation: new Date(),
      dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      statut: 'brouillon',
      adresseDepart: donnees.adresseDepart,
      adresseArrivee: donnees.adresseArrivee,
      dateDevis: new Date(),
      dateDemenagement: donnees.dateDemenagement,
      volumeEstime: donnees.volumeEstime,
      typeLogement: donnees.typeLogement,
      services: [],
      calculDistance: {
        kilometres: 0,
        dureeTrajet: 0,
        peages: 0
      },
      tarification: this.initializeTarification(),
      options: [],
      commercial: 'current_user',
      version: 1
    };

    // Calcul automatique de la distance
    this.calculerDistance(preDevis.adresseDepart, preDevis.adresseArrivee)
      .subscribe(distance => {
        preDevis.calculDistance = distance;
        this.recalculerTarification(preDevis);
      });

    const preDevisList = this.preDevisSubject.value;
    preDevisList.push(preDevis);
    this.preDevisSubject.next([...preDevisList]);

    return of(preDevis).pipe(delay(500));
  }

  updatePreDevis(preDevis: PreDevis): Observable<PreDevis> {
    this.recalculerTarification(preDevis);
    
    const preDevisList = this.preDevisSubject.value;
    const index = preDevisList.findIndex(p => p.id === preDevis.id);
    
    if (index !== -1) {
      preDevisList[index] = { ...preDevis };
      this.preDevisSubject.next([...preDevisList]);
    }

    return of(preDevis).pipe(delay(300));
  }

  convertirEnDevis(preDevis: PreDevis): Observable<Devis> {
    const devis: Devis = {
      ...preDevis,
      numero: this.genererNumeroDevis(),
      validite: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
      conditionsParticulieres: '',
      documentsPDF: {
        devis: '',
        conditions: '',
        annexes: []
      },
      historique: [{
        date: new Date(),
        action: 'creation',
        utilisateur: 'current_user',
        details: 'Conversion du pré-devis en devis'
      }],
      validation: {
        clientNom: ''
      }
    };

    // Génération du PDF
    this.genererPDFDevis(devis).subscribe(pdfUrl => {
      devis.documentsPDF.devis = pdfUrl;
    });

    const devisList = this.devisSubject.value;
    devisList.push(devis);
    this.devisSubject.next([...devisList]);

    return of(devis).pipe(delay(1000));
  }

  // ==================== CALCULS AUTOMATIQUES ====================

  private recalculerTarification(preDevis: PreDevis): void {
    let baseHT = 0;
    let options = 0;

    // Calcul base selon volume et distance
    const tarifVolume = preDevis.volumeEstime * 25; // 25€/m³
    const tarifDistance = preDevis.calculDistance.kilometres * 1.2; // 1.2€/km
    const tarifBase = Math.max(tarifVolume, tarifDistance, 200); // minimum 200€

    // Ajout des services
    preDevis.services.forEach(service => {
      baseHT += service.prix * service.quantite;
    });

    // Ajout des options
    preDevis.options.forEach(option => {
      if (option.inclus) {
        options += option.prix;
      }
    });

    baseHT += tarifBase;
    const sousTotal = baseHT + options;
    
    // Application de la remise
    const montantRemise = (preDevis.tarification.remise?.pourcentage || 0) * sousTotal / 100;
    const totalHT = sousTotal - montantRemise;
    const tva = totalHT * 0.20; // TVA 20%
    const totalTTC = totalHT + tva;
    const acompte = totalTTC * 0.30; // Acompte 30%

    preDevis.tarification = {
      baseHT,
      options,
      sousTotal,
      remise: preDevis.tarification.remise || { pourcentage: 0, montant: montantRemise },
      totalHT,
      tva,
      totalTTC,
      acompte,
      resteAPayer: totalTTC - acompte
    };
  }

  private calculerDistance(depart: any, arrivee: any): Observable<any> {
    // Simulation d'un appel API de géolocalisation
    return of({
      kilometres: Math.floor(Math.random() * 500) + 50,
      dureeTrajet: Math.floor(Math.random() * 300) + 60,
      peages: Math.floor(Math.random() * 50) + 10
    }).pipe(delay(1000));
  }

  // ==================== GÉNÉRATION PDF ====================

  genererPDFDevis(devis: Devis): Observable<string> {
    // Simulation de génération PDF
    return of(`/assets/pdf/devis-${devis.numero}.pdf`).pipe(delay(2000));
  }

  genererPDFConditions(): Observable<string> {
    return of('/assets/pdf/conditions-generales.pdf').pipe(delay(1000));
  }

  // ==================== EMAILS & ENVOI ====================

  envoyerDevis(devis: Devis, emailData: any): Observable<boolean> {
    // Ajout à l'historique
    devis.historique.push({
      date: new Date(),
      action: 'envoi',
      utilisateur: 'current_user',
      details: `Envoyé à ${emailData.destinataire}`
    });

    devis.statut = 'envoye';
    this.updateDevis(devis);

    return of(true).pipe(delay(1500));
  }

  // ==================== GESTION DES SERVICES ET OPTIONS ====================

  ajouterService(preDevis: PreDevis, service: ServiceDevis): void {
    preDevis.services.push(service);
    this.recalculerTarification(preDevis);
  }

  supprimerService(preDevis: PreDevis, serviceId: string): void {
    preDevis.services = preDevis.services.filter(s => s.id !== serviceId);
    this.recalculerTarification(preDevis);
  }

  toggleOption(preDevis: PreDevis, optionId: string): void {
    const option = preDevis.options.find(o => o.id === optionId);
    if (option) {
      option.inclus = !option.inclus;
      this.recalculerTarification(preDevis);
    }
  }

  // ==================== RECHERCHE & FILTRES ====================

  rechercherDevis(criteres: any): Observable<Devis[]> {
    return this.devis$.pipe(
      map(devis => devis.filter(d => {
        let match = true;

        if (criteres.terme) {
          const terme = criteres.terme.toLowerCase();
          match = match && (
            d.client.nom.toLowerCase().includes(terme) ||
            d.numero.toLowerCase().includes(terme)
          );
        }

        if (criteres.statut && criteres.statut.length > 0) {
          match = match && criteres.statut.includes(d.statut);
        }

        if (criteres.dateDebut) {
          match = match && new Date(d.dateCreation) >= new Date(criteres.dateDebut);
        }

        if (criteres.dateFin) {
          match = match && new Date(d.dateCreation) <= new Date(criteres.dateFin);
        }

        if (criteres.commercial) {
          match = match && d.commercial === criteres.commercial;
        }

        return match;
      }))
    );
  }

  // ==================== STATISTIQUES ====================

  getStatistiquesDevis(): Observable<any> {
    return this.devis$.pipe(
      map(devis => {
        const total = devis.length;
        const envoyes = devis.filter(d => d.statut === 'envoye').length;
        const acceptes = devis.filter(d => d.statut === 'accepte').length;
        const refuses = devis.filter(d => d.statut === 'refuse').length;
        const expires = devis.filter(d => d.statut === 'expire').length;

        const chiffreAffaires = devis
          .filter(d => d.statut === 'accepte')
          .reduce((sum, d) => sum + d.tarification.totalTTC, 0);

        const panierMoyen = acceptes > 0 ? chiffreAffaires / acceptes : 0;
        const tauxConversion = envoyes > 0 ? (acceptes / envoyes) * 100 : 0;

        return {
          total,
          envoyes,
          acceptes,
          refuses,
          expires,
          chiffreAffaires,
          panierMoyen,
          tauxConversion
        };
      })
    );
  }

  // ==================== HELPERS PRIVÉS ====================

  private updateDevis(devis: Devis): void {
    const devisList = this.devisSubject.value;
    const index = devisList.findIndex(d => d.id === devis.id);
    
    if (index !== -1) {
      devisList[index] = { ...devis };
      this.devisSubject.next([...devisList]);
    }
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  private genererNumeroDevis(): string {
    const annee = new Date().getFullYear();
    const mois = String(new Date().getMonth() + 1).padStart(2, '0');
    const numero = String(this.devisSubject.value.length + 1).padStart(4, '0');
    return `DEV-${annee}${mois}-${numero}`;
  }

  private initializeTarification(): TarificationDevis {
    return {
      baseHT: 0,
      options: 0,
      sousTotal: 0,
      remise: { pourcentage: 0, montant: 0 },
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
      acompte: 0,
      resteAPayer: 0
    };
  }

  // ==================== DONNÉES MOCK ====================

  private getMockDevis(): Devis[] {
    return [
      {
        id: '1',
        numero: 'DEV-202501-0001',
        clientId: 'client1',
        client: this.getMockClient(),
        dateCreation: new Date('2025-01-10'),
        dateExpiration: new Date('2025-02-10'),
        validite: new Date('2025-03-10'),
        statut: 'envoye',
        adresseDepart: this.getMockAdresse('Paris'),
        adresseArrivee: this.getMockAdresse('Lyon'),
        dateDevis: new Date('2025-01-10'),
        dateDemenagement: new Date('2025-02-15'),
        volumeEstime: 45,
        typeLogement: 'T3',
        services: this.getMockServices().slice(0, 3),
        calculDistance: {
          kilometres: 465,
          dureeTrajet: 280,
          peages: 35
        },
        tarification: {
          baseHT: 1250,
          options: 150,
          sousTotal: 1400,
          remise: { pourcentage: 5, montant: 70 },
          totalHT: 1330,
          tva: 266,
          totalTTC: 1596,
          acompte: 479,
          resteAPayer: 1117
        },
        options: this.getMockOptions().slice(0, 2),
        commercial: 'Jean Dupont',
        version: 1,
        conditionsParticulieres: 'Accès difficile côté départ',
        documentsPDF: {
          devis: '/assets/pdf/devis-DEV-202501-0001.pdf',
          conditions: '/assets/pdf/conditions-generales.pdf'
        },
        historique: [
          {
            date: new Date('2025-01-10'),
            action: 'creation',
            utilisateur: 'Jean Dupont',
            details: 'Création du devis'
          },
          {
            date: new Date('2025-01-10'),
            action: 'envoi',
            utilisateur: 'Jean Dupont',
            details: 'Envoyé au client'
          }
        ],
        validation: {
          clientNom: 'Marie Dupont'
        }
      }
    ];
  }

  private getMockPreDevis(): PreDevis[] {
    return [
      {
        id: 'pre1',
        clientId: 'client2',
        client: this.getMockClient('Bernard'),
        dateCreation: new Date('2025-01-12'),
        dateExpiration: new Date('2025-02-12'),
        statut: 'brouillon',
        adresseDepart: this.getMockAdresse('Marseille'),
        adresseArrivee: this.getMockAdresse('Nice'),
        dateDevis: new Date('2025-01-12'),
        dateDemenagement: new Date('2025-02-20'),
        volumeEstime: 28,
        typeLogement: 'T2',
        services: [],
        calculDistance: {
          kilometres: 200,
          dureeTrajet: 120,
          peages: 15
        },
        tarification: this.initializeTarification(),
        options: [],
        commercial: 'Sophie Martin',
        version: 1
      }
    ];
  }

  private getMockServices(): ServiceDevis[] {
    return [
      {
        id: 'serv1',
        nom: 'Emballage standard',
        description: 'Emballage de tous les objets fragiles',
        prix: 2.5,
        quantite: 1,
        unite: 'volume',
        obligatoire: false,
        categorie: 'emballage'
      },
      {
        id: 'serv2',
        nom: 'Démontage/Remontage mobilier',
        description: 'Démontage et remontage des meubles',
        prix: 25,
        quantite: 4,
        unite: 'heure',
        obligatoire: false,
        categorie: 'manutention'
      },
      {
        id: 'serv3',
        nom: 'Transport standard',
        description: 'Transport avec camion adapté',
        prix: 1.2,
        quantite: 1,
        unite: 'forfait',
        obligatoire: true,
        categorie: 'transport'
      },
      {
        id: 'serv4',
        nom: 'Stockage temporaire',
        description: 'Stockage en garde-meuble (par mois)',
        prix: 8,
        quantite: 0,
        unite: 'volume',
        obligatoire: false,
        categorie: 'stockage'
      },
      {
        id: 'serv5',
        nom: 'Nettoyage fin de bail',
        description: 'Nettoyage complet du logement',
        prix: 150,
        quantite: 1,
        unite: 'forfait',
        obligatoire: false,
        categorie: 'nettoyage'
      }
    ];
  }

  private getMockOptions(): OptionDevis[] {
    return [
      {
        id: 'opt1',
        nom: 'Assurance complémentaire',
        description: 'Assurance tous risques',
        prix: 50,
        inclus: false,
        recommande: true
      },
      {
        id: 'opt2',
        nom: 'Service de garde-meuble',
        description: 'Stockage temporaire 1 mois',
        prix: 120,
        inclus: false,
        recommande: false
      },
      {
        id: 'opt3',
        nom: 'Emballage piano',
        description: 'Emballage spécialisé pour piano',
        prix: 80,
        inclus: false,
        recommande: false
      }
    ];
  }

  private getMockClient(nom: string = 'Dupont'): Client {
    return {
      id: 'client1',
      type: 'particulier',
      civilite: 'Mme',
      nom: nom,
      prenom: 'Marie',
      email: `marie.${nom.toLowerCase()}@email.com`,
      telephone: '06 12 34 56 78',
      adresse: this.getMockAdresse('Paris'),
      dateCreation: new Date('2025-01-01'),
      source: 'web',
      statut: 'prospect',
      scoreQualite: 4
    };
  }

  private getMockAdresse(ville: string): any {
    return {
      rue: '123 Rue de la Paix',
      codePostal: ville === 'Paris' ? '75001' : 
                   ville === 'Lyon' ? '69001' : 
                   ville === 'Marseille' ? '13001' : '06000',
      ville: ville,
      pays: 'France',
      etage: 2,
      ascenseur: true,
      acces: 'facile',
      parking: true
    };
  }
}