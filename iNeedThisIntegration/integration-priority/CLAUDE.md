# 🎯 Lightspeed Integration Priority Tool

Une application web pour aider les équipes commerciales de Lightspeed à prioriser les intégrations en fonction des demandes clients et de leur MRR.

*"You need an integration to make money flow ? Let's vote for it baby !"*

## 🚀 Technologies utilisées

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + BaaS)
- **UI**: Radix UI + shadcn/ui
- **Déploiement**: Vercel (recommandé)

## 📋 Fonctionnalités

### 🏠 Dashboard
- **KPIs en temps réel**: MRR total, nombre de demandes, intégrations
- **Classement des priorités**: Intégrations triées par impact MRR 
- **Distinction MRR à risque vs MRR potentiel**: Clients actuels vs prospects
- **Layout optimisé**: 3 cartes par ligne, format compact
- **Cartes visuelles** avec logos des intégrations (format carré)
- **Design épuré**: Palette de couleurs neutre (gris)
- **Marges réduites**: Utilisation maximale de l'espace disponible

### ✨ Nouveau vote/demande
- **Formulaire complet**: Restaurant, MRR potentiel, commercial
- **Sélecteur d'intégrations**: Interface en cartes carrées avec recherche (4 par ligne)
- **Type de client**: Radio buttons avec espacement amélioré (Client Lightspeed / Prospect)  
- **Lien Salesforce**: Pour traçabilité CRM
- **Contrôle des intégrations**: Liste fermée pour éviter les doublons
- **Message informatif**: Guide les commerciaux pour demander de nouvelles intégrations
- **Validation robuste** avec messages d'erreur détaillés

### 📜 Historique
- **Liste complète** de toutes les demandes soumises avec format tableau compact
- **Filtres avancés**: Recherche textuelle, filtres par intégration et type de client
- **Tri automatique** par date (plus récent en premier)
- **Suppression des doublons**: Bouton de suppression avec confirmation
- **Détails complets**: Restaurant, commercial, notes, liens Salesforce
- **Badges visuels** pour type de client
- **Interface de filtrage**: Dropdowns avec gestion propre des valeurs par défaut

## 🛠 Configuration développement

### Prérequis
```bash
# Node.js 18+ requis
node --version
npm --version
```

### Installation
```bash
# Installation des dépendances
npm install

# Démarrage serveur de développement
npm run dev

# Build production
npm run build

# Linting/formatting
npm run lint
npm run typecheck
```

### Variables d'environnement
Créer `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

## 🗄 Base de données Supabase

### Structure des tables

**integrations**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR UNIQUE) 
- status (VARCHAR) - 'requested', 'in_development', 'completed'
- description (TEXT)
- development_start (DATE)
- estimated_completion (DATE)
- created_at (TIMESTAMP)
```

**votes**
```sql  
- id (SERIAL PRIMARY KEY)
- restaurant_name (VARCHAR)
- mrr_potential (DECIMAL)
- integration_name (VARCHAR) - FK vers integrations.name
- sales_person (VARCHAR)
- client_type (VARCHAR) - 'current_client' ou 'prospect'  
- salesforce_link (TEXT)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### Vue des priorités
```sql
CREATE VIEW integration_priorities AS
SELECT 
  i.name,
  i.status,
  i.description,
  -- MRR à risque (clients actuels)
  SUM(CASE WHEN v.client_type = 'current_client' THEN v.mrr_potential ELSE 0 END) as mrr_at_risk,
  -- MRR potentiel (prospects)
  SUM(CASE WHEN v.client_type = 'prospect' THEN v.mrr_potential ELSE 0 END) as mrr_prospects,
  COUNT(*) as vote_count,
  AVG(v.mrr_potential) as avg_mrr
FROM integrations i
LEFT JOIN votes v ON i.name = v.integration_name  
GROUP BY i.id
ORDER BY (mrr_at_risk + mrr_prospects) DESC;
```

## 🎨 Architecture des composants

```
src/
├── app/
│   ├── page.tsx              # Page principale avec onglets
│   ├── layout.tsx            # Layout racine
│   └── globals.css           # Styles globaux
├── components/
│   ├── dashboard.tsx         # Tableau de bord et KPIs
│   ├── vote-form.tsx         # Formulaire de nouvelle demande  
│   ├── votes-history.tsx     # Historique avec suppression
│   ├── integration-selector.tsx # Sélecteur d'intégrations en cartes
│   └── ui/                   # Composants UI (shadcn)
│       ├── tabs.tsx
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       └── ...
├── lib/
│   ├── supabase.ts           # Configuration Supabase
│   └── utils.ts              # Utilitaires (cn, etc.)
└── public/
    └── logos/                # Logos des intégrations
        ├── overfull.png
        ├── zucchetti.png
        ├── cegid.png
        └── ...
```

## 🔧 Commandes utiles

```bash
# Développement
npm run dev                   # Serveur dev sur http://localhost:3000

# Production  
npm run build                 # Build optimisé
npm run start                 # Serveur production

# Code quality
npm run lint                  # ESLint
npm run typecheck            # TypeScript check

# Base de données
# Exécuter dans l'éditeur SQL Supabase:
# 1. supabase-setup.sql (création initiale)
# 2. supabase-migration.sql (ajout colonnes)
```

## 🚨 Résolution de problèmes courants

### Erreurs Supabase
```bash
# Vérifier configuration
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Logs détaillés disponibles dans la console navigateur
# Rechercher "🔍" pour les étapes de debug
```

### Colonnes manquantes
```sql
-- Ajouter colonnes si migration pas appliquée
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS client_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS mrr_potential DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salesforce_link TEXT;
```

### Problèmes de permissions
```sql
-- Vérifier/mettre à jour politiques RLS
CREATE POLICY "Allow all operations" ON integrations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON votes FOR ALL USING (true);
```

## 🎯 Intégrations préconfigurées

**Réservation**
- Overfull (overfull.fr) - Logiciel de réservation pour restaurants

**Hôtellerie**
- Zucchetti PMS (zucchetti.fr)

**Hygiène**  
- Komia (komia.io)

**Comptabilité**
- Cegid (cegid.com)
- Sage (sage.com)

**Livraison**
- Deliveroo 
- Delicity (delicity.com)

**Third Party Integrator**
- Chift API (chift.eu) - Solution de planification RH

## 📈 Métriques et KPIs

- **MRR à risque**: Clients Lightspeed actuels qui pourraient partir
- **MRR potentiel**: Prospects refusant à cause d'intégrations manquantes  
- **Impact total**: MRR à risque + MRR potentiel
- **Nombre de demandes**: Volume total de votes par intégration
- **MRR moyen**: Valeur moyenne par demande

## 🤝 Contribution

### Ajouter une intégration
1. Modifier `INTEGRATIONS` dans `integration-selector.tsx`
2. Ajouter logo dans `/public/logos/`
3. Mettre à jour mapping dans `dashboard.tsx`
4. Optionnel: insérer en base via SQL

### Modifier les KPIs  
1. Ajuster la vue `integration_priorities` en SQL
2. Mettre à jour `dashboard.tsx` pour nouveaux champs
3. Tester avec rafraîchissement manuel

## 🚀 Déploiement sur Vercel

### Configuration automatique
```bash
# 1. Connecter le repo GitHub à Vercel
# Vercel détecte automatiquement Next.js et configure le build

# 2. Variables d'environnement à configurer dans Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### Étapes de déploiement
1. **Push vers GitHub** : Assurez-vous que le code est sur GitHub
2. **Import dans Vercel** : 
   - Aller sur [vercel.com](https://vercel.com)
   - Import Git Repository
   - Sélectionner votre repo
3. **Configuration automatique** : Vercel détecte Next.js
4. **Variables d'environnement** :
   - Aller dans Settings > Environment Variables
   - Ajouter `NEXT_PUBLIC_SUPABASE_URL`
   - Ajouter `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy** : Vercel lance automatiquement le build

### Migration base de données
Avant le déploiement, exécuter dans Supabase SQL Editor :
```sql
-- Fichier: supabase-migration-final.sql
-- Voir le fichier complet pour la migration vers la structure finale
```

### Post-déploiement
- ✅ Tester le formulaire de vote
- ✅ Vérifier le dashboard avec données de test  
- ✅ Confirmer que les filtres fonctionnent
- ✅ Tester la suppression de votes
- ✅ Valider les performances sur mobile

### URLs et domaines
- **URL automatique** : `https://votre-app.vercel.app`
- **Domaine personnalisé** : Configurable dans Vercel Dashboard
- **Preview deployments** : Automatiques sur chaque push

### Monitoring
- **Vercel Analytics** : Trafic et performance
- **Supabase Dashboard** : Base de données et API
- **Error tracking** : Logs disponibles dans Vercel

---

🏗 **Développé avec Claude Code pour Lightspeed**