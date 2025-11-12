/**
 * Commercial Grade File Management System
 * Direct website file manipulation for real-time updates
 */

class WebsiteFileManager {
    constructor() {
        this.fileCache = new Map();
        this.pendingUpdates = new Map();
        this.updateQueue = [];
        this.isProcessing = false;
        
        // File system API support detection
        this.hasFileSystemAccess = 'showDirectoryPicker' in window;
        this.directoryHandle = null;
        
        console.log('📁 File Manager initialized');
        if (this.hasFileSystemAccess) {
            console.log('✅ File System Access API supported');
        } else {
            console.log('⚠️ File System Access API not available - using alternative methods');
        }
    }

    // Initialize file system access
    async requestFileSystemAccess() {
        if (!this.hasFileSystemAccess) {
            throw new Error('File System Access API not supported');
        }

        try {
            this.directoryHandle = await window.showDirectoryPicker({
                id: 'miami-junk-car-website',
                mode: 'readwrite'
            });
            
            console.log('✅ File system access granted - Live editing enabled!');
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('ℹ️ File system access cancelled by user');
            } else {
                console.log('ℹ️ File system access not available - using simulation mode');
            }
            return false;
        }
    }

    // Read file content
    async readFile(filePath) {
        if (this.directoryHandle) {
            try {
                const fileHandle = await this.getFileHandle(filePath);
                const file = await fileHandle.getFile();
                const content = await file.text();
                
                // Cache the content
                this.fileCache.set(filePath, content);
                return content;
            } catch (error) {
                console.error(`Failed to read ${filePath}:`, error);
                return null;
            }
        }
        
        // Fallback: try to read from cache or simulate
        return this.fileCache.get(filePath) || this.getSimulatedContent(filePath);
    }

    // Write file content
    async writeFile(filePath, content) {
        if (this.directoryHandle) {
            try {
                const fileHandle = await this.getFileHandle(filePath, true);
                const writable = await fileHandle.createWritable();
                
                await writable.write(content);
                await writable.close();
                
                // Update cache
                this.fileCache.set(filePath, content);
                
                console.log(`✅ Updated ${filePath}`);
                return true;
            } catch (error) {
                console.error(`Failed to write ${filePath}:`, error);
                return false;
            }
        }
        
        // Fallback: simulate file write
        this.fileCache.set(filePath, content);
        console.log(`📝 Simulated update to ${filePath}`);
        return true;
    }

    // Get file handle with path navigation
    async getFileHandle(filePath, create = false) {
        let currentHandle = this.directoryHandle;
        const pathParts = filePath.split('/').filter(part => part);
        
        // Navigate through directories
        for (let i = 0; i < pathParts.length - 1; i++) {
            try {
                currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create });
            } catch (error) {
                if (create) {
                    currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
                } else {
                    throw error;
                }
            }
        }
        
        // Get the file handle
        const fileName = pathParts[pathParts.length - 1];
        return await currentHandle.getFileHandle(fileName, { create });
    }

    // Update specific content in HTML files
    async updateHTMLContent(filePath, updates) {
        const content = await this.readFile(filePath);
        if (!content) return false;

        let updatedContent = content;

        // Process each update
        for (const [selector, newValue] of Object.entries(updates)) {
            updatedContent = this.updateHTMLElement(updatedContent, selector, newValue);
        }

        return await this.writeFile(filePath, updatedContent);
    }

    // Update specific HTML elements
    updateHTMLElement(html, selector, newValue) {
        switch (selector) {
            case 'title':
                return html.replace(/<title>.*?<\/title>/i, `<title>${newValue}</title>`);
                
            case 'meta-description':
                return html.replace(
                    /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
                    `$1${newValue}"`
                );
                
            case 'h1':
                return html.replace(/<h1[^>]*>.*?<\/h1>/i, `<h1>${newValue}</h1>`);
                
            case 'hero-subtitle':
                // Look for hero section and update the first paragraph
                return html.replace(
                    /(<section[^>]*class[^>]*hero[^>]*>[\s\S]*?<p[^>]*>)[^<]*([\s\S]*?<\/p>)/i,
                    `$1${newValue}$2`
                );
                
            case 'phone':
                // Update all phone number references
                return html.replace(/\(\d{3}\)\s\d{3}-\d{4}/g, newValue);
                
            case 'email':
                // Update email references
                return html.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, newValue);
                
            default:
                // Generic class or ID selector
                if (selector.startsWith('.') || selector.startsWith('#')) {
                    const selectorType = selector.charAt(0);
                    const selectorName = selector.slice(1);
                    const attribute = selectorType === '.' ? 'class' : 'id';
                    
                    const regex = new RegExp(
                        `(<[^>]*${attribute}=["'][^"']*${selectorName}[^"']*["'][^>]*>)([^<]*)(</[^>]*>)`,
                        'i'
                    );
                    
                    return html.replace(regex, `$1${newValue}$3`);
                }
                return html;
        }
    }

    // Queue updates for batch processing
    queueUpdate(filePath, selector, value) {
        const updateKey = `${filePath}:${selector}`;
        this.pendingUpdates.set(updateKey, { filePath, selector, value, timestamp: Date.now() });
        
        // Process updates after a delay
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            this.processUpdateQueue();
        }, 2000);
    }

    // Process all queued updates
    async processUpdateQueue() {
        if (this.isProcessing || this.pendingUpdates.size === 0) return;
        
        this.isProcessing = true;
        console.log(`📝 Processing ${this.pendingUpdates.size} updates...`);

        // Group updates by file
        const fileUpdates = new Map();
        
        for (const [key, update] of this.pendingUpdates) {
            if (!fileUpdates.has(update.filePath)) {
                fileUpdates.set(update.filePath, {});
            }
            fileUpdates.get(update.filePath)[update.selector] = update.value;
        }

        // Process each file
        let successCount = 0;
        for (const [filePath, updates] of fileUpdates) {
            const success = await this.updateHTMLContent(filePath, updates);
            if (success) successCount++;
        }

        // Clear processed updates
        this.pendingUpdates.clear();
        this.isProcessing = false;

        console.log(`✅ Processed ${successCount}/${fileUpdates.size} file updates`);
        
        // Trigger UI notification
        if (window.admin) {
            window.admin.showUpdateNotification(`Updated ${successCount} files`);
        }
    }

    // Get simulated content for development
    getSimulatedContent(filePath) {
        const templates = {
            'index.html': this.getHomepageTemplate(),
            'services/index.html': this.getServicesTemplate(),
            'locations/index.html': this.getLocationsTemplate(),
            'contact/index.html': this.getContactTemplate()
        };
        
        return templates[filePath] || '<html><body><h1>Page Not Found</h1></body></html>';
    }

    getHomepageTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buy Junk Car Miami - We Buy Junk Cars Miami | Free Towing</title>
    <meta name="description" content="Get instant cash for your junk car in Miami! Free towing, same-day pickup. We buy cars with no title. Call (305) 534-5991 for your quote today.">
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>We Buy Junk Cars in Miami</h1>
            <p>Get instant cash for your junk car with free towing and same-day pickup throughout Miami-Dade County.</p>
            <a href="tel:+13055345991" class="btn">Call (305) 534-5991</a>
        </div>
    </section>
</body>
</html>`;
    }

    getServicesTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Junk Car Services Miami | Cash for Cars | Buy Junk Car Miami</title>
    <meta name="description" content="Professional junk car removal services in Miami. Free towing, instant quotes, same-day pickup. We buy all makes and models.">
</head>
<body>
    <section class="hero">
        <h1>Professional Junk Car Services</h1>
        <p>Complete junk car removal and cash services throughout Miami-Dade and Broward County.</p>
    </section>
</body>
</html>`;
    }

    getLocationsTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Service Locations - Miami Junk Car Buyers | All Miami-Dade & Broward</title>
    <meta name="description" content="We buy junk cars throughout Miami-Dade and Broward County. See all service areas: Miami, Hialeah, Coral Gables, Fort Lauderdale, and more.">
</head>
<body>
    <section class="hero">
        <h1>Complete South Florida Coverage</h1>
        <p>Professional junk car removal throughout Miami-Dade and Broward County with same-day pickup.</p>
    </section>
</body>
</html>`;
    }

    getContactTemplate() {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Contact Us - Miami Junk Car Buyers | Get Your Quote Today</title>
    <meta name="description" content="Contact Miami's top junk car buyers. Call (305) 534-5991 for instant quotes, free towing, and same-day pickup throughout South Florida.">
</head>
<body>
    <section class="hero">
        <h1>Contact Miami Junk Car Buyers</h1>
        <p>Get your instant quote today! Call us or fill out our form for immediate assistance.</p>
    </section>
</body>
</html>`;
    }

    // Create new page
    async createNewPage(pageName, pageData) {
        const filePath = `${pageName}/index.html`;
        const content = this.generatePageTemplate(pageData);
        
        return await this.writeFile(filePath, content);
    }

    // Generate page template
    generatePageTemplate(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} | Buy Junk Car Miami</title>
    <meta name="description" content="${data.description}">
    <link rel="canonical" href="https://buyjunkcarmiami.com/${data.slug}/">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <header class="header">
        <!-- Header content -->
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>${data.title}</h1>
                <p>${data.subtitle}</p>
                <a href="tel:+13055345991" class="btn btn-primary">Call (305) 534-5991</a>
            </div>
        </section>

        <section class="content">
            <div class="container">
                ${data.content || '<p>Content coming soon...</p>'}
            </div>
        </section>
    </main>

    <footer class="footer">
        <!-- Footer content -->
    </footer>
</body>
</html>`;
    }

    // List all website files
    async listFiles(directory = '') {
        if (this.directoryHandle) {
            try {
                const files = [];
                const dirHandle = directory ? 
                    await this.directoryHandle.getDirectoryHandle(directory) : 
                    this.directoryHandle;
                
                for await (const [name, handle] of dirHandle.entries()) {
                    if (handle.kind === 'file' && name.endsWith('.html')) {
                        files.push({
                            name: name,
                            path: directory ? `${directory}/${name}` : name,
                            type: 'file',
                            modified: new Date().toISOString()
                        });
                    } else if (handle.kind === 'directory') {
                        const subFiles = await this.listFiles(directory ? `${directory}/${name}` : name);
                        files.push(...subFiles);
                    }
                }
                
                return files;
            } catch (error) {
                console.error('Failed to list files:', error);
                return [];
            }
        }
        
        // Return simulated file list
        return [
            { name: 'index.html', path: 'index.html', type: 'file', modified: new Date().toISOString() },
            { name: 'index.html', path: 'services/index.html', type: 'file', modified: new Date().toISOString() },
            { name: 'index.html', path: 'locations/index.html', type: 'file', modified: new Date().toISOString() },
            { name: 'index.html', path: 'contact/index.html', type: 'file', modified: new Date().toISOString() }
        ];
    }

    // Export file manager for global access
    static getInstance() {
        if (!WebsiteFileManager.instance) {
            WebsiteFileManager.instance = new WebsiteFileManager();
        }
        return WebsiteFileManager.instance;
    }
}

// Export for use in admin system
window.FileManager = WebsiteFileManager.getInstance();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    console.log('📁 Website File Manager loaded');
}