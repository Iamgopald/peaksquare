// ===================================================
// 1. THEME MANAGER (Runs Immediately)
// ===================================================
(function() {
  const toggleBtn = document.getElementById('themeToggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');

  // CHANGE: Default to 'light' if no theme is saved yet
  if (!savedTheme || savedTheme === 'light') {
      body.classList.add('light-mode');
      if (toggleBtn) toggleBtn.textContent = '☾'; // Shows Moon (click to go dark)
  } else {
      // If 'dark' is saved, do nothing (CSS defaults to dark)
      if (toggleBtn) toggleBtn.textContent = '☀'; // Shows Sun (click to go light)
  }

  if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
          body.classList.toggle('light-mode');
          
          if (body.classList.contains('light-mode')) {
              localStorage.setItem('theme', 'light');
              toggleBtn.textContent = '☾';
          } else {
              localStorage.setItem('theme', 'dark');
              toggleBtn.textContent = '☀';
          }
      });
  }
})();

// ===================================================
// 2. MAIN LOGIC
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
    // Smooth Scroll
    if (typeof Lenis !== "undefined") {
        const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true, touchMultiplier: 2 });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
            lenis.on('scroll', ScrollTrigger.update);
            ScrollTrigger.config({ ignoreMobileResize: true });
        }
    }
    initHeroAnimations();
    loadData();
});

// ===================================================
// 3. CMS LOADER (Fixed Images & Crash Proof)
// ===================================================
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzdsftNssnmWHAO5ioiyKTGhJkgJ8ubf1rmEYr56xOk7X-gtIfn_4HTAowBq3id_lL3/exec"; 
const CACHE_KEY = 'peaksquare_data';
const CACHE_TIME = 3600000; // 1 Hour

async function loadData() {
  const grid = document.getElementById('propertyGrid');
  const detailContainer = document.getElementById('dynamicContent');

  // Clear cache to fix previous errors
  localStorage.removeItem(CACHE_KEY); 

  try {
      const response = await fetch(SHEET_API_URL);
      if (!response.ok) throw new Error(`Google Blocked Request: ${response.status}`);
      
      const properties = await response.json();
      
      if (!properties || properties.length === 0) {
          if (grid) grid.innerHTML = `<p style="color:var(--text-muted); text-align:center;">No properties found.</p>`;
          return;
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), properties: properties }));

      if (grid) renderGrid(properties);
      if (detailContainer) renderDetail(properties);

  } catch (error) {
      console.error(error);
      if (grid) grid.innerHTML = `<p style="color:var(--text-muted); text-align:center;">Unable to load properties.</p>`; 
  }
}

function renderGrid(properties) {
    const grid = document.getElementById('propertyGrid');
    if (!grid) return;
    grid.innerHTML = '';

    properties.forEach((prop, index) => {
        let imgUrl = prop.ImageURL || '';
        let imgHtml = `<img src="${imgUrl}" loading="lazy" alt="Property">`;

        // FIXED: Added $ symbol below
        if (imgUrl.includes('drive.google.com')) {
            const idMatch = imgUrl.match(/id=([^&]+)/);
            if (idMatch && idMatch[1]) {
                const baseUrl = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                imgHtml = `<img src="${baseUrl}=w800" srcset="${baseUrl}=w400 400w, ${baseUrl}=w800 800w" sizes="(max-width: 768px) 90vw, 400px" loading="lazy" class="fade-up" alt="Property">`;
            }
        }

        const card = document.createElement('div');
        card.className = 'project-card fade-up';
        card.onclick = function() { window.location.href = `my-properties.html?id=${index}`; };
        
        card.innerHTML = `
            <div class="project-card-image">${imgHtml}</div>
            <div class="meta">
                <h4>${prop.Location}</h4>
                <p>${prop.Type}</p>
                <p style="font-size:0.85rem;margin-top:5px;color:#888;">${prop.Title}</p>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
}

function renderDetail(properties) {
    const detailContainer = document.getElementById('dynamicContent');
    if (!detailContainer) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id === null) { window.location.href = "index.html"; return; }

    const prop = properties[id];
    if (!prop) { detailContainer.innerHTML = "<p class='loading-msg'>Property not found.</p>"; return; }

    let imgUrl = prop.ImageURL || '';
    let imgHtml = `<img src="${imgUrl}" alt="Property">`;

    // FIXED: Added $ symbol below
    if (imgUrl.includes('drive.google.com')) {
        const idMatch = imgUrl.match(/id=([^&]+)/);
        if (idMatch && idMatch[1]) {
            const baseUrl = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
            imgHtml = `<img src="${baseUrl}=w1600" srcset="${baseUrl}=w800 800w, ${baseUrl}=w1600 1600w" sizes="(max-width: 768px) 100vw, 800px" alt="${prop.Title}" />`;
        }
    }

    const possessionDate = prop.Possession || "Immediate"; 
    const priceValue = prop.Price || "On Request";
    const message = `Hi, I am interested in ${prop.Title} located at ${prop.Location}.`;
    const whatsappLink = `https://wa.me/917276607467?text=${encodeURIComponent(message)}`;

    detailContainer.innerHTML = `
        <div class="details-wrapper">
            <div class="image-container">${imgHtml}</div>
            <div class="info-container">
                <div class="prop-type">${prop.Type}</div>
                <h1 class="prop-title">${prop.Title}</h1>
                <div class="prop-location">📍 ${prop.Location}</div>
                <div class="specs-grid">
                    <div class="spec-item"><h4>Possession</h4><p>${possessionDate}</p></div>
                    <div class="spec-item"><h4>Price</h4><p>${priceValue}</p></div>
                </div>
                <p style="color:var(--text-muted);line-height:1.6;margin-bottom:40px;">Experience luxury living in ${prop.Location}. This property is verified by PeakSquare Estates.</p>
                <div class="action-area">
                    <a href="${whatsappLink}" target="_blank" class="btn-whatsapp"><span>💬 Chat on WhatsApp</span></a>
                    <a href="tel:+917276607467" class="btn-call">📞 Call Agent</a>
                    <a href="index.html#projects" class="btn-back">← Back to Listings</a>
                </div>
            </div>
        </div>
    `;
}

// ===================================================
// 4. ANIMATIONS & FORM
// ===================================================
function initHeroAnimations() {
    if (!document.querySelector(".hero")) return;
    if (typeof gsap !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        const tl = gsap.timeline();
        tl.from(".brand", { opacity: 0, y: -20, duration: 0.8, ease: "power3.out" })
          .from(".header", { opacity: 1, y: -10, duration: 0.8, ease: "power3.out" }, "-=0.6")
          .from(".hero-form-wrapper", { opacity: 0, x: 40, duration: 1, ease: "power3.out" }, "-=0.6");
        gsap.utils.toArray(".fade-up").forEach((el, i) => {
            gsap.from(el, { opacity: 0, y: 30, duration: 0.6, delay: i * 0.05, ease: "power3.out", scrollTrigger: { trigger: el, scroller: document.body, start: "top 95%" } });
        });
        gsap.fromTo(".mask-reveal span", { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.3 });
    }
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent; 
            btn.textContent = "Processing..."; 
            btn.disabled = true;
            try {
                const res = await fetch("https://script.google.com/macros/s/AKfycbyoRil7QPM5Fuo59C8-sDZ4biUYNVonjY3UJMrV9Qq2FUFDt4psuMkAMYyk_JG-UMy33w/exec", { method: "POST", body: new FormData(contactForm) });
                if (res.ok) { window.location.href = "thankyou.html"; contactForm.reset(); } else { throw new Error("Server error"); }
            } catch (err) { alert("Network error."); btn.textContent = originalText; btn.disabled = false; }
        });
    }
}

// ===================================================
// 5. LUXURY CURSOR (Morphing Logic)
// ===================================================
(function initCursor() {
  if (window.innerWidth < 992) return;
  
  let ring = document.querySelector(".cursor-outline");
  if (!ring) {
    ring = document.createElement("div");
    ring.classList.add("cursor-outline");
    document.body.appendChild(ring);
  }
  
  // Follow Movement
  if (typeof gsap !== "undefined") {
      window.addEventListener("mousemove", (e) => {
        gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
      });
  }

  const resetClasses = () => {
      ring.classList.remove("hovered", "reading", "text-mode", "pointer-mode");
      ring.style.opacity = 1;
  };

  document.addEventListener("mouseover", (e) => {
    const target = e.target;
    resetClasses();

    // 1. INPUTS & TEXTAREAS -> Morph into 'Tall Gold Bar'
    if (target.closest("input, textarea")) {
      ring.classList.add("text-mode");
    } 

    else if (target.closest("select")) {
      ring.classList.add("pointer-mode");
    }
    // 3. INTERACTIVE (Buttons, Links, Cards) -> Glow Effect
    else if (target.closest("a, button, .project-card, .btn, label, select")) {
      ring.classList.add("hovered");
    }
    // 4. READING (Text) -> Big Lens Effect
    else if (target.closest("p, h1, h2, h3, h4, span, li")) {
      ring.classList.add("reading");
    }
  });
})();