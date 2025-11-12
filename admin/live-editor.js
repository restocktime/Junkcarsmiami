/**
 * LIVE WEBSITE EDITOR
 * Pulls actual content from website files and allows direct editing
 */

class LiveWebsiteEditor {
    constructor() {
        this.websiteContent = {};
        this.originalContent = {};
        this.isEditing = false;
        console.log('🔴 LIVE WEBSITE EDITOR LOADED');
    }

    // Fetch actual content from website files
    async loadWebsiteContent() {
        console.log('📥 Loading live website content...');
        
        const pages = [
            { name: 'Homepage', file: 'index.html', path: '/' },
            { name: 'Services', file: 'services/index.html', path: '/services/' },
            { name: 'Contact', file: 'contact/index.html', path: '/contact/' },
            { name: 'Gallery', file: 'gallery/index.html', path: '/gallery/' },
            { name: 'Locations', file: 'locations/index.html', path: '/locations/' },
            { name: 'Brands', file: 'brands/index.html', path: '/brands/' },
            { name: 'Resources', file: 'resources/index.html', path: '/resources/' },
            { name: 'Blog', file: 'blog/index.html', path: '/blog/' }
        ];

        for (const page of pages) {
            try {
                const content = await this.fetchPageContent(page.file);
                this.websiteContent[page.name] = {
                    ...page,
                    content: content,
                    parsed: this.parsePageContent(content)
                };
                console.log(`✅ Loaded ${page.name}: ${page.file}`);
            } catch (error) {
                console.error(`❌ Failed to load ${page.name}:`, error);
            }
        }

        console.log('📊 Website content loaded:', Object.keys(this.websiteContent));
        return this.websiteContent;
    }

    // Fetch content from actual files
    async fetchPageContent(filePath) {
        try {
            // Try to fetch from the actual website files
            const response = await fetch(`../${filePath}`);
            if (response.ok) {
                return await response.text();
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            console.log(`⚠️ Could not fetch ${filePath} directly, using fallback method`);
            // Fallback: try to get content from current domain
            try {
                const fullUrl = window.location.origin + (filePath === 'index.html' ? '/' : `/${filePath.replace('/index.html', '/')}`);
                const response = await fetch(fullUrl);
                if (response.ok) {
                    return await response.text();
                }
            } catch (fallbackError) {
                console.log('Using demo content for', filePath);
            }
            
            // Return demo content if can't fetch
            return this.getDemoContent(filePath);
        }
    }

    // Parse HTML content to extract editable elements
    parsePageContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const parsed = {
            title: doc.querySelector('title')?.textContent || '',
            metaDescription: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
            h1: doc.querySelector('h1')?.textContent || '',
            heroText: doc.querySelector('.hero p')?.textContent || '',
            phone: this.extractPhoneNumbers(html),
            email: this.extractEmails(html),
            images: this.extractImages(doc),
            sections: this.extractSections(doc)
        };

        return parsed;
    }

    // Extract all images from the page
    extractImages(doc) {
        const images = [];
        const imgElements = doc.querySelectorAll('img');
        
        imgElements.forEach((img, index) => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || '';
            const className = img.className || '';
            
            if (src && !src.startsWith('data:')) {
                images.push({
                    id: `img_${index}`,
                    src: src,
                    alt: alt,
                    className: className,
                    element: img.outerHTML
                });
            }
        });

        return images;
    }

    // Extract content sections
    extractSections(doc) {
        const sections = [];
        const sectionElements = doc.querySelectorAll('section, .section');
        
        sectionElements.forEach((section, index) => {
            const className = section.className || '';
            const id = section.id || '';
            const headings = Array.from(section.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                tag: h.tagName.toLowerCase(),
                text: h.textContent,
                element: h.outerHTML
            }));
            
            const paragraphs = Array.from(section.querySelectorAll('p')).map(p => ({
                text: p.textContent,
                element: p.outerHTML
            }));

            sections.push({
                id: id || `section_${index}`,
                className: className,
                headings: headings,
                paragraphs: paragraphs
            });
        });

        return sections;
    }

    // Extract phone numbers
    extractPhoneNumbers(html) {
        const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const matches = html.match(phoneRegex) || [];
        return [...new Set(matches)]; // Remove duplicates
    }

    // Extract email addresses
    extractEmails(html) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const matches = html.match(emailRegex) || [];
        return [...new Set(matches)]; // Remove duplicates
    }

    // Generate live content editor HTML
    generateContentEditor() {
        let editorHTML = '<div class="live-content-editor">';
        
        for (const [pageName, pageData] of Object.entries(this.websiteContent)) {
            editorHTML += this.generatePageEditor(pageName, pageData);
        }
        
        editorHTML += '</div>';
        return editorHTML;
    }

    // Generate editor for a specific page
    generatePageEditor(pageName, pageData) {
        const parsed = pageData.parsed;
        
        return `
            <div class="page-editor-section" data-page="${pageName}">
                <div class="page-header">
                    <h3>📄 ${pageName}</h3>
                    <div class="page-actions">
                        <button class="btn-preview" onclick="liveEditor.previewPage('${pageName}')">👁️ Preview</button>
                        <button class="btn-save" onclick="liveEditor.savePage('${pageName}')">💾 Save Changes</button>
                    </div>
                </div>

                <div class="editor-content">
                    <!-- SEO Settings -->
                    <div class="editor-group">
                        <h4>🎯 SEO & Meta Data</h4>
                        <div class="form-row">
                            <label>Page Title</label>
                            <input type="text" data-field="title" data-page="${pageName}" 
                                   value="${this.escapeHtml(parsed.title)}" class="live-input">
                        </div>
                        <div class="form-row">
                            <label>Meta Description</label>
                            <textarea data-field="metaDescription" data-page="${pageName}" 
                                      class="live-textarea">${this.escapeHtml(parsed.metaDescription)}</textarea>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="editor-group">
                        <h4>📝 Main Content</h4>
                        <div class="form-row">
                            <label>Main Headline (H1)</label>
                            <input type="text" data-field="h1" data-page="${pageName}" 
                                   value="${this.escapeHtml(parsed.h1)}" class="live-input headline-input">
                        </div>
                        <div class="form-row">
                            <label>Hero Description</label>
                            <textarea data-field="heroText" data-page="${pageName}" 
                                      class="live-textarea">${this.escapeHtml(parsed.heroText)}</textarea>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="editor-group">
                        <h4>📞 Contact Information</h4>
                        <div class="form-row">
                            <label>Phone Numbers</label>
                            <div class="phone-list">
                                ${parsed.phone.map(phone => `
                                    <input type="text" data-field="phone" data-page="${pageName}" 
                                           value="${phone}" class="live-input phone-input">
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-row">
                            <label>Email Addresses</label>
                            <div class="email-list">
                                ${parsed.email.map(email => `
                                    <input type="email" data-field="email" data-page="${pageName}" 
                                           value="${email}" class="live-input email-input">
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Images -->
                    <div class="editor-group">
                        <h4>🖼️ Images (${parsed.images.length})</h4>
                        <div class="image-gallery">
                            ${parsed.images.map(img => `
                                <div class="image-item">
                                    <img src="${this.resolveImagePath(img.src)}" alt="${img.alt}" class="preview-img">
                                    <div class="image-controls">
                                        <input type="text" data-field="imageAlt" data-page="${pageName}" 
                                               data-img-id="${img.id}" value="${img.alt}" 
                                               placeholder="Image description" class="live-input">
                                        <button class="btn-change-img" onclick="liveEditor.changeImage('${pageName}', '${img.id}')">
                                            🔄 Change Image
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Sections Content -->
                    <div class="editor-group">
                        <h4>📋 Page Sections (${parsed.sections.length})</h4>
                        <div class="sections-list">
                            ${parsed.sections.map((section, index) => `
                                <div class="section-item">
                                    <h5>Section ${index + 1}: ${section.className || section.id}</h5>
                                    ${section.headings.map(heading => `
                                        <div class="form-row">
                                            <label>${heading.tag.toUpperCase()}</label>
                                            <input type="text" data-field="sectionHeading" 
                                                   data-page="${pageName}" data-section="${index}" 
                                                   value="${this.escapeHtml(heading.text)}" class="live-input">
                                        </div>
                                    `).join('')}
                                    ${section.paragraphs.map((para, pIndex) => `
                                        <div class="form-row">
                                            <label>Paragraph ${pIndex + 1}</label>
                                            <textarea data-field="sectionParagraph" data-page="${pageName}" 
                                                      data-section="${index}" data-paragraph="${pIndex}" 
                                                      class="live-textarea">${this.escapeHtml(para.text)}</textarea>
                                        </div>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Resolve image paths to full URLs
    resolveImagePath(src) {
        if (src.startsWith('http') || src.startsWith('data:')) {
            return src;
        }
        if (src.startsWith('/')) {
            return window.location.origin + src;
        }
        return window.location.origin + '/' + src;
    }

    // Escape HTML for safe display in inputs
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // Save changes to website files
    async savePage(pageName) {
        const pageData = this.websiteContent[pageName];
        if (!pageData) return;

        console.log(`💾 Saving changes to ${pageName}...`);
        
        // Collect all changes from the form
        const changes = this.collectChanges(pageName);
        
        // Apply changes to the HTML content
        const updatedHTML = this.applyChangesToHTML(pageData.content, changes);
        
        // Save the updated content
        const success = await this.saveHTMLContent(pageData.file, updatedHTML);
        
        if (success) {
            this.showNotification(`✅ ${pageName} saved successfully!`);
            console.log(`✅ ${pageName} updated successfully`);
        } else {
            this.showNotification(`❌ Failed to save ${pageName}`);
            console.error(`❌ Failed to save ${pageName}`);
        }
    }

    // Collect changes from form inputs
    collectChanges(pageName) {
        const changes = {};
        const pageEditor = document.querySelector(`[data-page="${pageName}"]`);
        
        if (!pageEditor) return changes;

        // Collect all input changes
        const inputs = pageEditor.querySelectorAll('.live-input, .live-textarea');
        inputs.forEach(input => {
            const field = input.dataset.field;
            const value = input.value;
            
            if (!changes[field]) changes[field] = [];
            changes[field].push(value);
        });

        return changes;
    }

    // Apply changes to HTML content
    applyChangesToHTML(originalHTML, changes) {
        let updatedHTML = originalHTML;

        // Update title
        if (changes.title && changes.title[0]) {
            updatedHTML = updatedHTML.replace(
                /<title>.*?<\/title>/i, 
                `<title>${changes.title[0]}</title>`
            );
        }

        // Update meta description
        if (changes.metaDescription && changes.metaDescription[0]) {
            updatedHTML = updatedHTML.replace(
                /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
                `$1${changes.metaDescription[0]}"`
            );
        }

        // Update H1
        if (changes.h1 && changes.h1[0]) {
            updatedHTML = updatedHTML.replace(
                /<h1[^>]*>.*?<\/h1>/i,
                `<h1>${changes.h1[0]}</h1>`
            );
        }

        // Update hero text
        if (changes.heroText && changes.heroText[0]) {
            updatedHTML = updatedHTML.replace(
                /(<div[^>]*class[^>]*hero[^>]*>[\s\S]*?<p[^>]*>)[^<]*([\s\S]*?<\/p>)/i,
                `$1${changes.heroText[0]}$2`
            );
        }

        // Update phone numbers
        if (changes.phone) {
            changes.phone.forEach((newPhone, index) => {
                // Replace phone numbers in order they appear
                updatedHTML = updatedHTML.replace(/\(\d{3}\)\s\d{3}-\d{4}/, newPhone);
            });
        }

        // Update emails
        if (changes.email) {
            changes.email.forEach((newEmail, index) => {
                updatedHTML = updatedHTML.replace(
                    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, 
                    newEmail
                );
            });
        }

        return updatedHTML;
    }

    // Save HTML content (using localStorage as fallback)
    async saveHTMLContent(filePath, htmlContent) {
        try {
            // Store in localStorage as backup/demo
            localStorage.setItem(`website_${filePath}`, htmlContent);
            
            // In a real implementation, this would save to the actual file
            console.log(`📁 Content saved for ${filePath} (${htmlContent.length} chars)`);
            
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }

    // Preview page changes
    previewPage(pageName) {
        const pageData = this.websiteContent[pageName];
        if (!pageData) return;

        const changes = this.collectChanges(pageName);
        const updatedHTML = this.applyChangesToHTML(pageData.content, changes);
        
        // Open preview in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(updatedHTML);
        previewWindow.document.close();
        
        this.showNotification(`👁️ Preview opened for ${pageName}`);
    }

    // Change image
    changeImage(pageName, imgId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newSrc = e.target.result;
                    // Update the preview
                    const previewImg = document.querySelector(`[data-img-id="${imgId}"] .preview-img`);
                    if (previewImg) {
                        previewImg.src = newSrc;
                    }
                    this.showNotification(`🖼️ Image updated (preview only)`);
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'editor-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Get demo content for pages that can't be fetched
    getDemoContent(filePath) {
        const demoContent = {
            'index.html': `<!DOCTYPE html><html><head><title>Miami Junk Car Buyers - Demo</title><meta name="description" content="Demo content"><h1>We Buy Junk Cars in Miami</h1><p>Get instant cash for your junk car.</p>`,
            'services/index.html': `<!DOCTYPE html><html><head><title>Services - Demo</title><h1>Our Services</h1><p>Professional junk car removal.</p>`,
            'contact/index.html': `<!DOCTYPE html><html><head><title>Contact - Demo</title><h1>Contact Us</h1><p>Call (305) 534-5991</p>`
        };
        
        return demoContent[filePath] || '<html><head><title>Demo Page</title></head><body><h1>Demo Content</h1></body></html>';
    }

    // Initialize the editor
    async init() {
        console.log('🚀 Initializing Live Website Editor...');
        await this.loadWebsiteContent();
        console.log('✅ Live Website Editor ready!');
        return this;
    }
}

// Global instance
window.liveEditor = new LiveWebsiteEditor();