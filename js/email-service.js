/**
 * EMAIL SERVICE FOR MIAMI JUNK CAR FORMS
 * Uses EmailJS for reliable email delivery without backend
 */

(function() {
    'use strict';
    
    // EmailJS Configuration - Replace with your actual EmailJS details
    const EMAILJS_CONFIG = {
        service_id: 'service_miami_junk', // Replace with your EmailJS service ID
        template_id: 'template_lead', // Replace with your EmailJS template ID
        public_key: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your EmailJS public key
        fallbackEmail: 'buyjunkcarmiami@gmail.com'
    };

    // Load EmailJS library if not already loaded
    function loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.emailjs.com/dist/email.min.js';
            script.onload = () => {
                emailjs.init(EMAILJS_CONFIG.public_key);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Send email notification for new lead
    async function sendEmailNotification(leadData) {
        try {
            await loadEmailJS();

            const emailParams = {
                to_email: EMAILJS_CONFIG.fallbackEmail,
                from_name: 'Miami Junk Car Website',
                subject: `🚨 NEW LEAD: ${leadData.name} - ${leadData.vehicle}`,
                lead_name: leadData.name || 'Website Visitor',
                lead_phone: leadData.phone || 'Not provided',
                lead_email: leadData.email || 'Not provided',
                lead_vehicle: leadData.vehicle || 'Not specified',
                lead_location: leadData.location || 'Miami',
                lead_message: leadData.message || 'No additional message',
                lead_priority: leadData.priority || 'medium',
                lead_source: leadData.source || 'website',
                lead_page: leadData.page || window.location.pathname,
                lead_time: new Date().toLocaleString(),
                lead_id: leadData.id || Date.now()
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.service_id,
                EMAILJS_CONFIG.template_id,
                emailParams
            );

            console.log('✅ Lead notification email sent:', response);
            return { success: true, response };

        } catch (error) {
            console.error('❌ Email sending failed:', error);
            
            // Fallback: try mailto link
            try {
                const mailtoLink = createMailtoLink(leadData);
                console.log('📧 Fallback mailto link created:', mailtoLink);
                return { success: false, fallback: mailtoLink };
            } catch (e) {
                return { success: false, error: error };
            }
        }
    }

    // Create mailto link as fallback
    function createMailtoLink(leadData) {
        const subject = encodeURIComponent(`New Lead: ${leadData.name} - ${leadData.vehicle}`);
        const body = encodeURIComponent(`
NEW LEAD DETAILS:

Name: ${leadData.name}
Phone: ${leadData.phone}
Email: ${leadData.email}
Vehicle: ${leadData.vehicle}
Location: ${leadData.location}
Priority: ${leadData.priority}

Message:
${leadData.message}

Source: ${leadData.source}
Page: ${leadData.page}
Time: ${new Date().toLocaleString()}
Lead ID: ${leadData.id}
        `);

        return `mailto:${EMAILJS_CONFIG.fallbackEmail}?subject=${subject}&body=${body}`;
    }

    // Send confirmation email to lead
    async function sendConfirmationEmail(leadData) {
        if (!leadData.email || !leadData.email.includes('@')) {
            console.log('⚠️ No valid email for confirmation');
            return { success: false };
        }

        try {
            await loadEmailJS();

            const confirmationParams = {
                to_email: leadData.email,
                to_name: leadData.name || 'Valued Customer',
                from_name: 'Miami Junk Car Buyers',
                subject: 'We Received Your Request - Quote Coming Soon!',
                customer_name: leadData.name || 'Valued Customer',
                vehicle_info: leadData.vehicle || 'your vehicle',
                business_phone: '(305) 534-5991',
                business_email: 'buyjunkcarmiami@gmail.com'
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.service_id,
                'template_confirmation', // You'll need to create this template
                confirmationParams
            );

            console.log('✅ Confirmation email sent to customer:', response);
            return { success: true, response };

        } catch (error) {
            console.error('❌ Confirmation email failed:', error);
            return { success: false, error };
        }
    }

    // Enhanced form submission handler
    async function handleFormSubmissionWithEmail(formData) {
        try {
            // Create lead object
            const leadData = {
                id: Date.now(),
                name: formData.name || 'Website Visitor',
                phone: formData.phone || 'Not provided',
                email: formData.email || 'Not provided',
                vehicle: getVehicleInfo(formData),
                location: getLocationFromPage(),
                message: formData.message || '',
                priority: calculatePriority(formData),
                source: 'website_form',
                page: window.location.pathname,
                created: new Date().toISOString()
            };

            // Send business notification email
            const emailResult = await sendEmailNotification(leadData);
            
            // Send customer confirmation email
            if (leadData.email !== 'Not provided') {
                await sendConfirmationEmail(leadData);
            }

            // Store in admin system
            const adminData = JSON.parse(localStorage.getItem('mjc_admin_data')) || { leads: [] };
            adminData.leads.unshift(leadData);
            localStorage.setItem('mjc_admin_data', JSON.stringify(adminData));

            // Show success message
            showSuccessMessage(emailResult.success);

            console.log('📧 Form submission processed:', leadData);
            return { success: true, leadData };

        } catch (error) {
            console.error('❌ Form submission processing failed:', error);
            showErrorMessage();
            return { success: false, error };
        }
    }

    // Helper functions
    function getVehicleInfo(formData) {
        const year = formData.year || formData['vehicle-year'] || '';
        const make = formData.make || formData['vehicle-make'] || '';
        const model = formData.model || formData['vehicle-model'] || '';
        
        if (year || make || model) {
            return `${year} ${make} ${model}`.trim();
        }
        
        return formData.vehicle || 'Not specified';
    }

    function getLocationFromPage() {
        const path = window.location.pathname;
        
        if (path.includes('miami-beach')) return 'Miami Beach';
        if (path.includes('coral-gables')) return 'Coral Gables';
        if (path.includes('homestead')) return 'Homestead';
        if (path.includes('hialeah')) return 'Hialeah';
        if (path.includes('fort-lauderdale')) return 'Fort Lauderdale';
        
        return 'Miami';
    }

    function calculatePriority(formData) {
        let score = 0;
        
        if (formData.phone && formData.phone.length > 5) score += 3;
        if (formData.email && formData.email.includes('@')) score += 2;
        if (formData.year || formData.make) score += 2;
        if (formData.message && formData.message.length > 10) score += 1;
        
        const urgent = ['urgent', 'asap', 'today', 'now', 'immediately'];
        const message = (formData.message || '').toLowerCase();
        if (urgent.some(word => message.includes(word))) score += 3;
        
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    function showSuccessMessage(emailSent) {
        const message = emailSent 
            ? '✅ Message sent successfully! We\'ll contact you within 15 minutes.'
            : '✅ Message received! We\'ll contact you within 15 minutes.';
            
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideIn 0.5s ease;
            ">
                <strong>${message}</strong><br>
                <small>📞 Call (305) 534-5991 for immediate assistance</small>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 6000);
    }

    function showErrorMessage() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <strong>⚠️ Message delivery issue</strong><br>
                <small>Please call (305) 534-5991 directly for immediate assistance</small>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 8000);
    }

    // Initialize email service
    function initEmailService() {
        // Override the form integration handler
        if (window.miamiJunkCarAdmin) {
            window.miamiJunkCarAdmin.handleFormSubmission = handleFormSubmissionWithEmail;
        }

        // Set up form listeners
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            
            // Check if it's a contact form
            if (form.querySelector('input[name="name"], input[name="phone"], input[name="email"]')) {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                await handleFormSubmissionWithEmail(data);
            }
        });

        console.log('📧 Email service initialized');
    }

    // Start email service
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailService);
    } else {
        initEmailService();
    }

    // Expose service globally
    window.miamiJunkCarEmail = {
        sendNotification: sendEmailNotification,
        sendConfirmation: sendConfirmationEmail,
        handleSubmission: handleFormSubmissionWithEmail
    };

})();