import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions (snake_case -> camelCase)
function mapService(s) {
  return { id: s.id, name: s.name, description: s.description || "", price: Number(s.price), duration: s.duration || 0, imageUrl: s.image_url || "" };
}
function mapCrmClient(c) {
  return { id: c.id, name: c.name, phone: c.phone || "", email: c.email || "", cpf: c.cpf, birthday: c.birthday, notes: c.notes, pipelineStage: c.pipeline_stage || "lead", points: c.points || 0, cashback: Number(c.cashback) || 0, createdAt: c.created_at || new Date().toISOString() };
}
function mapBooking(b) {
  return { id: b.id, clientName: b.client_name, clientPhone: b.client_phone || "", clientEmail: b.client_email || "", serviceId: b.service_id || "", dateTime: b.date_time, status: b.status || "pending", notes: b.notes };
}
function mapFinanceEntry(f) {
  return { id: f.id, type: f.type, category: f.category || "", amount: Number(f.amount), date: f.date, description: f.description || "", paymentMethod: f.payment_method || "pix" };
}
function mapPayable(p) {
  return { id: p.id, title: p.title, dueDate: p.due_date, amount: Number(p.amount), status: p.status || "pending" };
}
function mapReceivable(r) {
  return { id: r.id, clientName: r.client_name, serviceName: r.service_name || "", amount: Number(r.amount), dueDate: r.due_date, status: r.status || "pending" };
}
function mapInventoryItem(i) {
  return { id: i.id, code: i.code || "", name: i.name, category: i.category || "", quantity: i.quantity || 0, minQuantity: i.min_quantity || 0, supplier: i.supplier || "", costPrice: Number(i.cost_price) || 0, salePrice: Number(i.sale_price) || 0 };
}
function mapCampaign(c) {
  return { id: c.id, code: c.code, discount: Number(c.discount), type: c.type || "percent", title: c.title || "", isActive: c.is_active || false };
}
function mapReview(r) {
  return { id: r.id, author: r.author, rating: r.rating, comment: r.comment || "", date: r.date, approved: r.approved || false };
}
function mapProductToSell(p) {
  return { id: p.id, name: p.name, description: p.description || "", price: Number(p.price), imageUrl: p.image_url || "" };
}

async function fetchFullTenant(tenantRow) {
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
  };
}

async function saveTenantToSupabase(updatedTenant) {
  const tenantId = updatedTenant.id;

  console.log('Upserting tenant row...');
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
    instagram_photos: updatedTenant.instagramPhotos || [],
  }, { onConflict: "id" });

  if (tenantError) {
    console.error('ERROR upserting tenant:', tenantError);
    throw tenantError;
  }
  console.log('Tenant upserted OK.');

  console.log('Deleting related tables...');
  const deleteResults = await Promise.all([
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
  deleteResults.forEach((res, i) => {
    if (res.error) console.error(`Delete error on table ${i}:`, res.error);
  });
  console.log('Deleted OK.');

  const insertOps = [];

  if (updatedTenant.services?.length) {
    console.log(`Inserting ${updatedTenant.services.length} services...`);
    insertOps.push(supabase.from("services").insert(updatedTenant.services.map(s => ({ id: s.id, tenant_id: tenantId, name: s.name, description: s.description, price: s.price, duration: s.duration || 0, image_url: s.imageUrl || null }))));
  }
  if (updatedTenant.crmClients?.length) {
    console.log(`Inserting ${updatedTenant.crmClients.length} crmClients...`);
    insertOps.push(supabase.from("crm_clients").insert(updatedTenant.crmClients.map(c => ({ id: c.id, tenant_id: tenantId, name: c.name, phone: c.phone, email: c.email, cpf: c.cpf || null, birthday: c.birthday || null, notes: c.notes || null, pipeline_stage: c.pipelineStage || "lead", points: c.points || 0, cashback: c.cashback || 0 }))));
  }
  if (updatedTenant.bookings?.length) {
    console.log(`Inserting ${updatedTenant.bookings.length} bookings...`);
    insertOps.push(supabase.from("bookings").insert(updatedTenant.bookings.map(b => ({ id: b.id, tenant_id: tenantId, client_name: b.clientName, client_phone: b.clientPhone || null, client_email: b.clientEmail || null, service_id: b.serviceId || null, date_time: b.dateTime, status: b.status || "pending", notes: b.notes || null }))));
  }
  if (updatedTenant.finance?.entries?.length) {
    console.log(`Inserting ${updatedTenant.finance.entries.length} finance entries...`);
    insertOps.push(supabase.from("finance_entries").insert(updatedTenant.finance.entries.map(f => ({ id: f.id, tenant_id: tenantId, type: f.type, category: f.category || null, amount: f.amount, date: f.date, description: f.description || null, payment_method: f.paymentMethod || null }))));
  }
  if (updatedTenant.finance?.payables?.length) {
    console.log(`Inserting ${updatedTenant.finance.payables.length} payables...`);
    insertOps.push(supabase.from("finance_payables").insert(updatedTenant.finance.payables.map(p => ({ id: p.id, tenant_id: tenantId, title: p.title, due_date: p.dueDate, amount: p.amount, status: p.status || "pending" }))));
  }
  if (updatedTenant.finance?.receivables?.length) {
    console.log(`Inserting ${updatedTenant.finance.receivables.length} receivables...`);
    insertOps.push(supabase.from("finance_receivables").insert(updatedTenant.finance.receivables.map(r => ({ id: r.id, tenant_id: tenantId, client_name: r.clientName, service_name: r.serviceName || null, amount: r.amount, due_date: r.dueDate, status: r.status || "pending" }))));
  }
  if (updatedTenant.inventory?.length) {
    console.log(`Inserting ${updatedTenant.inventory.length} inventory items...`);
    insertOps.push(supabase.from("inventory").insert(updatedTenant.inventory.map(i => ({ id: i.id, tenant_id: tenantId, code: i.code || null, name: i.name, category: i.category || null, quantity: i.quantity || 0, min_quantity: i.minQuantity || 0, supplier: i.supplier || null, cost_price: i.costPrice || 0, sale_price: i.salePrice || 0 }))));
  }
  if (updatedTenant.marketingCampaigns?.length) {
    console.log(`Inserting ${updatedTenant.marketingCampaigns.length} campaigns...`);
    insertOps.push(supabase.from("marketing_campaigns").insert(updatedTenant.marketingCampaigns.map(c => ({ id: c.id, tenant_id: tenantId, code: c.code, discount: c.discount, type: c.type, title: c.title, is_active: c.isActive }))));
  }
  if (updatedTenant.reviews?.length) {
    console.log(`Inserting ${updatedTenant.reviews.length} reviews...`);
    insertOps.push(supabase.from("reviews").insert(updatedTenant.reviews.map(r => ({ id: r.id, tenant_id: tenantId, author: r.author, rating: r.rating, comment: r.comment || "", date: r.date, approved: r.approved || false }))));
  }
  if (updatedTenant.productsToSell?.length) {
    console.log(`Inserting ${updatedTenant.productsToSell.length} productsToSell...`);
    insertOps.push(supabase.from("products_to_sell").insert(updatedTenant.productsToSell.map(p => ({ id: p.id, tenant_id: tenantId, name: p.name, description: p.description || null, price: p.price, image_url: p.imageUrl || null }))));
  }

  const results = await Promise.all(insertOps);
  results.forEach((res, i) => {
    if (res.error) {
      console.error(`ERROR inserting batch ${i}:`, res.error);
    }
  });
  console.log('All inserts done.');
}

async function test() {
  console.log('Buscando tenant "sallesfit"...');
  const { data: tenantRow, error } = await supabase.from('tenants').select('*').eq('slug', 'sallesfit').single();
  if (error) {
    console.error('Erro buscando tenant:', error);
    return;
  }
  if (!tenantRow) {
    console.log('Tenant "sallesfit" não encontrado no banco.');
    return;
  }
  console.log('Tenant encontrado:', tenantRow.id, tenantRow.name);
  const tenant = await fetchFullTenant(tenantRow);
  console.log('Tenant carregado. Executando saveTenantToSupabase...');
  await saveTenantToSupabase(tenant);
  console.log('\n✅ Teste concluído com sucesso!');
}

test().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
