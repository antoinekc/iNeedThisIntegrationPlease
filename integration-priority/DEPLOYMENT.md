# 🚀 Guide de Déploiement - Lightspeed Integration Priority Tool

## Pré-requis avant déploiement

### 1. Migration base de données Supabase ⚠️ **IMPORTANT**
Exécuter le script `supabase-migration-final.sql` dans l'éditeur SQL de Supabase :

```sql
-- ÉTAPE 1: Ajouter les nouvelles colonnes
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS mrr_potential DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS client_type VARCHAR(50) CHECK (client_type IN ('current_client', 'prospect')),
ADD COLUMN IF NOT EXISTS salesforce_link TEXT;

-- ÉTAPE 2: Migrer les données existantes
UPDATE votes 
SET 
  mrr_potential = mrr,
  client_type = COALESCE(client_type, 'current_client')
WHERE mrr_potential IS NULL AND mrr IS NOT NULL;

-- ÉTAPE 3: Contraintes
ALTER TABLE votes ALTER COLUMN mrr_potential SET NOT NULL;
ALTER TABLE votes ALTER COLUMN client_type SET NOT NULL;

-- ÉTAPE 4: Vue finale (voir supabase-migration-final.sql pour le script complet)
```

### 2. Variables d'environnement
Préparer les valeurs suivantes :
```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

## 🚀 Déploiement Vercel

### Étape 1 : Préparation GitHub
```bash
# Pousser le code sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Étape 2 : Import Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "New Project"
4. Importer votre repository `integration-priority`
5. Vercel détecte automatiquement Next.js

### Étape 3 : Configuration des variables
Dans Vercel Dashboard > Settings > Environment Variables :
- `NEXT_PUBLIC_SUPABASE_URL` = `https://votre-projet.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (votre clé)

### Étape 4 : Déploiement
Cliquer sur "Deploy" - Vercel lance automatiquement :
- `npm install`
- `npm run build`
- Déploiement automatique

## ✅ Tests post-déploiement

### Checklist de validation
- [ ] **Page d'accueil** : Titre et slogan s'affichent correctement
- [ ] **Dashboard** : KPIs et cartes des intégrations visibles
- [ ] **Nouveau vote** : Formulaire complet fonctionnel
  - [ ] Sélection d'intégration (format carré)
  - [ ] Radio buttons type de client 
  - [ ] Validation des champs requis
  - [ ] Soumission successful
- [ ] **Historique** : 
  - [ ] Liste des votes s'affiche
  - [ ] Filtres fonctionnent (recherche, intégration, type client)
  - [ ] Suppression de votes
- [ ] **Mobile** : Interface responsive sur téléphone

### URLs générées
- **Production** : `https://votre-app-name.vercel.app`
- **Domaine personnalisé** : Configurable dans Vercel
- **Preview branches** : URL automatiques pour chaque branche

## 🔧 Maintenance

### Ajouter une nouvelle intégration
1. Modifier `src/components/integration-selector.tsx`
2. Ajouter dans le tableau `INTEGRATIONS`
3. Commit et push → déploiement automatique

### Monitoring
- **Vercel Analytics** : Trafic et performances
- **Supabase Dashboard** : Métriques base de données
- **Logs d'erreur** : Disponibles dans Vercel Functions

### Mises à jour
- Chaque `git push` déclenche un nouveau déploiement
- Rollback possible depuis Vercel Dashboard
- Preview deployments sur les Pull Requests

## 🚨 Troubleshooting

### Erreurs communes
1. **Variables d'environnement manquantes** : Vérifier dans Vercel Settings
2. **Migration non appliquée** : Exécuter le script SQL dans Supabase
3. **Build fail** : Vérifier `npm run build` en local d'abord

### Support
- **Logs Vercel** : Dashboard > Functions > View Function Logs
- **Supabase** : Dashboard > Logs pour les erreurs API
- **Next.js** : Console navigateur pour erreurs frontend

---

🎯 **Application prête pour production chez Lightspeed !**