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

    // Send email notification
    $to = 'Buyjunkcarmiami@gmail.com';
    $subject = "New Lead: {$lead['name']} - {$lead['year']} {$lead['make']} {$lead['model']}";
    
    $message = "
    <html>
    <head>
        <title>New Lead Received</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background: #10b981; color: white; padding: 10px; border-radius: 5px 5px 0 0; }
            .row { margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .label { font-weight: bold; color: #555; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Lead Received</h2>
            </div>
            <div class='row'>
                <span class='label'>Name:</span> {$lead['name']}
            </div>
            <div class='row'>
                <span class='label'>Phone:</span> <a href='tel:{$lead['phone']}'>{$lead['phone']}</a>
            </div>
            <div class='row'>
                <span class='label'>Email:</span> {$lead['email']}
            </div>
            <div class='row'>
                <span class='label'>Vehicle:</span> {$lead['year']} {$lead['make']} {$lead['model']}
            </div>
            <div class='row'>
                <span class='label'>VIN:</span> {$lead['vin']}
            </div>
            <div class='row'>
                <span class='label'>Condition:</span> {$lead['condition']}
            </div>
            <div class='row'>
                <span class='label'>Location:</span> {$lead['location']} {$lead['zip']}
            </div>
            <div class='row'>
                <span class='label'>Comments:</span> {$lead['comments']}
            </div>
            <div class='row'>
                <span class='label'>Source:</span> {$lead['source']}
            </div>
            <p><a href='https://buyjunkcarmiami.com/admin/'>View in Admin Panel</a></p>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: leads@buyjunkcarmiami.com' . "\r\n";
    
    // Send email
    mail($to, $subject, $message, $headers);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Duplicate lead detected, not saved',
        'duplicate' => true
    ]);
}
?>
