/* ==========================================================================
   KNS CONSTRUCTION & REAL ESTATE - MASTER PRODUCTION CONTROLLER
   Phase 3: Technical QA, Conversion Tracking, Accessibility & Validation
   ========================================================================== */

/**
 * Universal Analytics & Conversion Event Dispatcher
 * Dispatches to CustomEvent, Google Tag Manager dataLayer, and Google Analytics gtag
 */
window.trackKnsEvent = function(eventName, params = {}) {
  const payload = {
    event: eventName,
    ...params,
    timestamp: new Date().toISOString()
  };

  // 1. Dispatch custom DOM event for custom web tracking integrations
  try {
    window.dispatchEvent(new CustomEvent('kns_analytics', { detail: payload }));
  } catch (e) {
    // Silent catch for legacy browser environments
  }

  // 2. Google Tag Manager / GA4 dataLayer integration point
  if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  // 3. Google Analytics 4 (gtag.js) integration point
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. 3D FLOATING STICKY NAVBAR CONTROLLER (rAF THROTTLED)
  // ==========================================================================
  const navbar = document.getElementById('siteNavbar');
  let isScrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 45) {
          navbar?.classList.add('scrolled');
        } else {
          navbar?.classList.remove('scrolled');
        }
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  // ==========================================================================
  // 2. MOBILE DRAWER NAVIGATION (ACCESSIBLE TOUCH & FOCUS)
  // ==========================================================================
  const mobileToggle = document.getElementById('mobileToggleBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileDrawerOverlay');
  const mobileClose = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileClose?.focus();
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    mobileToggle?.focus();
  };

  mobileToggle?.addEventListener('click', openDrawer);
  mobileClose?.addEventListener('click', closeDrawer);
  mobileOverlay?.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // Close drawer on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ==========================================================================
  // 3. HERO SECTION SUBTLE ARCHITECTURAL 3D MOUSE PARALLAX
  // ==========================================================================
  const heroSection = document.querySelector('.hero-section');
  const heroLines = document.querySelector('.hero-architectural-lines');
  if (heroSection && heroLines && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let heroTicking = false;
    heroSection.addEventListener('mousemove', (e) => {
      if (!heroTicking) {
        window.requestAnimationFrame(() => {
          const rect = heroSection.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          heroLines.style.transform = `translate(${relX * 10}px, ${relY * 10}px)`;
          heroTicking = false;
        });
        heroTicking = true;
      }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      heroLines.style.transform = 'translate(0px, 0px)';
      heroLines.style.transition = 'transform 0.4s ease';
      setTimeout(() => {
        heroLines.style.transition = '';
      }, 400);
    });
  }

  // ==========================================================================
  // 4. INTERACTIVE COST ESTIMATOR (VERIFIED KNS PRICING TIERS)
  // ==========================================================================
  const areaSlider = document.getElementById('estimatorAreaSlider');
  const areaValueDisplay = document.getElementById('estimatorAreaVal');
  const typeButtons = document.querySelectorAll('.type-btn');
  const lowEstimateDisplay = document.getElementById('lowEstimateDisplay');
  const highEstimateDisplay = document.getElementById('highEstimateDisplay');
  const formulaLabel = document.getElementById('formulaLabel');

  // Exact verified KNS pricing packages
  const packageRates = {
    standard: { low: 1600, high: 1800, title: 'Standard Residential' },
    premium: { low: 1900, high: 2200, title: 'Premium Residential' },
    commercial: { low: 2200, high: 2500, title: 'Commercial Construction' }
  };

  let currentPackage = 'standard';
  let estimatorTrackDebounce = null;

  function formatIndianCurrency(amount) {
    if (isNaN(amount) || amount <= 0) return '₹ 0';
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
  }

  function recalculateEstimate() {
    if (!areaSlider) return;
    
    // Defensive input bounds checking
    let rawValue = parseInt(areaSlider.value, 10);
    if (isNaN(rawValue) || rawValue < 500) rawValue = 500;
    if (rawValue > 100000) rawValue = 100000;
    
    const area = rawValue;
    if (areaValueDisplay) {
      areaValueDisplay.textContent = `${area.toLocaleString('en-IN')} SQ.FT.`;
    }

    const rates = packageRates[currentPackage] || packageRates.standard;
    const lowCost = area * rates.low;
    const highCost = area * rates.high;

    if (lowEstimateDisplay && highEstimateDisplay) {
      lowEstimateDisplay.textContent = formatIndianCurrency(lowCost);
      highEstimateDisplay.textContent = formatIndianCurrency(highCost);
    }

    if (formulaLabel) {
      formulaLabel.textContent = `${area.toLocaleString('en-IN')} SFT × ₹${rates.low.toLocaleString('en-IN')} to ₹${rates.high.toLocaleString('en-IN')} / SFT`;
    }

    // Debounced tracking event
    clearTimeout(estimatorTrackDebounce);
    estimatorTrackDebounce = setTimeout(() => {
      window.trackKnsEvent('estimator_used', {
        area_sft: area,
        package_type: currentPackage,
        package_title: rates.title,
        estimated_low: lowCost,
        estimated_high: highCost
      });
    }, 600);
  }

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPackage = btn.getAttribute('data-type') || 'standard';
      recalculateEstimate();
    });
  });

  areaSlider?.addEventListener('input', recalculateEstimate);
  if (areaSlider) {
    recalculateEstimate();
  }

  // ==========================================================================
  // 5. INTERACTIVE MASTER PLAN CONTROLLER (ZOOM, PAN & PLOT SELECTOR)
  // ==========================================================================
  const masterPlanImg = document.getElementById('masterPlanImage');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const selectedPlotNum = document.getElementById('selectedPlotNum');
  const plotStatusPill = document.getElementById('plotStatusPill');
  const plotSelectorSelect = document.getElementById('plotSelectorSelect');
  const enquirePlotBtn = document.getElementById('enquirePlotBtn');
  const planScrollArea = document.querySelector('.master-plan-scroll-area');

  let currentZoom = 1;
  let panX = 0, panY = 0;
  let isPanning = false;
  let startX = 0, startY = 0;

  function renderPlanTransform() {
    if (masterPlanImg) {
      masterPlanImg.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
      if (currentZoom > 1) {
        masterPlanImg.style.cursor = isPanning ? 'grabbing' : 'grab';
      } else {
        masterPlanImg.style.cursor = 'default';
      }
    }
  }

  zoomInBtn?.addEventListener('click', () => {
    if (currentZoom < 2.5) {
      currentZoom += 0.25;
      renderPlanTransform();
      window.trackKnsEvent('master_plan_interaction', { action: 'zoom_in', zoom_level: currentZoom });
    }
  });

  zoomOutBtn?.addEventListener('click', () => {
    if (currentZoom > 0.8) {
      currentZoom -= 0.25;
      if (currentZoom <= 1) {
        panX = 0;
        panY = 0;
      }
      renderPlanTransform();
      window.trackKnsEvent('master_plan_interaction', { action: 'zoom_out', zoom_level: currentZoom });
    }
  });

  zoomResetBtn?.addEventListener('click', () => {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    renderPlanTransform();
    window.trackKnsEvent('master_plan_interaction', { action: 'reset' });
  });

  // Drag to pan when zoomed
  if (planScrollArea) {
    planScrollArea.addEventListener('mousedown', (e) => {
      if (currentZoom > 1) {
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        renderPlanTransform();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        renderPlanTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        renderPlanTransform();
      }
    });

    // Touch support for panning
    planScrollArea.addEventListener('touchstart', (e) => {
      if (currentZoom > 1 && e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    planScrollArea.addEventListener('touchmove', (e) => {
      if (isPanning && e.touches.length === 1) {
        panX = e.touches[0].clientX - startX;
        panY = e.touches[0].clientY - startY;
        renderPlanTransform();
      }
    }, { passive: true });

    planScrollArea.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  // Plot selector change
  plotSelectorSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (selectedPlotNum) selectedPlotNum.textContent = `PLOT ${val}`;
    if (plotStatusPill) plotStatusPill.textContent = 'CONTACT FOR AVAILABILITY';
    if (enquirePlotBtn) {
      enquirePlotBtn.setAttribute('href', `contact.html?plot=${encodeURIComponent(val)}`);
    }
    window.trackKnsEvent('master_plan_interaction', { action: 'select_plot', plot_number: val });
  });

  // ==========================================================================
  // 6. MASONRY GALLERY & ACCESSIBLE LIGHTBOX WITH FOCUS RESTORATION
  // ==========================================================================
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryTiles = document.querySelectorAll('.gallery-tile');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let visibleImages = [];
  let currentImageIndex = -1;
  let lastFocusedElement = null;

  function updateVisibleImages() {
    visibleImages = [];
    galleryTiles.forEach(tile => {
      if (tile.style.display !== 'none') {
        const img = tile.querySelector('img');
        if (img) visibleImages.push({ src: img.src, alt: img.alt });
      }
    });
  }

  updateVisibleImages();

  galleryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      galleryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      galleryTiles.forEach(tile => {
        const tileCat = tile.getAttribute('data-category');
        if (cat === 'all' || tileCat === cat) {
          tile.style.display = 'block';
        } else {
          tile.style.display = 'none';
        }
      });
      updateVisibleImages();
    });
  });

  function openLightboxAtIndex(index) {
    if (!lightbox || !lightboxImg || visibleImages.length === 0) return;
    lastFocusedElement = document.activeElement;
    currentImageIndex = (index + visibleImages.length) % visibleImages.length;
    
    const activeItem = visibleImages[currentImageIndex];
    lightboxImg.src = activeItem.src;
    lightboxImg.alt = activeItem.alt || 'Enlarged project photograph';
    
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus close button for accessibility
    setTimeout(() => {
      lightboxClose?.focus();
    }, 50);

    window.trackKnsEvent('gallery_open', { image_src: activeItem.src });
  }

  function closeLightboxModal() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Restore focus to previously active element
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  galleryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const img = tile.querySelector('img');
      if (img) {
        const idx = visibleImages.findIndex(item => item.src === img.src);
        openLightboxAtIndex(idx !== -1 ? idx : 0);
      }
    });

    // Keyboard trigger on gallery tile
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', tile.querySelector('img')?.alt || 'View larger image');
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightboxModal);

  lightboxPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightboxAtIndex(currentImageIndex - 1);
  });

  lightboxNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightboxAtIndex(currentImageIndex + 1);
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightboxModal();
    }
  });

  // Lightbox keyboard controls
  window.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('open')) return;
    if (e.key === 'Escape') {
      closeLightboxModal();
    } else if (e.key === 'ArrowLeft') {
      openLightboxAtIndex(currentImageIndex - 1);
    } else if (e.key === 'ArrowRight') {
      openLightboxAtIndex(currentImageIndex + 1);
    }
  });

  // ==========================================================================
  // 7. PRODUCTION-READY CONSULTATION FORM VALIDATION & LEAD GENERATION
  // ==========================================================================
  const setupFormValidationAndTracking = (form) => {
    if (!form) return;

    let hasStartedForm = false;

    // Track initial interaction
    const trackStart = () => {
      if (!hasStartedForm) {
        hasStartedForm = true;
        window.trackKnsEvent('consultation_form_start', { form_id: form.id });
      }
    };
    form.addEventListener('focusin', trackStart, { once: true });

    // Clear individual field errors on input
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('input-error-border');
        field.removeAttribute('aria-invalid');
        const errSpan = field.parentElement?.querySelector('.field-error-msg');
        if (errSpan) errSpan.remove();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Clear any prior banners or error messages
      form.querySelectorAll('.field-error-msg').forEach(el => el.remove());
      const existingBanner = form.querySelector('.form-feedback-banner');
      if (existingBanner) existingBanner.remove();

      let isValid = true;
      let firstInvalidField = null;

      const addFieldError = (field, message) => {
        if (!field) return;
        field.classList.add('input-error-border');
        field.setAttribute('aria-invalid', 'true');
        
        const err = document.createElement('span');
        err.className = 'field-error-msg';
        err.textContent = message;
        field.parentElement?.appendChild(err);

        if (!firstInvalidField) {
          firstInvalidField = field;
        }
        isValid = false;
      };

      // 1. Validate Full Name (min 2 chars)
      const nameInput = form.querySelector('#contactFullName, #clientName, input[name="name"]');
      if (nameInput) {
        const val = nameInput.value.trim();
        if (val.length < 2) {
          addFieldError(nameInput, 'Please enter your full name (at least 2 characters).');
        }
      }

      // 2. Validate Phone Number (min 10 digits)
      const phoneInput = form.querySelector('#contactPhone, #clientPhone, input[type="tel"]');
      if (phoneInput) {
        const cleanDigits = phoneInput.value.replace(/\D/g, '');
        if (cleanDigits.length < 10) {
          addFieldError(phoneInput, 'Please provide a valid 10-digit contact number.');
        }
      }

      // 3. Validate Email Address (pattern check if provided or required)
      const emailInput = form.querySelector('#contactEmail, #clientEmail, input[type="email"]');
      if (emailInput) {
        const emailVal = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (emailInput.hasAttribute('required') && !emailVal) {
          addFieldError(emailInput, 'Please provide your email address.');
        } else if (emailVal && !emailRegex.test(emailVal)) {
          addFieldError(emailInput, 'Please enter a valid email address (e.g. name@domain.com).');
        }
      }

      // 4. Validate Project Type (required selection)
      const typeSelect = form.querySelector('#contactProjectType, #projectType, select[name="projectType"]');
      if (typeSelect) {
        if (!typeSelect.value || typeSelect.value === '') {
          addFieldError(typeSelect, 'Please select your project or inquiry requirement.');
        }
      }

      // If invalid, focus first invalid field and stop
      if (!isValid) {
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
        return;
      }

      // Collect Inquiry Payload
      const leadPayload = {
        id: 'kns_lead_' + Date.now(),
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        name: nameInput?.value.trim() || 'Anonymous',
        phone: phoneInput?.value.trim() || '',
        email: emailInput?.value.trim() || '',
        projectType: typeSelect?.value || 'General Inquiry',
        location: form.querySelector('#contactLocation, #siteLocation')?.value.trim() || 'Kondapur / Hyderabad',
        plotSize: form.querySelector('#contactPlotSize, #plotSize')?.value.trim() || '',
        constructionArea: form.querySelector('#contactArea, #constructionArea')?.value.trim() || '',
        budget: form.querySelector('#contactBudget, #budgetRange')?.value.trim() || '',
        message: form.querySelector('#contactMessage, #projectMessage')?.value.trim() || ''
      };

      // Synchronize with Prototype Admin Dashboard in localStorage
      try {
        const savedInquiries = JSON.parse(localStorage.getItem('kns_inquiries') || '[]');
        savedInquiries.unshift(leadPayload);
        localStorage.setItem('kns_inquiries', JSON.stringify(savedInquiries.slice(0, 50)));
      } catch (storageErr) {
        // Safe fallback if storage quota exceeded or disabled
      }

      // Dispatch Conversion Analytics Event
      window.trackKnsEvent('consultation_form_submit', {
        form_id: form.id,
        project_type: leadPayload.projectType,
        location: leadPayload.location,
        budget: leadPayload.budget
      });

      // UI Feedback State
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'REQUEST A CONSULTATION';
      if (submitBtn) {
        submitBtn.textContent = 'Submitting Request...';
        submitBtn.disabled = true;
      }

      /* 
         PRODUCTION INTEGRATION POINT:
         To wire this form directly into production email/CRM services:
         Replace this setTimeout block with your backend REST API or Form service:
         e.g. fetch('https://api.yourdomain.com/v1/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadPayload)
              });
      */
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.textContent = 'Consultation Requested ✓';
          submitBtn.style.background = '#16A34A';
          submitBtn.style.borderColor = '#16A34A';
        }

        const banner = document.createElement('div');
        banner.className = 'form-feedback-banner success';
        banner.setAttribute('role', 'status');
        banner.textContent = 'Thank you! Your project consultation request has been received by KNS Construction & Real Estate. Our team will contact you shortly.';
        form.appendChild(banner);

        form.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.disabled = false;
          }
          setTimeout(() => {
            banner.remove();
          }, 4500);
        }, 3200);
      }, 600);
    });
  };

  const contactForms = [
    document.getElementById('knsContactForm'),
    document.getElementById('contactForm')
  ];

  contactForms.forEach(form => {
    if (form) setupFormValidationAndTracking(form);
  });

  // ==========================================================================
  // 8. GLOBAL CONVERSION EVENT LISTENERS (WHATSAPP, PHONE, EMAIL, PROJECTS)
  // ==========================================================================
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (!target) return;

    const href = target.getAttribute('href') || '';

    // WhatsApp Click Tracker
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      window.trackKnsEvent('whatsapp_click', {
        href: href,
        source_text: target.textContent?.trim() || 'WhatsApp CTA'
      });
    }

    // Direct Phone Call Click Tracker
    if (href.startsWith('tel:')) {
      window.trackKnsEvent('phone_click', {
        phone_number: href.replace('tel:', ''),
        source_text: target.textContent?.trim()
      });
    }

    // Direct Email Click Tracker
    if (href.startsWith('mailto:')) {
      window.trackKnsEvent('email_click', {
        email: href.replace('mailto:', ''),
        source_text: target.textContent?.trim()
      });
    }

    // Project Card / Link Click Tracker
    if (href.includes('project-') || href.includes('turnkey-construction')) {
      window.trackKnsEvent('project_view', {
        project_url: href,
        project_label: target.textContent?.trim() || 'Project Card'
      });
    }
  }, { passive: true });

});
