// Vercel Serverless Function for Lead Management
// This works without PHP and deploys automatically

const fs = require('fs');
const path = require('path');

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  const leadsFile = path.join(process.cwd(), 'admin', 'data', 'leads.json');

  try {
    // GET - Return all leads
    if (req.method === 'GET') {
      let leads = [];
      
      if (fs.existsSync(leadsFile)) {
        const content = fs.readFileSync(leadsFile, 'utf8');
        leads = JSON.parse(content);
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total_leads: leads.length,
        new_leads: leads.filter(l => l.status === 'new').length,
        today_leads: leads.filter(l => l.timestamp?.startsWith(today)).length,
        high_priority_leads: leads.filter(l => l.priority === 'high').length
      };

      return res.status(200).json({
        success: true,
        leads: leads,
        stats: stats
      });
    }

    // POST - Add new lead
    if (req.method === 'POST') {
      const lead = req.body;

      // Validate
      if (!lead.name || !lead.phone) {
        return res.status(400).json({
          success: false,
          error: 'Name and phone are required'
        });
      }

      // Read existing leads
      let leads = [];
      if (fs.existsSync(leadsFile)) {
        const content = fs.readFileSync(leadsFile, 'utf8');
        leads = JSON.parse(content);
      }

      // Check for duplicates (same phone in last 5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const isDuplicate = leads.some(existingLead => 
        existingLead.phone === lead.phone && 
        new Date(existingLead.timestamp).getTime() > fiveMinutesAgo
      );

      if (!isDuplicate) {
        // Add new lead
        leads.unshift(lead);

        // Keep only last 1000 leads
        if (leads.length > 1000) {
          leads = leads.slice(0, 1000);
        }

        // Ensure directory exists
        const dir = path.dirname(leadsFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Save
        fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));

        return res.status(200).json({
          success: true,
          message: 'Lead saved successfully',
          leadId: lead.id
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Duplicate lead detected',
          duplicate: true
        });
      }
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
