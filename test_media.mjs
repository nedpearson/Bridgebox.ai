import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/dev/github/business/Bridgebox-ai/.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase.from('bb_enhancement_media').select('*').eq('enhancement_request_id', '4d5b52bc-3a3b-416e-a745-7130b3ffa7b1');
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
