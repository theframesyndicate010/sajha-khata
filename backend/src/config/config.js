// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();
//import supabase to config with environment variables
import { createClient } from "@supabase/supabase-js";

// Extract Supabase configuration from environment variables
const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.supabase_url;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.anon_key;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.service_role_key || process.env.secret_role_key;

// Format Supabase URL
const supabaseUrl = rawSupabaseUrl?.startsWith("postgresql://")
	? `https://${rawSupabaseUrl.split("@")[1].split(":")[0].replace(/^db\./, "")}`
	: rawSupabaseUrl;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseAdmin = supabaseServiceRoleKey
	? createClient(supabaseUrl, supabaseServiceRoleKey)
	: null;

const createSupabaseUserClient = (accessToken) => {
	if (!accessToken) {
		return supabase;
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		},
		global: {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		}
	});
};

export { supabaseAdmin };
export { createSupabaseUserClient };
export default supabase;