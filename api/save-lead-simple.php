<?php
// Simple lead saver - no validation, just append to file
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Get input
$input = file_get_contents('php://input');
$lead = json_decode($input, true);

if (!$lead) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid JSON']));
}

// File path
$file = __DIR__ . '/../admin/data/leads.json';

// Ensure directory exists
$dir = dirname($file);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

// Read existing leads
$leads = [];
if (file_exists($file)) {
    $content = file_get_contents($file);
    $leads = json_decode($content, true) ?: [];
}

// Add new lead
array_unshift($leads, $lead);

// Keep only last 500 leads
if (count($leads) > 500) {
    $leads = array_slice($leads, 0, 500);
}

// Save
if (file_put_contents($file, json_encode($leads, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'leadId' => $lead['id']]);

    // Send email notification
    $to = 'Buyjunkcarmiami@gmail.com';
    $name = $lead['name'] ?? 'Unknown';
    $phone = $lead['phone'] ?? 'Unknown';
    $year = $lead['year'] ?? '';
    $make = $lead['make'] ?? '';
    $model = $lead['model'] ?? '';
    
    $subject = "New Lead: $name - $year $make $model";
    
    $message = "
    <html>
    <head>
        <title>New Lead Received</title>
    </head>
    <body>
        <h2>New Lead Received</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Phone:</strong> <a href='tel:$phone'>$phone</a></p>
        <p><strong>Vehicle:</strong> $year $make $model</p>
        <p><strong>Location:</strong> " . ($lead['location'] ?? '') . "</p>
        <p><strong>Comments:</strong> " . ($lead['comments'] ?? '') . "</p>
        <p><a href='https://buyjunkcarmiami.com/admin/'>View in Admin Panel</a></p>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: leads@buyjunkcarmiami.com' . "\r\n";
    
    // Send email
    mail($to, $subject, $message, $headers);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save']);
}
?>
