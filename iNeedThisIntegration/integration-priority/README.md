# Outil de Priorisation d'Intégrations Lightspeed

Application web pour aider les équipes commerciales à prioriser les intégrations en fonction des demandes clients et de leur MRR.

## 🎯 Concept

- **Vote pondéré** : Chaque demande d'intégration = 1 vote pondéré par le MRR mensuel du restaurant
- **Priorisation automatique** : Les intégrations sont classées par MRR total cumulé
- **Interface simple** : Formulaire rapide pour les commerciaux

## 🚀 Configuration

### 1. Base de données Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Exécuter le script `database-schema.sql` dans l'éditeur SQL
3. Récupérer l'URL et la clé anonyme du projet

### 2. Variables d'environnement

Compléter le fichier `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 3. Installation et démarrage

```bash
npm install
npm run dev
```

L'application sera accessible sur http://localhost:3000

## 📊 Fonctionnalités

### Dashboard
- **Statistiques globales** : MRR total, nombre de demandes, intégrations
- **Classement des priorités** : Intégrations triées par impact MRR
- **Historique des votes** : Dernières demandes soumises

### Formulaire de vote
- **Données restaurant** : Nom et MRR mensuel
- **Sélection d'intégration** : Liste prédéfinie + possibilité d'ajouter
- **Tracking commercial** : Nom du commercial pour suivi

## 🏗 Architecture

- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend** : Supabase (BaaS)
- **Base de données** : PostgreSQL avec vues automatisées
- **UI** : Radix UI + shadcn/ui

## 📋 Utilisation

### Pour les commerciaux
1. Aller sur l'onglet "Nouvelle demande"
2. Remplir : nom du restaurant, MRR, intégration souhaitée
3. Ajouter son nom et des notes si nécessaire
4. Valider la demande

### Pour les responsables partenariats
1. Consulter le dashboard pour voir les priorités
2. Analyser le MRR total et le nombre de demandes
3. Prendre des décisions basées sur les données terrain

## 🎯 Intégrations pré-configurées

**Gestion hôtelière :**
- Overfull (overfull.fr)
- Zucchetti PMS (zucchetti.fr)

**Hygiène :**
- Komia (komia.io)

**ERP & Comptabilité :**
- Cegid (cegid.com)
- Pennylane
- Sage

**Livraison & Commande :**
- Deliveroo
- Click & Collect
- Borne de commande

**Marketing :**
- Mailchimp

Possibilité d'ajouter de nouvelles intégrations via le formulaire.
