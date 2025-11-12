<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple authentication
$valid_token = 'BuyJunkCarMiami2024!';
$auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $auth_header);

if ($token !== $valid_token && $_SERVER['REQUEST_METHOD'] !== 'POST' && !isset($_POST['action']) || $_POST['action'] !== 'login') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$base_path = dirname(__DIR__); // Parent directory of admin

switch ($action) {
    case 'login':
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        
        if ($username === 'admin' && $password === 'BuyJunkCarMiami2024!') {
            echo json_encode([
                'success' => true,
                'token' => $valid_token,
                'message' => 'Login successful'
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
        break;
        
    case 'get_leads':
        // Read leads from a JSON file
        $leads_file = $base_path . '/admin/data/leads.json';
        if (file_exists($leads_file)) {
            $leads = json_decode(file_get_contents($leads_file), true);
        } else {
            $leads = [];
        }
        echo json_encode(['success' => true, 'leads' => $leads]);
        break;
        
    case 'save_lead':
        $lead_data = json_decode(file_get_contents('php://input'), true);
        $leads_file = $base_path . '/admin/data/leads.json';
        
        // Create data directory if it doesn't exist
        $data_dir = dirname($leads_file);
        if (!is_dir($data_dir)) {
            mkdir($data_dir, 0755, true);
        }
        
        // Load existing leads
        if (file_exists($leads_file)) {
            $leads = json_decode(file_get_contents($leads_file), true);
        } else {
            $leads = [];
        }
        
        // Add or update lead
        $lead_data['id'] = $lead_data['id'] ?? time() . rand(100, 999);
        $lead_data['timestamp'] = date('Y-m-d H:i:s');
        
        $found = false;
        foreach ($leads as $index => $lead) {
            if ($lead['id'] === $lead_data['id']) {
                $leads[$index] = $lead_data;
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            $leads[] = $lead_data;
        }
        
        file_put_contents($leads_file, json_encode($leads, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Lead saved']);
        break;
        
    case 'update_content':
        $file = $_POST['file'] ?? '';
        $content = $_POST['content'] ?? '';
        $selector = $_POST['selector'] ?? '';
        
        if (!$file || !$content) {
            echo json_encode(['error' => 'Missing file or content']);
            exit;
        }
        
        $file_path = $base_path . '/' . $file;
        if (!file_exists($file_path)) {
            echo json_encode(['error' => 'File not found']);
            exit;
        }
        
        // Read current file
        $html = file_get_contents($file_path);
        
        // Simple content replacement based on selector
        if ($selector) {
            // For now, just replace the first occurrence
            $html = preg_replace('/(<' . preg_quote($selector) . '[^>]*>)(.*?)(<\/' . preg_quote($selector) . '>)/s', '$1' . $content . '$3', $html, 1);
        }
        
        // Write back to file
        if (file_put_contents($file_path, $html)) {
            echo json_encode(['success' => true, 'message' => 'Content updated']);
        } else {
            echo json_encode(['error' => 'Failed to write file']);
        }
        break;
        
    case 'get_pages':
        // Scan for HTML files
        $pages = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($base_path),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($iterator as $file) {
            if ($file->getExtension() === 'html' && 
                strpos($file->getPath(), 'admin') === false &&
                strpos($file->getPath(), 'node_modules') === false) {
                
                $relative_path = str_replace($base_path . '/', '', $file->getPathname());
                $pages[] = [
                    'path' => $relative_path,
                    'name' => basename($file->getPathname(), '.html'),
                    'modified' => date('Y-m-d H:i:s', $file->getMTime())
                ];
            }
        }
        
        echo json_encode(['success' => true, 'pages' => $pages]);
        break;
        
    case 'create_page':
        $page_data = json_decode(file_get_contents('php://input'), true);
        $page_name = $page_data['name'] ?? '';
        $page_content = $page_data['content'] ?? '';
        
        if (!$page_name || !$page_content) {
            echo json_encode(['error' => 'Missing page name or content']);
            exit;
        }
        
        // Create page directory if it doesn't exist
        $page_dir = $base_path . '/' . $page_name;
        if (!is_dir($page_dir)) {
            mkdir($page_dir, 0755, true);
        }
        
        // Write the page file
        $page_file = $page_dir . '/index.html';
        if (file_put_contents($page_file, $page_content)) {
            echo json_encode(['success' => true, 'message' => 'Page created successfully', 'path' => $page_name . '/index.html']);
        } else {
            echo json_encode(['error' => 'Failed to create page file']);
        }
        break;
        
    case 'get_page_content':
        $page_path = $_GET['path'] ?? '';
        if (!$page_path) {
            echo json_encode(['error' => 'Page path required']);
            exit;
        }
        
        $file_path = $base_path . '/' . ltrim($page_path, '/');
        if ($page_path === '/' || $page_path === '') {
            $file_path = $base_path . '/index.html';
        } else if (!str_ends_with($file_path, '.html')) {
            $file_path .= '/index.html';
        }
        
        if (file_exists($file_path)) {
            $content = file_get_contents($file_path);
            echo json_encode(['success' => true, 'content' => $content, 'path' => $file_path]);
        } else {
            echo json_encode(['error' => 'Page not found']);
        }
        break;
        
    case 'save_page':
        $page_data = json_decode(file_get_contents('php://input'), true);
        $page_path = $page_data['path'] ?? '';
        $page_content = $page_data['content'] ?? '';
        
        if (!$page_path || !$page_content) {
            echo json_encode(['error' => 'Missing page path or content']);
            exit;
        }
        
        $file_path = $base_path . '/' . ltrim($page_path, '/');
        if (!str_ends_with($file_path, '.html')) {
            $file_path .= '/index.html';
        }
        
        if (file_put_contents($file_path, $page_content)) {
            echo json_encode(['success' => true, 'message' => 'Page saved successfully']);
        } else {
            echo json_encode(['error' => 'Failed to save page']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Unknown action']);
}
?>