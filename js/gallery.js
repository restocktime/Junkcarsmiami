// Gallery JavaScript for Buy Junk Car Miami
(function() {
    'use strict';

    let currentSlideIndex = 0;
    let autoSlideInterval;

    // Initialize gallery functionality
    document.addEventListener('DOMContentLoaded', function() {
        initGalleryTabs();
        initReviewSlideshow();
        initLightbox();
    });

    // Gallery Tab Switching
    function initGalleryTabs() {
        const tabs = document.querySelectorAll('.gallery-tab');
        const sections = document.querySelectorAll('.gallery-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Remove active class from all tabs and sections
                tabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding section
                const targetSection = document.getElementById(category);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
                
                // Stop autoplay when switching tabs
                if (autoSlideInterval) {
                    clearInterval(autoSlideInterval);
                }
                
                // Restart autoplay if we're on reviews tab
                if (category === 'reviews') {
                    startAutoSlide();
                }
            });
        });
    }

    // Review Slideshow Functionality
    function initReviewSlideshow() {
        startAutoSlide();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, 5000); // Change slide every 5 seconds
    }

    window.changeSlide = function(direction) {
        const slides = document.querySelectorAll('.review-slide');
        const dots = document.querySelectorAll('.slideshow-dots .dot');
        
        if (slides.length === 0) return;
        
        // Remove active class from current slide
        slides[currentSlideIndex].classList.remove('active');
        dots[currentSlideIndex].classList.remove('active');
        
        // Calculate new slide index
        currentSlideIndex += direction;
        
        if (currentSlideIndex >= slides.length) {
            currentSlideIndex = 0;
        } else if (currentSlideIndex < 0) {
            currentSlideIndex = slides.length - 1;
        }
        
        // Add active class to new slide
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
    };

    window.currentSlide = function(index) {
        const slides = document.querySelectorAll('.review-slide');
        const dots = document.querySelectorAll('.slideshow-dots .dot');
        
        if (slides.length === 0) return;
        
        // Remove active class from current slide
        slides[currentSlideIndex].classList.remove('active');
        dots[currentSlideIndex].classList.remove('active');
        
        // Set new slide index (convert from 1-based to 0-based)
        currentSlideIndex = index - 1;
        
        // Add active class to new slide
        slides[currentSlideIndex].classList.add('active');
        dots[currentSlideIndex].classList.add('active');
        
        // Restart autoplay
        clearInterval(autoSlideInterval);
        startAutoSlide();
    };

    // Lightbox Functionality
    function initLightbox() {
        // Close lightbox when clicking outside the image
        document.getElementById('lightbox').addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });

        // Close lightbox with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    window.openLightbox = function(imageId) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        
        // Image data for lightbox
        const imageData = {
            'before-after-1': {
                src: '../images/AdobeStock_373569463_Preview.jpeg',
                caption: 'Top Cash Paid - Miami Junk Car Removal'
            },
            'before-after-2': {
                src: '../images/AdobeStock_332654481_Preview.jpeg',
                caption: 'Same Day Pickup - Free Junk Car Towing'
            },
            'before-after-3': {
                src: '../images/AdobeStock_222819268_Preview.jpeg',
                caption: 'Free Towing - Professional Auto Removal'
            },
            'before-after-4': {
                src: '../images/AdobeStock_1548310032_Preview.jpeg',
                caption: 'Any Condition - We Buy All Cars'
            },
            'before-after-5': {
                src: '../images/AdobeStock_773417243.jpeg',
                caption: 'No Title OK - Florida Junk Car Buyers'
            },
            'before-after-6': {
                src: '../images/contact-hero.jpg',
                caption: 'Fast & Easy - Instant Cash Offers'
            }
        };
        
        const data = imageData[imageId];
        if (data) {
            lightboxImg.src = data.src;
            lightboxCaption.textContent = data.caption;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    };

    window.closeLightbox = function() {
        const lightbox = document.getElementById('lightbox');
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    };

    // Pause autoplay when user hovers over slideshow
    const slideshow = document.querySelector('.reviews-slideshow');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', function() {
            clearInterval(autoSlideInterval);
        });

        slideshow.addEventListener('mouseleave', function() {
            startAutoSlide();
        });
    }

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (slideshow) {
        slideshow.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        slideshow.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeLength = touchEndX - touchStartX;
        
        if (Math.abs(swipeLength) > swipeThreshold) {
            if (swipeLength > 0) {
                changeSlide(-1); // Swipe right - previous slide
            } else {
                changeSlide(1); // Swipe left - next slide
            }
        }
    }

    // Intersection Observer for lazy loading and animations
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        // Observe all gallery images
        document.querySelectorAll('.gallery-item img, .team-member img, .facility-item img').forEach(img => {
            imageObserver.observe(img);
        });
    }

    console.log('🖼️ Gallery functionality initialized');
})();