# Local Review Booster - Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email (Optional - for negative feedback notifications)
RESEND_API_KEY=your_resend_api_key
```

## Database Setup

### 1. Create Supabase Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  google_maps_link TEXT NOT NULL,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies for feedbacks
CREATE POLICY "Business owners can view their feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedbacks.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert feedback"
  ON feedbacks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Business owners can delete their feedbacks"
  ON feedbacks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedbacks.business_id
      AND businesses.owner_id = auth.uid()
    )
  );
```

### 2. Add is_pro Column (if not exists)

If you already have the businesses table, add the `is_pro` column:

```sql
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
```

## Stripe Setup

### 1. Create a Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the Dashboard

### 2. Set Up Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 3. Test Webhook Locally
Use Stripe CLI for local testing:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Email Notifications Setup (Optional)

### 1. Create Resend Account
- Sign up at [resend.com](https://resend.com)
- Get your API key
- Add it to `.env.local` as `RESEND_API_KEY`

### 2. Configure Email Route
The email notification is sent automatically when a customer leaves a 1-3 star review.

To customize the recipient email, edit `app/api/send-email/route.ts`:

```typescript
const { data, error } = await resend.emails.send({
  from: 'Review Booster <onboarding@resend.dev>',
  to: ['your-business-email@example.com'], // Change this
  subject: `New ${rating}-Star Feedback for ${businessName}`,
  // ...
});
```

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy
5. Update `NEXT_PUBLIC_BASE_URL` to your Vercel domain
6. Update Stripe webhook URL to `https://yourdomain.vercel.app/api/stripe-webhook`

## Features

- ✅ Multi-language support (EN, FR, ES, PT, DE, IT)
- ✅ QR code generation for customer reviews
- ✅ Automatic routing (positive → Google, negative → private feedback)
- ✅ Multi-business support
- ✅ Analytics dashboard
- ✅ Stripe subscription integration
- ✅ Email notifications for negative feedback
- ✅ PDF poster download for QR codes

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)
