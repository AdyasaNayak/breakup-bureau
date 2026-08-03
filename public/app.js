const casesList = document.getElementById("casesList");
const caseForm = document.getElementById("caseForm");
const refreshBtn = document.getElementById("refreshBtn");
const formMessage = document.getElementById("formMessage");
const listMessage = document.getElementById("listMessage");

function showMessage(el, text, type) {
  el.hidden = false;
  el.textContent = text;
  el.className = `message ${type}`;
}

async function loadCases() {
  listMessage.hidden = true;
  casesList.innerHTML = "<p>Loading cases…</p>";

  try {
    const res = await fetch("/cases");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load cases");
    }

    if (!data.length) {
      casesList.innerHTML = "<p>No cases on file. The bureau is quiet… for now.</p>";
      return;
    }

    casesList.innerHTML = data
      .map(
        (c) => `
      <article class="case-card" data-id="${c._id}">
        <h3>${c.partner}</h3>
        <p><strong>Crime:</strong> ${c.crime}</p>
        <p><strong>Damage:</strong> ${c.damageLevel}</p>
        <p><strong>Compensation:</strong> ${c.compensation}</p>
        <p class="meta"><strong>Status:</strong> ${c.status}</p>
        <div class="case-actions">
          <button type="button" class="ok" data-action="solve">Mark solved</button>
          <button type="button" class="secondary" data-action="dismiss">Dismiss</button>
          <button type="button" class="danger" data-action="delete">Shred case</button>
        </div>
      </article>
    `
      )
      .join("");
  } catch (err) {
    casesList.innerHTML = "";
    showMessage(listMessage, err.message, "error");
  }
}

caseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(caseForm);
  const body = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not file case");

    caseForm.reset();
    showMessage(formMessage, "Complaint filed successfully.", "success");
    loadCases();
  } catch (err) {
    showMessage(formMessage, err.message, "error");
  }
});

casesList.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const card = button.closest(".case-card");
  const id = card.dataset.id;
  const action = button.dataset.action;

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
    loadCases();
  } catch (err) {
    showMessage(listMessage, err.message, "error");
  }
});

refreshBtn.addEventListener("click", loadCases);
loadCases();