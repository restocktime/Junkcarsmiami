const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cheerio = require('cheerio');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'BuyJunkCarMiami2024SecretKey!';

// Security middleware with comprehensive headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://ssl.google-analytics.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://www.google-analytics.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'microphone=(), camera=(), geolocation=(), payment=()');
    next();
});

// Admin panel IP whitelist middleware
const adminWhitelist = [
    '127.0.0.1',
    '::1',
    'localhost'
    // Add your IP addresses here, e.g., '192.168.1.100'
];

const checkAdminAccess = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Allow if in whitelist or if ADMIN_BYPASS environment variable is set
    if (adminWhitelist.includes(clientIP) || process.env.ADMIN_BYPASS === 'true') {
        return next();
    }
    
    console.warn(`Blocked admin access attempt from IP: ${clientIP}`);
    res.status(403).json({ 
        error: 'Access denied. Admin panel access is restricted.',
        timestamp: new Date().toISOString()
    });
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(SITE_ROOT, 'images');
        fs.ensureDir(uploadPath).then(() => {
            cb(null, uploadPath);
        }).catch(cb);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Apply admin security to all admin routes
app.use('/api/auth/*', checkAdminAccess);
app.use('/api/stats', checkAdminAccess);
app.use('/api/pages/*', checkAdminAccess);
app.use('/api/content/*', checkAdminAccess);
app.use('/api/sitemap/*', checkAdminAccess);
app.use('/api/images/*', checkAdminAccess);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', 'https://buyjunkcarmiami.com', 'file://'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Path to the site directory
const SITE_ROOT = path.join(__dirname, '..');

// Admin user credentials (in production, use database)
const ADMIN_USERS = {
    'admin': '$2b$10$6ZtdR6SyMvi2JQBp7QvC5evGW8CYuM7IMGrLxD2jx7sSH/vNMmO4G' // BuyJunkCarMiami2024!
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const hashedPassword = ADMIN_USERS[username];
        if (!hashedPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, hashedPassword);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            token,
            user: { username, role: 'admin' }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get site statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        // Count HTML files
        const htmlFiles = await fs.readdir(SITE_ROOT, { withFileTypes: true })
            .then(entries => entries.filter(entry => entry.isFile() && entry.name.endsWith('.html')))
            .catch(() => []);

        // Count blog posts
        const blogDir = path.join(SITE_ROOT, 'blog');
        const blogPosts = await fs.readdir(blogDir, { withFileTypes: true })
            .then(entries => entries.filter(entry => entry.isDirectory()))
            .catch(() => []);

        // Count location pages
        const locationsDir = path.join(SITE_ROOT, 'locations');
        const locationPages = await fs.readdir(locationsDir, { withFileTypes: true })
            .then(entries => entries.filter(entry => entry.isDirectory()))
            .catch(() => []);

        res.json({
            totalPages: htmlFiles.length + blogPosts.length + locationPages.length,
            blogPosts: blogPosts.length,
            locations: locationPages.length,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get site statistics' });
    }
});

// Get page content
app.get('/api/pages/:pagePath(*)', authenticateToken, async (req, res) => {
    try {
        const pagePath = req.params.pagePath;
        const filePath = path.join(SITE_ROOT, pagePath, 'index.html');
        
        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Page not found' });
        }

        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        
        // Extract key content elements
        const pageData = {
            title: $('title').text(),
            metaDescription: $('meta[name="description"]').attr('content'),
            h1: $('h1').first().text(),
            heroSubtitle: $('.hero-subtitle').first().text(),
            content: content
        };

        res.json({ success: true, data: pageData });
    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({ error: 'Failed to get page content' });
    }
});

// Update page content
app.put('/api/pages/:pagePath(*)', authenticateToken, async (req, res) => {
    try {
        const pagePath = req.params.pagePath;
        const { title, metaDescription, h1, heroSubtitle, content } = req.body;
        const filePath = path.join(SITE_ROOT, pagePath, 'index.html');
        
        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({ error: 'Page not found' });
        }

        let htmlContent = content;
        
        // If specific fields provided, update them
        if (title || metaDescription || h1 || heroSubtitle) {
            const $ = cheerio.load(await fs.readFile(filePath, 'utf8'));
            
            if (title) $('title').text(title);
            if (metaDescription) $('meta[name="description"]').attr('content', metaDescription);
            if (h1) $('h1').first().text(h1);
            if (heroSubtitle) $('.hero-subtitle').first().text(heroSubtitle);
            
            htmlContent = $.html();
        }

        // Create backup
        const backupDir = path.join(__dirname, 'backups', new Date().toISOString().split('T')[0]);
        await fs.ensureDir(backupDir);
        const backupPath = path.join(backupDir, `${pagePath.replace(/\//g, '_')}_${Date.now()}.html`);
        await fs.copy(filePath, backupPath);

        // Save updated content
        await fs.writeFile(filePath, htmlContent);

        res.json({ success: true, message: 'Page updated successfully' });
    } catch (error) {
        console.error('Update page error:', error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// Update global site content (phone, hours, etc.)
app.put('/api/content/global', authenticateToken, async (req, res) => {
    try {
        const { phone, hours, companyName } = req.body;
        const updatedFiles = [];

        // Find all HTML files
        const findHtmlFiles = async (dir) => {
            const files = [];
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await findHtmlFiles(fullPath));
                } else if (entry.name === 'index.html') {
                    files.push(fullPath);
                }
            }
            return files;
        };

        const htmlFiles = await findHtmlFiles(SITE_ROOT);

        // Update each HTML file
        for (const filePath of htmlFiles) {
            try {
                let content = await fs.readFile(filePath, 'utf8');
                let modified = false;

                if (phone) {
                    // Update phone numbers in various formats
                    content = content.replace(/(\(\d{3}\)\s?\d{3}-\d{4})/g, phone);
                    content = content.replace(/(tel:\+1\d{10})/g, `tel:+1${phone.replace(/\D/g, '')}`);
                    modified = true;
                }

                if (hours) {
                    // Update business hours
                    content = content.replace(/Open \d+am-\d+pm Daily/g, hours);
                    content = content.replace(/Mo-Su \d{2}:\d{2}-\d{2}:\d{2}/g, 
                        hours.includes('8am-10pm') ? 'Mo-Su 08:00-22:00' : hours);
                    modified = true;
                }

                if (companyName) {
                    // Update company name (be careful with this one)
                    content = content.replace(/Buy Junk Car Miami/g, companyName);
                    modified = true;
                }

                if (modified) {
                    await fs.writeFile(filePath, content);
                    updatedFiles.push(filePath.replace(SITE_ROOT, ''));
                }
            } catch (fileError) {
                console.error(`Error updating ${filePath}:`, fileError);
            }
        }

        res.json({ 
            success: true, 
            message: `Updated ${updatedFiles.length} files`,
            files: updatedFiles
        });
    } catch (error) {
        console.error('Global content update error:', error);
        res.status(500).json({ error: 'Failed to update global content' });
    }
});

// Create new page
app.post('/api/pages', authenticateToken, async (req, res) => {
    try {
        const { pageName, pageTitle, pageType = 'service' } = req.body;
        
        if (!pageName || !pageTitle) {
            return res.status(400).json({ error: 'Page name and title are required' });
        }

        const pageDir = path.join(SITE_ROOT, pageName);
        const pagePath = path.join(pageDir, 'index.html');

        if (await fs.pathExists(pagePath)) {
            return res.status(400).json({ error: 'Page already exists' });
        }

        // Create directory
        await fs.ensureDir(pageDir);

        // Generate HTML template based on page type
        const template = generatePageTemplate(pageTitle, pageName, pageType);
        
        await fs.writeFile(pagePath, template);

        res.json({ 
            success: true, 
            message: `Page "${pageName}" created successfully`,
            path: `/${pageName}/`
        });
    } catch (error) {
        console.error('Create page error:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// Generate sitemap
app.post('/api/sitemap/generate', authenticateToken, async (req, res) => {
    try {
        const findHtmlFiles = async (dir, baseUrl = '') => {
            const urls = [];
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'backend') {
                    const subUrls = await findHtmlFiles(fullPath, `${baseUrl}/${entry.name}`);
                    urls.push(...subUrls);
                } else if (entry.name === 'index.html') {
                    const stats = await fs.stat(fullPath);
                    urls.push({
                        url: baseUrl || '/',
                        lastmod: stats.mtime.toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: baseUrl === '' ? '1.0' : '0.8'
                    });
                }
            }
            return urls;
        };

        const urls = await findHtmlFiles(SITE_ROOT);
        
        // Generate XML sitemap
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        for (const url of urls) {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>https://buyjunkcarmiami.com${url.url}</loc>\n`;
            sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
            sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
            sitemap += `    <priority>${url.priority}</priority>\n`;
            sitemap += `  </url>\n`;
        }
        
        sitemap += `</urlset>`;

        await fs.writeFile(path.join(SITE_ROOT, 'sitemap.xml'), sitemap);

        res.json({
            success: true,
            message: `Sitemap generated with ${urls.length} pages`,
            urls: urls.length
        });
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).json({ error: 'Failed to generate sitemap' });
    }
});

// Quote submission endpoint
app.post('/api/quote', async (req, res) => {
    try {
        const lead = req.body;

        // Honeypot spam check
        if (lead.website && lead.website.trim() !== '') {
            console.warn('Spam attempt detected via honeypot field:', req.ip);
            return res.status(400).json({ 
                error: 'Invalid form submission' 
            });
        }

        // Basic validation
        if (!lead.name || !lead.phone) {
            return res.status(400).json({ 
                error: 'Name and phone are required' 
            });
        }

        // Ensure lead has required fields
        const leadData = {
            id: lead.id || Date.now().toString(),
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            vehicle: lead.vehicle || `${lead.year || ''} ${lead.make || ''} ${lead.model || ''}`.trim(),
            year: lead.year || '',
            make: lead.make || '',
            model: lead.model || '',
            vin: lead.vin || '',
            condition: lead.condition || lead.runs || '',
            hasTitle: lead.hasTitle || lead.title || '',
            damage: lead.damage || '',
            location: lead.location || 'Miami',
            zip: lead.zip || '',
            comments: lead.comments || '',
            status: 'new',
            priority: 'high',
            quote: '',
            notes: '',
            timestamp: lead.timestamp || new Date().toISOString(),
            source: lead.source || 'Website Form',
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Save to leads.json file
        const leadsFilePath = path.join(SITE_ROOT, 'admin', 'data', 'leads.json');
        
        try {
            // Ensure directory exists
            await fs.ensureDir(path.dirname(leadsFilePath));
            
            // Read existing leads
            let leads = [];
            if (await fs.pathExists(leadsFilePath)) {
                const fileContent = await fs.readFile(leadsFilePath, 'utf8');
                leads = JSON.parse(fileContent);
            }
            
            // Add new lead to beginning
            leads.unshift(leadData);
            
            // Keep only last 1000 leads
            if (leads.length > 1000) {
                leads = leads.slice(0, 1000);
            }
            
            // Save back to file
            await fs.writeFile(leadsFilePath, JSON.stringify(leads, null, 4));
            
            console.log('✅ New lead saved:', {
                id: leadData.id,
                name: leadData.name,
                phone: leadData.phone,
                vehicle: leadData.vehicle,
                location: leadData.location
            });
            
        } catch (fileError) {
            console.error('Failed to save lead to file:', fileError);
            // Continue anyway - we'll log it
        }

        // Also save to log file for backup
        const logPath = path.join(__dirname, 'quotes.log');
        await fs.appendFile(logPath, JSON.stringify(leadData) + '\n');

        res.json({
            success: true,
            message: 'Quote request submitted successfully',
            leadId: leadData.id,
            estimatedCallTime: '30-60 minutes',
            nextSteps: [
                'We will call you within 30-60 minutes',
                'Have your keys and any paperwork ready',
                'We can schedule same-day pickup'
            ]
        });

    } catch (error) {
        console.error('Quote submission error:', error);
        res.status(500).json({ error: 'Failed to submit quote request' });
    }
});

// Alternative form submission endpoint
app.post('/api/submit', async (req, res) => {
    // Redirect to the main quote endpoint
    return app._router.handle(Object.assign(req, { url: '/api/quote' }), res);
});

// Get all leads (admin endpoint)
app.get('/api/leads', authenticateToken, async (req, res) => {
    try {
        const leadsFilePath = path.join(SITE_ROOT, 'admin', 'data', 'leads.json');
        
        if (await fs.pathExists(leadsFilePath)) {
            const fileContent = await fs.readFile(leadsFilePath, 'utf8');
            const leads = JSON.parse(fileContent);
            
            // Calculate stats
            const stats = {
                total_leads: leads.length,
                new_leads: leads.filter(l => l.status === 'new').length,
                today_leads: leads.filter(l => {
                    const leadDate = new Date(l.timestamp);
                    const today = new Date();
                    return leadDate.toDateString() === today.toDateString();
                }).length,
                high_priority_leads: leads.filter(l => l.priority === 'high').length
            };
            
            res.json({
                success: true,
                leads: leads,
                stats: stats
            });
        } else {
            res.json({
                success: true,
                leads: [],
                stats: {
                    total_leads: 0,
                    new_leads: 0,
                    today_leads: 0,
                    high_priority_leads: 0
                }
            });
        }
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Failed to get leads' });
    }
});

// Update lead status (admin endpoint)
app.put('/api/leads/:leadId', authenticateToken, async (req, res) => {
    try {
        const leadId = req.params.leadId;
        const updates = req.body;
        
        const leadsFilePath = path.join(SITE_ROOT, 'admin', 'data', 'leads.json');
        
        if (await fs.pathExists(leadsFilePath)) {
            const fileContent = await fs.readFile(leadsFilePath, 'utf8');
            let leads = JSON.parse(fileContent);
            
            // Find and update lead
            const leadIndex = leads.findIndex(l => l.id === leadId);
            if (leadIndex !== -1) {
                leads[leadIndex] = { ...leads[leadIndex], ...updates };
                
                // Save back to file
                await fs.writeFile(leadsFilePath, JSON.stringify(leads, null, 4));
                
                res.json({
                    success: true,
                    message: 'Lead updated successfully',
                    lead: leads[leadIndex]
                });
            } else {
                res.status(404).json({ error: 'Lead not found' });
            }
        } else {
            res.status(404).json({ error: 'Leads file not found' });
        }
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ 
                error: 'Name and phone are required' 
            });
        }

        const contactData = {
            timestamp: new Date().toISOString(),
            name,
            phone,
            email,
            message,
            type: 'contact',
            ip: req.ip
        };

        // Save to log file
        const logPath = path.join(__dirname, 'contacts.log');
        await fs.appendFile(logPath, JSON.stringify(contactData) + '\n');

        console.log('New contact form:', { name, phone, email });

        res.json({
            success: true,
            message: 'Contact form submitted successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// Image Management Endpoints

// Get all images
app.get('/api/images', authenticateToken, async (req, res) => {
    try {
        const imagesDir = path.join(SITE_ROOT, 'images');
        const files = await fs.readdir(imagesDir);
        
        const imageFiles = [];
        
        for (const file of files) {
            const filePath = path.join(imagesDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
                imageFiles.push({
                    filename: file,
                    path: `/images/${file}`,
                    size: stats.size,
                    modified: stats.mtime,
                    type: path.extname(file).toLowerCase()
                });
            }
        }
        
        res.json({ success: true, images: imageFiles });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({ error: 'Failed to get images' });
    }
});

// Upload new image
app.post('/api/images/upload', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const originalPath = req.file.path;
        const filename = req.file.filename;
        let finalPath = originalPath;
        
        // Optimize image if it's not SVG
        if (!['.svg'].includes(path.extname(filename).toLowerCase())) {
            try {
                await sharp(originalPath)
                    .resize(2000, 2000, { 
                        fit: 'inside',
                        withoutEnlargement: true 
                    })
                    .jpeg({ quality: 85 })
                    .png({ quality: 85 })
                    .webp({ quality: 85 })
                    .toFile(originalPath + '.optimized');
                
                // Replace original with optimized
                await fs.move(originalPath + '.optimized', originalPath, { overwrite: true });
            } catch (optimizeError) {
                console.warn('Image optimization failed, using original:', optimizeError.message);
            }
        }
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            image: {
                filename: filename,
                path: `/images/${filename}`,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Delete image
app.delete('/api/images/:filename', authenticateToken, async (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = path.join(SITE_ROOT, 'images', filename);
        
        // Security check - ensure file is in images directory
        if (!imagePath.startsWith(path.join(SITE_ROOT, 'images'))) {
            return res.status(400).json({ error: 'Invalid file path' });
        }
        
        if (await fs.pathExists(imagePath)) {
            await fs.remove(imagePath);
            res.json({ success: true, message: 'Image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Rename image
app.put('/api/images/:filename/rename', authenticateToken, async (req, res) => {
    try {
        const oldFilename = req.params.filename;
        const { newFilename } = req.body;
        
        if (!newFilename) {
            return res.status(400).json({ error: 'New filename is required' });
        }
        
        const oldPath = path.join(SITE_ROOT, 'images', oldFilename);
        const newPath = path.join(SITE_ROOT, 'images', newFilename);
        
        if (await fs.pathExists(newPath)) {
            return res.status(400).json({ error: 'File with new name already exists' });
        }
        
        if (await fs.pathExists(oldPath)) {
            await fs.move(oldPath, newPath);
            res.json({ 
                success: true, 
                message: 'Image renamed successfully',
                newPath: `/images/${newFilename}`
            });
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (error) {
        console.error('Rename image error:', error);
        res.status(500).json({ error: 'Failed to rename image' });
    }
});

// Helper function to generate page templates
function generatePageTemplate(title, pageName, pageType) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Buy Junk Car Miami</title>
    <meta name="description" content="${title} - Professional junk car removal service in Miami. Call (305) 534-5991 for instant quote.">
    <link rel="stylesheet" href="../css/styles.css">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": "Buy Junk Car Miami",
        "description": "${title} - Professional junk car removal service in Miami-Dade and Broward County.",
        "url": "https://buyjunkcarmiami.com/${pageName}/",
        "telephone": "(305) 534-5991",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "122 South Miami Avenue",
            "addressLocality": "Miami",
            "addressRegion": "FL",
            "postalCode": "33130",
            "addressCountry": "US"
        },
        "openingHours": "Mo-Su 08:00-22:00"
    }
    </script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-top">
                <div class="contact-info">
                    <a href="tel:+13055345991" class="phone-number">📞 (305) 534-5991</a>
                    <span class="hours">Open 8am-10pm Daily</span>
                </div>
            </div>
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="/"><img src="../images/logo.png" alt="Buy Junk Car Miami" width="200" height="60"></a>
                </div>
                <ul class="nav-menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/services/">Services</a></li>
                    <li><a href="/locations/">Locations</a></li>
                    <li><a href="/brands/">Car Brands</a></li>
                    <li><a href="/blog/">Blog</a></li>
                    <li><a href="/contact/">Contact</a></li>
                    <li class="nav-cta"><a href="tel:+13055345991" class="btn btn-primary">Call Now</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>${title}</h1>
                <p class="hero-subtitle">Professional junk car removal service in Miami. Get top cash for your vehicle with free towing!</p>
                
                <div class="hero-cta">
                    <a href="tel:+13055345991" class="btn btn-primary btn-large">📞 Call (305) 534-5991</a>
                    <a href="#quote-form" class="btn btn-secondary btn-large">Get Free Quote</a>
                </div>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="content-grid">
                    <div class="main-content">
                        <h2>About ${title}</h2>
                        <p>This is a new page created through the admin portal. You can edit this content using the admin interface.</p>
                        
                        <h3>Our Services</h3>
                        <ul>
                            <li>Free vehicle evaluation</li>
                            <li>Same-day pickup service</li>
                            <li>Cash payment on the spot</li>
                            <li>Professional towing included</li>
                        </ul>
                    </div>
                    
                    <aside class="sidebar">
                        <div class="quick-quote-form" id="quote-form">
                            <h3>Get Your Quote</h3>
                            <form class="sidebar-form">
                                <input type="text" name="name" placeholder="Your Name*" required>
                                <input type="tel" name="phone" placeholder="Phone Number*" required>
                                <input type="text" name="year" placeholder="Year">
                                <input type="text" name="make" placeholder="Make">
                                <input type="text" name="model" placeholder="Model">
                                <textarea name="condition" placeholder="Vehicle condition..." rows="3"></textarea>
                                <button type="submit" class="btn btn-primary">Get My Quote</button>
                            </form>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Buy Junk Car Miami</p>
        </div>
    </footer>
    
    <script src="../js/app.js"></script>
</body>
</html>`;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Admin backend server running on port ${PORT}`);
    console.log(`📁 Serving site from: ${SITE_ROOT}`);
});

module.exports = app;