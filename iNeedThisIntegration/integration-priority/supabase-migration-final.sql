-- MIGRATION FINALE vers la nouvelle structure
-- À exécuter dans l'éditeur SQL de Supabase

-- ===== ÉTAPE 1: Ajouter les nouvelles colonnes si elles n'existent pas =====
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS mrr_potential DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS client_type VARCHAR(50) CHECK (client_type IN ('current_client', 'prospect')),
ADD COLUMN IF NOT EXISTS salesforce_link TEXT;

-- ===== ÉTAPE 2: Migrer les données existantes =====
-- Copier mrr vers mrr_potential pour tous les enregistrements où mrr_potential est NULL
UPDATE votes 
SET 
  mrr_potential = mrr,
  client_type = COALESCE(client_type, 'current_client')  -- Par défaut client actuel pour les anciens votes
WHERE mrr_potential IS NULL AND mrr IS NOT NULL;

-- ===== ÉTAPE 3: Vérifier que toutes les données sont migrées =====
-- Cette requête doit retourner 0 lignes
SELECT id, restaurant_name, mrr, mrr_potential, client_type 
FROM votes 
WHERE mrr_potential IS NULL OR client_type IS NULL;

-- ===== ÉTAPE 4: Ajouter les contraintes sur les nouvelles colonnes =====
-- Rendre mrr_potential NOT NULL
ALTER TABLE votes ALTER COLUMN mrr_potential SET NOT NULL;

-- Rendre client_type NOT NULL  
ALTER TABLE votes ALTER COLUMN client_type SET NOT NULL;

-- ===== ÉTAPE 5: Supprimer l'ancienne colonne mrr =====
-- ATTENTION: Sauvegardez vos données avant cette étape !
-- Décommentez cette ligne seulement quand vous êtes sûr que tout fonctionne
-- ALTER TABLE votes DROP COLUMN mrr;

-- ===== ÉTAPE 6: Recréer la vue avec la structure finale =====
DROP VIEW IF EXISTS integration_priorities;

CREATE VIEW integration_priorities AS
SELECT 
  i.id,
  i.name,
  i.status,
  i.description,
  i.development_start,
  i.estimated_completion,
  -- MRR total potentiel
  COALESCE(v.total_mrr_potential, 0) as total_mrr_potential,
  -- MRR à risque (clients actuels)
  COALESCE(v.mrr_at_risk, 0) as mrr_at_risk,
  -- MRR prospects (nouveaux clients potentiels perdus)
  COALESCE(v.mrr_prospects, 0) as mrr_prospects,
  -- Compteurs
  COALESCE(v.total_votes, 0) as vote_count,
  COALESCE(v.current_clients_count, 0) as current_clients_count,
  COALESCE(v.prospects_count, 0) as prospects_count,
  -- Moyennes
  COALESCE(ROUND(v.avg_mrr, 2), 0) as avg_mrr,
  i.created_at
FROM integrations i
LEFT JOIN (
  SELECT 
    integration_name,
    -- MRR totaux
    SUM(mrr_potential) as total_mrr_potential,
    SUM(CASE WHEN client_type = 'current_client' THEN mrr_potential ELSE 0 END) as mrr_at_risk,
    SUM(CASE WHEN client_type = 'prospect' THEN mrr_potential ELSE 0 END) as mrr_prospects,
    -- Compteurs
    COUNT(*) as total_votes,
    COUNT(CASE WHEN client_type = 'current_client' THEN 1 END) as current_clients_count,
    COUNT(CASE WHEN client_type = 'prospect' THEN 1 END) as prospects_count,
    -- Moyenne
    AVG(mrr_potential) as avg_mrr
  FROM votes 
  GROUP BY integration_name
) v ON i.name = v.integration_name
ORDER BY 
  -- Prioriser par impact total (MRR à risque + MRR prospects)
  (COALESCE(v.mrr_at_risk, 0) + COALESCE(v.mrr_prospects, 0)) DESC,
  v.total_votes DESC;

-- ===== ÉTAPE 7: Ajouter des index pour les performances =====
CREATE INDEX IF NOT EXISTS idx_votes_integration_name ON votes(integration_name);
CREATE INDEX IF NOT EXISTS idx_votes_client_type ON votes(client_type);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);

-- ===== ÉTAPE 8: Vérifier que la migration fonctionne =====
-- Tester la vue
SELECT name, total_mrr_potential, mrr_at_risk, mrr_prospects, vote_count 
FROM integration_priorities 
ORDER BY total_mrr_potential DESC 
LIMIT 5;

-- Vérifier la structure finale de la table votes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position;