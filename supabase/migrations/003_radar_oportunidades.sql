-- ============================================================
-- SiteAlugado - Migration 003
-- Módulo: Radar de Oportunidades (Admin Exclusivo)
-- Tabelas: radar_companies, radar_audits
-- ============================================================

-- Tabela principal de empresas encontradas pelo radar
CREATE TABLE IF NOT EXISTS radar_companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category        TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  email           TEXT,
  website         TEXT,
  instagram       TEXT,
  facebook        TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  osm_id          TEXT,                        -- ID do OpenStreetMap
  status          TEXT DEFAULT 'found'         -- found | auditing | audited | proposal_sent | converted
    CHECK (status IN ('found','auditing','audited','proposal_sent','converted')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Resultado completo da auditoria de uma empresa
CREATE TABLE IF NOT EXISTS radar_audits (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID UNIQUE REFERENCES radar_companies(id) ON DELETE CASCADE,
  audited_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Módulo 1: Disponibilidade
  is_online             BOOLEAN,
  has_https             BOOLEAN,
  ssl_valid             BOOLEAN,
  ssl_expiry_days       INTEGER,
  response_time_ms      INTEGER,
  dns_resolves          BOOLEAN,
  redirect_count        INTEGER DEFAULT 0,

  -- Pontuações (0-100)
  score_seo             INTEGER DEFAULT 0,
  score_performance     INTEGER DEFAULT 0,
  score_security        INTEGER DEFAULT 0,
  score_mobile          INTEGER DEFAULT 0,
  score_accessibility   INTEGER DEFAULT 0,
  score_code            INTEGER DEFAULT 0,
  score_general         INTEGER DEFAULT 0,

  -- Classificação como oportunidade de negócio (1-5 estrelas)
  -- 5 estrelas = site muito ruim = melhor oportunidade de venda
  stars                 INTEGER DEFAULT 1
    CHECK (stars BETWEEN 1 AND 5),

  -- Arrays JSON de problemas e tecnologias detectadas
  issues                JSONB DEFAULT '[]',
  technologies          JSONB DEFAULT '[]',

  -- Dados detalhados por módulo
  seo_data              JSONB,   -- Módulo 2: tags, meta, links, etc.
  performance_data      JSONB,   -- Módulo 4: LCP, CLS, FCP, TTFB, etc.
  security_data         JSONB,   -- Módulo 6: headers HTTP
  mobile_data           JSONB,   -- Módulo 5: viewport, responsividade
  broken_links          JSONB DEFAULT '[]',  -- Módulo 3: links quebrados
  wordpress_data        JSONB,   -- Módulo 8: versão, tema, plugins
  code_data             JSONB,   -- Módulo 9: HTML, JS, CSS

  -- IA: textos gerados
  ai_summary            TEXT,    -- Resumo técnico
  ai_commercial         TEXT,    -- Resumo comercial
  ai_whatsapp_msg       TEXT,    -- Mensagem WhatsApp pronta
  ai_email_msg          TEXT,    -- Mensagem e-mail pronta
  ai_proposal           TEXT,    -- Proposta comercial completa

  -- Estimativa de valor do projeto
  estimated_value_min   DECIMAL(10,2),
  estimated_value_max   DECIMAL(10,2),
  complexity            TEXT     -- low | medium | high
    CHECK (complexity IN ('low','medium','high'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_radar_companies_city_state ON radar_companies(city, state);
CREATE INDEX IF NOT EXISTS idx_radar_companies_status ON radar_companies(status);
CREATE INDEX IF NOT EXISTS idx_radar_audits_company ON radar_audits(company_id);
CREATE INDEX IF NOT EXISTS idx_radar_companies_created ON radar_companies(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_radar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER radar_companies_updated_at
  BEFORE UPDATE ON radar_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_radar_updated_at();

-- Comentários de documentação
COMMENT ON TABLE radar_companies IS 'Empresas encontradas pelo Radar de Oportunidades (módulo admin)';
COMMENT ON TABLE radar_audits IS 'Resultados completos das auditorias de websites das empresas do radar';
COMMENT ON COLUMN radar_audits.stars IS '5 estrelas = site muito ruim = melhor oportunidade comercial';
