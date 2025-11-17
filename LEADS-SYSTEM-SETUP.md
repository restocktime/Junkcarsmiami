# Leads Management System - Setup Complete

## Overview
Your website forms are now fully connected to the admin panel. All form submissions will automatically appear in the admin leads section.

## How It Works

### 1. Form Submission Flow
When a visitor fills out a form on your website:
1. Form data is captured from the multi-step quote form
2. Lead is saved to **localStorage** (browser storage) immediately
3. Lead is sent to the backend API (if available)
4. Backend saves lead to `admin/data/leads.json` file

### 2. Admin Panel Display
The admin panel shows leads from multiple sources:
- **Website Forms** - Forms submitted through your website
- **localStorage** - Leads saved locally in the browser
- **Backend API** - Leads from the server database

### 3. Lead Data Structure
Each lead contains:
- **Contact Info**: Name, phone, email, location
- **Vehicle Info**: Year, make, model, VIN, condition
- **Status**: new, pending, converted
- **Priority**: high, medium, low
- **Source**: Website Form, Phone Call, WhatsApp, etc.
- **Timestamp**: When the lead was submitted

## Files Modified

### 1. `/js/app.js`
- Updated `submitQuoteRequest()` function
- Now saves leads to localStorage: `mjc_website_leads`
- Sends leads to backend API: `/api/quote`
- Works offline if backend is unavailable

### 2. `/backend/server.js`
- Added `/api/quote` endpoint to save leads
- Added `/api/leads` endpoint to retrieve leads (admin only)
- Added `/api/leads/:leadId` endpoint to update leads
- Saves leads to `admin/data/leads.json`

### 3. `/admin/index.html`
- Updated `loadOfflineLeads()` to read from all sources
- Added `updateStatsFromLeads()` for real-time stats
- Enhanced `renderLeadsTable()` with more details
- Added `viewLead()` function for detailed lead view
- Shows source, location, and full contact info

## Testing the System

### Test Form Submission:
1. Go to your website homepage
2. Fill out the quote form with test data:
   - Name: Test Customer
   - Phone: (305) 555-1234
   - Year: 2015
   - Make: Honda
   - Model: Civic
3. Submit the form
4. Open admin panel: `/admin/`
5. Click "Leads Management"
6. You should see your test lead appear!

### Verify Lead Details:
1. Click the eye icon (👁️) next to any lead
2. View full lead details in the modal
3. Click "Call Customer" to initiate a phone call
4. Click "Send Email" to compose an email

## Admin Panel Access

### Local Development:
- URL: `http://localhost:3001/admin/` (if backend is running)
- Or open: `file:///path/to/your/site/admin/index.html`

### Production:
- URL: `https://buyjunkcarmiami.com/admin/`
- Login required (if authentication is enabled)

## Backend Server

### Start the Backend:
```bash
cd backend
npm install
node server.js
```

The server runs on port 3001 by default.

### API Endpoints:
- `POST /api/quote` - Submit new lead
- `GET /api/leads` - Get all leads (admin only)
- `PUT /api/leads/:leadId` - Update lead status (admin only)

## Data Storage

### localStorage Keys:
- `mjc_website_leads` - Leads from website forms
- `mjc_offline_leads` - Manually added leads
- `mjc_admin_data` - Admin panel data

### File Storage:
- `admin/data/leads.json` - All leads (JSON format)
- `backend/quotes.log` - Backup log file

## Features

### ✅ Automatic Lead Capture
- All website form submissions are captured
- No leads are lost, even if backend is down
- Duplicate prevention by lead ID

### ✅ Real-Time Stats
- Total leads count
- New leads (status: new)
- Today's leads
- High priority leads

### ✅ Lead Details View
- Full contact information
- Vehicle details with VIN
- Comments and notes
- Source tracking
- Timestamp

### ✅ Quick Actions
- Click-to-call phone numbers
- Click-to-email addresses
- View detailed lead information
- Update lead status

## Troubleshooting

### Leads Not Showing Up?
1. Check browser console for errors (F12)
2. Verify localStorage: `localStorage.getItem('mjc_website_leads')`
3. Check if backend is running: `http://localhost:3001/api/leads`
4. Look at `admin/data/leads.json` file

### Backend Not Working?
- Leads still save to localStorage
- Admin panel works without backend
- Start backend server to enable full features

### Clear Test Data:
```javascript
// In browser console:
localStorage.removeItem('mjc_website_leads');
localStorage.removeItem('mjc_offline_leads');
localStorage.removeItem('mjc_admin_data');
```

## Next Steps

### Recommended Enhancements:
1. **Email Notifications** - Get notified when new leads arrive
2. **SMS Integration** - Send automated responses
3. **CRM Integration** - Connect to Salesforce, HubSpot, etc.
4. **Lead Scoring** - Automatically prioritize hot leads
5. **Follow-up Reminders** - Never miss a follow-up

### Export Leads:
You can export leads from `admin/data/leads.json` to:
- CSV for Excel
- Google Sheets
- Your CRM system

## Support

If you need help:
1. Check browser console for errors
2. Review this documentation
3. Test with sample data first
4. Verify all files are in place

## Security Notes

- Admin panel should be password protected in production
- Use HTTPS for all form submissions
- Regularly backup `admin/data/leads.json`
- Don't commit sensitive data to Git

---

**Status**: ✅ Fully Operational
**Last Updated**: November 2024
**Version**: 1.0
