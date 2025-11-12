/**
 * Commercial Grade Admin Panel
 * Direct file manipulation without server dependencies
 * Real-time website updates
 */

class MiamiJunkCarAdmin {
    constructor() {
        this.isAuthenticated = false;
        this.authToken = localStorage.getItem('mjc_admin_token');
        this.leads = JSON.parse(localStorage.getItem('mjc_leads') || '[]');
        
        // Initialize with sample data if empty
        if (this.leads.length === 0) {
            this.leads = [
                {
                    id: Date.now().toString(),
                    name: 'Maria Rodriguez',
                    phone: '(305) 123-4567',
                    email: 'maria@email.com',
                    vehicle: '2015 Honda Civic',
                    location: 'Miami',
                    status: 'new',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Flood damaged vehicle, keys available'
                },
                {
                    id: (Date.now() + 1).toString(),
                    name: 'James Wilson',
                    phone: '(786) 234-5678',
                    email: 'james@email.com',
                    vehicle: '2018 Toyota Camry',
                    location: 'Doral',
                    status: 'contacted',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Accident damage, insurance total'
                },
                {
                    id: (Date.now() + 2).toString(),
                    name: 'Carlos Mendez',
                    phone: '(305) 345-6789',
                    email: 'carlos@email.com',
                    vehicle: '2012 Ford F-150',
                    location: 'Hialeah',
                    status: 'completed',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'High mileage truck, pickup completed'
                }
            ];
            this.saveLeads();
        }
        this.websiteContent = new Map();
        this.fileManager = window.FileManager;
        this.hasFileAccess = false;
        this.init();
    }

    init() {
        this.loadWebsiteContent();
        this.setupEventListeners();
        this.checkAuthentication();
        console.log('🚀 Miami Junk Car Commercial Admin System Loaded');
    }

    // Authentication System
    async authenticate(username, password) {
        const validCredentials = {
            username: 'admin',
            password: 'BuyJunkCarMiami2024!'
        };

        if (username === validCredentials.username && password === validCredentials.password) {
            this.isAuthenticated = true;
            this.authToken = 'mjc_admin_' + Date.now();
            localStorage.setItem('mjc_admin_token', this.authToken);
            this.showDashboard();
            return { success: true, message: 'Login successful' };
        }
        
        return { success: false, message: 'Invalid credentials' };
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
        this.isAuthenticated = false;
        localStorage.removeItem('mjc_admin_token');
        this.showLogin();
    }

    // UI Management
    showLogin() {
        const loginHTML = `
            <div class="admin-login-screen">
                <div class="login-container">
                    <div class="login-header">
                        <img src="../images/logo.png" alt="Miami Junk Cars" class="admin-logo">
                        <h1>Admin Portal</h1>
                        <p>Miami Junk Car Buyers Management System</p>
                    </div>
                    <form class="login-form" id="loginForm">
                        <div class="form-group">
                            <input type="text" id="adminUsername" placeholder="Username" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="adminPassword" placeholder="Password" required>
                        </div>
                        <button type="submit" class="login-btn">Access Admin Panel</button>
                    </form>
                    <div class="login-footer">
                        <p>Commercial Grade Admin System v2.0</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = loginHTML;
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            const result = await this.authenticate(username, password);
            if (!result.success) {
                alert('❌ ' + result.message);
            }
        });
    }

    showDashboard() {
        // Try to find admin panel div, otherwise use body
        const adminPanel = document.getElementById('adminPanel');
        const container = adminPanel || document.body;
        
        container.innerHTML = this.getDashboardHTML();
        this.loadDashboardData();
        this.setupDashboardEvents();
    }

    getDashboardHTML() {
        return `
            <div class="admin-dashboard">
                <header class="admin-header">
                    <div class="header-left">
                        <img src="../images/logo.png" alt="Logo" class="header-logo">
                        <h1>Miami Junk Car Admin</h1>
                    </div>
                    <div class="header-right">
                        <span class="admin-status">🟢 Commercial System Active</span>
                        <button class="logout-btn" onclick="admin.logout()">Logout</button>
                    </div>
                </header>

                <nav class="admin-nav">
                    <button class="nav-btn active" data-section="dashboard">📊 Dashboard</button>
                    <button class="nav-btn" data-section="leads">👥 Leads</button>
                    <button class="nav-btn" data-section="content">📝 Website Content</button>
                    <button class="nav-btn" data-section="pages">📄 Pages</button>
                    <button class="nav-btn" data-section="seo">🎯 SEO</button>
                </nav>

                <main class="admin-main">
                    <section id="dashboard" class="admin-section active">
                        <div class="section-header">
                            <h2>Dashboard Overview</h2>
                            <div class="real-time-indicator">🟢 Real-time Updates Active</div>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">👥</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="totalLeads">0</div>
                                    <div class="stat-label">Total Leads</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🆕</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="newLeads">0</div>
                                    <div class="stat-label">New Leads</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">💰</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="convertedLeads">0</div>
                                    <div class="stat-label">Converted</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📄</div>
                                <div class="stat-content">
                                    <div class="stat-number" id="totalPages">47</div>
                                    <div class="stat-label">Website Pages</div>
                                </div>
                            </div>
                        </div>
                        <div class="recent-activity">
                            <h3>Recent Activity</h3>
                            <div id="activityFeed" class="activity-feed"></div>
                        </div>
                    </section>

                    <section id="leads" class="admin-section">
                        <div class="section-header">
                            <h2>Lead Management</h2>
                            <div class="section-actions">
                                <button class="btn-primary" onclick="admin.addLead()">➕ Add Lead</button>
                                <button class="btn-secondary" onclick="admin.exportLeads()">📊 Export CSV</button>
                            </div>
                        </div>
                        <div class="leads-controls">
                            <input type="text" id="leadSearch" placeholder="🔍 Search leads..." onkeyup="admin.searchLeads()">
                            <select id="leadFilter" onchange="admin.filterLeads()">
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="quoted">Quoted</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div class="leads-table-container">
                            <table class="leads-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Vehicle</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="leadsTableBody"></tbody>
                            </table>
                        </div>
                    </section>

                    <section id="content" class="admin-section">
                        <div class="section-header">
                            <h2>🔴 LIVE Website Content Editor</h2>
                            <div class="section-actions">
                                <button class="btn-primary" onclick="admin.refreshContent()">🔄 Refresh from Website</button>
                                <button class="btn-secondary" onclick="admin.saveAllChanges()">💾 Save All Changes</button>
                            </div>
                        </div>
                        <div class="live-editor-container" id="liveEditorContainer">
                            <div class="loading-content">
                                <div class="loading-spinner"></div>
                                <p>Loading live website content...</p>
                            </div>
                        </div>
                    </section>

                    <section id="pages" class="admin-section">
                        <div class="section-header">
                            <h2>Page Management</h2>
                            <button class="btn-primary" onclick="admin.createPage()">➕ Create New Page</button>
                        </div>
                        <div class="pages-grid" id="pagesGrid"></div>
                    </section>

                    <section id="seo" class="admin-section">
                        <div class="section-header">
                            <h2>SEO Management</h2>
                        </div>
                        <div class="seo-tools">
                            <div class="seo-card">
                                <h3>Meta Information</h3>
                                <div class="form-group">
                                    <label>Site Title</label>
                                    <input type="text" id="siteTitle" class="content-input">
                                </div>
                                <div class="form-group">
                                    <label>Meta Description</label>
                                    <textarea id="metaDescription" class="content-textarea"></textarea>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        `;
    }

    setupEventListeners() {
        // Content editing with real-time updates
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('content-input') || e.target.classList.contains('content-textarea')) {
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    this.updateWebsiteContent(e.target);
                }, 1000); // 1 second delay for real-time updates
            }
        });
    }

    setupDashboardEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.showSection(section);
                
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.showTab(tab);
            });
        });

        this.loadLeadsTable();
    }

    showSection(sectionName) {
        // Remove active class from all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Add active class to target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error(`Section not found: ${sectionName}`);
            return;
        }

        // Load data when sections are accessed
        if (sectionName === 'pages') {
            this.loadPagesList();
        } else if (sectionName === 'content') {
            this.loadLiveContent();
        }
    }

    showTab(tabName) {
        // Remove active from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.editor-panel').forEach(panel => panel.classList.remove('active'));
        
        // Add active to selected tab and panel
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        const targetPanel = document.getElementById(tabName);
        
        if (targetTab && targetPanel) {
            targetTab.classList.add('active');
            targetPanel.classList.add('active');
        } else {
            console.error(`Tab or panel not found: ${tabName}`);
        }
    }

    // Lead Management
    addLead() {
        const leadData = {
            id: Date.now().toString(),
            name: prompt('Customer Name:'),
            phone: prompt('Phone Number:'),
            email: prompt('Email:') || '',
            vehicle: prompt('Vehicle (Year Make Model):'),
            location: prompt('Location:'),
            status: 'new',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        };

        if (leadData.name && leadData.phone && leadData.vehicle) {
            this.leads.push(leadData);
            this.saveLeads();
            this.loadLeadsTable();
            this.updateStats();
            this.logActivity(`New lead added: ${leadData.name}`);
            alert('✅ Lead added successfully!');
        }
    }

    saveLeads() {
        localStorage.setItem('mjc_leads', JSON.stringify(this.leads));
    }

    loadLeadsTable() {
        const tbody = document.getElementById('leadsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.leads.map(lead => `
            <tr>
                <td>#${lead.id.slice(-6)}</td>
                <td>${lead.name}</td>
                <td><a href="tel:${lead.phone}">${lead.phone}</a></td>
                <td>${lead.vehicle}</td>
                <td>${lead.location}</td>
                <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
                <td>${lead.date}</td>
                <td>
                    <button class="btn-small" onclick="admin.editLead('${lead.id}')">✏️</button>
                    <button class="btn-small" onclick="admin.callLead('${lead.phone}')">📞</button>
                    <button class="btn-small danger" onclick="admin.deleteLead('${lead.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    editLead(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        const newStatus = prompt(`Update status for ${lead.name}:\n\nCurrent: ${lead.status}\n\nOptions: new, contacted, quoted, scheduled, completed`, lead.status);
        
        if (newStatus && ['new', 'contacted', 'quoted', 'scheduled', 'completed'].includes(newStatus)) {
            lead.status = newStatus;
            this.saveLeads();
            this.loadLeadsTable();
            this.updateStats();
            this.logActivity(`Lead status updated: ${lead.name} → ${newStatus}`);
        }
    }

    callLead(phone) {
        if (confirm(`Call ${phone}?`)) {
            window.open(`tel:${phone}`);
            this.logActivity(`Phone call initiated: ${phone}`);
        }
    }

    deleteLead(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        if (confirm(`Delete lead: ${lead.name}?`)) {
            this.leads = this.leads.filter(l => l.id !== leadId);
            this.saveLeads();
            this.loadLeadsTable();
            this.updateStats();
            this.logActivity(`Lead deleted: ${lead.name}`);
        }
    }

    searchLeads() {
        const query = document.getElementById('leadSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#leadsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }

    filterLeads() {
        const status = document.getElementById('leadFilter').value;
        const rows = document.querySelectorAll('#leadsTableBody tr');
        
        rows.forEach(row => {
            if (!status) {
                row.style.display = '';
            } else {
                const statusBadge = row.querySelector('.status-badge');
                row.style.display = statusBadge.textContent.includes(status) ? '' : 'none';
            }
        });
    }

    exportLeads() {
        const csv = 'ID,Name,Phone,Email,Vehicle,Location,Status,Date\n' +
            this.leads.map(lead => 
                `${lead.id},"${lead.name}","${lead.phone}","${lead.email}","${lead.vehicle}","${lead.location}","${lead.status}","${lead.date}"`
            ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `miami-junk-car-leads-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.logActivity('Leads exported to CSV');
    }

    // Real-time Content Updates
    async updateWebsiteContent(input) {
        const target = input.dataset.target;
        const field = input.dataset.field;
        const value = input.value;

        // Direct file manipulation using File Manager
        await this.updateFileContent(target, field, value);
        
        this.logActivity(`Content updated: ${target} → ${field}`);
        
        // Show visual feedback
        input.style.borderColor = '#4ade80';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 1000);
    }

    async updateFileContent(target, field, value) {
        try {
            // Map target to actual file paths
            const fileMapping = {
                'homepage': 'index.html',
                'services': 'services/index.html',
                'locations': 'locations/index.html',
                'contact': 'contact/index.html'
            };

            const filePath = fileMapping[target];
            if (!filePath) {
                console.error('Unknown target:', target);
                return;
            }

            // Map field to HTML selector
            const selectorMapping = {
                'headline': 'h1',
                'description': 'hero-subtitle',
                'phone': 'phone',
                'title': 'h1',
                'subtitle': 'hero-subtitle'
            };

            const selector = selectorMapping[field] || field;

            // Queue the update with File Manager
            this.fileManager.queueUpdate(filePath, selector, value);
            
            console.log(`🔄 Queued update: ${filePath} → ${selector} = "${value}"`);
            this.showUpdateNotification(`Updating ${target} ${field}...`);
            
        } catch (error) {
            console.error('Update failed:', error);
            this.showUpdateNotification(`❌ Update failed: ${error.message}`);
        }
    }

    showUpdateNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.textContent = `✅ ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Dashboard Data
    loadDashboardData() {
        this.updateStats();
        this.loadActivity();
    }

    updateStats() {
        const stats = {
            total: this.leads.length,
            new: this.leads.filter(l => l.status === 'new').length,
            converted: this.leads.filter(l => l.status === 'completed').length
        };

        const totalEl = document.getElementById('totalLeads');
        const newEl = document.getElementById('newLeads');
        const convertedEl = document.getElementById('convertedLeads');

        if (totalEl) totalEl.textContent = stats.total;
        if (newEl) newEl.textContent = stats.new;
        if (convertedEl) convertedEl.textContent = stats.converted;
    }

    loadActivity() {
        const activities = JSON.parse(localStorage.getItem('mjc_activity') || '[]');
        const feed = document.getElementById('activityFeed');
        
        if (feed) {
            feed.innerHTML = activities.slice(-10).reverse().map(activity => `
                <div class="activity-item">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-text">${activity.message}</div>
                </div>
            `).join('');
        }
    }

    logActivity(message) {
        const activities = JSON.parse(localStorage.getItem('mjc_activity') || '[]');
        activities.push({
            time: new Date().toLocaleTimeString(),
            message: message,
            timestamp: Date.now()
        });
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(0, activities.length - 100);
        }
        
        localStorage.setItem('mjc_activity', JSON.stringify(activities));
        this.loadActivity();
    }

    // Website Content Loading
    async loadWebsiteContent() {
        // Load and parse existing website content
        // This would integrate with the actual files in a full system
        console.log('📁 Loading website content structure...');
    }

    // File System Access
    async requestFileAccess() {
        try {
            const success = await this.fileManager.requestFileSystemAccess();
            if (success) {
                this.hasFileAccess = true;
                this.updateFileAccessUI(true);
                this.showUpdateNotification('✅ File system access granted! Live editing enabled.');
                this.logActivity('File system access granted - live editing enabled');
            } else {
                this.showUpdateNotification('ℹ️ File access cancelled. Admin still works in simulation mode.');
            }
        } catch (error) {
            console.log('File access error:', error.message);
            this.showUpdateNotification('ℹ️ File access not available. Using simulation mode.');
        }
    }

    updateFileAccessUI(hasAccess) {
        const btn = document.getElementById('fileAccessBtn');
        if (btn) {
            if (hasAccess) {
                btn.textContent = '✅ Live Editing Active';
                btn.style.background = '#22c55e';
                btn.style.color = 'white';
                btn.disabled = true;
            } else {
                btn.textContent = '📁 Enable Live Editing';
            }
        }

        // Update indicators
        const indicators = document.querySelectorAll('.live-indicator');
        indicators.forEach(indicator => {
            indicator.textContent = hasAccess ? 
                '🟢 LIVE - Changes update files instantly!' : 
                '🟡 DEMO - Enable file access for live updates';
        });
    }

    // Page Management
    async createPage() {
        const pageName = prompt('Page Name (e.g., "about-us"):');
        if (!pageName) return;
        
        const pageTitle = prompt('Page Title:');
        if (!pageTitle) return;

        const pageDescription = prompt('Meta Description:') || `${pageTitle} - Buy Junk Car Miami`;
        const pageSubtitle = prompt('Hero Subtitle:') || 'Professional junk car removal service in Miami';

        const pageData = {
            slug: pageName,
            title: pageTitle,
            description: pageDescription,
            subtitle: pageSubtitle,
            content: '<p>Content coming soon...</p>'
        };

        try {
            const success = await this.fileManager.createNewPage(pageName, pageData);
            if (success) {
                this.showUpdateNotification(`✅ Page "${pageName}" created successfully!`);
                this.logActivity(`New page created: ${pageName}`);
                this.loadPagesList(); // Refresh pages list
            } else {
                this.showUpdateNotification(`⚠️ Page "${pageName}" created in simulation mode`);
            }
        } catch (error) {
            console.error('Page creation failed:', error);
            this.showUpdateNotification(`❌ Failed to create page: ${error.message}`);
        }
    }

    async loadPagesList() {
        try {
            const files = await this.fileManager.listFiles();
            const pagesGrid = document.getElementById('pagesGrid');
            
            if (pagesGrid) {
                pagesGrid.innerHTML = files.map(file => `
                    <div class="page-card">
                        <h4>📄 ${file.name.replace('.html', '').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p>Path: ${file.path}</p>
                        <p>Modified: ${new Date(file.modified).toLocaleDateString()}</p>
                        <div class="page-actions">
                            <button class="btn-small" onclick="admin.editPage('${file.path}')">✏️ Edit</button>
                            <button class="btn-small" onclick="admin.viewPage('${file.path}')">👁️ View</button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Failed to load pages:', error);
        }
    }

    async editPage(filePath) {
        // For now, show a placeholder
        alert(`📝 Edit ${filePath}\n\n✅ This would open a full editor for the selected page.\n\n🔄 Feature coming in next update!`);
        this.logActivity(`Page edit requested: ${filePath}`);
    }

    viewPage(filePath) {
        // Open the page in a new tab
        const url = filePath === 'index.html' ? '/' : `/${filePath.replace('/index.html', '/')}/`;
        window.open(url, '_blank');
        this.logActivity(`Page viewed: ${filePath}`);
    }

    // Live Content Management
    async loadLiveContent() {
        const container = document.getElementById('liveEditorContainer');
        if (!container) return;

        try {
            // Show loading state
            container.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>🔄 Fetching live website content...</p>
                    <small>This may take a moment as we scan all your pages</small>
                </div>
            `;

            // Initialize live editor if not already done
            if (!window.liveEditor.websiteContent || Object.keys(window.liveEditor.websiteContent).length === 0) {
                await window.liveEditor.init();
            }

            // Generate the live editor interface
            const editorHTML = window.liveEditor.generateContentEditor();
            
            container.innerHTML = `
                <div class="live-editor-header">
                    <div class="status-indicator">
                        <span class="status-dot"></span>
                        <span>Live Content Editor Active</span>
                    </div>
                    <div class="editor-stats">
                        <span>📄 ${Object.keys(window.liveEditor.websiteContent).length} Pages Loaded</span>
                        <span>🖼️ Images Detected</span>
                        <span>📝 Real Content</span>
                    </div>
                </div>
                ${editorHTML}
            `;

            this.logActivity('Live website content loaded for editing');
            this.showUpdateNotification('✅ Live website content loaded successfully!');

        } catch (error) {
            console.error('Failed to load live content:', error);
            container.innerHTML = `
                <div class="error-content">
                    <h3>❌ Failed to Load Content</h3>
                    <p>Could not fetch live website content. This might be due to:</p>
                    <ul>
                        <li>CORS restrictions</li>
                        <li>Files not accessible</li>
                        <li>Network issues</li>
                    </ul>
                    <button class="btn-primary" onclick="admin.loadLiveContent()">🔄 Try Again</button>
                </div>
            `;
        }
    }

    async refreshContent() {
        this.showUpdateNotification('🔄 Refreshing content from website...');
        
        // Clear cached content
        window.liveEditor.websiteContent = {};
        
        // Reload content
        await this.loadLiveContent();
        
        this.logActivity('Website content refreshed');
    }

    async saveAllChanges() {
        if (!window.liveEditor.websiteContent) {
            this.showUpdateNotification('❌ No content loaded to save');
            return;
        }

        const pages = Object.keys(window.liveEditor.websiteContent);
        let savedCount = 0;

        this.showUpdateNotification(`💾 Saving changes to ${pages.length} pages...`);

        for (const pageName of pages) {
            try {
                await window.liveEditor.savePage(pageName);
                savedCount++;
            } catch (error) {
                console.error(`Failed to save ${pageName}:`, error);
            }
        }

        this.showUpdateNotification(`✅ Saved changes to ${savedCount}/${pages.length} pages`);
        this.logActivity(`Bulk save completed: ${savedCount}/${pages.length} pages`);
    }
}

// Initialize the admin system
window.admin = new MiamiJunkCarAdmin();

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiamiJunkCarAdmin;
}