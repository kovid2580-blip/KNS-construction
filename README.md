# KNS Construction & Real Estate

Official production website repository for **KNS Construction & Real Estate** &mdash; Kondapur, Hyderabad, Telangana.  
*Positioning:* **"BUILDING YOUR FUTURE WITH PRECISION & QUALITY"**  
*Tagline:* **"BUILDING DREAMS, BRICK BY BRICK"**



## 🚀 Running Locally & Production Deployment

### Option 1: Running with Full REST API Server (Recommended)
```bash
# Starts Node.js REST server on port 8080 (serves static assets + /api/leads)
node server/server.js

# Or using npm
npm start
```
* **Public Website:** `http://localhost:8080`
* **Admin Portal:** `http://localhost:8080/admin.html`
* **Default Admin Credentials (Development):** Username: `admin` | Password: `kns2026`

### Option 2: Running with Static Preview Server
```bash
# Python static server
python -m http.server 8080
```
*The client API (`js/api.js`) automatically operates in Standalone Client Preview Mode with local data persistence when a backend is not detected.*

### Production Hosting Checklist
1. **Host:** Deploy directly to any Node.js host (Render, Railway, AWS EC2, DigitalOcean) or serverless static host (Cloudflare Pages, Vercel, Netlify).
2. **Environment Variables:**
   * `PORT` (e.g. `8080`)
   * `KNS_ADMIN_USER` (Production admin username)
   * `KNS_ADMIN_PASSWORD` (Production admin secure password hash / string)
3. **Database Upgrade:** In high-volume production, replace the atomic file storage in `server.js` with PostgreSQL, MongoDB, or MySQL by swapping the `readLeads()` and `writeLeads()` helper methods.
4. **SSL Certificate:** Enforce HTTPS everywhere in production.
