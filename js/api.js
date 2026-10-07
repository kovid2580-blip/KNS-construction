/**
 * ============================================================================
 * KNS CONSTRUCTION & REAL ESTATE - CLIENT API & LEAD SERVICE LAYER
 * Phase 4 - Step 8: Production-Oriented Lead Management & Auth Client
 * ============================================================================
 * Dual-Mode Architecture:
 * 1. Production Mode: Communicates with REST API endpoints (/api/leads, /api/auth)
 * 2. Standalone Client Mode: Gracefully falls back to local data store when
 *    running on static hosts or offline environments, ensuring zero UI breakage.
 * ============================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_LEADS = 'kns_leads_db';
  const STORAGE_KEY_TOKEN = 'kns_admin_token';
  const STORAGE_KEY_USER = 'kns_admin_user';

  // Initial Development Test Records (Clearly marked as [TEST DATA] per specification)
  const SEED_TEST_LEADS = [
    {
      id: 'KNS-L-1001',
      name: '[TEST DATA] Venkat Reddy',
      phone: '+91 98490 12345',
      email: 'venkat.reddy@example.com',
      service: 'Villa Plot Inquiry',
      projectType: 'Villa Plot (Sangareddy)',
      location: 'Patancheru / Sangareddy',
      plotSize: '250 Sq. Yards (Plot #18)',
      constructionArea: 'N/A',
      budget: '₹40 Lakhs – ₹75 Lakhs',
      message: '[TEST DATA] Interested in North-facing 250 Sq. Yards plot in KNS Premium Villa Community.',
      source: 'Website Consultation Form',
      status: 'Contacted',
      notes: [
        {
          id: 'n_1001_1',
          text: 'Initial inquiry received via website.',
          author: 'System',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'n_1001_2',
          text: 'Called client. Verified interest in Plot #18. Scheduled site visit for coming Saturday.',
          author: 'Kiran Gajbhare',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'KNS-L-1002',
      name: '[TEST DATA] Dr. S. K. Sharma',
      phone: '+91 99891 56789',
      email: 'dr.sharma@example.com',
      service: 'Turnkey Construction',
      projectType: 'Premium Residential Turnkey',
      location: 'Raghavendra Colony, Kondapur',
      plotSize: '300 Sq. Yards',
      constructionArea: '3,200 SFT',
      budget: '₹75 Lakhs – ₹1.5 Crores',
      message: '[TEST DATA] Planning G+2 duplex construction with premium finishes in Kondapur.',
      source: 'Website Consultation Form',
      status: 'New',
      notes: [
        {
          id: 'n_1002_1',
          text: 'Inquiry received via website consultation form.',
          author: 'System',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'KNS-L-1003',
      name: '[TEST DATA] Anand Rao',
      phone: '+91 91212 98765',
      email: 'anand.rao@example.com',
      service: 'Commercial Construction',
      projectType: 'Commercial Plaza',
      location: 'Miyapur / Kondapur Main Road',
      plotSize: '400 Sq. Yards',
      constructionArea: '4,200 SFT',
      budget: 'Above ₹1.5 Crores',
      message: '[TEST DATA] Ground + 2 commercial retail floor space project inquiry.',
      source: 'WhatsApp Direct Inquiry',
      status: 'In Progress',
      notes: [
        {
          id: 'n_1003_1',
          text: 'Inquiry routed from WhatsApp helpline.',
          author: 'System',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: 'n_1003_2',
          text: 'Shared indicative cost estimate based on ₹2,200–₹2,500/SFT commercial package.',
          author: 'Kiran Gajbhare',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'KNS-L-1004',
      name: '[TEST DATA] Praveen Varma',
      phone: '+91 94401 22334',
      email: 'praveen.varma@example.com',
      service: 'Villa Plot Inquiry',
      projectType: 'Villa Plot (Sangareddy)',
      location: 'Patancheru / Sangareddy',
      plotSize: '250 Sq. Yards (Plot #42)',
      constructionArea: 'N/A',
      budget: '₹40 Lakhs – ₹75 Lakhs',
      message: '[TEST DATA] East-facing corner plot inquiry in Sangareddy villa layout.',
      source: 'Direct Office Walk-in',
      status: 'Converted',
      notes: [
        {
          id: 'n_1004_1',
          text: 'Met at Kondapur office. Token advance paid for Plot #42.',
          author: 'Kiran Gajbhare',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  class KnsApiClient {
    constructor() {
      this.apiBase = '/api';
      this.hasBackend = null; // null = unverified, true = REST API active, false = client mock mode
      this.token = sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN) || null;
      this.currentUser = null;

      try {
        const storedUser = sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) this.currentUser = JSON.parse(storedUser);
      } catch (e) {}

      // Ensure local fallback storage is seeded
      this._initLocalStore();
    }

    /**
     * Initialize Local Storage Store
     */
    _initLocalStore() {
      try {
        if (!localStorage.getItem(STORAGE_KEY_LEADS)) {
          localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(SEED_TEST_LEADS));
        }
      } catch (e) {}
    }

    /**
     * Helper to Read Local Store
     */
    _getLocalLeads() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_LEADS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    /**
     * Helper to Write Local Store
     */
    _saveLocalLeads(leads) {
      try {
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
        return true;
      } catch (e) {
        return false;
      }
    }

    /**
     * Check Backend Availability
     */
    async checkBackend() {
      if (this.hasBackend !== null) return this.hasBackend;
      try {
        const res = await fetch(`${this.apiBase}/auth/me`, {
          method: 'GET',
          headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
        });
        // If 200 or 401, a real API server is responding!
        if (res.status === 200 || res.status === 401) {
          this.hasBackend = true;
          return true;
        }
        this.hasBackend = false;
        return false;
      } catch (err) {
        this.hasBackend = false;
        return false;
      }
    }

    /**
     * Authentication: Login
     */
    async login(username, password) {
      const isBackendActive = await this.checkBackend();

      if (isBackendActive) {
        try {
          const res = await fetch(`${this.apiBase}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Authentication failed');
          }

          this.token = data.token;
          this.currentUser = data.user;
          sessionStorage.setItem(STORAGE_KEY_TOKEN, this.token);
          sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
          return { success: true, user: this.currentUser };
        } catch (err) {
          throw err;
        }
      } else {
        // Standalone Client Mode (Development / Offline Preview)
        // Accepts proprietor admin credentials for verification
        if ((username === 'admin' || username === 'kiran') && (password === 'kns2026' || password === 'admin')) {
          this.token = 'kns_demo_tok_' + Date.now();
          this.currentUser = {
            username: username,
            name: 'Kiran Gajbhare',
            role: 'Proprietor',
            email: 'knsconstructions@gmail.com'
          };
          sessionStorage.setItem(STORAGE_KEY_TOKEN, this.token);
          sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
          console.info('[KNS API] Authenticated via Client Demo Mode');
          return { success: true, user: this.currentUser };
        } else {
          throw new Error('Invalid administrative credentials. (Demo: admin / kns2026)');
        }
      }
    }

    /**
     * Authentication: Logout
     */
    async logout() {
      if (this.hasBackend && this.token) {
        try {
          await fetch(`${this.apiBase}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
        } catch (e) {}
      }

      this.token = null;
      this.currentUser = null;
      sessionStorage.removeItem(STORAGE_KEY_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      return { success: true };
    }

    /**
     * Check Active Authentication State
     */
    checkAuth() {
      return {
        isAuthenticated: !!this.token,
        user: this.currentUser,
        isBackendActive: this.hasBackend === true
      };
    }

    /**
     * Get Current User
     */
    getCurrentUser() {
      return this.currentUser;
    }

    /**
     * Retrieve Leads List (with search, filter, and sorting)
     */
    async getLeads(options = {}) {
      const { search = '', status = 'all', sort = 'newest' } = options;
      const isBackendActive = await this.checkBackend();

      if (isBackendActive && this.token) {
        try {
          const params = new URLSearchParams();
          if (search) params.append('search', search);
          if (status && status !== 'all') params.append('status', status);
          if (sort) params.append('sort', sort);

          const res = await fetch(`${this.apiBase}/leads?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          if (res.status === 401) {
            this.logout();
            throw new Error('Session expired. Please log in again.');
          }
          const data = await res.json();
          return data;
        } catch (err) {
          console.warn('[KNS API] REST endpoint error, using local fallback:', err.message);
        }
      }

      // Standalone Fallback Processing
      let leads = this._getLocalLeads();
      const stats = this._computeStats(leads);

      // Search Filter
      const q = search.trim().toLowerCase();
      if (q) {
        leads = leads.filter(l =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.phone && l.phone.includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.projectType && l.projectType.toLowerCase().includes(q)) ||
          (l.service && l.service.toLowerCase().includes(q)) ||
          (l.location && l.location.toLowerCase().includes(q)) ||
          (l.id && l.id.toLowerCase().includes(q))
        );
      }

      // Status Filter
      if (status && status.toLowerCase() !== 'all') {
        leads = leads.filter(l => (l.status || '').toLowerCase() === status.toLowerCase());
      }

      // Sort
      if (sort === 'oldest') {
        leads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sort === 'updated') {
        leads.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      } else {
        leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return {
        success: true,
        count: leads.length,
        stats,
        leads
      };
    }

    /**
     * Retrieve Single Lead by ID
     */
    async getLead(id) {
      const isBackendActive = await this.checkBackend();
      if (isBackendActive && this.token) {
        try {
          const res = await fetch(`${this.apiBase}/leads/${encodeURIComponent(id)}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          const data = await res.json();
          if (res.ok) return data.lead;
        } catch (e) {}
      }

      const leads = this._getLocalLeads();
      const lead = leads.find(l => l.id.toLowerCase() === id.toLowerCase());
      if (!lead) throw new Error('Lead not found');
      return lead;
    }

    /**
     * Create New Lead Inquiry
     */
    async createLead(leadData) {
      const isBackendActive = await this.checkBackend();

      if (isBackendActive) {
        try {
          const res = await fetch(`${this.apiBase}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadData)
          });
          const data = await res.json();
          if (res.ok && data.success) {
            // Also sync local cache
            const leads = this._getLocalLeads();
            leads.unshift(data.lead);
            this._saveLocalLeads(leads);
            return data.lead;
          }
        } catch (e) {
          console.warn('[KNS API] Failed to submit to REST API, storing locally:', e);
        }
      }

      // Standalone Fallback Creation
      const leads = this._getLocalLeads();
      const nextId = 'KNS-L-' + Math.floor(1000 + Math.random() * 9000);
      const newLead = {
        id: nextId,
        name: (leadData.name || '').trim() || 'Prospective Client',
        phone: (leadData.phone || '').trim(),
        email: (leadData.email || '').trim(),
        service: (leadData.service || leadData.projectType || 'Turnkey Construction').trim(),
        projectType: (leadData.projectType || 'General Inquiry').trim(),
        location: (leadData.location || 'Kondapur, Hyderabad').trim(),
        plotSize: (leadData.plotSize || '').trim(),
        constructionArea: (leadData.constructionArea || '').trim(),
        budget: (leadData.budget || '').trim(),
        message: (leadData.message || '').trim(),
        source: leadData.source || 'Website Consultation Form',
        status: 'New',
        notes: [
          {
            id: 'n_' + Date.now(),
            text: 'Inquiry registered through website consultation form.',
            author: 'System',
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      leads.unshift(newLead);
      this._saveLocalLeads(leads);
      return newLead;
    }

    /**
     * Update Lead Status
     */
    async updateLeadStatus(id, newStatus) {
      const isBackendActive = await this.checkBackend();
      if (isBackendActive && this.token) {
        try {
          const res = await fetch(`${this.apiBase}/leads/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          const data = await res.json();
          if (res.ok && data.success) return data.lead;
        } catch (e) {}
      }

      // Standalone Fallback Update
      const leads = this._getLocalLeads();
      const idx = leads.findIndex(l => l.id.toLowerCase() === id.toLowerCase());
      if (idx === -1) throw new Error('Lead not found');

      const oldStatus = leads[idx].status;
      leads[idx].status = newStatus;
      if (!Array.isArray(leads[idx].notes)) leads[idx].notes = [];
      leads[idx].notes.push({
        id: 'n_' + Date.now(),
        text: `Status updated from "${oldStatus}" to "${newStatus}".`,
        author: this.currentUser?.name || 'Kiran Gajbhare',
        createdAt: new Date().toISOString()
      });
      leads[idx].updatedAt = new Date().toISOString();
      this._saveLocalLeads(leads);
      return leads[idx];
    }

    /**
     * Add Note to Lead
     */
    async addLeadNote(id, noteText) {
      if (!noteText || !noteText.trim()) return;
      const isBackendActive = await this.checkBackend();

      if (isBackendActive && this.token) {
        try {
          const res = await fetch(`${this.apiBase}/leads/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ addNote: noteText.trim() })
          });
          const data = await res.json();
          if (res.ok && data.success) return data.lead;
        } catch (e) {}
      }

      // Standalone Fallback
      const leads = this._getLocalLeads();
      const idx = leads.findIndex(l => l.id.toLowerCase() === id.toLowerCase());
      if (idx === -1) throw new Error('Lead not found');

      if (!Array.isArray(leads[idx].notes)) leads[idx].notes = [];
      leads[idx].notes.push({
        id: 'n_' + Date.now(),
        text: noteText.trim(),
        author: this.currentUser?.name || 'Kiran Gajbhare',
        createdAt: new Date().toISOString()
      });
      leads[idx].updatedAt = new Date().toISOString();
      this._saveLocalLeads(leads);
      return leads[idx];
    }

    /**
     * Delete Lead
     */
    async deleteLead(id) {
      const isBackendActive = await this.checkBackend();
      if (isBackendActive && this.token) {
        try {
          const res = await fetch(`${this.apiBase}/leads/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.token}` }
          });
          const data = await res.json();
          if (res.ok) return true;
        } catch (e) {}
      }

      // Standalone Fallback
      let leads = this._getLocalLeads();
      leads = leads.filter(l => l.id.toLowerCase() !== id.toLowerCase());
      this._saveLocalLeads(leads);
      return true;
    }

    /**
     * Export Leads to CSV Format
     */
    exportLeadsCsv(leadsToExport) {
      const leads = leadsToExport || this._getLocalLeads();
      if (!leads || leads.length === 0) {
        alert('No leads available to export.');
        return;
      }

      const headers = [
        'Lead ID',
        'Client Name',
        'Phone Number',
        'Email Address',
        'Service Requested',
        'Project Type',
        'Status',
        'Lead Source',
        'Created Date',
        'Notes Count',
        'Latest Note'
      ];

      const csvRows = [headers.join(',')];

      leads.forEach(l => {
        const latestNote = Array.isArray(l.notes) && l.notes.length > 0 ? l.notes[l.notes.length - 1].text : '';
        const row = [
          `"${(l.id || '').replace(/"/g, '""')}"`,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.service || '').replace(/"/g, '""')}"`,
          `"${(l.projectType || '').replace(/"/g, '""')}"`,
          `"${(l.status || '').replace(/"/g, '""')}"`,
          `"${(l.source || '').replace(/"/g, '""')}"`,
          `"${new Date(l.createdAt).toLocaleDateString('en-IN')}"`,
          `"${Array.isArray(l.notes) ? l.notes.length : 0}"`,
          `"${latestNote.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\r\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `kns_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    /**
     * Compute KPI Statistics
     */
    _computeStats(leads) {
      const stats = {
        total: leads.length,
        new: 0,
        contacted: 0,
        inProgress: 0,
        converted: 0,
        closed: 0
      };

      leads.forEach(l => {
        const s = (l.status || '').toLowerCase().trim();
        if (s === 'new') stats.new++;
        else if (s === 'contacted') stats.contacted++;
        else if (s === 'in progress' || s === 'inprogress') stats.inProgress++;
        else if (s === 'converted') stats.converted++;
        else if (s === 'closed') stats.closed++;
      });

      return stats;
    }

    /**
     * Reset to Development Seed Test Data
     */
    resetToTestData() {
      this._saveLocalLeads(SEED_TEST_LEADS);
    }

    /**
     * Clear All Leads (For testing empty states)
     */
    clearAllLeads() {
      this._saveLocalLeads([]);
    }
  }

  // Export singleton instance to window
  window.knsApi = new KnsApiClient();

})(window);
