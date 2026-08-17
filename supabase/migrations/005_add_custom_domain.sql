-- ============================================================
-- SiteAlugado - Migration 005
-- Adiciona suporte a domínio personalizado (custom_domain) na tabela tenants
-- Usado pelo módulo de domínio personalizado pago
-- ============================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS custom_domain TEXT DEFAULT NULL;

COMMENT ON COLUMN tenants.custom_domain IS 'Domínio personalizado do tenant, ex: jkaturismo.com.br. Configurado pelo superadmin via painel.';

-- Índice para busca rápida por domínio (ex: ao acessar pelo domínio direto)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
