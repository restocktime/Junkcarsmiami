# Miami Junk Car Buyers - Admin Panel

## Current Status

The admin panel now works in two modes:

### 🟡 localStorage Mode (Current)
- **Lead Management**: ✅ Fully functional with browser storage
- **Page Editing**: ⚠️ Requires PHP server 
- **Page Creation**: ⚠️ Requires PHP server

### 🟢 Full PHP Mode (Recommended)
- **Lead Management**: ✅ Fully functional with file storage
- **Page Editing**: ✅ Live editing of website files
- **Page Creation**: ✅ Create new pages instantly

## Login Credentials

- **Username**: `admin`
- **Password**: `BuyJunkCarMiami2024!`

## Setting Up Full Functionality

To enable page editing and creation, you need to run a PHP server:

### Option 1: XAMPP (Recommended)
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache from XAMPP Control Panel
3. Copy website folder to `C:\xampp\htdocs\` (Windows) or `/Applications/XAMPP/htdocs/` (Mac)
4. Access via `http://localhost/[folder-name]/admin/`

### Option 2: MAMP (Mac)
1. Download and install [MAMP](https://www.mamp.info/)
2. Start servers
3. Copy website folder to `/Applications/MAMP/htdocs/`
4. Access via `http://localhost:8888/[folder-name]/admin/`

### Option 3: Built-in PHP Server
1. Open terminal in website root directory
2. Run: `php -S localhost:8000`
3. Access via `http://localhost:8000/admin/`

## Features

### Lead Management (Works in all modes)
- View and manage customer leads
- Add new leads manually
- Update lead status
- Export leads to CSV
- Search and filter functionality

### Page Management (Requires PHP)
- Edit existing pages (title, meta description, hero text)
- Create new pages with proper SEO
- Live preview of changes
- Instant website updates

### Content Management (Requires PHP)
- Update website content
- Manage SEO settings
- Real-time file modifications

## File Structure

```
admin/
├── index.html          # Admin panel interface
├── api.php            # PHP backend API
├── data/
│   └── leads.json     # Lead storage (created automatically)
└── README.md          # This file
```

## API Endpoints

The PHP API (`api.php`) provides these endpoints:
- `?action=login` - Admin authentication
- `?action=get_leads` - Retrieve leads
- `?action=save_lead` - Save/update lead
- `?action=get_pages` - List website pages
- `?action=get_page_content` - Get page HTML
- `?action=save_page` - Update page content
- `?action=create_page` - Create new page

## Troubleshooting

### "405 Method Not Allowed" Error
- PHP server not running or not configured properly
- Admin panel will automatically fall back to localStorage mode

### Page Editing Not Working
- Ensure PHP server is running
- Check file permissions for write access
- Verify website is in server document root

### Leads Not Saving
- In localStorage mode: Data saved to browser (temporary)
- In PHP mode: Data saved to `admin/data/leads.json` (permanent)

## Security Notes

- Change default password in production
- Restrict admin folder access via `.htaccess`
- Use HTTPS in production environment
- Regular backup of `admin/data/` folder