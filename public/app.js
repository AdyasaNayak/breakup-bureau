const casesList = document.getElementById("casesList");
const caseForm = document.getElementById("caseForm");
const submitBtn = document.getElementById("submitBtn");
const refreshBtn = document.getElementById("refreshBtn");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");
const searchInput = document.getElementById("searchInput");
const filterChips = document.getElementById("filterChips");

const stats = {
  total: document.getElementById("statTotal"),
  open: document.getElementById("statOpen"),
  solved: document.getElementById("statSolved"),
  dismissed: document.getElementById("statDismissed"),
};

const state = { cases: [], filter: "all", query: "" };
let shredTimer;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function showMessage(el, text, type) {
  el.hidden = false;
  el.textContent = text;
  el.className = `message ${type}`;
}

function hideMessage(el) {
  el.hidden = true;
  el.textContent = "";
}

function caseNumber(id) {
  return `NB-${String(id).slice(-5).toUpperCase()}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "date unknown"
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function skeleton(count) {
  return Array.from(
    { length: count },
    () => `
      <article class="case-card is-loading" aria-hidden="true">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
      </article>
    `
  ).join("");
}

function emptyState(title, hint, showClear) {
  return `
    <div class="empty">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="10" y="14" width="44" height="36" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M10 14l6-6h32l6 6M22 24h20M22 32h20M22 40h12" stroke="currentColor" stroke-width="2" fill="none" />
      </svg>
      <p class="empty-title">${esc(title)}</p>
      <p class="empty-hint">${esc(hint)}</p>
      ${showClear ? '<button type="button" class="btn btn-ghost btn-sm" id="clearFilters">Clear filters</button>' : ""}
    </div>
  `;
}

function caseCard(c) {
  const open = c.status === "under investigation";
  const solved = c.status === "solved";
  return `
    <article class="case-card is-${esc(c.status.replace(" ", "-"))} dmg-${esc(c.damageLevel)}" data-id="${esc(c._id)}">
      ${!open ? '<span class="stamp" aria-hidden="true">Closed</span>' : ""}
      <div class="case-top">
        <span class="case-no">${caseNumber(c._id)}</span>
        <span class="badge dmg-${esc(c.damageLevel)}">${esc(c.damageLevel)}</span>
      </div>
      <h3>${esc(c.partner)}</h3>
      <p class="case-crime">${esc(c.crime)}</p>
      <p class="case-comp"><span>Compensation</span> ${esc(c.compensation)}</p>
      <div class="case-foot">
        <span class="status status-${esc(c.status.replace(" ", "-"))}">${esc(c.status)}</span>
        <span class="meta">Filed ${formatDate(c.createdAt)}</span>
      </div>
      <div class="case-actions">
        ${solved ? "" : '<button type="button" class="btn btn-sm btn-ok" data-action="solve">Mark solved</button>'}
        ${!open && !solved ? "" : '<button type="button" class="btn btn-sm btn-ghost" data-action="dismiss">Dismiss</button>'}
        <button type="button" class="btn btn-sm btn-danger" data-action="delete">Shred case</button>
      </div>
    </article>
  `;
}

function render() {
  const { cases, filter, query } = state;

  const counts = {
    all: cases.length,
    open: cases.filter((c) => c.status === "under investigation").length,
    solved: cases.filter((c) => c.status === "solved").length,
    dismissed: cases.filter((c) => c.status === "dismissed").length,
  };
  stats.total.textContent = counts.all;
  stats.open.textContent = counts.open;
  stats.solved.textContent = counts.solved;
  stats.dismissed.textContent = counts.dismissed;
  for (const el of document.querySelectorAll("[data-count]")) {
    el.textContent = counts[el.dataset.count];
  }
  for (const chip of filterChips.querySelectorAll(".chip")) {
    const active = chip.dataset.filter === filter;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  }

  const q = query.trim().toLowerCase();
  const visible = cases.filter((c) => {
    const statusOk = filter === "all" || c.status === filter;
    const searchOk =
      !q ||
      [c.partner, c.crime, c.compensation, c.damageLevel].some((v) =>
        String(v).toLowerCase().includes(q)
      );
    return statusOk && searchOk;
  });

  hideMessage(listMessage);

  if (!cases.length) {
    casesList.innerHTML = emptyState(
      "The bureau is quiet… for now.",
      "File the first complaint above and we'll open a case.",
      false
    );
    return;
  }

  if (!visible.length) {
    casesList.innerHTML = emptyState(
      "No cases match.",
      "Try another filter or search term.",
      true
    );
    return;
  }

  casesList.innerHTML = visible.map(caseCard).join("");
}

async function loadCases() {
  casesList.innerHTML = skeleton(3);
  hideMessage(listMessage);

  try {
    const res = await fetch("/cases");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load cases");
    state.cases = data;
    render();
  } catch (err) {
    casesList.innerHTML = "";
    showMessage(listMessage, err.message, "error");
  }
}

caseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(caseForm).entries());

  submitBtn.disabled = true;
  submitBtn.textContent = "Filing…";
  try {
    const res = await fetch("/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not file case");

    caseForm.reset();
    state.filter = "all";
    searchInput.value = state.query = "";
    showMessage(formMessage, "Complaint filed. Case is now under investigation.", "success");
    await loadCases();
    casesList.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showMessage(formMessage, err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Stamp & file case";
  }
});

casesList.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  if (button.id === "clearFilters") {
    state.filter = "all";
    state.query = "";
    searchInput.value = "";
    render();
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  const card = button.closest(".case-card");
  const id = card.dataset.id;

  if (action === "delete") {
    if (!button.dataset.armed) {
      button.dataset.armed = "true";
      button.textContent = "Confirm shred?";
      clearTimeout(shredTimer);
      shredTimer = setTimeout(() => {
        button.dataset.armed = "";
        button.textContent = "Shred case";
      }, 3000);
      return;
    }
    clearTimeout(shredTimer);
  }

  try {
    if (action === "delete") {
      const res = await fetch(`/cases/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
    } else {
      const status = action === "solve" ? "solved" : "dismissed";
      const res = await fetch(`/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
    }
    await loadCases();
  } catch (err) {
    showMessage(listMessage, err.message, "error");
  }
});

filterChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  state.filter = chip.dataset.filter;
  render();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  render();
});

refreshBtn.addEventListener("click", loadCases);
loadCases();
