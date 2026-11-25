/* ==========================================================================
   AYISHA DIYA P - RAINBOW CREATIVE INTERACTIVE PORTFOLIO
   Script: script.js (Stage 1 Foundation)
   Concepts: DOM Manipulation, Event Listeners, Scroll Tracking, Gamified HUD
   ========================================================================== */

// Wrap all logic in DOMContentLoaded so it runs after the HTML is parsed
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     STAGE 5: GAMIFICATION, STARS, POINTS, BADGES & LOCALSTORAGE ENGINE
     ========================================================================== */

  // 1. Configurable Rewards, Points & Badges (Easy to edit)
  const REWARDS_CONFIG = {
    sections: {
      'about': { points: 10, stars: 1, name: 'About Me' },
      'skills': { points: 15, stars: 1, name: 'Skills' },
      'projects': { points: 15, stars: 1, name: 'Projects' },
      'journey': { points: 10, stars: 1, name: 'Journey' },
      'activity': { points: 20, stars: 1, name: 'Portfolio Activity' }
    },
    // The 5 Required Achievements
    badges: {
      'first-explorer': {
        id: 'first-explorer',
        name: 'First Explorer',
        desc: 'Visit your first portfolio section.',
        icon: '🌟',
        condition: (state) => state.visitedSections.length >= 1
      },
      'curious-mind': {
        id: 'curious-mind',
        name: 'Curious Mind',
        desc: 'Explore three different sections.',
        icon: '🧠',
        condition: (state) => state.visitedSections.length >= 3
      },
      'skill-hunter': {
        id: 'skill-hunter',
        name: 'Skill Hunter',
        desc: 'Visit the Skills section.',
        icon: '⚡',
        condition: (state) => state.visitedSections.includes('skills')
      },
      'project-explorer': {
        id: 'project-explorer',
        name: 'Project Explorer',
        desc: 'Visit the Projects section.',
        icon: '🚀',
        condition: (state) => state.visitedSections.includes('projects')
      },
      'portfolio-master': {
        id: 'portfolio-master',
        name: 'Portfolio Master',
        desc: 'Explore all main portfolio sections.',
        icon: '👑',
        condition: (state) => {
          const required = ['about', 'skills', 'projects', 'journey'];
          return required.every(sec => state.visitedSections.includes(sec));
        }
      },
      'activity-star': {
        id: 'activity-star',
        name: 'Activity Star',
        desc: 'Complete an interactive portfolio activity.',
        icon: '🎯',
        condition: (state) => state.visitedSections.includes('activity')
      }
    }
  };

  const STORAGE_KEY = 'ayisha_portfolio_gamification_v5';

  // Live Adventure State
  let adventureState = {
    points: 0,
    stars: 0,
    visitedSections: [],
    unlockedBadges: [],
    rank: 'Novice Scout'
  };

  // Notification Toast Helper
  const toastNotification = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-text');
  let toastTimeout = null;

  function showToast(message, icon = '✨') {
    if (!toastNotification || !toastText) return;

    const iconSpan = toastNotification.querySelector('.toast-icon');
    if (iconSpan) iconSpan.textContent = icon;
    toastText.textContent = message;

    toastNotification.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3400);
  }

  // 2. Safe LocalStorage Save, Load & Reset
  function saveAdventureState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adventureState));
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted:', e);
    }
  }

  function loadAdventureState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          adventureState.points = typeof parsed.points === 'number' ? parsed.points : 0;
          adventureState.stars = typeof parsed.stars === 'number' ? parsed.stars : 0;
          adventureState.visitedSections = Array.isArray(parsed.visitedSections) ? parsed.visitedSections : [];
          adventureState.unlockedBadges = Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [];
          adventureState.rank = parsed.rank || 'Novice Scout';
        }
      }
    } catch (e) {
      console.warn('Error reading saved adventure progress:', e);
    }
  }

  function resetAdventureProgress() {
    const confirmed = window.confirm('Are you sure you want to reset your portfolio adventure progress? You can explore fresh anytime!');
    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }

    adventureState = {
      points: 0,
      stars: 0,
      visitedSections: [],
      unlockedBadges: [],
      rank: 'Novice Scout'
    };

    updateAllGamificationUI();
    showToast('Adventure progress has been reset! Start exploring fresh! 🌟', '🔄');
  }

  // 3. Dynamic Rank Calculation
  function calculateRank(points) {
    if (points >= 70) return 'Master Quest Explorer 👑';
    if (points >= 45) return 'Creative Adventurer 🌟';
    if (points >= 20) return 'Curious Voyager 🧭';
    return 'Novice Scout 🎮';
  }

  // 4. Update All Live UI Elements
  function updateAllGamificationUI() {
    adventureState.rank = calculateRank(adventureState.points);

    // Calculate unique exploration percentage (5 core milestones)
    const explorationCount = adventureState.visitedSections.length;
    const explorationPct = Math.min(100, Math.round((explorationCount / 5) * 100));

    // A. Header HUD
    const hudRank = document.getElementById('hud-rank-display');
    const hudPoints = document.getElementById('hud-points-display');
    const hudStars = document.getElementById('hud-stars-display');
    if (hudRank) hudRank.textContent = adventureState.rank;
    if (hudPoints) hudPoints.textContent = adventureState.points;
    if (hudStars) hudStars.textContent = Math.min(5, adventureState.stars);

    // B. Floating Quest Button
    const floatStars = document.getElementById('float-stars-count');
    if (floatStars) floatStars.textContent = `${Math.min(5, adventureState.stars)}/5 ⭐`;

    // C. Top Progress Bar (calculated on unique sections visited)
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${explorationPct}%`;
    }

    // D. Dashboard Modal Progress
    const dashPercent = document.getElementById('dashboard-progress-percent');
    const dashFill = document.getElementById('dashboard-progress-fill');
    const dashCaption = document.getElementById('dashboard-progress-caption');
    if (dashPercent) dashPercent.textContent = `${explorationPct}%`;
    if (dashFill) dashFill.style.width = `${explorationPct}%`;
    if (dashCaption) dashCaption.textContent = `${explorationCount} of 5 unique milestones explored`;

    // E. Dashboard 4 Stat Cards
    const dashPts = document.getElementById('dash-points-val');
    const dashStars = document.getElementById('dash-stars-val');
    const dashSections = document.getElementById('dash-sections-val');
    const dashBadges = document.getElementById('dash-badges-val');
    if (dashPts) dashPts.textContent = adventureState.points;
    if (dashStars) dashStars.textContent = `${Math.min(5, adventureState.stars)} / 5`;
    if (dashSections) dashSections.textContent = `${Math.min(5, explorationCount)} / 5`;
    if (dashBadges) dashBadges.textContent = `${Math.min(5, adventureState.unlockedBadges.length)} / 5`;

    // F. Section Checklist in Dashboard
    const sectionChecklistKeys = ['about', 'skills', 'projects', 'journey', 'activity'];
    sectionChecklistKeys.forEach(secKey => {
      const itemEl = document.getElementById(`star-quest-${secKey}`);
      if (itemEl) {
        const isDone = adventureState.visitedSections.includes(secKey);
        if (isDone) {
          itemEl.classList.add('completed');
          const statusIcon = itemEl.querySelector('.section-star-status');
          if (statusIcon) statusIcon.innerHTML = '<i class="fa-solid fa-star"></i>';
        } else {
          itemEl.classList.remove('completed');
          const statusIcon = itemEl.querySelector('.section-star-status');
          if (statusIcon) statusIcon.innerHTML = '<i class="fa-regular fa-star"></i>';
        }
      }
    });

    // G. Badges in About Section & Dashboard
    Object.keys(REWARDS_CONFIG.badges).forEach(badgeId => {
      const isUnlocked = adventureState.unlockedBadges.includes(badgeId);

      // About Section Badge Item
      const aboutBadge = document.getElementById(`badge-about-${badgeId}`);
      if (aboutBadge) {
        if (isUnlocked) {
          aboutBadge.classList.remove('locked');
          aboutBadge.classList.add('unlocked');
          const statusText = aboutBadge.querySelector('.badge-status');
          if (statusText) statusText.textContent = 'Unlocked!';
        } else {
          aboutBadge.classList.add('locked');
          aboutBadge.classList.remove('unlocked');
          const statusText = aboutBadge.querySelector('.badge-status');
          if (statusText) statusText.textContent = 'Locked';
        }
      }

      // Dashboard Badge Item
      const dashBadge = document.getElementById(`dash-badge-${badgeId}`);
      if (dashBadge) {
        if (isUnlocked) {
          dashBadge.classList.remove('locked');
          dashBadge.classList.add('unlocked');
          const stateSpan = dashBadge.querySelector('.dash-badge-state');
          if (stateSpan) stateSpan.textContent = 'Unlocked! 🎉';
        } else {
          dashBadge.classList.add('locked');
          dashBadge.classList.remove('unlocked');
          const stateSpan = dashBadge.querySelector('.dash-badge-state');
          if (stateSpan) stateSpan.textContent = 'Locked';
        }
      }
    });

    // Vault Badge Count in About Section
    const vaultBadgeCount = document.getElementById('vault-badge-count');
    if (vaultBadgeCount) {
      const totalUnlocked = adventureState.unlockedBadges.length;
      vaultBadgeCount.textContent = `${totalUnlocked} / 5 Unlocked`;
    }
  }

  // 5. Badge Unlock Verification
  function checkBadgeUnlocks() {
    let unlockedNew = false;

    Object.keys(REWARDS_CONFIG.badges).forEach(badgeId => {
      const badgeConfig = REWARDS_CONFIG.badges[badgeId];
      if (!adventureState.unlockedBadges.includes(badgeId)) {
        if (badgeConfig.condition(adventureState)) {
          adventureState.unlockedBadges.push(badgeId);
          unlockedNew = true;
          // Notification when an achievement is unlocked
          setTimeout(() => {
            showToast(`🏆 Achievement Unlocked: "${badgeConfig.name}"!`, '🎉');
          }, 400);
        }
      }
    });

    if (unlockedNew) {
      saveAdventureState();
      updateAllGamificationUI();
    }
  }

  // 6. Record Section Visit (Prevents Duplicate Rewards!)
  function recordSectionVisit(sectionKey) {
    if (adventureState.visitedSections.includes(sectionKey)) {
      return; // Already rewarded! Prevents repeated scrolling exploits
    }

    const reward = REWARDS_CONFIG.sections[sectionKey];
    if (!reward) return;

    adventureState.visitedSections.push(sectionKey);
    adventureState.points += reward.points;
    adventureState.stars += reward.stars;

    // Toast reward notification
    showToast(`⭐ +${reward.stars} Star & +${reward.points} Points: Explored ${reward.name}!`, '🎉');

    checkBadgeUnlocks();
    saveAdventureState();
    updateAllGamificationUI();
  }

  // 7. General addPoints helper (maintains compatibility with existing button clicks)
  function addPoints(amount, reason = '') {
    adventureState.points += amount;
    if (reason) {
      showToast(`+${amount} Points: ${reason}! (Total: ${adventureState.points} PTS)`, '✨');
    }
    saveAdventureState();
    updateAllGamificationUI();
  }

  // Alias for backward compatibility
  function addXP(amount, reason = '') {
    addPoints(amount, reason);
  }

  // Initialize and load saved state from localStorage
  loadAdventureState();
  updateAllGamificationUI();

  // 8. Section Intersection Observer for Unique Visits
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          if (sectionId && REWARDS_CONFIG.sections[sectionId]) {
            recordSectionVisit(sectionId);
          }
        }
      });
    }, {
      threshold: 0.35 // Trigger when 35% of the section is visible
    });

    const observableSections = ['about', 'skills', 'projects', 'journey'];
    observableSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  // 9. Dashboard Modal Controls
  const dashboardModal = document.getElementById('dashboard-modal');
  const btnOpenDashboard = document.getElementById('btn-open-dashboard');
  const floatingQuestBtn = document.getElementById('floating-quest-btn');
  const btnBannerOpenDashboard = document.getElementById('btn-banner-open-dashboard');
  const dashboardCloseBtn = document.getElementById('dashboard-close-btn');
  const btnResetProgress = document.getElementById('btn-reset-progress');

  function openDashboard() {
    if (!dashboardModal) return;
    updateAllGamificationUI();
    dashboardModal.classList.add('open');
    dashboardModal.setAttribute('aria-hidden', 'false');
  }

  function closeDashboard() {
    if (!dashboardModal) return;
    dashboardModal.classList.remove('open');
    dashboardModal.setAttribute('aria-hidden', 'true');
  }

  if (btnOpenDashboard) btnOpenDashboard.addEventListener('click', openDashboard);
  if (floatingQuestBtn) floatingQuestBtn.addEventListener('click', openDashboard);
  if (btnBannerOpenDashboard) btnBannerOpenDashboard.addEventListener('click', openDashboard);
  if (dashboardCloseBtn) dashboardCloseBtn.addEventListener('click', closeDashboard);

  if (dashboardModal) {
    dashboardModal.addEventListener('click', (e) => {
      if (e.target === dashboardModal) {
        closeDashboard();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dashboardModal && dashboardModal.classList.contains('open')) {
      closeDashboard();
    }
  });

  // Reset progress listener
  if (btnResetProgress) {
    btnResetProgress.addEventListener('click', resetAdventureProgress);
  }

  /* --------------------------------------------------------------------------
     3. MOBILE NAVIGATION MENU TOGGLE
     Opens/closes the navigation drawer on phones and tablets.
     -------------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu when any navigation link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. ACTIVE NAVIGATION LINK ON SCROLL (SCROLL SPY)
     Highlights the current section in the navbar as you scroll.
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');

  function highlightActiveNavLink() {
    const scrollY = window.pageYOffset + 120; // Offset for header height

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveNavLink, { passive: true });

  /* --------------------------------------------------------------------------
     5. ARCADE TEASERS & CLAIM XP INTERACTION
     Gives visitors fun interactive feedback when clicking game elements.
     -------------------------------------------------------------------------- */
  const btnDemoXP = document.getElementById('btn-demo-xp');
  if (btnDemoXP) {
    btnDemoXP.addEventListener('click', () => {
      if (!adventureState.visitedSections.includes('activity')) {
        recordSectionVisit('activity');
        btnDemoXP.innerHTML = '<i class="fa-solid fa-check"></i> Quest Activity Completed! (+20 PTS)';
        btnDemoXP.style.opacity = '0.85';
        btnDemoXP.disabled = true;
      } else {
        showToast('You already claimed the activity star bonus! ⭐', '⭐');
      }
    });
  }

  // Mini Game Preview Buttons
  const gamePreviewButtons = document.querySelectorAll('.btn-game-preview');
  gamePreviewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const gameName = button.getAttribute('data-name') || 'Mini Game';
      addPoints(5, `Previewed ${gameName}`);
      recordSectionVisit('activity');
      showToast(`🎮 "${gameName}" is prepared! Complete mechanics unlock in Stage 6.`, '🕹️');
    });
  });

  // Achievement Badges Click Tip
  const badgeItems = document.querySelectorAll('.badge-item, .dash-badge-item');
  badgeItems.forEach(badge => {
    badge.addEventListener('click', () => {
      const badgeId = badge.getAttribute('data-badge');
      const badgeConfig = REWARDS_CONFIG.badges[badgeId];
      const isUnlocked = adventureState.unlockedBadges.includes(badgeId);

      if (badgeConfig) {
        if (isUnlocked) {
          showToast(`🌟 "${badgeConfig.name}" is Unlocked! (${badgeConfig.desc})`, '🏆');
        } else {
          showToast(`🔒 "${badgeConfig.name}": ${badgeConfig.desc}`, '💡');
        }
      } else {
        const badgeName = badge.querySelector('.badge-name')?.textContent || 'Badge';
        showToast(`🏆 Badge: ${badgeName}`, '✨');
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. CONTACT FORM SUBMISSION (CLIENT-SIDE DEMO)
     Simulates sending a message and shows clear, beginner-friendly feedback.
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent page refresh

      const nameInput = document.getElementById('name');
      const senderName = nameInput ? nameInput.value.trim() : 'Explorer';

      // Show success feedback
      formFeedback.textContent = `Thank you, ${senderName}! 💌 Your message has been received. I'll get back to you soon!`;
      formFeedback.className = 'form-feedback success';

      // Reward player points & record activity quest
      recordSectionVisit('activity');
      addPoints(15, 'Contact Quest Message Sent');

      // Clear the form fields
      contactForm.reset();

      // Clear feedback after 6 seconds
      setTimeout(() => {
        formFeedback.style.display = 'none';
        formFeedback.className = 'form-feedback';
      }, 6000);
    });
  }

  /* --------------------------------------------------------------------------
     7. STAGE 2: DYNAMIC TYPING & DELETING ANIMATION
     Smooth character-by-character typewriter effect with rotating CS descriptions.
     -------------------------------------------------------------------------- */
  const typingTextElement = document.getElementById('typing-text');
  
  if (typingTextElement) {
    // Exact requested rotating descriptions
    const descriptions = [
      'Computer Science Student',
      'Aspiring Web Developer',
      'Creative Problem Solver',
      'Technology Enthusiast'
    ];

    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    // Timing constants (in milliseconds)
    const TYPING_SPEED = 90;       // Speed when typing a letter
    const DELETING_SPEED = 45;     // Speed when deleting a letter
    const PAUSE_AT_END = 2000;     // Pause after completing a word
    const PAUSE_BEFORE_NEXT = 350; // Pause after word is cleared before next word

    // Check accessibility preference: if user prefers reduced motion, skip animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      typingTextElement.textContent = descriptions[0];
    } else {
      function typeLoop() {
        const currentPhrase = descriptions[currentPhraseIndex];

        if (isPaused) {
          return;
        }

        if (!isDeleting) {
          // TYPING PHASE: Add one character at a time
          typingTextElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
          currentCharIndex++;

          // Once full phrase is typed
          if (currentCharIndex === currentPhrase.length) {
            isPaused = true;
            setTimeout(() => {
              isPaused = false;
              isDeleting = true;
              typeLoop();
            }, PAUSE_AT_END);
            return;
          }
        } else {
          // DELETING PHASE: Remove one character at a time
          typingTextElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
          currentCharIndex--;

          // Once word is fully deleted
          if (currentCharIndex === 0) {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % descriptions.length;
            isPaused = true;
            setTimeout(() => {
              isPaused = false;
              typeLoop();
            }, PAUSE_BEFORE_NEXT);
            return;
          }
        }

        // Schedule next character tick
        const delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;
        setTimeout(typeLoop, delay);
      }

      // Start typing loop after a brief initial pause
      setTimeout(typeLoop, 600);
    }
  }

  /* --------------------------------------------------------------------------
     8. STAGE 2: SMOOTH SCROLLING FOR HERO BUTTONS & SCROLL INDICATOR
     Provides smooth navigation with proper offset for the sticky header.
     -------------------------------------------------------------------------- */
  function smoothScrollToTarget(targetId) {
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    const header = document.getElementById('header');
    const headerHeight = header ? header.offsetHeight : 70;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // Explore My Portfolio Button -> Smoothly scrolls to #about
  const btnExplorePortfolio = document.getElementById('btn-explore-portfolio');
  if (btnExplorePortfolio) {
    btnExplorePortfolio.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToTarget('#about');
      addXP(5, 'Explored Portfolio Overview');
    });
  }

  // View My Projects Button -> Smoothly scrolls to #projects
  const btnViewProjects = document.getElementById('btn-view-projects');
  if (btnViewProjects) {
    btnViewProjects.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToTarget('#projects');
      addXP(5, 'Navigated to Project Quests');
    });
  }

  // Hero Scroll to Explore Indicator -> Smoothly scrolls to #about
  const heroScrollIndicator = document.getElementById('hero-scroll-indicator');
  if (heroScrollIndicator) {
    heroScrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToTarget('#about');
    });
  }

  /* --------------------------------------------------------------------------
     9. PROFILE IMAGE PLACEHOLDER INTERACTION TIP
     Shows a friendly instructional toast when the profile slot is clicked.
     -------------------------------------------------------------------------- */
  const profileImageSlot = document.getElementById('profile-image-slot');
  if (profileImageSlot) {
    profileImageSlot.addEventListener('click', () => {
      showToast('📷 Place your photo (e.g. photo.jpg) in the project folder & uncomment <img> in index.html!', '💡');
    });
  }

  // Initial welcome greeting toast
  setTimeout(() => {
    showToast('HELLO, WORLD! Welcome to Ayisha Diya\'s Portfolio 🌈', '👋');
  }, 1000);

  /* --------------------------------------------------------------------------
     10. FOOTER DYNAMIC YEAR
     Keeps copyright year automatically up to date.
     -------------------------------------------------------------------------- */
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     11. STAGE 3: SCROLL-TRIGGERED REVEAL ANIMATIONS
     Animates sections, cards, and timelines smoothly into view as user scrolls.
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Animate once
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('in-view'));
  }

  /* --------------------------------------------------------------------------
     12. STAGE 3: ANIMATED NUMBER COUNTERS
     Counts numbers smoothly up from 0 to their target values when visible.
     -------------------------------------------------------------------------- */
  const countersSection = document.getElementById('counters-section');
  const counterNumbers = document.querySelectorAll('.counter-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    counterNumbers.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;

      if (prefersReducedMotion) {
        counter.textContent = target;
        return;
      }

      const duration = 1600; // ms
      const frameDuration = 1000 / 60; // 60fps
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.round(easeOut * target);

        counter.textContent = currentVal;

        if (frame >= totalFrames) {
          counter.textContent = target;
          clearInterval(timer);
        }
      }, frameDuration);
    });
  }

  if (countersSection && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    counterObserver.observe(countersSection);
  } else if (countersSection) {
    animateCounters();
  }

  /* --------------------------------------------------------------------------
     13. STAGE 4: INTERACTIVE 3D SKILL FLIP CARDS
     Handles click, tap, and keyboard interaction (Enter / Space) to flip cards.
     -------------------------------------------------------------------------- */
  const flipCards = document.querySelectorAll('.skill-flip-card');
  const flippedSkillsSet = new Set();

  function toggleFlipCard(card) {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-expanded', isFlipped ? 'true' : 'false');

    if (isFlipped) {
      recordSectionVisit('activity');
      const skillName = card.querySelector('.skill-card-name')?.textContent || 'Skill';
      if (!flippedSkillsSet.has(skillName)) {
        flippedSkillsSet.add(skillName);
        addPoints(5, `Explored ${skillName} Details`);
      }
    }
  }

  flipCards.forEach(card => {
    // Click or tap to flip
    card.addEventListener('click', (e) => {
      toggleFlipCard(card);
    });

    // Keyboard accessibility: Enter or Space key to flip
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlipCard(card);
      }
    });
  });

  /* --------------------------------------------------------------------------
     14. STAGE 4: SKILL CATEGORY FILTERING
     Filters skill cards with smooth transition when a category button is clicked.
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.skill-filter-btn');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active filter button state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-filter');

      // Filter skill cards
      let visibleCount = 0;
      flipCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        // Always reset flipped state when changing filter to keep layout clean
        card.classList.remove('is-flipped');
        card.setAttribute('aria-expanded', 'false');

        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.classList.remove('is-hidden');
          visibleCount++;
        } else {
          card.classList.add('is-hidden');
        }
      });

      // Provide feedback toast
      const categoryName = btn.querySelector('span')?.textContent || 'Skills';
      showToast(`Showing ${categoryName} (${visibleCount} skills)!`, '✨');
    });
  });

  /* --------------------------------------------------------------------------
     15. STAGE 4: ANIMATED SKILL DEVELOPMENT PROGRESS BARS
     Fills the learning progress indicators smoothly when scrolled into view.
     -------------------------------------------------------------------------- */
  const skillProgressSection = document.getElementById('skill-progress-section');
  const progressFills = document.querySelectorAll('.skill-progress-fill');
  let progressAnimated = false;

  function animateSkillProgress() {
    if (progressAnimated) return;
    progressAnimated = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    progressFills.forEach((fill, index) => {
      const targetPercent = fill.getAttribute('data-progress') || '75';
      const pctDisplay = document.getElementById(`pct-display-${index + 1}`);

      if (prefersReducedMotion) {
        fill.style.width = `${targetPercent}%`;
        if (pctDisplay) pctDisplay.textContent = `${targetPercent}%`;
      } else {
        // Staggered smooth fill animation
        setTimeout(() => {
          fill.style.width = `${targetPercent}%`;
          if (pctDisplay) pctDisplay.textContent = `${targetPercent}%`;
        }, index * 120);
      }
    });
  }

  if (skillProgressSection && 'IntersectionObserver' in window) {
    const progressObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkillProgress();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    progressObserver.observe(skillProgressSection);
  } else if (skillProgressSection) {
    animateSkillProgress();
  }

  console.log('🌈 Rainbow Creative Portfolio - Stage 4 Skills Section & 3D Flip Cards initialized successfully!');
});
