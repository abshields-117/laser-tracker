require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('treatments').select('*').limit(1);
  console.log(data);
  const { data: d2, error: e2 } = await supabase.from('treatments').select('*, profiles(full_name)').limit(1);
  console.log('e2', e2);
}
run();
