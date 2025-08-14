import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  EmailTemplate, 
  SequenceEmail, 
  EmailEnvoye, 
  VariableEmail,
  EtapeSequence,
  Relance
} from '../models/extended-interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>(this.getMockTemplates());
  private sequencesSubject = new BehaviorSubject<SequenceEmail[]>(this.getMockSequences());
  private emailsEnvoyesSubject = new BehaviorSubject<EmailEnvoye[]>(this.getMockEmailsEnvoyes());

  public templates$ = this.templatesSubject.asObservable();
  public sequences$ = this.sequencesSubject.asObservable();
  public emailsEnvoyes$ = this.emailsEnvoyesSubject.asObservable();

  constructor() {}

  // ==================== GESTION DES TEMPLATES ====================

  createTemplate(template: Partial<EmailTemplate>): Observable<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: this.generateId(),
      nom: template.nom || '',
      sujet: template.sujet || '',
      contenu: template.contenu || '',
      variables: template.variables || [],
      type: template.type || 'autre',
      actif: template.actif !== undefined ? template.actif : true,
      dateCreation: new Date(),
      auteur: 'current_user'
    };

    const templates = this.templatesSubject.value;
    templates.push(newTemplate);
    this.templatesSubject.next([...templates]);

    return of(newTemplate).pipe(delay(300));
  }

  updateTemplate(template: EmailTemplate): Observable<EmailTemplate> {
    const templates = this.templatesSubject.value;
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index !== -1) {
      templates[index] = { ...template };
      this.templatesSubject.next([...templates]);
    }

    return of(template).pipe(delay(300));
  }

  deleteTemplate(templateId: string): Observable<boolean> {
    const templates = this.templatesSubject.value;
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    this.templatesSubject.next(filteredTemplates);

    return of(true).pipe(delay(300));
  }

  duplicateTemplate(templateId: string): Observable<EmailTemplate> {
    const templates = this.templatesSubject.value;
    const originalTemplate = templates.find(t => t.id === templateId);
    
    if (!originalTemplate) {
      throw new Error('Template non trouvé');
    }

    const duplicatedTemplate: EmailTemplate = {
      ...originalTemplate,
      id: this.generateId(),
      nom: `${originalTemplate.nom} (Copie)`,
      dateCreation: new Date(),
      auteur: 'current_user'
    };

    templates.push(duplicatedTemplate);
    this.templatesSubject.next([...templates]);

    return of(duplicatedTemplate).pipe(delay(300));
  }

  // ==================== GESTION DES SÉQUENCES ====================

  createSequence(sequence: Partial<SequenceEmail>): Observable<SequenceEmail> {
    const newSequence: SequenceEmail = {
      id: this.generateId(),
      nom: sequence.nom || '',
      description: sequence.description || '',
      declencheur: sequence.declencheur || 'manuel',
      emails: sequence.emails || [],
      actif: sequence.actif !== undefined ? sequence.actif : true,
      conditions: sequence.conditions || []
    };

    const sequences = this.sequencesSubject.value;
    sequences.push(newSequence);
    this.sequencesSubject.next([...sequences]);

    return of(newSequence).pipe(delay(300));
  }

  updateSequence(sequence: SequenceEmail): Observable<SequenceEmail> {
    const sequences = this.sequencesSubject.value;
    const index = sequences.findIndex(s => s.id === sequence.id);
    
    if (index !== -1) {
      sequences[index] = { ...sequence };
      this.sequencesSubject.next([...sequences]);
    }

    return of(sequence).pipe(delay(300));
  }

  deleteSequence(sequenceId: string): Observable<boolean> {
    const sequences = this.sequencesSubject.value;
    const filteredSequences = sequences.filter(s => s.id !== sequenceId);
    this.sequencesSubject.next(filteredSequences);

    return of(true).pipe(delay(300));
  }

  // ==================== ENVOI D'EMAILS ====================

  envoyerEmailTemplate(templateId: string, destinataire: string, variables: {[key: string]: any}): Observable<EmailEnvoye> {
    const templates = this.templatesSubject.value;
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template non trouvé');
    }

    const contenuPersonnalise = this.remplacerVariables(template.contenu, variables);
    const sujetPersonnalise = this.remplacerVariables(template.sujet, variables);

    const emailEnvoye: EmailEnvoye = {
      id: this.generateId(),
      destinataire,
      sujet: sujetPersonnalise,
      contenu: contenuPersonnalise,
      dateEnvoi: new Date(),
      statut: 'envoye',
      templateId: template.id
    };

    // Simuler l'envoi avec un délai
    return this.simulerEnvoiEmail(emailEnvoye);
  }

  declencherSequence(sequenceId: string, destinataire: string, variables: {[key: string]: any}): Observable<boolean> {
    const sequences = this.sequencesSubject.value;
    const sequence = sequences.find(s => s.id === sequenceId);
    
    if (!sequence || !sequence.actif) {
      return of(false);
    }

    // Programmer les emails de la séquence
    sequence.emails.forEach(etape => {
      setTimeout(() => {
        this.envoyerEmailTemplate(etape.templateId, destinataire, variables).subscribe();
      }, etape.delai * 24 * 60 * 60 * 1000); // Délai en jours
    });

    return of(true).pipe(delay(300));
  }

  // ==================== PERSONNALISATION ET VARIABLES ====================

  private remplacerVariables(contenu: string, variables: {[key: string]: any}): string {
    let contenuPersonnalise = contenu;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      contenuPersonnalise = contenuPersonnalise.replace(regex, variables[key] || '');
    });

    return contenuPersonnalise;
  }

  previewTemplate(template: EmailTemplate, variables: {[key: string]: any}): {sujet: string, contenu: string} {
    return {
      sujet: this.remplacerVariables(template.sujet, variables),
      contenu: this.remplacerVariables(template.contenu, variables)
    };
  }

  getVariablesDisponibles(type: EmailTemplate['type']): VariableEmail[] {
    const variablesCommunes: VariableEmail[] = [
      {
        nom: 'nom_client',
        description: 'Nom du client',
        exemple: 'Dupont',
        obligatoire: true
      },
      {
        nom: 'prenom_client',
        description: 'Prénom du client',
        exemple: 'Marie',
        obligatoire: false
      },
      {
        nom: 'email_client',
        description: 'Email du client',
        exemple: 'marie.dupont@email.com',
        obligatoire: false
      },
      {
        nom: 'telephone_client',
        description: 'Téléphone du client',
        exemple: '06 12 34 56 78',
        obligatoire: false
      },
      {
        nom: 'nom_entreprise',
        description: 'Nom de l\'entreprise',
        exemple: 'MovingCorp',
        obligatoire: false
      }
    ];

    const variablesSpecifiques: {[key: string]: VariableEmail[]} = {
      'devis': [
        {
          nom: 'numero_devis',
          description: 'Numéro du devis',
          exemple: 'DEV-202501-0001',
          obligatoire: true
        },
        {
          nom: 'montant_devis',
          description: 'Montant total du devis',
          exemple: '1 596,00 €',
          obligatoire: true
        },
        {
          nom: 'date_demenagement',
          description: 'Date prévue du déménagement',
          exemple: '15/02/2025',
          obligatoire: false
        },
        {
          nom: 'ville_depart',
          description: 'Ville de départ',
          exemple: 'Paris',
          obligatoire: false
        },
        {
          nom: 'ville_arrivee',
          description: 'Ville d\'arrivée',
          exemple: 'Lyon',
          obligatoire: false
        },
        {
          nom: 'lien_validation',
          description: 'Lien pour valider le devis',
          exemple: 'https://app.moving.com/devis/valider/123',
          obligatoire: false
        }
      ],
      'confirmation': [
        {
          nom: 'numero_mission',
          description: 'Numéro de la mission',
          exemple: 'MIS-202501-0001',
          obligatoire: true
        },
        {
          nom: 'equipe_assignee',
          description: 'Équipe assignée',
          exemple: 'Jean Martin, Pierre Durand',
          obligatoire: false
        },
        {
          nom: 'vehicule_assigne',
          description: 'Véhicule assigné',
          exemple: 'Camion AB-123-CD',
          obligatoire: false
        },
        {
          nom: 'heure_arrivee',
          description: 'Heure d\'arrivée prévue',
          exemple: '08h30',
          obligatoire: false
        }
      ],
      'relance': [
        {
          nom: 'jours_depuis_envoi',
          description: 'Nombre de jours depuis l\'envoi',
          exemple: '7',
          obligatoire: false
        },
        {
          nom: 'date_expiration',
          description: 'Date d\'expiration',
          exemple: '15/03/2025',
          obligatoire: false
        }
      ],
      'satisfaction': [
        {
          nom: 'lien_satisfaction',
          description: 'Lien vers le questionnaire',
          exemple: 'https://app.moving.com/satisfaction/123',
          obligatoire: true
        }
      ],
      'facturation': [
        {
          nom: 'numero_facture',
          description: 'Numéro de facture',
          exemple: 'FAC-202501-0001',
          obligatoire: true
        },
        {
          nom: 'montant_facture',
          description: 'Montant de la facture',
          exemple: '1 596,00 €',
          obligatoire: true
        },
        {
          nom: 'date_echeance',
          description: 'Date d\'échéance',
          exemple: '15/03/2025',
          obligatoire: false
        }
      ]
    };

    return [...variablesCommunes, ...(variablesSpecifiques[type] || [])];
  }

  // ==================== STATISTIQUES ET SUIVI ====================

  getStatistiquesEmails(): Observable<any> {
    return this.emailsEnvoyes$.pipe(
      map(emails => {
        const total = emails.length;
        const envoyes = emails.filter(e => e.statut === 'envoye').length;
        const delivres = emails.filter(e => e.statut === 'delivre').length;
        const ouverts = emails.filter(e => e.statut === 'ouvert').length;
        const cliques = emails.filter(e => e.statut === 'clique').length;
        const erreurs = emails.filter(e => e.statut === 'erreur').length;

        const tauxDelivraison = envoyes > 0 ? (delivres / envoyes) * 100 : 0;
        const tauxOuverture = delivres > 0 ? (ouverts / delivres) * 100 : 0;
        const tauxClic = ouverts > 0 ? (cliques / ouverts) * 100 : 0;

        return {
          total,
          envoyes,
          delivres,
          ouverts,
          cliques,
          erreurs,
          tauxDelivraison,
          tauxOuverture,
          tauxClic
        };
      })
    );
  }

  getTemplateUsage(): Observable<{templateId: string, nom: string, utilisations: number}[]> {
    return this.emailsEnvoyes$.pipe(
      map(emails => {
        const templates = this.templatesSubject.value;
        const usage = new Map<string, number>();

        emails.forEach(email => {
          if (email.templateId) {
            usage.set(email.templateId, (usage.get(email.templateId) || 0) + 1);
          }
        });

        return templates.map(template => ({
          templateId: template.id,
          nom: template.nom,
          utilisations: usage.get(template.id) || 0
        })).sort((a, b) => b.utilisations - a.utilisations);
      })
    );
  }

  // ==================== HELPERS PRIVÉS ====================

  private simulerEnvoiEmail(email: EmailEnvoye): Observable<EmailEnvoye> {
    // Simuler les étapes d'envoi
    return new Observable(observer => {
      // Étape 1: Envoi
      setTimeout(() => {
        email.statut = 'envoye';
        observer.next({ ...email });
      }, 500);

      // Étape 2: Livraison
      setTimeout(() => {
        email.statut = 'delivre';
        observer.next({ ...email });
      }, 1000);

      // Étape 3: Ouverture (simulée - 60% de chance)
      setTimeout(() => {
        if (Math.random() < 0.6) {
          email.statut = 'ouvert';
          observer.next({ ...email });
        }
      }, 2000);

      // Étape 4: Clic (simulée - 20% de chance)
      setTimeout(() => {
        if (Math.random() < 0.2 && email.statut === 'ouvert') {
          email.statut = 'clique';
          observer.next({ ...email });
        }
        
        // Sauvegarder l'email
        const emails = this.emailsEnvoyesSubject.value;
        emails.push(email);
        this.emailsEnvoyesSubject.next([...emails]);
        
        observer.complete();
      }, 3000);
    });
  }

  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  // ==================== DONNÉES MOCK ====================

  private getMockTemplates(): EmailTemplate[] {
    return [
      {
        id: 'tpl_devis_standard',
        nom: 'Devis Standard',
        sujet: 'Votre devis de déménagement {{numero_devis}}',
        contenu: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">🚚 Votre Devis de Déménagement</h1>
            
            <p>Bonjour {{prenom_client}} {{nom_client}},</p>
            
            <p>Nous avons le plaisir de vous transmettre votre devis personnalisé pour votre déménagement de {{ville_depart}} vers {{ville_arrivee}} prévu le {{date_demenagement}}.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📋 Récapitulatif</h3>
              <p><strong>Numéro de devis:</strong> {{numero_devis}}</p>
              <p><strong>Montant total:</strong> {{montant_devis}}</p>
              <p><strong>Validité:</strong> 60 jours</p>
            </div>
            
            <p>Pour accepter ce devis, cliquez simplement sur le lien ci-dessous :</p>
            <a href="{{lien_validation}}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">✅ Accepter le devis</a>
            
            <p>Notre équipe reste à votre disposition pour toute question.</p>
            
            <p>Cordialement,<br>L'équipe {{nom_entreprise}}</p>
          </div>
        `,
        variables: this.getVariablesDisponibles('devis'),
        type: 'devis',
        actif: true,
        dateCreation: new Date('2025-01-01'),
        auteur: 'Admin'
      },
      {
        id: 'tpl_confirmation',
        nom: 'Confirmation de Mission',
        sujet: 'Confirmation de votre déménagement - Mission {{numero_mission}}',
        contenu: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">✅ Déménagement Confirmé</h1>
            
            <p>Bonjour {{prenom_client}} {{nom_client}},</p>
            
            <p>Votre déménagement est confirmé ! Voici les détails de votre mission :</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3>📅 Informations de la mission</h3>
              <p><strong>Numéro:</strong> {{numero_mission}}</p>
              <p><strong>Date:</strong> {{date_demenagement}}</p>
              <p><strong>Heure d'arrivée prévue:</strong> {{heure_arrivee}}</p>
              <p><strong>Équipe assignée:</strong> {{equipe_assignee}}</p>
              <p><strong>Véhicule:</strong> {{vehicule_assigne}}</p>
            </div>
            
            <h3>📞 Contact</h3>
            <p>Le chef d'équipe vous contactera la veille pour confirmer l'heure exacte d'arrivée.</p>
            
            <p>Excellente journée,<br>L'équipe {{nom_entreprise}}</p>
          </div>
        `,
        variables: this.getVariablesDisponibles('confirmation'),
        type: 'confirmation',
        actif: true,
        dateCreation: new Date('2025-01-01'),
        auteur: 'Admin'
      },
      {
        id: 'tpl_relance_devis',
        nom: 'Relance Devis',
        sujet: 'Votre devis {{numero_devis}} expire bientôt',
        contenu: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">⏰ Rappel - Votre Devis Expire Bientôt</h1>
            
            <p>Bonjour {{prenom_client}} {{nom_client}},</p>
            
            <p>Nous espérons que vous allez bien. Il y a {{jours_depuis_envoi}} jours, nous vous avons transmis un devis pour votre déménagement.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3>⚠️ Attention</h3>
              <p>Votre devis <strong>{{numero_devis}}</strong> expire le <strong>{{date_expiration}}</strong>.</p>
              <p>Montant: <strong>{{montant_devis}}</strong></p>
            </div>
            
            <p>Pour conserver ces conditions avantageuses, n'hésitez pas à nous confirmer votre accord :</p>
            <a href="{{lien_validation}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">📞 Nous contacter</a>
            
            <p>Nous restons à votre écoute pour toute question.</p>
            
            <p>Cordialement,<br>L'équipe {{nom_entreprise}}</p>
          </div>
        `,
        variables: this.getVariablesDisponibles('relance'),
        type: 'relance',
        actif: true,
        dateCreation: new Date('2025-01-01'),
        auteur: 'Admin'
      },
      {
        id: 'tpl_satisfaction',
        nom: 'Questionnaire Satisfaction',
        sujet: 'Votre avis nous intéresse - Déménagement {{numero_mission}}',
        contenu: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">⭐ Votre Avis Compte</h1>
            
            <p>Bonjour {{prenom_client}} {{nom_client}},</p>
            
            <p>Votre déménagement vient de se terminer et nous espérons que tout s'est bien déroulé !</p>
            
            <p>Votre satisfaction est notre priorité. Pourriez-vous prendre 2 minutes pour évaluer nos services ?</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{lien_satisfaction}}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px;">⭐ Donner mon avis</a>
            </div>
            
            <p>Vos commentaires nous aident à améliorer continuellement nos services.</p>
            
            <p>Merci pour votre confiance,<br>L'équipe {{nom_entreprise}}</p>
          </div>
        `,
        variables: this.getVariablesDisponibles('satisfaction'),
        type: 'satisfaction',
        actif: true,
        dateCreation: new Date('2025-01-01'),
        auteur: 'Admin'
      }
    ];
  }

  private getMockSequences(): SequenceEmail[] {
    return [
      {
        id: 'seq_devis_relance',
        nom: 'Séquence Relance Devis',
        description: 'Relances automatiques après envoi d\'un devis',
        declencheur: 'devis_envoye',
        emails: [
          {
            ordre: 1,
            delai: 7,
            templateId: 'tpl_relance_devis',
            template: this.getMockTemplates().find(t => t.id === 'tpl_relance_devis')!
          },
          {
            ordre: 2,
            delai: 15,
            templateId: 'tpl_relance_devis',
            template: this.getMockTemplates().find(t => t.id === 'tpl_relance_devis')!
          }
        ],
        actif: true
      },
      {
        id: 'seq_satisfaction',
        nom: 'Séquence Satisfaction',
        description: 'Questionnaire de satisfaction après mission',
        declencheur: 'mission_terminee',
        emails: [
          {
            ordre: 1,
            delai: 1,
            templateId: 'tpl_satisfaction',
            template: this.getMockTemplates().find(t => t.id === 'tpl_satisfaction')!
          }
        ],
        actif: true
      }
    ];
  }

  private getMockEmailsEnvoyes(): EmailEnvoye[] {
    return [
      {
        id: 'email_1',
        destinataire: 'marie.dupont@email.com',
        sujet: 'Votre devis de déménagement DEV-202501-0001',
        contenu: 'Contenu personnalisé...',
        dateEnvoi: new Date('2025-01-10'),
        statut: 'ouvert',
        templateId: 'tpl_devis_standard'
      },
      {
        id: 'email_2',
        destinataire: 'paul.bernard@email.com',
        sujet: 'Confirmation de votre déménagement - Mission MIS-202501-0001',
        contenu: 'Contenu personnalisé...',
        dateEnvoi: new Date('2025-01-12'),
        statut: 'delivre',
        templateId: 'tpl_confirmation'
      }
    ];
  }
}