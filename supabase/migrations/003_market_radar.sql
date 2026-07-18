-- ============================================================
-- SiteAlugado - Migration 003
-- Criação das tabelas do módulo Market Radar AI (Inteligência Competitiva)
-- ============================================================

-- 1. TABELA: market_radar_competitors
-- Concorrentes adicionados ao monitoramento por cada tenant
CREATE TABLE IF NOT EXISTS market_radar_competitors (
  id                  TEXT PRIMARY KEY,                         -- ID único (ex: 'osm-node-12345' ou uuid)
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  category            TEXT NOT NULL,                            -- Nicho (Oficina, Barbearia, etc.)
  address             TEXT,
  latitude            NUMERIC(9,6) NOT NULL,
  longitude           NUMERIC(9,6) NOT NULL,
  distance_km         NUMERIC(6,2),
  price_level         TEXT DEFAULT '$$',                        -- $, $$, $$$, $$$$
  business_age        INTEGER DEFAULT 1,                        -- Anos no mercado
  rating              NUMERIC(3,2) DEFAULT 4.0,                 -- Avaliação do Google (ex: 4.5)
  reviews_count       INTEGER DEFAULT 5,                        -- Quantidade de avaliações
  phone               TEXT,
  whatsapp            TEXT,
  website             TEXT,
  instagram           TEXT,
  facebook            TEXT,
  
  -- Métricas de SEO / Performance (obtidas da PageSpeed API)
  seo_score           INTEGER DEFAULT NULL,
  seo_performance     INTEGER DEFAULT NULL,
  seo_experience      INTEGER DEFAULT NULL,                     -- Experiência Mobile
  
  -- Análise Inteligente de IA (Gemini)
  analysis_summary    TEXT DEFAULT NULL,
  analysis_strengths  JSONB DEFAULT '[]',                       -- Lista de pontos fortes
  analysis_weaknesses JSONB DEFAULT '[]',                       -- Lista de pontos fracos
  analysis_seo        TEXT DEFAULT NULL,
  analysis_identity   TEXT DEFAULT NULL,
  analysis_presence   TEXT DEFAULT NULL,
  analysis_suggestions JSONB DEFAULT '[]',                      -- Recomendações geradas pela IA
  analysis_score      INTEGER DEFAULT NULL,                     -- Nota Geral do Concorrente (0-100)
  
  monitored           BOOLEAN DEFAULT TRUE,                     -- Se está sob monitoramento automático periódico
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mr_competitors_tenant ON market_radar_competitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mr_competitors_category ON market_radar_competitors(category);

-- 2. TABELA: market_radar_history
-- Histórico de evolução dos concorrentes monitorados (notas, avaliações, etc.)
CREATE TABLE IF NOT EXISTS market_radar_history (
  id            TEXT PRIMARY KEY,                         -- ID em formato uuid ou string
  competitor_id TEXT NOT NULL REFERENCES market_radar_competitors(id) ON DELETE CASCADE,
  rating        NUMERIC(3,2) NOT NULL,
  reviews_count INTEGER NOT NULL,
  recorded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mr_history_competitor ON market_radar_history(competitor_id);
CREATE INDEX IF NOT EXISTS idx_mr_history_recorded ON market_radar_history(recorded_at);

-- 3. TABELA: market_radar_alerts
-- Alertas gerados pelo monitoramento para avisar o tenant
CREATE TABLE IF NOT EXISTS market_radar_alerts (
  id            TEXT PRIMARY KEY,                         -- ID único
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  competitor_id TEXT NOT NULL REFERENCES market_radar_competitors(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,                            -- 'new_competitor', 'rating_change', 'website_change'
  message       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mr_alerts_tenant ON market_radar_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mr_alerts_unread ON market_radar_alerts(tenant_id) WHERE is_read = FALSE;

COMMENT ON TABLE market_radar_competitors IS 'Concorrentes monitorados pelo módulo Market Radar AI.';
COMMENT ON TABLE market_radar_history IS 'Histórico periódico de reputação dos concorrentes.';
COMMENT ON TABLE market_radar_alerts IS 'Alertas gerados a partir do monitoramento automático do Market Radar.';
