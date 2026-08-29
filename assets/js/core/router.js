/* =========================================
   ROUTER MODULE
========================================= */

const Router = {
  /* =====================================
       ROUTES
  ===================================== */

  routes: {
    dashboard: "pages/dashboard.html",

    reservasi: "pages/reservasi.html",

    kamar: "pages/kamar.html",

    tamu: "pages/tamu.html",

    pembayaran: "pages/pembayaran.html",

    laporan: "pages/laporan.html",

    penginapan: "pages/penginapan.html",

    "profil-penginapan": "pages/profil-penginapan.html",
    "profil-penginapan-detail": "pages/profil-penginapan-detail.html",

    unit: "pages/unit.html",

    musim: "pages/musim.html",

    "harga-musim": "pages/harga-musim.html",

    pengguna: "pages/pengguna.html",

    pengaturan: "pages/pengaturan.html",
  },

  currentPage: null,

  /* =====================================
       LOAD COMPONENT
  ===================================== */

  async loadComponent(file, targetId) {
    try {
      const res = await fetch(file);

      if (!res.ok) {
        throw new Error(`Component tidak ditemukan : ${file}`);
      }

      document.getElementById(targetId).innerHTML = await res.text();

      lucide.createIcons();
    } catch (err) {
      console.error(err);
    }
  },

  /* =====================================
       LOAD PAGE
  ===================================== */

  async loadPage(file) {
    try {
      const res = await fetch(file);

      if (!res.ok) {
        throw new Error(`Page tidak ditemukan : ${file}`);
      }

      document.getElementById("content").innerHTML = await res.text();

      lucide.createIcons();
    } catch (err) {
      this.show404();

      console.error(err);
    }
  },

  /* =====================================
       NAVIGATE
  ===================================== */

  async navigate(page) {
    if (!this.routes[page]) {
      console.error(`Route "${page}" tidak ditemukan.`);

      return;
    }

    this.currentPage = page;

    this.saveCurrentPage(page);

    await this.loadPage(this.routes[page]);

    this.initModule(page);
  },

  /* =====================================
       INIT MODULE
  ===================================== */

  initModule(page) {
    const modules = {
      dashboard: typeof Dashboard !== "undefined" ? Dashboard : null,

      penginapan: typeof Penginapan !== "undefined" ? Penginapan : null,

      "profil-penginapan":
        typeof ProfilPenginapan !== "undefined" ? ProfilPenginapan : null,

      "profil-penginapan-detail":
        typeof DetailProfilPenginapan !== "undefined"
          ? DetailProfilPenginapan
          : null,

      unit: typeof Unit !== "undefined" ? Unit : null,

      musim: typeof Musim !== "undefined" ? Musim : null,

      reservasi: typeof Reservasi !== "undefined" ? Reservasi : null,

      kamar: typeof Kamar !== "undefined" ? Kamar : null,

      tamu: typeof Tamu !== "undefined" ? Tamu : null,

      pembayaran: typeof Pembayaran !== "undefined" ? Pembayaran : null,

      "harga-musim": typeof HargaMusim !== "undefined" ? HargaMusim : null,

      pengguna: typeof Pengguna !== "undefined" ? Pengguna : null,

      pengaturan: typeof Pengaturan !== "undefined" ? Pengaturan : null,
    };

    const module = modules[page];

    if (module?.init) {
      module.init();
    }
  },

  /* =====================================
       SAVE PAGE
  ===================================== */

  saveCurrentPage(page) {
    localStorage.setItem("lastPage", page);
  },

  /* =====================================
       GET LAST PAGE
  ===================================== */

  getLastPage() {
    return localStorage.getItem("lastPage") || "dashboard";
  },

  /* =====================================
       SHOW 404
  ===================================== */

  show404() {
    document.getElementById("content").innerHTML = `

      <div class="page-error">

        <h2>404</h2>

        <p>Halaman tidak ditemukan.</p>

      </div>

    `;
  },

  /* =====================================
       START
  ===================================== */

  async start() {
    const page = this.getLastPage();

    await this.navigate(page);
  },
};
