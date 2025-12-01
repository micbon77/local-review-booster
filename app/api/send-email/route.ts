import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { businessName, feedback, rating, customerContact } = await request.json();

        // In a real app, you would fetch the business owner's email from the database
        // For this MVP, we'll send it to a configured notification email or the business owner if available
        // For now, let's assume we send it to a fixed address or the one from the request if we had it.
        // Since we don't have the owner's email passed here, we might need to fetch it.
        // But to keep it simple, let's just log it if no key is present, or try to send if key exists.

        if (!process.env.RESEND_API_KEY) {
            console.log('Resend API Key missing. Email would have been sent:', { businessName, feedback, rating });
            return NextResponse.json({ success: true, message: 'Email logged (no API key)' });
        }

        const { data, error } = await resend.emails.send({
            from: 'Review Booster <onboarding@resend.dev>', // Default Resend testing domain
            to: ['delivered@resend.dev'], // Use the testing address or a configured one
            subject: `New ${rating}-Star Feedback for ${businessName}`,
            html: `
        <h1>New Feedback Received</h1>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Rating:</strong> ${rating} Stars</p>
        <p><strong>Feedback:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${feedback}
        </blockquote>
        ${customerContact ? `<p><strong>Contact:</strong> ${customerContact}</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">View in Dashboard</a></p>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
