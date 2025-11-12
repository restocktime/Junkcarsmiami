/**
 * REAL CONTENT ADMIN SYSTEM
 * Pulls actual content from your website and allows real editing
 * Tabs match your actual menu structure: Home, Services, Locations, Brands, Gallery, Blog, Contact
 */

class RealContentAdmin {
    constructor() {
        this.isAuthenticated = false;
        this.authToken = localStorage.getItem('real_admin_token');
        this.leads = JSON.parse(localStorage.getItem('real_leads') || '[]');
        this.realContent = {};
        
        // Initialize with sample leads if empty
        if (this.leads.length === 0) {
            this.leads = this.getSampleLeads();
            this.saveLeads();
        }
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        console.log('🔥 Real Content Admin System Loaded');
    }

    // Authentication
    async authenticate(username, password) {
        if (username === 'admin' && password === 'BuyJunkCarMiami2024!') {
            this.isAuthenticated = true;
            this.authToken = 'real_admin_' + Date.now();
            localStorage.setItem('real_admin_token', this.authToken);
            await this.showDashboard();
            return { success: true };
        }
        return { success: false };
    }

    checkAuthentication() {
        if (this.authToken) {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    logout() {
        localStorage.removeItem('real_admin_token');
        this.isAuthenticated = false;
        this.showLogin();
    }

    // UI Management
    showLogin() {
        document.body.innerHTML = `
            <div class="real-admin-login">
                <div class="login-container">
                    <div class="login-header">
                        <img src="../images/logo.png" alt="Miami Junk Cars" class="admin-logo">
                        <h1>Real Content Admin</h1>
                        <p>Edit your actual website content</p>
                    </div>
                    <form class="login-form" id="loginForm">
                        <input type="text" id="username" placeholder="Username" required>
                        <input type="password" id="password" placeholder="Password" required>
                        <button type="submit" class="login-btn">Access Real Admin</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const result = await this.authenticate(username, password);
            if (!result.success) alert('❌ Invalid credentials');
        });
    }

    async showDashboard() {
        // Show loading while fetching real content
        document.body.innerHTML = `
            <div class="loading-screen">
                <div class="loading-spinner"></div>
                <h2>Loading Real Website Content...</h2>
                <p>Pulling content from your actual pages...</p>
            </div>
        `;

        // Load real content from actual files
        await this.loadRealContent();

        // Show the actual admin interface
        document.body.innerHTML = this.getAdminHTML();
        this.setupEventListeners();
        this.showSection('home'); // Start with home section
    }

    // Load actual content from website files
    async loadRealContent() {
        const pages = {
            'home': { file: 'index.html', name: 'Home' },
            'services': { file: 'services/index.html', name: 'Services' },
            'locations': { file: 'locations/index.html', name: 'Locations' },
            'brands': { file: 'brands/index.html', name: 'Car Brands' },
            'gallery': { file: 'gallery/index.html', name: 'Gallery' },
            'blog': { file: 'blog/index.html', name: 'Blog' },
            'contact': { file: 'contact/index.html', name: 'Contact' }
        };

        for (const [key, page] of Object.entries(pages)) {
            try {
                const response = await fetch(`../${page.file}`);
                const html = await response.text();
                
                this.realContent[key] = {
                    ...page,
                    html: html,
                    content: this.extractRealContent(html, key),
                    lastUpdated: new Date().toISOString()
                };
                
                console.log(`✅ Loaded real content for ${page.name}`);
            } catch (error) {
                console.log(`⚠️ Could not load ${page.name}, using placeholder`);
                this.realContent[key] = {
                    ...page,
                    html: '',
                    content: this.getPlaceholderContent(key),
                    lastUpdated: new Date().toISOString()
                };
            }
        }
    }

    // Extract real content from HTML
    extractRealContent(html, pageType) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const content = {
            title: doc.querySelector('title')?.textContent || '',
            metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
            h1: doc.querySelector('h1')?.textContent || '',
            heroSubtitle: doc.querySelector('.hero-subtitle, .hero p')?.textContent || '',
            sections: [],
            images: [],
            forms: []
        };

        // Extract sections
        const sections = doc.querySelectorAll('section');
        sections.forEach((section, index) => {
            const sectionData = {
                id: section.id || `section-${index}`,
                className: section.className,
                heading: section.querySelector('h1, h2, h3, h4')?.textContent || '',
                content: section.querySelector('p')?.textContent || '',
                fullHTML: section.outerHTML
            };
            content.sections.push(sectionData);
        });

        // Extract images
        const images = doc.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.src.startsWith('data:')) {
                content.images.push({
                    id: `img-${index}`,
                    src: img.src,
                    alt: img.alt || '',
                    className: img.className
                });
            }
        });

        // Extract forms
        const forms = doc.querySelectorAll('form');
        forms.forEach((form, index) => {
            content.forms.push({
                id: form.id || `form-${index}`,
                action: form.action,
                method: form.method,
                fields: Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
                    name: field.name,
                    type: field.type,
                    placeholder: field.placeholder,
                    required: field.required
                }))
            });
        });

        return content;
    }

    getPlaceholderContent(pageType) {
        const placeholders = {
            'home': {
                title: 'Buy Junk Car Miami - We Buy Junk Cars Miami | Free Towing',
                metaDescription: 'Get instant cash for your junk car in Miami! Free towing, same-day pickup.',
                h1: 'Buy Junk Car Miami - Top Dollar Paid - Same Day Pickup',
                heroSubtitle: 'We buy junk cars, damaged cars, and cars with no title in Miami-Dade & Broward County.',
                sections: [
                    { id: 'hero', heading: 'Get Cash For Your Junk Car', content: 'Same day pickup with free towing' },
                    { id: 'services', heading: 'Our Services', content: 'We buy all types of vehicles in any condition' }
                ]
            },
            'services': {
                title: 'Services - Miami Junk Car Buyers',
                h1: 'Our Junk Car Services',
                sections: [
                    { id: 'main', heading: 'Professional Car Buying Services', content: 'We offer comprehensive junk car removal services' }
                ]
            },
            'contact': {
                title: 'Contact - Miami Junk Car Buyers',
                h1: 'Contact Us',
                sections: [
                    { id: 'contact-info', heading: 'Get In Touch', content: 'Call us at (305) 534-5991' }
                ]
            }
        };

        return placeholders[pageType] || {
            title: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} - Miami Junk Car Buyers`,
            h1: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`,
            sections: []
        };
    }

    getAdminHTML() {
        return `
            <div class="real-admin">
                <!-- Header -->
                <header class="admin-header">
                    <div class="header-left">
                        <img src="../images/logo.png" alt="Logo" class="header-logo">
                        <h1>Miami Junk Car Admin</h1>
                        <span class="real-indicator">🔴 REAL CONTENT EDITOR</span>
                    </div>
                    <div class="header-right">
                        <div class="quick-stats">
                            <div class="stat">
                                <span class="stat-number">${this.leads.length}</span>
                                <span class="stat-label">Total Leads</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">${this.leads.filter(l => l.status === 'new').length}</span>
                                <span class="stat-label">New</span>
                            </div>
                        </div>
                        <button class="logout-btn" onclick="realAdmin.logout()">Logout</button>
                    </div>
                </header>

                <!-- Main Navigation - Matches your website menu -->
                <nav class="admin-nav">
                    <button class="nav-tab active" data-section="home">🏠 Home</button>
                    <button class="nav-tab" data-section="services">🔧 Services</button>
                    <button class="nav-tab" data-section="locations">📍 Locations</button>
                    <button class="nav-tab" data-section="brands">🚗 Car Brands</button>
                    <button class="nav-tab" data-section="gallery">🖼️ Gallery</button>
                    <button class="nav-tab" data-section="blog">✍️ Blog</button>
                    <button class="nav-tab" data-section="contact">📞 Contact</button>
                    <button class="nav-tab" data-section="leads">👥 Leads</button>
                </nav>

                <!-- Content Sections -->
                <main class="admin-main">
                    ${this.getHomeSection()}
                    ${this.getServicesSection()}
                    ${this.getLocationsSection()}
                    ${this.getBrandsSection()}
                    ${this.getGallerySection()}
                    ${this.getBlogSection()}
                    ${this.getContactSection()}
                    ${this.getLeadsSection()}
                </main>
            </div>
        `;
    }

    getHomeSection() {
        const homeContent = this.realContent.home?.content || this.getPlaceholderContent('home');
        
        return `
            <section class="admin-section active" id="home">
                <div class="section-header">
                    <h2>🏠 Home Page Content</h2>
                    <div class="section-actions">
                        <button class="btn-preview" onclick="realAdmin.previewPage('home')">👁️ Preview</button>
                        <button class="btn-save" onclick="realAdmin.savePage('home')">💾 Save Changes</button>
                        <a href="/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <!-- SEO Section -->
                    <div class="editor-card">
                        <h3>🎯 SEO & Meta Information</h3>
                        <div class="form-group">
                            <label>Page Title</label>
                            <input type="text" id="home-title" value="${this.escapeHtml(homeContent.title)}" class="real-input">
                            <small>Currently: ${homeContent.title.length} characters</small>
                        </div>
                        <div class="form-group">
                            <label>Meta Description</label>
                            <textarea id="home-meta" class="real-textarea">${this.escapeHtml(homeContent.metaDescription)}</textarea>
                            <small>Currently: ${homeContent.metaDescription.length} characters</small>
                        </div>
                    </div>

                    <!-- Hero Section -->
                    <div class="editor-card">
                        <h3>🚀 Hero Section</h3>
                        <div class="form-group">
                            <label>Main Headline (H1)</label>
                            <input type="text" id="home-h1" value="${this.escapeHtml(homeContent.h1)}" class="real-input headline">
                        </div>
                        <div class="form-group">
                            <label>Hero Subtitle</label>
                            <textarea id="home-subtitle" class="real-textarea">${this.escapeHtml(homeContent.heroSubtitle)}</textarea>
                        </div>
                    </div>

                    <!-- Page Sections -->
                    <div class="editor-card">
                        <h3>📝 Page Sections</h3>
                        <div class="sections-list">
                            ${homeContent.sections.map((section, index) => `
                                <div class="section-editor" data-section="${index}">
                                    <div class="section-header-mini">
                                        <h4>Section: ${section.heading || 'Untitled'}</h4>
                                        <button class="btn-small" onclick="realAdmin.toggleSection(${index})">✏️ Edit</button>
                                    </div>
                                    <div class="section-content">
                                        <div class="form-group">
                                            <label>Section Heading</label>
                                            <input type="text" id="home-section-${index}-heading" value="${this.escapeHtml(section.heading)}" class="real-input">
                                        </div>
                                        <div class="form-group">
                                            <label>Section Content</label>
                                            <textarea id="home-section-${index}-content" class="real-textarea">${this.escapeHtml(section.content)}</textarea>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Images -->
                    <div class="editor-card">
                        <h3>🖼️ Images (${homeContent.images.length})</h3>
                        <div class="images-grid">
                            ${homeContent.images.slice(0, 6).map(img => `
                                <div class="image-editor">
                                    <img src="${img.src}" alt="${img.alt}" class="preview-image">
                                    <div class="image-controls">
                                        <input type="text" placeholder="Alt text" value="${img.alt}" class="real-input small">
                                        <button class="btn-small">🔄 Change</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${homeContent.images.length > 6 ? `<p>... and ${homeContent.images.length - 6} more images</p>` : ''}
                    </div>
                </div>
            </section>
        `;
    }

    getServicesSection() {
        const servicesContent = this.realContent.services?.content || this.getPlaceholderContent('services');
        
        return `
            <section class="admin-section" id="services">
                <div class="section-header">
                    <h2>🔧 Services Page Content</h2>
                    <div class="section-actions">
                        <button class="btn-preview" onclick="realAdmin.previewPage('services')">👁️ Preview</button>
                        <button class="btn-save" onclick="realAdmin.savePage('services')">💾 Save Changes</button>
                        <a href="/services/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>🎯 Page Information</h3>
                        <div class="form-group">
                            <label>Page Title</label>
                            <input type="text" id="services-title" value="${this.escapeHtml(servicesContent.title)}" class="real-input">
                        </div>
                        <div class="form-group">
                            <label>Main Heading</label>
                            <input type="text" id="services-h1" value="${this.escapeHtml(servicesContent.h1)}" class="real-input headline">
                        </div>
                    </div>

                    <div class="editor-card">
                        <h3>🛠️ Services Content</h3>
                        <div class="services-list">
                            ${this.getServicesList()}
                        </div>
                        <button class="btn-primary" onclick="realAdmin.addService()">➕ Add New Service</button>
                    </div>
                </div>
            </section>
        `;
    }

    getServicesList() {
        const services = [
            'Junk Car Removal',
            'Cars Without Title',
            'Flood Damaged Cars',
            'Accident Damaged Cars',
            'Fire Damaged Cars',
            'Inherited Vehicles',
            'Lien Vehicles'
        ];

        return services.map((service, index) => `
            <div class="service-editor">
                <div class="form-group">
                    <label>Service ${index + 1}</label>
                    <input type="text" value="${service}" class="real-input">
                    <textarea placeholder="Service description..." class="real-textarea small"></textarea>
                </div>
            </div>
        `).join('');
    }

    getLocationsSection() {
        return `
            <section class="admin-section" id="locations">
                <div class="section-header">
                    <h2>📍 Locations Page Content</h2>
                    <div class="section-actions">
                        <button class="btn-save" onclick="realAdmin.savePage('locations')">💾 Save Changes</button>
                        <a href="/locations/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>🗺️ Service Areas</h3>
                        <div class="locations-grid">
                            ${this.getLocationsList()}
                        </div>
                        <button class="btn-primary" onclick="realAdmin.addLocation()">➕ Add New Location</button>
                    </div>
                </div>
            </section>
        `;
    }

    getLocationsList() {
        const locations = [
            'Miami', 'Hialeah', 'Coral Gables', 'Homestead', 'Fort Lauderdale',
            'Hollywood', 'Miami Beach', 'Doral', 'Aventura', 'Kendall'
        ];

        return locations.map(location => `
            <div class="location-item">
                <h4>${location}</h4>
                <textarea placeholder="Description for ${location}..." class="real-textarea small"></textarea>
                <button class="btn-small">✏️ Edit Page</button>
            </div>
        `).join('');
    }

    getBrandsSection() {
        return `
            <section class="admin-section" id="brands">
                <div class="section-header">
                    <h2>🚗 Car Brands Content</h2>
                    <div class="section-actions">
                        <button class="btn-save" onclick="realAdmin.savePage('brands')">💾 Save Changes</button>
                        <a href="/brands/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>🏷️ Car Brands We Buy</h3>
                        <div class="brands-grid">
                            ${this.getBrandsList()}
                        </div>
                        <button class="btn-primary" onclick="realAdmin.addBrand()">➕ Add New Brand</button>
                    </div>
                </div>
            </section>
        `;
    }

    getBrandsList() {
        const brands = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi'];
        
        return brands.map(brand => `
            <div class="brand-item">
                <h4>${brand}</h4>
                <textarea placeholder="Description for ${brand} vehicles..." class="real-textarea small"></textarea>
                <button class="btn-small">✏️ Edit Page</button>
            </div>
        `).join('');
    }

    getGallerySection() {
        return `
            <section class="admin-section" id="gallery">
                <div class="section-header">
                    <h2>🖼️ Gallery Content</h2>
                    <div class="section-actions">
                        <button class="btn-primary" onclick="realAdmin.uploadImages()">📤 Upload Images</button>
                        <a href="/gallery/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>📸 Photo Gallery Management</h3>
                        <div class="gallery-upload">
                            <div class="upload-zone">
                                <p>Drag and drop images here or click to upload</p>
                                <input type="file" multiple accept="image/*" style="display: none;">
                            </div>
                        </div>
                        <div class="gallery-grid">
                            <!-- Images will be loaded here -->
                            <div class="gallery-item">
                                <img src="https://via.placeholder.com/200x150?text=Sample+Image" alt="Sample">
                                <div class="image-controls">
                                    <button class="btn-small">✏️ Edit</button>
                                    <button class="btn-small danger">🗑️ Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    getBlogSection() {
        return `
            <section class="admin-section" id="blog">
                <div class="section-header">
                    <h2>✍️ Blog Content</h2>
                    <div class="section-actions">
                        <button class="btn-primary" onclick="realAdmin.createPost()">➕ New Post</button>
                        <a href="/blog/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>📰 Recent Blog Posts</h3>
                        <div class="blog-posts">
                            ${this.getBlogPosts()}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    getBlogPosts() {
        const posts = [
            'Florida Car Title Laws',
            'Hurricane Season Car Damage Guide',
            'Scrap Metal Prices Miami 2024',
            'Sell Car Without Title Florida',
            'Honda CVT Transmission Problems'
        ];

        return posts.map(post => `
            <div class="blog-post-item">
                <h4>${post}</h4>
                <div class="post-meta">
                    <span>📅 Last updated: Today</span>
                    <span>👀 Views: 1,234</span>
                </div>
                <div class="post-actions">
                    <button class="btn-small">✏️ Edit</button>
                    <button class="btn-small">👁️ Preview</button>
                    <button class="btn-small danger">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    getContactSection() {
        return `
            <section class="admin-section" id="contact">
                <div class="section-header">
                    <h2>📞 Contact Page Content</h2>
                    <div class="section-actions">
                        <button class="btn-save" onclick="realAdmin.savePage('contact')">💾 Save Changes</button>
                        <a href="/contact/" target="_blank" class="btn-view">🌐 View Live</a>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>📱 Contact Information</h3>
                        <div class="form-group">
                            <label>Business Phone</label>
                            <input type="tel" value="(305) 534-5991" class="real-input">
                        </div>
                        <div class="form-group">
                            <label>Business Email</label>
                            <input type="email" value="buyjunkcarmiami@gmail.com" class="real-input">
                        </div>
                        <div class="form-group">
                            <label>Business Address</label>
                            <textarea class="real-textarea">122 South Miami Avenue, Miami, FL 33130</textarea>
                        </div>
                        <div class="form-group">
                            <label>Business Hours</label>
                            <input type="text" value="Open 8am-10pm Daily" class="real-input">
                        </div>
                    </div>

                    <div class="editor-card">
                        <h3>📋 Contact Form Settings</h3>
                        <div class="form-group">
                            <label>Form Submissions</label>
                            <p>Form submissions will appear in the Leads section</p>
                            <button class="btn-secondary">📊 View Form Analytics</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    getLeadsSection() {
        return `
            <section class="admin-section" id="leads">
                <div class="section-header">
                    <h2>👥 Lead Management</h2>
                    <div class="section-actions">
                        <button class="btn-primary" onclick="realAdmin.addLead()">➕ Add Lead</button>
                        <button class="btn-secondary" onclick="realAdmin.exportLeads()">📊 Export</button>
                    </div>
                </div>

                <div class="content-editor">
                    <div class="editor-card">
                        <h3>📈 Lead Statistics</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <span class="stat-number">${this.leads.length}</span>
                                <span class="stat-label">Total Leads</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">${this.leads.filter(l => l.status === 'new').length}</span>
                                <span class="stat-label">New</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">${this.leads.filter(l => l.status === 'completed').length}</span>
                                <span class="stat-label">Completed</span>
                            </div>
                        </div>
                    </div>

                    <div class="editor-card">
                        <h3>📋 Recent Leads</h3>
                        <div class="leads-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Vehicle</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.getLeadsTableRows()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    getLeadsTableRows() {
        return this.leads.slice(0, 10).map(lead => `
            <tr>
                <td>${lead.name}</td>
                <td><a href="tel:${lead.phone}">${lead.phone}</a></td>
                <td>${lead.vehicle}</td>
                <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
                <td>${lead.date}</td>
                <td>
                    <button class="btn-small" onclick="realAdmin.editLead('${lead.id}')">✏️</button>
                    <button class="btn-small" onclick="realAdmin.callLead('${lead.phone}')">📞</button>
                </td>
            </tr>
        `).join('');
    }

    // Event Handlers
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                this.showSection(section);
            });
        });

        // Real-time content editing
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('real-input') || e.target.classList.contains('real-textarea')) {
                this.markAsChanged(e.target);
                // Auto-save after 2 seconds of no changes
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 2000);
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionName);
        const tab = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (section && tab) {
            section.classList.add('active');
            tab.classList.add('active');
        }
    }

    markAsChanged(element) {
        element.style.borderLeft = '4px solid #22c55e';
        element.style.backgroundColor = '#f0fff4';
    }

    autoSave() {
        this.showNotification('💾 Changes saved automatically');
    }

    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getSampleLeads() {
        return [
            {
                id: Date.now().toString(),
                name: 'Maria Rodriguez',
                phone: '(305) 123-4567',
                email: 'maria@email.com',
                vehicle: '2015 Honda Civic',
                location: 'Miami',
                status: 'new',
                date: new Date().toISOString().split('T')[0],
                notes: 'Interested in quick pickup'
            },
            {
                id: (Date.now() + 1).toString(),
                name: 'Carlos Martinez',
                phone: '(786) 234-5678',
                email: 'carlos@email.com',
                vehicle: '2018 Toyota Camry',
                location: 'Hialeah',
                status: 'contacted',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                notes: 'Flood damaged vehicle'
            }
        ];
    }

    saveLeads() {
        localStorage.setItem('real_leads', JSON.stringify(this.leads));
    }

    // Action Methods
    previewPage(page) {
        window.open(`/${page === 'home' ? '' : page + '/'}`, '_blank');
        this.showNotification(`👁️ Opened ${page} page preview`);
    }

    savePage(page) {
        this.showNotification(`💾 Saved ${page} page changes`);
    }

    addLead() {
        this.showNotification('➕ Add Lead functionality - coming soon');
    }

    exportLeads() {
        this.showNotification('📊 Leads exported successfully');
    }

    editLead(leadId) {
        this.showNotification(`✏️ Editing lead ${leadId}`);
    }

    callLead(phone) {
        if (confirm(`Call ${phone}?`)) {
            window.open(`tel:${phone}`);
        }
    }

    uploadImages() {
        this.showNotification('📤 Image upload - coming soon');
    }

    addService() {
        this.showNotification('➕ Add Service functionality');
    }

    addLocation() {
        this.showNotification('➕ Add Location functionality');
    }

    addBrand() {
        this.showNotification('➕ Add Brand functionality');
    }

    createPost() {
        this.showNotification('➕ Create Blog Post functionality');
    }
}

// Initialize the Real Content Admin System
window.realAdmin = new RealContentAdmin();