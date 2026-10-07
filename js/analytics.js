/**
 * ============================================================================
 * KNS CONSTRUCTION & REAL ESTATE - ANALYTICS & CONVERSION TRACKING ENGINE
 * Phase 4 - Step 9: GA4, Event Funnel, CTA, UTM Attribution & Privacy
 * ============================================================================
 * Privacy-Conscious Architecture:
 * - Configurable GA_MEASUREMENT_ID (Zero network calls if unconfigured)
 * - Automatic PII stripping (No names, phones, emails, addresses, messages)
 * - UTM Parameter Capture & Lead Attribution
 * - Non-intrusive Event Deduplication (600ms debounce protection)
 * - Fully compatible with Google Tag Manager / GA4 dataLayer
 * ============================================================================
 */

(function (window) {
  'use strict';

  // Global Analytics Configuration Object
  window.KNS_ANALYTICS_CONFIG = window.KNS_ANALYTICS_CONFIG || {
    // ------------------------------------------------------------------------
    // CONFIGURE GOOGLE ANALYTICS 4 MEASUREMENT ID HERE
    // Example: 'G-XXXXXXXXXX'
    // Leave empty to keep GA4 disabled in development/staging.
    // ------------------------------------------------------------------------
    GA_MEASUREMENT_ID: '',

    // Toggle debug logs in browser console (Default: false)
    DEBUG_MODE: false
  };

  const STORAGE_KEY_UTM = 'kns_utm_attribution';
  const RECENT_EVENTS_CACHE = new Map();
  const DEDUPE_WINDOW_MS = 600;

  class KnsAnalyticsEngine {
    constructor() {
      this.config = window.KNS_ANALYTICS_CONFIG;
      this.isInitialized = false;
      this.galleryViewCounter = 0;

      // 1. Capture UTM attribution immediately on load
      this._captureUtmParameters();

      // 2. Initialize GA4 if measurement ID is supplied
      this._initGa4();

      // 3. Setup automatic listeners on DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this._onDomReady());
      } else {
        this._onDomReady();
      }
    }

    /**
     * Parse & Persist UTM Campaign Parameters from Landing URL
     */
    _captureUtmParameters() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        const captured = {};
        let hasUtm = false;

        utmKeys.forEach(key => {
          const val = urlParams.get(key);
          if (val) {
            captured[key] = val.trim();
            hasUtm = true;
          }
        });

        // Store landing referrer if from an external domain
        if (document.referrer && !document.referrer.includes(window.location.hostname)) {
          captured['initial_referrer'] = document.referrer;
          hasUtm = true;
        }

        if (hasUtm) {
          captured['captured_at'] = new Date().toISOString();
          captured['landing_page'] = window.location.pathname;
          sessionStorage.setItem(STORAGE_KEY_UTM, JSON.stringify(captured));
          if (this.config.DEBUG_MODE) {
            console.log('[KNS Analytics] UTM attribution captured:', captured);
          }
        }
      } catch (e) {
        // Safe fallback for restricted storage environments
      }
    }

    /**
     * Retrieve Stored UTM Campaign Attribution
     */
    getUtmAttribution() {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY_UTM);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    }

    /**
     * Initialize Google Analytics 4 (Only if real Measurement ID is configured)
     */
    _initGa4() {
      const measurementId = (this.config.GA_MEASUREMENT_ID || '').trim();

      // Validate Measurement ID format (e.g. G-XXXXXXXXXX)
      if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) {
        if (this.config.DEBUG_MODE) {
          console.info('[KNS Analytics] GA4 integration inactive (No valid GA_MEASUREMENT_ID configured).');
        }
        return;
      }

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
      };

      // Set timestamp
      window.gtag('js', new Date());

      // Configure GA4 Property with privacy settings
      window.gtag('config', measurementId, {
        anonymize_ip: true,
        send_page_view: false // Managed manually for SPA & deduplication safety
      });

      // Inject gtag.js script tag asynchronously
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);

      this.isInitialized = true;
      if (this.config.DEBUG_MODE) {
        console.log(`[KNS Analytics] GA4 initialized with Property ID: ${measurementId}`);
      }
    }

    /**
     * Strict PII Sanitizer: Guarantees zero personal details reach analytics
     */
    _sanitizeParams(params = {}) {
      const sanitized = {};
      const forbiddenKeyPatterns = [
        /name/i,
        /phone/i,
        /email/i,
        /address/i,
        /message/i,
        /note/i,
        /token/i,
        /pass/i,
        /budget/i,
        /secret/i,
        /auth/i
      ];

      for (const [key, value] of Object.entries(params)) {
        // Skip keys containing sensitive words
        const isForbiddenKey = forbiddenKeyPatterns.some(pattern => pattern.test(key));
        if (isForbiddenKey) continue;

        // Skip string values that look like email addresses or phone numbers
        if (typeof value === 'string') {
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) continue; // Email
          if (/^\+?[0-9\s-]{10,}$/.test(value.trim())) continue; // Phone
          sanitized[key] = value.trim();
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitized[key] = value;
        }
      }

      return sanitized;
    }

    /**
     * Deduplication & Dispatch Engine
     */
    trackEvent(eventName, rawParams = {}) {
      if (!eventName) return;

      const sanitizedParams = this._sanitizeParams(rawParams);
      const now = Date.now();

      // Deduplication check: prevent multiple rapid firings of the exact same event
      const eventSignature = `${eventName}_${JSON.stringify(sanitizedParams)}`;
      const lastFired = RECENT_EVENTS_CACHE.get(eventSignature) || 0;

      if (now - lastFired < DEDUPE_WINDOW_MS) {
        if (this.config.DEBUG_MODE) {
          console.warn(`[KNS Analytics] Deduplication guard blocked duplicate event: ${eventName}`);
        }
        return;
      }
      RECENT_EVENTS_CACHE.set(eventSignature, now);

      // Clean old cache entries
      if (RECENT_EVENTS_CACHE.size > 50) {
        for (const [sig, timestamp] of RECENT_EVENTS_CACHE.entries()) {
          if (now - timestamp > 5000) RECENT_EVENTS_CACHE.delete(sig);
        }
      }

      const payload = {
        event: eventName,
        page_path: window.location.pathname,
        page_title: document.title,
        ...sanitizedParams,
        timestamp: new Date().toISOString()
      };

      // 1. Dispatch custom DOM event for custom web tracking
      try {
        window.dispatchEvent(new CustomEvent('kns_analytics', { detail: payload }));
      } catch (e) {}

      // 2. Google Tag Manager / GA4 dataLayer
      if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
        window.dataLayer.push(payload);
      }

      // 3. GA4 gtag call (if initialized)
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, sanitizedParams);
      }

      if (this.config.DEBUG_MODE) {
        console.log(`[KNS Analytics] Event tracked: ${eventName}`, sanitizedParams);
      }
    }

    /**
     * Track Standard Page View
     */
    trackPageView() {
      // Exclude admin dashboard from public pageview analytics
      if (window.location.pathname.includes('admin.html')) return;

      const pageName = this._getCanonicalPageName();
      this.trackEvent('page_view', {
        page_name: pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title
      });
    }

    /**
     * Determine Canonical Page Name
     */
    _getCanonicalPageName() {
      const p = window.location.pathname.toLowerCase();
      if (p.endsWith('/') || p.endsWith('/index.html') || p === '') return 'Homepage';
      if (p.includes('about')) return 'About Us';
      if (p.includes('turnkey')) return 'Turnkey Construction';
      if (p.includes('services')) return 'Services';
      if (p.includes('project-gplus1-duplex')) return 'Project: G+1 Duplex';
      if (p.includes('project-premium-3bhk')) return 'Project: Premium 3BHK';
      if (p.includes('project-kns-villa-community')) return 'Project: KNS Villa Community';
      if (p.includes('projects')) return 'Projects Portfolio';
      if (p.includes('real-estate')) return 'Real Estate';
      if (p.includes('gallery')) return 'Gallery';
      if (p.includes('contact')) return 'Contact Us';
      if (p.includes('404')) return '404 Error Page';
      return 'Other Public Page';
    }

    /**
     * Determine CTA Location from DOM Ancestors
     */
    _getCtaLocation(element) {
      if (!element) return 'content_body';
      if (element.closest('#siteNavbar, .site-navbar, .nav-wrapper-outer')) return 'navbar';
      if (element.closest('.hero-section, .hero-wrapper')) return 'hero';
      if (element.closest('.floating-whatsapp-pill')) return 'floating_pill';
      if (element.closest('.contact-section, .contact-wrapper, #contact, .contact-form-box')) return 'contact_section';
      if (element.closest('.project-detail, .project-card, .villa-metrics-banner')) return 'project_page';
      if (element.closest('.cost-estimator-section, .estimator-card')) return 'estimator_section';
      if (element.closest('footer, .site-footer')) return 'footer';
      return 'content_body';
    }

    /**
     * Setup DOM Event Listeners on DOM Ready
     */
    _onDomReady() {
      // 1. Fire initial page view
      this.trackPageView();

      // 2. Track project view if on a project case study page
      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath.includes('project-gplus1-duplex')) {
        this.trackProjectView('G+1 Duplex');
      } else if (currentPath.includes('project-premium-3bhk')) {
        this.trackProjectView('Premium 3BHK');
      } else if (currentPath.includes('project-kns-villa-community')) {
        this.trackProjectView('KNS Premium Villa Community');
      }

      // 3. Global Click Delegation for CTAs
      document.addEventListener('click', (e) => {
        const targetLink = e.target.closest('a');
        if (!targetLink) return;

        const href = (targetLink.getAttribute('href') || '').trim();
        const ctaLocation = this._getCtaLocation(targetLink);

        // Phone Click
        if (href.startsWith('tel:')) {
          this.trackEvent('phone_click', {
            page: this._getCanonicalPageName(),
            cta_location: ctaLocation
          });
        }

        // WhatsApp Click
        else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
          let context = 'general_inquiry';
          if (href.includes('duplex') || currentPath.includes('duplex')) context = 'gplus1_duplex';
          else if (href.includes('3bhk') || currentPath.includes('3bhk')) context = 'premium_3bhk';
          else if (href.includes('villa') || currentPath.includes('villa')) context = 'villa_community';

          this.trackEvent('whatsapp_click', {
            page: this._getCanonicalPageName(),
            cta_location: ctaLocation,
            context: context
          });
        }

        // Email Click
        else if (href.startsWith('mailto:')) {
          this.trackEvent('email_click', {
            page: this._getCanonicalPageName(),
            cta_location: ctaLocation
          });
        }

        // Project CTA / Consultation button click
        else if (targetLink.classList.contains('btn-primary-architectural') || targetLink.classList.contains('btn-action-view')) {
          const projectContext = targetLink.getAttribute('data-project') || this._getCanonicalPageName();
          this.trackEvent('project_cta_click', {
            page: this._getCanonicalPageName(),
            cta_location: ctaLocation,
            project_name: projectContext
          });
        }
      }, { passive: true });
    }

    // ========================================================================
    // CONVERSION FUNNEL METHODS
    // ========================================================================

    trackFormStart(formName) {
      this.trackEvent('form_start', {
        form_name: formName || 'consultation_form',
        page: this._getCanonicalPageName()
      });
    }

    trackFormSubmit(formName, service, projectType) {
      this.trackEvent('form_submit', {
        form_name: formName || 'consultation_form',
        page: this._getCanonicalPageName(),
        service: service || 'Not specified',
        project_type: projectType || 'General Inquiry'
      });
    }

    trackFormSuccess(formName, service, projectType) {
      this.trackEvent('form_success', {
        form_name: formName || 'consultation_form',
        page: this._getCanonicalPageName(),
        service: service || 'Not specified',
        project_type: projectType || 'General Inquiry'
      });
    }

    trackFormError(formName, failedField) {
      this.trackEvent('form_error', {
        form_name: formName || 'consultation_form',
        failed_field: failedField || 'validation_error',
        page: this._getCanonicalPageName()
      });
    }

    trackLeadGenerated(leadId, service, projectType, source) {
      const utm = this.getUtmAttribution();
      this.trackEvent('lead_generated', {
        lead_id: leadId || 'KNS-LEAD',
        service: service || 'Turnkey Construction',
        project_type: projectType || 'General Inquiry',
        source: source || 'Website Consultation Form',
        utm_source: utm.utm_source || 'direct',
        utm_medium: utm.utm_medium || 'none',
        utm_campaign: utm.utm_campaign || 'none'
      });
    }

    // ========================================================================
    // CONSTRUCTION ESTIMATOR METHODS
    // ========================================================================

    trackEstimatorStart(propertyType) {
      this.trackEvent('estimator_start', {
        property_type: propertyType || 'Standard Residential'
      });
    }

    trackEstimatorCalculate(packageType, areaSft) {
      let areaRange = 'Under 1000 SFT';
      if (areaSft >= 3000) areaRange = '3000+ SFT';
      else if (areaSft >= 2000) areaRange = '2000-3000 SFT';
      else if (areaSft >= 1000) areaRange = '1000-2000 SFT';

      this.trackEvent('estimator_calculate', {
        package_type: packageType,
        area_range: areaRange
      });
    }

    trackEstimatorCtaClick(packageType, areaSft) {
      this.trackEvent('estimator_cta_click', {
        package_type: packageType,
        area_sft_range: areaSft ? `${areaSft} SFT` : 'Unspecified'
      });
    }

    // ========================================================================
    // PROJECT & MASTER PLAN METHODS
    // ========================================================================

    trackProjectView(projectName) {
      this.trackEvent('project_view', {
        project_name: projectName
      });
    }

    trackMasterPlanOpen() {
      this.trackEvent('masterplan_open', {
        project_name: 'KNS Premium Villa Community'
      });
    }

    trackMasterPlanZoom(direction, level) {
      this.trackEvent('masterplan_zoom', {
        zoom_direction: direction, // 'in', 'out', 'reset'
        zoom_level: Math.round(level * 100) / 100
      });
    }

    trackMasterPlanPan() {
      this.trackEvent('masterplan_pan', {
        project_name: 'KNS Premium Villa Community'
      });
    }

    trackPlotInteraction(plotNumber, action = 'select') {
      this.trackEvent('plot_interaction', {
        plot_number: plotNumber ? `Plot #${plotNumber}` : 'General',
        action: action
      });
    }

    trackMasterPlanCtaClick(plotNumber) {
      this.trackEvent('masterplan_cta_click', {
        plot_number: plotNumber ? `Plot #${plotNumber}` : 'General'
      });
    }

    // ========================================================================
    // GALLERY LIGHTBOX METHODS
    // ========================================================================

    trackGalleryOpen(category, imageIndex) {
      this.galleryViewCounter = 1;
      this.trackEvent('gallery_open', {
        category: category || 'all',
        image_index: imageIndex || 0,
        page: this._getCanonicalPageName()
      });
    }

    trackGalleryImageView(category, imageIndex) {
      this.galleryViewCounter++;
      this.trackEvent('gallery_image_view', {
        category: category || 'all',
        image_index: imageIndex || 0
      });
    }

    trackGalleryClose() {
      this.trackEvent('gallery_close', {
        images_viewed: this.galleryViewCounter
      });
      this.galleryViewCounter = 0;
    }
  }

  // Export Singleton Instance
  window.knsAnalytics = new KnsAnalyticsEngine();

  // Backward compatibility alias for existing code
  window.trackKnsEvent = function (eventName, params) {
    window.knsAnalytics.trackEvent(eventName, params);
  };

})(window);
