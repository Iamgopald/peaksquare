// -------------------------
// Smooth Scroll Buttons
// -------------------------
const contactBtn = document.getElementById("contactScroll");
const projectsBtn = document.getElementById("projectScroll");

if (contactBtn) contactBtn.addEventListener("click", () => lenis.scrollTo("#contact"));
if (projectsBtn) projectsBtn.addEventListener("click", () => lenis.scrollTo("#projects"));

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
        "https://script.google.com/macros/s/AKfycbyoRil7QPM5Fuo59C8-sDZ4biUYNVonjY3UJMrV9Qq2FUFDt4psuMkAMYyk_JG-UMy33w/exec",
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
// GSAP Animations + Custom Cursor (initAnimations)
// -------------------------
(function initAnimations() {
  try {
    if (typeof gsap === "undefined") throw new Error("GSAP missing");
    gsap.registerPlugin(ScrollTrigger);

    // === Header & Hero Timeline ===
    const tl = gsap.timeline();
    tl.from(".brand", { opacity: 0, y: -20, duration: 0.2, ease: "power3.out" })
      .from(".header", { opacity: 1, y: -10, duration: 0.8, ease: "power3.out" })
      .from(".hero p", { opacity: 0, y: 30, duration: 0.9, ease: "power3.out" }, "-=0.85")
      .from(".hero-cta .btn", { opacity: 0, y: 20, stagger: 0.12, duration: 0.7 }, "-=0.6");

    // === Fade-up blocks (works on desktop & mobile) ===
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

    // === Project Cards: animate on desktop only; mobile -> ensure visible ===
    if (window.innerWidth >= 768) {
      gsap.utils.toArray(".project-card").forEach((card, idx) => {
        gsap.from(card, {
          opacity: 0,
          y: 28,
          duration: 1.0,
          delay: idx * 0.08,
          ease: "power3.out"
        });
      });
    } else {
      // On mobile, ensure cards are visible (no animation hidden state)
      document.querySelectorAll(".project-card").forEach((c) => {
        c.style.opacity = "1";
        c.style.transform = "none";
      });
    }

    // === TEXT REVEAL hero animation (run on all devices) ===
    gsap.fromTo(
      ".mask-reveal span",
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.3 }
    );

    // SUB & CTA
    gsap.from(".hero-sub", { opacity: 0, y: 30, duration: 1, ease: "power3.out", delay: 1 });

    // -------------------------
    // Cursor & Particles (Desktop only)
    // -------------------------
    if (window.innerWidth >= 768) {
      const lux = document.querySelector(".cursor-lux");
      const ripple = document.querySelector(".cursor-ripple");
      const particleContainer = document.querySelector(".particles");

      if (!lux || !ripple || !particleContainer) {
        console.warn("Cursor elements missing, skipping cursor init.");
        // continue without cursor (but keep other animations)
      } else {
        let cursorVisible = false;
        let lastParticleTime = 0;

        // Mouse follow + particle throttle
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

        // Hover enlarge for interactive elements
        document.querySelectorAll("a, button, .project-card, p, h1, h2, h3, h4, h5, h6, span")
          .forEach((el) => {
            el.addEventListener("mouseenter", () => lux.classList.add("active"));
            el.addEventListener("mouseleave", () => lux.classList.remove("active"));
          });

        // Ripple on click
        document.addEventListener("click", () => {
          gsap.fromTo(ripple, { opacity: 0.8, scale: 0.2 }, { opacity: 0, scale: 3.2, duration: 0.5, ease: "power3.out" });
        });

        // createParticle scoped here
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
    } else {
      // Mobile: hide cursor DOM elements (CSS fallback should also be present)
      document.querySelectorAll('.cursor-lux, .cursor-ripple, .particles').forEach(el => {
        if (el) el.style.display = 'none';
      });
    }

  } catch (err) {
    console.warn("GSAP init failed:", err);
    // Fallback: make sure important elements are visible
    document.querySelectorAll(".fade-up, .project-card, .mask-reveal span, .hero p, .hero-cta .btn").forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }
})(); // end initAnimations

// -------------------------
// Lenis smooth scroll setup (kept after animations like before)
// -------------------------
const lenis = new Lenis({
  duration: 0.4,
  easing: (t) => t,
  smooth: true,
});
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

ScrollTrigger.scrollerProxy(document.body, {
  scrollTop(value) {
    return arguments.length ? lenis.scrollTo(value) : lenis.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  }
});
lenis.on("scroll", ScrollTrigger.update);
ScrollTrigger.addEventListener("refresh", () => lenis.update());
ScrollTrigger.refresh();

