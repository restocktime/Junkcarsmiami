// Miami Junk Car Website JavaScript
(function() {
    'use strict';

    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        initNavigation();
        initDismissibleContactBar();
        initMultiStepForm();
        initFAQ();
        initSmoothScrolling();
        initCallTracking();
        initLazyLoading();
        populateVehicleData();
        initHeroVideo();
    }

    // Navigation
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const expanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !expanded);
                navMenu.classList.toggle('active');
            });
        }

        // Handle navigation link clicks
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default for external links or anchors
                const href = this.getAttribute('href');
                if (href && (href.startsWith('#') || href.startsWith('/'))) {
                    // Close mobile menu when clicking a nav link
                    if (navMenu) {
                        navMenu.classList.remove('active');
                    }
                    if (navToggle) {
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu && navToggle &&
                !navToggle.contains(e.target) &&
                !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle?.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // Dismissible Contact Bar
    function initDismissibleContactBar() {
        const bar = document.querySelector('.contact-bar');
        if (!bar) return;
        const closeBtn = bar.querySelector('.contact-close');
        const STORAGE_KEY = 'contactBarDismissed';

        // Restore hidden state
        try {
            if (localStorage.getItem(STORAGE_KEY) === '1') {
                bar.classList.add('hidden');
                return;
            }
        } catch (e) { /* ignore */ }

        const hideBar = () => {
            bar.classList.add('hidden');
            try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', hideBar);
        }

        // Optional: tap background to dismiss on mobile if user taps outside actions
        bar.addEventListener('click', function(e) {
            const isAction = e.target.closest('.contact-actions') || e.target.closest('.contact-close');
            if (!isAction) {
                hideBar();
            }
        });
    }

    // Multi-step Form
    function initMultiStepForm() {
        const form = document.getElementById('multiStepForm');
        if (!form) return;

        let currentStep = 1;
        const totalSteps = form.querySelectorAll('.form-step').length;
        let isSubmitting = false; // Prevent duplicate submissions

        // Next button handlers
        const nextButtons = form.querySelectorAll('.btn-next');
        nextButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (validateStep(currentStep)) {
                    nextStep();
                }
            });
        });

        // Previous button handlers
        const prevButtons = form.querySelectorAll('.btn-prev');
        prevButtons.forEach(btn => {
            btn.addEventListener('click', previousStep);
        });

        // Form submission
        form.addEventListener('submit', handleFormSubmit);

        function nextStep() {
            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
                if (currentStep === 3) {
                    calculateQuote();
                }
            }
        }

        function previousStep() {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        }

        function showStep(step) {
            // Hide all steps
            form.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
            
            // Show current step
            const currentStepEl = form.querySelector(`[data-step="${step}"]`);
            if (currentStepEl) {
                currentStepEl.classList.add('active');
                currentStep = step;
                
                // Update progress bar
                const progressFill = form.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${(step / totalSteps) * 100}%`;
                }

                // Focus first input in new step
                const firstInput = currentStepEl.querySelector('input, select');
                if (firstInput && !firstInput.disabled) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        }

        function validateStep(step) {
            const stepElement = form.querySelector(`[data-step="${step}"]`);
            const requiredFields = stepElement.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                clearError(field);
                
                if (!field.value.trim()) {
                    showError(field, 'This field is required');
                    isValid = false;
                } else if (field.type === 'tel') {
                    if (!validatePhone(field.value)) {
                        showError(field, 'Please enter a valid phone number');
                        isValid = false;
                    }
                } else if (field.type === 'email' && field.value) {
                    if (!validateEmail(field.value)) {
                        showError(field, 'Please enter a valid email address');
                        isValid = false;
                    }
                }
            });

            return isValid;
        }

        function showError(field, message) {
            field.style.borderColor = '#e53e3e';
            const errorSpan = document.getElementById(field.id + '-error');
            if (errorSpan) {
                errorSpan.textContent = message;
                errorSpan.style.display = 'block';
            }
        }

        function clearError(field) {
            field.style.borderColor = '';
            const errorSpan = document.getElementById(field.id + '-error');
            if (errorSpan) {
                errorSpan.style.display = 'none';
            }
        }

        function calculateQuote() {
            // Show lead capture message instead of price calculation
            showLeadCaptureMessage();
        }

        function showLeadCaptureMessage() {
            const quoteContainer = document.getElementById('instantQuote');
            
            if (quoteContainer) {
                quoteContainer.style.display = 'block';
            }
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            
            // Prevent duplicate submissions
            if (isSubmitting) {
                console.log('⚠️ Form already submitting, please wait...');
                return;
            }
            
            if (!validateStep(currentStep)) {
                return;
            }

            const submitButton = form.querySelector('.btn-submit');
            if (!submitButton) {
                console.error('Submit button not found');
                return;
            }
            
            const originalText = submitButton.textContent;
            
            // Lock submission
            isSubmitting = true;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                console.log('📝 Submitting form data:', data);
                
                // Add form submission event for analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        event_category: 'form',
                        event_label: 'quote_form_submission'
                    });
                }

                // Submit the quote request (only once)
                await submitQuoteRequest(data);
                
                // Show success message
                showSuccessMessage();
                
            } catch (error) {
                console.error('Form submission error:', error);
                showErrorMessage();
                
                // Re-enable button on error
                isSubmitting = false;
                if (submitButton) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            }
        }

        async function submitQuoteRequest(data) {
            // Create lead object
            const lead = {
                id: Date.now().toString(),
                name: data.name || 'Unknown',
                phone: data.phone || '',
                email: data.email || '',
                vehicle: `${data.year || ''} ${data.make || ''} ${data.model || ''}`.trim(),
                year: data.year || '',
                make: data.make || '',
                model: data.model || '',
                vin: data.vin || '',
                condition: data.runs || '',
                hasTitle: data.title || '',
                damage: Array.isArray(data.damage) ? data.damage.join(', ') : (data.damage || ''),
                location: data.location || 'Miami',
                zip: data.zip || '',
                comments: data.comments || '',
                status: 'new',
                priority: 'high',
                quote: '',
                notes: '',
                timestamp: new Date().toISOString(),
                source: 'Website Form'
            };

            console.log('📝 Submitting lead to database...');

            // Try Supabase direct connection first (works everywhere!)
            if (window.SupabaseClient) {
                try {
                    console.log('Using Supabase direct connection...');
                    const result = await window.SupabaseClient.addLead(lead);
                    
                    if (result.success) {
                        console.log('✅ Lead saved to Supabase database:', result);
                        return result;
                    } else {
                        console.error('Supabase error:', result.error);
                    }
                } catch (error) {
                    console.error('Supabase failed:', error);
                }
            }

            // Fallback: Try API endpoints
            const endpoints = [
                '/api/leads',
                '/api/save-lead-simple.php',
                '/api/submit-lead.php'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying ${endpoint}...`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 8000);
                    
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(lead),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const result = await response.json();
                            console.log('✅ Lead saved via API:', result);
                            return result;
                        }
                    }
                } catch (error) {
                    console.log(`${endpoint} failed:`, error.message);
                    continue;
                }
            }
            
            // All methods failed - save to localStorage as last resort
            console.log('⚠️ All methods failed, saving to localStorage');
            try {
                const existingLeads = JSON.parse(localStorage.getItem('mjc_website_leads_backup') || '[]');
                existingLeads.unshift(lead);
                localStorage.setItem('mjc_website_leads_backup', JSON.stringify(existingLeads));
                console.log('💾 Lead saved to localStorage as backup');
            } catch (storageError) {
                console.error('Failed to save backup:', storageError);
            }
            
            return {
                success: true,
                message: 'Quote request submitted',
                leadId: lead.id,
                backup: true
            };
        }

        function showSuccessMessage() {
            const formContainer = document.querySelector('.form-container');
            if (!formContainer) {
                console.error('Form container not found');
                return;
            }
            
            formContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; color: #48bb78; margin-bottom: 1rem;">✓</div>
                    <h2>Quote Request Submitted!</h2>
                    <p>Thank you! We'll contact you within 30 minutes with your official quote.</p>
                    <p><strong>Next Steps:</strong></p>
                    <ul style="text-align: left; margin: 1rem 0;">
                        <li>Expect a call from (305) 534-5991</li>
                        <li>Have your keys and any paperwork ready</li>
                        <li>We'll schedule your free pickup</li>
                    </ul>
                    <div style="margin-top: 2rem;">
                        <a href="tel:+13055345991" class="btn btn-primary">Call Now: (305) 534-5991</a>
                    </div>
                </div>
            `;
        }

        function showErrorMessage() {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-error';
            errorDiv.innerHTML = `
                <p><strong>Submission Error</strong></p>
                <p>There was a problem submitting your form. Please try again or call us directly at (305) 555-1234.</p>
            `;
            form.insertBefore(errorDiv, form.firstChild);
            
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    // Vehicle Data Population
    function populateVehicleData() {
        const yearSelect = document.getElementById('year');
        const makeSelect = document.getElementById('make');
        const modelSelect = document.getElementById('model');

        if (!yearSelect || !makeSelect || !modelSelect) return;

        // Populate years (current year back to 1980)
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        for (let year = currentYear; year >= 1980; year--) {
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        }

        // Comprehensive car makes and models
        const makes = {
            'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX', 'RSX', 'TSX', 'RL', 'TL', 'ZDX'],
            'Alfa Romeo': ['Giulia', 'Stelvio', '4C', 'Giulietta', 'MiTo', 'Spider', 'GTV'],
            'Aston Martin': ['DB11', 'Vantage', 'DBS', 'Rapide', 'Vanquish', 'DB9'],
            'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'S4', 'S5', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7'],
            'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i8', 'M2', 'M3', 'M4', 'M5', 'M6'],
            'Buick': ['Encore', 'Enclave', 'Envision', 'LaCrosse', 'Regal', 'Verano', 'Century', 'LeSabre', 'Park Avenue'],
            'Cadillac': ['ATS', 'CTS', 'CT4', 'CT5', 'CT6', 'XTS', 'XT4', 'XT5', 'XT6', 'Escalade', 'SRX', 'CTS-V', 'ATS-V'],
            'Chevrolet': ['Spark', 'Sonic', 'Cruze', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Trax', 'Equinox', 'Traverse', 'Blazer', 'Tahoe', 'Suburban', 'Colorado', 'Silverado', 'Avalanche', 'Express'],
            'Chrysler': ['300', 'Pacifica', 'Voyager', 'Town & Country', 'PT Cruiser', 'Sebring', 'Concorde'],
            'Dodge': ['Dart', 'Charger', 'Challenger', 'Viper', 'Journey', 'Durango', 'Grand Caravan', 'Ram 1500', 'Ram 2500', 'Ram 3500', 'Avenger', 'Caliber', 'Nitro'],
            'Ferrari': ['488', 'F8', 'SF90', 'Roma', 'Portofino', '812', 'GTC4Lusso', 'LaFerrari', 'California', '458', '599'],
            'Fiat': ['500', '500L', '500X', '124 Spider', 'Panda', 'Punto', 'Tipo'],
            'Ford': ['Fiesta', 'Focus', 'Fusion', 'Mustang', 'Taurus', 'EcoSport', 'Escape', 'Edge', 'Explorer', 'Expedition', 'Ranger', 'F-150', 'F-250', 'F-350', 'Transit', 'E-Series', 'Crown Victoria', 'Thunderbird'],
            'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'Coupe'],
            'GMC': ['Terrain', 'Acadia', 'Yukon', 'Canyon', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Savana', 'Jimmy', 'Envoy'],
            'Honda': ['Fit', 'Civic', 'Accord', 'Insight', 'Clarity', 'HR-V', 'CR-V', 'Passport', 'Pilot', 'Ridgeline', 'Odyssey', 'Element', 'S2000', 'Prelude', 'CRX', 'Del Sol'],
            'Hyundai': ['Accent', 'Elantra', 'Sonata', 'Azera', 'Genesis', 'Veloster', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Venue', 'Ioniq', 'Nexo'],
            'Infiniti': ['Q30', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX70', 'QX80', 'G35', 'G37', 'M35', 'M45', 'FX35', 'FX45'],
            'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace', 'XK', 'XKR', 'S-Type', 'X-Type'],
            'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Commander', 'Liberty', 'Patriot', 'Wagoneer'],
            'Kia': ['Rio', 'Forte', 'Optima', 'Stinger', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Sedona', 'Cadenza', 'Spectra'],
            'Lamborghini': ['Huracan', 'Aventador', 'Urus', 'Gallardo', 'Murcielago', 'Countach'],
            'Land Rover': ['Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover', 'Discovery Sport', 'Discovery', 'Defender', 'LR2', 'LR3', 'LR4'],
            'Lexus': ['IS', 'ES', 'GS', 'LS', 'LC', 'RC', 'UX', 'NX', 'RX', 'GX', 'LX', 'CT', 'HS', 'SC'],
            'Lincoln': ['MKZ', 'Continental', 'MKC', 'Corsair', 'MKX', 'Nautilus', 'MKT', 'Aviator', 'Navigator', 'Town Car', 'LS'],
            'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'GranTurismo', 'GranCabrio', 'MC20'],
            'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'MX-5 Miata', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'CX-90', 'RX-7', 'RX-8', 'Tribute', 'B-Series'],
            'McLaren': ['570S', '720S', '765LT', 'GT', 'Artura', '650S', 'MP4-12C'],
            'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'SL', 'SLC', 'AMG GT', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'Sprinter', 'Metris'],
            'Mini': ['Cooper', 'Cooper S', 'Countryman', 'Clubman', 'Paceman', 'Roadster', 'Coupe'],
            'Mitsubishi': ['Mirage', 'Lancer', 'Eclipse', 'Galant', 'Outlander', 'Outlander Sport', 'Montero', 'Endeavor', '3000GT', 'Diamante'],
            'Nissan': ['Versa', 'Sentra', 'Altima', 'Maxima', '350Z', '370Z', 'GT-R', 'Kicks', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Titan', 'Frontier', 'NV200', 'Quest', 'Cube', 'Juke'],
            'Porsche': ['718 Boxster', '718 Cayman', '911', 'Panamera', 'Cayenne', 'Macan', 'Taycan', 'Boxster', 'Cayman', 'Carrera GT'],
            'Ram': ['1500', '2500', '3500', '4500', '5500', 'ProMaster', 'ProMaster City'],
            'Rolls Royce': ['Ghost', 'Wraith', 'Dawn', 'Cullinan', 'Phantom', 'Silver Shadow', 'Corniche'],
            'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'STI', 'BRZ', 'Tribeca', 'Baja'],
            'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
            'Toyota': ['Yaris', 'Corolla', 'Camry', 'Avalon', 'Prius', 'Mirai', 'Supra', '86', 'C-HR', 'RAV4', 'Venza', 'Highlander', 'Sequoia', 'Tacoma', 'Tundra', 'Sienna', '4Runner', 'Land Cruiser', 'Matrix', 'Echo', 'Tercel', 'Celica', 'MR2'],
            'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Arteon', 'Tiguan', 'Atlas', 'ID.4', 'Beetle', 'CC', 'Eos', 'GTI', 'R32', 'Phaeton', 'Touareg', 'Routan'],
            'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C30', 'C70', 'S40', 'V50', 'V70', 'XC70'],
            'Other': ['Various Models']
        };

        makeSelect.addEventListener('change', function() {
            const selectedMake = this.value;
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            
            if (selectedMake && makes[selectedMake]) {
                makes[selectedMake].forEach(model => {
                    modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
                });
                modelSelect.disabled = false;
            } else {
                modelSelect.disabled = true;
            }
        });
    }

    // FAQ Functionality
    function initFAQ() {
        const faqButtons = document.querySelectorAll('.faq-question');
        
        faqButtons.forEach(button => {
            button.addEventListener('click', function() {
                const faqItem = this.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    faqItem.classList.add('active');
                }
                
                // Update aria-expanded
                this.setAttribute('aria-expanded', !isActive);
            });
        });
    }

    // Smooth Scrolling
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    const navMenu = document.querySelector('.nav-menu');
                    const navToggle = document.querySelector('.nav-toggle');
                    if (navMenu) {
                        navMenu.classList.remove('active');
                        navToggle?.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }

    // Call Tracking
    function initCallTracking() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        phoneLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Track phone calls in analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'phone_call', {
                        event_category: 'contact',
                        event_label: 'phone_click'
                    });
                }
            });
        });
    }

    // Lazy Loading for Images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Utility Functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }

    // Format phone number as user types
    function formatPhoneNumber(input) {
        const value = input.value.replace(/\D/g, '');
        const match = value.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
        
        if (match) {
            input.value = !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
        }
    }

    // Auto-format phone input
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });

    // VIN validation
    const vinInput = document.getElementById('vin');
    if (vinInput) {
        vinInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
            
            if (this.value.length === 17) {
                // VIN is complete, could validate checksum here
                this.style.borderColor = '#48bb78';
            } else if (this.value.length > 0) {
                this.style.borderColor = '#ed8936';
            } else {
                this.style.borderColor = '';
            }
        });
    }

    // Performance monitoring
    if ('PerformanceObserver' in window) {
        // Monitor Largest Contentful Paint
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'LCP', {
                        event_category: 'performance',
                        value: Math.round(entry.startTime),
                        custom_map: {
                            'metric_name': 'largest_contentful_paint'
                        }
                    });
                }
            }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Hero Video Initialization
    function initHeroVideo() {
        const heroVideo = document.querySelector('.hero-video');
        const heroVideoContainer = document.querySelector('.hero-video-container');

        if (heroVideo && heroVideoContainer) {
            console.log('Initializing hero video...');
            
            // Handle video loading
            heroVideo.addEventListener('loadeddata', function() {
                console.log('Video loaded successfully');
                this.style.opacity = '1';
                
                // Try to play the video
                const playPromise = this.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(function() {
                        console.log('Video is playing');
                    }).catch(function(error) {
                        console.log('Video autoplay was prevented:', error);
                        // Video autoplay was prevented, but background image will show
                    });
                }
            });
            
            // Handle video loading metadata
            heroVideo.addEventListener('loadedmetadata', function() {
                console.log('Video metadata loaded');
                this.style.opacity = '1';
            });
            
            // Handle video errors
            heroVideo.addEventListener('error', function(e) {
                console.error('Video failed to load:', e);
                console.log('Using background image fallback');
                this.style.display = 'none';
            });
            
            // Handle when video can play
            heroVideo.addEventListener('canplay', function() {
                console.log('Video can start playing');
                this.style.opacity = '1';
            });
            
            // Handle video ready to play through
            heroVideo.addEventListener('canplaythrough', function() {
                console.log('Video can play through without buffering');
                this.style.opacity = '1';
            });
            
            // Check if video is already ready
            if (heroVideo.readyState >= 3) { // HAVE_FUTURE_DATA or higher
                console.log('Video is already ready to play');
                heroVideo.style.opacity = '1';
                heroVideo.play().catch(function(error) {
                    console.log('Video play failed:', error);
                });
            }
            
            // Force load the video
            heroVideo.load();
        } else {
            console.log('Hero video elements not found');
        }
    }
})();

// Homepage Gallery Slideshow
(function() {
    'use strict';
    
    let currentGallerySlideIndex = 1;
    let gallerySlideInterval;
    
    // Initialize gallery slideshow
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for DOM to fully render
        setTimeout(() => {
            initGallerySlideshow();
            showGallerySlide(currentGallerySlideIndex);
            startAutoSlide();
        }, 100);
    });
    
    function initGallerySlideshow() {
        // Add touch/swipe support for mobile
        const slideshow = document.getElementById('gallerySlideshow');
        if (slideshow) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            slideshow.addEventListener('touchstart', function(e) {
                if (window.innerWidth <= 768) {
                    touchStartX = e.changedTouches[0].screenX;
                }
            }, { passive: true });
            
            slideshow.addEventListener('touchend', function(e) {
                if (window.innerWidth <= 768) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleGallerySwipe();
                }
            }, { passive: true });
            
            function handleGallerySwipe() {
                const swipeThreshold = 50;
                const swipeLength = touchEndX - touchStartX;
                
                if (Math.abs(swipeLength) > swipeThreshold) {
                    if (swipeLength > 0) {
                        changeGallerySlide(-1); // Swipe right - previous
                    } else {
                        changeGallerySlide(1); // Swipe left - next
                    }
                }
            }
        }
        
        console.log('Gallery slideshow initialized');
    }
    
    window.changeGallerySlide = function(direction) {
        currentGallerySlideIndex += direction;
        
        const totalSlides = document.querySelectorAll('#gallerySlideshow .preview-item').length;
        
        if (currentGallerySlideIndex > totalSlides) {
            currentGallerySlideIndex = 1;
        } else if (currentGallerySlideIndex < 1) {
            currentGallerySlideIndex = totalSlides;
        }
        
        showGallerySlide(currentGallerySlideIndex);
        resetAutoSlide();
    };
    
    window.currentGallerySlide = function(index) {
        currentGallerySlideIndex = index;
        showGallerySlide(currentGallerySlideIndex);
        resetAutoSlide();
    };
    
    function showGallerySlide(slideIndex) {
        const slideshow = document.getElementById('gallerySlideshow');
        const dots = document.querySelectorAll('.mobile-slideshow-dots .dot');
        
        if (!slideshow) return;
        
        // Only apply slideshow on mobile
        if (window.innerWidth <= 768) {
            // Move slides - since each slide is 8.33% of the 1200% container,
            // we need to move by 8.33% increments
            const translateX = -(slideIndex - 1) * 8.33;
            slideshow.style.transform = `translateX(${translateX}%)`;
            console.log(`Moving to slide ${slideIndex}, translateX: ${translateX}%`);
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === slideIndex - 1);
            });
        } else {
            // Reset transform for desktop
            slideshow.style.transform = 'none';
        }
    }
    
    function startAutoSlide() {
        if (window.innerWidth <= 768) {
            gallerySlideInterval = setInterval(() => {
                changeGallerySlide(1);
            }, 4000); // Change slide every 4 seconds
        }
    }
    
    function resetAutoSlide() {
        clearInterval(gallerySlideInterval);
        startAutoSlide();
    }
    
    // Pause auto-slide on hover (desktop) or touch (mobile)
    const gallerySection = document.querySelector('.gallery-preview');
    if (gallerySection) {
        gallerySection.addEventListener('mouseenter', function() {
            clearInterval(gallerySlideInterval);
        });
        
        gallerySection.addEventListener('mouseleave', function() {
            startAutoSlide();
        });
    }
    
    // Restart slideshow on window resize
    window.addEventListener('resize', function() {
        clearInterval(gallerySlideInterval);
        if (window.innerWidth <= 768) {
            showGallerySlide(currentGallerySlideIndex);
            startAutoSlide();
        }
    });
    
    console.log('📱 Mobile gallery slideshow initialized');
})();
