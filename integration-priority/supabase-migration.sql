-- Migration pour ajouter les nouveaux champs et Delicity
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter les nouvelles colonnes à la table votes
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS mrr_potential DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS client_type VARCHAR(50) CHECK (client_type IN ('current_client', 'prospect')),
ADD COLUMN IF NOT EXISTS salesforce_link TEXT;

-- Migrer les données existantes (si il y en a)
UPDATE votes 
SET 
  mrr_potential = mrr,
  client_type = 'current_client'
WHERE mrr_potential IS NULL;

-- Ajouter Delicity à la liste des intégrations
INSERT INTO integrations (name, description) VALUES 
('Delicity', 'Plateforme de livraison - delicity.com')
ON CONFLICT (name) DO NOTHING;

-- Supprimer l'ancienne colonne mrr (optionnel - à faire plus tard si tout fonctionne)
-- ALTER TABLE votes DROP COLUMN IF EXISTS mrr;

-- Mettre à jour la vue integration_priorities pour les nouveaux KPI
CREATE OR REPLACE VIEW integration_priorities AS
SELECT 
  i.name,
  i.status,
  i.description,
  i.development_start,
  i.estimated_completion,
  -- MRR total potentiel
  COALESCE(v.total_mrr_potential, 0) as total_mrr_potential,
  -- MRR à risque (clients actuels)
  COALESCE(v.mrr_at_risk, 0) as mrr_at_risk,
  -- MRR prospect (nouveaux clients potentiels)
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