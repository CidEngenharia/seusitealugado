/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Tenant } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================================
// Supabase Client (service_role — acesso total no backend)
// ============================================================
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("[SiteAlugado] ⚠️  VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env.local");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// ============================================================
// Helpers: Mapeamento DB (snake_case) → TypeScript (camelCase)
// ============================================================

function mapService(s: any) {
  return {
    id: s.id,
    name: s.name,
    description: s.description || "",
    price: Number(s.price),
    duration: s.duration || 0,
    imageUrl: s.image_url || "",
  };
}

function mapCrmClient(c: any) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || "",
    email: c.email || "",
    cpf: c.cpf,
    birthday: c.birthday,
    notes: c.notes,
    pipelineStage: c.pipeline_stage || "lead",
    points: c.points || 0,
    cashback: Number(c.cashback) || 0,
    createdAt: c.created_at || new Date().toISOString(),
  };
}

function mapBooking(b: any) {
  return {
    id: b.id,
    clientName: b.client_name,
    clientPhone: b.client_phone || "",
    clientEmail: b.client_email || "",
    serviceId: b.service_id || "",
    dateTime: b.date_time,
    status: b.status || "pending",
    notes: b.notes,
  };
}

function mapFinanceEntry(f: any) {
  return {
    id: f.id,
    type: f.type,
    category: f.category || "",
    amount: Number(f.amount),
    date: f.date,
    description: f.description || "",
    paymentMethod: f.payment_method || "pix",
  };
}

function mapPayable(p: any) {
  return {
    id: p.id,
    title: p.title,
    dueDate: p.due_date,
    amount: Number(p.amount),
    status: p.status || "pending",
  };
}

function mapReceivable(r: any) {
  return {
    id: r.id,
    clientName: r.client_name,
    serviceName: r.service_name || "",
    amount: Number(r.amount),
    dueDate: r.due_date,
    status: r.status || "pending",
  };
}

function mapInventoryItem(i: any) {
  return {
    id: i.id,
    code: i.code || "",
    name: i.name,
    category: i.category || "",
    quantity: i.quantity || 0,
    minQuantity: i.min_quantity || 0,
    supplier: i.supplier || "",
    costPrice: Number(i.cost_price) || 0,
    salePrice: Number(i.sale_price) || 0,
  };
}

function mapCampaign(c: any) {
  return {
    id: c.id,
    code: c.code,
    discount: Number(c.discount),
    type: c.type || "percent",
    title: c.title || "",
    isActive: c.is_active || false,
  };
}

function mapReview(r: any) {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    comment: r.comment || "",
    date: r.date,
    approved: r.approved || false,
  };
}

function mapProductToSell(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price),
    imageUrl: p.image_url || "",
  };
}

function assembleTenant(
  t: any,
  services: any[],
  crmClients: any[],
  bookings: any[],
  financeEntries: any[],
  payables: any[],
  receivables: any[],
  inventory: any[],
  campaigns: any[],
  reviews: any[],
  productsToSell: any[]
): Tenant {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    ownerName: t.owner_name,
    ownerEmail: t.owner_email,
    logoUrl: t.logo_url || "",
    bannerUrl: t.banner_url || "",
    themeColor: t.theme_color || "amber",
    themeMode: t.theme_mode || "dark",
    fontFamily: t.font_family || "sans",
    template: t.template || "modern",
    description: t.description || "",
    address: t.address || "",
    openingHours: t.opening_hours || "",
    socials: t.socials || {},
    mapLocation: t.map_location || "",
    fidelityProgram: t.fidelity_program || { type: "points", rate: 1, rule: "" },
    plan: t.plan || "basic",
    status: t.status || "active",
    createdAt: t.created_at || new Date().toISOString(),
    planExpiration: t.plan_expiration || new Date().toISOString(),
    services: services.map(mapService),
    crmClients: crmClients.map(mapCrmClient),
    bookings: bookings.map(mapBooking),
    finance: {
      entries: financeEntries.map(mapFinanceEntry),
      payables: payables.map(mapPayable),
      receivables: receivables.map(mapReceivable),
    },
    inventory: inventory.map(mapInventoryItem),
    marketingCampaigns: campaigns.map(mapCampaign),
    reviews: reviews.map(mapReview),
    productsToSell: productsToSell.map(mapProductToSell),
  };
}

// Busca todos os dados relacionados de um tenant e monta o objeto completo
async function fetchFullTenant(tenantRow: any): Promise<Tenant> {
  const id = tenantRow.id;

  const [
    { data: services },
    { data: crmClients },
    { data: bookings },
    { data: financeEntries },
    { data: payables },
    { data: receivables },
    { data: inventory },
    { data: campaigns },
    { data: reviews },
    { data: productsToSell },
  ] = await Promise.all([
    supabase.from("services").select("*").eq("tenant_id", id).order("created_at"),
    supabase.from("crm_clients").select("*").eq("tenant_id", id).order("created_at"),
    supabase.from("bookings").select("*").eq("tenant_id", id).order("date_time"),
    supabase.from("finance_entries").select("*").eq("tenant_id", id).order("date", { ascending: false }),
    supabase.from("finance_payables").select("*").eq("tenant_id", id).order("due_date"),
    supabase.from("finance_receivables").select("*").eq("tenant_id", id).order("due_date"),
    supabase.from("inventory").select("*").eq("tenant_id", id).order("name"),
    supabase.from("marketing_campaigns").select("*").eq("tenant_id", id).order("created_at"),
    supabase.from("reviews").select("*").eq("tenant_id", id).order("date", { ascending: false }),
    supabase.from("products_to_sell").select("*").eq("tenant_id", id).order("created_at"),
  ]);

  return assembleTenant(
    tenantRow,
    services || [],
    crmClients || [],
    bookings || [],
    financeEntries || [],
    payables || [],
    receivables || [],
    inventory || [],
    campaigns || [],
    reviews || [],
    productsToSell || []
  );
}

// ============================================================
// Salvar tenant completo no Supabase (upsert + sync de tabelas)
// ============================================================
async function saveTenantToSupabase(updatedTenant: Tenant): Promise<void> {
  const tenantId = updatedTenant.id;

  // 1. Upsert da linha principal do tenant
  const { error: tenantError } = await supabase.from("tenants").upsert({
    id: tenantId,
    slug: updatedTenant.slug,
    name: updatedTenant.name,
    owner_name: updatedTenant.ownerName,
    owner_email: updatedTenant.ownerEmail,
    logo_url: updatedTenant.logoUrl,
    banner_url: updatedTenant.bannerUrl,
    theme_color: updatedTenant.themeColor,
    theme_mode: updatedTenant.themeMode,
    font_family: updatedTenant.fontFamily,
    template: updatedTenant.template,
    description: updatedTenant.description,
    address: updatedTenant.address,
    opening_hours: updatedTenant.openingHours,
    socials: updatedTenant.socials,
    map_location: updatedTenant.mapLocation,
    fidelity_program: updatedTenant.fidelityProgram,
    plan: updatedTenant.plan,
    status: updatedTenant.status,
    plan_expiration: updatedTenant.planExpiration,
  }, { onConflict: "id" });

  if (tenantError) throw tenantError;

  // 2. Deletar registros antigos de todas as tabelas relacionadas
  await Promise.all([
    supabase.from("services").delete().eq("tenant_id", tenantId),
    supabase.from("crm_clients").delete().eq("tenant_id", tenantId),
    supabase.from("bookings").delete().eq("tenant_id", tenantId),
    supabase.from("finance_entries").delete().eq("tenant_id", tenantId),
    supabase.from("finance_payables").delete().eq("tenant_id", tenantId),
    supabase.from("finance_receivables").delete().eq("tenant_id", tenantId),
    supabase.from("inventory").delete().eq("tenant_id", tenantId),
    supabase.from("marketing_campaigns").delete().eq("tenant_id", tenantId),
    supabase.from("reviews").delete().eq("tenant_id", tenantId),
    supabase.from("products_to_sell").delete().eq("tenant_id", tenantId),
  ]);

  // 3. Reinserir com dados atualizados
  const insertOps: PromiseLike<any>[] = [];

  if (updatedTenant.services?.length) {
    insertOps.push(supabase.from("services").insert(
      updatedTenant.services.map(s => ({
        id: s.id, tenant_id: tenantId, name: s.name,
        description: s.description, price: s.price,
        duration: s.duration, image_url: s.imageUrl,
      }))
    ));
  }

  if (updatedTenant.crmClients?.length) {
    insertOps.push(supabase.from("crm_clients").insert(
      updatedTenant.crmClients.map(c => ({
        id: c.id, tenant_id: tenantId, name: c.name,
        phone: c.phone, email: c.email, cpf: c.cpf || null,
        birthday: c.birthday || null, notes: c.notes || null,
        pipeline_stage: c.pipelineStage, points: c.points,
        cashback: c.cashback, created_at: c.createdAt,
      }))
    ));
  }

  if (updatedTenant.bookings?.length) {
    insertOps.push(supabase.from("bookings").insert(
      updatedTenant.bookings.map(b => ({
        id: b.id, tenant_id: tenantId, client_name: b.clientName,
        client_phone: b.clientPhone, client_email: b.clientEmail,
        service_id: b.serviceId || null, date_time: b.dateTime,
        status: b.status, notes: b.notes || null,
      }))
    ));
  }

  if (updatedTenant.finance?.entries?.length) {
    insertOps.push(supabase.from("finance_entries").insert(
      updatedTenant.finance.entries.map(f => ({
        id: f.id, tenant_id: tenantId, type: f.type,
        category: f.category, amount: f.amount,
        date: f.date, description: f.description,
        payment_method: f.paymentMethod,
      }))
    ));
  }

  if (updatedTenant.finance?.payables?.length) {
    insertOps.push(supabase.from("finance_payables").insert(
      updatedTenant.finance.payables.map(p => ({
        id: p.id, tenant_id: tenantId, title: p.title,
        due_date: p.dueDate, amount: p.amount, status: p.status,
      }))
    ));
  }

  if (updatedTenant.finance?.receivables?.length) {
    insertOps.push(supabase.from("finance_receivables").insert(
      updatedTenant.finance.receivables.map(r => ({
        id: r.id, tenant_id: tenantId, client_name: r.clientName,
        service_name: r.serviceName, amount: r.amount,
        due_date: r.dueDate, status: r.status,
      }))
    ));
  }

  if (updatedTenant.inventory?.length) {
    insertOps.push(supabase.from("inventory").insert(
      updatedTenant.inventory.map(i => ({
        id: i.id, tenant_id: tenantId, code: i.code,
        name: i.name, category: i.category,
        quantity: i.quantity, min_quantity: i.minQuantity,
        supplier: i.supplier, cost_price: i.costPrice,
        sale_price: i.salePrice,
      }))
    ));
  }

  if (updatedTenant.marketingCampaigns?.length) {
    insertOps.push(supabase.from("marketing_campaigns").insert(
      updatedTenant.marketingCampaigns.map(c => ({
        id: c.id, tenant_id: tenantId, code: c.code,
        discount: c.discount, type: c.type,
        title: c.title, is_active: c.isActive,
      }))
    ));
  }

  if (updatedTenant.reviews?.length) {
    insertOps.push(supabase.from("reviews").insert(
      updatedTenant.reviews.map(r => ({
        id: r.id, tenant_id: tenantId, author: r.author,
        rating: r.rating, comment: r.comment,
        date: r.date, approved: r.approved,
      }))
    ));
  }

  if (updatedTenant.productsToSell?.length) {
    insertOps.push(supabase.from("products_to_sell").insert(
      updatedTenant.productsToSell.map(p => ({
        id: p.id, tenant_id: tenantId, name: p.name,
        description: p.description, price: p.price,
        image_url: p.imageUrl,
      }))
    ));
  }

  await Promise.all(insertOps);
}

// ============================================================
// REST Endpoints
// ============================================================

// GET /api/tenants — lista todos os tenants com dados completos
app.get("/api/tenants", async (req, res) => {
  try {
    const { data: tenantRows, error } = await supabase
      .from("tenants").select("*").order("created_at");
    if (error) throw error;

    const tenants = await Promise.all((tenantRows || []).map(fetchFullTenant));
    res.json(tenants);
  } catch (err: any) {
    console.error("Erro ao listar tenants:", err);
    res.status(500).json({ error: "Erro ao buscar tenants", details: err.message });
  }
});

// GET /api/tenants/:slug — busca um tenant pelo slug
app.get("/api/tenants/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase
      .from("tenants").select("*").ilike("slug", slug).single();

    if (error || !tenantRow) {
      res.status(404).json({ error: "Tenant não encontrado" });
      return;
    }

    const tenant = await fetchFullTenant(tenantRow);
    res.json(tenant);
  } catch (err: any) {
    console.error("Erro ao buscar tenant:", err);
    res.status(500).json({ error: "Erro ao buscar tenant", details: err.message });
  }
});

// GET /api/check-slug/:slug — verifica se um slug está disponível para uso
app.get("/api/check-slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().replace(/[^a-z0-9\-]/g, "");
    if (!slug || slug.length < 3) {
      res.json({ available: false, reason: "Slug deve ter pelo menos 3 caracteres" });
      return;
    }
    const { data: tenantRow } = await supabase
      .from("tenants").select("id").ilike("slug", slug).maybeSingle();
    res.json({ available: !tenantRow, slug });
  } catch (err: any) {
    res.status(500).json({ available: false, reason: err.message });
  }
});

// POST /api/tenants — cria ou atualiza um tenant completo
app.post("/api/tenants", async (req, res) => {
  const updatedTenant: Tenant = req.body;

  if (!updatedTenant.slug) {
    res.status(400).json({ error: "Slug é obrigatório" });
    return;
  }

  try {
    await saveTenantToSupabase(updatedTenant);
    res.json({ success: true, tenant: updatedTenant });
  } catch (err: any) {
    console.error("Erro ao salvar tenant:", err);
    res.status(500).json({ error: "Erro ao salvar tenant", details: err.message });
  }
});

// POST /api/tenants/:slug/bookings — cria agendamento e auto-adiciona cliente ao CRM
app.post("/api/tenants/:slug/bookings", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase
      .from("tenants").select("id").ilike("slug", slug).single();

    if (error || !tenantRow) {
      res.status(404).json({ error: "Tenant não encontrado" });
      return;
    }

    const newBooking = req.body;
    const tenantId = tenantRow.id;

    // Inserir agendamento
    const { error: bookingError } = await supabase.from("bookings").insert({
      id: newBooking.id || ("b-" + Date.now()),
      tenant_id: tenantId,
      client_name: newBooking.clientName,
      client_phone: newBooking.clientPhone,
      client_email: newBooking.clientEmail,
      service_id: newBooking.serviceId || null,
      date_time: newBooking.dateTime,
      status: newBooking.status || "pending",
      notes: newBooking.notes || null,
    });

    if (bookingError) throw bookingError;

    // Auto-adicionar ao CRM se ainda não existe
    const { data: existingClients } = await supabase
      .from("crm_clients")
      .select("id")
      .eq("tenant_id", tenantId)
      .or(`phone.eq.${newBooking.clientPhone},email.eq.${newBooking.clientEmail}`)
      .limit(1);

    if (!existingClients || existingClients.length === 0) {
      const { data: serviceRow } = await supabase
        .from("services").select("name, price")
        .eq("id", newBooking.serviceId).single();

      const serviceName = serviceRow?.name || "Serviço";
      const servicePrice = Number(serviceRow?.price) || 0;

      await supabase.from("crm_clients").insert({
        id: "cli-" + Date.now(),
        tenant_id: tenantId,
        name: newBooking.clientName,
        phone: newBooking.clientPhone,
        email: newBooking.clientEmail,
        pipeline_stage: "lead",
        notes: `Registrado automaticamente via agendamento para o serviço ${serviceName}.`,
        points: Math.floor(servicePrice),
        cashback: Math.floor(servicePrice * 0.05),
      });
    }

    res.json({ success: true, booking: newBooking });
  } catch (err: any) {
    console.error("Erro ao criar agendamento:", err);
    res.status(500).json({ error: "Erro ao criar agendamento", details: err.message });
  }
});

// POST /api/tenants/:slug/reviews — adiciona avaliação
app.post("/api/tenants/:slug/reviews", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase
      .from("tenants").select("id").ilike("slug", slug).single();

    if (error || !tenantRow) {
      res.status(404).json({ error: "Tenant não encontrado" });
      return;
    }

    const newReview = req.body;
    const { error: reviewError } = await supabase.from("reviews").insert({
      id: newReview.id || ("rev-" + Date.now()),
      tenant_id: tenantRow.id,
      author: newReview.author,
      rating: newReview.rating,
      comment: newReview.comment || "",
      date: newReview.date || new Date().toISOString().split("T")[0],
      approved: newReview.approved || false,
    });

    if (reviewError) throw reviewError;

    res.json({ success: true, review: newReview });
  } catch (err: any) {
    console.error("Erro ao adicionar avaliação:", err);
    res.status(500).json({ error: "Erro ao adicionar avaliação", details: err.message });
  }
});

// POST /api/super/status — ações do Super Admin (status, plano, exclusão)
app.post("/api/super/status", async (req, res) => {
  try {
    const { tenantId, status, plan, planExpiration, deleteTenant } = req.body;

    if (deleteTenant) {
      // CASCADE no banco deleta tudo automaticamente
      const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
      if (error) throw error;
      res.json({ success: true, deleted: true });
      return;
    }

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;
    if (planExpiration) updates.plan_expiration = planExpiration;

    const { data: t, error } = await supabase
      .from("tenants").update(updates).eq("id", tenantId).select().single();

    if (error || !t) {
      res.status(404).json({ error: "Tenant não encontrado" });
      return;
    }

    res.json({ success: true, tenant: t });
  } catch (err: any) {
    console.error("Erro na ação super admin:", err);
    res.status(500).json({ error: "Erro na ação administrativa", details: err.message });
  }
});

// ============================================================
// Endpoint do Assistente de IA com Gemini
// ============================================================
app.post("/api/gemini/assist", async (req, res) => {
  const { prompt, tenantState, taskType } = req.body;

  // Verificar se KEY está presente
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    const placeholderMsg = getLocalAIFallback(taskType, tenantState, prompt);
    res.json({ text: placeholderMsg });
    return;
  }

  try {
    const genAI = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });

    const tenantBrief = `
      Empresa: ${tenantState.name}
      Ramo/Descrição: ${tenantState.description}
      Plano Atual: ${tenantState.plan}
      Faturamento Recente: R$ ${tenantState.finance.entries.reduce((acc: number, cur: any) => cur.type === "income" ? acc + cur.amount : acc, 0)}
      Despesas Recentes: R$ ${tenantState.finance.entries.reduce((acc: number, cur: any) => cur.type === "expense" ? acc + cur.amount : acc, 0)}
      Clientes Cadastrados: ${tenantState.crmClients.length}
      Produtos em Baixo Estoque: ${tenantState.inventory.filter((p: any) => p.quantity <= p.minQuantity).map((p: any) => p.name).join(", ") || "Nenhum"}
      Serviços Oferecidos: ${tenantState.services.map((s: any) => `${s.name} (R$${s.price})`).join(", ")}
    `;

    const systemInstruction = `
      Você é o "Parceiro IA SiteAlugado", um conselheiro empresarial inteligente, prático e ágil para pequenos negócios em português brasileiro.
      Sua missão é impulsionar os resultados de faturamento e engajamento da empresa analisada.
      Trate o lojista de forma motivadora, humana e direta, sem formalidades maçantes. Prefira respostas ricas formatadas em Markdown com títulos limpos, listas e ideias em tópicos fáceis de copiar.

      Instruções para os tipos de tarefas:
      - 'summary': Resuma o estado do negócio atual, calcule o lucro líquido, o ticket médio, elogie os pontos fortes e aponte críticas de forma construtiva (ex: estoque com problemas, clientes inativos).
      - 'promo': Sugira 2-3 campanhas promocionais com cupons específicos utilizando o plano de fidelidade do cliente (${tenantState.fidelityProgram.type}), de forma que engaje o cliente sem quebrar as margens financeiras.
      - 'reactivate': Identifique clientes inativos do CRM e crie mensagens de reengajamento persuasivas, prontas para o dono copiar e colar no WhatsApp.
      - 'instagram': Crie 2 excelentes conceitos de postagens com textos persuasivos, hashtags sugeridas e descrições visuais para o Instagram promovendo serviços ou promoções deste mês.
      - 'forecast': Faça previsões matemáticas simples de faturamento com base no fluxo de caixa e de clientes cadastrados, com recomendações para atingir as metas.
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Análise solicitada: Tipo "${taskType}".
      Estado do Negócio:
      ${tenantBrief}
      
      Mensagem/Pergunta Adicional do Lojista: "${prompt || "Gere o relatório correspondente de forma automatizada"}"`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    res.status(500).json({ error: "Erro ao consultar o assistente de IA.", details: error.message });
  }
});

// ============================================================
// Fallback local quando a chave do Gemini não está configurada
// ============================================================
function getLocalAIFallback(taskType: string, tenant: Tenant, customPrompt: string): string {
  const sumIncomes = tenant.finance.entries.reduce((acc, cur) => cur.type === "income" ? acc + cur.amount : acc, 0);
  const sumExpenses = tenant.finance.entries.reduce((acc, cur) => cur.type === "expense" ? acc + cur.amount : acc, 0);
  const balance = sumIncomes - sumExpenses;
  const alertProducts = tenant.inventory.filter((p) => p.quantity <= p.minQuantity);
  const inactiveClients = tenant.crmClients.filter(c => c.pipelineStage === "inactive");

  if (taskType === "summary") {
    return `### 📊 Relatório Inteligente Local - ${tenant.name}

> 💡 **Nota do Sistema**: Adicione sua chave **GEMINI_API_KEY** nas configurações de Segredos para desbloquear o assistente cognitivo real! Exibindo análise analítica baseada no caixa instantâneo.

#### 1. Diagnóstico Geral
* **Faturamento Bruto**: R$ ${sumIncomes.toFixed(2)}
* **Despesas Operacionais**: R$ ${sumExpenses.toFixed(2)}
* **Lucro Líquido**: R$ ${balance.toFixed(2)} (${balance >= 0 ? "Saldo Positivo" : "Atenção: Margem Apertada"})
* **Clientes Ativos**: ${tenant.crmClients.filter(c => c.pipelineStage === "active").length} de ${tenant.crmClients.length} totais.

#### 2. Principais Alertas
${alertProducts.length > 0 ? `* ⚠️ **Reposição Necessária**: Os produtos **${alertProducts.map(p => p.name).join(", ")}** estão abaixo do limite mínimo de estoque (${alertProducts.map(p => `${p.quantity}/${p.minQuantity}`).join(", ")} unidades).` : `* ✅ **Estoque Controlado**: Todos os produtos estão com níveis aceitáveis.`}
${inactiveClients.length > 0 ? `* 👥 **Clientes Sumidos**: Temos **${inactiveClients.length}** clientes sinalizados como inativos no funil de CRM. Recomendamos disparar uma promoção de reativação imediatamente.` : `* 🎉 **Retenção Perfeita**: Nenhum cliente em status inativo no seu CRM!`}

---
*Dica: Quer criar posts e gerar templates de cupons sob medida? Configure a chave da API do Gemini para gerar textos de vendas de excelente conversão.*`;
  }

  if (taskType === "promo") {
    return `### 🏷️ Sugestão de Campanhas de Marketing (${tenant.name})

*Utilizando seu modelo de fidelidade: **${tenant.fidelityProgram.type === "cashback" ? "Cashback de " + tenant.fidelityProgram.rate + "%" : "Pontos de Fidelidade"}***

#### Campanha 1: Retorno Garantido
* **Cupom**: \`VOLTAJA\`
* **Desconto**: 10% OFF em qualquer serviço pré-agendado no site nesta semana.
* **Gatilho Mental**: Escassez e exclusividade. "Nós sentimos sua falta! Use o cupom para cuidar de você com desconto."

#### Campanha 2: Indique e Ganhe
* **Ação**: Ao convidar um amigo que agendar no site, o cliente original acumula **R$ 15 em bônus** ou **150 pontos** diretamente no CRM.
* **Canal Recomendado**: Enviar link curto do site pelo WhatsApp.`;
  }

  if (taskType === "reactivate") {
    const listInactives = inactiveClients.length > 0 ? inactiveClients : [{ name: "Cliente VIP", phone: "(11) 99999-9999" }];
    const clientName = listInactives[0].name;
    return `### 💬 Mensagens de Reativação de Clientes (WhatsApp)

Encontramos **${inactiveClients.length || 1}** clientes com pouca frequência recente. Copie e personalize a proposta abaixo para enviar diretamente:

---

**Opção 1 - Foco em Novidade e Miminho (Alta Conversão):**
"Olá, *${clientName}*! Tudo bem? Faz um tempinho que você não vem nos visitar no *${tenant.name}*. 😢
Queremos te propor um momento de autocuidado especial esta semana! Agendando hoje no link abaixo, a gente te garante um **bônus exclusivo de boas-vindas** ou desconto na finalização.
Agende em 20 segundos: ${process.env.APP_URL || "sitealugado.com"}/${tenant.slug}
Estamos te esperando com um cafezinho fresco!"

---

**Opção 2 - Lembrança rápida de rotina:**
"Oi, *${clientName}*, percebi que seu último atendimento no *${tenant.name}* completou algumas semanas. Vamos renovar o visual para o final de semana? ✂️💅
Reserve seu melhor horário online e evite filas: ${process.env.APP_URL || "sitealugado.com"}/${tenant.slug}"`;
  }

  if (taskType === "instagram") {
    return `### 📸 Copys de Posts para Instagram - ${tenant.name}

#### Post 1: Carrossel de Bastidores (Foco em Conexão)
* **Visual sugerido**: Foto de alta qualidade de você realizando um serviço premium (${tenant.services[0]?.name || "Serviço"}).
* **Legenda**:
  "Mais do que um simples atendimento, criamos uma experiência completa de autocuidado aqui no **${tenant.name}**. ✨
  Cada detalhe foi planejado para você se desligar da correria do dia a dia e renovar suas energias.
  Venha conhecer nosso endereço: *${tenant.address}*!
  🗓️ Escolha o melhor dia e consulte os horários livres clicando no link do nosso perfil!"
* **Hashtags**: #${tenant.slug} #autocuidado #bemestar #saopaulo #${tenant.services[0]?.name.toLowerCase().replace(/\s+/g, "")}

---

#### Post 2: Promoção da Semana
* **Visual sugerido**: Arte limpa com cores de contraste da sua identidade (**${tenant.themeColor}**).
* **Legenda**:
  "Quem não ama começar a semana com a autoestima lá em cima? 💖
  Garanta sua vaga para os serviços mais desejados na agenda do nosso mini site oficial!
  🔗 Acesse o link da bio, veja nosso catálogo detalhado de serviços com preços e agende com confirmação automática sem precisar trocar mensagens."`;
  }

  if (taskType === "forecast") {
    return `### 🔮 Previsão de Faturamento & Metas

*Estimativa baseada nos seus dados operacionais locais:*

#### 📈 Projeção para o Próximo Mês
* **Crescimento Esperado**: **+15%** baseado nos agendamentos recorrentes.
* **Faturamento Estimado**: 
  - Cenário Conservador: **R$ ${(sumIncomes * 0.95).toFixed(2)}**
  - Cenário Otimista: **R$ ${(sumIncomes * 1.35).toFixed(2)}**

#### 🎯 Plano de Ação Recomendado
1. **Promoção de Meio de Semana**: Terças e quartas costumam ter menos movimento. Ofereça 5% a mais de fidelidade para reservas nestes dias.
2. **Combos Estratégicos**: Crie um serviço do tipo "Combo Premium" unindo dois serviços em um para aumentar o ticket médio geral.`;
  }

  return `Análise para: ${customPrompt || "sem prompt"}`;
}

// ============================================================
// Inicialização do servidor (dev com Vite / prod com build)
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Desenvolvimento ativo: Vite middleware montado.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Produção ativa: Servindo arquivos estáticos em /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SiteAlugado] ✅ Servidor rodando na porta ${PORT} — Banco: Supabase`);
  });
}

startServer();
