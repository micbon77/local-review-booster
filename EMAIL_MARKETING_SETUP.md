# Email Marketing Setup Instructions

## ✅ What's Been Implemented

1. **Marketing Consent Checkbox** - Added to signup form
2. **Database Schema** - `marketing_consents` table
3. **API Routes** - Consent management and email sending
4. **Welcome Email** - Automated via Resend
5. **Unsubscribe Page** - GDPR-compliant one-click unsubscribe

---

## 🚀 Setup Steps

### 1. Run Database Migration

Go to your **Supabase SQL Editor** and run the SQL in `MARKETING_SETUP.sql`:

```bash
# File location:
local-review-booster/MARKETING_SETUP.sql
```

This creates the `marketing_consents` table with RLS policies.

### 2. Add Environment Variable to Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add:
```
RESEND_API_KEY=re_T9of5Rvi_2dzwrRpJUR9hsjneLrdDZozv
```

**Important:** Add for **Production**, **Preview**, and **Development** environments.

### 3. Redeploy on Vercel

After adding the environment variable:
- Go to **Deployments** tab
- Click **"..."** on the latest deployment
- Click **"Redeploy"**

Or push any change to trigger auto-deploy.

### 4. (Optional) Verify Your Domain in Resend

Currently using Resend's test domain (`onboarding@resend.dev`).

To use your own domain:
1. Go to https://resend.com/domains
2. Add `localreviewboost.click`
3. Add DNS records (SPF, DKIM, DMARC)
4. Update `from` address in `/app/api/send-welcome-email/route.ts`:
   ```typescript
   from: "Local Review Boost <noreply@localreviewboost.click>"
   ```

---

## 📧 How It Works

### User Signup Flow:
1. User fills signup form
2. Checks "Acconsento a ricevere email marketing"
3. Account created in Supabase Auth
4. Consent saved to `marketing_consents` table with:
   - User ID
   - Email
   - IP address (GDPR compliance)
   - User agent
   - Timestamp
5. Welcome email sent via Resend
6. User receives email with:
   - Welcome message
   - Getting started guide
   - Unsubscribe link

### Unsubscribe Flow:
1. User clicks "Annulla iscrizione" in email
2. Redirected to `/unsubscribe?userId=xxx`
3. Consent marked as `unsubscribed_at` (not deleted - GDPR compliance)
4. User sees confirmation message

---

## 🧪 Testing

### Test Signup with Consent:
1. Go to `/login`
2. Click "Need an account? Sign Up"
3. Fill email and password
4. **Check** the marketing consent checkbox
5. Submit form
6. Check email for welcome message

### Test Unsubscribe:
1. Open welcome email
2. Click "Annulla iscrizione" at bottom
3. Should see success message
4. Try signing up again - can re-subscribe

---

## 📊 Monitoring

### Check Consents in Supabase:
```sql
SELECT * FROM marketing_consents 
ORDER BY created_at DESC;
```

### Check Emails in Resend:
- Go to https://resend.com/emails
- View sent emails, delivery status, opens, clicks

---

## 🔒 GDPR Compliance

✅ **Explicit Consent** - Checkbox required, not pre-checked
✅ **IP & User Agent** - Stored for proof of consent
✅ **Privacy Policy Link** - Visible next to checkbox
✅ **Unsubscribe Link** - In every email (one-click)
✅ **Data Retention** - Unsubscribe marks record, doesn't delete
✅ **Iubenda Integration** - Consent Database tracks all consents

---

## 🎯 Next Steps (Optional)

1. **Create More Email Templates**:
   - Weekly stats email
   - Upgrade to Pro promotion
   - Monthly newsletter

2. **Add Email Preferences to Dashboard**:
   - View consent status
   - Manage email frequency
   - Re-subscribe option

3. **Analytics**:
   - Track email open rates
   - Monitor unsubscribe rate
   - A/B test subject lines

---

## 🆘 Troubleshooting

### Emails Not Sending?
- Check `RESEND_API_KEY` in Vercel env vars
- Check Resend dashboard for errors
- Verify email address format

### Consent Not Saving?
- Check `marketing_consents` table exists
- Check RLS policies are enabled
- Check browser console for API errors

### Unsubscribe Not Working?
- Check userId parameter in URL
- Check API route `/api/marketing-consent` DELETE method
- Check Supabase logs

---

## 📝 Files Modified/Created

- ✅ `package.json` - Added `resend` dependency
- ✅ `components/MarketingConsentCheckbox.tsx` - Consent checkbox component
- ✅ `app/login/page.tsx` - Added consent checkbox to signup
- ✅ `app/api/marketing-consent/route.ts` - Consent management API
- ✅ `app/api/send-welcome-email/route.ts` - Welcome email sender
- ✅ `app/unsubscribe/page.tsx` - Unsubscribe page
- ✅ `MARKETING_SETUP.sql` - Database migration

---

**All set! 🎉** Your email marketing system is ready to use.
