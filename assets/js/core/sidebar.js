/* =========================================
   SIDEBAR MODULE
========================================= */

const Sidebar = {
  currentPage: "dashboard",

  /* =====================================
     INIT
  ===================================== */

  init() {
    this.restoreLastPage();

    this.bindEvents();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    if (this._eventsBound) {
      return;
    }

    this._eventsBound = true;

    document.addEventListener("click", (e) => {
      /* =====================================
         SUBMENU PROFILE
      ===================================== */

      const subItem = e.target.closest(".menu-subitem");

      if (subItem) {
        const page = subItem.dataset.page;

        const jenis = subItem.dataset.filterJenis || "";

        if (!page) {
          return;
        }

        this.currentPage = page;

        /* =====================================
           ACTIVE MENU
        ===================================== */

        this.setActive(page);

        /* =====================================
           SAVE PAGE
        ===================================== */

        localStorage.setItem("lastPage", page);

        /* =====================================
           SAVE FILTER
        ===================================== */

        localStorage.setItem("profilJenisPenginapan", jenis);

        Router.navigate(page);

        return;
      }

      /* =====================================
         MAIN MENU
      ===================================== */

      const menu = e.target.closest(".menu-item");

      if (!menu) {
        return;
      }

      const page = menu.dataset.page;

      if (!page) {
        return;
      }

      this.changePage(page);
    });
  },

  /* =====================================
     CHANGE PAGE
  ===================================== */

  changePage(page) {
    if (!page) {
      return;
    }

    this.currentPage = page;

    /* =====================================
       ACTIVE MENU
    ===================================== */

    this.setActive(page);

    /* =====================================
       SAVE PAGE
    ===================================== */

    localStorage.setItem("lastPage", page);

    /* =====================================
       RESET PROFILE FILTER
    ===================================== */

    if (page === "profil-penginapan") {
      localStorage.removeItem("profilJenisPenginapan");
    }

    Router.navigate(page);
  },

  /* =====================================
     ACTIVE MENU
  ===================================== */

  setActive(page) {
    /* =====================================
       MAIN MENU
    ===================================== */

    document.querySelectorAll(".menu-item").forEach((menu) => {
      menu.classList.remove("active");

      if (menu.dataset.page === page) {
        menu.classList.add("active");
      }
    });

    /* =====================================
       SUBMENU
    ===================================== */

    document.querySelectorAll(".menu-subitem").forEach((item) => {
      item.classList.remove("active");
    });

    const currentJenis = localStorage.getItem("profilJenisPenginapan");

    if (page === "profil-penginapan" && currentJenis) {
      document.querySelectorAll(".menu-subitem").forEach((item) => {
        if (item.dataset.filterJenis === currentJenis) {
          item.classList.add("active");
        }
      });
    }
  },

  /* =====================================
     RESTORE LAST PAGE
  ===================================== */

  restoreLastPage() {
    let page = localStorage.getItem("lastPage") || "dashboard";

    /* =====================================
       MIGRATION
       TIPE KAMAR → UNIT
    ===================================== */

    if (page === "tipe-kamar") {
      page = "unit";

      localStorage.setItem("lastPage", "unit");
    }

    this.currentPage = page;

    this.setActive(page);

    Router.navigate(page);
  },
};
