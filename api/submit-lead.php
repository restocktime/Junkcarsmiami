<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

// Validate required fields
if (empty($data['name']) || empty($data['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and phone are required']);
    exit();
}

// Create lead object
$lead = [
    'id' => $data['id'] ?? (string)(time() . rand(1000, 9999)),
    'name' => htmlspecialchars($data['name']),
    'phone' => htmlspecialchars($data['phone']),
    'email' => htmlspecialchars($data['email'] ?? ''),
    'vehicle' => htmlspecialchars($data['vehicle'] ?? ''),
    'year' => htmlspecialchars($data['year'] ?? ''),
    'make' => htmlspecialchars($data['make'] ?? ''),
    'model' => htmlspecialchars($data['model'] ?? ''),
    'vin' => htmlspecialchars($data['vin'] ?? ''),
    'condition' => htmlspecialchars($data['condition'] ?? ''),
    'hasTitle' => htmlspecialchars($data['hasTitle'] ?? ''),
    'damage' => htmlspecialchars($data['damage'] ?? ''),
    'location' => htmlspecialchars($data['location'] ?? 'Miami'),
    'zip' => htmlspecialchars($data['zip'] ?? ''),
    'comments' => htmlspecialchars($data['comments'] ?? ''),
    'status' => 'new',
    'priority' => 'high',
    'quote' => '',
    'notes' => '',
    'timestamp' => $data['timestamp'] ?? date('c'),
    'source' => $data['source'] ?? 'Website Form',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

// Path to leads file
$leadsFile = __DIR__ . '/../admin/data/leads.json';

// Ensure directory exists
$dir = dirname($leadsFile);
if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
}

// Read existing leads
$leads = [];
if (file_exists($leadsFile)) {
    $content = file_get_contents($leadsFile);
    $leads = json_decode($content, true) ?: [];
}

// Check for duplicates (same phone in last 5 minutes)
$isDuplicate = false;
$fiveMinutesAgo = time() - (5 * 60);
foreach ($leads as $existingLead) {
    if ($existingLead['phone'] === $lead['phone']) {
        $existingTime = strtotime($existingLead['timestamp']);
        if ($existingTime > $fiveMinutesAgo) {
            $isDuplicate = true;
            break;
        }
    }
}

if (!$isDuplicate) {
    // Add new lead to beginning
    array_unshift($leads, $lead);
    
    // Keep only last 1000 leads
    if (count($leads) > 1000) {
        $leads = array_slice($leads, 0, 1000);
    }
    
    // Save to file
    $result = file_put_contents($leadsFile, json_encode($leads, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save lead']);
        exit();
    }
    
    // Also log to a backup file
    $logFile = __DIR__ . '/../admin/data/leads.log';
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' - ' . json_encode($lead) . "\n", FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => 'Lead saved successfully',
        'leadId' => $lead['id']
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Duplicate lead detected, not saved',
        'duplicate' => true
    ]);
}
?>
