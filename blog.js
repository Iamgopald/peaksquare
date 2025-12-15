// CONFIGURATION
const BLOG_API_URL = "https://script.google.com/macros/s/AKfycbzdsftNssnmWHAO5ioiyKTGhJkgJ8ubf1rmEYr56xOk7X-gtIfn_4HTAowBq3id_lL3/exec";

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

                const card = document.createElement('div');
                // We use your existing CSS class 'project-card' so it picks up the Dark Mode background
                card.className = 'project-card fade-in-up'; 
                card.style.cursor = "pointer";
                card.onclick = function() { window.location.href = `?id=${blog.id}`; };
                
                card.innerHTML = `
                    <div class="project-card-image">
                        <img src="${blog.image}" alt="${blog.title}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="padding: 20px; display: flex; flex-direction: column; flex-grow: 1;">
                        <span style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; display:block;">${dateStr}</span>
                        <h3 style="font-family: 'Manrope', sans-serif; font-size: 1.2rem; margin-bottom: 10px; color: var(--text-main); line-height: 1.4;">${blog.title}</h3>
                        <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; flex-grow: 1;">${blog.summary}</p>
                        <span style="color: var(--gold-main); font-weight: 600; font-size: 0.9rem; letter-spacing: 0.5px;">READ ARTICLE &rarr;</span>
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
    if(singlePostContainer) singlePostContainer.style.display = 'block';
    
    singlePostContainer.innerHTML = '<div style="padding: 100px; text-align: center; color: var(--text-muted);">Loading article...</div>';
    window.scrollTo(0, 0);

    fetch(`${BLOG_API_URL}?action=getBlogPost&id=${id}`)
        .then(response => response.json())
        .then(post => {
            if (!post || !post.title) {
                singlePostContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">Article not found.</p>';
                return;
            }

            let dateStr = "";
            try {
                dateStr = new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            } catch(e) { dateStr = post.date; }

            // Using var(--text-main) ensures it is White in Dark Mode and Black in Light Mode
            singlePostContainer.innerHTML = `
                <div class="section" style="padding-top: 40px; max-width: 800px; margin: 0 auto;">
                    <button onclick="window.location.href='blog.html'" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 1rem; margin-bottom: 20px; display: flex; align-items: center; gap: 5px;">
                        &larr; Back to Articles
                    </button>
                    
                    <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; line-height: 1.2; margin-bottom: 15px; color: var(--text-main);">${post.title}</h1>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 30px; border-bottom: 1px solid var(--glass-border); padding-bottom: 20px;">Published on ${dateStr}</p>
                    
                    <img src="${post.image}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 40px; border: 1px solid var(--glass-border);" alt="${post.title}">
                    
                    <div class="blog-body-content" style="font-family: 'Manrope', sans-serif; font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">
                        ${post.content}
                    </div>
                    
                     <div style="margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--glass-border); text-align: center;">
                        <h4 style="margin-bottom: 15px; color: var(--text-main);">Interested in Pune Real Estate?</h4>
                        <a href="index.html#contactForm" class="btn primary" style="display: inline-block; padding: 12px 30px; background: var(--gold-gradient); color: #000; text-decoration: none; border-radius: 50px;">Contact Us</a>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            singlePostContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">Error loading article.</p>';
        });
}