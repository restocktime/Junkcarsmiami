<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$imagesDir = __DIR__ . '/../images/';
$images = [];

// Scan images directory
if (is_dir($imagesDir)) {
    $files = scandir($imagesDir);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || $file === '.DS_Store') {
            continue;
        }
        
        $filePath = $imagesDir . $file;
        
        // Skip directories
        if (is_dir($filePath)) {
            continue;
        }
        
        // Check if it's an image
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (in_array($ext, $imageExtensions)) {
            $images[] = [
                'filename' => $file,
                'path' => '/images/' . $file,
                'size' => filesize($filePath),
                'modified' => date('Y-m-d H:i:s', filemtime($filePath)),
                'type' => $ext
            ];
        }
    }
}

// Sort by modified date (newest first)
usort($images, function($a, $b) {
    return strtotime($b['modified']) - strtotime($a['modified']);
});

echo json_encode([
    'success' => true,
    'images' => $images,
    'count' => count($images)
]);
?>
