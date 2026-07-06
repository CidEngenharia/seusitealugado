-- ============================================================
-- SiteAlugado - Migration 002
-- Adiciona coluna instagram_photos na tabela tenants
-- Exclusivo para clientes do Plano Premium
-- ============================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS instagram_photos JSONB DEFAULT NULL;

COMMENT ON COLUMN tenants.instagram_photos IS 'Array com até 6 URLs de fotos do Instagram. Exclusivo para clientes Premium.';
