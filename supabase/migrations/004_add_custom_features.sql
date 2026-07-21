-- ============================================================
-- SiteAlugado - Migration 004
-- Adiciona suporte a novos recursos customizados na tabela tenants
-- ============================================================

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS custom_form JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_analytics_config JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_widget_config JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS form_submissions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tenants.custom_form IS 'Configuração do construtor de formulários personalizado do inquilino';
COMMENT ON COLUMN tenants.payment_config IS 'Configuração do gateway de pagamento (Pix/WhatsApp, Stripe, etc)';
COMMENT ON COLUMN tenants.seo_analytics_config IS 'Configuração de Pixel do Facebook, Google Analytics e SEO';
COMMENT ON COLUMN tenants.whatsapp_widget_config IS 'Configuração do widget flutuante de WhatsApp inteligente';
COMMENT ON COLUMN tenants.form_submissions IS 'Mensagens/submissões capturadas do formulário personalizado';
