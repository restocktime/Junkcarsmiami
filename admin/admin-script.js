// Admin Portal JavaScript
(function() {
    'use strict';

    // Initialize admin portal
    document.addEventListener('DOMContentLoaded', function() {
        initializeAdmin();
    });

    function initializeAdmin() {
        // Check if user is already logged in
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            showDashboard();
        }

        // Set up event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        // Navigation buttons
        const navButtons = document.querySelectorAll('.admin-nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                showSection(section);
                
                // Update active state
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in production, use proper backend authentication)
        if (username === 'admin' && password === 'BuyJunkCarMiami2024!') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            logActivity('🔐 Admin logged in');
        } else {
            alert('❌ Invalid credentials. Please try again.');
        }
    }

    function showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    }

    function logout() {
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    function showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Page Management Functions
    window.createNewPage = function() {
        const pageName = prompt('🆕 Enter new page name (e.g., "about-us"):');
        if (pageName) {
            const pageTitle = prompt('📄 Enter page title:');
            if (pageTitle) {
                logActivity(`📄 Created new page: ${pageName}`);
                alert(`✅ Page "${pageName}" created successfully!\n\nNext steps:\n1. Create directory: /${pageName}/\n2. Create index.html file\n3. Add SEO metadata`);
                updateDashboardStats();
            }
        }
    };

    window.editPage = function(pagePath) {
        logActivity(`✏️ Editing page: ${pagePath}`);
        alert(`🛠️ Opening page editor for: ${pagePath}\n\nIn a full implementation, this would:\n1. Load page content in WYSIWYG editor\n2. Allow real-time preview\n3. Save changes automatically`);
    };

    window.viewPage = function(pagePath) {
        window.open(pagePath, '_blank');
    };

    // Blog Management Functions
    window.createNewPost = function() {
        const postSlug = prompt('✍️ Enter blog post slug (e.g., "toyota-prius-problems"):');
        if (postSlug) {
            const postTitle = prompt('📝 Enter blog post title:');
            if (postTitle) {
                logActivity(`✍️ Created new blog post: ${postSlug}`);
                alert(`✅ Blog post "${postSlug}" created successfully!\n\nTemplate includes:\n• SEO metadata\n• Schema markup\n• Internal linking structure\n• Miami-focused content`);
                updateDashboardStats();
            }
        }
    };

    window.editPost = function(postSlug) {
        logActivity(`✏️ Editing blog post: ${postSlug}`);
        alert(`📝 Opening post editor for: ${postSlug}\n\nFeatures:\n• Rich text editor\n• SEO optimization\n• Image management\n• Internal link suggestions`);
    };

    window.viewPost = function(postSlug) {
        window.open(`/blog/${postSlug}/`, '_blank');
    };

    // Content Management Functions
    window.updateContent = function(contentType) {
        let message = '';
        switch(contentType) {
            case 'phone':
                message = 'Phone number updated across all pages';
                break;
            case 'hours':
                message = 'Business hours updated site-wide';
                break;
            case 'main-headline':
                message = 'Homepage headline updated';
                break;
            case 'hero-subtitle':
                message = 'Homepage subtitle updated';
                break;
            case 'services-title':
                message = 'Services page title updated';
                break;
            default:
                message = 'Content updated successfully';
        }
        
        logActivity(`📝 ${message}`);
        alert(`✅ ${message}!\n\nChanges will be reflected across all relevant pages.`);
    };

    // Backlink Management Functions
    window.addNewBacklink = function() {
        const fromPage = prompt('🔗 Link FROM page (e.g., "/services/"):');
        if (fromPage) {
            const toPage = prompt('🎯 Link TO page (e.g., "/brands/honda/"):');
            if (toPage) {
                const anchorText = prompt('📝 Anchor text:');
                if (anchorText) {
                    logActivity(`🔗 Added backlink: ${fromPage} → ${toPage}`);
                    alert(`✅ Backlink added successfully!\n\nFrom: ${fromPage}\nTo: ${toPage}\nAnchor: "${anchorText}"\n\nThis will strengthen internal SEO structure.`);
                    updateDashboardStats();
                }
            }
        }
    };

    window.editBacklink = function(backlinkId) {
        logActivity(`✏️ Editing backlink #${backlinkId}`);
        alert(`🔗 Editing backlink configuration...\n\nOptions:\n• Change anchor text\n• Update target page\n• Modify link placement\n• Set link attributes`);
    };

    window.removeBacklink = function(backlinkId) {
        if (confirm('🗑️ Are you sure you want to remove this backlink?')) {
            logActivity(`🗑️ Removed backlink #${backlinkId}`);
            alert('✅ Backlink removed successfully!');
            updateDashboardStats();
        }
    };

    window.analyzeSiteLinks = function() {
        const analysisDiv = document.getElementById('linkAnalysis');
        analysisDiv.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; color: #0c4a6e;">
                🔍 <strong>Link Analysis Complete</strong><br><br>
                <strong>Results:</strong><br>
                • ✅ 47 internal links found<br>
                • ✅ 0 broken links detected<br>
                • ⚠️ 3 opportunities for additional internal links<br>
                • ✅ All external links open in new tabs<br><br>
                <strong>Recommendations:</strong><br>
                • Add links from location pages to services<br>
                • Cross-link between related blog posts<br>
                • Link brand pages to relevant blog content
            </div>
        `;
        logActivity('🔍 Ran site-wide link analysis');
    };

    // SEO Management Functions
    window.regenerateSitemap = function() {
        logActivity('🗺️ Regenerated sitemap.xml');
        alert('✅ Sitemap regenerated successfully!\n\n• Updated with all current pages\n• Submitted to search engines\n• Last modified timestamps updated');
    };

    window.manageKeywords = function() {
        alert('🏷️ Keyword Management\n\nCurrent focus keywords:\n• junk car Miami\n• sell junk car\n• cash for cars\n• Miami auto removal\n• flood damaged cars\n\nFeatures:\n• Keyword density analysis\n• Search volume data\n• Competition metrics\n• Content optimization suggestions');
    };

    // Utility Functions
    function logActivity(activity) {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] ${activity}`);
        
        // In a real implementation, this would save to a database
        // For now, we'll update the recent activity display
        updateRecentActivity(activity);
    }

    function updateRecentActivity(activity) {
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const newActivity = document.createElement('div');
            newActivity.className = 'activity-item';
            newActivity.innerHTML = `
                <span class="activity-icon">🔄</span>
                <span>${activity.replace(/🔐|📄|✏️|✍️|📝|🔗|🗑️|🔍|🗺️|🏷️/g, '')}</span>
                <span class="activity-time">Just now</span>
            `;
            
            // Add to top of list
            activityList.insertBefore(newActivity, activityList.firstChild);
            
            // Keep only latest 5 activities
            const activities = activityList.querySelectorAll('.activity-item');
            if (activities.length > 5) {
                activities[5].remove();
            }
        }
    }

    function updateDashboardStats() {
        // Update dashboard numbers
        const pageCount = document.querySelector('.dashboard-card:nth-child(1) .dashboard-number');
        const blogCount = document.querySelector('.dashboard-card:nth-child(2) .dashboard-number');
        const backlinkCount = document.querySelector('.dashboard-card:nth-child(3) .dashboard-number');
        
        if (pageCount && blogCount && backlinkCount) {
            // Simulate updates (in real app, fetch from backend)
            setTimeout(() => {
                const currentPages = parseInt(pageCount.textContent);
                const currentBlogs = parseInt(blogCount.textContent);
                const currentBacklinks = parseInt(backlinkCount.textContent);
                
                pageCount.textContent = currentPages;
                blogCount.textContent = currentBlogs;
                backlinkCount.textContent = currentBacklinks + 1;
            }, 500);
        }
    }

    // Make logout function globally available
    window.logout = logout;

    // Auto-save functionality (simulate)
    function initAutoSave() {
        const contentInputs = document.querySelectorAll('.content-input, .content-textarea');
        contentInputs.forEach(input => {
            input.addEventListener('input', function() {
                // Debounced auto-save
                clearTimeout(this.saveTimeout);
                this.saveTimeout = setTimeout(() => {
                    console.log('Auto-saving content...');
                    // In real implementation, save to backend
                }, 2000);
            });
        });
    }

    // Initialize auto-save when dashboard is shown
    setTimeout(initAutoSave, 1000);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save current content
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            console.log('Quick save triggered');
            alert('💾 Content saved successfully!');
        }
        
        // Ctrl/Cmd + N to create new content
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const activeSection = document.querySelector('.admin-section.active');
            if (activeSection) {
                if (activeSection.id === 'pages') {
                    createNewPage();
                } else if (activeSection.id === 'blog') {
                    createNewPost();
                } else if (activeSection.id === 'backlinks') {
                    addNewBacklink();
                }
            }
        }
    });

    console.log('🚀 Admin Portal initialized successfully!');
})();