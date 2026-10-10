/* =========================================================
   DIENG STAY
   OWNER WORKSPACE
========================================================= */

const OwnerApp = (() => {
  let initialized = false;

  /* =======================================================
     INIT
  ======================================================= */

  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[OWNER] WORKSPACE INIT");

    Auth.init();

    const valid = await guard();

    if (!valid) {
      return;
    }

    renderUser();

    const summary = await loadDashboardSummary();

    renderDashboardSummary(summary);

    bindEvents();

    renderIcons();

    const payout = await loadPayoutSummary();
    renderPayoutSummary(payout);
  }

  /* =======================================================
     AUTH GUARD
  ======================================================= */

  /* =======================================================
   AUTH GUARD
======================================================= */

  async function guard() {
    if (!Auth.check()) {
      console.warn("[OWNER] AUTH REQUIRED");

      window.location.href = "./login.html";

      return false;
    }

    const valid = await Auth.validate();

    if (!valid) {
      console.warn("[OWNER] SESSION INVALID");

      window.location.href = "./login.html";

      return false;
    }

    return true;
  }

  /* =======================================================
     USER
  ======================================================= */

  function renderUser() {
    const user = Auth.user();

    const greeting = document.querySelector(".owner-greeting h1");

    if (!greeting || !user) {
      return;
    }

    const nama = String(user.nama || user.username || "Owner").trim();

    greeting.textContent = `Halo, ${nama} 👋`;
  }

  async function loadDashboardSummary() {
    const user = Auth.user();

    if (!user?.id) {
      console.warn("[OWNER] USER ID TIDAK DITEMUKAN");
      return null;
    }

    try {
      console.log("[OWNER] LOAD DASHBOARD SUMMARY:", user.id);

      const response = await API.post("owner.dashboardSummary", {
        ownerId: user.id,
      });

      if (!response?.success) {
        console.error("[OWNER] DASHBOARD SUMMARY ERROR:", response?.message);

        return null;
      }

      const data = response.data || {};

      console.log("[OWNER] DASHBOARD SUMMARY:", data);

      return data;
    } catch (error) {
      console.error("[OWNER] LOAD DASHBOARD SUMMARY ERROR:", error);

      return null;
    }
  }

  function renderDashboardSummary(data) {
    const penginapan = document.getElementById("ownerPenginapanCount");

    const checkIn = document.getElementById("ownerCheckInCount");

    const checkOut = document.getElementById("ownerCheckOutCount");

    const kamarAktif = document.getElementById("ownerActiveRoomCount");

    if (penginapan) {
      penginapan.textContent = Number(data?.penginapanCount || 0);
    }

    if (checkIn) {
      checkIn.textContent = Number(data?.checkIn || 0);
    }

    if (checkOut) {
      checkOut.textContent = Number(data?.checkOut || 0);
    }

    if (kamarAktif) {
      kamarAktif.textContent = Number(data?.kamarAktif || 0);
    }
  }

  async function loadPayoutSummary() {
    const user = Auth.user();

    if (!user?.id) {
      console.warn("[OWNER] USER ID TIDAK DITEMUKAN");
      return null;
    }

    try {
      console.log("[OWNER] LOAD PAYOUT SUMMARY:", user.id);

      const response = await API.post("owner.payoutSummary", {
        ownerId: user.id,
      });

      if (!response?.success) {
        console.error("[OWNER] PAYOUT SUMMARY ERROR:", response?.message);

        return null;
      }

      const data = response.data || {};

      console.log("[OWNER] PAYOUT SUMMARY:", data);

      return data;
    } catch (error) {
      console.error("[OWNER] LOAD PAYOUT SUMMARY ERROR:", error);

      return null;
    }
  }

  function renderPayoutSummary(data) {
    const pending = document.getElementById("ownerPayoutPendingAmount");

    const paid = document.getElementById("ownerPayoutPaidAmount");

    const formatCurrency = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    });

    if (pending) {
      pending.textContent = formatCurrency.format(
        Number(data?.pendingAmount || 0),
      );
    }

    if (paid) {
      paid.textContent = formatCurrency.format(Number(data?.paidAmount || 0));
    }
  }

  /* =======================================================
     EVENTS
  ======================================================= */

  function bindEvents() {
    document.querySelectorAll(".owner-nav-item").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".owner-nav-item").forEach((item) => {
          item.classList.remove("active");
        });

        button.classList.add("active");
      });
    });

    document.querySelectorAll(".owner-action-card").forEach((button) => {
      button.addEventListener("click", () => {
        console.log("[OWNER] ACTION CLICK");
      });
    });

    /* =====================================
     ACCOUNT
  ===================================== */

    const accountButton = document.getElementById("ownerAccountButton");

    const accountMenu = document.getElementById("ownerAccountMenu");

    const logoutButton = document.getElementById("ownerLogoutButton");

    accountButton?.addEventListener("click", (event) => {
      event.stopPropagation();

      if (!accountMenu) {
        return;
      }

      accountMenu.hidden = !accountMenu.hidden;
    });

    document.addEventListener("click", () => {
      if (accountMenu) {
        accountMenu.hidden = true;
      }
    });

    logoutButton?.addEventListener("click", handleLogout);
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
   LOGOUT
======================================================= */

  async function handleLogout() {
    const logoutButton = document.getElementById("ownerLogoutButton");

    if (logoutButton) {
      logoutButton.disabled = true;
    }

    try {
      console.log("[OWNER] LOGOUT START");

      await Auth.logout();

      Toast.success("Anda berhasil keluar.");

      window.location.href = "./login.html";
    } catch (error) {
      console.error("[OWNER] LOGOUT ERROR:", error);

      /*
       * Auth.logout() menggunakan finally
       * sehingga local session tetap dibersihkan.
       */

      Toast.error(error?.message || "Logout gagal.");

      window.location.href = "./login.html";
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
  OwnerApp.init();
});
