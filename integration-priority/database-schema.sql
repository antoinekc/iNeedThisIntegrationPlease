-- Enable Row Level Security
ALTER DATABASE postgres SET timezone = 'Europe/Paris';

-- Create integrations table
CREATE TABLE integrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'requested' CHECK (status IN ('requested', 'in_development', 'completed')),
  description TEXT,
  development_start DATE,
  estimated_completion DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  restaurant_name VARCHAR(255) NOT NULL,
  mrr DECIMAL(10,2) NOT NULL CHECK (mrr >= 0),
  integration_name VARCHAR(255) NOT NULL,
  sales_person VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (integration_name) REFERENCES integrations(name) ON UPDATE CASCADE
);

-- Insert some common integrations
INSERT INTO integrations (name, description) VALUES
('Overfull', 'Solution de gestion hôtelière - overfull.fr'),
('Zucchetti PMS', 'Système de gestion hôtelière Lean PMS - zucchetti.fr'),
('Cegid', 'Logiciel de gestion comptable et ERP - cegid.com'),
('Komia', 'Plateforme de gestion hôtelière - komia.io'),
('Pennylane', 'Solution comptabilité en ligne'),
('Uber Eats', 'Plateforme de livraison'),
('Deliveroo', 'Service de livraison de repas'),
('Click & Collect', 'Solution de commande en ligne'),
('Borne de commande', 'Terminal de commande automatisé'),
('Mailchimp', 'Plateforme marketing email'),
('Sage', 'Logiciel de comptabilité');

-- Create view for integration priorities
CREATE OR REPLACE VIEW integration_priorities AS
SELECT 
  i.name,
  i.status,
  i.description,
  i.development_start,
  i.estimated_completion,
  COALESCE(v.total_mrr, 0) as total_mrr,
  COALESCE(v.vote_count, 0) as vote_count,
  COALESCE(v.avg_mrr, 0) as avg_mrr
FROM integrations i
LEFT JOIN (
  SELECT 
    integration_name,
    SUM(mrr) as total_mrr,
    COUNT(*) as vote_count,
    AVG(mrr) as avg_mrr
  FROM votes 
  GROUP BY integration_name
) v ON i.name = v.integration_name
ORDER BY total_mrr DESC, vote_count DESC;