// CONFIGURATION
const BLOG_API_URL = "https://script.google.com/macros/s/AKfycbzjU1QsPqJodJ0OIdKrn0bf0kguyGbNrOonKaKzbj4kDKLoygi3G70G3yjoZLNMskgc/exec";

// HELPER: Convert Drive links and check if image exists
function getValidImage(url) {
    if (!url || url.length < 10) return 'assets/logo.svg';
    
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
        if (idMatch && idMatch[1]) {
            // Use the same reliable lh3 path here
            return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s1200`;
        }
    }
    return url;
}

// DOM ELEMENTS
const listWrapper = document.getElementById('blogDynamicContent');
const gridContainer = document.getElementById('blogGridSkeleton');
const singlePostContainer = document.getElementById('single-post-container');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        loadSinglePost(postId);
    } else {
        loadBlogList();
    }
});

// --- 1. FETCH & RENDER BLOG LIST ---
function loadBlogList() {
    if(listWrapper) listWrapper.style.display = 'block';
    if(singlePostContainer) singlePostContainer.style.display = 'none';

    // Grid Container already has skeletons in HTML, so we just fetch
    fetch(`${BLOG_API_URL}?action=getBlogList`)
        .then(response => response.json())
        .then(data => {
            if(gridContainer) gridContainer.innerHTML = '';

            if (!data || data.length === 0) {
                if(gridContainer) gridContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px; color: var(--text-muted);">No articles found.</p>';
                return;
            }

            data.forEach(blog => {
                let dateStr = "";
                try {
                    dateStr = new Date(blog.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                } catch(e) { dateStr = blog.date; }

                const imgUrl = getValidImage(blog.image);
                const imageHTML = imgUrl ? `
                    <div class="project-card-image">
                        <img src="${imgUrl}" alt="${blog.title}" loading="lazy">
                    </div>
                ` : '';

                const card = document.createElement('div');
                card.className = 'project-card fade-in-up'; 
                card.style.cursor = "pointer";
                card.onclick = function() { window.location.href = `?id=${blog.id}`; };
                
                card.innerHTML = `
                    ${imageHTML}
                    <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; display:block;">${dateStr}</span>
                        <h3 style="font-family: 'Manrope', sans-serif; font-size: 1.2rem; margin-bottom: 10px; color: var(--text-main); line-height: 1.4;">${blog.title}</h3>
                        <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; flex-grow: 1;">${blog.summary}</p>
                        <span style="color: var(--gold-main); font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px;">READ ARTICLE →</span>
                    </div>
                `;
                
                if(gridContainer) gridContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            if(gridContainer) gridContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-muted);">Unable to load articles.</p>';
        });
}

// --- 2. FETCH & RENDER SINGLE POST ---
function loadSinglePost(id) {
    if(listWrapper) listWrapper.style.display = 'none';
    if(singlePostContainer) {
        singlePostContainer.style.display = 'block';
        // USE SKELETON INSTEAD OF "LOADING..." TEXT
        singlePostContainer.innerHTML = `
            <div class="blog-post-content" style="padding-top: 100px;">
                <div class="skeleton-box" style="width: 150px; height: 20px; margin: 0 auto 20px;"></div>
                <div class="skeleton-box" style="width: 80%; height: 50px; margin: 0 auto 40px;"></div>
                <div class="skeleton-box" style="width: 100%; aspect-ratio: 21/9; border-radius: 12px; margin-bottom: 40px;"></div>
                <div class="skeleton-box" style="width: 100%; height: 20px; margin-bottom: 10px;"></div>
                <div class="skeleton-box" style="width: 100%; height: 20px; margin-bottom: 10px;"></div>
                <div class="skeleton-box" style="width: 60%; height: 20px;"></div>
            </div>
        `;
    }
    
    window.scrollTo(0, 0);

    fetch(`${BLOG_API_URL}?action=getBlogPost&id=${id}`)
        .then(response => response.json())
        .then(post => {
            if (!post || !post.title) {
                singlePostContainer.innerHTML = '<p style="text-align:center; padding: 100px; color: var(--text-muted);">Article not found.</p>';
                return;
            }

            let dateStr = "";
            try {
                dateStr = new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            } catch(e) { dateStr = post.date; }

            const heroImgUrl = getValidImage(post.image);
            const heroImageHTML = heroImgUrl ? `
                <div class="blog-hero-image-wrapper">
                    <img src="${heroImgUrl}" alt="${post.title}" class="blog-main-img">
                </div>
            ` : '';

            singlePostContainer.innerHTML = `
                <div class="blog-nav-bar">
                    <div class="container">
                        <a href="blog.html" class="back-link">
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                             Back to Insights
                        </a>
                    </div>
                </div>

                <article class="blog-post-content fade-in-up">
                    <header class="blog-header">
                        <span class="category-badge">Market Analysis</span>
                        <h1 class="blog-title-large">${post.title}</h1>
                        <div class="blog-meta">
                            <span class="date">Published: ${dateStr}</span>
                        </div>
                    </header>
                    
                    ${heroImageHTML}
                    
                    <div class="blog-body-text">
                        ${post.content}
                    </div>
                    
                    <div class="blog-footer-cta">
                        <div class="cta-glass-box">
                            <h3>Seeking Personalized Advice?</h3>
                            <p>Connect with our expert advisors for a private consultation.</p>
                            <div class="cta-buttons">
                                <a href="mailto:sales@peaksquareestates.com?subject=Inquiry: ${encodeURIComponent(post.title)}" class="btn secondary blog-cta-btn">
                                    Private Email Enquiry
                                </a>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            singlePostContainer.innerHTML = '<p style="text-align:center; padding: 100px; color: var(--text-muted);">Error loading article.</p>';
        });
}