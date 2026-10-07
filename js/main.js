/* ==========================================================================
   KNS CONSTRUCTION & REAL ESTATE - INTERACTIVE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation & Header Elevation
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileOverlay = document.getElementById('mobileNavOverlay');
  const mobileClose = document.getElementById('mobileDrawerClose');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);
  mobileLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // 3. Portfolio Category Filtering
  const filterButtons = document.querySelectorAll('.portfolio-tab-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 4. Interactive Construction Cost Calculator
  const areaSlider = document.getElementById('areaSlider');
  const areaDisplay = document.getElementById('areaDisplay');
  const gradeInputs = document.querySelectorAll('input[name="buildGrade"]');
  const gradeLabels = document.querySelectorAll('.calc-radio-label');
  const totalCostDisplay = document.getElementById('totalCostDisplay');
  const civilCostDisplay = document.getElementById('civilCostDisplay');
  const interiorCostDisplay = document.getElementById('interiorCostDisplay');
  const permitCostDisplay = document.getElementById('permitCostDisplay');

  // Pricing rates per square foot in INR
  const gradeRates = {
    standard: { rate: 2100, civilRatio: 0.65, interiorRatio: 0.25, permitRatio: 0.10 },
    premium: { rate: 3200, civilRatio: 0.60, interiorRatio: 0.30, permitRatio: 0.10 },
    luxury: { rate: 4800, civilRatio: 0.55, interiorRatio: 0.35, permitRatio: 0.10 }
  };

  function updateCalculator() {
    if (!areaSlider) return;
    const areaSqFt = parseInt(areaSlider.value, 10);
    areaDisplay.textContent = `${areaSqFt.toLocaleString()} sq.ft`;

    let selectedGrade = 'premium';
    gradeInputs.forEach(input => {
      if (input.checked) {
        selectedGrade = input.value;
      }
    });

    // Update active label style
    gradeLabels.forEach(label => {
      const radio = label.querySelector('input');
      if (radio && radio.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });

    const config = gradeRates[selectedGrade];
    const totalINR = areaSqFt * config.rate;
    const civilINR = totalINR * config.civilRatio;
    const interiorINR = totalINR * config.interiorRatio;
    const permitINR = totalINR * config.permitRatio;

    // Formatting in Indian numbering format (Lakhs / Crores)
    function formatINR(val) {
      if (val >= 10000000) {
        return `₹ ${(val / 10000000).toFixed(2)} Cr`;
      } else if (val >= 100000) {
        return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
      }
      return `₹ ${Math.round(val).toLocaleString()}`;
    }

    if (totalCostDisplay) totalCostDisplay.textContent = formatINR(totalINR);
    if (civilCostDisplay) civilCostDisplay.textContent = formatINR(civilINR);
    if (interiorCostDisplay) interiorCostDisplay.textContent = formatINR(interiorINR);
    if (permitCostDisplay) permitCostDisplay.textContent = formatINR(permitINR);
  }

  if (areaSlider) {
    areaSlider.addEventListener('input', updateCalculator);
    gradeInputs.forEach(input => input.addEventListener('change', updateCalculator));
    updateCalculator();
  }

  // 5. Consultation & Quote Inquiry Form Handler
  const quoteForm = document.getElementById('consultationForm');
  const confirmationModal = document.getElementById('confirmationModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting Request...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        quoteForm.reset();
        if (confirmationModal) {
          confirmationModal.classList.add('open');
        }
      }, 900);
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      confirmationModal.classList.remove('open');
    });
  }

  if (confirmationModal) {
    confirmationModal.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        confirmationModal.classList.remove('open');
      }
    });
  }

  // 6. Active Navigation Highlighting on Scroll
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    desktopLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
});
