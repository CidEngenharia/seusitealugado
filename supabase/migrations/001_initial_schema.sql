-- ============================================================
-- SiteAlugado - Schema Inicial do Supabase
-- Versão: 001
-- Gerado em: 2026-06-26
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: tenants
-- Dados principais de cada empresa cadastrada na plataforma
-- ============================================================
CREATE TABLE IF NOT EXISTS tenants (
  id              TEXT PRIMARY KEY,                        -- ex: "tenant-1"
  slug            TEXT UNIQUE NOT NULL,                    -- URL amigável ex: "barbeariakeu"
  name            TEXT NOT NULL,
  owner_name      TEXT NOT NULL,
  owner_email     TEXT NOT NULL,
  logo_url        TEXT,
  banner_url      TEXT,
  theme_color     TEXT DEFAULT 'amber',
  theme_mode      TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark')),
  font_family     TEXT DEFAULT 'sans' CHECK (font_family IN ('sans', 'serif', 'mono')),
  template        TEXT DEFAULT 'modern' CHECK (template IN ('classic', 'modern', 'minimal')),
  description     TEXT,
  address         TEXT,
  opening_hours   TEXT,
  socials         JSONB DEFAULT '{}',                      -- { whatsapp, instagram, phone, email, ... }
  map_location    TEXT,
  fidelity_program JSONB DEFAULT '{}',                    -- { type, rate, rule }
  plan            TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'premium')),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  plan_expiration TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: services
-- Serviços oferecidos por cada tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration    INTEGER DEFAULT 0,                           -- duração em minutos
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

-- ============================================================
-- TABELA: crm_clients
-- Clientes cadastrados no CRM de cada tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_clients (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  cpf             TEXT,
  birthday        DATE,
  notes           TEXT,
  pipeline_stage  TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'negotiation', 'active', 'inactive')),
  points          INTEGER DEFAULT 0,
  cashback        NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_clients_tenant_id ON crm_clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_clients_email ON crm_clients(email);
CREATE INDEX IF NOT EXISTS idx_crm_clients_phone ON crm_clients(phone);

-- ============================================================
-- TABELA: bookings
-- Agendamentos de cada tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_name     TEXT NOT NULL,
  client_phone    TEXT,
  client_email    TEXT,
  service_id      TEXT REFERENCES services(id) ON DELETE SET NULL,
  date_time       TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================================
-- TABELA: finance_entries
-- Lançamentos financeiros (receitas e despesas)
-- ============================================================
CREATE TABLE IF NOT EXISTS finance_entries (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category        TEXT,
  amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  date            DATE NOT NULL,
  description     TEXT,
  payment_method  TEXT CHECK (payment_method IN ('money', 'card', 'pix')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_entries_tenant_id ON finance_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_entries_date ON finance_entries(date);
CREATE INDEX IF NOT EXISTS idx_finance_entries_type ON finance_entries(type);

-- ============================================================
-- TABELA: finance_payables
-- Contas a pagar
-- ============================================================
CREATE TABLE IF NOT EXISTS finance_payables (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  due_date    DATE NOT NULL,
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_payables_tenant_id ON finance_payables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_payables_due_date ON finance_payables(due_date);

-- ============================================================
-- TABELA: finance_receivables
-- Contas a receber
-- ============================================================
CREATE TABLE IF NOT EXISTS finance_receivables (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  service_name TEXT,
  amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_date     DATE NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_receivables_tenant_id ON finance_receivables(tenant_id);

-- ============================================================
-- TABELA: inventory
-- Estoque de produtos de cada tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code          TEXT,
  name          TEXT NOT NULL,
  category      TEXT,
  quantity      INTEGER DEFAULT 0,
  min_quantity  INTEGER DEFAULT 0,
  supplier      TEXT,
  cost_price    NUMERIC(10,2) DEFAULT 0,
  sale_price    NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant_id ON inventory(tenant_id);

-- ============================================================
-- TABELA: marketing_campaigns
-- Cupons e campanhas de marketing
-- ============================================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  discount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  type        TEXT DEFAULT 'percent' CHECK (type IN ('percent', 'value')),
  title       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant_id ON marketing_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_code ON marketing_campaigns(code);

-- ============================================================
-- TABELA: reviews
-- Avaliações dos clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  date        DATE NOT NULL,
  approved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- ============================================================
-- TABELA: products_to_sell
-- Produtos disponíveis para venda na loja pública do tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS products_to_sell (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_to_sell_tenant_id ON products_to_sell(tenant_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Por ora, políticas permissivas para a chave anon (necessário
-- já que o frontend usa a chave pública do Supabase).
-- Em produção, refine as políticas conforme necessário.
-- ============================================================

ALTER TABLE tenants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE services             ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_payables     ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_receivables  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory            ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_to_sell     ENABLE ROW LEVEL SECURITY;

-- Políticas: permitir leitura pública (SELECT) para todos
CREATE POLICY "allow_public_read_tenants"             ON tenants              FOR SELECT USING (true);
CREATE POLICY "allow_public_read_services"            ON services             FOR SELECT USING (true);
CREATE POLICY "allow_public_read_bookings"            ON bookings             FOR SELECT USING (true);
CREATE POLICY "allow_public_read_reviews"             ON reviews              FOR SELECT USING (approved = true);
CREATE POLICY "allow_public_read_products"            ON products_to_sell     FOR SELECT USING (true);
CREATE POLICY "allow_public_read_campaigns"           ON marketing_campaigns  FOR SELECT USING (true);

-- Políticas: permitir INSERT público (para agendamentos de clientes, avaliações)
CREATE POLICY "allow_public_insert_bookings"  ON bookings  FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_public_insert_reviews"   ON reviews   FOR INSERT WITH CHECK (true);

-- Políticas: permitir operações completas via service_role (admin/backend)
CREATE POLICY "allow_service_role_all_tenants"           ON tenants              FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_services"          ON services             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_crm"               ON crm_clients          FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_bookings"          ON bookings             FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_finance_entries"   ON finance_entries      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_finance_payables"  ON finance_payables     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_finance_recv"      ON finance_receivables  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_inventory"         ON inventory            FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_campaigns"         ON marketing_campaigns  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_reviews"           ON reviews              FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_all_products"          ON products_to_sell     FOR ALL USING (auth.role() = 'service_role');

-- Políticas CRM e finanças: apenas service_role (dados sensíveis)
CREATE POLICY "allow_service_role_read_crm"              ON crm_clients          FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_read_finance_entries"  ON finance_entries      FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_read_finance_payables" ON finance_payables     FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_read_finance_recv"     ON finance_receivables  FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "allow_service_role_read_inventory"        ON inventory            FOR SELECT USING (auth.role() = 'service_role');


-- ============================================================
-- SEED: Dados iniciais dos 5 tenants do database.json
-- ============================================================

-- --------------------------
-- TENANTS
-- --------------------------
INSERT INTO tenants (id, slug, name, owner_name, owner_email, logo_url, banner_url, theme_color, theme_mode, font_family, template, description, address, opening_hours, socials, map_location, fidelity_program, plan, status, plan_expiration, created_at) VALUES
(
  'tenant-1', 'barbeariakeu', 'Barbearia do Keu', 'Keu Santos', 'feedback@barbeariakeu.com',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'amber', 'dark', 'mono', 'classic',
  'Corte de cabelo clássico, degradê, ajuste de barba esculpida na navalha com toalha quente e massagem facial. Ambiente clássico com café artesanal e cerveja gelada inclusos na assinatura.',
  'Rua Augusta, 1420 - Consolação, São Paulo - SP',
  'Seg-Sáb: 09h às 21h',
  '{"whatsapp": "(11) 98765-4321", "instagram": "@barbeariadokeu", "phone": "(11) 3215-6743", "email": "contato@barbeariakeu.com"}',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.4109489500746!2d-46.6601673!3d-23.5536443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59d2b2708eb1%3A0x6bba31da61b36e87!2sR.%20Augusta%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1718790000000!5m2!1spt-BR!2sbr',
  '{"type": "cashback", "rate": 10, "rule": "10% de cashback devolvido em todas as compras que acumulam no saldo do CRM do cliente para descontar no próximo serviço."}',
  'premium', 'active', '2026-07-10T11:00:00Z', '2026-01-10T11:00:00Z'
),
(
  'tenant-2', 'salaodajulie', 'Salão da Julie', 'Julie Andrews', 'julie@salaodajulie.com.br',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'rose', 'light', 'serif', 'minimal',
  'Salão de beleza focado em bem-estar, realce da beleza autoral, colorações orgânicas, mechas personalizadas e terapia capilar profunda com produtos veganos certificados para sua saúde.',
  'Av. Faria Lima, 2100 - Cerqueira César, São Paulo - SP',
  'Ter-Sáb: 10h às 20h',
  '{"whatsapp": "(11) 97766-5544", "instagram": "@salaodajulie", "phone": "(11) 4002-8922", "email": "contato@salaodajulie.com"}',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1757827670783!2d-46.6853678!3d-23.5658428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57022d99bc45%3A0xe7a5c71d701e51b3!2sAv.%20Brig.%20Faria%20Lima%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1718790100000!5m2!1spt-BR!2sbr',
  '{"type": "points", "rate": 1, "rule": "1 ponto para cada R$ 1 gasto. Ao acumular 200 pontos, ganha uma maravilhosa massagem nos pés ou escova simples de brinde!"}',
  'premium', 'active', '2026-08-15T10:00:00Z', '2026-02-15T10:00:00Z'
),
(
  'tenant-3', 'oficinadocarlos', 'Oficina do Carlos', 'Carlos Alberto', 'carlos@oficinadocarlos.com.br',
  'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'blue', 'dark', 'sans', 'modern',
  'Referência em retífica de motores, reparação mecânica profunda, diagnóstico eletrônico computadorizado avançado, troca de óleo reguladora e serviços de freio em geral.',
  'Av. do Estado, 4500 - Cambuci, São Paulo - SP',
  'Seg-Sex: 08h às 18h',
  '{"whatsapp": "(11) 96655-8899", "instagram": "@oficinadocarlos", "phone": "(11) 5055-3211", "email": "contato@oficinadocarlos.com"}',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.983427909068!2d-46.6111111!3d-23.5701111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce596cc6583925%3A0xc3f8b05fe6b5b5cf!2sAv.%20do%20Estado%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1718790200000!5m2!1spt-BR!2sbr',
  '{"type": "points", "rate": 1, "rule": "Troque pontos por descontos em mão de obra especializada futuramente!"}',
  'basic', 'active', '2026-07-10T11:00:00Z', '2026-03-10T11:00:00Z'
),
(
  'tenant-4', 'petshopfeliz', 'Pet Shop Feliz', 'Carlos Drumond', 'drumond@petshopfeliz.com',
  'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1541599540903-216a46ca1bf0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'emerald', 'light', 'sans', 'modern',
  'O melhor espaço para o banho, hidratação de pelos e embelezamento do seu peludinho. Profissionais carinhosos, táxi pet furgão e consultório veterinário preventivo integrado.',
  'Rua das Figueiras, 650 - Jardim Bairro, Santo André - SP',
  'Seg-Sáb: 08h às 19h',
  '{"whatsapp": "(11) 95533-1122", "instagram": "@petshopfeliz", "phone": "(11) 4435-0012", "email": "contato@petshopfeliz.com"}',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.512644265431!2d-46.536782!3d-23.654812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce42eb78121bc3%3A0xe542385f0ef32ba5!2sR.%20das%20Figueiras%2C%20Santo%20Andr%C3%A9%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1718790300000!5m2!1spt-BR!2sbr',
  '{"type": "points", "rate": 5, "rule": "Retorne a cada 10 banhos e ganhe 1 tosa simples gratuita."}',
  'premium', 'active', '2026-07-15T11:00:00Z', '2026-01-15T11:00:00Z'
),
(
  'tenant-5', 'sallesfit', 'SallesFit', 'Sidney Sales', 'sidney.sales@gmail.com',
  '/src/assets/images/sallesfit_logo_1782162401662.jpg',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'rose', 'dark', 'sans', 'modern',
  'Moda fitness premium, vestuário de alta performance e consultoria esportiva inteligente. Tecidos tecnológicos dry-fit e modelagem ergonômica premium feitos para te mover rumo aos seus objetivos.',
  'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  'Seg-Sáb: 07h às 22h',
  '{"whatsapp": "(11) 99999-8888", "instagram": "@sallesfit", "phone": "(11) 3252-9988", "email": "contato@sallesfit.com.br"}',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197418928!2d-46.656!3d-23.561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59cef!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1718790000000!5m2!1spt-BR!2sbr',
  '{"type": "points", "rate": 10, "rule": "Ganhe 1 ponto a cada R$ 1 gasto. Junte 100 pontos e ganhe R$ 10 de desconto."}',
  'premium', 'active', '2026-12-22T10:00:00Z', '2026-06-22T10:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- SERVICES
-- --------------------------
INSERT INTO services (id, tenant_id, name, description, price, duration, image_url) VALUES
-- Barbearia do Keu
('srv-1', 'tenant-1', 'Degradê Ultra Moderno', 'Ajuste na máquina e tesoura com shaver para acabamento liso perfeito de alta durabilidade.', 55.00, 40, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-2', 'tenant-1', 'Terapia de Barba do Keu', 'Processo em 5 etapas com vapor de ozônio, óleos hidratantes, toalha quente e corte navalhado.', 45.00, 30, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-3', 'tenant-1', 'Combo Imperial (Cabelo + Barba + Massagem)', 'O pacote completo do cavalheiro. Corte, barba com toalha quente, lavagem e alinhamento de sobrancelha.', 90.00, 75, 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
-- Salão da Julie
('srv-2-1', 'tenant-2', 'Escova Hidratação Vegana', 'Lavagem profunda com xampu detox de óleos essenciais, máscara reparadora intensa e escova lisa ou modelada.', 120.00, 60, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-2-2', 'tenant-2', 'Manicure & Pedicure Premium', 'Espalda artesanal, cutilagem fina com instrumentos autoclavados, esfoliação de pêssego e esmaltação importada de longa duração.', 75.00, 50, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
-- Oficina do Carlos
('srv-3-1', 'tenant-3', 'Revisão Mecânica Preventiva Completa', 'Diagnóstico computadorizado de injeção direta, medição de pressão dos cilindros, checagem de pastilhas de freio, filtros e fluidos.', 350.00, 180, 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-3-2', 'tenant-3', 'Troca Filtro & Óleo Sintético 5W30', 'Substituição completa de óleo lubrificante sintético premium, filtro de óleo e reset de painel contador de tempo.', 180.00, 45, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
-- Pet Shop Feliz
('srv-4-1', 'tenant-4', 'Super Banho + Tosa Higiênica', 'Shampoo hipoalergênico premium, condicionador restaurador, secagem com soprador silencioso, corte de unhas e limpeza de orelhas inclusas.', 85.00, 90, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-4-2', 'tenant-4', 'Terapia Spa Furminator Outono', 'Processo profissional com escova especial Furminator para remoção de até 90% dos pelos mortos que caem pela casa.', 110.00, 110, 'https://images.unsplash.com/photo-1581888227599-779811939961?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
-- SallesFit
('srv-5-1', 'tenant-5', 'Consultoria Fitness VIP', 'Acompanhamento personalizado com planilha de treinos, dieta ajustada semanalmente e suporte esportivo completo.', 199.00, 60, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
('srv-5-2', 'tenant-5', 'Treino Funcional de Alta Queima', 'Circuito dinâmico focado em emagrecimento rápido, condicionamento cárdio superior e ganho de força muscular.', 45.00, 45, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3')
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- CRM CLIENTS
-- --------------------------
INSERT INTO crm_clients (id, tenant_id, name, phone, email, cpf, birthday, notes, pipeline_stage, points, cashback, created_at) VALUES
-- Barbearia do Keu
('cli-1', 'tenant-1', 'Lucas Alencar', '(11) 99123-4567', 'lucas@email.com', '123.456.789-00', '1995-04-12', 'Gosta de corte degradê bem alto com risca lateral de detalhe.', 'active', 45, 18.50, '2026-03-01T12:00:00Z'),
('cli-2', 'tenant-1', 'Guilherme Sampaio', '(11) 98877-6655', 'guilherme.s@email.com', NULL, NULL, 'Gosta de cabelo curto tradicional, prefere finalizar com pomada mate.', 'negotiation', 15, 5.00, '2026-05-18T14:30:00Z'),
('cli-3', 'tenant-1', 'Ricardo Mendes', '(11) 97722-1133', 'ricardo.mendes@email.com', NULL, NULL, 'Cliente inativo desde o mês passado. Costuma vir a cada 15 dias para barba.', 'inactive', 80, 35.00, '2026-01-10T11:00:00Z'),
('cli-4', 'tenant-1', 'Nicolas Freitas', '(11) 96655-4433', 'nicolas@email.com', NULL, NULL, 'Novo lead interessado após ver propaganda no Instagram.', 'lead', 0, 0.00, '2026-06-15T09:00:00Z'),
-- Salão da Julie
('cli-2-1', 'tenant-2', 'Mariana Alvarenga', '(11) 99345-6789', 'mariana.alv@email.com', NULL, '1991-08-20', 'Usa apenas esmaltes neutros e nude.', 'active', 15, 10.00, '2026-04-10T12:00:00Z'),
-- Pet Shop Feliz
('cli-4-1', 'tenant-4', 'Bernardo Silva (Mel)', '(11) 94432-1111', 'bernardo@email.com', NULL, NULL, 'Dona da Golden Mel. Gosta de lacinho rosa.', 'active', 85, 12.00, '2026-01-20T10:00:00Z'),
-- SallesFit
('cli-5-1', 'tenant-5', 'Carlos Andrade', '(11) 99888-7777', 'carlos.fit@email.com', NULL, NULL, 'Usa tamanho G. Focado em treinamento hipertrófico.', 'active', 150, 35.00, '2026-04-10T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- BOOKINGS
-- --------------------------
INSERT INTO bookings (id, tenant_id, client_name, client_phone, client_email, service_id, date_time, status, notes) VALUES
-- Barbearia do Keu
('b-1', 'tenant-1', 'Lucas Alencar', '(11) 99123-4567', 'lucas@email.com', 'srv-3', '2026-06-20T10:00:00Z', 'confirmed', 'Agendado para sábado de manhã rápida de folga.'),
('b-2', 'tenant-1', 'Guilherme Sampaio', '(11) 98877-6655', 'guilherme.s@email.com', 'srv-1', '2026-06-18T15:00:00Z', 'attended', 'Realizado com sucesso. Pagou via Pix.'),
('b-3', 'tenant-1', 'Carlos Drumond', '(11) 96321-7412', 'carlos.d@email.com', 'srv-2', '2026-06-21T16:30:00Z', 'pending', 'Deseja testar a pomada pós navalha nova.'),
-- Salão da Julie
('b-2-1', 'tenant-2', 'Mariana Alvarenga', '(11) 99345-6789', 'mariana.alv@email.com', 'srv-2-2', '2026-06-21T14:00:00Z', 'confirmed', NULL),
-- Pet Shop Feliz
('b-4-1', 'tenant-4', 'Bernardo Silva (Mel)', '(11) 94432-1111', 'bernardo@email.com', 'srv-4-1', '2026-06-20T14:00:00Z', 'confirmed', NULL)
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- FINANCE ENTRIES
-- --------------------------
INSERT INTO finance_entries (id, tenant_id, type, category, amount, date, description, payment_method) VALUES
-- Barbearia do Keu
('f-1', 'tenant-1', 'income', 'Serviço', 90.00, '2026-06-18', 'Combo Imperial - Lucas Alencar', 'pix'),
('f-2', 'tenant-1', 'income', 'Venda Produto', 50.00, '2026-06-17', 'Pomada Modeladora Seca - 1 unidade', 'card'),
('f-3', 'tenant-1', 'expense', 'Aluguel', 1500.00, '2026-06-05', 'Aluguel da Sala Comercial Augusta', 'pix'),
('f-4', 'tenant-1', 'expense', 'Energia', 285.40, '2026-06-10', 'Energia Elétrica Enel Junho', 'money'),
('f-5', 'tenant-1', 'income', 'Serviço', 55.00, '2026-06-19', 'Corte Degradê - Guilherme Sampaio', 'pix'),
('f-6', 'tenant-1', 'expense', 'Fornecedores', 400.00, '2026-06-12', 'Nox Fornecedores Pomada e Óleo Barba', 'card'),
-- Salão da Julie
('f-2-1', 'tenant-2', 'income', 'Serviço', 240.00, '2026-06-15', 'Duas Cutilagens e Escovas Realizadas', 'pix'),
('f-2-2', 'tenant-2', 'expense', 'Fornecedores', 300.00, '2026-06-12', 'Corantes Orgânicos e Cosméticos L''Oreal', 'card'),
-- Oficina do Carlos
('f-3-1', 'tenant-3', 'income', 'Serviço', 350.00, '2026-06-12', 'Revisão Completa Corolla 2020', 'card'),
-- Pet Shop Feliz
('f-4-1', 'tenant-4', 'income', 'Serviço', 85.00, '2026-06-18', 'Banho Golden Mel - Bernardo', 'pix'),
('f-4-2', 'tenant-4', 'expense', 'Fornecedores', 150.00, '2026-06-11', 'Compra xampus e sabonetes pet', 'money'),
-- SallesFit
('f-5-1', 'tenant-5', 'income', 'Venda Produto', 89.90, '2026-06-18', 'Top Fitness Cropped SallesFit', 'pix')
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- FINANCE PAYABLES
-- --------------------------
INSERT INTO finance_payables (id, tenant_id, title, due_date, amount, status) VALUES
-- Barbearia do Keu
('pay-1', 'tenant-1', 'Fornecedor Gillette S/A', '2026-06-25', 320.00, 'pending'),
('pay-2', 'tenant-1', 'Internet de Alta Velocidade Vivo', '2026-06-22', 140.00, 'pending'),
-- Salão da Julie
('pay-2-1', 'tenant-2', 'Vencimento Aluguel Comercial', '2026-06-28', 1900.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- FINANCE RECEIVABLES
-- --------------------------
INSERT INTO finance_receivables (id, tenant_id, client_name, service_name, amount, due_date, status) VALUES
('rec-1', 'tenant-1', 'Empresa XP Assessoria', 'Cortes em Equipe Convênio', 450.00, '2026-06-28', 'pending')
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- INVENTORY
-- --------------------------
INSERT INTO inventory (id, tenant_id, code, name, category, quantity, min_quantity, supplier, cost_price, sale_price) VALUES
-- Barbearia do Keu
('p-1', 'tenant-1', 'POM-001', 'Pomada Modeladora Matte Knox', 'Cabelo', 2, 5, 'Nox Fornecedores', 15.00, 45.00),
('p-2', 'tenant-1', 'OLE-002', 'Óleo Premium de Sândalo Barber', 'Barba', 12, 3, 'Sândalo S/A', 18.00, 38.00),
('p-3', 'tenant-1', 'SHA-003', 'Shampoo Refrescante de Alecrim & Hortelã', 'Higienização', 1, 4, 'BioNatura', 10.00, 28.00),
-- Salão da Julie
('p-2-1', 'tenant-2', 'ESM-01', 'Esmalte Importado Rosé Chic OPI', 'Unhas', 8, 2, 'Beauty Distribuidora', 20.00, 45.00),
-- Pet Shop Feliz
('p-4-1', 'tenant-4', 'XAM-01', 'Xampu Neutro Sanol Hipoalergenico', 'Estética', 1, 3, 'Sanol Pets Ltda', 8.00, 22.00),
-- SallesFit
('p-5-1', 'tenant-5', 'VES-01', 'Top Fitness Cropped SallesFit', 'Vestuário', 15, 5, 'TexFit Brasil', 35.00, 89.90)
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- MARKETING CAMPAIGNS
-- --------------------------
INSERT INTO marketing_campaigns (id, tenant_id, code, discount, type, title, is_active) VALUES
('camp-1', 'tenant-1', 'PRIMORDIAL15', 15.00, 'percent', 'Campanha de Inauguração - 15% Desconto', TRUE),
('camp-2', 'tenant-1', 'DIADOSNAMORADOS', 10.00, 'value', 'Sexta Especial - R$ 10 de desconto nos Combos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- REVIEWS
-- --------------------------
INSERT INTO reviews (id, tenant_id, author, rating, comment, date, approved) VALUES
-- Barbearia do Keu
('rev-1', 'tenant-1', 'Carlos Silveira', 5, 'O Keu é simplesmente o melhor barbeiro da capital. A toalha quente é sensacional!', '2026-06-15', TRUE),
('rev-2', 'tenant-1', 'Pedro Ramos', 4, 'Excelente atendimento, lugar muito estiloso e boa música. Um pouco difícil achar vaga na rua paulista perto.', '2026-06-17', TRUE),
('rev-3', 'tenant-1', 'Joaquim Costa', 5, 'Excelente navalha, tudo limpo, descartável. Com certeza voltarei sempre.', '2026-06-19', FALSE),
-- Salão da Julie
('rev-2-1', 'tenant-2', 'Fernanda Toledo', 5, 'Salão aconchegante, café incrível e os melhores produtos! Julie é um amor.', '2026-06-18', TRUE),
-- Oficina do Carlos
('rev-3-1', 'tenant-3', 'Márcio Antunes', 5, 'Mecânico extremamente honesto. Relatou o problema e consertou rapidamente. Recomendo muito!', '2026-06-14', TRUE),
-- Pet Shop Feliz
('rev-4-1', 'tenant-4', 'Camila Ortiz', 5, 'Tratam a Mel com o maior amor do mundo. Volto de olhos fechados!', '2026-06-12', TRUE),
-- SallesFit
('rev-5-1', 'tenant-5', 'Fernanda Lima', 5, 'O top cropped veste perfeitamente bem! Tecido muito confortável e que realmente te dá excelente suporte nos exercícios.', '2026-06-20', TRUE)
ON CONFLICT (id) DO NOTHING;

-- --------------------------
-- PRODUCTS TO SELL
-- --------------------------
INSERT INTO products_to_sell (id, tenant_id, name, description, price, image_url) VALUES
-- Barbearia do Keu
('prod-1-1', 'tenant-1', 'Pomada Modeladora Dry Matte Extreme 150g', 'Fixação forte o dia inteiro com acabamento totalmente seco e fosco. Ideal para penteados clássicos e modernos.', 45.00, 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=150&auto=format&fit=crop&q=60'),
('prod-1-2', 'tenant-1', 'Óleo de Barba Premium Sândalo Imperial 30ml', 'Hidratação profunda para fios da barba ressecada, aroma marcante de madeiras nobres e toque seco.', 35.00, 'https://images.unsplash.com/photo-1626015829430-79b97c39be26?w=150&auto=format&fit=crop&q=60'),
-- Salão da Julie
('prod-2-1', 'tenant-2', 'Shampoo Reconstrutor Absolut Repair L''Oréal 300ml', 'Reparação e restauração instantânea dos cabelos mais danificados ou quimicamente tratados de salão.', 120.00, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=150&auto=format&fit=crop&q=60'),
('prod-2-2', 'tenant-2', 'Sérum Nutritivo Antifrizz Blond Absolu Kérastase 50ml', 'Brilho espetacular com redução de frizz imediata e hidratação profunda sem pesar os fios.', 180.00, 'https://images.unsplash.com/photo-1620052581638-512f375e5f5a?w=150&auto=format&fit=crop&q=60'),
-- SallesFit
('prod-5-1', 'tenant-5', 'Top Fitness Cropped SallesFit', 'Conforto supremo e alta sustentação para seus treinos intensos. Tecido premium dry-fit em poliamida com elastano.', 89.90, 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=60'),
('prod-5-2', 'tenant-5', 'Shorts Tactel Sport Premium', 'Shorts com tecnologia de secagem ultra rápida, ajuste de cordão de algodão e bolsos laterais invisíveis funcionais.', 69.90, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=150&auto=format&fit=crop&q=60'),
('prod-5-3', 'tenant-5', 'Garrafa Térmica SallesFit Inox', 'Isolamento a vácuo com tampa antivazamento e bico anatômico. Mantém sua bebida bem gelada por 24 horas.', 119.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=150&auto=format&fit=crop&q=60')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Verifique os dados inseridos com:
-- SELECT * FROM tenants;
-- SELECT COUNT(*) FROM services;
-- SELECT COUNT(*) FROM crm_clients;
-- SELECT COUNT(*) FROM bookings;
-- SELECT COUNT(*) FROM finance_entries;
-- SELECT COUNT(*) FROM inventory;
-- SELECT COUNT(*) FROM reviews;
-- ============================================================
