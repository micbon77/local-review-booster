// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia", // Use latest API version
});

export async function POST(req: Request) {
    try {
        const { businessId, email } = await req.json();

        if (!businessId || !email) {
            return NextResponse.json({ error: "Missing businessId or email" }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Review Booster Pro",
                            description: "Unlimited feedbacks and advanced analytics",
                        },
                        unit_amount: 999, // $9.99
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
            customer_email: email,
            metadata: {
                businessId: businessId,
            },
            subscription_data: {
                metadata: {
                    businessId: businessId,
                },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Stripe error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
