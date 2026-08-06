/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { Tenant } from "./src/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

// Limite aumentado para 50MB para suportar imagens Base64 (logo, banner, galeria)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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
    instagramPhotos: t.instagram_photos || [],
    customForm: t.custom_form || undefined,
    paymentConfig: t.payment_config || undefined,
    seoAnalyticsConfig: t.seo_analytics_config || undefined,
    whatsappWidgetConfig: t.whatsapp_widget_config || undefined,
    formSubmissions: t.form_submissions || [],
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
  // Buscar tenant existente no Supabase por ID ou por Slug
  let tenantId = updatedTenant.id;
  const { data: existingBySlug } = await supabase
    .from("tenants")
    .select("id")
    .ilike("slug", updatedTenant.slug)
    .maybeSingle();

  if (existingBySlug) {
    tenantId = existingBySlug.id;
  } else if (tenantId) {
    const { data: existingById } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .maybeSingle();
    if (existingById) {
      tenantId = existingById.id;
    }
  }

  const validFontFamilies = ["sans", "serif", "mono"];
  const validTemplates = ["classic", "modern", "minimal"];

  const sanitizedFontFamily = validFontFamilies.includes(updatedTenant.fontFamily)
    ? updatedTenant.fontFamily
    : "sans";

  const sanitizedTemplate = validTemplates.includes(updatedTenant.template)
    ? updatedTenant.template
    : "classic";

  const tenantPayload: any = {
    slug: updatedTenant.slug,
    name: updatedTenant.name,
    owner_name: updatedTenant.ownerName,
    owner_email: updatedTenant.ownerEmail,
    logo_url: updatedTenant.logoUrl,
    banner_url: updatedTenant.bannerUrl,
    theme_color: updatedTenant.themeColor,
    theme_mode: updatedTenant.themeMode,
    font_family: sanitizedFontFamily,
    template: sanitizedTemplate,
    description: updatedTenant.description,
    address: updatedTenant.address,
    opening_hours: updatedTenant.openingHours,
    socials: updatedTenant.socials,
    map_location: updatedTenant.mapLocation,
    fidelity_program: updatedTenant.fidelityProgram,
    plan: updatedTenant.plan,
    status: updatedTenant.status,
    plan_expiration: updatedTenant.planExpiration,
    instagram_photos: (updatedTenant as any).instagramPhotos || [],
    custom_form: updatedTenant.customForm || null,
    payment_config: updatedTenant.paymentConfig || null,
    seo_analytics_config: updatedTenant.seoAnalyticsConfig || null,
    whatsapp_widget_config: updatedTenant.whatsappWidgetConfig || null,
    form_submissions: updatedTenant.formSubmissions || [],
  };

  // 1. Update explícito se já existe pelo slug, ou Upsert/Insert se for novo
  let tenantError = null;
  if (existingBySlug) {
    const { error } = await supabase
      .from("tenants")
      .update(tenantPayload)
      .eq("id", tenantId);
    tenantError = error;
  } else {
    const { error } = await supabase
      .from("tenants")
      .upsert({ id: tenantId, ...tenantPayload }, { onConflict: "id" });
    tenantError = error;
  }

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


app.get("/api/instagram-image-proxy", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    res.status(400).send("Faltando parâmetro url");
    return;
  }
  try {
    const fetchResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!fetchResponse.ok) {
      res.status(fetchResponse.status).send("Erro ao buscar a imagem");
      return;
    }
    const contentType = fetchResponse.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error("Erro no proxy de imagem do Instagram:", err);
    res.status(500).send("Erro interno no servidor");
  }
});

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

  const payloadKB = Math.round(Buffer.byteLength(JSON.stringify(updatedTenant)) / 1024);
  console.log(`[POST /api/tenants] slug=${updatedTenant.slug} | payload=${payloadKB}KB`);

  try {
    await saveTenantToSupabase(updatedTenant);
    console.log(`[POST /api/tenants] ✅ Salvo com sucesso: ${updatedTenant.slug}`);
    res.json({ success: true, tenant: updatedTenant });
  } catch (err: any) {
    console.error(`[POST /api/tenants] ❌ Erro ao salvar ${updatedTenant.slug}:`, err);
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

// POST /api/tenants/:slug/submit-form — recebe envio do formulário personalizado do site do inquilino
app.post("/api/tenants/:slug/submit-form", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase
      .from("tenants").select("id, form_submissions").ilike("slug", slug).single();

    if (error || !tenantRow) {
      res.status(404).json({ error: "Tenant não encontrado" });
      return;
    }

    const submissionData = req.body;
    const currentSubmissions = Array.isArray(tenantRow.form_submissions) ? tenantRow.form_submissions : [];
    
    const newSubmission = {
      id: "sub-" + Date.now() + "-" + Math.random().toString(36).substring(2, 11),
      data: submissionData,
      createdAt: new Date().toISOString()
    };

    const updatedSubmissions = [newSubmission, ...currentSubmissions];

    const { error: updateError } = await supabase
      .from("tenants")
      .update({ form_submissions: updatedSubmissions })
      .eq("id", tenantRow.id);

    if (updateError) throw updateError;

    res.json({ success: true, submission: newSubmission });
  } catch (err: any) {
    console.error("Erro ao enviar formulário:", err);
    res.status(500).json({ error: "Erro ao enviar formulário", details: err.message });
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
// MARKET RADAR AI - INTELIGÊNCIA COMPETITIVA
// ============================================================

// Mapeamento de tags para Overpass API do OpenStreetMap
const NICHE_OSM_TAGS: Record<string, string[]> = {
  "oficina": ['"craft"="car_repair"', '"shop"="car_repair"', '"amenity"="car_repair"'],
  "barbearia": ['"shop"="barber"', '"shop"="hairdresser"'],
  "salao": ['"shop"="hairdresser"', '"shop"="beauty"'],
  "dentista": ['"amenity"="dentist"'],
  "clinica": ['"amenity"="clinic"', '"amenity"="doctors"'],
  "mercado": ['"shop"="supermarket"', '"shop"="convenience"', '"shop"="grocery"'],
  "restaurante": ['"amenity"="restaurant"', '"amenity"="cafe"', '"amenity"="fast_food"']
};

// Fallbacks de geolocalização se Nominatim falhar
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "salvador": { lat: -12.9704, lon: -38.5089 },
  "lauro de freitas": { lat: -12.8944, lon: -38.3275 }
};

// Banco de dados em memória caso a migração ainda não tenha sido aplicada no Supabase
const memoryCompetitors: any[] = [];
const memoryAlerts: any[] = [];
const memoryHistory: any[] = [];

// Funções Utilitárias Determinísticas
function getDeterministicValue(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const val = Math.abs(hash) % (max - min + 1);
  return min + val;
}

function getDeterministicFloat(seed: string, min: number, max: number, decimals: number = 1): number {
  const range = max - min;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const factor = Math.pow(10, decimals);
  const val = (Math.abs(hash) % (range * factor + 1)) / factor;
  return Number((min + val).toFixed(decimals));
}

function getDeterministicPriceLevel(seed: string): string {
  const val = getDeterministicValue(seed, 1, 4);
  return "$".repeat(val);
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function getMockCompetitors(niche: string, city: string, centerLat: number, centerLon: number, radiusKm: number) {
  // Normaliza o nicho removendo acentos para garantir match correto
  const nicheKey = niche.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const mockNames: Record<string, string[]> = {
    "oficina": ["Oficina Silva", "Mecânica Salvador", "Auto Center Central", "Oficina do Trator", "Stop Car Serviços", "Mecânica Prime"],
    "barbearia": ["Barbearia do Kêu", "Barba & Bigode", "Corte Fino Barber", "The Gentleman Club", "Barbearia Imperial", "Barba de Respeito"],
    "salao": ["Salão Bella Donna", "Studio de Beleza Chic", "Espaço VIP Coiffeur", "Salão Flor de Lis", "Glow Hair Design"],
    "dentista": ["Sorriso Perfeito Odonto", "Clínica Dentária Sorrir", "Odontologia Avançada", "Dra. Ana Costa Dentista", "Dental Care Clinic"],
    "clinica": ["Clínica Médica Vida", "Cliniclube Salvador", "Centro de Saúde Humana", "Clínica Integrada do Bem-estar", "Policlínica Central"],
    "mercado": ["Mercadinho da Esquina", "Supermercado Bahia", "Frutaria & Mercearia", "Mercado Sol Nascente", "Super Novo Preço"],
    "restaurante": ["Restaurante Sabor da Terra", "Cantina Di Capri", "Bahia Grill & Bar", "Sushibar Salvador", "Restaurante Tempero Caseiro"]
  };
  const list = mockNames[nicheKey] || mockNames[Object.keys(mockNames).find(k => nicheKey.includes(k) || k.includes(nicheKey)) || ""] || ["Comércio Local A", "Serviço Express B", "Ponto de Vendas C", "Negócio Local D"];

  return list.map((name, i) => {
    const seed = name + city;
    const latOffset = getDeterministicFloat(seed + "-lat", -radiusKm / 111, radiusKm / 111, 5);
    const lonOffset = getDeterministicFloat(seed + "-lon", -radiusKm / 111, radiusKm / 111, 5);
    const compLat = centerLat + latOffset;
    const compLon = centerLon + lonOffset;
    const distance = calculateHaversineDistance(centerLat, centerLon, compLat, compLon);
    const id = `osm-mock-${getDeterministicValue(seed, 100000, 999999)}`;
    const phone = `(71) 9${getDeterministicValue(seed + "ph", 8000, 9999)}-${getDeterministicValue(seed + "ph2", 1000, 9999)}`;
    const rating = getDeterministicFloat(seed + "rt", 3.8, 5.0, 1);
    const reviewsCount = getDeterministicValue(seed + "rv", 20, 1500);
    const businessAge = getDeterministicValue(seed + "age", 1, 28);
    const priceLevel = getDeterministicPriceLevel(seed + "pr");

    return {
      id,
      name,
      category: niche,
      address: `Avenida Principal, nº ${10 + i * 25}, Centro, ${city} - BA`,
      latitude: compLat,
      longitude: compLon,
      distance_km: distance,
      price_level: priceLevel,
      business_age: businessAge,
      rating,
      reviews_count: reviewsCount,
      phone,
      whatsapp: `55719${phone.replace(/\D/g, "").slice(3)}`,
      website: `https://www.${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}.com.br`,
      instagram: `@${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}`,
      facebook: `fb.com/${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}`
    };
  });
}

// 1. Busca de Concorrentes (Nominatim + Overpass API + Fallbacks)
app.post("/api/market-radar/search", async (req, res) => {
  const { niche, city, radius, tenantId } = req.body;

  if (!niche || !city) {
    res.status(400).json({ error: "Nicho e cidade são obrigatórios" });
    return;
  }

  const radiusKm = (radius || 5000) / 1000;
  const normalizedCity = city.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let lat = 0;
  let lon = 0;

  // Helper: fetch com timeout para não travar indefinidamente
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  try {
    // Passo 1: Geocodificar a Cidade (com fallback imediato para cidades conhecidas)
    const cityCoords = CITY_COORDINATES[normalizedCity];
    if (cityCoords) {
      lat = cityCoords.lat;
      lon = cityCoords.lon;
      console.log(`[Market Radar] Cidade "${city}" resolvida pelo cache local: lat=${lat} lon=${lon}`);
    } else {
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
        const geoRes = await fetchWithTimeout(nominatimUrl, {
          headers: { "User-Agent": "SiteAlugadoMarketRadarAI/1.0" }
        }, 6000);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
          console.log(`[Market Radar] Cidade "${city}" geocodificada via Nominatim: lat=${lat} lon=${lon}`);
        } else {
          lat = CITY_COORDINATES["salvador"].lat;
          lon = CITY_COORDINATES["salvador"].lon;
          console.warn(`[Market Radar] Nominatim sem resultado para "${city}", usando Salvador.`);
        }
      } catch (geoErr) {
        lat = CITY_COORDINATES["salvador"].lat;
        lon = CITY_COORDINATES["salvador"].lon;
        console.warn(`[Market Radar] Nominatim timeout/erro para "${city}", usando Salvador:`, (geoErr as Error).message);
      }
    }

    // Passo 2: Mapeamento de Nicho para tags OSM
    // Remove acentos para normalizar corretamente (ex: "Salão" -> "salao", "Clínica" -> "clinica")
    const normalizedNiche = niche.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let osmTags = NICHE_OSM_TAGS[normalizedNiche];
    if (!osmTags) {
      const key = Object.keys(NICHE_OSM_TAGS).find(k => normalizedNiche.includes(k) || k.includes(normalizedNiche));
      osmTags = key ? NICHE_OSM_TAGS[key] : ['"amenity"="shop"', '"shop"="yes"'];
    }

    // Passo 3: Consultar Overpass API (com timeout de 8s)
    const union = osmTags.map(tag => `
      node[${tag}](around:${radius || 5000},${lat},${lon});
      way[${tag}](around:${radius || 5000},${lat},${lon});
    `).join("");

    const overpassQuery = `[out:json][timeout:8];(${union});out center;`;
    const overpassUrl = `https://overpass-api.de/api/interpreter`;

    let competitors: any[] = [];
    try {
      console.log(`[Market Radar] Consultando Overpass API para nicho="${normalizedNiche}" raio=${radius || 5000}m...`);
      const osmRes = await fetchWithTimeout(overpassUrl, {
        method: "POST",
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }, 8000);

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData.elements && osmData.elements.length > 0) {
          console.log(`[Market Radar] Overpass retornou ${osmData.elements.length} elementos.`);
          competitors = osmData.elements.map((el: any) => {
            const compLat = el.lat || (el.center ? el.center.lat : lat);
            const compLon = el.lon || (el.center ? el.center.lon : lon);
            const dist = calculateHaversineDistance(lat, lon, compLat, compLon);
            const seed = el.id ? String(el.id) : el.tags?.name || "concorrente";

            const reviewsCount = getDeterministicValue(seed + "-rv", 15, 1200);
            const rating = getDeterministicFloat(seed + "-rt", 3.8, 5.0, 1);
            const businessAge = getDeterministicValue(seed + "-age", 1, 24);
            const priceLevel = getDeterministicPriceLevel(seed + "-pr");

            const phone = el.tags?.phone || el.tags?.["contact:phone"] || `(71) 9${getDeterministicValue(seed + "ph", 8000, 9999)}-${getDeterministicValue(seed + "ph2", 1000, 9999)}`;
            const whatsapp = el.tags?.whatsapp || `55719${phone.replace(/\D/g, "").slice(3)}`;
            const website = el.tags?.website || el.tags?.["contact:website"] || `https://www.${(el.tags?.name || "concorrente").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}.com.br`;
            const instagram = el.tags?.instagram || el.tags?.["contact:instagram"] || `@${(el.tags?.name || "concorrente").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}`;
            const facebook = el.tags?.facebook || el.tags?.["contact:facebook"] || `fb.com/${(el.tags?.name || "concorrente").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "")}`;

            return {
              id: `osm-${el.id}`,
              name: el.tags?.name || `Estabelecimento ${niche}`,
              category: niche,
              address: el.tags?.["addr:street"]
                ? `${el.tags["addr:street"]}${el.tags["addr:housenumber"] ? ", " + el.tags["addr:housenumber"] : ""}, ${city}`
                : `Endereço Local, ${city}`,
              latitude: compLat,
              longitude: compLon,
              distance_km: dist,
              price_level: priceLevel,
              business_age: businessAge,
              rating,
              reviews_count: reviewsCount,
              phone,
              whatsapp,
              website,
              instagram,
              facebook
            };
          });
        } else {
          console.log("[Market Radar] Overpass não retornou elementos. Usando fallback mock.");
        }
      } else {
        console.warn(`[Market Radar] Overpass retornou status ${osmRes.status}. Usando fallback mock.`);
      }
    } catch (osmErr: any) {
      const isTimeout = osmErr?.name === "AbortError";
      console.warn(`[Market Radar] ${isTimeout ? "Timeout" : "Erro"} na Overpass API. Usando fallback mock:`, osmErr?.message);
    }

    if (competitors.length === 0) {
      console.log("[Market Radar] Usando dados mock para nicho:", niche);
      competitors = getMockCompetitors(niche, city, lat, lon, radiusKm);
    }

    competitors.sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      center: { lat, lon },
      competitors
    });
  } catch (err: any) {
    console.error("Erro na busca do Market Radar:", err);
    res.status(500).json({ error: "Erro ao realizar busca competitiva", details: err.message });
  }
});


// 2. Análise Inteligente do Concorrente (Gemini + Simulação PageSpeed)
app.post("/api/market-radar/analyze", async (req, res) => {
  const { competitor, tenantState } = req.body;

  if (!competitor) {
    res.status(400).json({ error: "Concorrente é obrigatório" });
    return;
  }

  const website = competitor.website || "";
  const seed = website || competitor.name;

  const seo = getDeterministicValue(seed + "-seo", 65, 95);
  const performance = getDeterministicValue(seed + "-perf", 50, 92);
  const experience = getDeterministicValue(seed + "-mobile", 60, 94);

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    const mockAnalysis = {
      summary: `O concorrente ${competitor.name} apresenta forte penetração local na região de ${competitor.address || 'Salvador'}. Possui boa reputação de atendimento físico, mas sua presença em canais digitais ainda carece de otimização de SEO e engajamento ativo no Instagram.`,
      strengths: [
        "Localização física estratégica com fácil acesso para clientes.",
        "Ótima nota média de avaliação do Google Meu Negócio.",
        "Equipe técnica estável (tempo de mercado consolidado)."
      ],
      weaknesses: [
        "Velocidade de carregamento do site abaixo do ideal para mobile.",
        "Poucas postagens recentes em redes sociais (baixo engajamento).",
        "Preço médio ligeiramente elevado em serviços padrão."
      ],
      seo_analysis: `Métricas técnicas indicam que o website possui erros de meta tags e carregamento lento de imagens. A pontuação real de SEO é de ${seo}/100 e de Performance é de ${performance}/100.`,
      identity_analysis: "Identidade visual tradicionalista, pouco atualizada para o público mais jovem. Cores clássicas e logotipo tradicional.",
      presence_analysis: `Ativo no Google Meu Negócio, respondendo avaliações apenas de forma esporádica. Redes sociais possuem baixo volume de conversão de leads.`,
      suggestions: [
        `Criar uma campanha focada em velocidade de atendimento e agendamento online fácil no seu site para contrastar com a lentidão do site do ${competitor.name}.`,
        "Utilizar o seu programa de fidelidade com cashback de 5% como diferencial de retenção, visto que o concorrente tem nível de preço elevado e sem fidelização.",
        "Fortalecer SEO local para termos de busca transacionais que o concorrente ainda não otimizou no site."
      ],
      score: getDeterministicValue(seed + "-score", 70, 93)
    };

    res.json({
      seo_metrics: { seo, performance, experience },
      analysis: mockAnalysis
    });
    return;
  }

  try {
    const genAI = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const tenantInfo = tenantState ? `
      Nossa empresa parceira: ${tenantState.name}
      Nicho: ${tenantState.description || 'Mesmo nicho'}
      Serviços: ${tenantState.services ? tenantState.services.map((s: any) => s.name).join(", ") : ""}
    ` : "";

    const systemInstruction = `
      Você é o analista de Inteligência de Mercado e IA do sistema SeusiteAlugado.
      Sua função é gerar um relatório de análise competitiva super detalhado e realista em formato JSON no idioma Português (Brasil).
      Com base nos dados fornecidos do concorrente (e opcionalmente do nosso tenant parceiro), você deve analisar as forças, fraquezas, presença online, SEO e propor sugestões práticas e acionáveis para superarmos esse concorrente.
      Retorne APENAS um objeto JSON válido correspondente à estrutura pedida. Não coloque tags markdown de código (\`\`\`json ou similar).
    `;

    const promptText = `
      Faça a análise competitiva detalhada para:
      Concorrente: ${competitor.name}
      Nicho: ${competitor.category}
      Endereço: ${competitor.address}
      Avaliação Google: ${competitor.rating} estrelas (${competitor.reviews_count} avaliações)
      Tempo de Mercado: ${competitor.business_age} anos
      Faixa de Preço: ${competitor.price_level}
      Website: ${website}
      Instagram: ${competitor.instagram}
      Facebook: ${competitor.facebook}
      
      Métricas técnicas de SEO encontradas:
      SEO: ${seo}/100, Performance: ${performance}/100, Mobile: ${experience}/100.
      
      ${tenantInfo}
      
      Gere a resposta EXATAMENTE na seguinte estrutura de JSON:
      {
        "summary": "Resumo executivo em um parágrafo da presença digital e física do concorrente.",
        "strengths": ["Lista com pelo menos 3 pontos fortes"],
        "weaknesses": ["Lista com pelo menos 3 pontos fracos"],
        "seo_analysis": "Análise das métricas de SEO e performance técnica do site.",
        "identity_analysis": "Análise das cores, identidade visual sugerida e comunicação de marca.",
        "presence_analysis": "Análise do perfil do Google Meu Negócio e presença digital nas redes sociais.",
        "suggestions": ["Lista de pelo menos 3 sugestões táticas para superar o concorrente no mercado local"],
        "score": 85
      }
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    let resultJson: any = {};
    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      resultJson = JSON.parse(cleanText.trim());
    } catch (parseErr) {
      console.error("Erro ao fazer parse do JSON do Gemini:", parseErr, response.text);
      throw new Error("Resposta da IA inválida");
    }

    res.json({
      seo_metrics: { seo, performance, experience },
      analysis: resultJson
    });
  } catch (err: any) {
    console.error("Erro ao analisar concorrente com Gemini:", err);
    res.status(500).json({ error: "Erro ao gerar análise de IA", details: err.message });
  }
});

// 3. Salvar/Adicionar Concorrente para Monitoramento
app.post("/api/market-radar/competitors", async (req, res) => {
  const competitor = req.body;

  if (!competitor || !competitor.id || !competitor.tenant_id) {
    res.status(400).json({ error: "Dados do concorrente incompletos" });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("market_radar_competitors")
      .upsert({
        id: competitor.id,
        tenant_id: competitor.tenant_id,
        name: competitor.name,
        category: competitor.category,
        address: competitor.address,
        latitude: competitor.latitude,
        longitude: competitor.longitude,
        distance_km: competitor.distance_km,
        price_level: competitor.price_level || '$$',
        business_age: competitor.business_age || 1,
        rating: competitor.rating || 4.0,
        reviews_count: competitor.reviews_count || 0,
        phone: competitor.phone,
        whatsapp: competitor.whatsapp,
        website: competitor.website,
        instagram: competitor.instagram,
        facebook: competitor.facebook,
        seo_score: competitor.seo_score,
        seo_performance: competitor.seo_performance,
        seo_experience: competitor.seo_experience,
        analysis_summary: competitor.analysis_summary,
        analysis_strengths: competitor.analysis_strengths || [],
        analysis_weaknesses: competitor.analysis_weaknesses || [],
        analysis_seo: competitor.analysis_seo,
        analysis_identity: competitor.analysis_identity,
        analysis_presence: competitor.analysis_presence,
        analysis_suggestions: competitor.analysis_suggestions || [],
        analysis_score: competitor.analysis_score,
        monitored: competitor.monitored !== false,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      if (error.code === "42P01") {
        const idx = memoryCompetitors.findIndex(c => c.id === competitor.id && c.tenant_id === competitor.tenant_id);
        if (idx >= 0) {
          memoryCompetitors[idx] = competitor;
        } else {
          memoryCompetitors.push(competitor);
        }
        res.json(competitor);
        return;
      }
      throw error;
    }

    res.json(data[0]);
  } catch (err: any) {
    console.error("Erro ao salvar concorrente:", err);
    res.status(500).json({ error: "Erro ao salvar concorrente no banco", details: err.message });
  }
});

// 4. Listar Concorrentes Monitorados
app.get("/api/market-radar/competitors/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  try {
    const { data, error } = await supabase
      .from("market_radar_competitors")
      .select("*")
      .eq("tenant_id", tenantId);

    if (error) {
      if (error.code === "42P01") {
        const filtered = memoryCompetitors.filter(c => c.tenant_id === tenantId);
        res.json(filtered);
        return;
      }
      throw error;
    }

    res.json(data || []);
  } catch (err: any) {
    console.error("Erro ao carregar concorrentes:", err);
    res.status(500).json({ error: "Erro ao buscar concorrentes", details: err.message });
  }
});

// 5. Excluir Concorrente do Monitoramento
app.delete("/api/market-radar/competitors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("market_radar_competitors")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "42P01") {
        const idx = memoryCompetitors.findIndex(c => c.id === id);
        if (idx >= 0) memoryCompetitors.splice(idx, 1);
        res.json({ success: true });
        return;
      }
      throw error;
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao excluir concorrente:", err);
    res.status(500).json({ error: "Erro ao deletar concorrente", details: err.message });
  }
});

// 6. Listar Alertas do Tenant
app.get("/api/market-radar/alerts/:tenantId", async (req, res) => {
  const { tenantId } = req.params;

  try {
    const { data, error } = await supabase
      .from("market_radar_alerts")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        const filtered = memoryAlerts.filter(a => a.tenant_id === tenantId);
        if (filtered.length === 0) {
          const defaultAlert = {
            id: "alert-default-demo",
            tenant_id: tenantId,
            competitor_id: "demo",
            type: "new_competitor",
            message: "Novo concorrente encontrado na sua região! Um negócio similar surgiu a 1,2 km de distância.",
            is_read: false,
            created_at: new Date().toISOString()
          };
          memoryAlerts.push(defaultAlert);
          res.json([defaultAlert]);
          return;
        }
        res.json(filtered);
        return;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      const defaultAlert = {
        id: "alert-default-demo",
        tenant_id: tenantId,
        competitor_id: "demo",
        type: "new_competitor",
        message: "Novo concorrente encontrado na sua região! Um negócio similar surgiu a 1,2 km de distância.",
        is_read: false,
        created_at: new Date().toISOString()
      };
      res.json([defaultAlert]);
      return;
    }

    res.json(data);
  } catch (err: any) {
    console.error("Erro ao buscar alertas:", err);
    res.status(500).json({ error: "Erro ao listar alertas", details: err.message });
  }
});

// 7. Marcar Alerta como Lido
app.post("/api/market-radar/alerts/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("market_radar_alerts")
      .update({ is_read: true })
      .eq("id", id)
      .select();

    if (error) {
      if (error.code === "42P01") {
        const alert = memoryAlerts.find(a => a.id === id);
        if (alert) alert.is_read = true;
        res.json({ success: true });
        return;
      }
      throw error;
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao marcar alerta como lido:", err);
    res.status(500).json({ error: "Erro ao atualizar alerta", details: err.message });
  }
});

// 8. Obter Histórico de Evolução do Concorrente (Notas do Google)
app.get("/api/market-radar/history/:competitorId", async (req, res) => {
  const { competitorId } = req.params;

  try {
    const { data, error } = await supabase
      .from("market_radar_history")
      .select("*")
      .eq("competitor_id", competitorId)
      .order("recorded_at", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        const filtered = memoryHistory.filter(h => h.competitor_id === competitorId);
        if (filtered.length === 0) {
          const seed = competitorId;
          const initialRating = getDeterministicFloat(seed + "-hist-init", 3.9, 4.3, 1);
          const currentRating = getDeterministicFloat(seed + "-hist-curr", 4.4, 4.9, 1);

          const mockHist = [
            { id: "h1", competitor_id: competitorId, rating: initialRating, reviews_count: 50, recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "h2", competitor_id: competitorId, rating: Number(((initialRating + currentRating)/2).toFixed(1)), reviews_count: 75, recorded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "h3", competitor_id: competitorId, rating: currentRating, reviews_count: 100, recorded_at: new Date().toISOString() }
          ];
          res.json(mockHist);
          return;
        }
        res.json(filtered);
        return;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      const seed = competitorId;
      const initialRating = getDeterministicFloat(seed + "-hist-init", 3.9, 4.3, 1);
      const currentRating = getDeterministicFloat(seed + "-hist-curr", 4.4, 4.9, 1);

      const mockHist = [
        { id: "h1", competitor_id: competitorId, rating: initialRating, reviews_count: 50, recorded_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "h2", competitor_id: competitorId, rating: Number(((initialRating + currentRating)/2).toFixed(1)), reviews_count: 75, recorded_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "h3", competitor_id: competitorId, rating: currentRating, reviews_count: 100, recorded_at: new Date().toISOString() }
      ];
      res.json(mockHist);
      return;
    }

    res.json(data);
  } catch (err: any) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ error: "Erro ao listar histórico", details: err.message });
  }
});

// 9. Acionador do Cron de Sincronização Periódica (Simulado ou Real)
app.post("/api/market-radar/sync-cron", async (req, res) => {
  const { tenantId } = req.body;

  if (!tenantId) {
    res.status(400).json({ error: "tenantId é obrigatório" });
    return;
  }

  try {
    let competitors: any[] = [];

    const { data: dbComps, error } = await supabase
      .from("market_radar_competitors")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("monitored", true);

    if (error && error.code !== "42P01") throw error;

    if (error && error.code === "42P01") {
      competitors = memoryCompetitors.filter(c => c.tenant_id === tenantId && c.monitored !== false);
    } else {
      competitors = dbComps || [];
    }

    const updates: any[] = [];
    const alerts: any[] = [];

    for (const comp of competitors) {
      const seed = comp.id + String(Date.now());
      const changeRatingChance = getDeterministicValue(seed + "-ch", 1, 10);
      if (changeRatingChance > 7) {
        const oldRating = Number(comp.rating);
        const newRating = Number((oldRating + 0.1 > 5.0 ? 5.0 : oldRating + 0.1).toFixed(1));
        const oldReviews = Number(comp.reviews_count);
        const newReviews = oldReviews + getDeterministicValue(seed + "-rev-add", 1, 5);

        comp.rating = newRating;
        comp.reviews_count = newReviews;
        comp.updated_at = new Date().toISOString();

        updates.push(comp);

        const alert = {
          id: `alert-${getDeterministicValue(seed, 1000, 9999)}`,
          tenant_id: tenantId,
          competitor_id: comp.id,
          type: "rating_change",
          message: `Evolução detectada: O concorrente "${comp.name}" subiu sua reputação para ${newRating} estrelas no Google Meu Negócio com ${newReviews} avaliações!`,
          is_read: false,
          created_at: new Date().toISOString()
        };

        alerts.push(alert);
      }
    }

    for (const item of updates) {
      if (error && error.code === "42P01") {
        const idx = memoryCompetitors.findIndex(c => c.id === item.id);
        if (idx >= 0) memoryCompetitors[idx] = item;

        memoryHistory.push({
          id: `h-mem-${Date.now()}-${item.id}`,
          competitor_id: item.id,
          rating: item.rating,
          reviews_count: item.reviews_count,
          recorded_at: new Date().toISOString()
        });
      } else {
        await supabase
          .from("market_radar_competitors")
          .update({ rating: item.rating, reviews_count: item.reviews_count, updated_at: item.updated_at })
          .eq("id", item.id);

        await supabase
          .from("market_radar_history")
          .insert({
            id: `h-${Date.now()}-${item.id}`,
            competitor_id: item.id,
            rating: item.rating,
            reviews_count: item.reviews_count,
            recorded_at: new Date().toISOString()
          });
      }
    }

    for (const alert of alerts) {
      if (error && error.code === "42P01") {
        memoryAlerts.push(alert);
      } else {
        await supabase
          .from("market_radar_alerts")
          .insert(alert);
      }
    }

    res.json({
      success: true,
      processed: competitors.length,
      updated: updates.length,
      alerts_generated: alerts.length
    });
  } catch (err: any) {
    console.error("Erro no cron de sincronização do Radar:", err);
    res.status(500).json({ error: "Erro ao rodar sincronização", details: err.message });
  }
});

// ============================================================
// ============================================================
// RADAR DE OPORTUNIDADES — Motor de Auditoria de Websites
// Módulo Admin Exclusivo | Apenas informações públicas
// ============================================================

import * as dns from "dns";
import * as tls from "tls";
import * as net from "net";
import { load as cheerioLoad } from "cheerio";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Mapas de categorias OSM para busca de empresas
const RADAR_OSM_TAGS: Record<string, string[]> = {
  "restaurante":  ['"amenity"="restaurant"', '"amenity"="fast_food"', '"amenity"="cafe"'],
  "barbearia":    ['"shop"="barber"', '"shop"="hairdresser"'],
  "salao":        ['"shop"="hairdresser"', '"shop"="beauty"'],
  "dentista":     ['"amenity"="dentist"'],
  "clinica":      ['"amenity"="clinic"', '"amenity"="doctors"'],
  "mercado":      ['"shop"="supermarket"', '"shop"="convenience"', '"shop"="grocery"'],
  "farmacia":     ['"amenity"="pharmacy"'],
  "academia":     ['"leisure"="fitness_centre"'],
  "hotel":        ['"tourism"="hotel"', '"tourism"="motel"'],
  "oficina":      ['"shop"="car_repair"', '"craft"="car_repair"'],
  "padaria":      ['"shop"="bakery"'],
  "petshop":      ['"shop"="pet"', '"amenity"="veterinary"'],
  "advocacia":    ['"office"="lawyer"'],
  "contabilidade":['"office"="accountant"'],
  "escola":       ['"amenity"="school"', '"amenity"="language_school"'],
  "geral":        ['"shop"~"."', '"amenity"~"."', '"office"~"."'],
};

// Coordenadas fallback para cidades brasileiras comuns
const BR_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "salvador":           { lat: -12.9704, lon: -38.5089 },
  "sao paulo":          { lat: -23.5505, lon: -46.6333 },
  "rio de janeiro":     { lat: -22.9068, lon: -43.1729 },
  "belo horizonte":     { lat: -19.9167, lon: -43.9345 },
  "fortaleza":          { lat: -3.7275,  lon: -38.5275 },
  "recife":             { lat: -8.0539,  lon: -34.8811 },
  "porto alegre":       { lat: -30.0346, lon: -51.2177 },
  "curitiba":           { lat: -25.4290, lon: -49.2671 },
  "manaus":             { lat: -3.1190,  lon: -60.0217 },
  "brasilia":           { lat: -15.7801, lon: -47.9292 },
  "lauro de freitas":   { lat: -12.8944, lon: -38.3275 },
  "camaçari":           { lat: -12.6994, lon: -38.3239 },
  "feira de santana":   { lat: -12.2664, lon: -38.9663 },
};

// Mapper: OSM node → RadarCompany
function mapOsmToCompany(node: any): any {
  const t = node.tags || {};
  const name = t.name || t["name:pt"] || "";
  if (!name) return null;
  return {
    osmId: String(node.id),
    name,
    category: t.amenity || t.shop || t.tourism || t.leisure || t.office || t.craft || "empresa",
    phone: t.phone || t["contact:phone"] || "",
    website: t.website || t["contact:website"] || "",
    email: t.email || t["contact:email"] || "",
    instagram: t["contact:instagram"] || "",
    facebook: t["contact:facebook"] || "",
    address: [t["addr:street"], t["addr:housenumber"], t["addr:suburb"]].filter(Boolean).join(", "),
    city: t["addr:city"] || "",
    state: t["addr:state"] || "",
    latitude: node.lat,
    longitude: node.lon,
  };
}

// Módulo 1: Verificar disponibilidade do site
async function auditAvailability(url: string): Promise<any> {
  const start = Date.now();
  let isOnline = false;
  let hasHttps = url.startsWith("https");
  let sslValid = false;
  let sslExpiryDays = 0;
  let redirectCount = 0;
  let responseTimeMs = 0;
  let dnsResolves = false;
  const issues: any[] = [];

  try {
    // Verificar DNS
    const hostname = new URL(url).hostname;
    await dns.promises.resolve(hostname);
    dnsResolves = true;

    // Verificar SSL se HTTPS
    if (hasHttps) {
      try {
        await new Promise<void>((resolve, reject) => {
          const socket = tls.connect({ host: hostname, port: 443, servername: hostname }, () => {
            const cert = socket.getPeerCertificate();
            if (cert && cert.valid_to) {
              const expiry = new Date(cert.valid_to);
              sslExpiryDays = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              sslValid = sslExpiryDays > 0;
              if (sslExpiryDays < 30) issues.push({ module: "availability", severity: "warning", title: "SSL próximo do vencimento", description: `Certificado expira em ${sslExpiryDays} dias.` });
            }
            socket.destroy();
            resolve();
          });
          socket.on("error", reject);
          socket.setTimeout(8000, () => { socket.destroy(); reject(new Error("timeout")); });
        });
      } catch { sslValid = false; issues.push({ module: "availability", severity: "critical", title: "SSL inválido", description: "Certificado SSL inválido ou inacessível." }); }
    }

    // Fetch com timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteAlugadoRadar/1.0)" }
    });
    clearTimeout(timer);
    responseTimeMs = Date.now() - start;
    isOnline = resp.ok || resp.status < 500;

    if (responseTimeMs > 4000) issues.push({ module: "performance", severity: "warning", title: "Site lento", description: `Tempo de resposta: ${responseTimeMs}ms (ideal: < 2000ms).` });
    if (!hasHttps) issues.push({ module: "security", severity: "critical", title: "Sem HTTPS", description: "O site não usa criptografia HTTPS." });

    return { isOnline, hasHttps, sslValid, sslExpiryDays, responseTimeMs, dnsResolves, redirectCount, issues };
  } catch (e: any) {
    return { isOnline: false, hasHttps, sslValid: false, sslExpiryDays: 0, responseTimeMs: Date.now() - start, dnsResolves, redirectCount: 0,
      issues: [{ module: "availability", severity: "critical", title: "Site inacessível", description: e.message || "Não foi possível conectar ao site." }] };
  }
}

// Módulo 2: Auditoria de SEO via Cheerio
async function auditSeo(url: string, html: string): Promise<{ data: any; issues: any[] }> {
  const $ = cheerioLoad(html);
  const issues: any[] = [];

  const title = $("title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const h1s = $("h1");
  const hasOg = !!$('meta[property="og:title"]').attr("content");
  const hasTwitter = !!$('meta[name="twitter:card"]').attr("content");
  const hasSchema = html.includes("application/ld+json");
  const imagesMissingAlt = $("img").filter((_, el) => !$(el).attr("alt")).length;
  const internalLinks = $("a[href]").filter((_, el) => { const h = $(el).attr("href") || ""; return h.startsWith("/") || h.includes(new URL(url).hostname); }).length;
  const externalLinks = $("a[href]").filter((_, el) => { const h = $(el).attr("href") || ""; return h.startsWith("http") && !h.includes(new URL(url).hostname); }).length;

  // Checar arquivos externos
  let hasRobotsTxt = false, hasSitemap = false, hasFavicon = false;
  try {
    const rResp = await fetch(`${new URL(url).origin}/robots.txt`, { signal: AbortSignal.timeout(5000) });
    hasRobotsTxt = rResp.ok;
  } catch {}
  try {
    const sResp = await fetch(`${new URL(url).origin}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
    hasSitemap = sResp.ok;
  } catch {}
  try {
    const fResp = await fetch(`${new URL(url).origin}/favicon.ico`, { signal: AbortSignal.timeout(5000) });
    hasFavicon = fResp.ok;
  } catch {}

  if (!title) issues.push({ module: "seo", severity: "critical", title: "Sem título", description: "Página sem tag <title>." });
  else if (title.length < 30 || title.length > 60) issues.push({ module: "seo", severity: "warning", title: "Título fora do tamanho ideal", description: `Título com ${title.length} caracteres (ideal: 30-60).` });
  if (!metaDesc) issues.push({ module: "seo", severity: "critical", title: "Sem meta description", description: "Nenhuma meta description encontrada." });
  if (h1s.length === 0) issues.push({ module: "seo", severity: "critical", title: "Sem H1", description: "Página sem heading H1." });
  if (h1s.length > 1) issues.push({ module: "seo", severity: "warning", title: "Múltiplos H1", description: `Encontrados ${h1s.length} H1s. Deve haver apenas um.` });
  if (!canonical) issues.push({ module: "seo", severity: "warning", title: "Sem canonical", description: "Tag canonical ausente." });
  if (!hasRobotsTxt) issues.push({ module: "seo", severity: "warning", title: "Sem robots.txt", description: "Arquivo robots.txt não encontrado." });
  if (!hasSitemap) issues.push({ module: "seo", severity: "warning", title: "Sem sitemap.xml", description: "Sitemap XML não encontrado." });
  if (!hasOg) issues.push({ module: "seo", severity: "info", title: "Sem Open Graph", description: "Meta tags Open Graph ausentes (importante para compartilhamento)." });
  if (!hasTwitter) issues.push({ module: "seo", severity: "info", title: "Sem Twitter Card", description: "Meta tags Twitter Card ausentes." });
  if (imagesMissingAlt > 0) issues.push({ module: "seo", severity: "warning", title: "Imagens sem alt", description: `${imagesMissingAlt} imagem(ns) sem atributo alt.` });
  if (!hasSchema) issues.push({ module: "seo", severity: "info", title: "Sem Schema.org", description: "Nenhum dado estruturado Schema.org encontrado." });

  return {
    data: { hasTitle: !!title, titleLength: title.length, hasMetaDescription: !!metaDesc, metaDescriptionLength: metaDesc.length, hasH1: h1s.length > 0, h1Count: h1s.length, hasCanonical: !!canonical, hasRobotsTxt, hasSitemap, hasOpenGraph: hasOg, hasTwitterCard: hasTwitter, hasFavicon, imagesMissingAlt, internalLinks, externalLinks, hasSchema },
    issues
  };
}

// Módulo 3: Crawler de Links Quebrados (limitado a 40 recursos)
async function auditBrokenLinks(url: string, html: string): Promise<{ brokenLinks: any[]; issues: any[] }> {
  const $ = cheerioLoad(html);
  const origin = new URL(url).origin;
  const issues: any[] = [];
  const toCheck: { url: string; type: string }[] = [];

  $("a[href]").slice(0, 20).each((_, el) => { const h = $(el).attr("href") || ""; if (h.startsWith("http") || h.startsWith("/")) toCheck.push({ url: h.startsWith("/") ? origin + h : h, type: "link" }); });
  $("img[src]").slice(0, 10).each((_, el) => { const s = $(el).attr("src") || ""; if (s && !s.startsWith("data:")) toCheck.push({ url: s.startsWith("/") ? origin + s : s.startsWith("http") ? s : origin + "/" + s, type: "image" }); });
  $("script[src]").slice(0, 5).each((_, el) => { const s = $(el).attr("src") || ""; if (s) toCheck.push({ url: s.startsWith("/") ? origin + s : s.startsWith("http") ? s : origin + "/" + s, type: "script" }); });
  $('link[rel="stylesheet"]').slice(0, 5).each((_, el) => { const h = $(el).attr("href") || ""; if (h) toCheck.push({ url: h.startsWith("/") ? origin + h : h.startsWith("http") ? h : origin + "/" + h, type: "stylesheet" }); });

  const brokenLinks: any[] = [];
  const checks = toCheck.slice(0, 40).map(async ({ url: checkUrl, type }) => {
    try {
      const resp = await fetch(checkUrl, { method: "HEAD", signal: AbortSignal.timeout(6000), headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteAlugadoRadar/1.0)" } });
      if (resp.status === 404 || resp.status === 410 || resp.status >= 500) {
        brokenLinks.push({ url: checkUrl, statusCode: resp.status, type, foundOn: url });
      }
    } catch { brokenLinks.push({ url: checkUrl, statusCode: 0, type, foundOn: url }); }
  });
  await Promise.allSettled(checks);

  if (brokenLinks.length > 0) issues.push({ module: "links", severity: brokenLinks.length > 5 ? "critical" : "warning", title: `${brokenLinks.length} link(s) quebrado(s)`, description: `Encontrados ${brokenLinks.length} recursos com erro (404/500).` });
  return { brokenLinks, issues };
}

// Módulo 4-5: Performance via Lighthouse CLI (com fallback)
async function auditPerformance(url: string, html: string): Promise<{ data: any; issues: any[] }> {
  const issues: any[] = [];
  try {
    const { stdout } = await execAsync(
      `npx lighthouse "${url}" --output=json --chrome-flags="--headless --no-sandbox --disable-gpu" --quiet`,
      { timeout: 90000, maxBuffer: 10 * 1024 * 1024 }
    );
    const lh = JSON.parse(stdout);
    const cats = lh.categories || {};
    const audits = lh.audits || {};
    const perf = Math.round((cats.performance?.score || 0) * 100);
    const acc = Math.round((cats.accessibility?.score || 0) * 100);
    const bp = Math.round((cats["best-practices"]?.score || 0) * 100);
    const seo = Math.round((cats.seo?.score || 0) * 100);

    if (perf < 50) issues.push({ module: "performance", severity: "critical", title: "Performance crítica", description: `Score Lighthouse: ${perf}/100.` });
    else if (perf < 80) issues.push({ module: "performance", severity: "warning", title: "Performance baixa", description: `Score Lighthouse: ${perf}/100.` });

    return { data: {
      performanceScore: perf, seoScore: seo, accessibilityScore: acc, bestPracticesScore: bp,
      lcp: Math.round((audits["largest-contentful-paint"]?.numericValue || 0)),
      cls: audits["cumulative-layout-shift"]?.numericValue || 0,
      fcp: Math.round((audits["first-contentful-paint"]?.numericValue || 0)),
      ttfb: Math.round((audits["time-to-first-byte"]?.numericValue || 0)),
      speedIndex: Math.round((audits["speed-index"]?.numericValue || 0)),
      inp: Math.round((audits["interaction-to-next-paint"]?.numericValue || 0)),
      isLighthouse: true,
    }, issues };
  } catch {
    // Fallback: estimar por análise de recursos
    const $ = cheerioLoad(html);
    const scriptCount = $("script[src]").length;
    const cssCount = $('link[rel="stylesheet"]').length;
    const imgCount = $("img").length;
    const estimated = Math.max(20, Math.min(80, 80 - scriptCount * 5 - cssCount * 3 - imgCount * 2));
    if (estimated < 50) issues.push({ module: "performance", severity: "warning", title: "Muitos recursos pesados", description: `${scriptCount} scripts, ${cssCount} CSS, ${imgCount} imagens detectados.` });
    return { data: { performanceScore: estimated, isLighthouse: false, requestCount: scriptCount + cssCount + imgCount }, issues };
  }
}

// Módulo 5: Mobile (viewport meta + análise)
async function auditMobile(html: string): Promise<{ data: any; issues: any[] }> {
  const $ = cheerioLoad(html);
  const issues: any[] = [];
  const viewportMeta = $('meta[name="viewport"]').attr("content") || "";
  const hasViewport = !!viewportMeta;
  const hasResponsiveImages = $("img").filter((_, el) => !!$(el).attr("srcset") || !!$(el).attr("sizes")).length > 0;

  if (!hasViewport) issues.push({ module: "mobile", severity: "critical", title: "Sem viewport meta", description: "Falta a meta tag de viewport — site provavelmente não é responsivo." });
  else if (!viewportMeta.includes("width=device-width")) issues.push({ module: "mobile", severity: "warning", title: "Viewport configurada incorretamente", description: `Viewport: "${viewportMeta}"` });

  const score = hasViewport ? (viewportMeta.includes("width=device-width") ? 70 : 50) : 20;
  return { data: { hasViewportMeta: hasViewport, viewportContent: viewportMeta, hasResponsiveImages, estimatedMobileScore: score }, issues };
}

// Módulo 6: Segurança (análise de headers HTTP)
async function auditSecurity(url: string): Promise<{ data: any; issues: any[] }> {
  const issues: any[] = [];
  try {
    const resp = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0" } });
    const h = resp.headers;
    const hasHsts = !!h.get("strict-transport-security");
    const hasCsp = !!h.get("content-security-policy");
    const hasXFrame = !!h.get("x-frame-options");
    const hasXContent = !!h.get("x-content-type-options");
    const hasXss = !!h.get("x-xss-protection");
    const setCookie = h.get("set-cookie") || "";
    const cookiesInsecure = setCookie.length > 0 && !setCookie.toLowerCase().includes("secure");
    const hasMixedContent = false; // detectado no HTML

    if (!hasHsts) issues.push({ module: "security", severity: "warning", title: "Sem HSTS", description: "Header Strict-Transport-Security ausente." });
    if (!hasCsp) issues.push({ module: "security", severity: "warning", title: "Sem CSP", description: "Content-Security-Policy não configurada." });
    if (!hasXFrame) issues.push({ module: "security", severity: "warning", title: "Sem X-Frame-Options", description: "Suscetível a ataques de clickjacking." });
    if (!hasXContent) issues.push({ module: "security", severity: "info", title: "Sem X-Content-Type-Options", description: "Header de proteção de MIME ausente." });
    if (cookiesInsecure) issues.push({ module: "security", severity: "warning", title: "Cookies inseguros", description: "Cookies sem flag Secure detectados." });

    return { data: { hasHsts, hasCsp, hasXFrameOptions: hasXFrame, hasXContentType: hasXContent, hasXssProtection: hasXss, hasMixedContent, cookiesInsecure }, issues };
  } catch {
    return { data: { hasHsts: false, hasCsp: false, hasXFrameOptions: false, hasXContentType: false, hasXssProtection: false, hasMixedContent: false, cookiesInsecure: false }, issues };
  }
}

// Módulo 7: Detecção de Tecnologias (fingerprints)
function detectTechnologies(html: string, headers: Record<string, string>): any[] {
  const technologies: any[] = [];
  const h = html.toLowerCase();
  const check = (name: string, category: string, condition: boolean) => { if (condition) technologies.push({ name, category, confidence: 90 }); };

  check("WordPress", "cms", h.includes("wp-content") || h.includes("wp-includes"));
  check("WooCommerce", "ecommerce", h.includes("woocommerce"));
  check("Elementor", "cms", h.includes("elementor"));
  check("Divi", "cms", h.includes("divi"));
  check("Joomla", "cms", h.includes("/components/com_") || h.includes("joomla"));
  check("Drupal", "cms", h.includes("drupal"));
  check("Laravel", "framework", h.includes("laravel_session") || (headers["x-powered-by"] || "").toLowerCase().includes("laravel"));
  check("PHP", "language", (headers["x-powered-by"] || "").includes("PHP"));
  check("React", "framework", h.includes("__reactfiber") || h.includes("_next/static") || h.includes("react-dom"));
  check("Next.js", "framework", h.includes("__next_data__") || h.includes("_next/static"));
  check("Vue.js", "framework", h.includes("__vue__") || h.includes("vue.min.js"));
  check("Angular", "framework", h.includes("ng-version") || h.includes("angular.min.js"));
  check("Cloudflare", "cdn", !!(headers["cf-ray"] || headers["cf-cache-status"]));
  check("Google Analytics (GA4)", "analytics", h.includes("gtag") || h.includes("google-analytics.com"));
  check("Google Tag Manager", "analytics", h.includes("googletagmanager.com"));
  check("Facebook Pixel", "marketing", h.includes("connect.facebook.net") || h.includes("fbevents.js"));
  check("Hotjar", "analytics", h.includes("hotjar.com"));
  check("LGPD/Cookie Banner", "marketing", h.includes("cookieconsent") || h.includes("cookie-banner") || h.includes("lgpd"));

  return technologies;
}

// Módulo 8: WordPress (verificação detalhada)
async function auditWordPress(url: string, html: string): Promise<{ data: any; issues: any[] }> {
  const origin = new URL(url).origin;
  const h = html.toLowerCase();
  const isWP = h.includes("wp-content") || h.includes("wp-includes");
  if (!isWP) return { data: { isWordPress: false, hasRestApi: false, hasXmlRpc: false, hasReadme: false, hasWpLogin: false, hasWpAdmin: false }, issues: [] };

  const issues: any[] = [];
  let version: string | undefined;
  let hasRestApi = false, hasXmlRpc = false, hasReadme = false, hasWpLogin = false, hasWpAdmin = false;

  // Detectar versão via generator meta
  const genMatch = html.match(/name="generator"\s+content="WordPress\s+([0-9.]+)"/i);
  if (genMatch) version = genMatch[1];

  // Verificar endpoints conhecidos (apenas HEAD, sem exploração)
  const checkEndpoint = async (path: string): Promise<boolean> => { try { const r = await fetch(origin + path, { method: "HEAD", signal: AbortSignal.timeout(5000) }); return r.ok; } catch { return false; } };
  [hasRestApi, hasXmlRpc, hasReadme, hasWpLogin, hasWpAdmin] = await Promise.all([
    checkEndpoint("/wp-json/"),
    checkEndpoint("/xmlrpc.php"),
    checkEndpoint("/readme.html"),
    checkEndpoint("/wp-login.php"),
    checkEndpoint("/wp-admin/"),
  ]);

  if (hasReadme) issues.push({ module: "wordpress", severity: "warning", title: "readme.html exposto", description: "Arquivo readme.html acessível — revela versão do WordPress." });
  if (hasXmlRpc) issues.push({ module: "wordpress", severity: "warning", title: "XMLRPC ativo", description: "xmlrpc.php acessível — pode ser explorado para ataques de força bruta." });
  if (version) {
    const major = parseInt(version.split(".")[0]);
    if (major < 6) issues.push({ module: "wordpress", severity: "critical", title: "WordPress desatualizado", description: `Versão detectada: ${version}. Mantenha sempre atualizado.` });
  }

  return { data: { isWordPress: true, version, hasRestApi, hasXmlRpc, hasReadme, hasWpLogin, hasWpAdmin }, issues };
}

// Módulo 9: Análise de Código (HTML, CSS, JS)
function auditCode(html: string): { data: any; issues: any[] } {
  const $ = cheerioLoad(html);
  const issues: any[] = [];
  const scripts = $("script[src]").map((_, el) => $(el).attr("src")).get();
  const styles = $('link[rel="stylesheet"]').map((_, el) => $(el).attr("href")).get();
  const inlineStyles = $("[style]").length;
  const duplicateScripts = scripts.length - new Set(scripts).size;
  const duplicateStyles = styles.length - new Set(styles).size;

  if (duplicateScripts > 0) issues.push({ module: "code", severity: "warning", title: "Scripts duplicados", description: `${duplicateScripts} script(s) carregado(s) mais de uma vez.` });
  if (duplicateStyles > 0) issues.push({ module: "code", severity: "warning", title: "CSS duplicado", description: `${duplicateStyles} folha(s) CSS carregada(s) mais de uma vez.` });
  if (inlineStyles > 20) issues.push({ module: "code", severity: "info", title: "Estilos inline excessivos", description: `${inlineStyles} elementos com style inline.` });
  if (scripts.length > 15) issues.push({ module: "code", severity: "warning", title: "Muitos scripts externos", description: `${scripts.length} scripts carregados — impacta performance.` });

  return { data: { scriptCount: scripts.length, cssCount: styles.length, inlineStylesCount: inlineStyles, duplicateScripts, duplicateStyles }, issues };
}

// Algoritmo de Pontuação e Classificação
function calculateScores(modules: any): { scores: any; stars: number } {
  const seoIssuesPenalty = (modules.seoIssues || []).filter((i: any) => i.module === "seo").length;
  const scoreSeo = Math.max(0, 100 - seoIssuesPenalty * 12);

  const perf = modules.performanceData;
  const scorePerformance = perf?.isLighthouse ? (perf.performanceScore || 50) : (perf?.performanceScore || 50);

  const secData = modules.securityData || {};
  const secChecks = ["hasHsts", "hasCsp", "hasXFrameOptions", "hasXContentType", "hasXssProtection"];
  const secPassed = secChecks.filter(k => secData[k]).length;
  const scoreSecurity = Math.round((secPassed / secChecks.length) * 100);

  const scoreMobile = modules.mobileData?.estimatedMobileScore || (perf?.isLighthouse ? (perf.accessibilityScore || 50) : 50);
  const scoreAccessibility = perf?.isLighthouse ? (perf.accessibilityScore || 50) : 60;

  const codeIssues = (modules.codeIssues || []).length;
  const brokenCount = (modules.brokenLinks || []).length;
  const scoreCode = Math.max(0, 100 - codeIssues * 10 - brokenCount * 8);

  const scoreGeneral = Math.round(scoreSeo * 0.25 + scorePerformance * 0.25 + scoreSecurity * 0.20 + scoreMobile * 0.15 + scoreAccessibility * 0.10 + scoreCode * 0.05);

  // Stars como oportunidade comercial: site ruim = mais estrelas = melhor lead
  const opportunityScore = 100 - scoreGeneral;
  const stars = opportunityScore >= 80 ? 5 : opportunityScore >= 60 ? 4 : opportunityScore >= 40 ? 3 : opportunityScore >= 20 ? 2 : 1;

  return { scores: { scoreSeo, scorePerformance, scoreSecurity, scoreMobile, scoreAccessibility, scoreCode, scoreGeneral }, stars };
}

// Estimativa de valor do projeto
function estimateProjectValue(scores: any, technologies: any[]): { min: number; max: number; complexity: string } {
  const isWP = technologies.some(t => t.name === "WordPress");
  const hasAnalytics = technologies.some(t => t.category === "analytics");
  const avgScore = scores.scoreGeneral;
  const complexity = avgScore < 30 ? "high" : avgScore < 60 ? "medium" : "low";
  const base = isWP ? 1500 : 3500;
  const multiplier = complexity === "high" ? 2.5 : complexity === "medium" ? 1.8 : 1.2;
  return { min: Math.round(base * multiplier * 0.8), max: Math.round(base * multiplier * 1.5), complexity };
}

// ── Rotas do Radar de Oportunidades ──────────────────────────

// GET /api/radar/companies — lista empresas salvas
app.get("/api/radar/companies", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("radar_companies").select("*, radar_audits(id, stars, score_general, score_seo, score_performance, score_security, audited_at, issues, technologies, ai_summary, ai_whatsapp_msg, estimated_value_min, estimated_value_max, complexity)")
      .order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao listar empresas do radar", details: err.message });
  }
});

// GET /api/radar/companies/:id — detalhe de uma empresa
app.get("/api/radar/companies/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("radar_companies").select("*, radar_audits(*)").eq("id", req.params.id).single();
    if (error) throw error;
    if (!data) { res.status(404).json({ error: "Empresa não encontrada" }); return; }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/radar/companies/:id
app.delete("/api/radar/companies/:id", async (req, res) => {
  try {
    const { error } = await supabase.from("radar_companies").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/radar/search — busca empresas via Overpass API (OSM)
app.post("/api/radar/search", async (req, res) => {
  const { city, state, category = "geral", limit = 50 } = req.body;
  if (!city) { res.status(400).json({ error: "Cidade é obrigatória" }); return; }

  try {
    // 1. Geocodificar cidade via Nominatim
    const cityKey = city.toLowerCase().trim();
    let coords = BR_CITY_COORDS[cityKey];
    if (!coords) {
      const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", " + (state || "Brasil"))}&format=json&limit=1`, {
        headers: { "User-Agent": "SiteAlugadoRadar/1.0 (contato@seusitealugado.com.br)" },
        signal: AbortSignal.timeout(10000),
      });
      const geoData = await geoResp.json();
      if (geoData?.[0]) coords = { lat: parseFloat(geoData[0].lat), lon: parseFloat(geoData[0].lon) };
      else coords = { lat: -12.9704, lon: -38.5089 }; // fallback Salvador
    }

    // 2. Buscar no Overpass (com fallback para instâncias espelho)
    const catKey = Object.keys(RADAR_OSM_TAGS).find(k => category.toLowerCase().includes(k)) || "geral";
    const tags = RADAR_OSM_TAGS[catKey] || RADAR_OSM_TAGS["geral"];
    const radius = limit <= 50 ? 5000 : limit <= 100 ? 8000 : 15000;
    const unionQuery = tags.map(tag => `node[${tag}](around:${radius},${coords.lat},${coords.lon});\nway[${tag}](around:${radius},${coords.lat},${coords.lon});`).join("\n");
    const overpassQuery = `[out:json][timeout:30];\n(\n${unionQuery}\n);\nout center ${Math.min(limit, 500)};`;

    const OVERPASS_MIRRORS = [
      "https://overpass-api.de/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let ovData: any = null;
    let lastErr = "";
    for (const mirror of OVERPASS_MIRRORS) {
      try {
        const ovResp = await fetch(mirror, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "SiteAlugadoRadar/1.0 (admin@seusitealugado.com.br)",
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
          signal: AbortSignal.timeout(35000),
        });
        if (!ovResp.ok) {
          lastErr = `Overpass mirror ${mirror} retornou ${ovResp.status}`;
          console.warn(`[Radar] ${lastErr} — tentando próximo mirror...`);
          continue;
        }
        ovData = await ovResp.json();
        console.log(`[Radar] Overpass OK via ${mirror} — ${ovData?.elements?.length || 0} elementos`);
        break;
      } catch (mirrorErr: any) {
        lastErr = mirrorErr.message;
        console.warn(`[Radar] Erro no mirror ${mirror}: ${mirrorErr.message}`);
      }
    }
    if (!ovData) throw new Error(`Todas as instâncias Overpass falharam. Último erro: ${lastErr}`);
    const elements: any[] = (ovData.elements || []).map((el: any) => ({
      ...el,
      // way/relation retornam center separado
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
    })).filter((el: any) => el.lat && el.lon);

    // 3. Mapear e salvar no Supabase (upsert por osm_id)
    const companies = elements.map(mapOsmToCompany).filter(Boolean).slice(0, limit);
    const saved: any[] = [];
    for (const c of companies) {
      const { data: existing } = await supabase.from("radar_companies").select("id").eq("osm_id", c.osmId).maybeSingle();
      if (!existing) {
        const { data: inserted } = await supabase.from("radar_companies").insert({
          name: c.name, category: c.category, phone: c.phone, website: c.website,
          email: c.email, instagram: c.instagram, facebook: c.facebook,
          address: c.address, city: city, state: state || "",
          latitude: c.latitude, longitude: c.longitude, osm_id: c.osmId, status: "found",
        }).select().single();
        if (inserted) saved.push(inserted);
      } else {
        saved.push(existing);
      }
    }

    console.log(`[Radar] Busca em ${city}: ${elements.length} encontrados no OSM, ${saved.length} processados.`);
    res.json({ total: saved.length, companies: saved });
  } catch (err: any) {
    console.error("[Radar] Erro na busca:", err);
    res.status(500).json({ error: "Erro na busca de empresas", details: err.message });
  }
});

// POST /api/radar/audit — auditar website de uma empresa
app.post("/api/radar/audit", async (req, res) => {
  const { companyId, url } = req.body;
  if (!companyId || !url) { res.status(400).json({ error: "companyId e url são obrigatórios" }); return; }

  // Normalizar URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http")) normalizedUrl = "https://" + normalizedUrl;

  console.log(`[Radar] Iniciando auditoria: ${normalizedUrl}`);
  await supabase.from("radar_companies").update({ status: "auditing" }).eq("id", companyId);

  try {
    // Fetch HTML principal
    let html = "";
    let responseHeaders: Record<string, string> = {};
    try {
      const r = await fetch(normalizedUrl, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteAlugadoRadar/1.0)" } });
      html = await r.text();
      r.headers.forEach((v, k) => { responseHeaders[k] = v; });
    } catch (e) { html = ""; }

    // Executar todos os módulos em paralelo
    const [avail, seoResult, linksResult, perfResult, mobileResult, secResult, wpResult] = await Promise.all([
      auditAvailability(normalizedUrl),
      html ? auditSeo(normalizedUrl, html) : Promise.resolve({ data: null, issues: [] }),
      html ? auditBrokenLinks(normalizedUrl, html) : Promise.resolve({ brokenLinks: [], issues: [] }),
      html ? auditPerformance(normalizedUrl, html) : Promise.resolve({ data: { performanceScore: 0, isLighthouse: false }, issues: [] }),
      html ? auditMobile(html) : Promise.resolve({ data: null, issues: [] }),
      auditSecurity(normalizedUrl),
      html ? auditWordPress(normalizedUrl, html) : Promise.resolve({ data: { isWordPress: false, hasRestApi: false, hasXmlRpc: false, hasReadme: false, hasWpLogin: false, hasWpAdmin: false }, issues: [] }),
    ]);

    const codeResult = html ? auditCode(html) : { data: null, issues: [] };
    const technologies = html ? detectTechnologies(html, responseHeaders) : [];

    // Consolidar issues
    const allIssues = [...avail.issues, ...seoResult.issues, ...linksResult.issues, ...perfResult.issues, ...mobileResult.issues, ...secResult.issues, ...wpResult.issues, ...codeResult.issues];

    // Calcular pontuações
    const { scores, stars } = calculateScores({
      seoIssues: allIssues, performanceData: perfResult.data,
      securityData: secResult.data, mobileData: mobileResult.data,
      brokenLinks: linksResult.brokenLinks, codeIssues: codeResult.issues,
    });

    const { min: valueMin, max: valueMax, complexity } = estimateProjectValue(scores, technologies);

    // Salvar no Supabase (verificar se já existe auditoria)
    const auditPayload = {
      company_id: companyId,
      audited_at: new Date().toISOString(),
      is_online: avail.isOnline,
      has_https: avail.hasHttps,
      ssl_valid: avail.sslValid,
      ssl_expiry_days: avail.sslExpiryDays,
      response_time_ms: avail.responseTimeMs,
      dns_resolves: avail.dnsResolves,
      redirect_count: avail.redirectCount,
      score_seo: scores.scoreSeo,
      score_performance: scores.scorePerformance,
      score_security: scores.scoreSecurity,
      score_mobile: scores.scoreMobile,
      score_accessibility: scores.scoreAccessibility,
      score_code: scores.scoreCode,
      score_general: scores.scoreGeneral,
      stars,
      issues: allIssues,
      technologies,
      seo_data: seoResult.data,
      performance_data: perfResult.data,
      security_data: secResult.data,
      mobile_data: mobileResult.data,
      broken_links: linksResult.brokenLinks,
      wordpress_data: wpResult.data,
      code_data: codeResult.data,
      estimated_value_min: valueMin,
      estimated_value_max: valueMax,
      complexity,
    };

    const { data: existingAudit } = await supabase.from("radar_audits").select("id").eq("company_id", companyId).maybeSingle();

    let auditRow;
    if (existingAudit) {
      const { data, error: updateErr } = await supabase.from("radar_audits").update(auditPayload).eq("id", existingAudit.id).select().single();
      if (updateErr) throw updateErr;
      auditRow = data;
    } else {
      const { data, error: insertErr } = await supabase.from("radar_audits").insert(auditPayload).select().single();
      if (insertErr) throw insertErr;
      auditRow = data;
    }

    await supabase.from("radar_companies").update({ status: "audited" }).eq("id", companyId);

    console.log(`[Radar] ✅ Auditoria concluída: ${normalizedUrl} | Stars: ${stars} | General: ${scores.scoreGeneral}`);
    res.json({ success: true, audit: auditRow });
  } catch (err: any) {
    console.error(`[Radar] ❌ Erro na auditoria de ${normalizedUrl}:`, err);
    await supabase.from("radar_companies").update({ status: "found" }).eq("id", companyId);
    res.status(500).json({ error: "Erro na auditoria", details: err.message });
  }
});

// POST /api/radar/generate-proposal — gerar proposta com IA (Gemini)
app.post("/api/radar/generate-proposal", async (req, res) => {
  const { companyId, auditId } = req.body;
  if (!companyId) { res.status(400).json({ error: "companyId obrigatório" }); return; }

  try {
    const { data: company } = await supabase.from("radar_companies").select("*").eq("id", companyId).single();
    const { data: audit } = await supabase.from("radar_audits").select("*").eq("company_id", companyId).order("audited_at", { ascending: false }).limit(1).single();

    if (!company || !audit) { res.status(404).json({ error: "Empresa ou auditoria não encontrada" }); return; }

    const issues: any[] = Array.isArray(audit.issues) ? audit.issues : [];
    const top5Issues = issues.filter((i: any) => i.severity === "critical").slice(0, 5).map((i: any) => `- ${i.title}: ${i.description}`).join("\n");
    const techs: any[] = Array.isArray(audit.technologies) ? audit.technologies : [];
    const techList = techs.map((t: any) => t.name).join(", ") || "Não detectadas";

    const context = `
Empresa: ${company.name}
Categoria: ${company.category || "Não informada"}
Cidade: ${company.city || ""} - ${company.state || ""}
Website: ${company.website || "Não informado"}
Score Geral: ${audit.score_general}/100
Score SEO: ${audit.score_seo}/100
Score Performance: ${audit.score_performance}/100
Score Segurança: ${audit.score_security}/100
Estrelas como oportunidade: ${audit.stars}/5
Tecnologias detectadas: ${techList}
Principais problemas encontrados:
${top5Issues || "Nenhum problema crítico"}
Estimativa de valor: R$ ${audit.estimated_value_min || 0} – R$ ${audit.estimated_value_max || 0}
Complexidade: ${audit.complexity || "média"}
    `.trim();

    const key = process.env.GEMINI_API_KEY;
    let summary = "", commercial = "", whatsappMsg = "", emailMsg = "", proposal = "";

    if (key && key !== "MY_GEMINI_API_KEY") {
      const genAI = new GoogleGenAI({ apiKey: key, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const systemInstruction = `Você é um especialista em vendas de websites e serviços digitais para pequenos negócios brasileiros. Você analisa auditorias de sites e gera propostas comerciais convincentes em português brasileiro. Seja direto, profissional e persuasivo. Use dados reais da auditoria para justificar cada recomendação.`;

      const [rSum, rWA, rProp] = await Promise.all([
        genAI.models.generateContent({ model: "gemini-2.0-flash", contents: `Com base nesta auditoria, gere:\n1. RESUMO TÉCNICO (2 parágrafos, máx 150 palavras)\n2. RESUMO COMERCIAL (2 parágrafos para leigo, máx 150 palavras)\n\nAuditoria:\n${context}`, config: { systemInstruction, temperature: 0.6 } }),
        genAI.models.generateContent({ model: "gemini-2.0-flash", contents: `Gere uma mensagem de WhatsApp e uma de E-mail para abordar o proprietário de "${company.name}" oferecendo nossos serviços de criação/melhoria de website.\nMensagem WhatsApp: máx 300 caracteres, informal, direto.\nE-mail: Assunto + corpo formal de 3 parágrafos.\n\nContexto:\n${context}`, config: { systemInstruction, temperature: 0.7 } }),
        genAI.models.generateContent({ model: "gemini-2.0-flash", contents: `Gere uma proposta comercial completa (formato Markdown) para "${company.name}" com: Capa/Intro, Diagnóstico do site atual (citar os problemas reais), Nossa Solução, Entregáveis, Investimento (R$ ${audit.estimated_value_min}–R$ ${audit.estimated_value_max}), Prazo estimado, Próximos passos.\n\nAuditoria:\n${context}`, config: { systemInstruction, temperature: 0.6 } }),
      ]);

      const sumText = rSum.text || "";
      const parts = sumText.split("RESUMO COMERCIAL");
      summary = parts[0]?.replace("RESUMO TÉCNICO", "").trim() || sumText;
      commercial = parts[1]?.trim() || "";
      const waText = rWA.text || "";
      const waParts = waText.split(/e-mail:|email:/i);
      whatsappMsg = waParts[0]?.replace(/whatsapp:/i, "").trim() || waText.slice(0, 300);
      emailMsg = waParts[1]?.trim() || "";
      proposal = rProp.text || "";
    } else {
      // Fallback sem IA
      summary = `O website de ${company.name} apresenta score geral de ${audit.score_general}/100, com problemas em SEO (${audit.score_seo}/100), performance (${audit.score_performance}/100) e segurança (${audit.score_security}/100). ${issues.length} problemas foram identificados, sendo ${issues.filter((i:any) => i.severity === "critical").length} críticos.`;
      commercial = `O site atual de ${company.name} pode estar perdendo clientes por problemas técnicos que afetam o posicionamento no Google e a experiência do usuário. Uma intervenção profissional pode reverter esse cenário rapidamente.`;
      whatsappMsg = `Olá! Analisei o site de ${company.name} e encontrei oportunidades de melhoria que podem aumentar seus clientes. Posso te explicar em 5 minutos? 🚀`;
      emailMsg = `Assunto: Diagnóstico gratuito do site ${company.name}\n\nOlá,\n\nRealizamos uma análise técnica do site de ${company.name} e identificamos ${issues.length} pontos de melhoria.\n\nNossos serviços podem transformar seu site em uma ferramenta de captação de clientes.\n\nConfigure a GEMINI_API_KEY para gerar propostas personalizadas com IA.`;
      proposal = `# Proposta Comercial — ${company.name}\n\n## Diagnóstico\n${top5Issues}\n\n## Investimento Estimado\nR$ ${audit.estimated_value_min || 0} – R$ ${audit.estimated_value_max || 0}\n\n*Configure a GEMINI_API_KEY para uma proposta detalhada com IA.*`;
    }

    await supabase.from("radar_audits").update({
      ai_summary: summary, ai_commercial: commercial,
      ai_whatsapp_msg: whatsappMsg, ai_email_msg: emailMsg, ai_proposal: proposal,
    }).eq("id", audit.id);
    await supabase.from("radar_companies").update({ status: "proposal_sent" }).eq("id", companyId);

    res.json({ success: true, summary, commercial, whatsappMsg, emailMsg, proposal });
  } catch (err: any) {
    console.error("[Radar] Erro ao gerar proposta:", err);
    res.status(500).json({ error: "Erro ao gerar proposta", details: err.message });
  }
});

// GET /api/radar/report/:id — dados do relatório
app.get("/api/radar/report/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("radar_companies").select("*, radar_audits(*)").eq("id", req.params.id).single();
    if (error || !data) { res.status(404).json({ error: "Relatório não encontrado" }); return; }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
    
    app.get("*", async (req, res) => {
      const urlPath = req.path.substring(1); // remove leading slash
      const slug = urlPath.split("/")[0].toLowerCase();
      
      // Se for uma requisição de arquivo estático ou rota de API, serve o index.html padrão
      if (slug === "" || slug === "api" || slug.includes(".")) {
        res.sendFile(path.join(distPath, "index.html"));
        return;
      }
      
      try {
        // Busca o tenant no Supabase pelo slug
        const { data: tenantRow } = await supabase
          .from("tenants")
          .select("*")
          .ilike("slug", slug)
          .maybeSingle();
          
        let title = "SeuSiteAlugado - Aluguel de Sites Profissionais";
        let description = "Alugue seu site profissional em apenas 20 segundos com controle de agendamentos, estoque, faturamento e CRM.";
        let logoUrl = "https://seusitealugado.vercel.app/favicon.png";
        
        if (tenantRow) {
          const tenant = await fetchFullTenant(tenantRow);
          title = `${tenant.name} | SeuSiteAlugado`;
          description = tenant.description || description;
          
          // Se for imagem local, aponta para a URL absoluta da Vercel
          if (tenant.logoUrl) {
            if (tenant.logoUrl.startsWith("/src/") || tenant.logoUrl.startsWith("src/")) {
              // Convert local path to absolute vercel public path
              logoUrl = `https://seusitealugado.vercel.app${tenant.logoUrl.replace("/src/assets", "/assets").replace("src/assets", "/assets")}`;
            } else {
              logoUrl = tenant.logoUrl;
            }
          }
        }
        
        // Lê o index.html gerado pelo build do Vite
        let html = fs.readFileSync(path.join(distPath, "index.html"), "utf8");
        
        // Injeta as tags Open Graph/Twitter dinâmicas no <head>
        const ogMetaTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${logoUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${logoUrl}" />
        `;
        
        // Limpa as tags originais do index.html para não duplicar
        html = html.replace(/<title>.*?<\/title>/gi, "");
        html = html.replace(/<meta name="description" content=".*?" \/>/gi, "");
        html = html.replace(/<meta property="og:title" content=".*?" \/>/gi, "");
        html = html.replace(/<meta property="og:description" content=".*?" \/>/gi, "");
        html = html.replace(/<meta property="og:image" content=".*?" \/>/gi, "");
        html = html.replace(/<meta name="twitter:title" content=".*?" \/>/gi, "");
        html = html.replace(/<meta name="twitter:description" content=".*?" \/>/gi, "");
        html = html.replace(/<meta name="twitter:image" content=".*?" \/>/gi, "");
        
        // Insere as novas no topo do <head>
        html = html.replace("<head>", `<head>${ogMetaTags}`);
        
        res.send(html);
      } catch (err) {
        // Fallback caso dê erro na leitura ou banco
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
    console.log("Produção ativa: Servindo arquivos estáticos em /dist com SEO dinâmico.");
  }

  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SiteAlugado] ✅ Servidor rodando na porta ${PORT} — Banco: Supabase`);
    });
  }
}

startServer();

export default app;
