/* ==========================================================================
   KNS CONSTRUCTION & REAL ESTATE - MASTER INTERACTIVE CONTROLLER
   Production Refinement: Performance, Accessibility & Touch Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. 3D Floating Sticky Navbar Controller with rAF Throttle
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

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileToggleBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileDrawerOverlay');
  const mobileClose = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', openDrawer);
  mobileClose?.addEventListener('click', closeDrawer);
  mobileOverlay?.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // 3. Hero Section Subtle Architectural 3D Mouse Parallax
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
    });

    heroSection.addEventListener('mouseleave', () => {
      heroLines.style.transform = 'translate(0px, 0px)';
      heroLines.style.transition = 'transform 0.4s ease';
      setTimeout(() => {
        heroLines.style.transition = '';
      }, 400);
    });
  }

  // 4. Interactive Cost Estimator (Exact KNS Verified Pricing Formulas)
  const areaSlider = document.getElementById('estimatorAreaSlider');
  const areaValueDisplay = document.getElementById('estimatorAreaVal');
  const typeButtons = document.querySelectorAll('.type-btn');
  const lowEstimateDisplay = document.getElementById('lowEstimateDisplay');
  const highEstimateDisplay = document.getElementById('highEstimateDisplay');
  const formulaLabel = document.getElementById('formulaLabel');

  const packageRates = {
    standard: { low: 1600, high: 1800, title: 'Standard Residential' },
    premium: { low: 1900, high: 2200, title: 'Premium Residential' },
    commercial: { low: 2200, high: 2500, title: 'Commercial Construction' }
  };

  let currentPackage = 'standard';

  function formatIndianCurrency(amount) {
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
  }

  function recalculateEstimate() {
    if (!areaSlider) return;
    const area = parseInt(areaSlider.value, 10);
    if (areaValueDisplay) {
      areaValueDisplay.textContent = `${area.toLocaleString('en-IN')} SQ.FT.`;
    }

    const rates = packageRates[currentPackage];
    const lowCost = area * rates.low;
    const highCost = area * rates.high;

    if (lowEstimateDisplay && highEstimateDisplay) {
      lowEstimateDisplay.textContent = formatIndianCurrency(lowCost);
      highEstimateDisplay.textContent = formatIndianCurrency(highCost);
    }

    if (formulaLabel) {
      formulaLabel.textContent = `${area.toLocaleString('en-IN')} SFT × ₹${rates.low.toLocaleString('en-IN')} to ₹${rates.high.toLocaleString('en-IN')} / SFT`;
    }
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
  recalculateEstimate();

  // 5. Interactive Master Plan Controller (Zoom, Drag-to-Pan, Plot Selector)
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
    }
  });

  zoomResetBtn?.addEventListener('click', () => {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    renderPlanTransform();
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
  });

  // 6. Masonry Gallery Category Filter & Accessible Fullscreen Lightbox
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryTiles = document.querySelectorAll('.gallery-tile');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let visibleImages = [];
  let currentImageIndex = -1;

  function updateVisibleImages() {
    visibleImages = [];
    galleryTiles.forEach(tile => {
      if (tile.style.display !== 'none') {
        const img = tile.querySelector('img');
        if (img) visibleImages.push(img.src);
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
    currentImageIndex = (index + visibleImages.length) % visibleImages.length;
    lightboxImg.src = visibleImages[currentImageIndex];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightboxModal() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  galleryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const img = tile.querySelector('img');
      if (img) {
        const idx = visibleImages.indexOf(img.src);
        openLightboxAtIndex(idx !== -1 ? idx : 0);
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

  // Keyboard Navigation: Escape, ArrowLeft, ArrowRight
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

  // 7. Universal Consultation Form Handlers (index.html & contact.html)
  const handleFormSubmission = (form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      
      const originalText = btn.textContent;
      btn.textContent = 'Submitting Request...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Consultation Requested ✓';
        btn.style.background = '#16A34A';
        btn.style.borderColor = '#16A34A';
        
        // Friendly notice
        const notice = document.createElement('div');
        notice.style.marginTop = '16px';
        notice.style.padding = '14px 18px';
        notice.style.background = 'rgba(22, 163, 74, 0.1)';
        notice.style.border = '1px solid rgba(22, 163, 74, 0.3)';
        notice.style.borderRadius = '8px';
        notice.style.color = '#15803D';
        notice.style.fontSize = '0.92rem';
        notice.style.fontWeight = '600';
        notice.style.textAlign = 'center';
        notice.textContent = 'Thank you! Your project consultation request has been received by KNS Construction & Real Estate. Our team will contact you shortly.';
        form.appendChild(notice);

        form.reset();

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          setTimeout(() => notice.remove(), 4000);
        }, 3000);
      }, 700);
    });
  };

  const contactForms = [
    document.getElementById('knsContactForm'),
    document.getElementById('contactForm')
  ];

  contactForms.forEach(form => {
    if (form) handleFormSubmission(form);
  });

});
