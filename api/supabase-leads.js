// Real Database Solution - Supabase (PostgreSQL)
// Works across ALL devices, stores in real database

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ccukjascbxmfbfalprib.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdWtqYXNjYnhtZmJmYWxwcmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM2NzYsImV4cCI6MjA3ODk1OTY3Nn0.m4mQNDbSSRJYbKEDTIXWSAjW6K2ReUJQbA4q3xyxu0E';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    // GET - Fetch all leads
    if (req.method === 'GET') {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const leads = await response.json();

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total_leads: leads.length,
        new_leads: leads.filter(l => l.status === 'new').length,
        today_leads: leads.filter(l => l.created_at?.startsWith(today)).length,
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

      // Prepare data for database
      const dbLead = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        vehicle: lead.vehicle || '',
        year: lead.year || '',
        make: lead.make || '',
        model: lead.model || '',
        vin: lead.vin || '',
        condition: lead.condition || '',
        has_title: lead.hasTitle || '',
        damage: lead.damage || '',
        location: lead.location || 'Miami',
        zip: lead.zip || '',
        comments: lead.comments || '',
        status: 'new',
        priority: 'high',
        source: lead.source || 'Website Form',
        created_at: new Date().toISOString()
      };

      // Insert into database
      const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dbLead)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Database error: ${error}`);
      }

      const savedLead = await response.json();

      return res.status(200).json({
        success: true,
        message: 'Lead saved to database',
        lead: savedLead[0]
      });
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
