/**
 * FORM INTEGRATION FOR MIAMI JUNK CAR ADMIN
 * Captures all form submissions and sends to admin panel
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        adminStorage: 'mjc_admin_data',
        emailEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // Replace with actual endpoint
        businessEmail: 'buyjunkcarmiami@gmail.com',
        businessPhone: '(305) 534-5991'
    };

    // Lead capture function
    function captureFormLead(formData) {
        try {
            // Get existing admin data
            let adminData = JSON.parse(localStorage.getItem(CONFIG.adminStorage)) || {
                leads: [],
                content: {},
                settings: {}
            };

            // Create new lead
            const lead = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                name: formData.name || 'Website Visitor',
                phone: formData.phone || 'Not provided',
                email: formData.email || 'Not provided',
                vehicle: getVehicleInfo(formData),
                location: formData.location || getLocationFromPage(),
                message: formData.message || '',
                status: 'new',
                source: 'website_form',
                page: window.location.pathname,
                referrer: document.referrer || 'Direct',
                userAgent: navigator.userAgent,
                created: new Date().toISOString(),
                priority: calculatePriority(formData)
            };

            // Add lead to admin data
            adminData.leads.unshift(lead);

            // Keep only last 1000 leads to prevent storage bloat
            if (adminData.leads.length > 1000) {
                adminData.leads = adminData.leads.slice(0, 1000);
            }

            // Save to localStorage
            localStorage.setItem(CONFIG.adminStorage, JSON.stringify(adminData));

            console.log('✅ Lead captured and saved to admin:', lead);
            return lead;

        } catch (error) {
            console.error('❌ Error capturing lead:', error);
            return null;
        }
    }

    // Extract vehicle information from form data
    function getVehicleInfo(formData) {
        const year = formData.year || formData['vehicle-year'] || '';
        const make = formData.make || formData['vehicle-make'] || '';
        const model = formData.model || formData['vehicle-model'] || '';
        
        if (year || make || model) {
            return `${year} ${make} ${model}`.trim();
        }
        
        return formData.vehicle || 'Not specified';
    }

    // Get location from current page
    function getLocationFromPage() {
        const path = window.location.pathname;
        
        if (path.includes('miami-beach')) return 'Miami Beach';
        if (path.includes('coral-gables')) return 'Coral Gables';
        if (path.includes('homestead')) return 'Homestead';
        if (path.includes('hialeah')) return 'Hialeah';
        if (path.includes('aventura')) return 'Aventura';
        if (path.includes('fort-lauderdale')) return 'Fort Lauderdale';
        if (path.includes('hollywood')) return 'Hollywood';
        if (path.includes('pembroke-pines')) return 'Pembroke Pines';
        if (path.includes('locations')) return 'General Location Page';
        
        return 'Miami';
    }

    // Calculate lead priority based on form data
    function calculatePriority(formData) {
        let score = 0;
        
        // Phone number provided = high priority
        if (formData.phone && formData.phone.length > 5) score += 3;
        
        // Email provided
        if (formData.email && formData.email.includes('@')) score += 2;
        
        // Vehicle info provided
        if (formData.year || formData.make || formData.model) score += 2;
        
        // Message provided
        if (formData.message && formData.message.length > 10) score += 1;
        
        // Urgency keywords in message
        const urgentKeywords = ['urgent', 'asap', 'today', 'now', 'immediately', 'emergency'];
        const message = (formData.message || '').toLowerCase();
        if (urgentKeywords.some(keyword => message.includes(keyword))) score += 3;
        
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    // Send email notification
    async function sendEmailNotification(lead) {
        try {
            const emailData = {
                to: CONFIG.businessEmail,
                subject: `🚨 New Lead: ${lead.name} - ${lead.vehicle}`,
                message: `
NEW LEAD ALERT!

Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email}
Vehicle: ${lead.vehicle}
Location: ${lead.location}
Priority: ${lead.priority.toUpperCase()}
Source: ${lead.source}
Page: ${lead.page}

Message:
${lead.message}

Lead ID: ${lead.id}
Date: ${lead.date} ${lead.time}

This lead was automatically captured from your website.
`
            };

            // Send email (replace with your actual email service)
            const response = await fetch(CONFIG.emailEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            if (response.ok) {
                console.log('✅ Email notification sent');
            } else {
                console.log('⚠️ Email service unavailable');
            }

        } catch (error) {
            console.log('⚠️ Email notification failed:', error);
        }
    }

    // WhatsApp integration
    function sendWhatsAppNotification(lead) {
        if (lead.priority === 'high' && lead.phone !== 'Not provided') {
            const message = `New HIGH PRIORITY lead: ${lead.name} (${lead.phone}) wants to sell ${lead.vehicle}. Contact immediately!`;
            const whatsappUrl = `https://wa.me/${CONFIG.businessPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            
            // Store for manual sending
            console.log('📱 WhatsApp notification ready:', whatsappUrl);
        }
    }

    // Form submission handler
    function handleFormSubmission(event) {
        const form = event.target;
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Capture the lead
        const lead = captureFormLead(data);
        
        if (lead) {
            // Send notifications
            sendEmailNotification(lead);
            sendWhatsAppNotification(lead);
            
            // Show success message to user
            showSuccessMessage();
            
            // Optional: redirect to thank you page
            setTimeout(() => {
                if (window.location.pathname !== '/thank-you/') {
                    // window.location.href = '/thank-you/';
                }
            }, 2000);
        }
    }

    // Show success message to user
    function showSuccessMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 350px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideIn 0.3s ease;
            ">
                <strong>✅ Message Sent Successfully!</strong><br>
                We'll contact you within 15 minutes with your cash quote.
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }

    // Initialize form integration
    function initFormIntegration() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFormIntegration);
            return;
        }

        // Find all forms on the page
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            // Skip if form already has handler
            if (form.dataset.mjcIntegration) return;
            
            form.dataset.mjcIntegration = 'true';
            form.addEventListener('submit', handleFormSubmission);
            
            console.log(`📋 Form ${index + 1} integrated with admin system`);
        });

        // Global form capture function
        window.miamiJunkCarAdmin = window.miamiJunkCarAdmin || {};
        window.miamiJunkCarAdmin.captureFormSubmission = captureFormLead;
        
        console.log('🔥 Form integration initialized');
        console.log(`📊 Monitoring ${forms.length} forms for lead capture`);
    }

    // Start integration
    initFormIntegration();

    // Also capture any AJAX form submissions
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;
        
        // Check if this is a form submission
        if (options && options.method === 'POST' && options.body) {
            try {
                let formData = {};
                
                if (options.body instanceof FormData) {
                    for (let [key, value] of options.body.entries()) {
                        formData[key] = value;
                    }
                } else if (typeof options.body === 'string') {
                    // Try to parse JSON
                    try {
                        formData = JSON.parse(options.body);
                    } catch (e) {
                        // Parse URL encoded
                        const params = new URLSearchParams(options.body);
                        for (let [key, value] of params.entries()) {
                            formData[key] = value;
                        }
                    }
                }
                
                // If it looks like a contact form, capture it
                if (formData.name || formData.phone || formData.email || formData.message) {
                    captureFormLead(formData);
                }
                
            } catch (error) {
                console.log('Form capture from AJAX:', error);
            }
        }
        
        return originalFetch.apply(this, args);
    };

    console.log('✅ Miami Junk Car form integration active');
    console.log('📧 Email notifications will be sent to:', CONFIG.businessEmail);
    console.log('📞 Business phone:', CONFIG.businessPhone);

})();