# 🚀 Deployment Checklist - Make Leads Work Live

## Problem
You're seeing zero leads on mobile because the **PHP API files** need to be uploaded to your live server.

## Quick Fix - Upload These Files

### Required Files to Upload:
```
/api/submit-lead.php    ← Receives form submissions
/api/get-leads.php      ← Returns leads to admin panel
/api/test.php           ← Test if PHP is working
/admin/data/leads.json  ← Stores the leads
```

### How to Upload (Choose One Method):

#### Method 1: FTP/SFTP
1. Open FileZilla (or your FTP client)
2. Connect to your web host
3. Upload the `/api/` folder to your website root
4. Upload `/admin/data/leads.json` to admin folder
5. Done!

#### Method 2: cPanel File Manager
1. Log into cPanel
2. Open "File Manager"
3. Navigate to `public_html` (or your website root)
4. Upload the `/api/` folder
5. Navigate to `admin/` folder
6. Upload `data/leads.json`
7. Done!

#### Method 3: Git Deploy
If your host supports Git:
```bash
cd /path/to/your/website
git pull origin main
```

## Step-by-Step Setup

### Step 1: Test PHP is Working
1. Upload `/api/test.php` to your server
2. Visit: `https://yourdomain.com/api/test.php`
3. Should see: `{"success":true,"message":"PHP API is working!"}`
4. ✅ If you see this, PHP is working!
5. ❌ If you see error or download, PHP is not enabled

### Step 2: Set Folder Permissions
```bash
# Via SSH or cPanel Terminal:
chmod 755 api/
chmod 755 admin/data/
chmod 644 admin/data/leads.json
```

Or via FTP:
- Right-click folder → Permissions
- Set to: 755 (rwxr-xr-x)

### Step 3: Test Lead Submission
1. Go to your website homepage
2. Fill out the quote form
3. Submit it
4. Open browser console (F12)
5. Should see: "✅ Lead saved to server"

### Step 4: Test Admin Panel
1. Open admin panel on your phone
2. Click "Leads Management"
3. Should see your test lead!

## Troubleshooting

### Still Seeing Zero Leads?

#### Check 1: Are PHP Files Uploaded?
Visit these URLs in browser:
- `https://yourdomain.com/api/test.php` → Should show JSON
- `https://yourdomain.com/api/get-leads.php` → Should show leads JSON
- `https://yourdomain.com/api/submit-lead.php` → Should show error (POST only)

#### Check 2: Is leads.json Accessible?
Visit: `https://yourdomain.com/admin/data/leads.json`
- Should show JSON array
- If 404, file not uploaded
- If 403, permission issue

#### Check 3: Check Browser Console
On mobile:
1. Open admin panel
2. Use remote debugging or check logs
3. Look for error messages

#### Check 4: Test Form Submission
1. Fill out form on website
2. Check browser console
3. Should see: "✅ Lead saved to server"
4. If error, check what it says

### Common Issues:

**Issue: "404 Not Found" on API**
- Solution: Upload `/api/` folder to server

**Issue: "403 Forbidden" on leads.json**
- Solution: Set permissions to 644
- Command: `chmod 644 admin/data/leads.json`

**Issue: "500 Internal Server Error"**
- Solution: Check PHP error logs
- Usually a syntax error or permission issue

**Issue: "PHP files download instead of execute"**
- Solution: PHP not enabled on server
- Contact hosting support to enable PHP

**Issue: "CORS error"**
- Solution: Already handled in PHP files
- If still happening, check server config

## Verify Everything is Working

### ✅ Checklist:
- [ ] `/api/test.php` returns JSON
- [ ] `/api/get-leads.php` returns leads
- [ ] Form submission shows "✅ Lead saved to server"
- [ ] Admin panel shows leads
- [ ] Works on mobile phone
- [ ] Works on different browsers

## Alternative: Quick Test Without Deployment

If you want to test locally first:

### Option 1: Local PHP Server
```bash
cd /path/to/your/website
php -S localhost:8000
```
Then visit: `http://localhost:8000`

### Option 2: XAMPP/MAMP
1. Install XAMPP or MAMP
2. Put website in htdocs folder
3. Start Apache
4. Visit: `http://localhost/your-site`

## File Structure Should Look Like:

```
your-website/
├── api/
│   ├── test.php           ← Test endpoint
│   ├── submit-lead.php    ← Form submission
│   ├── get-leads.php      ← Get leads
│   ├── get-images.php     ← Image manager
│   └── create-page.php    ← Page creator
├── admin/
│   ├── data/
│   │   └── leads.json     ← Leads storage
│   └── index.html         ← Admin panel
├── js/
│   └── app.js             ← Form handler
└── index.html             ← Homepage
```

## After Deployment

### Test Everything:
1. ✅ Visit `/api/test.php` - Should work
2. ✅ Submit form - Should save lead
3. ✅ Open admin panel - Should show leads
4. ✅ Test on mobile - Should work
5. ✅ Test on different device - Should work

### Monitor:
- Check leads daily
- Backup `leads.json` weekly
- Monitor server logs for errors

## Need Help?

### Check These:
1. Browser console (F12) for errors
2. Server error logs (via cPanel or hosting panel)
3. PHP version (needs 5.4+)
4. File permissions (755 for folders, 644 for files)

### Contact Info:
- Your hosting support can help with:
  - Enabling PHP
  - Setting permissions
  - Checking error logs
  - Server configuration

---

## Summary

**The Issue:** PHP API files not on live server
**The Fix:** Upload `/api/` folder and set permissions
**Test:** Visit `/api/test.php` to verify
**Result:** Leads will work across all devices! ✅

---

**Last Updated**: November 2024
**Status**: Ready to Deploy
