/* ============================================================
   CATALOG PAGE BEHAVIOR
   ============================================================ */
(function () {
  let activeCategory = "all";
  let activeQuery = "";

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function renderPills() {
    const mount = document.getElementById("category-pills");
    const allPill = `<button class="cat-pill ${activeCategory === "all" ? "active" : ""}" data-cat="all">All (${PRODUCTS.length})</button>`;
    const pills = CATEGORIES.map((c) => {
      const count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `<button class="cat-pill ${activeCategory === c.id ? "active" : ""}" data-cat="${c.id}">${c.label} (${count})</button>`;
    }).join("");
    mount.innerHTML = allPill + pills;

    mount.querySelectorAll(".cat-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-cat");
        renderPills();
        renderGrid();
      });
    });
  }

  function filteredProducts() {
    return PRODUCTS.filter((p) => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const haystack = (p.name + " " + p.short + " " + getCategoryLabel(p.category)).toLowerCase();
      const matchesQuery = activeQuery.trim() === "" || haystack.includes(activeQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }

  function cardHtml(p, i) {
    return `
      <div class="card product-card" data-reveal data-reveal-delay="${Math.min((i % 4) + 1, 4)}" data-id="${p.id}" tabindex="0" role="button" aria-label="View details for ${p.name}">
        <div class="product-card-img">
          ${p.placeholder ? '<span class="placeholder-tag">Sample layout</span>' : ""}
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-card-body">
          <span class="badge">${getCategoryLabel(p.category)}</span>
          <h3>${p.name}</h3>
          <p>${p.short}</p>
        </div>
      </div>
    `;
  }

  function attachReveal(container) {
    const els = container.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
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
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
  }

  function renderGrid() {
    const grid = document.getElementById("catalog-grid");
    const empty = document.getElementById("empty-state");
    const countEl = document.getElementById("result-count");
    const items = filteredProducts();

    countEl.textContent = `Showing ${items.length} of ${PRODUCTS.length} products`;

    if (items.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = items.map(cardHtml).join("");
    attachReveal(grid);

    grid.querySelectorAll(".product-card").forEach((card) => {
      const open = () => openModal(card.getAttribute("data-id"));
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  // ---------------- Modal ----------------
  const overlay = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function openModal(productId) {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return;
    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.img];

    modalBody.innerHTML = `
      <div class="modal-gallery">
        <div class="modal-gallery-main"><img id="modal-main-img" src="${gallery[0]}" alt="${p.name}" /></div>
        ${gallery.length > 1 ? `<div class="modal-thumbs">${gallery
          .map(
            (g, i) =>
              `<button class="modal-thumb ${i === 0 ? "active" : ""}" data-src="${g}" aria-label="View image ${i + 1}"><img src="${g}" alt="" /></button>`
          )
          .join("")}</div>` : ""}
      </div>
      <div class="modal-info">
        <span class="badge badge-accent">${getCategoryLabel(p.category)}</span>
        <h2 id="modal-title">${p.name}</h2>
        ${p.placeholder ? '<p class="modal-placeholder-note">This category uses a sample layout — swap in product-specific photography when available.</p>' : ""}
        <p class="body-text">${p.description}</p>
        <ul class="modal-features">
          ${p.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
        <div class="modal-actions">
          <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn btn-primary">Request a Quote</a>
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener" class="btn btn-outline-navy">Ask on WhatsApp</a>
        </div>
      </div>
    `;

    modalBody.querySelectorAll(".modal-thumb").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        document.getElementById("modal-main-img").src = thumb.getAttribute("data-src");
        modalBody.querySelectorAll(".modal-thumb").forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { overlay.hidden = true; }, 250);
  }

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  // ---------------- Search ----------------
  function initSearch() {
    const input = document.getElementById("catalog-search");
    let debounceTimer;
    input.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeQuery = input.value;
        renderGrid();
      }, 150);
    });
  }

  document.getElementById("clear-filters")?.addEventListener("click", () => {
    activeCategory = "all";
    activeQuery = "";
    document.getElementById("catalog-search").value = "";
    renderPills();
    renderGrid();
  });

  // ---------------- Init ----------------
  document.addEventListener("DOMContentLoaded", () => {
    const catParam = getQueryParam("cat");
    if (catParam && CATEGORIES.some((c) => c.id === catParam)) {
      activeCategory = catParam;
    }
    const productParam = getQueryParam("product");

    renderPills();
    renderGrid();
    initSearch();

    if (productParam) {
      setTimeout(() => openModal(productParam), 200);
    }
  });
})();
