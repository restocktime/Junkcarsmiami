<?php
/**
 * MIAMI JUNK CAR DATABASE SYSTEM
 * Handles all data operations for leads, content, and images
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

class MiamiJunkCarDB {
    private $db_file;
    private $db;
    
    public function __construct() {
        $this->db_file = __DIR__ . '/data/miami_junkcar.db';
        $this->initDatabase();
    }
    
    private function initDatabase() {
        try {
            $this->db = new SQLite3($this->db_file);
            $this->createTables();
        } catch (Exception $e) {
            die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
        }
    }
    
    private function createTables() {
        // Leads table
        $this->db->exec("CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            vehicle TEXT,
            year TEXT,
            make TEXT,
            model TEXT,
            condition_desc TEXT,
            location TEXT,
            message TEXT,
            status TEXT DEFAULT 'new',
            source TEXT DEFAULT 'website',
            priority TEXT DEFAULT 'medium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Content table  
        $this->db->exec("CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT NOT NULL UNIQUE,
            title TEXT,
            content TEXT,
            meta_description TEXT,
            keywords TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Images table
        $this->db->exec("CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            alt_text TEXT,
            title TEXT,
            section TEXT,
            url TEXT,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Business info table
        $this->db->exec("CREATE TABLE IF NOT EXISTS business_info (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            license TEXT,
            hours TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");
        
        // Insert default business info if not exists
        $result = $this->db->query("SELECT COUNT(*) as count FROM business_info");
        $row = $result->fetchArray();
        if ($row['count'] == 0) {
            $this->db->exec("INSERT INTO business_info (id, name, phone, email, address, license) VALUES 
                (1, 'Buy Junk Car Miami', '(305) 534-5991', 'buyjunkcarmiami@gmail.com', '122 South Miami Avenue, Miami, FL 33130', 'TI0105')");
        }
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($method) {
            case 'GET':
                return $this->handleGet();
            case 'POST':
                return $this->handlePost($input);
            case 'PUT':
                return $this->handlePut($input);
            case 'DELETE':
                return $this->handleDelete($input);
            default:
                return ['error' => 'Method not allowed'];
        }
    }
    
    private function handleGet() {
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'leads':
                return $this->getLeads();
            case 'content':
                return $this->getContent();
            case 'images':
                return $this->getImages();
            case 'business':
                return $this->getBusinessInfo();
            case 'stats':
                return $this->getStats();
            default:
                return ['error' => 'Invalid action'];
        }
    }
    
    private function handlePost($input) {
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'add_lead':
                return $this->addLead($input);
            case 'update_content':
                return $this->updateContent($input);
            case 'upload_image':
                return $this->uploadImage($input);
            case 'capture_form':
                return $this->captureFormSubmission($input);
            default:
                return ['error' => 'Invalid action'];
        }
    }
    
    // Lead management
    private function getLeads() {
        $stmt = $this->db->prepare("SELECT * FROM leads ORDER BY created_at DESC");
        $result = $stmt->execute();
        
        $leads = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $leads[] = $row;
        }
        
        return ['success' => true, 'leads' => $leads];
    }
    
    private function addLead($data) {
        $stmt = $this->db->prepare("INSERT INTO leads (name, phone, email, vehicle, year, make, model, condition_desc, location, message, source, priority) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $data['name'] ?? '',
            $data['phone'] ?? '',
            $data['email'] ?? '',
            $data['vehicle'] ?? '',
            $data['year'] ?? '',
            $data['make'] ?? '',
            $data['model'] ?? '',
            $data['condition'] ?? '',
            $data['location'] ?? 'Miami',
            $data['message'] ?? '',
            $data['source'] ?? 'website',
            $this->calculatePriority($data)
        ]);
        
        if ($result) {
            $leadId = $this->db->lastInsertRowID();
            return ['success' => true, 'lead_id' => $leadId, 'message' => 'Lead added successfully'];
        }
        
        return ['success' => false, 'error' => 'Failed to add lead'];
    }
    
    private function calculatePriority($data) {
        $score = 0;
        
        if (!empty($data['phone'])) $score += 3;
        if (!empty($data['email'])) $score += 2;
        if (!empty($data['year']) || !empty($data['make'])) $score += 2;
        if (!empty($data['message'])) $score += 1;
        
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
    
    // Content management
    private function getContent() {
        $stmt = $this->db->prepare("SELECT * FROM content");
        $result = $stmt->execute();
        
        $content = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $content[$row['section']] = $row;
        }
        
        return ['success' => true, 'content' => $content];
    }
    
    private function updateContent($data) {
        $stmt = $this->db->prepare("INSERT OR REPLACE INTO content (section, title, content, meta_description, keywords) VALUES (?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $data['section'],
            $data['title'] ?? '',
            $data['content'] ?? '',
            $data['meta_description'] ?? '',
            $data['keywords'] ?? ''
        ]);
        
        return ['success' => $result, 'message' => $result ? 'Content updated' : 'Update failed'];
    }
    
    // Image management
    private function getImages() {
        $stmt = $this->db->prepare("SELECT * FROM images ORDER BY upload_date DESC");
        $result = $stmt->execute();
        
        $images = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $images[] = $row;
        }
        
        return ['success' => true, 'images' => $images];
    }
    
    // Business info
    private function getBusinessInfo() {
        $stmt = $this->db->prepare("SELECT * FROM business_info WHERE id = 1");
        $result = $stmt->execute();
        $business = $result->fetchArray(SQLITE3_ASSOC);
        
        return ['success' => true, 'business' => $business];
    }
    
    // Statistics
    private function getStats() {
        $totalLeads = $this->db->querySingle("SELECT COUNT(*) FROM leads");
        $newLeads = $this->db->querySingle("SELECT COUNT(*) FROM leads WHERE status = 'new'");
        $todayLeads = $this->db->querySingle("SELECT COUNT(*) FROM leads WHERE DATE(created_at) = DATE('now')");
        $highPriorityLeads = $this->db->querySingle("SELECT COUNT(*) FROM leads WHERE priority = 'high' AND status = 'new'");
        
        return [
            'success' => true,
            'stats' => [
                'total_leads' => $totalLeads,
                'new_leads' => $newLeads,
                'today_leads' => $todayLeads,
                'high_priority_leads' => $highPriorityLeads
            ]
        ];
    }
    
    // Form capture for website forms
    public function captureFormSubmission($data) {
        // Extract form data
        $leadData = [
            'name' => $data['name'] ?? $data['customer-name'] ?? '',
            'phone' => $data['phone'] ?? $data['customer-phone'] ?? '',
            'email' => $data['email'] ?? $data['customer-email'] ?? '',
            'vehicle' => $this->buildVehicleString($data),
            'year' => $data['year'] ?? $data['vehicle-year'] ?? '',
            'make' => $data['make'] ?? $data['vehicle-make'] ?? '',
            'model' => $data['model'] ?? $data['vehicle-model'] ?? '',
            'condition' => $data['condition'] ?? $data['vehicle-condition'] ?? '',
            'location' => $data['location'] ?? $this->getLocationFromReferer(),
            'message' => $data['message'] ?? $data['additional-info'] ?? '',
            'source' => 'website_form'
        ];
        
        return $this->addLead($leadData);
    }
    
    private function buildVehicleString($data) {
        $parts = [];
        if (!empty($data['year'])) $parts[] = $data['year'];
        if (!empty($data['make'])) $parts[] = $data['make'];
        if (!empty($data['model'])) $parts[] = $data['model'];
        
        return !empty($parts) ? implode(' ', $parts) : ($data['vehicle'] ?? 'Vehicle details not specified');
    }
    
    private function getLocationFromReferer() {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        
        if (strpos($referer, 'miami-beach') !== false) return 'Miami Beach';
        if (strpos($referer, 'coral-gables') !== false) return 'Coral Gables';
        if (strpos($referer, 'homestead') !== false) return 'Homestead';
        if (strpos($referer, 'hialeah') !== false) return 'Hialeah';
        if (strpos($referer, 'fort-lauderdale') !== false) return 'Fort Lauderdale';
        
        return 'Miami';
    }
}

// Handle the request
$db = new MiamiJunkCarDB();
echo json_encode($db->handleRequest());
?>