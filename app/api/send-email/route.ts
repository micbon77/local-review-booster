import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { businessName, feedback, rating, customerContact } = await request.json();

        // Check if Resend is available
        if (!process.env.RESEND_API_KEY) {
            console.log('Resend API Key missing. Email notification skipped:', { businessName, feedback, rating });
            return NextResponse.json({
                success: true,
                message: 'Feedback received (email notification disabled)'
            });
        }

        // Dynamically import Resend only if API key is present
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

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
    } catch (error: any) {
        console.error('Email error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
