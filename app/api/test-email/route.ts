// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Missing email parameter. Use: /api/test-email?email=your@email.com" },
                { status: 400 }
            );
        }

        // Check if API key is configured
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { error: "RESEND_API_KEY not configured" },
                { status: 500 }
            );
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send test email
        const { data, error } = await resend.emails.send({
            from: "Local Review Boost <onboarding@resend.dev>",
            to: [email],
            subject: "Test Email from Local Review Boost",
            html: `
        <h1>Test Email</h1>
        <p>If you received this, Resend is working correctly!</p>
        <p>RESEND_API_KEY is configured: ✅</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
        });

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    details: error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Email sent successfully!",
            data
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
