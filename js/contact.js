/* ============================================================
   CONTACT PAGE BEHAVIOR
   ============================================================ */
(function () {
  let activeLocation = 0;

  function mapSrc(loc) {
    // Simple embeddable OSM map centered on lat/lng — no API key required.
    const delta = 0.01;
    const bbox = [loc.lng - delta, loc.lat - delta, loc.lng + delta, loc.lat + delta].join(",");
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
  }

  function renderLocationTabs() {
    const mount = document.getElementById("location-tabs");
    mount.innerHTML = SITE.locations
      .map((loc, i) => `<button class="location-tab ${i === activeLocation ? "active" : ""}" data-idx="${i}">${loc.name.split("—")[0].trim()}</button>`)
      .join("");
    mount.querySelectorAll(".location-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeLocation = parseInt(btn.getAttribute("data-idx"), 10);
        renderLocationTabs();
        renderLocationDetail();
      });
    });
  }

  function renderLocationDetail() {
    const loc = SITE.locations[activeLocation];
    document.getElementById("location-detail").innerHTML = `
      <div class="location-card">
        <h3>${loc.name}</h3>
        <dl>
          <dt>Address</dt><dd>${loc.address}</dd>
          <dt>Phone</dt><dd><a href="tel:${loc.phone.replace(/\s+/g, "")}">${loc.phone}</a></dd>
          <dt>Email</dt><dd><a href="mailto:${loc.email}">${loc.email}</a></dd>
        </dl>
      </div>
    `;
    document.getElementById("map-frame").innerHTML = `<iframe src="${mapSrc(loc)}" title="Map showing ${loc.name}" loading="lazy"></iframe>`;
  }

  function fillQuickContacts() {
    document.getElementById("quick-call-num").textContent = SITE.phone;
    document.getElementById("quick-call").setAttribute("href", SITE.phoneHref);
    document.getElementById("quick-email-addr").textContent = SITE.email;
    document.getElementById("quick-email").setAttribute("href", "mailto:" + SITE.email);
    document.getElementById("quick-whatsapp").setAttribute("href", SITE.whatsapp);
  }

  function prefillProductInterest() {
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    if (!product) return;
    const message = document.getElementById("message");
    if (message && !message.value) {
      message.value = `I'm interested in: ${product}\n\n`;
      message.focus();
      message.setSelectionRange(message.value.length, message.value.length);
    }
  }

  function initForm() {
    const form = document.getElementById("contact-form");
    const success = document.getElementById("form-success");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Front-end only: no backend wired up yet. Swap this block
      // for a real fetch() call to your form endpoint when ready.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      success.classList.add("show");
      form.reset();
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderLocationTabs();
    renderLocationDetail();
    fillQuickContacts();
    prefillProductInterest();
    initForm();
  });
})();
