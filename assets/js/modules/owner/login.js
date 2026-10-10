/* =========================================================
   DIENG STAY
   OWNER LOGIN
========================================================= */

const OwnerLogin = (() => {
  let initialized = false;

  /* =======================================================
     INIT
  ======================================================= */

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[OWNER LOGIN] INIT");

    bindEvents();

    renderIcons();
  }

  /* =======================================================
     EVENTS
  ======================================================= */

  function bindEvents() {
    const form = document.getElementById("ownerLoginForm");

    const password = document.getElementById("ownerPassword");

    const toggle = document.getElementById("toggleOwnerPassword");

    form?.addEventListener("submit", handleSubmit);

    toggle?.addEventListener("click", () => {
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
          <i
            data-lucide="${showing ? "eye" : "eye-off"}"
          ></i>
        `;

      renderIcons();
    });
  }

  /* =======================================================
   BUTTON LOADING
======================================================= */

  function setLoading(isLoading) {
    const button = document.getElementById("btnOwnerLogin");

    if (!button) {
      return;
    }

    if (isLoading) {
      button.disabled = true;

      button.innerHTML = `
      <span class="owner-login-button-loading">
        <span class="owner-login-spinner"></span>
        Memproses...
      </span>
    `;

      return;
    }

    button.disabled = false;

    button.innerHTML = `
    <span>Masuk</span>
    <i data-lucide="arrow-right"></i>
  `;

    renderIcons();
  }

  /* =======================================================
   SUBMIT
======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    const username = String(
      document.getElementById("ownerUsername").value || "",
    ).trim();

    const password = String(
      document.getElementById("ownerPassword").value || "",
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

      console.log("[OWNER LOGIN] LOGIN START:", {
        username: username,
        passwordFilled: Boolean(password),
      });

      const result = await Auth.login(username, password, CONFIG.ROLE.OWNER);

      console.log("[OWNER LOGIN] LOGIN SUCCESS:", {
        user: result.data.user,
        tokenExists: Boolean(result.data.token),
      });

      const nama = result.data.user.nama || username;

      Toast.success("Selamat datang, " + nama + ".");

      window.location.href = "index.html";
    } catch (error) {
      setLoading(false);

      const message =
        error && error.message
          ? error.message
          : "Login gagal. Silakan periksa username dan password.";

      console.warn("[OWNER LOGIN] LOGIN FAILED:", message);

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
    init,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  OwnerLogin.init();
});
