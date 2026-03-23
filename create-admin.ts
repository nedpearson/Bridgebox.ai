import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://0ec90b57d6e95fcbda19832f.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw');
async function main() { const { data, error } = await supabase.auth.signUp({ email: 'nedpearson@gmail.com', password: '1980Colbert$' }); console.log(data, error); } main();
