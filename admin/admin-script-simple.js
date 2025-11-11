// Simple Admin Portal JavaScript - Works without backend
(function() {
    'use strict';

    // Admin credentials (in production, this would be more secure)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'BuyJunkCarMiami2024!'
    };

    let isLoggedIn = false;

    // Initialize admin portal
    document.addEventListener('DOMContentLoaded', function() {
        initializeAdmin();
    });

    function initializeAdmin() {
        // Check if user is already logged in
        const savedLogin = localStorage.getItem('adminLoggedIn');
        const loginTime = localStorage.getItem('adminLoginTime');
        
        // Check if login is still valid (24 hours)
        if (savedLogin && loginTime) {
            const timeDiff = Date.now() - parseInt(loginTime);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (timeDiff < twentyFourHours) {
                isLoggedIn = true;
                showDashboard();
            } else {
                // Clear expired session
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminLoginTime');
            }
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
        const loginButton = e.target.querySelector('button[type="submit"]');
        
        // Show loading state
        const originalText = loginButton.innerHTML;
        loginButton.innerHTML = '🔄 Authenticating...';
        loginButton.disabled = true;

        // Simulate authentication delay
        setTimeout(() => {
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                isLoggedIn = true;
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminLoginTime', Date.now().toString());
                
                showDashboard();
                logActivity('🔐 Admin logged in successfully');
            } else {
                alert('❌ Invalid credentials. Please try again.');
                // Clear form
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('username').focus();
            }
            
            // Reset button
            loginButton.innerHTML = originalText;
            loginButton.disabled = false;
        }, 1000);
    }

    function showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadDashboardData();
    }

    function logout() {
        isLoggedIn = false;
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    function loadDashboardData() {
        // Simulate loading dashboard data
        updateDashboardStats({
            totalPages: 47,
            blogPosts: 5,
            backlinks: 23,
            seoScore: 94
        });
    }

    function updateDashboardStats(stats) {
        const cards = document.querySelectorAll('.dashboard-card .dashboard-number');
        if (cards.length >= 4) {
            cards[0].textContent = stats.totalPages;
            cards[1].textContent = stats.blogPosts;
            cards[2].textContent = stats.backlinks;
            cards[3].textContent = stats.seoScore + '%';
        }
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

    // Page Management Functions (Client-side notifications)
    window.createNewPage = function() {
        if (!isLoggedIn) return;
        
        const pageName = prompt('🆕 Enter new page name (e.g., "about-us"):');
        if (!pageName) return;
        
        const pageTitle = prompt('📄 Enter page title:');
        if (!pageTitle) return;

        alert(`✅ Page Creation Request\n\nPage: ${pageName}\nTitle: ${pageTitle}\n\n📝 Note: This is a demo version. In the full version, pages would be created automatically with proper SEO metadata and templates.`);
        logActivity(`📄 Page creation requested: ${pageName}`);
    };

    window.editPage = function(pagePath) {
        if (!isLoggedIn) return;
        alert(`✏️ Page Editing\n\nPage: ${pagePath}\n\n📝 Note: This is a demo version. In the full version, you would see a live editor to modify page content, meta descriptions, and SEO settings.`);
        logActivity(`✏️ Page edit requested: ${pagePath}`);
    };

    window.viewPage = function(pagePath) {
        window.open(pagePath, '_blank');
    };

    // Content Management Functions
    window.updateContent = function(contentType) {
        if (!isLoggedIn) return;
        
        let newValue;
        switch(contentType) {
            case 'phone':
                newValue = prompt('📞 Enter new phone number:', '(305) 534-5991');
                break;
            case 'hours':
                newValue = prompt('🕒 Enter new business hours:', 'Open 8am-10pm Daily');
                break;
            case 'main-headline':
                newValue = prompt('📄 Enter main headline:', 'Buy Junk Car Miami - Top Dollar Paid - Same Day Pickup');
                break;
            case 'hero-subtitle':
                newValue = prompt('📝 Enter hero subtitle:');
                break;
            case 'services-title':
                newValue = prompt('🔧 Enter services title:', 'Complete Miami Junk Car Services - Every Vehicle, Every Situation');
                break;
            default:
                return;
        }

        if (newValue) {
            alert(`✅ Content Update Request\n\nType: ${contentType}\nNew Value: ${newValue}\n\n📝 Note: This is a demo version. In the full version, this would update content across all relevant pages automatically.`);
            logActivity(`📝 Content update requested: ${contentType}`);
        }
    };

    // SEO Functions
    window.regenerateSitemap = function() {
        if (!isLoggedIn) return;
        
        alert(`✅ Sitemap Generation\n\n• 47 pages would be indexed\n• sitemap.xml would be updated\n• Ready for search engine submission\n\n📝 Note: This is a demo version. In the full version, the sitemap would be automatically generated and updated.`);
        logActivity('🗺️ Sitemap regeneration requested');
    };

    // Blog Management Functions
    window.createNewPost = function() {
        if (!isLoggedIn) return;
        
        const postTitle = prompt('📝 Enter blog post title:');
        if (postTitle) {
            alert(`✅ Blog Post Creation\n\nTitle: ${postTitle}\n\n📝 Note: This is a demo version. In the full version, you would have a rich text editor to create and publish blog posts.`);
            logActivity(`✍️ Blog post creation requested: ${postTitle}`);
        }
    };

    window.editPost = function(postSlug) {
        if (!isLoggedIn) return;
        alert(`✏️ Blog Editing\n\nPost: ${postSlug}\n\n📝 Note: This is a demo version. In the full version, you would see a rich editor to modify the blog post content.`);
        logActivity(`✏️ Blog edit requested: ${postSlug}`);
    };

    window.viewPost = function(postSlug) {
        window.open(`/blog/${postSlug}/`, '_blank');
    };

    // Backlink Management Functions
    window.addNewBacklink = function() {
        if (!isLoggedIn) return;
        alert('🔗 Backlink Management\n\n📝 Note: This is a demo version. In the full version, you would be able to add and manage internal links across pages.');
        logActivity('🔗 Backlink management accessed');
    };

    window.editBacklink = function(backlinkId) {
        if (!isLoggedIn) return;
        alert('✏️ Edit Backlink\n\n📝 Note: This is a demo version. In the full version, you would be able to edit link anchors and destinations.');
    };

    window.removeBacklink = function(backlinkId) {
        if (!isLoggedIn) return;
        if (confirm('Are you sure you want to remove this backlink?')) {
            alert('🗑️ Backlink removed (demo)');
        }
    };

    window.analyzeSiteLinks = function() {
        if (!isLoggedIn) return;
        
        const analysisDiv = document.getElementById('linkAnalysis');
        analysisDiv.innerHTML = `
            <div style="padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; color: #0c4a6e;">
                🔍 <strong>Demo Link Analysis</strong><br><br>
                <strong>System Status:</strong><br>
                • ✅ Admin portal active<br>
                • ✅ Client-side authentication working<br>
                • ✅ All pages accessible<br>
                • ✅ SEO structure in place<br><br>
                <strong>Current Features:</strong><br>
                • Demo admin interface functional<br>
                • Page management system ready<br>
                • Content management framework ready<br>
                • Blog management ready for implementation<br><br>
                📝 <em>This is the demo version. The full version would include real-time link analysis and automated SEO recommendations.</em>
            </div>
        `;
        logActivity('🔍 Demo link analysis performed');
    };

    window.manageKeywords = function() {
        if (!isLoggedIn) return;
        alert('🏷️ Keyword Management\n\nCurrent focus keywords:\n• junk car Miami\n• sell junk car\n• cash for cars\n• Miami auto removal\n• flood damaged cars\n\n📝 Note: This is a demo version. The full version would include keyword tracking and optimization tools.');
        logActivity('🏷️ Keyword management accessed');
    };

    // Utility Functions
    function logActivity(activity) {
        const timestamp = new Date().toLocaleString();
        console.log(`[${timestamp}] ${activity}`);
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
            
            activityList.insertBefore(newActivity, activityList.firstChild);
            
            const activities = activityList.querySelectorAll('.activity-item');
            if (activities.length > 5) {
                activities[5].remove();
            }
        }
    }

    // Make logout function globally available
    window.logout = logout;

    // Show welcome message in console
    console.log('🚀 Simple Admin Portal initialized successfully!');
    console.log('👤 Login credentials: admin / BuyJunkCarMiami2024!');
    console.log('📝 This is the demo version for live site use.');

})();