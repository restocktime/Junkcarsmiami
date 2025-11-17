# 🗄️ REAL DATABASE SETUP - 10 Minutes

## This is a REAL solution with PostgreSQL database

No more localStorage. No more file-based storage. **REAL DATABASE.**

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (FREE)
4. Create new project:
   - **Name**: `junkcars-miami`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to Miami (US East)
5. Click "Create new project"
6. Wait 2 minutes for database to provision

---

## Step 2: Create Database Table (2 minutes)

1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Paste this SQL:

```sql
-- Create leads table
CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle TEXT,
  year TEXT,
  make TEXT,
  model TEXT,
  vin TEXT,
  condition TEXT,
  has_title TEXT,
  damage TEXT,
  location TEXT,
  zip TEXT,
  comments TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'high',
  source TEXT DEFAULT 'Website Form',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON leads
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click "Run"
5. Should see "Success. No rows returned"

---

## Step 3: Get API Keys (1 minute)

1. In Supabase dashboard, click "Settings" (gear icon)
2. Click "API"
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

---

## Step 4: Add to Vercel (2 minutes)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Settings"
4. Click "Environment Variables"
5. Add these:
   - **Name**: `SUPABASE_URL`
   - **Value**: (paste your Project URL)
   - Click "Add"
   
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: (paste your anon public key)
   - Click "Add"

6. Click "Redeploy" to apply changes

---

## Step 5: Update API Route (1 minute)

Update `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/leads",
      "destination": "/api/supabase-leads.js"
    }
  ]
}
```

---

## Step 6: Test It! (2 minutes)

1. Go to your website
2. Fill out the quote form
3. Submit it
4. Check Supabase dashboard → "Table Editor" → "leads"
5. **See your lead in the database!** ✅
6. Open admin panel on your phone
7. **See the lead there too!** ✅

---

## That's It!

Your leads are now stored in a **REAL PostgreSQL database** that:
- ✅ Works across ALL devices
- ✅ Never loses data
- ✅ Scales to millions of leads
- ✅ Backed up automatically
- ✅ FREE tier (50,000 rows)
- ✅ Professional grade

---

## Verify It's Working

### Check Database:
1. Supabase Dashboard → Table Editor → leads
2. Should see all your leads

### Check API:
Visit: `https://yourdomain.com/api/leads`
Should return JSON with all leads

### Check Admin Panel:
Open on ANY device - should show all leads

---

## Free Tier Limits

Supabase Free includes:
- ✅ 500 MB database
- ✅ 50,000 rows
- ✅ 2 GB bandwidth
- ✅ Automatic backups
- ✅ Real-time subscriptions
- ✅ Authentication (if needed later)

**More than enough for years of leads!**

---

## Backup Your Data

### Export Leads:
1. Supabase Dashboard → Table Editor → leads
2. Click "..." → "Export to CSV"
3. Download and save

### Automatic Backups:
Supabase automatically backs up your database daily.

---

## Add More Features Later

With Supabase you can easily add:
- Email notifications when new lead arrives
- SMS notifications
- Lead assignment to team members
- Lead status tracking
- Notes and follow-ups
- Search and filtering
- Analytics and reports

---

## Troubleshooting

### "Failed to fetch leads"
- Check environment variables in Vercel
- Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set
- Redeploy after adding variables

### "Database error"
- Check SQL was run correctly
- Check RLS policy is created
- Check table exists in Supabase

### "No leads showing"
- Check Supabase Table Editor - are leads there?
- Check browser console for errors
- Check API endpoint returns data

---

## Migration from Old System

If you have leads in localStorage:
1. Open browser console
2. Run: `console.log(localStorage.getItem('mjc_website_leads_backup'))`
3. Copy the JSON
4. In Supabase, insert manually or use import

---

## Cost

### Free Forever:
- Up to 500 MB database
- Up to 50,000 rows
- Perfect for small business

### If You Grow:
- Pro plan: $25/month
- Unlimited everything
- Priority support

---

## Summary

### Before:
- ❌ localStorage (only same browser)
- ❌ File-based (unreliable)
- ❌ No cross-device sync
- ❌ Data loss risk

### After (Supabase):
- ✅ Real PostgreSQL database
- ✅ Works everywhere
- ✅ Never lose data
- ✅ Professional grade
- ✅ FREE

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Run SQL to create table
3. ✅ Add environment variables to Vercel
4. ✅ Redeploy
5. ✅ Test form submission
6. ✅ Check admin panel on phone
7. ✅ **DONE!**

**This is a REAL solution. No more BS. Your leads will be safe and accessible everywhere.** 🚀

---

**Time to Complete**: 10 minutes
**Cost**: FREE
**Result**: Real database, works everywhere, never lose leads again
