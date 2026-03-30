import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lnasaqcmrnheldnnewob.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuYXNhcWNtcm5oZWxkbm5ld29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzI5NDQsImV4cCI6MjA4OTgwODk0NH0.Kcl5S5LR6O3ZbqNkfpSeA6ZT0h-7ggmNZ4HlZof-JaQ"
);

async function test() {
   const { data, error } = await supabase.auth.signInWithPassword({
     email: "nedpearson@gmail.com",
     password: "1980Colbert$"
   });
   
   console.log("Login Result:", error ? error.message : "Success " + data.user.email);
   
   if (error) {
       console.log("Attempting to recreate user...");
       const { data: d2, error: e2 } = await supabase.auth.signUp({
           email: "nedpearson@gmail.com",
           password: "1980Colbert$"
       });
       console.log("Signup Result:", e2 ? e2.message : "Success " + d2.user?.email);
   }
}

test();
