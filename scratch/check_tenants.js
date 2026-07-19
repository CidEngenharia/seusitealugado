import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*');

  if (error) {
    console.error('Error fetching tenants:', error);
  } else {
    console.log('Total tenants in database:', data.length);
    console.log('Tenants:', data.map(t => ({ id: t.id, slug: t.slug, name: t.name })));
  }
}

check();
