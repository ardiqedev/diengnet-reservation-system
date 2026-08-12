/* =========================================
   APP INIT
========================================= */

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    if (CONFIG.DEBUG) {
      console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    }

    await Router.loadComponent("components/sidebar.html", "sidebar");
    await Router.loadComponent("components/navbar.html", "navbar");

    await Modal.init();

    Auth.init();
    State.init();
    Sidebar.init();
    Router.start();
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
}
