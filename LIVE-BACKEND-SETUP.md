# 🌐 Live Backend Setup - PHP API

## Overview
Your website now has a **live backend** that works across all devices and browsers. Leads are saved to a server file that can be accessed from anywhere.

## How It Works

### Before (localStorage - Local Only):
```
Website Form → localStorage → Admin Panel (same browser only) ❌
```

### After (PHP Backend - Live):
```
Website Form → PHP API → Server File → Admin Panel (any device) ✅
```

## Files Created

### 1. `/api/submit-lead.php`
- Receives form submissions
- Saves leads to `admin/data/leads.json`
- Prevents duplicates
- Works on any PHP hosting

### 2. `/api/get-leads.php`
- Returns all leads
- Calculates statistics
- Used by admin panel

### 3. Updated JavaScript
- `js/app.js` - Now sends to PHP API
- `admin/index.html` - Now reads from PHP API
- localStorage used as backup only

## Setup Instructions

### Step 1: Upload Files to Your Web Host
Upload these files to your website:
```
/api/submit-lead.php
/api/get-leads.php
/admin/data/leads.json (will be created automatically)
```

### Step 2: Set Permissions
Make sure the `admin/data/` folder is writable:
```bash
chmod 755 admin/data
chmod 644 admin/data/leads.json
```

Or via FTP/cPanel:
- Folder permissions: 755
- File permissions: 644

### Step 3: Test the API

**Test Submit Endpoint:**
```bash
curl -X POST https://yourdomain.com/api/submit-lead.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"305-555-1234","vehicle":"2015 Honda Civic"}'
```

**Test Get Endpoint:**
```bash
curl https://yourdomain.com/api/get-leads.php
```

### Step 4: Test Form Submission
1. Go to your live website
2. Fill out the quote form
3. Submit it
4. Check browser console - should see: "✅ Lead saved to server"

### Step 5: Check Admin Panel
1. Open admin panel from ANY device
2. Click "Leads Management"
3. Your lead should appear!
4. Works from phone, tablet, different computer, etc.

## Verification

### Check if PHP is Working:
Create a test file `test.php`:
```php
<?php
phpinfo();
?>
```
Upload it and visit: `https://yourdomain.com/test.php`
If you see PHP info, PHP is working!

### Check if Leads File Exists:
Via FTP or cPanel File Manager, check:
```
/admin/data/leads.json
```
Should contain JSON array of leads.

### Check API Endpoints:
Visit in browser:
- `https://yourdomain.com/api/get-leads.php` - Should show JSON
- `https://yourdomain.com/api/submit-lead.php` - Should show error (POST only)

## Features

### ✅ Works Live
- Leads saved to server file
- Accessible from any device
- No localStorage limitations

### ✅ Duplicate Prevention
- Same phone number within 5 minutes = duplicate
- Automatically rejected

### ✅ Backup System
- If server fails, saves to localStorage
- No leads lost

### ✅ Statistics
- Total leads
- New leads
- Today's leads
- High priority leads

### ✅ Logging
- All leads logged to `admin/data/leads.log`
- Backup in case JSON file corrupts

## Troubleshooting

### Leads Not Saving?

**Check 1: PHP Errors**
Add to top of `submit-lead.php`:
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

**Check 2: File Permissions**
```bash
ls -la admin/data/
# Should show: drwxr-xr-x (755)
```

**Check 3: Browser Console**
Open console (F12) and look for errors when submitting form.

**Check 4: Server Logs**
Check your hosting's error logs for PHP errors.

### Admin Panel Not Loading Leads?

**Check 1: API Endpoint**
Visit: `https://yourdomain.com/api/get-leads.php`
Should return JSON with leads.

**Check 2: CORS Issues**
If admin panel is on different domain, you may need to adjust CORS headers in PHP files.

**Check 3: Browser Console**
Look for fetch errors or CORS errors.

### 500 Internal Server Error?

**Common Causes:**
1. PHP syntax error - Check error logs
2. File permissions - Make sure 755/644
3. Missing directory - Create `admin/data/` folder
4. PHP version - Requires PHP 5.4+

## Hosting Requirements

### Minimum Requirements:
- ✅ PHP 5.4 or higher
- ✅ File write permissions
- ✅ JSON extension (usually included)

### Works On:
- ✅ Shared hosting (GoDaddy, Bluehost, etc.)
- ✅ VPS/Cloud hosting
- ✅ cPanel hosting
- ✅ Most web hosts with PHP

### Does NOT Work On:
- ❌ Static hosting (GitHub Pages, Netlify, etc.)
- ❌ Hosting without PHP support

## Alternative: Use Vercel/Netlify

If your host doesn't support PHP, you can use:

### Option 1: Vercel (Recommended)
- Free tier available
- Supports serverless functions
- Easy deployment

### Option 2: Netlify
- Free tier available
- Supports serverless functions
- Form handling built-in

### Option 3: Firebase
- Free tier available
- Real-time database
- No server needed

## Data Storage

### Current: JSON File
- Simple and reliable
- Works on any PHP host
- Easy to backup
- Limit: ~1000 leads recommended

### Future: Database
For more leads, consider upgrading to:
- MySQL/MariaDB
- PostgreSQL
- MongoDB
- Firebase

## Security Notes

### Current Security:
- ✅ Input sanitization (htmlspecialchars)
- ✅ Duplicate prevention
- ✅ IP logging
- ✅ JSON validation

### Recommended Additions:
- 🔒 Add authentication to admin panel
- 🔒 Use HTTPS (SSL certificate)
- 🔒 Add rate limiting
- 🔒 Add CAPTCHA to form

## Backup Your Leads

### Manual Backup:
1. Download `admin/data/leads.json` via FTP
2. Save to your computer
3. Do this weekly

### Automatic Backup:
Set up a cron job to backup daily:
```bash
0 2 * * * cp /path/to/admin/data/leads.json /path/to/backups/leads-$(date +\%Y\%m\%d).json
```

## Export Leads

### To CSV:
Create `admin/export-csv.php`:
```php
<?php
$leads = json_decode(file_get_contents('data/leads.json'), true);
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="leads.csv"');
$output = fopen('php://output', 'w');
fputcsv($output, array_keys($leads[0]));
foreach ($leads as $lead) {
    fputcsv($output, $lead);
}
?>
```

## Support

### Need Help?
1. Check browser console for errors
2. Check server error logs
3. Verify file permissions
4. Test API endpoints directly
5. Check PHP version compatibility

---

**Status**: ✅ Live Backend Ready
**Type**: PHP API with JSON storage
**Hosting**: Any PHP-compatible host
**Last Updated**: November 2024
