/* stuff.js - Robust staff scripts for login + dashboard
   - Handles fetch errors
   - Validates DOM elements before use
   - Plays a small animation before redirecting on success
   - Keeps original dashboard functions (flights/bookings/meals)
*/

async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Network error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("loadJSON error:", err);
      throw err;
    }
  }
  
  /* LOGIN LOGIC */
  async function login() {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const errorEl = document.getElementById("error");
    const cardEl = document.querySelector(".login-card");
  
    if (!emailEl || !passwordEl || !errorEl) {
      console.error("Missing login form elements in DOM");
      return;
    }
  
    const email = emailEl.value.trim();
    const password = passwordEl.value;
  
    if (!email || !password) {
      errorEl.textContent = "Please enter email and password";
      return;
    }
  
    try {
      const staff = await loadJSON("data/staff.json");
      const user = Array.isArray(staff) ? staff.find(s => s.email === email && s.password === password) : null;
  
      if (!user) {
        errorEl.textContent = "Invalid email or password";
        return;
      }
  
      // save user
      localStorage.setItem("staff", JSON.stringify(user));
  
      // optional success animation then redirect
      if (cardEl) {
        cardEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        cardEl.style.opacity = "0";
        cardEl.style.transform = "scale(0.98) translateY(-10px)";
        // wait for animation to finish
        setTimeout(() => {
          window.location.href = "staff-dashboard.html";
        }, 600);
      } else {
        window.location.href = "staff-dashboard.html";
      }
    } catch (err) {
      console.error("Login error:", err);
      errorEl.textContent = "Server error. Please try again later.";
    }
  }
  
  /* LOGOUT */
  function logout() {
    localStorage.removeItem("staff");
    // if on a page where login exists, redirect
    window.location.href = "stuff-login.html";
  }
  
  /* NAVIGATION (dashboard) */
  function showPage(pageId) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const el = document.getElementById(pageId);
    if (el) el.classList.add("active");
  }
  
  /* DASHBOARD LOADING */
  window.addEventListener("DOMContentLoaded", async () => {
    // If on dashboard page, init data
    const path = location.pathname.toLowerCase();
    if (path.includes("dashboard") || path.includes("staff-dashboard")) {
      try {
        await loadFlights();
        await loadBookings();
        await loadMeals();
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        // Optionally show a visible error in the UI
      }
    }
  });
  
  /* FLIGHTS */
  let flightsData = [];
  let selectedFlight = null;
  
  async function loadFlights() {
    try {
      flightsData = await loadJSON("data/flights.json");
    } catch (err) {
      console.error("Could not load flights.json", err);
      flightsData = [];
    }
  
    const tbody = document.querySelector("#flightsTable tbody");
    if (!tbody) return;
  
    tbody.innerHTML = "";
  
    flightsData.forEach((f, index) => {
      const statusClass = String(f.status || "").toLowerCase().replace(/\s+/g, "-");
      tbody.innerHTML += `
        <tr>
          <td>${escapeHtml(f.id)}</td>
          <td>${escapeHtml(f.destination || "")}</td>
          <td>${escapeHtml(f.time || "")}</td>
          <td>${escapeHtml(f.gate || "")}</td>
          <td><span class="status ${statusClass}">${escapeHtml(f.status || "")}</span></td>
          <td><button onclick="openModal(${index})">Edit</button></td>
        </tr>
      `;
    });
  }
  
  /* OPEN EDIT MODAL */
  function openModal(index) {
    selectedFlight = index;
    const f = flightsData[index];
    if (!f) return;
  
    const gateEl = document.getElementById("editGate");
    const statusEl = document.getElementById("editStatus");
    const modal = document.getElementById("editModal");
  
    if (gateEl) gateEl.value = f.gate || "";
    if (statusEl) statusEl.value = f.status || "On Time";
    if (modal) modal.style.display = "flex";
  }
  
  /* CLOSE MODAL */
  function closeModal() {
    const modal = document.getElementById("editModal");
    if (modal) modal.style.display = "none";
  }
  
  /* SAVE FLIGHT EDIT */
  function saveFlight() {
    if (selectedFlight === null || selectedFlight === undefined) return;
    const gate = document.getElementById("editGate") ? document.getElementById("editGate").value : "";
    const status = document.getElementById("editStatus") ? document.getElementById("editStatus").value : "";
  
    if (flightsData[selectedFlight]) {
      flightsData[selectedFlight].gate = gate;
      flightsData[selectedFlight].status = status;
    }
  
    loadFlights();
    closeModal();
  }
  
  /* BOOKINGS */
  async function loadBookings() {
    let bookings = [];
    try {
      bookings = await loadJSON("data/bookings.json");
    } catch (err) {
      console.error("Could not load bookings.json", err);
      bookings = [];
    }
  
    const tbody = document.querySelector("#bookingsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
  
    bookings.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>${escapeHtml(b.passenger)}</td>
          <td>${escapeHtml(b.passport)}</td>
          <td>${escapeHtml(b.seat)}</td>
          <td>${escapeHtml(b.flightId)}</td>
        </tr>
      `;
    });
  }
  
  /* MEALS */
  async function loadMeals() {
    let meals = [];
    try {
      meals = await loadJSON("data/meals.json");
    } catch (err) {
      console.error("Could not load meals.json", err);
      meals = [];
    }
  
    const tbody = document.querySelector("#mealsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
  
    meals.forEach(m => {
      tbody.innerHTML += `
        <tr>
          <td>${escapeHtml(m.passenger)}</td>
          <td>${escapeHtml(m.meal)}</td>
          <td>${escapeHtml(m.flightId)}</td>
        </tr>
      `;
    });
  }
  
  /* Utility: escape HTML to avoid injection when rendering JSON content */
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  