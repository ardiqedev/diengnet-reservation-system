/* =========================================================
   DIENGNET PMS
   ADMIN LOGIN
========================================================= */

const AdminLogin = (() => {
  let initialized = false;

  /* =======================================================
     INIT
  ======================================================= */

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[ADMIN LOGIN] INIT");

    bindEvents();

    renderIcons();
  }

  /* =======================================================
     EVENTS
  ======================================================= */

  function bindEvents() {
    const form = document.getElementById("adminLoginForm");

    const password = document.getElementById("adminPassword");

    const toggle = document.getElementById("toggleAdminPassword");

    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (!password) {
          return;
        }

        const showing = password.type === "text";

        password.type = showing ? "password" : "text";

        toggle.setAttribute(
          "aria-label",
          showing ? "Tampilkan password" : "Sembunyikan password",
        );

        toggle.innerHTML = `
          <i data-lucide="${showing ? "eye" : "eye-off"}"></i>
        `;

        renderIcons();
      });
    }
  }

  /* =======================================================
     BUTTON LOADING
  ======================================================= */

  function setLoading(isLoading) {
    const button = document.getElementById("btnAdminLogin");

    if (!button) {
      return;
    }

    if (isLoading) {
      button.disabled = true;

      button.innerHTML = `
        <span class="admin-login-button-loading">
          <span class="admin-login-spinner"></span>
          Memproses...
        </span>
      `;

      return;
    }

    button.disabled = false;

    button.innerHTML = `
      <span>Masuk ke Dashboard</span>
      <i data-lucide="arrow-right"></i>
    `;

    renderIcons();
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  /* =======================================================
   SUBMIT
======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    const username = String(
      document.getElementById("adminUsername").value || "",
    ).trim();

    const password = String(
      document.getElementById("adminPassword").value || "",
    );

    if (!username) {
      Toast.warning("Username wajib diisi.");
      return;
    }

    if (!password) {
      Toast.warning("Password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      console.log("[ADMIN LOGIN] LOGIN START:", {
        username: username,
        passwordFilled: Boolean(password),
      });

      const result = await Auth.login(username, password, CONFIG.ROLE.ADMIN);

      console.log("[ADMIN LOGIN] LOGIN SUCCESS:", {
        user: result.data.user,
        tokenExists: Boolean(result.data.token),
      });

      Toast.success(
        "Selamat datang, " + (result.data.user.nama || username) + ".",
      );

      window.location.href = "index.html";
    } catch (error) {
      setLoading(false);

      const message =
        error && error.message
          ? error.message
          : "Login gagal. Periksa username dan password.";

      console.warn("[ADMIN LOGIN] LOGIN FAILED:", message);

      Toast.error(message);
    }
  }

  /* =======================================================
     ICON
  ======================================================= */

  function renderIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  /* =======================================================
     PUBLIC
  ======================================================= */

  return {
    init: init,
  };
})();

/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  AdminLogin.init();
});
