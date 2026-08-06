/**
 * api/index.ts — Vercel Serverless Function
 * Entrypoint para todas as rotas /api/* na Vercel.
 * NÃO importa server.ts (evitar Vite middleware / startServer side-effects).
 */

import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ limit: "5mb" }));

// ── Supabase ─────────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ── Mappers (snake_case → camelCase) ─────────────────────────

function mapService(s: any) {
  return { id: s.id, name: s.name, description: s.description || "", price: Number(s.price), duration: s.duration || 0, imageUrl: s.image_url || "" };
}
function mapCrmClient(c: any) {
  return { id: c.id, name: c.name, phone: c.phone || "", email: c.email || "", cpf: c.cpf, birthday: c.birthday, notes: c.notes, pipelineStage: c.pipeline_stage || "lead", points: c.points || 0, cashback: Number(c.cashback) || 0, createdAt: c.created_at || new Date().toISOString() };
}
function mapBooking(b: any) {
  return { id: b.id, clientName: b.client_name, clientPhone: b.client_phone || "", clientEmail: b.client_email || "", serviceId: b.service_id || "", dateTime: b.date_time, status: b.status || "pending", notes: b.notes };
}
function mapFinanceEntry(f: any) {
  return { id: f.id, type: f.type, category: f.category || "", amount: Number(f.amount), date: f.date, description: f.description || "", paymentMethod: f.payment_method || "pix" };
}
function mapPayable(p: any) {
  return { id: p.id, title: p.title, dueDate: p.due_date, amount: Number(p.amount), status: p.status || "pending" };
}
function mapReceivable(r: any) {
  return { id: r.id, clientName: r.client_name, serviceName: r.service_name || "", amount: Number(r.amount), dueDate: r.due_date, status: r.status || "pending" };
}
function mapInventoryItem(i: any) {
  return { id: i.id, code: i.code || "", name: i.name, category: i.category || "", quantity: i.quantity || 0, minQuantity: i.min_quantity || 0, supplier: i.supplier || "", costPrice: Number(i.cost_price) || 0, salePrice: Number(i.sale_price) || 0 };
}
function mapCampaign(c: any) {
  return { id: c.id, code: c.code, discount: Number(c.discount), type: c.type || "percent", title: c.title || "", isActive: c.is_active || false };
}
function mapReview(r: any) {
  return { id: r.id, author: r.author, rating: r.rating, comment: r.comment || "", date: r.date, approved: r.approved || false };
}
function mapProductToSell(p: any) {
  return { id: p.id, name: p.name, description: p.description || "", price: Number(p.price), imageUrl: p.image_url || "" };
}

async function fetchFullTenant(tenantRow: any) {
  const id = tenantRow.id;
  const [
    { data: services }, { data: crmClients }, { data: bookings },
    { data: financeEntries }, { data: payables }, { data: receivables },
    { data: inventory }, { data: campaigns }, { data: reviews }, { data: productsToSell },
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

  return {
    id: tenantRow.id,
    slug: tenantRow.slug,
    name: tenantRow.name,
    ownerName: tenantRow.owner_name,
    ownerEmail: tenantRow.owner_email,
    logoUrl: tenantRow.logo_url || "",
    bannerUrl: tenantRow.banner_url || "",
    themeColor: tenantRow.theme_color || "amber",
    themeMode: tenantRow.theme_mode || "dark",
    fontFamily: tenantRow.font_family || "sans",
    template: tenantRow.template || "modern",
    description: tenantRow.description || "",
    address: tenantRow.address || "",
    openingHours: tenantRow.opening_hours || "",
    socials: tenantRow.socials || {},
    mapLocation: tenantRow.map_location || "",
    fidelityProgram: tenantRow.fidelity_program || { type: "points", rate: 1, rule: "" },
    plan: tenantRow.plan || "basic",
    status: tenantRow.status || "active",
    createdAt: tenantRow.created_at || new Date().toISOString(),
    planExpiration: tenantRow.plan_expiration || new Date().toISOString(),
    services: (services || []).map(mapService),
    crmClients: (crmClients || []).map(mapCrmClient),
    bookings: (bookings || []).map(mapBooking),
    finance: {
      entries: (financeEntries || []).map(mapFinanceEntry),
      payables: (payables || []).map(mapPayable),
      receivables: (receivables || []).map(mapReceivable),
    },
    inventory: (inventory || []).map(mapInventoryItem),
    marketingCampaigns: (campaigns || []).map(mapCampaign),
    reviews: (reviews || []).map(mapReview),
    productsToSell: (productsToSell || []).map(mapProductToSell),
    instagramPhotos: tenantRow.instagram_photos || [],
    customForm: tenantRow.custom_form || undefined,
    paymentConfig: tenantRow.payment_config || undefined,
    seoAnalyticsConfig: tenantRow.seo_analytics_config || undefined,
    whatsappWidgetConfig: tenantRow.whatsapp_widget_config || undefined,
    formSubmissions: tenantRow.form_submissions || [],
  };
}

async function saveTenantToSupabase(updatedTenant: any): Promise<void> {
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

  updatedTenant.id = tenantId;

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
    instagram_photos: updatedTenant.instagramPhotos || [],
    custom_form: updatedTenant.customForm || null,
    payment_config: updatedTenant.paymentConfig || null,
    seo_analytics_config: updatedTenant.seoAnalyticsConfig || null,
    whatsapp_widget_config: updatedTenant.whatsappWidgetConfig || null,
    form_submissions: updatedTenant.formSubmissions || [],
  };

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

  // Limpar e reinserir dados relacionados
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

  const insertOps: Promise<any>[] = [];

  if (updatedTenant.services?.length) {
    insertOps.push(supabase.from("services").insert(updatedTenant.services.map((s: any) => ({ id: s.id, tenant_id: tenantId, name: s.name, description: s.description, price: s.price, duration: s.duration || 0, image_url: s.imageUrl || null }))));
  }
  if (updatedTenant.crmClients?.length) {
    insertOps.push(supabase.from("crm_clients").insert(updatedTenant.crmClients.map((c: any) => ({ id: c.id, tenant_id: tenantId, name: c.name, phone: c.phone, email: c.email, cpf: c.cpf || null, birthday: c.birthday || null, notes: c.notes || null, pipeline_stage: c.pipelineStage || "lead", points: c.points || 0, cashback: c.cashback || 0 }))));
  }
  if (updatedTenant.bookings?.length) {
    insertOps.push(supabase.from("bookings").insert(updatedTenant.bookings.map((b: any) => ({ id: b.id, tenant_id: tenantId, client_name: b.clientName, client_phone: b.clientPhone || null, client_email: b.clientEmail || null, service_id: b.serviceId || null, date_time: b.dateTime, status: b.status || "pending", notes: b.notes || null }))));
  }
  if (updatedTenant.finance?.entries?.length) {
    insertOps.push(supabase.from("finance_entries").insert(updatedTenant.finance.entries.map((f: any) => ({ id: f.id, tenant_id: tenantId, type: f.type, category: f.category || null, amount: f.amount, date: f.date, description: f.description || null, payment_method: f.paymentMethod || null }))));
  }
  if (updatedTenant.finance?.payables?.length) {
    insertOps.push(supabase.from("finance_payables").insert(updatedTenant.finance.payables.map((p: any) => ({ id: p.id, tenant_id: tenantId, title: p.title, due_date: p.dueDate, amount: p.amount, status: p.status || "pending" }))));
  }
  if (updatedTenant.finance?.receivables?.length) {
    insertOps.push(supabase.from("finance_receivables").insert(updatedTenant.finance.receivables.map((r: any) => ({ id: r.id, tenant_id: tenantId, client_name: r.clientName, service_name: r.serviceName || null, amount: r.amount, due_date: r.dueDate, status: r.status || "pending" }))));
  }
  if (updatedTenant.inventory?.length) {
    insertOps.push(supabase.from("inventory").insert(updatedTenant.inventory.map((i: any) => ({ id: i.id, tenant_id: tenantId, code: i.code || null, name: i.name, category: i.category || null, quantity: i.quantity || 0, min_quantity: i.minQuantity || 0, supplier: i.supplier || null, cost_price: i.costPrice || 0, sale_price: i.salePrice || 0 }))));
  }
  if (updatedTenant.marketingCampaigns?.length) {
    insertOps.push(supabase.from("marketing_campaigns").insert(updatedTenant.marketingCampaigns.map((c: any) => ({ id: c.id, tenant_id: tenantId, code: c.code, discount: c.discount, type: c.type, title: c.title, is_active: c.isActive }))));
  }
  if (updatedTenant.reviews?.length) {
    insertOps.push(supabase.from("reviews").insert(updatedTenant.reviews.map((r: any) => ({ id: r.id, tenant_id: tenantId, author: r.author, rating: r.rating, comment: r.comment || "", date: r.date, approved: r.approved || false }))));
  }
  if (updatedTenant.productsToSell?.length) {
    insertOps.push(supabase.from("products_to_sell").insert(updatedTenant.productsToSell.map((p: any) => ({ id: p.id, tenant_id: tenantId, name: p.name, description: p.description || null, price: p.price, image_url: p.imageUrl || null }))));
  }

  await Promise.all(insertOps);
}

// ── Rotas ─────────────────────────────────────────────────────

// GET /api/tenants
app.get("/api/tenants", async (req, res) => {
  try {
    const { data: tenantRows, error } = await supabase.from("tenants").select("*").order("created_at");
    if (error) throw error;
    const tenants = await Promise.all((tenantRows || []).map(fetchFullTenant));
    res.json(tenants);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao buscar tenants", details: err.message });
  }
});

// GET /api/tenants/:slug
app.get("/api/tenants/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase.from("tenants").select("*").ilike("slug", slug).single();
    if (error || !tenantRow) { res.status(404).json({ error: "Tenant não encontrado" }); return; }
    res.json(await fetchFullTenant(tenantRow));
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao buscar tenant", details: err.message });
  }
});

// GET /api/check-slug/:slug
app.get("/api/check-slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().replace(/[^a-z0-9\-]/g, "");
    if (!slug || slug.length < 3) { res.json({ available: false, reason: "Slug deve ter pelo menos 3 caracteres" }); return; }
    const { data: tenantRow } = await supabase.from("tenants").select("id").ilike("slug", slug).maybeSingle();
    res.json({ available: !tenantRow, slug });
  } catch (err: any) {
    res.status(500).json({ available: false, reason: err.message });
  }
});

// POST /api/tenants
app.post("/api/tenants", async (req, res) => {
  const updatedTenant = req.body;
  if (!updatedTenant.slug) { res.status(400).json({ error: "Slug é obrigatório" }); return; }
  try {
    await saveTenantToSupabase(updatedTenant);
    res.json({ success: true, tenant: updatedTenant });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao salvar tenant", details: err.message });
  }
});

// POST /api/tenants/:slug/bookings
app.post("/api/tenants/:slug/bookings", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase.from("tenants").select("id").ilike("slug", slug).single();
    if (error || !tenantRow) { res.status(404).json({ error: "Tenant não encontrado" }); return; }
    const newBooking = req.body;
    const tenantId = tenantRow.id;
    const { error: bookingError } = await supabase.from("bookings").insert({
      id: newBooking.id || ("b-" + Date.now()), tenant_id: tenantId,
      client_name: newBooking.clientName, client_phone: newBooking.clientPhone,
      client_email: newBooking.clientEmail, service_id: newBooking.serviceId || null,
      date_time: newBooking.dateTime, status: newBooking.status || "pending", notes: newBooking.notes || null,
    });
    if (bookingError) throw bookingError;
    const { data: existingClients } = await supabase.from("crm_clients").select("id").eq("tenant_id", tenantId).or(`phone.eq.${newBooking.clientPhone},email.eq.${newBooking.clientEmail}`).limit(1);
    if (!existingClients || existingClients.length === 0) {
      const { data: serviceRow } = await supabase.from("services").select("name, price").eq("id", newBooking.serviceId).single();
      const servicePrice = Number(serviceRow?.price) || 0;
      await supabase.from("crm_clients").insert({ id: "cli-" + Date.now(), tenant_id: tenantId, name: newBooking.clientName, phone: newBooking.clientPhone, email: newBooking.clientEmail, pipeline_stage: "lead", notes: "Registrado automaticamente via agendamento.", points: Math.floor(servicePrice), cashback: Math.floor(servicePrice * 0.05) });
    }
    res.json({ success: true, booking: newBooking });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao criar agendamento", details: err.message });
  }
});

// POST /api/tenants/:slug/reviews
app.post("/api/tenants/:slug/reviews", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { data: tenantRow, error } = await supabase.from("tenants").select("id").ilike("slug", slug).single();
    if (error || !tenantRow) { res.status(404).json({ error: "Tenant não encontrado" }); return; }
    const newReview = req.body;
    const { error: reviewError } = await supabase.from("reviews").insert({ id: newReview.id || ("rev-" + Date.now()), tenant_id: tenantRow.id, author: newReview.author, rating: newReview.rating, comment: newReview.comment || "", date: newReview.date || new Date().toISOString().split("T")[0], approved: newReview.approved || false });
    if (reviewError) throw reviewError;
    res.json({ success: true, review: newReview });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao adicionar avaliação", details: err.message });
  }
});

// POST /api/super/status
app.post("/api/super/status", async (req, res) => {
  try {
    const { tenantId, status, plan, planExpiration, deleteTenant } = req.body;
    if (deleteTenant) {
      const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
      if (error) throw error;
      res.json({ success: true, deleted: true }); return;
    }
    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (plan) updates.plan = plan;
    if (planExpiration) updates.plan_expiration = planExpiration;
    const { data: t, error } = await supabase.from("tenants").update(updates).eq("id", tenantId).select().single();
    if (error || !t) { res.status(404).json({ error: "Tenant não encontrado" }); return; }
    res.json({ success: true, tenant: t });
  } catch (err: any) {
    res.status(500).json({ error: "Erro na ação administrativa", details: err.message });
  }
});

// POST /api/gemini/assist — fallback sem IA real
app.post("/api/gemini/assist", async (req, res) => {
  res.json({ text: "Configure a GEMINI_API_KEY nas variáveis de ambiente para usar o assistente de IA." });
});

export default app;