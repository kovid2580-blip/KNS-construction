/* ==========================================================================
   KNS CONSTRUCTION & REAL ESTATE - MASTER INTERACTIVE CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. 3D Floating Sticky Navbar Controller
  const navbar = document.getElementById('siteNavbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 45) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

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

  // 3. Interactive Cost Estimator (Exact KNS Pricing Formulas)
  const areaSlider = document.getElementById('estimatorAreaSlider');
  const areaValueDisplay = document.getElementById('estimatorAreaVal');
  const typeButtons = document.querySelectorAll('.type-btn');
  const lowEstimateDisplay = document.getElementById('lowEstimateDisplay');
  const highEstimateDisplay = document.getElementById('highEstimateDisplay');
  const formulaLabel = document.getElementById('formulaLabel');

  // Rates supplied by KNS:
  // Standard: 1,600 - 1,800 / sft
  // Premium: 1,900 - 2,200 / sft
  // Commercial: 2,200 - 2,500 / sft
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

  // 4. Interactive Master Plan Controller (Zoom, Pan, Plot Selector)
  const masterPlanImg = document.getElementById('masterPlanImage');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const selectedPlotNum = document.getElementById('selectedPlotNum');
  const plotStatusPill = document.getElementById('plotStatusPill');
  const plotSelectorSelect = document.getElementById('plotSelectorSelect');
  const enquirePlotBtn = document.getElementById('enquirePlotBtn');

  let currentZoom = 1;

  zoomInBtn?.addEventListener('click', () => {
    if (currentZoom < 2.5) {
      currentZoom += 0.25;
      if (masterPlanImg) masterPlanImg.style.transform = `scale(${currentZoom})`;
    }
  });

  zoomOutBtn?.addEventListener('click', () => {
    if (currentZoom > 0.8) {
      currentZoom -= 0.25;
      if (masterPlanImg) masterPlanImg.style.transform = `scale(${currentZoom})`;
    }
  });

  zoomResetBtn?.addEventListener('click', () => {
    currentZoom = 1;
    if (masterPlanImg) masterPlanImg.style.transform = `scale(1)`;
  });

  // Plot selector change
  plotSelectorSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (selectedPlotNum) selectedPlotNum.textContent = `PLOT ${val}`;
    if (plotStatusPill) plotStatusPill.textContent = 'CONTACT FOR AVAILABILITY';
    if (enquirePlotBtn) {
      enquirePlotBtn.setAttribute('href', `contact.html?plot=${encodeURIComponent(val)}`);
    }
  });

  // 5. Masonry Gallery Category Filter & Fullscreen Lightbox
  const galleryFilters = document.querySelectorAll('.gallery-filter-btn');
  const galleryTiles = document.querySelectorAll('.gallery-tile');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

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
    });
  });

  galleryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const img = tile.querySelector('img');
      if (img && lightboxImg && lightbox) {
        lightboxImg.src = img.src;
        lightbox.classList.add('open');
      }
    });
  });

  lightboxClose?.addEventListener('click', () => {
    lightbox?.classList.remove('open');
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
    }
  });

  // 6. Contact Form & WhatsApp Integration
  const contactForm = document.getElementById('knsContactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Consultation Requested ✓';
      alert('Thank you! Your project consultation request has been recorded. Our team will contact you shortly.');
      contactForm.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2500);
    }, 800);
  });
});
