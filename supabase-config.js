// ─────────────────────────────────────────────────────────────
// Supabase connection config
// Get these two values from: Supabase Dashboard → Project Settings → API
// Note to self: I created the Supabase account using my TUKS email
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://qslwqmnvpzstyglrqita.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wYITM9wrhhB6GWkI7MjK7w_383i-6Nr";
const SUPABASE_DB_PASS = "eLm3yvUW4jfuwvGN";

// This creates a global `supabaseClient` that every page's script uses.
// It relies on the Supabase CDN script being loaded first (see <script> tags
// in each HTML file).
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
