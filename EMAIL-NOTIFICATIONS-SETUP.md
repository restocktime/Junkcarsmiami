# Email Notifications Setup Guide

Get email notifications at **buyjunkcarmiami@gmail.com** whenever someone submits a lead!

## Quick Setup (5 minutes)

### Option 1: Resend (Recommended - FREE)

Resend offers 100 free emails per day, perfect for lead notifications.

#### Step 1: Create Resend Account
1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address

#### Step 2: Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Miami Junk Car Leads"
4. Copy the API key (starts with `re_`)

#### Step 3: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Click on your "junkcarsmiami" project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Paste your API key (re_xxxxx)
   - Click **Save**

#### Step 4: Verify Domain (Optional but Recommended)
1. In Resend dashboard, go to **Domains**
2. Click "Add Domain"
3. Enter: `buyjunkcarmiami.com`
4. Follow DNS instructions to verify
5. Once verified, emails will come from `leads@buyjunkcarmiami.com`

**If you skip domain verification:** Emails will come from `onboarding@resend.dev` (still works!)

#### Step 5: Redeploy
1. In Vercel dashboard, go to **Deployments**
2. Click the three dots on latest deployment
3. Click **Redeploy**
4. Wait 2 minutes

✅ **Done!** You'll now get emails for every lead.

---

### Option 2: SendGrid (Alternative)

SendGrid offers 100 free emails per day.

#### Step 1: Create SendGrid Account
1. Go to https://signup.sendgrid.com/
2. Sign up (free tier)
3. Verify your email

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it: "Miami Leads"
4. Select "Full Access"
5. Copy the API key (starts with `SG.`)

#### Step 3: Add to Vercel
1. Go to Vercel → Settings → Environment Variables
2. Add:
   - **Name:** `SENDGRID_API_KEY`
   - **Value:** Your API key
   - Click **Save**

#### Step 4: Verify Sender
1. In SendGrid, go to Settings → Sender Authentication
2. Verify `buyjunkcarmiami@gmail.com`
3. Check your Gmail for verification email

#### Step 5: Redeploy
Redeploy your Vercel project to apply changes.

---

## What You'll Receive

Every time someone submits a lead, you'll get an email with:

📧 **Email Subject:** "🚗 New Lead: [Name] - [Year Make Model]"

**Email Contains:**
- ✅ Customer name and phone number (clickable to call)
- ✅ Email address
- ✅ Vehicle details (year, make, model, VIN, condition)
- ✅ Location and zip code
- ✅ Additional comments
- ✅ Timestamp (EST)
- ✅ Direct link to admin panel
- ✅ Beautiful HTML formatting

**Example:**
```
🚗 New Lead: John Smith - 2015 Honda Civic

Customer Name: John Smith
Phone: 📞 (305) 555-1234 [Call Now Button]
Email: john@example.com

Vehicle: 2015 Honda Civic
Condition: Runs and drives

Location: 📍 Miami, FL 33130

Comments: Car has minor damage on front bumper

Source: Website Form
Time: 11/17/2025, 2:30 PM EST

[View in Admin Panel Button]
```

---

## Testing Email Notifications

After setup, test it:

1. Go to your website: https://buyjunkcarmiami.com
2. Fill out the quote form with test data
3. Submit the form
4. Check your email at buyjunkcarmiami@gmail.com
5. You should receive the notification within 30 seconds

---

## Troubleshooting

### Not receiving emails?

1. **Check spam folder** - First email might go to spam
2. **Verify API key** - Make sure it's correct in Vercel
3. **Check Vercel logs:**
   - Go to Vercel → Deployments → Click latest
   - Click "Functions" tab
   - Look for `/api/send-email` logs
4. **Verify domain** - If using custom domain, make sure it's verified

### Emails going to spam?

- Verify your domain in Resend/SendGrid
- Add SPF and DKIM records (provided by email service)
- Mark first email as "Not Spam"

### Want to add more recipients?

Edit `api/send-email.js` line 13:
```javascript
const TO_EMAIL = 'buyjunkcarmiami@gmail.com, other@email.com';
```

---

## Cost

- **Resend:** FREE for 100 emails/day (3,000/month)
- **SendGrid:** FREE for 100 emails/day (3,000/month)
- **Your usage:** Probably 5-20 leads/day = FREE forever

---

## Current Status

✅ Email notification code is deployed
✅ API endpoint created: `/api/send-email`
✅ Form automatically sends emails on submission
⏳ **Waiting for:** You to add API key to Vercel

**Once you add the API key and redeploy, emails will start working immediately!**

---

## Support

If you need help:
1. Check Vercel function logs
2. Check Resend/SendGrid dashboard for delivery status
3. Make sure environment variable is set correctly
4. Redeploy after adding environment variables
