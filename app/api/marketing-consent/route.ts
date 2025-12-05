// app/api/marketing-consent/route.ts
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

export async function POST(req: NextRequest) {
    try {
        const { userId, email, consentGiven } = await req.json();

        if (!userId || !email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = getSupabase();

        // Get client IP and user agent for GDPR compliance
        const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Save consent to database
        const { data, error } = await supabase
            .from("marketing_consents")
            .insert({
                user_id: userId,
                email: email,
                consent_given: consentGiven,
                ip_address: ipAddress,
                user_agent: userAgent,
                consent_date: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving marketing consent:", error);
            return NextResponse.json(
                { error: "Failed to save consent" },
                { status: 500 }
            );
        }

        // If consent given, send welcome email
        if (consentGiven) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-welcome-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, userId }),
                });
            } catch (emailError) {
                console.error("Error sending welcome email:", emailError);
                // Don't fail the request if email fails
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Marketing consent error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
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

        const { data, error } = await supabase
            .from("marketing_consents")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 is "no rows returned"
            console.error("Error fetching consent:", error);
            return NextResponse.json(
                { error: "Failed to fetch consent" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: data || null });
    } catch (error) {
        console.error("Get consent error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        const supabase = getSupabase();

        // Mark as unsubscribed instead of deleting (GDPR compliance)
        const { error } = await supabase
            .from("marketing_consents")
            .update({
                unsubscribed_at: new Date().toISOString(),
                consent_given: false,
            })
            .eq("user_id", userId);

        if (error) {
            console.error("Error unsubscribing:", error);
            return NextResponse.json(
                { error: "Failed to unsubscribe" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
