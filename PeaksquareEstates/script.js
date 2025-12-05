// ---------------------------------------------------
// 1. SETUP SMOOTH SCROLL (LENIS)
// ---------------------------------------------------
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate with GSAP
if (typeof ScrollTrigger !== "undefined") {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
}

// ---------------------------------------------------
// 2. DISABLE CUSTOM CURSOR ON MOBILE
// ---------------------------------------------------
if (window.innerWidth < 768) {
  const elements = document.querySelectorAll('.cursor-lux, .cursor-ripple, .particles');
  elements.forEach(el => { if(el) el.style.display = 'none'; });
}

// ---------------------------------------------------
// 3. FORM SUBMIT HANDLER
// ---------------------------------------------------
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyoRil7QPM5Fuo59C8-sDZ4biUYNVonjY3UJMrV9Qq2FUFDt4psuMkAMYyk_JG-UMy33w/exec",
        { method: "POST", body: formData }
      );
      if (res.ok) {
        window.location.href = "thankyou.html";
        contactForm.reset();
      } else {
        alert("Submission failed — please try again.");
      }
    } catch (err) {
      console.warn("Form submit error:", err);
      alert("Network error. Try again later.");
    }
  });
}

// ---------------------------------------------------
// 4. GSAP ANIMATIONS
// ---------------------------------------------------
(function initAnimations() {
  try {
    if (typeof gsap === "undefined") throw new Error("GSAP missing");
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline();
    
    tl.from(".brand", { opacity: 0, y: -20, duration: 0.2, ease: "power3.out" })
      .from(".header", { opacity: 1, y: -10, duration: 0.8, ease: "power3.out" })
      .from(".hero-form-wrapper", { 
          opacity: 0, 
          x: 40, 
          duration: 1, 
          ease: "power3.out" 
      }, "-=0.5");

    gsap.utils.toArray(".fade-up").forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, scroller: document.body, start: "top 95%", immediateRender: true }
      });
    });

    gsap.fromTo(
      ".mask-reveal span",
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.3 }
    );

    // Cursor Logic
    if (window.innerWidth >= 768) {
      const lux = document.querySelector(".cursor-lux");
      const ripple = document.querySelector(".cursor-ripple");
      const particleContainer = document.querySelector(".particles");

      if (lux && ripple && particleContainer) {
        let cursorVisible = false;
        let lastParticleTime = 0;

        document.addEventListener("mousemove", (e) => {
          if (!cursorVisible) {
            lux.style.opacity = 1;
            ripple.style.opacity = 1;
            cursorVisible = true;
          }
          const now = performance.now();
          if (now - lastParticleTime > 30) {
            gsap.to(lux, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power3.out" });
            gsap.to(ripple, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power3.out" });
            createParticle(e.clientX, e.clientY);
            lastParticleTime = now;
          }
        });

        document.querySelectorAll("a, button, .project-card, p, h1, h2, h3, h4, span, input, select")
          .forEach((el) => {
            el.addEventListener("mouseenter", () => lux.classList.add("active"));
            el.addEventListener("mouseleave", () => lux.classList.remove("active"));
          });

        document.addEventListener("click", () => {
          gsap.fromTo(ripple, { opacity: 0.8, scale: 0.2 }, { opacity: 0, scale: 3.2, duration: 0.5, ease: "power3.out" });
        });

        function createParticle(x, y) {
          const particle = document.createElement("div");
          particle.classList.add("particle");
          particleContainer.appendChild(particle);
          gsap.set(particle, { x: x, y: y });
          gsap.to(particle, {
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            opacity: 0,
            scale: 0,
            duration: 0.6 + Math.random() * 0.3,
            ease: "power2.out",
            onComplete: () => particle.remove(),
          });
        }
      }
    }
  } catch (err) {
    console.warn("GSAP init failed:", err);
    document.querySelectorAll(".fade-up, .project-card, .mask-reveal span").forEach(el => {
        el.style.opacity = 1; 
        el.style.transform = 'none';
    });
  }
})();

// ---------------------------------------------------
// 5. MOBILE CAROUSEL LOGIC
// ---------------------------------------------------
if (window.innerWidth < 768) {
  const grid = document.querySelector(".project-grid");
  const cards = document.querySelectorAll(".project-card");

  if (grid && cards.length > 0) {
    function updateCarousel() {
      const centerX = window.innerWidth / 2;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);
        const scale = Math.max(0.86, 1 - distance / 600);
        const opacity = Math.max(0.55, 1 - distance / 350);
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
      });
    }
    grid.addEventListener("scroll", updateCarousel);
    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  }
}

// ---------------------------------------------------
// 6. AUTO-SELECT DROPDOWN
// ---------------------------------------------------
(function autoSelectFromURL() {
  const params = new URLSearchParams(window.location.search);
  const goal = params.get('goal');
  if (!goal) return;

  const select = document.querySelector('select[name="type"]');
  if (!select) return;

  const mapping = {
    'buy': 'Buy_New_Luxury',
    'resale': 'Buy_Resale',
    'rent': 'Rent_Flat',
    'sell': 'Owner_Sell',
    'owner': 'Owner_Rent'
  };

  const normalizedGoal = goal.toLowerCase();
  if (mapping[normalizedGoal]) {
    select.value = mapping[normalizedGoal];
    select.style.borderColor = "#D4AF37";
    setTimeout(() => { select.style.borderColor = "#333"; }, 1000);
  }
})();

// ---------------------------------------------------
// ---------------------------------------------------
// 7. FETCH PROPERTIES (WITH AWWWARDS CAROUSEL LOGIC)
// ---------------------------------------------------
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzdsftNssnmWHAO5ioiyKTGhJkgJ8ubf1rmEYr56xOk7X-gtIfn_4HTAowBq3id_lL3/exec"; 

async function loadProperties() {
  const grid = document.getElementById('propertyGrid');
  if (!grid) return; 

  try {
    const response = await fetch(SHEET_API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const properties = await response.json();

    grid.innerHTML = '';

    properties.forEach((prop, index) => {
      let cleanImage = prop.ImageURL;
      
      // Fix Google Drive links
      if (cleanImage.includes('drive.google.com')) {
          const idMatch = cleanImage.match(/id=([^&]+)/);
          if (idMatch && idMatch[1]) {
              cleanImage = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
          }
      }

      const card = document.createElement('div');
      card.className = 'project-card fade-up'; // Note: fade-up handles entry animation
      
      card.onclick = function() {
          window.location.href = `my-properties.html?id=${index}`;
      };

      card.innerHTML = `
        <div class="project-card-image">
          <img src="${cleanImage}" alt="${prop.Title}" loading="lazy" />
        </div>
        <div class="meta">
          <h4>${prop.Location}</h4>
          <p>${prop.Type}</p>
          <p style="font-size:0.85rem; margin-top:5px; color:#888;">${prop.Title}</p>
        </div>
      `;

      grid.appendChild(card);
    });

    // === SCROLL FIX ===
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 200);


    // === MOBILE CAROUSEL ANIMATION (The Awwwards Logic) ===
    if (window.innerWidth < 768) {
        const cards = document.querySelectorAll('.project-card');
        
        const updateCarousel = () => {
            const center = grid.scrollLeft + (grid.offsetWidth / 2);
            
            cards.forEach(card => {
                // Find center of this card
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                
                // Calculate distance from screen center
                const distance = Math.abs(center - cardCenter);
                
                // MATH:
                // Scale: 1.0 at center, drops to 0.9 at edges
                // Opacity: 1.0 at center, drops to 0.4 at edges
                const scale = Math.max(0.9, 1 - (distance / (window.innerWidth * 1.5)));
                const opacity = Math.max(0.4, 1 - (distance / (window.innerWidth * 0.8)));

                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                
                // Optional: blur side cards for depth
                card.style.filter = distance > 100 ? `blur(${distance/100}px)` : 'none';
            });
        };

        // Attach listeners
        grid.addEventListener('scroll', updateCarousel);
        
        // Run once immediately to set initial state
        updateCarousel();
    }

  } catch (error) {
    console.error("Error loading properties:", error);
    grid.innerHTML = `<p style="color:red; text-align:center;">Unable to load listings.<br><small>${error.message}</small></p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadProperties);
