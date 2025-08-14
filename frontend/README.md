# Moving App - Clôture de Missions

Une application Angular complète pour la gestion et la validation des missions de déménagement, adaptée du code HTML fourni.

## 🚚 Description

Cette application permet la validation des missions de déménagement à travers un workflow structuré impliquant quatre rôles différents :

- **👷‍♂️ Chef d'Équipe** - Validation terrain
- **📋 Coordinateur** - Validation opérationnelle
- **💼 Commercial** - Validation client
- **🧮 Comptable** - Clôture financière

## ✨ Fonctionnalités

### Interface utilisateur
- Interface moderne et responsive adaptée du design HTML original
- Navigation par onglets selon les rôles
- Formulaires dynamiques avec validation en temps réel
- Indicateurs visuels de progression des étapes

### Gestion des missions
- Liste des missions par rôle
- Formulaires spécialisés pour chaque étape de validation
- Calculs automatiques (heures supplémentaires, coûts, rentabilité)
- Upload de photos et documents

### Workflow de validation
1. **Terrain** : Validation de l'exécution sur site
2. **Coordination** : Validation opérationnelle et coûts
3. **Commercial** : Satisfaction client et facturation
4. **Comptable** : Clôture financière et analyse rentabilité

## 🛠️ Technologies

- **Angular 17** - Framework principal
- **Angular Material** - Composants UI
- **SCSS** - Styles avancés
- **TypeScript** - Langage de développement
- **RxJS** - Gestion réactive des données
- **ng2-pdf-viewer** - Visualisation PDF

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── mission-management.component.ts
│   │   │   ├── mission-management.component.html
│   │   │   └── mission-management.component.scss
│   │   ├── models/
│   │   │   └── mission.interface.ts
│   │   ├── services/
│   │   │   └── mission.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   ├── assets/
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Angular CLI

### Installation
```bash
cd frontend
npm install
```

### Lancement en développement
```bash
npm start
# ou
ng serve
```

L'application sera accessible sur `http://localhost:4200`

### Build production
```bash
npm run build
# ou
ng build --prod
```

## 📱 Interface et utilisation

### Onglets principaux
- **Chef d'Équipe** : Validation des données terrain (volume, équipe, incidents)
- **Coordinateur** : Validation opérationnelle (planning, ressources, SAV)
- **Commercial** : Validation client (satisfaction, encaissement, remises)
- **Comptable** : Clôture financière (coûts, facturation, rentabilité)

### Fonctionnalités par rôle

#### Chef d'Équipe
- Confirmation du volume déménagé
- Saisie des matériels utilisés
- Gestion des heures supplémentaires et retards
- Upload de photos d'incidents
- Validation des coûts logistiques

#### Coordinateur
- Validation du respect du planning
- Contrôle des ressources utilisées
- Calcul automatique des coûts supplémentaires
- Évaluation du SAV nécessaire
- Notes opérationnelles

#### Commercial
- Évaluation de la satisfaction client
- Gestion des encaissements sur place
- Validation des coûts additionnels
- Application de remises commerciales
- Actions de fidélisation

#### Comptable
- Récapitulatif financier complet
- Détail des coûts par catégorie
- Facturation finale avec échéances
- Analyse de rentabilité en temps réel
- Clôture définitive de la mission

## 💾 Gestion des données

### Modèle de données
- Interfaces TypeScript strictement typées
- Service centralisé pour la gestion des missions
- État réactif avec RxJS Observables
- Calculs automatiques et validation

### Persistance
Actuellement en mode démo avec données simulées. Peut être facilement connecté à :
- API REST
- Base de données
- Service cloud

## 🎨 Design et UX

### Adaptation du design original
- Conservation de l'identité visuelle du HTML fourni
- Amélioration de l'accessibilité et de la responsivité
- Ajout d'animations et de transitions fluides
- Optimisation pour mobile et tablette

### Thème et couleurs
- Palette moderne avec dégradés
- Indicateurs colorés pour les statuts
- Badges et étiquettes informatives
- Loading states et feedback utilisateur

## 📊 Fonctionnalités avancées

### Calculs automatiques
- Heures supplémentaires (25€/h)
- Coûts additionnels et remises
- Marge brute et taux de rentabilité
- Totaux financiers en temps réel

### Validation progressive
- Workflow séquentiel entre les rôles
- Indicateurs visuels d'avancement
- Blocage des étapes non autorisées
- Historique des validations

### Responsive design
- Adaptation automatique aux écrans
- Navigation optimisée mobile
- Formulaires tactiles
- Performance optimisée

## 🔧 Configuration et personnalisation

### Styles
Modifier `src/styles.scss` pour les styles globaux
Composants individuels dans leurs fichiers `.scss` respectifs

### Données
Modifier `mission.service.ts` pour changer :
- Données de démonstration
- Logique de validation
- Calculs financiers

### Interface
Composants modulaires facilement personnalisables
Variables SCSS pour les couleurs et espacements

## 📈 Performance et optimisation

- Lazy loading des composants
- OnPush change detection
- Optimisation des images et assets
- Bundle splitting automatique
- Service workers prêt pour PWA

## 🤝 Contribution

1. Fork du projet
2. Création d'une branche feature
3. Commit des modifications
4. Push vers la branche
5. Création d'une Pull Request

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 🆘 Support

Pour toute question ou problème :
- Consulter la documentation Angular
- Vérifier les issues GitHub
- Contacter l'équipe de développement

---

**Note** : Cette application a été créée en adaptant le code HTML fourni vers une architecture Angular moderne et maintenable.