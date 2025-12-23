// ===================================================
// 1. INITIALIZATION & CORE SETUP
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    initThemeManager();
    initSmoothScroll();
    initScrollAnimations();
    initDataLoading();      
    initGlobalInteractions(); 
    initProgressiveForm(); 
    
    if(document.getElementById('property-main')) {
        initPropertyDetails();
    }
});

// Global API Config
const API_URL = "https://script.google.com/macros/s/AKfycbzdsftNssnmWHAO5ioiyKTGhJkgJ8ubf1rmEYr56xOk7X-gtIfn_4HTAowBq3id_lL3/exec";
const CACHE_DURATION = 3600000; // 1 Hour Cache


// ===================================================
// 2. THEME MANAGER (Fixed for Footer Support)
// ===================================================

function initThemeManager() {
    const toggleBtn = document.getElementById('themeToggle');
    const menuToggleBtn = document.querySelector('.theme-btn-menu');
    const footerToggleBtn = document.getElementById('themeToggleFooter');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    const updateUI = (isLight) => {
        const text = isLight ? '☾ Dark Mode' : '☀ Light Mode';
        if(toggleBtn) toggleBtn.innerHTML = text;
        if(menuToggleBtn) menuToggleBtn.innerHTML = text; // Added this line
        if(footerToggleBtn) footerToggleBtn.innerHTML = text;
    };

    if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
        body.classList.add('light-mode');
        updateUI(true);
    } else {
        body.classList.remove('light-mode');
        updateUI(false);
    }

    const switchTheme = () => {
        const isCurrentlyLight = body.classList.toggle('light-mode');
        localStorage.setItem('theme', isCurrentlyLight ? 'light' : 'dark');
        updateUI(isCurrentlyLight);
    };

    // Keep these INSIDE this function
    if (toggleBtn) toggleBtn.addEventListener('click', switchTheme);
    if (menuToggleBtn) menuToggleBtn.addEventListener('click', switchTheme);
    if (footerToggleBtn) footerToggleBtn.addEventListener('click', switchTheme);
}

function optimizeDriveImage(url, width = 1600) {
    if (!url) return 'assets/logo.svg';
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/id=([^&]+)/);
        // FIXED: Added $ and updated domain
        if (idMatch) return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}=s${width}`;
    }
    return url;
}
// ===================================================
// 3. PERFORMANCE: SCROLL & ANIMATIONS
// ===================================================
function initSmoothScroll() {
    if (typeof Lenis !== "undefined") {
        const lenis = new Lenis({ 
            duration: 1.2, 
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            smoothWheel: true 
        });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-up, .fade-in-scroll').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
        observer.observe(el);
    });
}

// ===================================================
// 4. DATA ENGINE (Robust & Cached)
// ===================================================
async function initDataLoading() {
    // Only run on Homepage
    if(document.getElementById('propertyGrid')) {
        renderSkeleton('propertyGrid', 3);
        renderSkeleton('featured-blog-container', 2);
        
        // Fetch Data
        await loadContent('peaksquare_data', 'propertyGrid', renderProperties);
        await loadContent('peaksquare_blog_data', 'featured-blog-container', renderBlogs, "?action=getBlogList");
        
        initSearchLogic(); 
    }
}

function renderSkeleton(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    for(let i=0; i<count; i++) {
        html += `
        <div class="skeleton-card">
            <div class="skeleton-box sk-img"></div>
            <div class="skeleton-box sk-title"></div>
            <div class="skeleton-box sk-text"></div>
        </div>`;
    }
    container.innerHTML = html;
}

async function loadContent(key, containerId, renderFn, queryParam = "") {
    const cached = localStorage.getItem(key);
    
    if (cached) {
        try {
            const { timestamp, data } = JSON.parse(cached);
            if (Array.isArray(data) && Date.now() - timestamp < CACHE_DURATION) {
                if(containerId && renderFn) renderFn(data, document.getElementById(containerId));
                if (key === 'peaksquare_data') injectRealEstateSchema(data); 
                return data; 
            }
        } catch(e) { localStorage.removeItem(key); }
    }

    try {
        const res = await fetch(API_URL + queryParam);
        const jsonResponse = await res.json();
        
        let finalData = [];
        if (Array.isArray(jsonResponse)) finalData = jsonResponse;
        else if (jsonResponse.data && Array.isArray(jsonResponse.data)) finalData = jsonResponse.data;

        if (finalData.length > 0) {
            localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: finalData }));
            if(containerId && renderFn) renderFn(finalData, document.getElementById(containerId));
            if (key === 'peaksquare_data') injectRealEstateSchema(finalData);
            return finalData;
        }
    } catch (err) {
        console.error(`[Error] Failed to load ${key}:`, err);
    }
    return [];
}

// ===================================================
// 5. PROPERTY DETAIL LOGIC (Clean & Dynamic)
// ===================================================
async function initPropertyDetails() {
    const container = document.getElementById('dynamicContent');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id === null) {
        window.location.href = 'index.html'; 
        return;
    }

    let properties = await loadContent('peaksquare_data', null, null);
    
    if (!properties || properties.length === 0) return;

    const property = properties[id];

    if (!property) {
        container.innerHTML = "<h2 style='text-align:center; padding:100px; color:var(--text-main);'>Property Not Found.</h2>";
        return;
    }

    renderSingleProperty(property, container);
}

function renderSingleProperty(p, container) {
    const title = p.Title || "Luxury Residence";
    const loc = p.Location || "Pune";
    const price = p.Price || "Price on Request";
    const isMobile = window.innerWidth < 768;
    const img = optimizeDriveImage(p.ImageURL, isMobile ? 800 : 1600);
    const type = p.Type || "Premium Property";
    const possession = p.Possession || "Ready to Move";
    
    const desc = `Discover this exclusive <strong>${type}</strong> located in the prime area of <strong>${loc}</strong>. This premium property is listed at <strong>${price}</strong> with a possession status of <strong>${possession}</strong>. Verified by PeakSquare Estates.`;
    
    document.title = `${title} | PeakSquare Estates`;
    
    const waLink = document.getElementById('whatsappCta');
    if(waLink) waLink.href = `https://wa.me/917276607467?text=Hi, I am interested in ${encodeURIComponent(title)} at ${encodeURIComponent(loc)}`;

    // Corrected Injection Logic to match the Designer Layout
    container.innerHTML = `
        <section class="hero property-hero">
            <div class="hero-bg">
                <div class="hero-overlay"></div>
                <img src="${img}" class="hero-bg-img" alt="${title}">
            </div>
            <div class="hero-container">
                <div class="hero-text-content">
                    <span class="hero-badge" style="display:block; opacity:1;">${loc}</span>
                    <h1 class="hero-title property-title-large fade-in-up">${title}</h1>
                    <h2 class="property-price-tag fade-in-up">${price}</h2>
                </div>
            </div>
        </section>

        <section class="property-specs-section">
            <div class="container">
                <div class="property-meta-grid fade-in-up">
                    <div class="meta-item meta-divider">
                        <span class="meta-label">Type</span>
                        <strong class="meta-value">${type}</strong>
                    </div>
                    <div class="meta-item meta-divider">
                        <span class="meta-label">Possession</span>
                        <strong class="meta-value">${possession}</strong>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Location</span>
                        <strong class="meta-value">${loc}</strong>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header" style="text-align:left; max-width:800px; margin:0 auto;">
                <h3 class="section-title">Property Overview</h3>
                <div class="blog-body-content" style="margin-top:30px;">
                    <p>${desc}</p>
                </div>
            </div>
        </section>

        <section class="section" style="padding-top:0;">
            <div class="section-header">
                <h3 class="section-title">Gallery</h3>
            </div>
            <div class="project-grid">
                <div class="project-card" style="width:100%; grid-column: span 12;">
                    <div class="project-card-image"><img src="${img}" alt="Gallery View"></div>
                </div>
            </div>
        </section>
    `;
    
    // Re-initialize animations after injection
    initScrollAnimations();
}

// ===================================================
// 6. RENDERERS
// ===================================================
function renderProperties(props, container) {
    if(!props || props.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.6; color:var(--text-muted);'>No properties found.</p>";
        return;
    }

    container.innerHTML = props.map((p, idx) => {
        const title = p.Title || "Luxury Property";
        const loc = p.Location || "Pune";
        const type = p.Type || "Premium Residence";
        const img = optimizeDriveImage(p.ImageURL);
        
        return `
            <div class="project-card" onclick="window.location.href='my-properties.html?id=${idx}'" style="cursor:pointer;">
                <div class="project-card-image"><img src="${img}" alt="${title}" loading="lazy"></div>
                <div class="meta">
                    <h4>${loc}</h4>
                    <p>${type}</p>
                    <span style="font-size:0.9rem; color:var(--text-muted); display:block; margin-top:5px;">${title}</span>
                </div>
            </div>`;
    }).join('');
}

function renderBlogs(blogs, container) {
    if(!blogs || blogs.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.6; color:var(--text-muted);'>No insights available.</p>";
        return;
    }
    
    const featured = blogs
        .filter(b => b.featured === true || b.featured === "true") 
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if(featured.length === 0) {
        container.innerHTML = "<p style='text-align:center; opacity:0.6; color:var(--text-muted);'>No featured insights.</p>";
        return;
    }

    container.innerHTML = featured.map((b, idx) => {
        const title = b.title || "Market Insight";
        const summary = b.summary || "Read the latest trends.";
        const dateStr = new Date(b.date).toDateString();
        const linkId = b.id ? b.id : idx;
        
        return `
            <div class="featured-blog-card" onclick="window.location.href='blog.html?id=${linkId}'" style="cursor:pointer;">
                <div class="featured-content">
                    <span class="featured-date">${dateStr}</span>
                    <h4 class="featured-title" style="color:var(--text-main);">${title}</h4>
                    <p class="featured-summary" style="font-size:0.95rem; color:var(--text-muted);">${summary}</p>
                </div>
                <div class="blog-btn-wrapper">
                    <span class="read-more-link" style="color:var(--gold-main); font-weight:600;">Read Article →</span>
                </div>
            </div>`;
    }).join('');
}

function optimizeDriveImage(url, width = 1600) {
    if (!url) return 'assets/logo.svg';
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/id=([^&]+)/);
        // We add =s{width} to the end. Google will resize it on their server!
        // Desktop: 1600, Mobile: 800
        if (idMatch) return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}=s${width}`;
    }
    return url;
}
// ===================================================
// 7. UNIFIED OVERLAY MANAGER
// ===================================================
function initGlobalInteractions() {
    const overlays = {
        'search': document.getElementById('searchOverlay'),
        'menu': document.getElementById('menuOverlay')
    };
    const stickyBar = document.querySelector('.mobile-sticky-bar');
    const searchInput = document.getElementById('searchInput');

    const toggleOverlay = (id, show) => {
        const overlay = overlays[id];
        if(!overlay) return;

        if(show) {
            Object.values(overlays).forEach(el => el.classList.remove('active'));
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; 
            if(stickyBar) stickyBar.classList.add('hidden');
            if(id === 'search' && searchInput) setTimeout(() => searchInput.focus(), 100);
        } else {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if(stickyBar) stickyBar.classList.remove('hidden');
            if(id === 'search' && searchInput) searchInput.blur();
        }
    };
    document.getElementById('searchTrigger')?.addEventListener('click', () => toggleOverlay('search', true));
    document.getElementById('menuTrigger')?.addEventListener('click', () => toggleOverlay('menu', true));
    document.getElementById('searchClose')?.addEventListener('click', () => toggleOverlay('search', false));
    document.getElementById('menuClose')?.addEventListener('click', () => toggleOverlay('menu', false));

    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => toggleOverlay('menu', false));
    });
    const searchBtn = document.getElementById('searchTrigger');
    const menuBtn = document.getElementById('menuTrigger');
    if(searchBtn) searchBtn?.addEventListener('click', () => toggleOverlay('search', true));
    if(menuBtn) menuBtn?.addEventListener('click', () => toggleOverlay('menu', true));

    const searchClose = document.getElementById('searchClose');
    const menuClose = document.getElementById('menuClose');
    if(searchClose) searchClose?.addEventListener('click', () => toggleOverlay('search', false));
    if(menuClose) menuClose?.addEventListener('click', () => toggleOverlay('menu', false));

    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => toggleOverlay('menu', false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleOverlay('search', false);
            toggleOverlay('menu', false);
        }
    });
}

// ===================================================
// 8. SEARCH LOGIC
// ===================================================
function initSearchLogic() {
    const input = document.getElementById('searchInput');
    const resultsBox = document.getElementById('searchResults');
    if(!input) return;

    input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if(q.length < 2) { resultsBox.innerHTML = ''; return; }

        let hits = [];
        const pRaw = localStorage.getItem('peaksquare_data');
        const bRaw = localStorage.getItem('peaksquare_blog_data');
        const pData = pRaw ? JSON.parse(pRaw).data : [];
        const bData = bRaw ? JSON.parse(bRaw).data : [];

        if(Array.isArray(pData)) {
            pData.forEach((p, idx) => {
                const text = ((p.Title||'') + (p.Location||'') + (p.Type||'')).toLowerCase();
                if(text.includes(q)) {
                    hits.push({ 
                        type: 'PROPERTY', 
                        title: p.Title, 
                        sub: p.Location, 
                        img: optimizeDriveImage(p.ImageURL), 
                        link: `my-properties.html?id=${idx}` 
                    });
                }
            });
        }
        if(Array.isArray(bData)) {
            bData.forEach((b, idx) => {
                const text = ((b.title||'') + (b.summary||'')).toLowerCase();
                if(text.includes(q)) {
                    hits.push({ 
                        type: 'INSIGHT', 
                        title: b.title, 
                        sub: 'Market Trend', 
                        img: optimizeDriveImage(b.image), 
                        link: `blog.html?id=${b.id || idx}` 
                    });
                }
            });
        }

        if(hits.length === 0) {
            resultsBox.innerHTML = '<div style="padding:20px; text-align:center; opacity:0.6; color:var(--text-muted);">No results found.</div>';
        } else {
            resultsBox.innerHTML = hits.map(h => `
                <a href="${h.link}" class="search-result-item">
                    <img src="${h.img}" class="search-thumb">
                    <div>
                        <span style="font-size:0.7rem; color:var(--gold-main); font-weight:700;">${h.type}</span>
                        <h4 style="font-size:1rem; margin-bottom:4px; color:var(--text-main);">${h.title}</h4>
                        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.2;">${h.sub}</p>
                    </div>
                </a>
            `).join('');
        }
    });
}

// ===================================================
// 9. PROGRESSIVE FORM
// ===================================================
function initProgressiveForm() {
    const select = document.getElementById('interestType');
    const fields = document.querySelector('.progressive-fields');
    const form = document.getElementById('contactForm');
    if(!form) return;
    if(select && fields) {
        select.addEventListener('change', () => {
            fields.classList.add('active');
            fields.style.display = 'block'; 
            setTimeout(() => fields.style.opacity = '1', 50);
        });
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if(fields && !fields.classList.contains('active')) {
                fields.classList.add('active');
                fields.style.display = 'block';
                fields.style.opacity = '1';
                if(select && !select.value) { select.focus(); return; }
            }

            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = "Securing Access...";
            btn.disabled = true;
            btn.style.opacity = "0.7";
            
            try {
                await fetch(API_URL, { method: "POST", body: new FormData(form), mode: 'no-cors' });
                window.location.href = "thankyou.html";
            } catch (err) {
                console.error("Form Error:", err);
                alert("Connection issue. Please use WhatsApp.");
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = "1";
            }
        });
    }
}

// ===================================================
// 10. SEO SCHEMA
// ===================================================
function injectRealEstateSchema(properties) {
    if (!properties || !Array.isArray(properties)) return;
    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": properties.map((p, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@type": "RealEstateListing",
                "name": p.Title,
                "url": window.location.href.split('?')[0] + `?id=${i}`,
                "image": optimizeDriveImage(p.ImageURL),
                "address": { "@type": "PostalAddress", "addressLocality": p.Location }
            }
        }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

const footerBtn = document.getElementById('themeToggleFooter');
if (footerBtn) footerBtn.addEventListener('click', switchTheme);

