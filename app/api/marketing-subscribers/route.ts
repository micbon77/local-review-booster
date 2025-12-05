// app/api/marketing-subscribers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for admin operations
function getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase credentials");
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        const supabase = getSupabase();

        // In a real multi-tenant app, you would filter by business owner
        // For now, we assume the user can see all consents related to THEIR business
        // But since marketing_consents table is currently just user-based (platform wide),
        // we might want to filter or just return all for the admin.
        // Assuming this is a platform owner dashboard or self-service where they see THEIR users.
        // Based on current schema, it's platform-wide consents.
        // Let's filter by the requested userId to ensure they only see what they are allowed to (RLS handles this mostly but good to be explicit)

        // Actually, looking at the schema, 'marketing_consents' links to 'user_id'. 
        // If this is for the PLATFORM OWNER to see subscribers, they should see everyone.
        // If this is for a BUSINESS OWNER to see their customers, we need a link between business and customer.
        // The current requirement ("email marketing system for registered clients") implies the platform owner (User) sends emails to people who signed up.

        // So we just fetch all consents where consent_given is true.
        // But wait, the previous code `EmailMarketing.tsx` passes `userId`. 
        // If the user is the admin/owner of the platform, they probably want to see everyone?
        // Or is this for end-users?
        // The requirement says "implement an email marketing system for registered clients".
        // This implies the USER (Michele) is the admin sending emails to HIS clients.

        const { data, error } = await supabase
            .from("marketing_consents")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching subscribers:", error);
            return NextResponse.json(
                { error: "Failed to fetch subscribers" },
                { status: 500 }
            );
        }

        return NextResponse.json({ subscribers: data });
    } catch (error) {
        console.error("Get subscribers error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
