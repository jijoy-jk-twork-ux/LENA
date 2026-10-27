(() => {
  "use strict";

  const updates = Array.isArray(window.RP_UPDATES) ? window.RP_UPDATES.slice() : [];
  const $ = (selector) => document.querySelector(selector);
  const views = ["home", "explore", "events", "history", "detail", "empty"];
  const categories = ["All", "Vehicles", "Locations", "Jobs", "Missions", "Events", "Patch Notes", "Announcements"];
  let currentView = "home";
  let selectedCategory = "All";
  let activeUpdate = null;
  let searchTerm = "";

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));

  const formatDate = (value) => {
    if (!value) return "Date not set";
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return escapeHTML(value);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  const safeImage = (value) => {
    const path = String(value || "").trim();
    if (!path) return "";
    // Permit relative repository paths and HTTPS image URLs only.
    if (/^https:\/\/[^"'<> ]+$/i.test(path)) return path;
    if (/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|gif|svg)$/i.test(path)) return path;
    return "";
  };

  const imageMarkup = (path, className, alt) => {
    const safe = safeImage(path);
    if (!safe) return `<div class="${className} image-placeholder" role="img" aria-label="${escapeHTML(alt || "Image unavailable")}"><span>RP</span></div>`;
    return `<img class="${className}" src="${escapeHTML(safe)}" alt="${escapeHTML(alt || "")}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${className} image-placeholder',innerHTML:'<span>RP</span>'}))">`;
  };

  const searchableText = (item) => [
    item.title, item.category, item.version, item.summary,
    ...(Array.isArray(item.content) ? item.content : []),
    ...(Array.isArray(item.changes) ? item.changes : [])
  ].join(" ").toLowerCase();

  const filteredUpdates = (category = selectedCategory, query = searchTerm) => {
    return updates.filter(item => {
      const categoryMatch = category === "All" || item.category === category;
      const queryMatch = !query || searchableText(item).includes(query.toLowerCase());
      return categoryMatch && queryMatch;
    }).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  };

  const cardMarkup = (item) => `
    <button class="update-card" data-open-update="${escapeHTML(item.id)}">
      ${imageMarkup(item.image, "card-image", item.title)}
      <span class="card-copy">
        <span class="card-meta"><span class="pill">${escapeHTML(item.category || "Update")}</span><span>${formatDate(item.date)}</span></span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.summary || "")}</p>
        <span class="meta-line">Version ${escapeHTML(item.version || "—")} · Read details →</span>
      </span>
    </button>`;

  const emptyMarkup = (message = "No updates in this section yet.") => `<div class="no-results">${escapeHTML(message)}</div>`;

  function renderFeatured() {
    const item = updates.find(x => x.featured) || updates.slice().sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
    $("#featured-container").innerHTML = item ? `
      <button class="featured-card" data-open-update="${escapeHTML(item.id)}">
        ${imageMarkup(item.image, "featured-image", item.title)}
        <div class="featured-body">
          <span class="featured-kicker">★ Featured update · ${escapeHTML(item.category || "News")}</span>
          <h2>${escapeHTML(item.title)}</h2>
          <p>${escapeHTML(item.summary || "")}</p>
          <div class="meta-line"><span>${formatDate(item.date)}</span><span>•</span><span>Version ${escapeHTML(item.version || "—")}</span><span class="pill">Read update ↗</span></div>
        </div>
      </button>` : emptyMarkup("Add an update in data/updates.js to get started.");
  }

  function renderCategoryChips() {
    $("#category-strip").innerHTML = categories.filter(x => x !== "All").map(category =>
      `<button class="category-chip" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`
    ).join("");
  }

  function renderLatest() {
    const items = updates.slice().sort((a,b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 5);
    $("#latest-list").innerHTML = items.length ? items.map(cardMarkup).join("") : emptyMarkup();
  }

  function renderExplore() {
    $("#filter-list").innerHTML = categories.map(category =>
      `<button class="filter-chip ${selectedCategory === category ? "selected" : ""}" data-filter-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`
    ).join("");
    const results = filteredUpdates();
    $("#results-label").textContent = `${results.length} update${results.length === 1 ? "" : "s"} found`;
    $("#search-results").innerHTML = results.length ? results.map(cardMarkup).join("") : emptyMarkup("No matching updates. Try another search or category.");
  }

  function renderEvents() {
    const items = filteredUpdates("Events", "").filter(x => !x.eventDate || x.eventDate >= new Date().toISOString().slice(0,10));
    $("#events-list").innerHTML = items.length ? items.map(item => `
      <button class="update-card" data-open-update="${escapeHTML(item.id)}">
        ${imageMarkup(item.image, "card-image", item.title)}
        <span class="card-copy">
          <span class="card-meta"><span class="pill">EVENT</span><span>${item.eventDate ? `Date: ${formatDate(item.eventDate)}` : "Schedule to be announced"}</span></span>
          <h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.summary || "")}</p>
        </span>
      </button>`).join("") : emptyMarkup("No upcoming events published.");
  }

  function renderHistory() {
    const byVersion = new Map();
    updates.slice().sort((a,b) => String(b.date || "").localeCompare(String(a.date || ""))).forEach(item => {
      const version = item.version || "Unversioned";
      if (!byVersion.has(version)) byVersion.set(version, { version, date: item.date, items: [] });
      byVersion.get(version).items.push(item);
    });
    const entries = Array.from(byVersion.values());
    $("#version-list").innerHTML = entries.length ? entries.map(entry => `
      <section class="version-card">
        <div class="version-top"><strong>Version ${escapeHTML(entry.version)}</strong><span class="version-date">${formatDate(entry.date)}</span></div>
        <div class="version-items">
          ${entry.items.map(item => `<div>• <button class="text-button" data-open-update="${escapeHTML(item.id)}">${escapeHTML(item.title)}</button> <span class="version-date">(${escapeHTML(item.category || "Update")})</span></div>`).join("")}
        </div>
      </section>`).join("") : emptyMarkup("No version history yet.");
  }

  function renderDetail(item) {
    if (!item) return;
    activeUpdate = item;
    const paragraphs = Array.isArray(item.content) ? item.content : [item.content || item.summary || ""];
    const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
    $("#detail-content").innerHTML = `
      ${imageMarkup(item.image, "detail-hero", item.title)}
      <div class="meta-line"><span class="pill">${escapeHTML(item.category || "Update")}</span><span>${formatDate(item.date)}</span><span>Version ${escapeHTML(item.version || "—")}</span></div>
      <h1 class="detail-title">${escapeHTML(item.title)}</h1>
      <p class="detail-summary">${escapeHTML(item.summary || "")}</p>
      <div class="detail-content">${paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join("")}</div>
      ${Array.isArray(item.changes) && item.changes.length ? `<h2 style="margin:22px 0 10px">What's changed</h2><ul class="version-items">${item.changes.map(change => `<li>${escapeHTML(change)}</li>`).join("")}</ul>` : ""}
      ${gallery.length ? `<div class="detail-gallery">${gallery.map((img, i) => imageMarkup(img, "", `${item.title} image ${i + 1}`)).join("")}</div>` : ""}
      <div class="meta-line" style="margin-top:24px"><span>Published ${formatDate(item.date)}</span><span>•</span><span>City Browser</span></div>`;
    showView("detail");
  }

  function showView(name) {
    currentView = name;
    views.forEach(view => {
      const el = document.getElementById(`${view}-view`);
      if (el) el.classList.toggle("active", view === name);
    });
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.classList.toggle("active", button.dataset.nav === name);
    });
    $("#main-content").scrollTo({ top: 0, behavior: "instant" });
    if (name === "explore") renderExplore();
    if (name === "events") renderEvents();
    if (name === "history") renderHistory();
    $("#search-input").closest(".search-wrap").style.display = name === "detail" || name === "empty" ? "none" : "block";
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function applySearch() {
    searchTerm = $("#search-input").value.trim();
    $("#clear-search").hidden = !searchTerm;
    if (searchTerm) {
      selectedCategory = "All";
      showView("explore");
      renderExplore();
      if (!filteredUpdates().length) showView("empty");
    } else if (currentView === "explore" || currentView === "empty") {
      showView("explore");
      renderExplore();
    }
  }

  document.addEventListener("click", event => {
    const openButton = event.target.closest("[data-open-update]");
    if (openButton) {
      const item = updates.find(x => x.id === openButton.dataset.openUpdate);
      if (item) renderDetail(item);
      return;
    }
    const navButton = event.target.closest("[data-nav]");
    if (navButton) {
      searchTerm = "";
      $("#search-input").value = "";
      $("#clear-search").hidden = true;
      selectedCategory = "All";
      showView(navButton.dataset.nav);
      return;
    }
    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      selectedCategory = categoryButton.dataset.category;
      searchTerm = "";
      $("#search-input").value = "";
      $("#clear-search").hidden = true;
      showView("explore");
      renderExplore();
      return;
    }
    const filterButton = event.target.closest("[data-filter-category]");
    if (filterButton) {
      selectedCategory = filterButton.dataset.filterCategory;
      renderExplore();
    }
  });

  $("#search-input").addEventListener("input", applySearch);
  $("#clear-search").addEventListener("click", () => {
    $("#search-input").value = "";
    applySearch();
    $("#search-input").focus();
  });
  $("#back-from-detail").addEventListener("click", () => showView("home"));
  $("#reset-search").addEventListener("click", () => {
    $("#search-input").value = "";
    searchTerm = "";
    selectedCategory = "All";
    $("#clear-search").hidden = true;
    showView("explore");
    renderExplore();
  });
  $("#refresh-btn").addEventListener("click", () => {
    // GitHub Pages is static: reload the page to fetch the latest published files.
    window.location.reload();
  });

  renderFeatured();
  renderCategoryChips();
  renderLatest();
  renderExplore();
  renderEvents();
  renderHistory();

  // If a category chip is tapped on Home, it opens Explore filtered to that category.
  $("#category-strip").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    showView("explore");
    renderExplore();
  });
})();
