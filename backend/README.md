# Buy Junk Car Miami - Admin Backend

This is the backend server for the Buy Junk Car Miami admin portal, providing real content management capabilities for the live website.

## Features

✅ **Real Content Editing**: Edit page titles, meta descriptions, headlines, and content through the admin interface
✅ **Global Content Updates**: Update phone numbers, business hours, and company information across all pages
✅ **New Page Creation**: Create new pages with proper templates, SEO metadata, and schema markup
✅ **Automatic Sitemap Generation**: Generate and update XML sitemaps with all site pages
✅ **Secure Authentication**: JWT-based authentication with bcrypt password hashing
✅ **File Backups**: Automatic backup system before making changes
✅ **Rate Limiting**: Protection against abuse and excessive requests

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

The server will run on `http://localhost:3001` by default.

### 3. Access Admin Portal
1. Navigate to `/admin/` in your website
2. Login with:
   - **Username**: `admin`
   - **Password**: `BuyJunkCarMiami2024!`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Content Management
- `GET /api/stats` - Get site statistics
- `GET /api/pages/:pagePath` - Get page content
- `PUT /api/pages/:pagePath` - Update page content
- `POST /api/pages` - Create new page
- `PUT /api/content/global` - Update global content (phone, hours)

### SEO Tools
- `POST /api/sitemap/generate` - Generate sitemap.xml

## Production Deployment

### Environment Variables
```bash
PORT=3001                                    # Server port
JWT_SECRET=your-super-secure-secret-key      # JWT signing secret
NODE_ENV=production                          # Environment
```

### Recommended Setup
1. **Reverse Proxy**: Use nginx to proxy API requests
2. **SSL Certificate**: Enable HTTPS for secure admin access
3. **Process Manager**: Use PM2 for production process management
4. **Database**: Consider upgrading to database storage for larger sites

### nginx Configuration Example
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Main site
    location / {
        root /path/to/site;
        try_files $uri $uri/ /index.html;
    }
    
    # Admin API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### PM2 Configuration
```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server.js --name "junk-car-admin"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers and protection
- **JWT Authentication**: Secure token-based authentication  
- **Input Validation**: All inputs are validated and sanitized
- **File Backups**: Automatic backups before any file modifications
- **CORS Protection**: Configurable cross-origin request handling

## File Structure

```
backend/
├── server.js           # Main server application
├── package.json        # Dependencies and scripts
├── README.md          # This file
└── backups/           # Auto-generated backups (created when needed)
    └── YYYY-MM-DD/    # Daily backup folders
        └── *.html     # Backup files with timestamps
```

## Troubleshooting

### Common Issues

**1. "Connection failed" error in admin**
- Ensure backend server is running on port 3001
- Check if port is available: `netstat -an | grep 3001`
- Verify CORS settings if using different domains

**2. "Token expired" errors**
- Tokens expire after 8 hours for security
- Re-login to get a new token
- Check server logs for authentication issues

**3. File permission errors**
- Ensure Node.js has write permissions to site directory
- Check file ownership: `ls -la /path/to/site`
- Set proper permissions: `chmod -R 755 /path/to/site`

**4. Backup directory issues**
- Backend automatically creates backup directories
- Ensure sufficient disk space
- Old backups can be safely deleted

### Logs
Server logs are output to console. In production, consider using:
```bash
pm2 logs junk-car-admin  # View PM2 logs
```

## Maintenance

### Regular Tasks
- **Backup Cleanup**: Old backup files can be removed periodically
- **Log Rotation**: Implement log rotation for long-running instances
- **Security Updates**: Keep dependencies updated with `npm audit`

### Monitoring
- **Server Health**: Check if server is responding at `/api/stats`
- **Disk Space**: Monitor backup directory size
- **Performance**: Watch for slow response times on content updates

## Support

For technical support or questions about this admin system:

1. Check server logs for error messages
2. Verify all dependencies are installed correctly
3. Ensure proper file permissions are set
4. Test API endpoints manually if needed

## License

This admin system is proprietary software for Buy Junk Car Miami website management.