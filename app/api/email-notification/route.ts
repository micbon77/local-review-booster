import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { businessName, feedback, rating, customerContact } = await request.json();

        // Email notifications are disabled for now
        // To enable: install resend package and configure RESEND_API_KEY
        console.log('Email notification (disabled):', {
            businessName,
            feedback,
            rating,
            customerContact
        });

        return NextResponse.json({
            success: true,
            message: 'Feedback received. Email notifications are currently disabled.'
        });
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
