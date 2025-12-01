// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
    });

    return NextResponse.json({ id: session.id });
}
