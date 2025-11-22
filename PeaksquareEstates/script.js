// -------------------------
// Smooth Scroll Buttons
// -------------------------
const contactBtn = document.getElementById("contactScroll");
const projectsBtn = document.getElementById("projectScroll");

if (contactBtn) {
  contactBtn.addEventListener("click", () =>
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" })
  );
}

if (projectsBtn) {
  projectsBtn.addEventListener("click", () =>
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" })
  );
}

// -------------------------
// Zoho Form Submit
// -------------------------
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);

    try {
      const res = await fetch(
        "https://forms.zohopublic.in/gopaldeshmukhpeaksqua1/form/ContactUs/formperma/tgxDsFXrBrHYL9fFyQzSEaVfm2Zf21dsuvZhfyMYQkg",
        { method: "POST", body: formData }
      );

      if (res.ok) {
        alert("Thank you! Your details have been submitted.");
        contactForm.reset();
      } else {
        alert("Submission failed — please try again.");
      }
    } catch (err) {
      console.warn("Zoho submit error:", err);
      alert("Network error. Try again later.");
    }
  });
}

// -------------------------
// GSAP Animations + Custom Cursor
// -------------------------
(function initAnimations() {
  try {
    if (typeof gsap === "undefined") throw new Error("GSAP missing");

    gsap.registerPlugin(ScrollTrigger);

    // === Header & Hero Timeline ===
    const tl = gsap.timeline();
    tl.from(".brand", { opacity: 0, y: -20, duration: 0.2, ease: "power3.out" });
    tl.from(".header", { opacity: 1, y: -10, duration: 0.8, ease: "power3.out" })
      .from(".hero-title span",  { opacity: 0, y: 40, duration: 1.0, ease: "power3.out" }, "-=0.4")
      .from(".hero p", { opacity: 0, y: 30, duration: 0.9, ease: "power3.out" }, "-=0.85")
      .from(".hero-cta .btn", { opacity: 0, y: 20, stagger: 0.12, duration: 0.7 }, "-=0.6");

    // === Fade-up blocks ===
    gsap.utils.toArray(".fade-up:not(.header)").forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 1.0,
        delay: i * 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    // === Project Cards Stagger ===
    gsap.utils.toArray(".project-card").forEach((card, idx) => {
      gsap.from(card, {
        opacity: 0,
        y: 28,
        duration: 1.0,
        delay: idx * 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%" },
      });
    });

//Text Reveal hero animation

// TEXT REVEAL
gsap.to(".mask-reveal span", {
  y: 0,
  opacity: 1,
  duration: 1.2,
  ease: "power4.out",
  stagger: 0.15,
  delay: 0.4
});

// SUB & CTA
gsap.from(".hero-sub", {
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power3.out",
  delay: 1
});



// Luxury Cursor + Ripple + Particle Trail
// -------------------------
const lux = document.querySelector(".cursor-lux");
const ripple = document.querySelector(".cursor-ripple");
const particleContainer = document.querySelector(".particles");

// Smooth Follow
document.addEventListener("mousemove", (e) => {
  gsap.to(lux, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power3.out" });
  gsap.to(ripple, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power3.out" });

  createParticle(e.clientX, e.clientY);
});

// Hover Enlarge (INCLUDING TEXT)
document.querySelectorAll("a, button, .project-card, p, h1, h2, h3, h4, h5, h6, span")
  .forEach((el) => {
    el.addEventListener("mouseenter", () => lux.classList.add("active"));
    el.addEventListener("mouseleave", () => lux.classList.remove("active"));
  });

// Ripple on Click
document.addEventListener("click", () => {
  gsap.fromTo(
    ripple,
    { opacity: 0.8, scale: 0.2 },
    { opacity: 0, scale: 3.2, duration: 0.5, ease: "power3.out" }
  );
});

// -------------------------
// GOLD PARTICLE FUNCTION
// -------------------------
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
  } catch (err) {
    console.warn("GSAP init failed:", err);

    // Fallback if GSAP fails
    document.querySelectorAll(".fade-up, .project-card").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }
})();

