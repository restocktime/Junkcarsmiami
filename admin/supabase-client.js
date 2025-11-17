// Direct Supabase client - works immediately without serverless functions
const SUPABASE_URL = 'https://ccukjascbxmfbfalprib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdWtqYXNjYnhtZmJmYWxwcmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM2NzYsImV4cCI6MjA3ODk1OTY3Nn0.m4mQNDbSSRJYbKEDTIXWSAjW6K2ReUJQbA4q3xyxu0E';

// Supabase REST API client
window.SupabaseClient = {
    // Get all leads
    async getLeads() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

            return {
                success: true,
                leads: leads,
                stats: stats
            };
        } catch (error) {
            console.error('Supabase error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Add new lead
    async addLead(lead) {
        try {
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
                source: lead.source || 'Website Form'
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(dbLead)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HTTP ${response.status}: ${error}`);
            }

            const savedLead = await response.json();

            return {
                success: true,
                message: 'Lead saved to database',
                lead: savedLead[0]
            };
        } catch (error) {
            console.error('Supabase error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

console.log('✅ Supabase client loaded');
