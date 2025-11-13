<?php
/**
 * FALLBACK API FOR ADMIN WHEN DATABASE.PHP FAILS
 * Simple file-based storage system
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Simple data directory
$dataDir = __DIR__ . '/simple_data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Get request data
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?: [];

switch ($method) {
    case 'GET':
        handleGet($action, $dataDir);
        break;
    case 'POST':
        handlePost($input, $dataDir);
        break;
    default:
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGet($action, $dataDir) {
    switch ($action) {
        case 'stats':
            $leads = loadData($dataDir . '/leads.json', []);
            $total = count($leads);
            $new = count(array_filter($leads, fn($l) => ($l['status'] ?? 'new') === 'new'));
            $today = count(array_filter($leads, fn($l) => 
                date('Y-m-d', strtotime($l['created_at'] ?? 'now')) === date('Y-m-d')
            ));
            $high = count(array_filter($leads, fn($l) => ($l['priority'] ?? 'medium') === 'high'));
            
            echo json_encode([
                'success' => true,
                'stats' => [
                    'total_leads' => $total,
                    'new_leads' => $new,
                    'today_leads' => $today,
                    'high_priority_leads' => $high
                ]
            ]);
            break;
            
        case 'leads':
            $leads = loadData($dataDir . '/leads.json', []);
            echo json_encode(['success' => true, 'leads' => $leads]);
            break;
            
        case 'content':
            $content = loadData($dataDir . '/content.json', getDefaultContent());
            echo json_encode(['success' => true, 'content' => $content]);
            break;
            
        case 'business':
            $business = loadData($dataDir . '/business.json', getDefaultBusiness());
            echo json_encode(['success' => true, 'business' => $business]);
            break;
            
        case 'images':
            $images = loadData($dataDir . '/images.json', []);
            echo json_encode(['success' => true, 'images' => $images]);
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
}

function handlePost($input, $dataDir) {
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'capture_form':
        case 'add_lead':
            $leads = loadData($dataDir . '/leads.json', []);
            $lead = [
                'id' => time() . rand(100, 999),
                'name' => $input['name'] ?? 'Website Visitor',
                'phone' => $input['phone'] ?? 'Not provided',
                'email' => $input['email'] ?? '',
                'year' => $input['year'] ?? '',
                'make' => $input['make'] ?? '',
                'model' => $input['model'] ?? '',
                'condition' => $input['condition'] ?? '',
                'location' => $input['location'] ?? 'Miami',
                'message' => $input['message'] ?? '',
                'vehicle' => buildVehicleString($input),
                'status' => 'new',
                'source' => $input['source'] ?? 'website_form',
                'priority' => calculatePriority($input),
                'created_at' => date('c'),
                'updated_at' => date('c')
            ];
            
            array_unshift($leads, $lead);
            
            // Keep only last 500 leads
            if (count($leads) > 500) {
                $leads = array_slice($leads, 0, 500);
            }
            
            saveData($dataDir . '/leads.json', $leads);
            echo json_encode(['success' => true, 'lead_id' => $lead['id'], 'message' => 'Lead added successfully']);
            break;
            
        case 'update_content':
            $content = loadData($dataDir . '/content.json', getDefaultContent());
            $section = $input['section'] ?? '';
            if ($section) {
                $content[$section] = [
                    'title' => $input['title'] ?? '',
                    'content' => $input['content'] ?? '',
                    'meta_description' => $input['meta_description'] ?? '',
                    'keywords' => $input['keywords'] ?? '',
                    'updated_at' => date('c')
                ];
                saveData($dataDir . '/content.json', $content);
                echo json_encode(['success' => true, 'message' => 'Content updated']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Section required']);
            }
            break;
            
        case 'update_business':
            $business = [
                'name' => $input['name'] ?? 'Buy Junk Car Miami',
                'phone' => $input['phone'] ?? '(305) 534-5991',
                'email' => $input['email'] ?? 'buyjunkcarmiami@gmail.com',
                'address' => $input['address'] ?? '122 South Miami Avenue, Miami, FL 33130',
                'license' => $input['license'] ?? 'TI0105',
                'hours' => $input['hours'] ?? 'Monday - Sunday: 8:00 AM - 6:00 PM',
                'updated_at' => date('c')
            ];
            saveData($dataDir . '/business.json', $business);
            echo json_encode(['success' => true, 'message' => 'Business info updated']);
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
}

function loadData($file, $default = []) {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        return $data !== null ? $data : $default;
    }
    return $default;
}

function saveData($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function buildVehicleString($data) {
    $parts = [];
    if (!empty($data['year'])) $parts[] = $data['year'];
    if (!empty($data['make'])) $parts[] = $data['make'];
    if (!empty($data['model'])) $parts[] = $data['model'];
    return !empty($parts) ? implode(' ', $parts) : 'Vehicle details not specified';
}

function calculatePriority($data) {
    $score = 0;
    if (!empty($data['phone']) && strlen($data['phone']) > 5) $score += 3;
    if (!empty($data['email']) && strpos($data['email'], '@')) $score += 2;
    if (!empty($data['year']) || !empty($data['make'])) $score += 2;
    if (!empty($data['message']) && strlen($data['message']) > 10) $score += 1;
    
    $urgentKeywords = ['urgent', 'asap', 'today', 'now', 'immediately'];
    $message = strtolower($data['message'] ?? '');
    foreach ($urgentKeywords as $keyword) {
        if (strpos($message, $keyword) !== false) {
            $score += 3;
            break;
        }
    }
    
    if ($score >= 6) return 'high';
    if ($score >= 3) return 'medium';
    return 'low';
}

function getDefaultContent() {
    return [
        'hero' => [
            'title' => 'Buy Junk Car Miami',
            'content' => 'Get instant cash for your junk car today! We buy all makes and models in any condition.',
            'meta_description' => 'Miami\'s #1 junk car buyer - Get instant cash offers for your vehicle'
        ],
        'services' => [
            'title' => 'Our Services',
            'content' => 'Fast cash offers, free towing, same-day pickup, licensed and insured service',
            'meta_description' => 'Professional junk car removal and buying services in Miami'
        ],
        'about' => [
            'title' => 'About Buy Junk Car Miami',
            'content' => 'We are Miami\'s premier junk car buyers, licensed and trusted by thousands of customers',
            'meta_description' => 'Learn about Miami\'s most trusted junk car buying service'
        ],
        'contact' => [
            'title' => 'Contact Information',
            'content' => 'Phone: (305) 534-5991 | Email: buyjunkcarmiami@gmail.com | License: TI0105',
            'meta_description' => 'Contact Buy Junk Car Miami for immediate cash offers'
        ],
        'locations' => [
            'title' => 'Service Areas',
            'content' => 'We serve Miami, Miami Beach, Coral Gables, Homestead, Hialeah and all of South Florida',
            'meta_description' => 'Junk car buying services throughout South Florida'
        ]
    ];
}

function getDefaultBusiness() {
    return [
        'name' => 'Buy Junk Car Miami',
        'phone' => '(305) 534-5991',
        'email' => 'buyjunkcarmiami@gmail.com',
        'address' => '122 South Miami Avenue, Miami, FL 33130',
        'license' => 'TI0105',
        'hours' => 'Monday - Sunday: 8:00 AM - 6:00 PM'
    ];
}
?>