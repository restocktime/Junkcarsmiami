# Connect Email Notifications - Quick Guide

Get emails at **buyjunkcarmiami@gmail.com** for every lead in 5 minutes!

---

## Step 1: Sign Up for Resend (FREE)

1. Go to: **https://resend.com/signup**
2. Enter your email and create password
3. Verify your email (check inbox)

✅ **Done!** You now have a free account (100 emails/day)

---

## Step 2: Get Your API Key

1. Go to: **https://resend.com/api-keys**
2. Click **"Create API Key"** button
3. Name it: `Miami Leads`
4. Click **Create**
5. **COPY the key** (starts with `re_`)
   - Example: `re_123abc456def789ghi`
   - ⚠️ Save it somewhere - you can only see it once!

---

## Step 3: Add API Key to Vercel

1. Go to: **https://vercel.com/dashboard**
2. Click on your **"junkcarsmiami"** project
3. Click **"Settings"** tab (top menu)
4. Click **"Environment Variables"** (left sidebar)
5. Click **"Add New"** button
6. Fill in:
   ```
   Name:  RESEND_API_KEY
   Value: re_123abc456def789ghi  (paste your key here)
   ```
7. Click **"Save"**

---

## Step 4: Redeploy Your Site

1. Still in Vercel, click **"Deployments"** tab
2. Find the latest deployment (top of list)
3. Click the **three dots (•••)** on the right
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm
6. Wait 2 minutes for deployment to finish

✅ **Done!** Emails are now active!

---

## Step 5: Test It

1. Go to: **https://buyjunkcarmiami.com**
2. Fill out the quote form with test data:
   - Name: Test User
   - Phone: (305) 555-1234
   - Email: test@test.com
   - Vehicle: 2015 Honda Civic
3. Click **Submit**
4. Check your email: **buyjunkcarmiami@gmail.com**
5. You should receive an email within 30 seconds!

---

## What You'll Receive

Every lead will send you an email like this:

**Subject:** 🚗 New Lead: John Smith - 2015 Honda Civic

**Email Contains:**

- ✅ Customer name
- ✅ Phone number (click to call)
- ✅ Email address
- ✅ Vehicle details
- ✅ Location
- ✅ Comments
- ✅ Timestamp
- ✅ Link to admin panel

---

## Troubleshooting

### Not receiving emails?

1. **Check spam folder** - Mark as "Not Spam"
2. **Wait 5 minutes** - First email might be delayed
3. **Check Vercel logs:**
   - Go to Vercel → Deployments → Click latest
   - Click "Functions" tab
   - Look for `/api/send-email`
   - Should show "✅ Email sent"

### Still not working?

1. Make sure API key is correct in Vercel
2. Make sure you clicked "Redeploy" after adding the key
3. Check Resend dashboard: https://resend.com/emails
   - You should see sent emails there

---

## Optional: Use Your Own Domain

Right now emails come from: `onboarding@resend.dev`

To send from: `leads@buyjunkcarmiami.com`

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter: `buyjunkcarmiami.com`
4. Add the DNS records they show you (in your domain registrar)
5. Wait for verification (5-30 minutes)

✅ Now emails will come from your domain!

---

## Cost

**FREE** - Resend gives you 100 emails per day free forever.

You'll probably get 5-20 leads per day = **Always FREE**

---

## Summary

✅ Code is already deployed and ready
✅ Just need to add API key to Vercel
✅ Takes 5 minutes total
✅ Completely free (100 emails/day)
✅ Professional HTML emails
✅ Click-to-call phone numbers

**Once you complete Step 3 and Step 4, you're done!**

---

## Need Help?

If emails aren't working after 10 minutes:

1. Double-check the API key in Vercel (Settings → Environment Variables)
2. Make sure you redeployed after adding the key
3. Check spam folder in Gmail
4. Look at Vercel function logs for errors

The code is working - it just needs the API key to send emails!
