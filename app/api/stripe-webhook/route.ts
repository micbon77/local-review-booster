
export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            // Get the business ID from metadata
            const businessId = session.metadata?.businessId;

            if (businessId) {
                // Update the business to Pro status
                const { error } = await supabase
                    .from('businesses')
                    .update({ is_pro: true })
                    .eq('id', businessId);

                if (error) {
                    console.error('Error updating business:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }

                console.log(`Business ${businessId} upgraded to Pro`);
            }
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;

            // Handle subscription updates (e.g., cancellation, renewal)
            const businessId = subscription.metadata?.businessId;

            if (businessId) {
                const isPro = subscription.status === 'active';

                const { error } = await supabase
                    .from('businesses')
                    .update({ is_pro: isPro })
                    .eq('id', businessId);

                if (error) {
                    console.error('Error updating subscription status:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }

                console.log(`Business ${businessId} subscription updated: ${isPro ? 'active' : 'inactive'}`);
            }
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            const businessId = subscription.metadata?.businessId;

            if (businessId) {
                const { error } = await supabase
                    .from('businesses')
                    .update({ is_pro: false })
                    .eq('id', businessId);

                if (error) {
                    console.error('Error removing Pro status:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }

                console.log(`Business ${businessId} subscription cancelled`);
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
