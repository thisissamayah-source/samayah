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
// LOADER & INIT
// =========================================================================
window.addEventListener('load', () => {
  // Simple loader progress animation
  gsap.to('.loader-progress', { 
    width: '100%', 
    duration: 1, 
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to('#loader', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          document.getElementById('loader').style.display = 'none';
          document.body.classList.remove('loading');
          initAnimations();
        }
      });
    }
  });
});

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
}

// =========================================================================
// READ MORE TOGGLE
// =========================================================================
function initReadMore() {
  const btns = document.querySelectorAll('.read-more-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
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

    // Parallax on the Book Images
    const tiltWrap = row.querySelector('.book-tilt-wrap');
    gsap.fromTo(tiltWrap, 
      { y: 100 }, 
      {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: row,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );

    // Text Fade In
    const info = row.querySelector('.book-info');
    gsap.fromTo(info,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 75%'
        }
      }
    );
  });
}

// =========================================================================
// 3D TILT HOVER EFFECTS (Books)
// =========================================================================
function initTiltEffects() {
  const tiltWraps = document.querySelectorAll('.book-tilt-wrap');
  
  tiltWraps.forEach(wrap => {
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left; // x pos within the element
      const y = e.clientY - rect.top;  // y pos within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -40; // Max 40deg
      const rotateY = ((x - centerX) / centerX) * 40;
      
      gsap.to(wrap, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1200
      });
    });
    
    wrap.addEventListener('mouseleave', () => {
      gsap.to(wrap, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  });
}

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
    lenis.scrollTo(this.getAttribute('href'));
  });
});

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
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      
      // 15% of the swarm are highly-detailed insects, but all are the same small size
      this.isHero = Math.random() < 0.15;
      this.radius = Math.random() * 1.5 + 0.5;
      
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
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(212, 175, 55, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
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
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(212, 175, 55, ${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

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
      ctx.shadowBlur = 15;
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
    
    let numParticles = Math.floor((width * height) / 6000); // Dense swarm
    for(let i=0; i<numParticles; i++) {
      particles.push(new Firefly());
    }
    
    // Add 2 highly realistic majestic golden butterflies
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
