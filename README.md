# KNS Construction & Real Estate

Official production website repository for **KNS Construction & Real Estate** &mdash; Kondapur, Hyderabad, Telangana.  
*Positioning:* **"BUILDING YOUR FUTURE WITH PRECISION & QUALITY"**  
*Tagline:* **"BUILDING DREAMS, BRICK BY BRICK"**

---

## 🏛️ Official Brand Identity Standards

The supplied official logo is the definitive source of truth across all brand collateral and digital platforms.

### Core Brand Elements
* **Typography:** Bold beveled golden serif lettering for "KNS" with navy outline and metallic relief.
* **Crane Graphic:** Tower crane with lattice mast, counterweight boom, trolley, and hook assembly.
* **Building Graphic:** Stepped gold architectural brick block integrated at the base.
* **Taglines:** *"CONSTRUCTION AND REAL ESTATE"* & *"BUILDING DREAMS, BRICK BY BRICK"*.
* **Official Visual Environment:** Architectural Silver (`#D9D9D6`, `#E8E8E5`) backdrop, Charcoal (`#202124`, `#17191B`) and Midnight Navy (`#111923`) contrast, with KNS Gold (`#C49A3A`, `#E4C76A`) architectural accents.

### Brand Assets in Repository
* `assets/images/kns-logo-full.png` &mdash; Full official emblem with transparent background (used in footer and brand showcase).
* `assets/images/kns-logo-compact.png` &mdash; Compact horizontal lockup with transparent background and 3D navigation styling.
* `assets/images/kns-crane-mark.png` &mdash; Recognizable architectural crane mark (used for favicons & app badges).
* `assets/images/kns-villa-master-plan.png` &mdash; Lossless 1536&times;1024 master plan extracted from the concept PDF for Sangareddy (8.25 Acres, 100 Villa Plots).
* `favicon.ico`, `assets/images/favicon-32.png`, `assets/images/apple-touch-icon.png` &mdash; Multi-resolution browser favicons.

---

## 🌐 13-Page Complete Architecture

1. **`index.html`** &mdash; Flagship homepage featuring Hero, KNS at a Glance (8.25 Acres, 100 Plots, 250 Sq. Yds, 40 FT Roads), Founder Profile (Kiran Gajbhare, Kondapur), 12 Core Services, Turnkey Construction, Pricing Packages, Construction Cost Estimator, Featured Projects, Sangareddy Villa Master Plan, Why KNS (5 core principles), 7-Stage Process, Project Gallery, Contact Consultation Form, and Floating WhatsApp.
2. **`about.html`** &mdash; Heritage, proprietor details, Kondapur office, and full turnkey scope.
3. **`services.html`** &mdash; In-depth breakdown of all 12 core services across Architectural Planning, Structural Design, Civil Construction, Turnkey Execution, MEP, Finishes, and Real Estate.
4. **`turnkey-construction.html`** &mdash; Dedicated deep-dive into the 7-stage turnkey journey (Consultation, Architectural Blueprint, Structural Engineering, Excavation & RCC, Masonry & MEP, Finishing, Handover).
5. **`projects.html`** &mdash; Portfolio overview of our three featured developments with key architectural metrics and filterable categories.
6. **`project-gplus1-duplex.html`** &mdash; Dedicated project case study: G+1 Duplex House in Raghavendra Colony, Kondapur (Approx. 2,800–3,200 SFT on 200 Sq. Yards).
7. **`project-premium-3bhk.html`** &mdash; Dedicated project case study: Premium 3BHK Residential Units in Raghavendra Colony, Kondapur (1,650 SFT / Unit on 600 Sq. Yards).
8. **`project-kns-villa-community.html`** &mdash; Flagship community page: 8.25-Acre Gated Villa Community in Ganapatipadu, Pocham Village, Patancheru Mandal, Sangareddy District with interactive master plan viewer.
9. **`real-estate.html`** &mdash; Plotted villa communities, independent houses, apartments, and commercial property developments.
10. **`gallery.html`** &mdash; Masonry architectural showcase with category filter pills (ALL, PROJECTS, ARCHITECTURE, CONSTRUCTION, INTERIORS, EXTERIORS, VILLAS) and fullscreen accessible lightbox viewer.
11. **`contact.html`** &mdash; Consultation booking form, office address in Raghavendra Colony, direct phone lines, visiting hours, and AEO/GEO FAQ answering 11 key customer inquiries.
12. **`admin.html`** &mdash; Internal operations dashboard prototype with 6 KPI metrics, interactive 100-plot villa inventory table with status toggle and persistence, inbound leads inquiry log, and live site milestones. Protected by `noindex, nofollow`.
13. **`404.html`** &mdash; Custom branded 404 page with navigation links back to the website. Protected by `noindex, nofollow`.

---

## 🏢 Business & Contact Details

* **Proprietor:** Kiran Gajbhare
* **Registered Office:** Raghavendra Colony, Kondapur, Hyderabad &ndash; 500084, Telangana, India
* **Direct Helpline / WhatsApp:** +91 91004 25645, +91 92465 63397
* **Official Email:** knsconstructions@gmail.com
* **Verified Construction Pricing:**
  * Standard Residential: ₹1,600 &ndash; ₹1,800 / SFT
  * Premium Residential: ₹1,900 &ndash; ₹2,200 / SFT
  * Commercial Construction: ₹2,200 &ndash; ₹2,500 / SFT
  * *Disclaimer:* Indicative only. Final cost varies by design, location, specifications and client requirements.

---

## ⚙️ Phase 3 Enhancements: Technical QA, SEO & Production Readiness

### 1. Technical QA & Accessibility (WCAG 2.1 AA)
* **0 Broken Links & 0 Duplicate IDs:** Validated with automated test scripts across all 13 pages.
* **Semantic HTML:** Strict heading hierarchy (`h1` &rarr; `h2` &rarr; `h3`), descriptive image `alt` tags, and accessible ARIA attributes.
* **Keyboard Navigation & Focus Management:** Visible gold focus rings, Escape/Arrow navigation for lightbox, focus trapping and restoration on modal close.
* **Form UX & Validation:** Client-side input validation (Name &ge; 2 chars, Phone &ge; 10 digits, regex Email, required Project Type) with inline visual error feedback (no intrusive native alerts).

### 2. SEO, Meta Tags & Crawling Standards
* **Unique Titles & Meta Descriptions:** Tailored for all pages to maximize organic CTR.
* **Social Sharing:** Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) and Twitter card tags implemented everywhere.
* **Canonical URLs:** Standardized canonical tags preventing search duplicate content penalties.
* **Sitemap & Robots:**
  * `sitemap.xml` lists all 11 public production pages with clean priorities.
  * `robots.txt` allows public pages and explicitly disallows `/admin.html` and `/404.html`.
  * `admin.html` and `404.html` include `<meta name="robots" content="noindex, nofollow">`.

### 3. Structured Data (JSON-LD)
Factually supported schemas with 0 fake ratings, reviews, or awards:
* `index.html`: `GeneralContractor` + `WebSite`
* `about.html`: `AboutPage` + `BreadcrumbList`
* `services.html` & `turnkey-construction.html`: `Service` + `BreadcrumbList`
* `projects.html`: `CollectionPage` + `BreadcrumbList`
* `project-gplus1-duplex.html`: `SingleFamilyResidence` + `BreadcrumbList`
* `project-premium-3bhk.html`: `ApartmentComplex` + `BreadcrumbList`
* `project-kns-villa-community.html`: `Place` (with 10 verified amenities) + `BreadcrumbList`
* `real-estate.html`: `Service` + `BreadcrumbList`
* `gallery.html`: `ImageGallery` + `BreadcrumbList`
* `contact.html`: `ContactPage` + `FAQPage` + `BreadcrumbList`

### 4. AEO & GEO (Answer Engine Optimization)
Dedicated factual FAQ section in `contact.html` and on-page copy directly answers the 11 key inquiries search AI and users seek:
1. What construction services KNS provides.
2. What turnkey construction means.
3. Verified construction rates (Standard, Premium, Commercial).
4. Service regions (Kondapur, Patancheru, Sangareddy, Hyderabad West).
5. G+1 duplex project specifics (200 Sq. Yds, 2,800–3,200 SFT).
6. Premium 3BHK project specifics (600 Sq. Yds, 10 units, 1,650 SFT each).
7. KNS Villa Community layout (8.25 Acres, 100 plots).
8. Plot dimensions (250 Sq. Yds, 30&times;75 ft).
9. All 10 verified amenities.
10. Contract and milestone payment structure.
11. Direct contact channels (Kondapur office, phone, WhatsApp, email).

### 5. Conversion & Analytics Integration
The universal event dispatcher `window.trackKnsEvent(eventName, params)` fires hooks for:
* `consultation_form_start` &mdash; First user interaction with inquiry form.
* `consultation_form_submit` &mdash; Valid inquiry submission with project details.
* `whatsapp_click` &mdash; Clicks on floating or inline WhatsApp buttons.
* `phone_click` &mdash; Clicks on direct telephone links.
* `email_click` &mdash; Clicks on direct email mailto links.
* `project_view` &mdash; Project page and card clicks.
* `estimator_used` &mdash; Cost estimator slider adjustment or package switch.
* `gallery_open` &mdash; Lightbox image viewer triggers.
* `master_plan_interaction` &mdash; Zoom, pan, reset, or plot selection events.

*Compatible with:* Custom DOM event listeners (`kns_analytics`), Google Tag Manager (`window.dataLayer`), and Google Analytics 4 (`window.gtag`).

---

## 🔌 Connecting to a Production Form Backend

To connect the consultation form (`#knsContactForm` and `#contactForm`) to a live email service or CRM:

### Option A: Using Formspree / Web3Forms
Update the `<form>` element in `index.html` and `contact.html`:
```html
<form id="knsContactForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Option B: Using Custom REST API / AWS Lambda
In `js/main.js`, locate the `leadPayload` block in `setupFormValidationAndTracking()` and replace the simulation timer with:
```javascript
fetch('https://api.yourdomain.com/v1/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadPayload)
})
.then(response => response.json())
.then(data => {
  // Show success feedback
})
.catch(err => {
  // Show error feedback
});
```

---

## 🚀 Running Locally & Production Deployment

### Running Locally
```bash
# Python
python -m http.server 8080

# Or Node.js
npx serve .
```
Visit `http://localhost:8080` in your web browser.

### Production Hosting Checklist
1. **Host:** Deploy directly to any static host (Cloudflare Pages, Vercel, Netlify, AWS S3 + CloudFront, or GitHub Pages).
2. **Custom Domain:** Point your domain DNS (e.g. `knsconstruction.com`) to your hosting provider's CNAME / A records.
3. **SSL Certificate:** Enable HTTPS everywhere (enforced automatically on modern static hosts).
4. **Form Integration:** Set up the backend form action or API endpoint (Option A or B above).
5. **Analytics:** If using GA4 or GTM, add your measurement ID script tag into `<head>`.
6. **Internal Admin Protection:** Protect `/admin.html` with basic authentication or hosting-level firewall rules before deploying to a public domain.
