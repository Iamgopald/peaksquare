// CONFIGURATION
const BLOG_API_URL = "https://script.google.com/macros/s/AKfycbzjU1QsPqJodJ0OIdKrn0bf0kguyGbNrOonKaKzbj4kDKLoygi3G70G3yjoZLNMskgc/exec";

// HELPER: Convert Drive links
function getValidImage(url) {
    if (!url || url.length < 10) return 'assets/logo.svg';
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
        if (idMatch && idMatch[1]) {
            // Fixed template literal syntax
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
                const card = document.createElement('div');
                card.className = 'project-card fade-in-up'; 
                card.style.cursor = "pointer";
                card.onclick = function() { window.location.href = `?id=${blog.id}`; };
                
                card.innerHTML = `
                    <div class="project-card-image">
                        <img src="${imgUrl}" alt="${blog.title}" loading="lazy">
                    </div>
                    <div class="meta">
                        <h4>Market Analysis</h4>
                        <p>${blog.title}</p>
                        <span>${dateStr}</span>
                    </div>
                `;
                if(gridContainer) gridContainer.appendChild(card);
            });
        });
}

// --- 2. FETCH & RENDER SINGLE POST ---
// --- 2. FETCH & RENDER SINGLE POST ---
function loadSinglePost(id) {
    if(listWrapper) listWrapper.style.display = 'none';
    if(singlePostContainer) {
        singlePostContainer.style.display = 'block';
        singlePostContainer.innerHTML = `
            <div class="container">
                <div class="blog-editorial-container" style="padding-top: 100px; margin: 0 auto; max-width: 850px;">
                    <div class="skeleton-box" style="width: 100%; height: 50px; margin-bottom: 40px;"></div>
                    <div class="skeleton-box" style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; margin-bottom: 40px;"></div>
                </div>
            </div>
        `;
    }
    
    window.scrollTo(0, 0);

    fetch(`${BLOG_API_URL}?action=getBlogPost&id=${id}`)
        .then(response => response.json())
        .then(post => {
            if (!post || !post.title) {
                singlePostContainer.innerHTML = '<div class="container"><p style="text-align:center; padding: 100px; color: var(--text-muted);">Article not found.</p></div>';
                return;
            }

            let dateStr = "";
            try {
                dateStr = new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            } catch(e) { dateStr = post.date; }

            const heroImgUrl = getValidImage(post.image);

            // Inside loadSinglePost(id)
singlePostContainer.innerHTML = `
    <article class="blog-post-content fade-in-up">
        <div class="container">
            <div class="blog-editorial-container" style="max-width: 850px; margin: 0 auto;">
                <header class="blog-header" style="text-align: left; margin-bottom: 30px;">
                    <span class="category-badge" style="color: var(--gold-main); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px;">Market Analysis</span>
                    <h1 class="property-title-large" style="margin: 15px 0 !important; text-align: left !important;">${post.title}</h1>
                    <div class="blog-meta" style="color: var(--text-muted); font-size: 0.9rem;">${dateStr}</div>
                </header>
                
                <div class="blog-hero-image-wrapper" style="margin-bottom: 40px;">
                    <img src="${heroImgUrl}" alt="${post.title}" class="blog-main-img" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--glass-border);">
                </div>

                <div class="blog-article-body">
                    ${post.content}
                </div>
                
                </div>
        </div>
    </article>
`;
        });
}