import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSave() {
  try {
    // 1. Fetch sallesfit
    console.log('Fetching sallesfit...');
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', 'sallesfit')
      .single();

    if (fetchError) {
      console.error('Error fetching:', fetchError);
      return;
    }

    console.log('Fetched tenant. Modifying description...');
    const originalDesc = tenant.description;
    const testDesc = originalDesc + ' (Test Save ' + Date.now() + ')';

    console.log('Performing upsert...');
    const { data, error: upsertError } = await supabase.from("tenants").upsert({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      owner_name: tenant.owner_name,
      owner_email: tenant.owner_email,
      logo_url: tenant.logo_url,
      banner_url: tenant.banner_url,
      theme_color: tenant.theme_color,
      theme_mode: tenant.theme_mode,
      font_family: tenant.font_family,
      template: tenant.template,
      description: testDesc,
      address: tenant.address,
      opening_hours: tenant.opening_hours,
      socials: tenant.socials,
      map_location: tenant.map_location,
      fidelity_program: tenant.fidelity_program,
      plan: tenant.plan,
      status: tenant.status,
      plan_expiration: tenant.plan_expiration,
      instagram_photos: tenant.instagram_photos || [],
    }, { onConflict: "id" }).select();

    if (upsertError) {
      console.error('Upsert failed:', upsertError);
    } else {
      console.log('Upsert succeeded! Returned:', data);
      
      // Restore original description
      await supabase.from("tenants").upsert({
        ...tenant,
        description: originalDesc
      });
      console.log('Restored original description.');
    }

  } catch (err) {
    console.error('Unhandled exception:', err);
  }
}

testSave();
