/* =========================================
   QEDEV PROFILE DROPDOWN
========================================= */

function initProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const toggle = document.getElementById("btnProfileDropdown");
  const menu = document.getElementById("profileMenu");
  const logoutButton = document.getElementById("btnLogout");

  if (!dropdown || !toggle || !menu || !logoutButton) {
    console.warn("[PROFILE] Elemen dropdown belum tersedia.");
    return;
  }

  if (dropdown.dataset.initialized === "true") return;

  dropdown.dataset.initialized = "true";

  toggle.addEventListener("click", () => {
    menu.hidden = !menu.hidden;

    toggle.setAttribute("aria-expanded", String(!menu.hidden));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  logoutButton.addEventListener("click", async () => {
    if (!window.confirm("Yakin ingin logout?")) return;

    logoutButton.disabled = true;

    try {
      await Auth.logout();
    } catch (error) {
      console.error("[PROFILE] Logout error:", error);
    } finally {
      window.location.replace("login.html");
    }
  });
}

/* =========================================
   RENDER PROFILE
========================================= */

function renderProfileInfo() {
  const user = Auth.user();

  if (!user) return;

  const name = String(
    user.nama || user.name || user.username || "Administrator",
  );

  const role = String(user.roleName || user.role || "Administrator");

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const fields = {
    profileName: name,
    profileRole: role,
    profileMenuName: name,
    profileMenuRole: role,
    profileAvatar: initials || "AD",
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  });
}
