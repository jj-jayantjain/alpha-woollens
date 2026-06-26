/* ============================================================
   ALPHA WOOLLENS — SHARED SITE BEHAVIOR
   Header/footer are injected here so every page stays in sync.
   To add a nav link or footer column: edit the templates below.
   ============================================================ */

(function () {
  const NAV_LINKS = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About" },
    { href: "services.html", label: "Services" },
    { href: "catalog.html", label: "Catalog" },
    { href: "contact.html", label: "Contact" },
  ];

  function currentPage() {
    const path = window.location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }

  function renderHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    const current = currentPage();
    const navHtml = NAV_LINKS.map(
      (l) =>
        `<a href="${l.href}" class="${l.href === current ? "active" : ""}">${l.label}</a>`
    ).join("");

    mount.innerHTML = `
      <div class="container header-inner">
        <a href="index.html" class="brand" aria-label="${SITE.companyName} home">
          <img src="assets/images/brand/logo_cropped_under100kb.png" alt="${SITE.companyName} logo" width="42" height="42" />
          <span class="brand-text">${SITE.shortName.toUpperCase()}<small>${SITE.tagline}</small></span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="Primary">
          ${navHtml}
        </nav>
        <div class="header-cta">
          <a href="${SITE.phoneHref}" class="btn btn-navy btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.6 10.8C8 13.6 10.4 16 13.2 17.4l2.1-2.1c.3-.3.7-.4 1-.2 1.1.5 2.3.8 3.6.9.6 0 1.1.5 1.1 1.1V20.8c0 .6-.5 1.1-1.1 1.1C9.9 21.9 2.1 14.1 2.1 4.2 2.1 3.6 2.6 3.1 3.2 3.1H6.9c.6 0 1.1.5 1.1 1.1.1 1.3.4 2.5.9 3.6.2.3.1.7-.2 1l-2.1 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            <span class="btn-sm-label">Call Us</span>
          </a>
        </div>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="main-nav">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;

    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    const year = new Date().getFullYear();
    const catLinks = CATEGORIES.slice(0, 5)
      .map((c) => `<li><a href="catalog.html?cat=${c.id}">${c.label}</a></li>`)
      .join("");

    mount.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <div class="footer-logo">
              <img src="assets/images/brand/logo_cropped_under100kb.png" alt="${SITE.companyName} logo" width="36" height="36" />
              <span>${SITE.companyName}</span>
            </div>
            <p>${SITE.tagline}. Manufacturing trusted workwear for security, education, industry and corporate sectors since ${SITE.about.established}.</p>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="about.html">About Us</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="catalog.html">Full Catalog</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Catalog</h4>
            <ul>${catLinks}</ul>
          </div>
          <div class="footer-col">
            <h4>Get in Touch</h4>
            <ul>
              <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
              <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
              <li><a href="contact.html">All office locations &rarr;</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${year} ${SITE.companyName}. All rights reserved.</span>
          <!--<span>Template built for reuse across client sites.</span>-->
        </div>
      </div>
    `;
  }

  function initScrollReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (counters.length === 0) return;
    const animate = (el) => {
      const target = parseInt(el.getAttribute("data-counter"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => obs.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    initScrollReveal();
    initCounters();
  });
})();
