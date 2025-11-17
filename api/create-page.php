<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Validate required fields
if (empty($data['title']) || empty($data['slug']) || empty($data['description'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Title, slug, and description are required']);
    exit();
}

// Sanitize inputs
$title = htmlspecialchars($data['title']);
$slug = preg_replace('/[^a-z0-9-]/', '', strtolower($data['slug']));
$description = htmlspecialchars($data['description']);
$pageType = $data['pageType'] ?? 'service';
$content = $data['content'] ?? '';
$phone = $data['phone'] ?? '(305) 534-5991';

// Determine directory based on page type
$baseDir = __DIR__ . '/../';
switch ($pageType) {
    case 'location':
        $directory = $baseDir . 'locations/' . $slug;
        break;
    case 'brand':
        $directory = $baseDir . 'brands/' . $slug;
        break;
    default:
        $directory = $baseDir . 'services/' . $slug;
}

// Check if directory already exists
if (file_exists($directory)) {
    http_response_code(400);
    echo json_encode(['error' => 'Page already exists with this slug']);
    exit();
}

// Create directory
if (!mkdir($directory, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create directory']);
    exit();
}

// Generate HTML content
$html = generatePageHTML($title, $slug, $description, $content, $phone, $pageType);

// Save index.html
$filePath = $directory . '/index.html';
if (file_put_contents($filePath, $html) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create page file']);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'Page created successfully',
    'url' => '/' . ($pageType === 'service' ? 'services' : ($pageType === 'location' ? 'locations' : 'brands')) . '/' . $slug . '/',
    'path' => $filePath
]);

function generatePageHTML($title, $slug, $description, $content, $phone, $pageType) {
    $currentYear = date('Y');
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title} | Buy Junk Car Miami</title>
    <meta name="description" content="{$description}">
    <link rel="canonical" href="https://buyjunkcarmiami.com/{$pageType}s/{$slug}/">
    <link rel="stylesheet" href="../../css/styles.css">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "{$title}",
        "description": "{$description}",
        "provider": {
            "@type": "LocalBusiness",
            "name": "Buy Junk Car Miami",
            "telephone": "{$phone}",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Miami",
                "addressRegion": "FL",
                "addressCountry": "US"
            }
        }
    }
    </script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-top">
                <div class="contact-info">
                    <a href="tel:+13055345991" class="phone-number">📞 {$phone}</a>
                    <a href="https://wa.me/13055345991" class="whatsapp-link" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                    <span class="hours">Open 8am-10pm Daily</span>
                </div>
                <div class="language-toggle">
                    <a href="/es/" hreflang="es-us">ES</a>
                </div>
            </div>
            
            <nav class="navbar">
                <div class="nav-brand">
                    <a href="/">
                        <img src="../../images/logo.png" alt="Buy Junk Car Miami Logo" class="logo-img">
                    </a>
                </div>
                
                <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <ul class="nav-menu" id="nav-menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="/services/">Services</a></li>
                    <li><a href="/locations/">Locations</a></li>
                    <li><a href="/brands/">Car Brands</a></li>
                    <li><a href="/gallery/">Gallery</a></li>
                    <li><a href="/blog/">Blog</a></li>
                    <li><a href="/contact/">Contact</a></li>
                    <li class="nav-cta">
                        <a href="#quote-form" class="btn btn-primary">Get Quote</a>
                    </li>
                </ul>
            </nav>
        </div>
    </header>

    <main id="main-content">
        <section class="hero" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 4rem 0; color: white;">
            <div class="container">
                <h1>{$title}</h1>
                <p class="hero-subtitle">{$description}</p>
                
                <div class="hero-cta" style="margin-top: 2rem;">
                    <a href="tel:+13055345991" class="btn btn-primary btn-large">📞 Call {$phone}</a>
                    <a href="#quote-form" class="btn btn-secondary btn-large">Get Free Quote</a>
                </div>
            </div>
        </section>

        <section class="content-section" style="padding: 4rem 0;">
            <div class="container">
                <div class="content-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div class="main-content">
                        {$content}
                        
                        <h2>Why Choose Buy Junk Car Miami?</h2>
                        <ul>
                            <li>✅ Instant Cash Payment</li>
                            <li>✅ Free Towing Service</li>
                            <li>✅ Same Day Pickup</li>
                            <li>✅ No Title? No Problem</li>
                            <li>✅ Licensed & Insured</li>
                        </ul>
                        
                        <h2>How It Works</h2>
                        <ol>
                            <li><strong>Call or Submit Form</strong> - Get your instant quote</li>
                            <li><strong>Accept Offer</strong> - We schedule pickup at your convenience</li>
                            <li><strong>Get Paid</strong> - Cash on the spot when we pick up</li>
                        </ol>
                    </div>
                    
                    <aside class="sidebar">
                        <div class="quick-quote-form" id="quote-form" style="background: #f9fafb; padding: 2rem; border-radius: 8px; border: 2px solid #dc2626;">
                            <h3>Get Your Quote</h3>
                            <form class="sidebar-form">
                                <input type="text" name="name" placeholder="Your Name*" required>
                                <input type="tel" name="phone" placeholder="Phone Number*" required>
                                <input type="text" name="year" placeholder="Year">
                                <input type="text" name="make" placeholder="Make">
                                <input type="text" name="model" placeholder="Model">
                                <textarea name="condition" placeholder="Vehicle condition..." rows="3"></textarea>
                                <button type="submit" class="btn btn-primary" style="width: 100%;">Get My Quote</button>
                            </form>
                        </div>
                        
                        <div style="margin-top: 2rem; padding: 1.5rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4>Contact Us</h4>
                            <p><strong>Phone:</strong> <a href="tel:+13055345991">{$phone}</a></p>
                            <p><strong>Hours:</strong> 8am-10pm Daily</p>
                            <p><strong>Service Area:</strong> Miami-Dade & Broward County</p>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer" style="background: #1f2937; color: white; padding: 2rem 0; text-align: center;">
        <div class="container">
            <p>&copy; {$currentYear} Buy Junk Car Miami. All rights reserved.</p>
            <p><a href="/privacy/" style="color: white;">Privacy Policy</a> | <a href="/terms/" style="color: white;">Terms of Service</a></p>
        </div>
    </footer>
    
    <script src="../../js/app.js"></script>
</body>
</html>
HTML;
}
?>
