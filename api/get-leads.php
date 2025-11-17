<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Path to leads file
$leadsFile = __DIR__ . '/../admin/data/leads.json';

// Check if file exists
if (!file_exists($leadsFile)) {
    echo json_encode([
        'success' => true,
        'leads' => [],
        'stats' => [
            'total_leads' => 0,
            'new_leads' => 0,
            'today_leads' => 0,
            'high_priority_leads' => 0
        ]
    ]);
    exit();
}

// Read leads
$content = file_get_contents($leadsFile);
$leads = json_decode($content, true) ?: [];

// Calculate stats
$today = date('Y-m-d');
$stats = [
    'total_leads' => count($leads),
    'new_leads' => 0,
    'today_leads' => 0,
    'high_priority_leads' => 0
];

foreach ($leads as $lead) {
    if (isset($lead['status']) && $lead['status'] === 'new') {
        $stats['new_leads']++;
    }
    
    if (isset($lead['priority']) && $lead['priority'] === 'high') {
        $stats['high_priority_leads']++;
    }
    
    if (isset($lead['timestamp'])) {
        $leadDate = date('Y-m-d', strtotime($lead['timestamp']));
        if ($leadDate === $today) {
            $stats['today_leads']++;
        }
    }
}

echo json_encode([
    'success' => true,
    'leads' => $leads,
    'stats' => $stats
]);
?>
