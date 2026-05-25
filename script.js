if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBookControls);
} else {
  initBookControls();
}

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// =========================================================================
// LENIS SMOOTH SCROLL
// =========================================================================
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Integrate Lenis with GSAP ScrollTrigger
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// =========================================================================
// CINEMATIC LOADER
// =========================================================================
(function initLoader() {
  const LED_COUNT   = 38;
  const MIN_DURATION = 2800; // minimum ms before exit

  /* --- Build animated letters --- */
  function makeLetters(containerId, text, baseDelay, isMain) {
    const row = document.getElementById(containerId);
    if (!row) return;
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'loader-letter';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      span.style.animationDelay = `${baseDelay + i * (isMain ? 0.075 : 0.055)}s`;
      row.appendChild(span);
    });
  }

  /* --- Build LED dot bar --- */
  function makeLEDs() {
    const bar = document.getElementById('loaderLedBar');
    if (!bar) return [];
    const dots = [];
    for (let i = 0; i < LED_COUNT; i++) {
      const d = document.createElement('div');
      d.className = 'led-dot';
      bar.appendChild(d);
      dots.push(d);
    }
    return dots;
  }

  makeLetters('loaderRow1', 'SATHYARAJ', 0.85, true);
  makeLetters('loaderRow2', 'NATARAJAN', 1.5, false);
  const dots      = makeLEDs();
  const counterEl = document.getElementById('loaderCounter');
  const flashEl   = document.getElementById('loaderFlash');

  let startTime   = null;
  let pageLoaded  = false;
  let rafId       = null;

  /* --- rAF counter loop --- */
  function tickLoader(ts) {
    if (!startTime) startTime = ts;
    const elapsed  = ts - startTime;
    const rawPct   = Math.min(elapsed / MIN_DURATION, 1);
    // Ease-out so it feels organic, not mechanical
    const pct = 1 - Math.pow(1 - rawPct, 2);
    const val = Math.round(pct * 100);

    /* Counter text */
    if (counterEl) counterEl.textContent = String(val).padStart(3, '0');

    /* LED dots */
    const lit = Math.floor(pct * LED_COUNT);
    dots.forEach((d, i) => {
      if (i < lit) {
        d.className = 'led-dot on';
      } else if (i === lit) {
        d.className = 'led-dot on-dim';
      } else {
        d.className = 'led-dot';
      }
    });

    if (rawPct < 1 || !pageLoaded) {
      rafId = requestAnimationFrame(tickLoader);
    } else {
      exitLoader();
    }
  }

  /* --- Exit sequence: smooth fade into the site --- */
  function exitLoader() {
    gsap.to('#loader', {
      opacity: 0,
      scale: 1.015,
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: () => {
        const el = document.getElementById('loader');
        if (el) el.style.display = 'none';
        document.body.classList.remove('loading');
        initAnimations();
      }
    });
  }

  /* --- Start ticking immediately, mark page loaded when ready --- */
  requestAnimationFrame(tickLoader);

  window.addEventListener('load', () => {
    pageLoaded = true;
    // If rAF already stopped (edge case), exit now
    if (!rafId) exitLoader();
  });
})();


function initAnimations() {
  // Hero Typography Entrance
  gsap.fromTo('.hero-title .word', 
    { y: 50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
  );
  gsap.fromTo('.hero-subtitle',
    { opacity: 0 },
    { opacity: 1, duration: 1, delay: 0.5 }
  );

  initScrollTriggers();
  initTiltEffects();
  initCursor();
  initParticles();
  initTitleShuffle();
  initReadMore();
  initBuyDropdowns();
  initHeroStats();
  initQuickActions();
}

// =========================================================================
// BUY NOW DROPDOWN
// =========================================================================
function initBookControls() {
  initBuyDropdowns();
  initReadMore();
}

function initBuyDropdowns() {
  if (!document.body || document.body.dataset.buyDropdownsReady === 'true') return;
  document.body.dataset.buyDropdownsReady = 'true';

  // Toggle on trigger click
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.buy-dropdown-trigger');
    const allWraps = document.querySelectorAll('.buy-dropdown-wrap');

    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      const wrap = trigger.closest('.buy-dropdown-wrap');
      const isOpen = wrap.classList.contains('open');
      // Close every other open dropdown first
      allWraps.forEach(w => w.classList.remove('open'));
      // Toggle the clicked one
      if (!isOpen) wrap.classList.add('open');
    } else if (!e.target.closest('.buy-dropdown')) {
      // Click anywhere outside → close all
      allWraps.forEach(w => w.classList.remove('open'));
    }
  });

  // Escape key closes all
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.buy-dropdown-wrap.open')
        .forEach(w => w.classList.remove('open'));
    }
  });
}

// =========================================================================
// READ MORE TOGGLE
// =========================================================================
function initReadMore() {
  if (!document.body || document.body.dataset.readMoreReady === 'true') return;
  document.body.dataset.readMoreReady = 'true';

  const btns = document.querySelectorAll('.read-more-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const synopsis = btn.closest('.book-info').querySelector('.b-synopsis');
      if (synopsis) {
        synopsis.classList.toggle('expanded');
        if (synopsis.classList.contains('expanded')) {
          btn.textContent = 'Read Less';
        } else {
          btn.textContent = 'Read More';
        }
      }
    });
  });
}

// =========================================================================
// TITLE SHUFFLE
// =========================================================================
function initTitleShuffle() {
  const titleEl = document.querySelector('.hero-subtitle');
  if(!titleEl) return;
  
  const titles = ["VISUAL ENGINEER", "AUTHOR", "VISUAL STORYTELLER"];
  let index = 0;
  
  setInterval(() => {
    // Fade out
    gsap.to(titleEl, {
      opacity: 0, 
      y: -10,
      duration: 0.4, 
      onComplete: () => {
        index = (index + 1) % titles.length;
        titleEl.textContent = titles[index];
        // Fade in
        gsap.fromTo(titleEl, 
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 }
        );
      }
    });
  }, 3000);
}

// =========================================================================
// DYNAMIC BACKGROUND COLOR (ScrollTrigger)
// =========================================================================
function initScrollTriggers() {
  const bg = document.getElementById('dynamic-bg');
  
  // Base Hero Background (darkest)
  bg.style.backgroundColor = '#0d0e12';

  // For each book row, change the global background color when it hits center
  const rows = document.querySelectorAll('.book-row');
  
  rows.forEach((row, i) => {
    // Explicit z-index to ensure earlier rows render on top of later rows (for dropdowns)
    row.style.position = 'relative';
    row.style.zIndex = 100 - i;

    const bgColor = row.getAttribute('data-bg');
    
    ScrollTrigger.create({
      trigger: row,
      start: 'top 60%', // When top of row hits 60% of viewport
      end: 'bottom 60%',
      onEnter: () => {
        bg.style.backgroundColor = bgColor;
      },
      onEnterBack: () => {
        bg.style.backgroundColor = bgColor;
      },
      onLeaveBack: () => {
        // If leaving the first row back to hero, reset to hero color
        if(i === 0) bg.style.backgroundColor = '#0d0e12';
      }
    });

    let mm = gsap.matchMedia();
    const tiltWrap = row.querySelector('.book-tilt-wrap');
    const info = row.querySelector('.book-info');

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      let { isMobile } = context.conditions;
      let parallaxAmount = isMobile ? 20 : 100;
      let yOffset = isMobile ? 20 : 50;

      // Parallax on the Book Images
      if (tiltWrap) {
        gsap.fromTo(tiltWrap, 
          { y: parallaxAmount }, 
          {
            y: -parallaxAmount,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      }

      // Text Fade In
      if (info) {
        gsap.fromTo(info,
          { opacity: 0, y: yOffset, z: 100 },
          {
            opacity: 1, y: 0, z: 100, force3D: true,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: isMobile ? 'top 85%' : 'top 75%'
            }
          }
        );
      }
    });
  });
}

// =========================================================================
// 3D BOOK — float + hover tilt
// =========================================================================
function initTiltEffects() {
  const scenes   = document.querySelectorAll('.book-tilt-wrap');
  const REST_Y   = -22;  // resting angle — spine visible
  const HOVER_Y  = -8;   // angle on hover — more front visible
  const MAX_Y    = 12;   // extra Y swing from mouse X
  const MAX_X    = 4;    // X tilt from mouse Y

  scenes.forEach((scene, idx) => {
    const book   = scene.querySelector('.book-3d');
    const shadow = scene.querySelector('.book-floor-shadow');
    if (!book) return;

    // Gentle float — each book at a different phase so they don't all move in sync
    const floatTween = gsap.to(book, {
      y: -14,
      duration: 2.0 + idx * 0.18,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: idx * 0.35
    });

    // ---- Mouse enter: pause float, open toward viewer ----
    scene.addEventListener('mouseenter', () => {
      floatTween.pause();
      gsap.to(book, {
        rotateY: HOVER_Y,
        rotateX: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      if (shadow) gsap.to(shadow, {
        scaleX: 0.55, opacity: 0.25, duration: 0.5
      });
    });

    // ---- Mouse move: calm follow ----
    scene.addEventListener('mousemove', (e) => {
      const r  = scene.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(book, {
        rotateY: HOVER_Y + nx * MAX_Y * 2,
        rotateX: -ny  * MAX_X * 2,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    // ---- Mouse leave: spring back, resume float ----
    scene.addEventListener('mouseleave', () => {
      gsap.to(book, {
        rotateY: REST_Y,
        rotateX: 0,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => floatTween.resume()
      });
      if (shadow) gsap.to(shadow, {
        scaleX: 1, opacity: 1, duration: 0.9
      });
    });

    // ---- Touch: tap to peek front face, lift to return ----
    scene.addEventListener('touchstart', (e) => {
      floatTween.pause();
      const t  = e.touches[0];
      const r  = scene.getBoundingClientRect();
      const nx = (t.clientX - r.left) / r.width - 0.5;
      gsap.to(book, {
        rotateY: HOVER_Y + nx * MAX_Y,
        rotateX: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }, { passive: true });

    scene.addEventListener('touchend', () => {
      gsap.to(book, {
        rotateY: REST_Y,
        rotateX: 0,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => floatTween.resume()
      });
    }, { passive: true });
  }); // end forEach
} // end initTiltEffects

// =========================================================================
// CURSOR GLOW
// =========================================================================
function initCursor() {
  const cursor = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.3,
      ease: 'power2.out'
    });
  });
}

// Nav Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = this.getAttribute('href');
    if (target === '#') {
      lenis.scrollTo(0);
    } else {
      lenis.scrollTo(target);
    }
  });
});

// =========================================================================
// ABOUT SECTION — 3-STATE IDENTITY CARD (Author → VE → Film → repeat)
// =========================================================================
var cardState = 0; // 0=Author, 1=VE, 2=Film

var cardPhotos = [
  'assets/author_photo.jpg',
  'assets/author_photo_ve.jpg',
  'assets/author_photo_film.jpg'
];
var cardHints = [
  'Click to reveal',
  'Click to reveal',
  'Click to reveal'
];
var bioPanelIds = ['bioAuthor', 'bioVE', 'bioFilm'];

// Show first panel on load
window.addEventListener('DOMContentLoaded', function () {
  var first = document.getElementById('bioAuthor');
  if (first) first.classList.add('active');
});

function syncCardUI(state) {
  // Dots
  document.querySelectorAll('.card-dot').forEach(function(d) {
    d.classList.toggle('active', parseInt(d.dataset.index) === state);
  });
  // Labels
  document.querySelectorAll('.card-label').forEach(function(l) {
    l.classList.toggle('active', parseInt(l.dataset.index) === state);
  });
}

function toggleCard() {
  var cardInner = document.getElementById('authorCardInner');
  var cardImg   = document.getElementById('authorCardImg');
  if (!cardInner || !cardImg) return;

  // Step 1: Rotate card to edge (90deg) — half flip out
  cardInner.classList.add('flip-out');

  setTimeout(function () {
    // Step 2: At the edge — swap photo and bio
    var prevState = cardState;
    cardState = (cardState + 1) % 3;

    // Swap image
    cardImg.src = cardPhotos[cardState];

    // Swap bio panels
    var prevPanel = document.getElementById(bioPanelIds[prevState]);
    var nextPanel = document.getElementById(bioPanelIds[cardState]);
    if (prevPanel) prevPanel.classList.remove('active');
    if (nextPanel) nextPanel.classList.add('active');

    syncCardUI(cardState);

    // Step 3: Snap to -90deg (no transition), then animate back to 0
    cardInner.classList.remove('flip-out');
    cardInner.classList.add('flip-in');

    // Step 4: Force reflow then add transition back to 0
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cardInner.classList.remove('flip-in');
      });
    });

  }, 350); // matches flip-out transition duration
}

/* Jump directly to a specific identity state via dot click */
function goToCardState(target) {
  if (target === cardState) return;
  var cardInner = document.getElementById('authorCardInner');
  var cardImg   = document.getElementById('authorCardImg');
  if (!cardInner || !cardImg) return;

  cardInner.classList.add('flip-out');

  setTimeout(function () {
    var prevState = cardState;
    cardState = target;

    cardImg.src = cardPhotos[cardState];

    var prevPanel = document.getElementById(bioPanelIds[prevState]);
    var nextPanel = document.getElementById(bioPanelIds[cardState]);
    if (prevPanel) prevPanel.classList.remove('active');
    if (nextPanel) nextPanel.classList.add('active');

    syncCardUI(cardState);

    cardInner.classList.remove('flip-out');
    cardInner.classList.add('flip-in');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cardInner.classList.remove('flip-in');
      });
    });
  }, 350);
}



// =========================================================================
// FIREFLY PARTICLES
// =========================================================================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  // Mouse state
  let mouse = { x: -1000, y: -1000 };
  let mouseIdleFrames = 0;
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseIdleFrames = 0;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Touch interaction — so fingers attract/repel particles on mobile & tablet
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
    mouseIdleFrames = 0;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
    mouseIdleFrames = 0;
  }, { passive: true });
  document.addEventListener('touchend', () => {
    // Keep last position so idle-attract kicks in after finger lifts
    mouseIdleFrames = 0;
  }, { passive: true });

  // Track the bounding box of the hero typography so fireflies can cluster there
  let titleRect = { x: width/2, y: height/2, width: 200, height: 100 };
  function updateTitleRect() {
    const titleEl = document.querySelector('.hero-typography');
    if(titleEl) {
      const rect = titleEl.getBoundingClientRect();
      titleRect = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    updateTitleRect();
    init();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', updateTitleRect);
  
  class Firefly {
    constructor() {
      const isMobile = width < 768;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      // Slower drift on small screens so swarm looks deliberate, not frantic
      const spd = isMobile ? 0.7 : 1.0;
      this.vx = (Math.random() - 0.5) * 1.2 * spd;
      this.vy = (Math.random() - 0.5) * 1.2 * spd;
      
      // 15% of the swarm are highly-detailed insects, but all are the same small size
      this.isHero = Math.random() < 0.15;
      // Slightly larger radius on mobile so they show up on high-DPI screens
      this.radius = Math.random() * (isMobile ? 2.0 : 1.5) + (isMobile ? 0.8 : 0.5);
      
      this.blinkPhase = Math.random() * Math.PI * 2;
      this.blinkSpeed = Math.random() * 0.02 + 0.01;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.8 + 0.4;
      // Fireflies no longer swarm the title, the butterfly does
      this.isTitleAttracted = false;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Gentle sine wave movement
      this.x += Math.sin(this.blinkPhase) * 0.2;
      this.y += Math.cos(this.blinkPhase) * 0.2;
      
      this.blinkPhase += this.blinkSpeed;
      this.wingPhase += this.wingSpeed;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Interaction Logic
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distToMouse = Math.sqrt(dx*dx + dy*dy);
      
      if (distToMouse < 300) {
        let force = (300 - distToMouse) / 300;
        if (mouseIdleFrames > 30) {
          // If mouse is at rest (idle for > 0.5 seconds), attract them!
          this.x += dx * force * 0.02;
          this.y += dy * force * 0.02;
        } else {
          // If mouse is moving, gently repel them
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
        }
      }

      // Title Attraction Logic
      if (this.isTitleAttracted) {
        // Target a random point inside the title bounding box
        let targetX = titleRect.x + (Math.sin(this.blinkPhase*2) * 0.5 + 0.5) * titleRect.width;
        let targetY = titleRect.y + (Math.cos(this.blinkPhase*2) * 0.5 + 0.5) * titleRect.height;
        
        let tx = targetX - this.x;
        let ty = targetY - this.y;
        let distToTitle = Math.sqrt(tx*tx + ty*ty);
        
        if(distToTitle > 20 && distToTitle < 500) {
           this.x += tx * 0.005;
           this.y += ty * 0.005;
        }
      }
    }
    draw() {
      let alpha = (Math.sin(this.blinkPhase) + 1) / 2; // 0 to 1
      alpha = alpha * 0.8 + 0.1; // 0.1 to 0.9

      if (!this.isHero) {
        // Simple dot for background swarm
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.5})`;
        ctx.fill();
        return;
      }

      // Detailed realistic insect for Hero fireflies
      let angle = Math.atan2(this.vy, this.vx);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(angle);
      
      let scale = this.radius * 0.6;
      ctx.scale(scale, scale);

      // Glowing Abdomen (Back)
      ctx.beginPath();
      ctx.ellipse(-2, 0, 3, 1.5, 0, 0, Math.PI * 2);
      let grad = ctx.createRadialGradient(-2, 0, 0, -2, 0, 4);
      grad.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
      grad.addColorStop(0.4, `rgba(212, 175, 55, ${alpha})`);
      grad.addColorStop(1, `rgba(212, 175, 55, 0)`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Thorax & Head
      ctx.fillStyle = "rgba(20, 15, 5, 0.9)";
      ctx.beginPath();
      ctx.ellipse(1, 0, 1.5, 1.2, 0, 0, Math.PI * 2); // Thorax
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, 0, 0.8, 0, Math.PI * 2); // Head
      ctx.fill();

      // Antennae
      ctx.strokeStyle = "rgba(20, 15, 5, 0.8)";
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(3.5, -0.3);
      ctx.quadraticCurveTo(4.5, -1.5, 5, -1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3.5, 0.3);
      ctx.quadraticCurveTo(4.5, 1.5, 5, 1);
      ctx.stroke();

      // Wings (4 realistic wings)
      let flap = Math.sin(this.wingPhase); 
      let wingAngle = flap * (Math.PI / 4);
      
      ctx.fillStyle = "rgba(220, 240, 255, 0.6)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 0.1;

      // Top wing
      ctx.save();
      ctx.translate(1, -0.5);
      ctx.rotate(wingAngle - 0.2);
      ctx.beginPath();
      ctx.ellipse(-1.5, -2, 3, 1, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bottom wing
      ctx.save();
      ctx.translate(1, 0.5);
      ctx.rotate(-wingAngle + 0.2);
      ctx.beginPath();
      ctx.ellipse(-1.5, 2, 3, 1, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    }
  }

  // ==========================================
  // BUTTERFLY CLASS
  // ==========================================
  class Butterfly {
    constructor() {
      this.x = width / 2;
      this.y = height / 2;
      this.vx = 1;
      this.vy = 1;
      this.wingPhase = 0;
      this.wingSpeed = 0.2; // Majestic flap
      this.angle = 0;
      this.orbitAngle = Math.random() * Math.PI * 2;
    }
    update() {
      this.orbitAngle += 0.01;
      
      let targetX = titleRect.x + titleRect.width/2 + Math.cos(this.orbitAngle) * (titleRect.width/2 + 50);
      let targetY = titleRect.y + titleRect.height/2 + Math.sin(this.orbitAngle * 1.5) * 80;
      
      let dx = targetX - this.x;
      let dy = targetY - this.y;
      
      this.vx += dx * 0.0015;
      this.vy += dy * 0.0015;
      
      this.vx *= 0.96;
      this.vy *= 0.96;
      
      this.x += this.vx;
      this.y += this.vy;
      
      // Face movement direction
      this.angle = Math.atan2(this.vy, this.vx);
      this.wingPhase += this.wingSpeed;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      
      // Scale
      ctx.scale(3, 3);
      
      let flap = Math.sin(this.wingPhase); // -1 to 1
      let wingAngle = flap * (Math.PI / 3); // max 60 deg flap
      
      // Body
      ctx.fillStyle = "rgba(100, 80, 20, 1)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
      ctx.shadowBlur = width > 768 ? 15 : 0;
      ctx.shadowColor = "rgba(255, 215, 0, 1)";

      // Forewing (Left)
      ctx.save();
      ctx.translate(1, -0.5);
      ctx.rotate(wingAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(2, -4, -4, -6, -2, -1);
      ctx.fill();
      ctx.restore();

      // Forewing (Right)
      ctx.save();
      ctx.translate(1, 0.5);
      ctx.rotate(-wingAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(2, 4, -4, 6, -2, 1);
      ctx.fill();
      ctx.restore();

      // Hindwing (Left)
      ctx.save();
      ctx.translate(-0.5, -0.5);
      ctx.rotate(wingAngle * 0.8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-1, -3, -4, -3, -1, 0);
      ctx.fill();
      ctx.restore();

      // Hindwing (Right)
      ctx.save();
      ctx.translate(-0.5, 0.5);
      ctx.rotate(-wingAngle * 0.8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-1, 3, -4, 3, -1, 0);
      ctx.fill();
      ctx.restore();
      
      ctx.restore();
    }
  }

  let butterflies = [];

  function init() {
    particles = [];
    butterflies = [];

    const isMobile = width < 768;
    const isTablet = width < 1024;
    // Optimize counts so canvas performs well
    const divisor = isMobile ? 12000 : isTablet ? 9000 : 7000;
    const minCount = isMobile ? 20 : isTablet ? 40 : 80;
    let numParticles = Math.max(minCount, Math.floor((width * height) / divisor));

    for(let i = 0; i < numParticles; i++) {
      particles.push(new Firefly());
    }

    // Add back the original canvas butterflies
    butterflies.push(new Butterfly());
    butterflies.push(new Butterfly());
    butterflies.push(new Butterfly());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    mouseIdleFrames++;
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    
    for (let i = 0; i < butterflies.length; i++) {
      butterflies[i].update();
      butterflies[i].draw();
    }
    
    requestAnimationFrame(animateParticles);
  }

  resize();
  setTimeout(updateTitleRect, 500); // Initial calculate
  animateParticles();
}

// =========================================================================
// FILM POLAROID GALLERY — data + builder + lightbox
// =========================================================================
const reviews = [
  {
    rating: 5,
    name: 'Verified Purchase',
    source: 'Amazon',
    url: 'https://amzn.in/d/dBEmMcn',
    text: '"An incredible start to a sci-fi saga! The concepts of time and the universe are explored beautifully in LOOPED. The pacing kept me hooked from start to finish."'
  },
  {
    rating: 5,
    name: 'Amazon Customer',
    source: 'Amazon.in',
    url: 'https://www.amazon.in/AMMAS-LOVE-Journey-Sathyaraj-Natarajan-ebook/dp/B0BVGFJZBZ',
    text: '"A deeply emotional and touching collection of poems. It perfectly captures the silent sacrifices of a mother. I found myself relating to so many of these verses."'
  },
  {
    rating: 5,
    name: 'Kindle Reader',
    source: 'Amazon',
    url: 'https://www.amazon.in/Between-Noise-Silence-Psychological-Slice-ebook/dp/B0GJ7713KV',
    text: '"A poignant psychological journey. It perfectly captures the unseen struggles of everyday people behind their ordinary routines. Highly recommended read."'
  }
];
const pressMentions = [];
const bookSampleLinks = {};
const loopedProofAsset = '';
const portfolioCategoryOverrides = {
  0: 'restoration',
  1: 'restoration',
  2: 'restoration',
  3: 'restoration',
  4: 'restoration',
  5: 'restoration',
  65: 'restoration'
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getGalleryCategory(item, index) {
  if (portfolioCategoryOverrides[index]) return portfolioCategoryOverrides[index];
  if (item.category) return item.category;
  const label = (item.label || '').toLowerCase();
  if (item.type === 'video') return 'live';
  if (label.includes('backstage') || label.includes('visual') || label.includes('stage prep') || label.includes('system') || label.includes('pxl')) {
    return 'live';
  }
  return 'live';
}

function enrichGalleryItem(item, index) {
  const category = getGalleryCategory(item, index);
  const label = item.label || `Portfolio Item ${index + 1}`;
  const roleByCategory = {
    live: 'Visual Production - LED & Stage Visuals',
    restoration: 'Film Restoration - Archive Workflow'
  };
  const descriptionByCategory = {
    live: 'Archive material from live visual engineering, LED setup, stage visuals, and cinematic event coverage.',
    restoration: 'Archive and restoration-related material from film workflow, review, and preservation environments.'
  };
  return {
    ...item,
    galleryIndex: index,
    category,
    project: item.project || label,
    role: item.role || roleByCategory[category],
    description: item.description || descriptionByCategory[category]
  };
}

const galleryItems = [
  { src: 'assets/gallery/IMG_20250224_202511836.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20250401_030742785.jpg', type: 'image', label: 'Stage Visual' },
  { src: 'assets/gallery/IMG_20250417_201520473.jpg', type: 'image', label: 'LED Install' },
  { src: 'assets/gallery/IMG_20250425_070034344.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/IMG_20250505_215246239.jpg', type: 'image', label: 'Showcase' },
  { src: 'assets/gallery/IMG_20250517_150910200.jpg', type: 'image', label: 'Stage Prep' },
  { src: 'assets/gallery/IMG_20250620_145308928.jpg', type: 'image', label: 'System Setup' },
  { src: 'assets/gallery/IMG_20250620_191405996.jpg', type: 'image', label: 'Backstage' },
  { src: 'assets/gallery/IMG_20250624_155151996.jpg', type: 'image', label: 'LED Stage' },
  { src: 'assets/gallery/IMG_20250624_174715237.jpg', type: 'image', label: 'Event Tech' },
  { src: 'assets/gallery/IMG_20250629_160229095.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20250704_131355815.jpg', type: 'image', label: 'LED Setup' },
  { src: 'assets/gallery/IMG_20250712_083346611.jpg', type: 'image', label: 'Stage Visual' },
  { src: 'assets/gallery/IMG_20250719_185457917.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/IMG_20250808_120341946.jpg', type: 'image', label: 'Live Visuals' },
  { src: 'assets/gallery/IMG_20250820_042417787~2.jpg', type: 'image', label: 'LED Stage' },
  { src: 'assets/gallery/IMG_20250829_052245824.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20250829_074406078.jpg', type: 'image', label: 'System Config' },
  { src: 'assets/gallery/IMG_20250911_132459781.jpg', type: 'image', label: 'Event Visual' },
  { src: 'assets/gallery/IMG_20250913_212617876.jpg', type: 'image', label: 'Stage Setup' },
  { src: 'assets/gallery/IMG_20250914_213427089.jpg', type: 'image', label: 'LED Event' },
  { src: 'assets/gallery/IMG_20251008_184025198.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20251104_185816185.jpg', type: 'image', label: 'Biryani Queen' },
  { src: 'assets/gallery/IMG_20251105_113216650.jpg', type: 'image', label: 'Stage Visual' },
  { src: 'assets/gallery/IMG_20251107_090222923.jpg', type: 'image', label: 'LED Install' },
  { src: 'assets/gallery/IMG_20251114_014455353.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/IMG_20251129_203102576.jpg', type: 'image', label: 'Showcase' },
  { src: 'assets/gallery/IMG_20251130_180532286.jpg', type: 'image', label: 'Setup' },
  { src: 'assets/gallery/IMG_20251219_132721613.jpg', type: 'image', label: 'Live Ops' },
  { src: 'assets/gallery/IMG_20251219_143221701.jpg', type: 'image', label: 'LED Wall' },
  { src: 'assets/gallery/IMG_20251222_210358557.jpg', type: 'image', label: 'Stage Visuals' },
  { src: 'assets/gallery/IMG_20251226_181609647.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20260104_033301763.jpg', type: 'image', label: 'LED Event' },
  { src: 'assets/gallery/IMG_20260104_170619331.jpg', type: 'image', label: 'Stage Setup' },
  { src: 'assets/gallery/IMG_20260123_140206939.jpg', type: 'image', label: 'Live Visual' },
  { src: 'assets/gallery/IMG_20260123_141956171.jpg', type: 'image', label: 'System Ops' },
  { src: 'assets/gallery/IMG_20260123_143758530.jpg', type: 'image', label: 'LED Stage' },
  { src: 'assets/gallery/IMG_20260124_154844925.jpg', type: 'image', label: 'Live Show' },
  { src: 'assets/gallery/IMG_20260124_171912159.jpg', type: 'image', label: 'Event Visual' },
  { src: 'assets/gallery/IMG_20260129_150012413.jpg', type: 'image', label: 'Stage Prep' },
  { src: 'assets/gallery/IMG_20260130_093457074.jpg', type: 'image', label: 'Setup' },
  { src: 'assets/gallery/IMG_20260202_172303925.jpg', type: 'image', label: 'Peruma Talks' },
  { src: 'assets/gallery/IMG_20260202_202634576.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/IMG_20260204_011410940.jpg', type: 'image', label: 'LED Wall' },
  { src: 'assets/gallery/IMG_20260206_231913959.jpg', type: 'image', label: 'Stage Visual' },
  { src: 'assets/gallery/IMG_20260212_000147137.jpg', type: 'image', label: 'LED Event' },
  { src: 'assets/gallery/IMG_20260212_144338064.jpg', type: 'image', label: 'PXL Setup' },
  { src: 'assets/gallery/IMG_20260212_170714121.jpg', type: 'image', label: 'Stage Show' },
  { src: 'assets/gallery/IMG_20260212_191218382.jpg', type: 'image', label: 'Nakshatra' },
  { src: 'assets/gallery/IMG_20260212_191526739.jpg', type: 'image', label: 'Nakshatra 2025' },
  { src: 'assets/gallery/IMG_20260214_185147392.jpg', type: 'image', label: 'Live Visual' },
  { src: 'assets/gallery/IMG_20260218_121754670.jpg', type: 'image', label: 'Stage Setup' },
  { src: 'assets/gallery/IMG_20260219_234453166.jpg', type: 'image', label: 'LED Show' },
  { src: 'assets/gallery/IMG_20260306_112015277.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/IMG_20260307_081805186.jpg', type: 'image', label: 'Stage Visual' },
  { src: 'assets/gallery/IMG_20260307_081941628.jpg', type: 'image', label: 'LED Wall' },
  { src: 'assets/gallery/IMG_20260312_234852765.jpg', type: 'image', label: 'Live Ops' },
  { src: 'assets/gallery/IMG_20260315_203120177.jpg', type: 'image', label: 'Stage Show' },
  { src: 'assets/gallery/IMG_20260318_115444058.jpg', type: 'image', label: 'LED Event' },
  { src: 'assets/gallery/IMG_20260324_162245369.jpg', type: 'image', label: 'Visual Ops' },
  { src: 'assets/gallery/IMG_20260327_180844514.jpg', type: 'image', label: 'Stage Setup' },
  { src: 'assets/gallery/IMG_20260331_065653320.jpg', type: 'image', label: 'LED Show' },
  { src: 'assets/gallery/IMG_20260502_151324704.jpg', type: 'image', label: 'Live Event' },
  { src: 'assets/gallery/PXL_20250714_195041317.jpg',  type: 'image', label: 'System Ops' },
  { src: 'assets/gallery/PXL_20250927_220203784.jpg',  type: 'image', label: 'Live Visual' },
  { src: 'assets/gallery/VID_20250524_060726826.mp4',  type: 'video', label: 'Restoration Footage', poster: 'assets/gallery/IMG_20250517_150910200.jpg' },
  { src: 'assets/gallery/VID_20250630_195411301.mp4',  type: 'video', label: 'Live Footage', poster: 'assets/gallery/IMG_20250629_160229095.jpg' }
];

const portfolioItems = galleryItems.map((item, index) => enrichGalleryItem(item, index));
const polaroidRotations = [-2.5, 1.8, -1.2, 3.1, -3.5, 2.2, -1.7, 2.8, -3.2, 1.5, -2.1, 3.4, -1.9, 2.6, -3.0, 1.3];
let lightboxCurrentIndex = 0;

/* Build two infinite-rolling film tracks (duplicated for seamless loop) */
function buildFilmStrip() {
  ['filmTrack1', 'filmTrack2'].forEach((trackId, trackIdx) => {
    const track = document.getElementById(trackId);
    if (!track) return;

    // Duplicate items for seamless infinite loop (-50% translate trick)
    const liveItems = portfolioItems.filter(item => item.category === 'live');
    const doubled = [...liveItems, ...liveItems];

    doubled.forEach((item, i) => {
      const frame = document.createElement('div');
      frame.className = 'film-frame';
      const safeLabel = escapeHtml(item.project || item.label);

      if (item.type === 'video') {
        frame.innerHTML = `
          <video muted playsinline preload="none" src="${item.src}"></video>
          <div class="film-play-badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="film-frame-label">${safeLabel}</div>`;
      } else {
        frame.innerHTML = `
          <img src="${item.src}" loading="lazy" alt="${safeLabel}" draggable="false">
          <div class="film-frame-label">${safeLabel}</div>`;
      }

      frame.addEventListener('click', () => openGalleryLightbox(item.galleryIndex));
      track.appendChild(frame);
    });
  });
}

/* Fill film rails with sprocket-hole divs */
function buildFilmRails() {
  ['filmRailTop', 'filmRailMid', 'filmRailBot'].forEach(id => {
    const rail = document.getElementById(id);
    if (!rail) return;
    const count = Math.ceil(window.innerWidth / 26) + 12;
    for (let i = 0; i < count; i++) {
      const hole = document.createElement('div');
      hole.className = 'sprocket-hole';
      rail.appendChild(hole);
    }
  });
}

/* Drag-to-scroll — REMOVED (auto-rolling strip doesn't need drag scroll) */

function renderProjectCards(targetId, category, limit = 6) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const items = portfolioItems
    .map((item, index) => ({ ...item, index }))
    .filter(item => item.category === category && item.type !== 'video')
    .slice(0, limit);

  target.innerHTML = items.map(item => `
    <button class="project-card media-project-card" type="button" data-gallery-index="${item.index}">
      <span class="project-thumb">
        <img src="${item.src}" loading="lazy" alt="Portfolio item">
      </span>
    </button>
  `).join('');

  target.querySelectorAll('[data-gallery-index]').forEach(card => {
    card.addEventListener('click', () => openGalleryLightbox(Number(card.dataset.galleryIndex)));
  });
}

function renderPortfolioCards() {
  renderProjectCards('liveProjectGrid', 'live', 12);
  renderVideoFeatures('liveVideoShowcase', 'live');
  renderProjectCards('restorationProjectGrid', 'restoration', 6);
  renderVideoFeatures('restorationVideoShowcase', 'restoration');
}

function renderVideoFeatures(targetId, category) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const videos = portfolioItems
    .filter(item => item.category === category && item.type === 'video');

  target.hidden = videos.length === 0;
  target.innerHTML = videos.map(item => `
    <article class="video-feature">
      <video controls preload="metadata" ${item.poster ? `poster="${item.poster}"` : ''}>
        <source src="${item.src}" type="video/mp4" />
      </video>
    </article>
  `).join('');
}

function activatePortfolioTab(tabName) {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!buttons.length || !panels.length) return;

  buttons.forEach(button => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach(panel => {
    const isActive = panel.dataset.panel === tabName;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
    if (isActive && window.gsap) {
      gsap.fromTo(panel, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
    }
  });
}

function initPortfolioTabs() {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => activatePortfolioTab(button.dataset.tab));
  });
}

function renderProofSections() {
  const reviewSection = document.getElementById('readerReviews');
  const reviewCarousel = document.getElementById('reviewCarousel');
  if (reviewSection && reviewCarousel && reviews.length) {
    const cards = reviews.map(review => `
      <article class="review-card">
        <div class="review-stars">${Number(review.rating) > 0 ? '&#9733;'.repeat(Number(review.rating)) : 'Rating data only'}</div>
        <p>${escapeHtml(review.text)}</p>
        ${review.url
          ? `<a href="${escapeHtml(review.url)}" target="_blank" rel="noopener">${escapeHtml(review.name || 'Reader')} - ${escapeHtml(review.source || 'Verified reader')}</a>`
          : `<span>${escapeHtml(review.name || 'Reader')} - ${escapeHtml(review.source || 'Verified reader')}</span>`}
      </article>
    `).join('');
    reviewCarousel.innerHTML = cards + cards;
    reviewSection.hidden = false;
  }

  const pressSection = document.getElementById('pressMentions');
  const pressList = document.getElementById('pressList');
  if (pressSection && pressList && pressMentions.length) {
    pressList.innerHTML = pressMentions.map(item => `
      <a href="${item.url}" target="_blank" rel="noopener">${escapeHtml(item.source)}</a>
    `).join('');
    pressSection.hidden = false;
  }
}

function initLoopedProof() {
  if (!loopedProofAsset) return;
  const card = document.getElementById('loopedProofCard');
  const img = document.getElementById('loopedProofImg');
  if (!card || !img) return;
  img.src = loopedProofAsset;
  card.hidden = false;
}

function renderSampleLinks() {
  Object.entries(bookSampleLinks).forEach(([bookKey, url]) => {
    if (!url) return;
    const row = document.querySelector(`[data-book-key="${bookKey}"]`);
    const actions = row ? row.querySelector('.b-actions') : null;
    if (!actions) return;
    const link = document.createElement('a');
    link.className = 'b-btn sample-btn';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Read First Chapter';
    actions.appendChild(link);
  });
}

function scrollToTarget(target) {
  if (!target || target === '#') {
    lenis.scrollTo(0);
    return;
  }
  const element = document.querySelector(target);
  if (!element) return;
  lenis.scrollTo(element, { offset: -70 });
}

function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"], [data-scroll-target]').forEach(link => {
    link.addEventListener('click', event => {
      const target = link.dataset.scrollTarget || link.getAttribute('href');
      if (!target || target === 'javascript:void(0)') return;
      event.preventDefault();
      if (link.dataset.openTab) activatePortfolioTab(link.dataset.openTab);
      scrollToTarget(target);
    });
  });
}

function initInlineNewsletter() {
  const form = document.getElementById('inlineNlForm');
  const success = document.getElementById('inlineNlSuccess');
  const btn = document.getElementById('inlineNlSubmit');
  const input = document.getElementById('inlineNlEmail');
  if (!form || !success || !btn || !input) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('server');
      form.hidden = true;
      success.hidden = false;
    } catch {
      window.location.href =
        'mailto:thisissamayah@gmail.com?subject=Newsletter%20Subscription&body=Please%20add%20' +
        encodeURIComponent(input.value) + '%20to%20your%20newsletter.';
      btn.textContent = 'Notify Me';
      btn.disabled = false;
    }
  });
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => lenis.scrollTo(0));
}

function initQuickActions() {
  const bar = document.getElementById('quickActions');
  const footer = document.getElementById('footerContainer');
  if (!bar || !footer || !window.ScrollTrigger) return;

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom bottom',
    endTrigger: footer,
    end: 'top bottom',
    onEnter: () => bar.classList.add('visible'),
    onEnterBack: () => bar.classList.add('visible'),
    onLeave: () => bar.classList.remove('visible'),
    onLeaveBack: () => bar.classList.remove('visible')
  });
}

function initHeroStats() {
  const stats = document.querySelectorAll('.hero-stat-number');
  if (!stats.length || !window.ScrollTrigger) return;

  ScrollTrigger.create({
    trigger: '.hero-stats',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      stats.forEach(stat => {
        const target = Number(stat.dataset.count || stat.textContent.replace(/\D/g, ''));
        const prefix = stat.dataset.prefix || '';
        const suffix = stat.dataset.suffix || '';
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            stat.textContent = `${prefix}${Math.round(state.value)}${suffix}`;
          }
        });
      });
    }
  });
}

/* Open lightbox */
function openGalleryLightbox(index) {
  lightboxCurrentIndex = index;
  renderLightboxContent();
  const lb = document.getElementById('galleryLightbox');
  if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

/* Render image or video for current index */
function renderLightboxContent() {
  const item   = portfolioItems[lightboxCurrentIndex];
  const media   = document.getElementById('lightboxMedia');
  const caption = document.getElementById('lightboxCaption');

  const prevVid = media.querySelector('video');
  if (prevVid) prevVid.pause();
  media.innerHTML = '';

  if (item.type === 'video') {
    const v = document.createElement('video');
    v.controls = true; v.autoplay = true; v.playsInline = true;
    v.src = item.src;
    media.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = item.src; img.alt = item.project || item.label;
    media.appendChild(img);
  }

  if (caption) {
    const label = item.project || item.label;
    const meta = item.role ? ` - ${item.role}` : '';
    caption.textContent = `${label}${meta} - ${lightboxCurrentIndex + 1} / ${portfolioItems.length}`;
  }
}

/* Close lightbox */
function closeGalleryLightbox() {
  const lb    = document.getElementById('galleryLightbox');
  const media = document.getElementById('lightboxMedia');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
  const v = media ? media.querySelector('video') : null;
  if (v) v.pause();
  setTimeout(() => { if (media) media.innerHTML = ''; }, 300);
}

/* Wire up gallery controls on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  buildFilmStrip();
  buildFilmRails();
  renderPortfolioCards();
  initPortfolioTabs();
  renderProofSections();
  initLoopedProof();
  renderSampleLinks();
  initSmoothScrollLinks();
  initInlineNewsletter();
  initBackToTop();

  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn  = document.getElementById('lightboxPrev');
  const nextBtn  = document.getElementById('lightboxNext');
  const lb       = document.getElementById('galleryLightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeGalleryLightbox);

  if (prevBtn) prevBtn.addEventListener('click', () => {
    lightboxCurrentIndex = (lightboxCurrentIndex - 1 + portfolioItems.length) % portfolioItems.length;
    renderLightboxContent();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    lightboxCurrentIndex = (lightboxCurrentIndex + 1) % portfolioItems.length;
    renderLightboxContent();
  });

  if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeGalleryLightbox(); });

  document.addEventListener('keydown', e => {
    const l = document.getElementById('galleryLightbox');
    if (!l || !l.classList.contains('open')) return;
    if (e.key === 'Escape') closeGalleryLightbox();
    if (e.key === 'ArrowLeft') {
      lightboxCurrentIndex = (lightboxCurrentIndex - 1 + portfolioItems.length) % portfolioItems.length;
      renderLightboxContent();
    }
    if (e.key === 'ArrowRight') {
      lightboxCurrentIndex = (lightboxCurrentIndex + 1) % portfolioItems.length;
      renderLightboxContent();
    }
  });
});


// =========================================================================
// SCROLL PROGRESS BAR
// =========================================================================
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
})();


// =========================================================================
// WRITING JOURNEY TIMELINE — SCROLL REVEAL
// =========================================================================
(function initJourneyReveal() {
  document.querySelectorAll('.js-reveal-left, .js-reveal-right').forEach(el => {
    const fromLeft = el.classList.contains('js-reveal-left');
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 0.75,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });
})();


// =========================================================================
// NEWSLETTER FORM
// =========================================================================
(function initNewsletter() {
  const form    = document.getElementById('nlForm');
  const success = document.getElementById('nlSuccess');
  const btn     = document.getElementById('nlSubmit');
  if (!form || !success || !btn) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.textContent = 'Sending…';
    btn.disabled    = true;
    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.style.display      = 'none';
        success.style.display   = 'flex';
      } else {
        throw new Error('server');
      }
    } catch {
      // Graceful fallback — open mailto
      const email = document.getElementById('nlEmail').value;
      window.location.href =
        'mailto:thisissamayah@gmail.com?subject=Newsletter%20Subscription&body=Please%20add%20' +
        encodeURIComponent(email) + '%20to%20your%20newsletter.';
      btn.textContent = 'Subscribe';
      btn.disabled    = false;
    }
  });
})();


// =========================================================================
// AMBIENT CINEMATIC ATMOSPHERE  — Audio File
// =========================================================================
(function initAmbientSound() {
  const btn = document.getElementById('ambientToggle');
  if (!btn) return;

  let audio = new Audio('assets/bg-noise.mp3');
  audio.loop = true;
  audio.volume = 0;
  let isPlaying = false;
  let fadeInterval;

  function fadeIn() {
    clearInterval(fadeInterval);
    audio.play().catch(e => console.log('Audio play failed:', e));
    fadeInterval = setInterval(() => {
      if (audio.volume < 0.95) {
        audio.volume += 0.05;
      } else {
        audio.volume = 1;
        clearInterval(fadeInterval);
      }
    }, 200);
  }
  
  function fadeOut(cb) {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume -= 0.05;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeInterval);
        if (cb) cb();
      }
    }, 200);
  }

  btn.addEventListener('click', () => {
    if (!isPlaying) {
      isPlaying = true;
      btn.classList.add('active');
      btn.title = 'Mute cinematic ambience';
      fadeIn();
    } else {
      isPlaying = false;
      btn.classList.remove('active');
      btn.title = 'Play cinematic ambience';
      fadeOut();
    }
  });
})();

// =========================================================================
// MOBILE HAMBURGER MENU
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
});


// =========================================================================
// INTERVIEW MODAL LOGIC
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById('interviewBadge');
  const modal = document.getElementById('interviewModal');
  const closeBtn = document.getElementById('interviewClose');
  const backdrop = document.getElementById('interviewModalCloseBg');
  
  if(badge && modal && closeBtn && backdrop) {
    const openModal = () => {
      modal.classList.add('active');
      // Pause ambient audio if it's playing
      const audio = document.getElementById('ambient-audio');
      if (audio && !audio.paused) {
        audio.pause();
        audio.dataset.wasPlaying = "true";
      }
      // Pause Lenis scrolling
      if(window.lenis) window.lenis.stop();
    };

    const closeModal = () => {
      modal.classList.remove('active');
      // Resume ambient audio if it was playing
      const audio = document.getElementById('ambient-audio');
      if (audio && audio.dataset.wasPlaying === "true") {
        audio.play().catch(e => console.log("Audio play prevented:", e));
        audio.dataset.wasPlaying = "false";
      }
      // Resume Lenis scrolling
      if(window.lenis) window.lenis.start();
    };

    badge.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
  }
});
