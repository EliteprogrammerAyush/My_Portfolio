/* ==========================================================================
   Portfolio Interactivity & Functionality - Ayush Soni
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Safe LocalStorage Helper
  const storage = {
    get: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('LocalStorage read error:', e);
        return null;
      }
    },
    set: (key, val) => {
      try {
        localStorage.setItem(key, val);
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 1. EmailJS Safe Initialization
  // --------------------------------------------------------------------------
  const EMAILJS_PUBLIC_KEY = 'WF4PAIuVXFsU3gLIZ';
  const EMAILJS_SERVICE_ID = 'service_gvzlq8i';
  const EMAILJS_TEMPLATE_ID = 'template_b4rjk2s';

  let emailJsReady = false;
  if (typeof emailjs !== 'undefined') {
    try {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      emailJsReady = true;
    } catch (err) {
      console.warn('EmailJS initialization failed:', err);
    }
  } else {
    console.warn('EmailJS library not loaded (possibly blocked by an ad-blocker or offline).');
  }

  // --------------------------------------------------------------------------
  // 2. Theme Switcher (Dark / Light Mode)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');

  const savedTheme = storage.get('portfolio-theme') || (systemPrefersLight.matches ? 'light' : 'dark');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    storage.set('portfolio-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  // Listen for system theme change only if user hasn't explicitly set a preference
  systemPrefersLight.addEventListener('change', (e) => {
    if (!storage.get('portfolio-theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  // --------------------------------------------------------------------------
  // 3. Mobile Menu Toggle & Navigation
  // --------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');

  function closeMobileMenu() {
    if (navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  function openMobileMenu() {
    if (navLinks) {
      navLinks.classList.add('active');
      if (mobileMenuBtn) {
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    }
  }

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = navLinks.classList.contains('active');
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when clicking any nav link
    navLinkItems.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Scroll Active Nav Link Highlight (Scrollspy)
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  let isScrollTicking = false;

  function updateActiveNav() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const isAtBottom = (scrollY + windowHeight) >= (documentHeight - 50);

    let currentSectionId = '';

    if (isAtBottom && sections.length > 0) {
      // If user reached bottom of page, activate the last section (Contact)
      currentSectionId = sections[sections.length - 1].getAttribute('id');
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    if (currentSectionId) {
      navLinkItems.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    isScrollTicking = false;
  }

  function onScroll() {
    if (!isScrollTicking) {
      window.requestAnimationFrame(updateActiveNav);
      isScrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initialize on page load
  updateActiveNav();
  window.addEventListener('load', updateActiveNav);

  // --------------------------------------------------------------------------
  // 5. Certificate Lightbox Modal Viewer
  // --------------------------------------------------------------------------
  const certCards = document.querySelectorAll('.cert-card');
  const modalOverlay = document.getElementById('cert-modal');
  const modalImg = document.getElementById('modal-cert-img');
  const modalCaption = document.getElementById('modal-cert-caption');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  let lastFocusedElement = null;

  function openModal(imgSrc, title, triggerElement) {
    if (!modalOverlay || !modalImg) return;
    lastFocusedElement = triggerElement || document.activeElement;
    modalImg.src = imgSrc;
    if (modalCaption) {
      modalCaption.textContent = title || 'Certificate Preview';
    }
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for keyboard accessibility
    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalImg) {
      modalImg.src = '';
    }

    // Return focus to triggering card
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  certCards.forEach(card => {
    // Accessibility: make card focusable and interactive
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${card.dataset.title || 'certificate'} in full size`);

    const triggerOpen = () => {
      const imgEl = card.querySelector('.cert-img');
      const imgSrc = card.dataset.img || (imgEl ? imgEl.src : '');
      const titleEl = card.querySelector('.cert-title');
      const title = card.dataset.title || (titleEl ? titleEl.textContent : '');
      if (imgSrc) {
        openModal(imgSrc, title, card);
      }
    };

    card.addEventListener('click', triggerOpen);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOpen();
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // --------------------------------------------------------------------------
  // 6. Contact Form Handler (Safe EmailJS)
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm) {
    // Hide feedback on new input
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (formFeedback && formFeedback.style.display !== 'none') {
          formFeedback.style.display = 'none';
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Validation
      if (!name || !email || !message) {
        showFeedback('Please fill in all fields before sending.', '#ef4444');
        return;
      }

      // Basic email regex validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showFeedback('Please enter a valid email address.', '#ef4444');
        return;
      }

      // Check if EmailJS is available
      if (typeof emailjs === 'undefined') {
        showFeedback(
          'Email service is temporarily unavailable (possibly blocked by an ad-blocker). Please reach out directly via LinkedIn or email.',
          '#ef4444'
        );
        return;
      }

      // Store original button HTML to preserve icons
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Send Message';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      }

      emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message: message
        }
      )
      .then(function () {
        showFeedback('Message sent successfully! Thank you for reaching out.', '#10b981');
        contactForm.reset();
      })
      .catch(function (error) {
        console.error('EmailJS Error:', error);
        showFeedback('Unable to send your message right now. Please try again or reach out on LinkedIn.', '#ef4444');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      });
    });
  }

  function showFeedback(text, color) {
    if (formFeedback) {
      formFeedback.textContent = text;
      formFeedback.style.color = color;
      formFeedback.style.display = 'block';
    } else {
      alert(text);
    }
  }
});