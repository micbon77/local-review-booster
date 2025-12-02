import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const createClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        // During build time or if env vars are missing, return a dummy or throw a more handled error
        // For build safety, we can return a proxy or just warn if we are in a browser
        if (typeof window === 'undefined') {
            return {} as any; // Mock for server-side build
        }
        console.error("Supabase credentials missing!");
        return createBrowserClient("https://placeholder.supabase.co", "placeholder");
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()
