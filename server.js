/**
 * ============================================================================
 * KNS CONSTRUCTION & REAL ESTATE - REST API & STATIC ASSET SERVER
 * Phase 4 - Step 8: Admin & Lead Management Production Backend Architecture
 * ============================================================================
 * Zero external npm dependencies required - built with native Node.js standard
 * modules (http, fs, path, url, crypto) for universal, zero-friction execution.
 *
 * REST API Endpoints:
 *   POST   /api/auth/login        - Authenticates admin and generates session token
 *   POST   /api/auth/logout       - Invalidates session token
 *   GET    /api/auth/me           - Returns authenticated administrator identity
 *   GET    /api/leads             - Retrieves leads with search, filter, and sort
 *   POST   /api/leads             - Creates a new consultation lead inquiry
 *   GET    /api/leads/:id         - Retrieves a single lead record with notes history
 *   PATCH  /api/leads/:id         - Updates lead details, status, or appends notes
 *   DELETE /api/leads/:id         - Deletes a lead inquiry record
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure leads.json exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
}

// In-Memory Active Sessions Store (Token -> Session Info)
const activeSessions = new Map();

// Default admin configuration (override via environment variables in production)
const ADMIN_CONFIG = {
  username: process.env.KNS_ADMIN_USER || 'admin',
  password: process.env.KNS_ADMIN_PASSWORD || 'kns2026',
  name: 'Kiran Gajbhare',
  role: 'Proprietor',
  email: 'knsconstructions@gmail.com'
};

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8'
};

/**
 * Read Leads from JSON File
 */
function readLeads() {
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[KNS API] Error reading leads file:', err);
    return [];
  }
}

/**
 * Write Leads to JSON File (Atomic Write)
 */
function writeLeads(leads) {
  try {
    const tempFile = LEADS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(leads, null, 2), 'utf8');
    fs.renameSync(tempFile, LEADS_FILE);
    return true;
  } catch (err) {
    console.error('[KNS API] Error writing leads file:', err);
    return false;
  }
}

/**
 * Compute Lead KPI Statistics
 */
function computeLeadStats(leads) {
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
 * Verify Request Authorization Token
 */
function verifyAuth(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  // Check expiration (24 hours)
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Sanitize String Input (XSS Prevention)
 */
function sanitize(val) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

/**
 * Helper to Send JSON Response
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  });
  res.end(JSON.stringify(data));
}

/**
 * Helper to Parse Request Body
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Guard against payloads larger than 1MB
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Main HTTP Request Handler
 */
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;

  // Handle CORS Pre-flight Options
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================================================
  // REST API ROUTER (/api/...)
  // ==========================================================================
  if (pathname.startsWith('/api/')) {

    // --- AUTHENTICATION: POST /api/auth/login ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { username, password } = body;

        if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
          const token = 'kns_tok_' + crypto.randomBytes(24).toString('hex');
          const session = {
            token,
            username: ADMIN_CONFIG.username,
            name: ADMIN_CONFIG.name,
            role: ADMIN_CONFIG.role,
            email: ADMIN_CONFIG.email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
          };
          activeSessions.set(token, session);

          return sendJson(res, 200, {
            success: true,
            message: 'Authentication successful',
            token,
            user: {
              username: session.username,
              name: session.name,
              role: session.role,
              email: session.email
            }
          });
        } else {
          return sendJson(res, 401, {
            success: false,
            message: 'Invalid administrative credentials'
          });
        }
      } catch (err) {
        return sendJson(res, 400, { success: false, message: err.message });
      }
    }

    // --- AUTHENTICATION: POST /api/auth/logout ---
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) activeSessions.delete(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully' });
    }

    // --- AUTHENTICATION: GET /api/auth/me ---
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const session = verifyAuth(req);
      if (!session) {
        return sendJson(res, 401, { success: false, message: 'Unauthorized session' });
      }
      return sendJson(res, 200, {
        success: true,
        user: {
          username: session.username,
          name: session.name,
          role: session.role,
          email: session.email
        }
      });
    }

    // --- LEADS: GET /api/leads (Retrieve list with filtering & sorting) ---
    if (pathname === '/api/leads' && req.method === 'GET') {
      const session = verifyAuth(req);
      if (!session) {
        return sendJson(res, 401, { success: false, message: 'Unauthorized: Admin authentication required' });
      }

      let leads = readLeads();
      const stats = computeLeadStats(leads);

      const search = (reqUrl.searchParams.get('search') || '').toLowerCase().trim();
      const statusFilter = (reqUrl.searchParams.get('status') || '').trim();
      const sortBy = (reqUrl.searchParams.get('sort') || 'newest');

      // Filter by search
      if (search) {
        leads = leads.filter(l =>
          (l.name && l.name.toLowerCase().includes(search)) ||
          (l.phone && l.phone.includes(search)) ||
          (l.email && l.email.toLowerCase().includes(search)) ||
          (l.projectType && l.projectType.toLowerCase().includes(search)) ||
          (l.service && l.service.toLowerCase().includes(search)) ||
          (l.location && l.location.toLowerCase().includes(search)) ||
          (l.id && l.id.toLowerCase().includes(search))
        );
      }

      // Filter by status
      if (statusFilter && statusFilter.toLowerCase() !== 'all') {
        leads = leads.filter(l => (l.status || '').toLowerCase() === statusFilter.toLowerCase());
      }

      // Sort
      if (sortBy === 'oldest') {
        leads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortBy === 'updated') {
        leads.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      } else {
        // Default newest first
        leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return sendJson(res, 200, {
        success: true,
        count: leads.length,
        stats,
        leads
      });
    }

    // --- LEADS: POST /api/leads (Create new inquiry lead) ---
    if (pathname === '/api/leads' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);

        // Validation
        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();
        const email = (body.email || '').trim();

        if (name.length < 2) {
          return sendJson(res, 400, { success: false, message: 'Name must be at least 2 characters' });
        }
        if (phone.replace(/\D/g, '').length < 10) {
          return sendJson(res, 400, { success: false, message: 'Phone must contain at least 10 digits' });
        }

        const leads = readLeads();
        const nextNum = 1000 + leads.length + 1;
        const newLead = {
          id: 'KNS-L-' + nextNum,
          name: sanitize(name),
          phone: sanitize(phone),
          email: sanitize(email),
          service: sanitize(body.service || body.projectType || 'Turnkey Construction'),
          projectType: sanitize(body.projectType || 'General Inquiry'),
          location: sanitize(body.location || 'Kondapur, Hyderabad'),
          plotSize: sanitize(body.plotSize || ''),
          constructionArea: sanitize(body.constructionArea || ''),
          budget: sanitize(body.budget || ''),
          message: sanitize(body.message || ''),
          source: sanitize(body.source || 'Website Consultation Form'),
          status: 'New',
          notes: [
            {
              id: 'n_' + Date.now(),
              text: 'Inquiry received via website consultation form.',
              author: 'System',
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        leads.unshift(newLead);
        writeLeads(leads);

        console.log(`[KNS API] New lead created: ${newLead.id} (${newLead.name} - ${newLead.phone})`);
        return sendJson(res, 201, {
          success: true,
          message: 'Inquiry successfully registered',
          lead: newLead
        });
      } catch (err) {
        return sendJson(res, 400, { success: false, message: err.message });
      }
    }

    // --- LEADS: GET /api/leads/:id (Retrieve single lead) ---
    const leadIdMatch = pathname.match(/^\/api\/leads\/([a-zA-Z0-9_-]+)$/);
    if (leadIdMatch) {
      const targetId = leadIdMatch[1];
      const session = verifyAuth(req);
      if (!session) {
        return sendJson(res, 401, { success: false, message: 'Unauthorized: Admin authentication required' });
      }

      const leads = readLeads();
      const leadIndex = leads.findIndex(l => l.id.toLowerCase() === targetId.toLowerCase());

      if (req.method === 'GET') {
        if (leadIndex === -1) {
          return sendJson(res, 404, { success: false, message: 'Lead not found' });
        }
        return sendJson(res, 200, { success: true, lead: leads[leadIndex] });
      }

      // --- LEADS: PATCH /api/leads/:id (Update lead status or add notes) ---
      if (req.method === 'PATCH') {
        if (leadIndex === -1) {
          return sendJson(res, 404, { success: false, message: 'Lead not found' });
        }
        try {
          const body = await parseJsonBody(req);
          const currentLead = leads[leadIndex];

          // Status update
          if (body.status) {
            const validStatuses = ['New', 'Contacted', 'In Progress', 'Converted', 'Closed'];
            const formattedStatus = validStatuses.find(s => s.toLowerCase() === body.status.toLowerCase());
            if (formattedStatus && formattedStatus !== currentLead.status) {
              const oldStatus = currentLead.status;
              currentLead.status = formattedStatus;
              if (!Array.isArray(currentLead.notes)) currentLead.notes = [];
              currentLead.notes.push({
                id: 'n_' + Date.now(),
                text: `Status updated from "${oldStatus}" to "${formattedStatus}".`,
                author: session.name || 'Admin',
                createdAt: new Date().toISOString()
              });
            }
          }

          // Add note
          if (body.addNote && typeof body.addNote === 'string' && body.addNote.trim()) {
            if (!Array.isArray(currentLead.notes)) currentLead.notes = [];
            currentLead.notes.push({
              id: 'n_' + Date.now(),
              text: sanitize(body.addNote),
              author: session.name || 'Kiran Gajbhare',
              createdAt: new Date().toISOString()
            });
          }

          // Update other editable fields
          if (body.name) currentLead.name = sanitize(body.name);
          if (body.phone) currentLead.phone = sanitize(body.phone);
          if (body.email) currentLead.email = sanitize(body.email);
          if (body.service) currentLead.service = sanitize(body.service);
          if (body.projectType) currentLead.projectType = sanitize(body.projectType);
          if (body.location) currentLead.location = sanitize(body.location);
          if (body.budget) currentLead.budget = sanitize(body.budget);

          currentLead.updatedAt = new Date().toISOString();
          leads[leadIndex] = currentLead;
          writeLeads(leads);

          return sendJson(res, 200, { success: true, lead: currentLead });
        } catch (err) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      // --- LEADS: DELETE /api/leads/:id (Delete lead record) ---
      if (req.method === 'DELETE') {
        if (leadIndex === -1) {
          return sendJson(res, 404, { success: false, message: 'Lead not found' });
        }
        const removed = leads.splice(leadIndex, 1)[0];
        writeLeads(leads);
        console.log(`[KNS API] Lead deleted: ${removed.id}`);
        return sendJson(res, 200, { success: true, message: `Lead ${targetId} deleted successfully` });
      }
    }

    // Unmatched API endpoint
    return sendJson(res, 404, { success: false, message: 'API endpoint not found' });
  }

  // ==========================================================================
  // STATIC ASSET SERVER
  // ==========================================================================
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve custom 404.html
      const notFoundPath = path.join(ROOT_DIR, '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        if (!err404) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(data404);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Set cache control
    const headers = { 'Content-Type': contentType };
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
      headers['Cache-Control'] = 'public, max-age=86400';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🏛️  KNS CONSTRUCTION & REAL ESTATE - PRODUCTION REST SERVER`);
  console.log(`🚀  Local Server Running: http://localhost:${PORT}`);
  console.log(`📊  Admin Portal:         http://localhost:${PORT}/admin.html`);
  console.log(`🔌  REST API Root:        http://localhost:${PORT}/api/leads`);
  console.log(`📁  Database Storage:     ${LEADS_FILE}`);
  console.log('================================================================');
});

module.exports = server;
