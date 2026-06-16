const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local not found");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExecutions() {
  console.log("Connecting to Supabase:", supabaseUrl);
  const { data, error } = await supabase
    .from("ejecuciones_test")
    .select("id, estado, progreso, iniciado_en, configuracion_json")
    .order("iniciado_en", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching executions:", error);
    return;
  }

  console.log("Latest 5 Executions:");
  console.log(JSON.stringify(data, null, 2));
}

checkExecutions().catch(console.error);
