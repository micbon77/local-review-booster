// app/api/send-marketing-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { userId, subject, message } = await req.json();

        if (!userId || !subject || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Initialize Resend
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: "RESEND_API_KEY not configured" },
                { status: 500 }
            );
        }
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase credentials");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Fetch active subscribers
        const { data: subscribers, error: dbError } = await supabase
            .from("marketing_consents")
            .select("email, user_id")
            .eq("consent_given", true)
            .is("unsubscribed_at", null);

        if (dbError || !subscribers) {
            return NextResponse.json(
                { error: "Failed to fetch subscribers" },
                { status: 500 }
            );
        }

        if (subscribers.length === 0) {
            return NextResponse.json(
                { message: "No active subscribers found" },
                { status: 200 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localreviewboost.click";

        // Send email to each subscriber (using batching or individual calls)
        // For simplicity and Resend limits, let's look: Resend supports batching.
        // But free tier might have limits. Let's do individual for now or small batches.
        // For this MVP, we loop.

        const emailPromises = subscribers.map(async (sub) => {
            const unsubscribeUrl = `${baseUrl}/unsubscribe?userId=${sub.user_id}`;

            return resend.emails.send({
                from: "Local Review Boost <onboarding@resend.dev>",
                to: [sub.email],
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="${baseUrl}/logo.png" alt="Local Review Boost" style="height: 60px;">
                        </div>
                        
                        <h2 style="color: #2563eb;">${subject}</h2>
                        
                        <div style="white-space: pre-wrap;">${message}</div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
                        
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">
                            Local Review Boost<br>
                            <a href="${baseUrl}" style="color: #2563eb;">localreviewboost.click</a>
                        </p>
                        
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">
                            <a href="${unsubscribeUrl}" style="color: #6b7280;">Annulla iscrizione</a> | 
                            <a href="https://www.iubenda.com/privacy-policy/52538758" style="color: #6b7280;">Privacy Policy</a>
                        </p>
                    </body>
                    </html>
                `,
            });
        });

        await Promise.all(emailPromises);

        return NextResponse.json({
            success: true,
            count: subscribers.length
        });

    } catch (error: any) {
        console.error("Send marketing email error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
