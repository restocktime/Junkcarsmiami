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
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save']);
}
?>
