/* =========================================
   APP INIT
========================================= */

document.addEventListener("DOMContentLoaded", initApp);

/* =========================================
   INITIALIZE APP
========================================= */

async function initApp() {
  try {
    if (CONFIG.DEBUG) {
      console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    }

    State.init();
    Auth.init();

    const token = Auth.getToken();

    const user = Auth.user();

    if (!token || !user) {
      redirectToLogin();
      return;
    }

    const valid = await Auth.validate();

    if (!valid) {
      redirectToLogin();
      return;
    }

    const currentUser = Auth.user();

    if (
      !currentUser ||
      String(currentUser.role || "").toUpperCase() !== CONFIG.ROLE.ADMIN
    ) {
      await Auth.logout();
      redirectToLogin();
      return;
    }

    await Router.loadComponent("components/sidebar.html", "sidebar");

    await Router.loadComponent("components/navbar.html", "navbar");

    // Inisialisasi dropdown profil dan logout
    initProfileDropdown();
    renderProfileInfo();

    await Modal.init();

    Sidebar.init();

    Router.start();
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}

/* =========================================
   REDIRECT TO ADMIN LOGIN
========================================= */

function redirectToLogin() {
  window.location.replace("login.html");
}
