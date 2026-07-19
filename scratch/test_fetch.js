import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  try {
    const { data: tenantRows, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at');
    
    if (error) {
      console.error('Error fetching tenants:', error);
      return;
    }

    const tenantRow = tenantRows.find(t => t.slug === 'sallesfit');
    if (!tenantRow) {
      console.error('sallesfit not found');
      return;
    }

    console.log('Found tenant sallesfit. Querying related tables...');

    const id = tenantRow.id;
    const results = await Promise.all([
      supabase.from("services").select("*").eq("tenant_id", id),
      supabase.from("crm_clients").select("*").eq("tenant_id", id),
      supabase.from("bookings").select("*").eq("tenant_id", id),
      supabase.from("finance_entries").select("*").eq("tenant_id", id),
      supabase.from("finance_payables").select("*").eq("tenant_id", id),
      supabase.from("finance_receivables").select("*").eq("tenant_id", id),
      supabase.from("inventory").select("*").eq("tenant_id", id),
      supabase.from("marketing_campaigns").select("*").eq("tenant_id", id),
      supabase.from("reviews").select("*").eq("tenant_id", id),
      supabase.from("products_to_sell").select("*").eq("tenant_id", id),
    ]);

    const tableNames = [
      "services", "crm_clients", "bookings", "finance_entries", 
      "finance_payables", "finance_receivables", "inventory", 
      "marketing_campaigns", "reviews", "products_to_sell"
    ];

    results.forEach((res, index) => {
      if (res.error) {
        console.error(`Error on table ${tableNames[index]}:`, res.error);
      } else {
        console.log(`Table ${tableNames[index]}: success, row count =`, res.data.length);
      }
    });

  } catch (err) {
    console.error('Unhandled exception:', err);
  }
}

testFetch();
