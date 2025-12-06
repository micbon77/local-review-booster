
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS for Admin Stats
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    try {
        // 1. Fetch all users from Auth (limit 100 for safety, or paginate)
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 100
        });

        if (authError) throw authError;

        // 2. Fetch all businesses
        const { data: businesses, error: businessError } = await supabaseAdmin
            .from('businesses')
            .select`
                *,
                feedbacks (count)
            `;

        if (businessError) throw businessError;

        // 3. Merge Data
        const stats = users.map(user => {
            // Find business owned by this user
            const business = businesses?.find(b => b.owner_id === user.id);

            // Determine Pro Status
            // Check if stripe_subscription_id is present and not cancelled (logic simplified)
            const isPro = !!business?.stripe_subscription_id;

            return {
                userId: user.id,
                email: user.email,
                lastSignIn: user.last_sign_in_at,
                businessName: business?.business_name || "N/A",
                businessId: business?.id || null,
                isPro,
                totalFeedbacks: business?.feedbacks ? business.feedbacks[0]?.count || 0 : 0,
                createdAt: user.created_at
            };
        });

        // Filter out my own admin account if desired, or keep it.
        // Let's sort by creation date desc
        stats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ stats });

    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
