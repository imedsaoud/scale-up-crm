import { Mission, UserRole } from './mission.interface';

// ==================== CLIENTS ====================
export interface Client {
  id: string;
  type: 'particulier' | 'professionnel';
  civilite: 'M' | 'Mme' | 'Mlle';
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  email: string;
  telephone: string;
  telephoneSecondaire?: string;
  adresse: Adresse;
  dateCreation: Date;
  source: 'web' | 'telephone' | 'recommandation' | 'partenaire';
  notes?: string;
  statut: 'prospect' | 'client' | 'inactif';
  scoreQualite: number; // 1-5
}

export interface Adresse {
  rue: string;
  codePostal: string;
  ville: string;
  pays: string;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
  etage?: number;
  ascenseur: boolean;
  acces: 'facile' | 'difficile' | 'monte-charge';
  parking: boolean;
}

// ==================== DEVIS & PRE-DEVIS ====================
export interface PreDevis {
  id: string;
  clientId: string;
  client: Client;
  dateCreation: Date;
  dateExpiration: Date;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  adresseDepart: Adresse;
  adresseArrivee: Adresse;
  dateDevis: Date;
  dateDemenagement?: Date;
  volumeEstime: number;
  typeLogement: 'studio' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5+' | 'maison' | 'bureau';
  services: ServiceDevis[];
  calculDistance: {
    kilometres: number;
    dureeTrajet: number; // en minutes
    peages: number;
  };
  tarification: TarificationDevis;
  options: OptionDevis[];
  commentaires?: string;
  commercial: string;
  version: number;
}

export interface Devis extends PreDevis {
  numero: string;
  validite: Date;
  conditionsParticulieres?: string;
  documentsPDF: {
    devis: string;
    conditions: string;
    annexes?: string[];
  };
  historique: HistoriqueDevis[];
  validation: {
    clientNom: string;
    clientSignature?: string;
    dateValidation?: Date;
    ipValidation?: string;
  };
}

export interface ServiceDevis {
  id: string;
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  unite: 'forfait' | 'heure' | 'volume' | 'piece';
  obligatoire: boolean;
  categorie: 'emballage' | 'transport' | 'manutention' | 'stockage' | 'nettoyage' | 'autre';
}

export interface OptionDevis {
  id: string;
  nom: string;
  description: string;
  prix: number;
  inclus: boolean;
  recommande: boolean;
}

export interface TarificationDevis {
  baseHT: number;
  options: number;
  sousTotal: number;
  remise: {
    pourcentage: number;
    montant: number;
    motif?: string;
  };
  totalHT: number;
  tva: number;
  totalTTC: number;
  acompte: number;
  resteAPayer: number;
}

export interface HistoriqueDevis {
  date: Date;
  action: 'creation' | 'modification' | 'envoi' | 'consultation' | 'acceptation' | 'refus';
  utilisateur: string;
  details?: string;
}

// ==================== EMAILS & TEMPLATES ====================
export interface EmailTemplate {
  id: string;
  nom: string;
  sujet: string;
  contenu: string; // HTML
  variables: VariableEmail[];
  type: 'devis' | 'confirmation' | 'relance' | 'satisfaction' | 'facturation' | 'autre';
  actif: boolean;
  dateCreation: Date;
  auteur: string;
}

export interface VariableEmail {
  nom: string;
  description: string;
  exemple: string;
  obligatoire: boolean;
}

export interface SequenceEmail {
  id: string;
  nom: string;
  description: string;
  declencheur: 'devis_envoye' | 'devis_expire' | 'mission_terminee' | 'manuel';
  emails: EtapeSequence[];
  actif: boolean;
  conditions?: ConditionSequence[];
}

export interface EtapeSequence {
  ordre: number;
  delai: number; // en jours
  templateId: string;
  template: EmailTemplate;
  condition?: string;
}

export interface ConditionSequence {
  champ: string;
  operateur: '=' | '!=' | '>' | '<' | 'contient';
  valeur: string;
}

export interface EmailEnvoye {
  id: string;
  destinataire: string;
  sujet: string;
  contenu: string;
  dateEnvoi: Date;
  statut: 'envoye' | 'delivre' | 'ouvert' | 'clique' | 'erreur';
  templateId?: string;
  sequenceId?: string;
  clientId?: string;
  devisId?: string;
}

// ==================== RELANCES ====================
export interface Relance {
  id: string;
  type: 'devis' | 'facture' | 'satisfaction' | 'personnalise';
  clientId: string;
  documentId: string; // devisId ou factureId
  dateCreation: Date;
  datePrevue: Date;
  dateRealisee?: Date;
  statut: 'planifiee' | 'envoyee' | 'repondue' | 'annulee';
  canal: 'email' | 'telephone' | 'courrier' | 'sms';
  message?: string;
  reponse?: string;
  utilisateur: string;
  automatique: boolean;
}

export interface ConfigurationRelance {
  type: 'devis' | 'facture';
  delais: number[]; // jours après envoi initial
  templates: string[]; // IDs des templates email
  automatique: boolean;
  maxRelances: number;
}

// ==================== PLANIFICATION ====================
export interface Planning {
  id: string;
  semaine: string; // YYYY-WW
  missions: MissionPlanifiee[];
  ressources: RessourcePlanifiee[];
  contraintes: ContraintePlanning[];
  statut: 'brouillon' | 'valide' | 'publie';
  coordinateur: string;
  dateCreation: Date;
  dateModification: Date;
}

export interface MissionPlanifiee extends Mission {
  heureDebut: string;
  heureFin: string;
  dureeEstimee: number; // en heures
  equipeAssignee: Employe[];
  materielAssocie: Materiel[];
  vehiculeAssocie: Vehicule;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  commentairesPlanning?: string;
  dependances?: string[]; // IDs d'autres missions
}

export interface RessourcePlanifiee {
  date: string;
  employes: DisponibiliteEmploye[];
  vehicules: DisponibiliteVehicule[];
  materiel: DisponibiliteMateriel[];
}

export interface DisponibiliteEmploye {
  employeId: string;
  employe: Employe;
  heuresDisponibles: CreneauHoraire[];
  heuresAssignees: CreneauHoraire[];
  conges?: CreneauHoraire[];
  formation?: CreneauHoraire[];
}

export interface CreneauHoraire {
  debut: string;
  fin: string;
  type?: 'travail' | 'conge' | 'formation' | 'maladie';
}

export interface DisponibiliteVehicule {
  vehiculeId: string;
  vehicule: Vehicule;
  disponible: boolean;
  maintenance?: CreneauHoraire;
  assignations: AssignationVehicule[];
}

export interface DisponibiliteMateriel {
  materielId: string;
  materiel: Materiel;
  quantiteDisponible: number;
  quantiteAssignee: number;
  reservations: ReservationMateriel[];
}

export interface ContraintePlanning {
  id: string;
  type: 'employe_indisponible' | 'vehicule_maintenance' | 'client_creneau' | 'distance_max';
  description: string;
  dateDebut: Date;
  dateFin: Date;
  ressourceId?: string;
  impact: 'bloquant' | 'important' | 'mineur';
}

// ==================== RESSOURCES ====================
export interface Employe {
  id: string;
  matricule: string;
  civilite: 'M' | 'Mme';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateEmbauche: Date;
  statut: 'actif' | 'conge' | 'arret' | 'parti';
  poste: PosteEmploye;
  competences: Competence[];
  tauxHoraire: TauxHoraire;
  adresse: Adresse;
  permis: TypePermis[];
  evaluations: EvaluationEmploye[];
  formationsRealisees: Formation[];
}

export interface PosteEmploye {
  titre: 'chef_equipe' | 'chauffeur' | 'manutentionnaire' | 'monteur' | 'demonteur' | 'coordinateur' | 'commercial';
  niveau: 'junior' | 'confirme' | 'senior' | 'expert';
  responsabilites: string[];
}

export interface Competence {
  nom: string;
  niveau: 1 | 2 | 3 | 4 | 5;
  certifiee: boolean;
  dateValidation?: Date;
}

export interface TauxHoraire {
  normal: number;
  supplementaire: number; // +25%
  nuit: number; // +50%
  dimanche: number; // +100%
  ferie: number; // +100%
}

export interface TypePermis {
  type: 'B' | 'C' | 'C1' | 'CE' | 'C1E';
  numero: string;
  dateObtention: Date;
  dateExpiration?: Date;
  valide: boolean;
}

export interface EvaluationEmploye {
  date: Date;
  evaluateur: string;
  note: number; // 1-5
  commentaires: string;
  objectifs: string[];
  pointsAmelioration: string[];
}

export interface Formation {
  nom: string;
  organisme: string;
  dateDebut: Date;
  dateFin: Date;
  duree: number; // en heures
  certificat: boolean;
  notes?: string;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  type: 'camion' | 'camionnette' | 'fourgon' | 'porteur';
  volumeUtile: number; // en m³
  poidsMax: number; // en kg
  permisRequis: TypePermis['type'];
  statut: 'disponible' | 'en_mission' | 'maintenance' | 'hors_service';
  kilometrage: number;
  prochainEntretien: Date;
  assurance: {
    compagnie: string;
    numeroPolice: string;
    dateExpiration: Date;
  };
  controles: ControleVehicule[];
  couts: CoutVehicule;
}

export interface ControleVehicule {
  type: 'technique' | 'tachygraphe' | 'extincteur';
  date: Date;
  prochainControle: Date;
  valide: boolean;
  commentaires?: string;
}

export interface CoutVehicule {
  carburant: number; // €/km
  entretien: number; // €/km
  assurance: number; // €/mois
  amortissement: number; // €/mois
}

export interface Materiel {
  id: string;
  nom: string;
  type: 'sangles' | 'diable' | 'sangles_piano' | 'film_plastique' | 'cartons' | 'housses' | 'autre';
  quantiteStock: number;
  unite: 'piece' | 'metre' | 'rouleau' | 'kg';
  prixUnitaire: number;
  fournisseur: string;
  dateAchat?: Date;
  statut: 'disponible' | 'reserve' | 'maintenance' | 'hors_service';
  localisation: string;
}

export interface AssignationVehicule {
  missionId: string;
  heureDebut: string;
  heureFin: string;
}

export interface ReservationMateriel {
  missionId: string;
  quantite: number;
  dateDebut: Date;
  dateFin: Date;
}

// ==================== DASHBOARDS ====================
export interface DashboardData {
  role: UserRole;
  periode: PeriodeDashboard;
  metriques: MetriqueDashboard[];
  graphiques: GraphiqueDashboard[];
  alertes: AlerteDashboard[];
  taches: TacheDashboard[];
  statistiques: StatistiqueDashboard;
}

export interface PeriodeDashboard {
  debut: Date;
  fin: Date;
  type: 'jour' | 'semaine' | 'mois' | 'trimestre' | 'annee';
}

export interface MetriqueDashboard {
  nom: string;
  valeur: number;
  unite: string;
  evolution: {
    pourcentage: number;
    tendance: 'hausse' | 'baisse' | 'stable';
  };
  objectif?: number;
  couleur: string;
  icone: string;
}

export interface GraphiqueDashboard {
  type: 'line' | 'bar' | 'pie' | 'area';
  titre: string;
  donnees: DonneeGraphique[];
  configuration: any;
}

export interface DonneeGraphique {
  label: string;
  valeur: number;
  couleur?: string;
  date?: Date;
}

export interface AlerteDashboard {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  titre: string;
  message: string;
  dateCreation: Date;
  lue: boolean;
  action?: {
    libelle: string;
    url: string;
  };
}

export interface TacheDashboard {
  id: string;
  titre: string;
  description: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  echeance: Date;
  statut: 'todo' | 'en_cours' | 'terminee';
  assignee?: string;
  lienObjet?: {
    type: 'mission' | 'devis' | 'client';
    id: string;
  };
}

export interface StatistiqueDashboard {
  missionsTotal: number;
  missionsTerminees: number;
  chiffreAffaires: number;
  margeRealisee: number;
  clientsProspects: number;
  clientsActifs: number;
  tauxConversion: number;
  satisfactionMoyenne: number;
}

// ==================== REPORTING ====================
export interface Rapport {
  id: string;
  nom: string;
  type: 'financier' | 'operationnel' | 'commercial' | 'rh' | 'personnalise';
  parametres: ParametreRapport;
  donnees: any;
  dateGeneration: Date;
  utilisateur: string;
  format: 'pdf' | 'excel' | 'csv';
  planifie: boolean;
  frequence?: 'quotidien' | 'hebdomadaire' | 'mensuel';
}

export interface ParametreRapport {
  dateDebut: Date;
  dateFin: Date;
  filtres: FiltreRapport[];
  colonnes: string[];
  groupements: string[];
  triePar?: string;
  ordre?: 'asc' | 'desc';
}

export interface FiltreRapport {
  champ: string;
  operateur: '=' | '!=' | '>' | '<' | 'contient' | 'commence_par';
  valeur: any;
}

// ==================== GESTION PAIE ÉQUIPES ====================
export interface FichePaie {
  id: string;
  employeId: string;
  employe: Employe;
  periode: {
    mois: number;
    annee: number;
  };
  heuresTravaillees: HeuresTravaillees;
  salaire: CalculSalaire;
  missionsRealisees: MissionEmploye[];
  primes: Prime[];
  deductions: Deduction[];
  statut: 'brouillon' | 'validee' | 'payee';
  dateGeneration: Date;
  validateur?: string;
  commentaires?: string;
}

export interface HeuresTravaillees {
  normales: number;
  supplementaires: number;
  nuit: number;
  dimanche: number;
  feries: number;
  total: number;
}

export interface CalculSalaire {
  brut: number;
  chargesPatronales: number;
  chargesSalariales: number;
  net: number;
  acomptes: number;
  netAPayer: number;
}

export interface MissionEmploye {
  missionId: string;
  date: Date;
  client: string;
  role: 'chef_equipe' | 'chauffeur' | 'manutentionnaire' | 'monteur' | 'demonteur';
  heuresNormales: number;
  heuresSupplementaires: number;
  primesMission: number;
  evaluation?: number; // 1-5
  commentaires?: string;
}

export interface Prime {
  type: 'performance' | 'anciennete' | 'transport' | 'repas' | 'objectif' | 'autre';
  montant: number;
  description: string;
  taxable: boolean;
}

export interface Deduction {
  type: 'avance' | 'materiel_perdu' | 'retard' | 'absence' | 'autre';
  montant: number;
  description: string;
  justification?: string;
}

// ==================== RECHERCHE & HISTORIQUE ====================
export interface CritereRecherche {
  terme?: string;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: string[];
  commercial?: string;
  ville?: string;
  montantMin?: number;
  montantMax?: number;
  typeClient?: 'particulier' | 'professionnel';
  source?: string[];
}

export interface ResultatRecherche<T> {
  elements: T[];
  total: number;
  page: number;
  taille: number;
  filtres: FiltreApplique[];
}

export interface FiltreApplique {
  champ: string;
  valeur: any;
  libelle: string;
}

export interface HistoriqueClient {
  clientId: string;
  elements: ElementHistorique[];
}

export interface ElementHistorique {
  date: Date;
  type: 'devis' | 'mission' | 'facture' | 'contact' | 'reclamation';
  titre: string;
  description: string;
  montant?: number;
  statut: string;
  documents?: DocumentHistorique[];
  utilisateur: string;
}

export interface DocumentHistorique {
  nom: string;
  type: string;
  url: string;
  taille: number;
}

// ==================== NOTIFICATIONS ====================
export interface Notification {
  id: string;
  type: 'info' | 'succes' | 'alerte' | 'erreur';
  titre: string;
  message: string;
  dateCreation: Date;
  dateLecture?: Date;
  destinataire: string;
  lue: boolean;
  action?: ActionNotification;
  donnees?: any;
}

export interface ActionNotification {
  libelle: string;
  type: 'navigation' | 'action' | 'externe';
  cible: string;
  parametres?: any;
}

// ==================== CONFIGURATION ====================
export interface ConfigurationApp {
  entreprise: InfosEntreprise;
  devis: ConfigDevis;
  emails: ConfigEmails;
  planning: ConfigPlanning;
  paie: ConfigPaie;
  notifications: ConfigNotifications;
}

export interface InfosEntreprise {
  nom: string;
  siret: string;
  adresse: Adresse;
  telephone: string;
  email: string;
  siteWeb?: string;
  logo?: string;
  signature?: string;
}

export interface ConfigDevis {
  validiteDuree: number; // en jours
  acompteDefaut: number; // en pourcentage
  tva: number; // en pourcentage
  mentionsLegales: string;
  conditionsGenerales: string;
  numerotation: {
    prefixe: string;
    longueur: number;
    reinitialisation: 'annuelle' | 'jamais';
  };
}

export interface ConfigEmails {
  serveurSMTP: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  expediteur: {
    nom: string;
    email: string;
  };
  signature: string;
}

export interface ConfigPlanning {
  heuresOuverture: {
    debut: string;
    fin: string;
  };
  joursOuvres: string[];
  dureeCreneauMin: number; // en minutes
  anticipationMin: number; // jours minimum avant mission
  anticipationMax: number; // jours maximum avant mission
}

export interface ConfigPaie {
  chargesPatronales: number; // en pourcentage
  chargesSalariales: number; // en pourcentage
  tauxSupplementaires: number; // en pourcentage
  tauxNuit: number; // en pourcentage
  tauxDimanche: number; // en pourcentage
  tauxFerie: number; // en pourcentage
}

export interface ConfigNotifications {
  email: boolean;
  sms: boolean;
  push: boolean;
  delaiRappel: number; // en heures
}