/* =========================================
   QEDEV PROFIL PENGINAPAN MODULE
========================================= */

const ProfilPenginapan = {
  /* =====================================
     STATE
  ===================================== */

  state: {
    page: 1,

    limit: 6,

    keyword: "",

    jenisPenginapan: "",

    rows: [],

    total: 0,

    totalPages: 1,

    loading: false,

    eventsBound: false,
  },

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("PROFIL PENGINAPAN INIT");

    /* ==============================
     RESTORE FILTER SIDEBAR
  ============================== */

    const savedJenis = localStorage.getItem("profilJenisPenginapan") || "";

    this.state.jenisPenginapan = savedJenis;

    /* ==============================
     SYNC FILTER UI
  ============================== */

    const filter = document.getElementById("filterJenisPenginapan");

    if (filter) {
      filter.value = savedJenis;
    }

    /* ==============================
     BIND EVENTS
  ============================== */

    this.bindEvents();

    /* ==============================
     LOAD DATA
  ============================== */

    this.load();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  /* =====================================
   BIND EVENTS
===================================== */

  bindEvents() {
    const search = document.getElementById("searchProfilPenginapan");

    const filter = document.getElementById("filterJenisPenginapan");

    const refresh = document.getElementById("btnRefreshProfilPenginapan");

    /* ==============================
     SEARCH
  ============================== */

    if (search) {
      if (this._searchHandler) {
        search.removeEventListener("input", this._searchHandler);
      }

      this._searchHandler = () => {
        this.state.keyword = search.value.trim();

        this.state.page = 1;

        this.load();
      };

      search.addEventListener("input", this._searchHandler);
    }

    /* ==============================
     FILTER JENIS
  ============================== */

    if (filter) {
      if (this._filterHandler) {
        filter.removeEventListener("change", this._filterHandler);
      }

      this._filterHandler = () => {
        this.state.jenisPenginapan = filter.value;

        this.state.page = 1;

        this.load();
      };

      filter.addEventListener("change", this._filterHandler);
    }

    /* ==============================
     REFRESH
  ============================== */

    if (refresh) {
      if (this._refreshHandler) {
        refresh.removeEventListener("click", this._refreshHandler);
      }

      this._refreshHandler = () => {
        this.load();
      };

      refresh.addEventListener("click", this._refreshHandler);
    }
  },

  /* =====================================
     LOAD
  ===================================== */

  async load() {
    if (this.state.loading) {
      return;
    }

    Skeleton.profilCard("#profilPenginapanGrid", this.state.limit);

    this.state.loading = true;

    try {
      const result = await ProfilPenginapanService.getAll({
        page: this.state.page,

        limit: this.state.limit,

        keyword: this.state.keyword,

        jenisPenginapan: this.state.jenisPenginapan,
      });

      if (!result?.success) {
        console.error("Profil Penginapan:", result?.message);

        return;
      }

      const data = result.data || {};

      this.state.rows = data.rows || [];

      this.state.page = data.page || 1;

      this.state.total = data.total || 0;

      this.state.totalPages = data.totalPages || 1;

      this.render();
    } catch (error) {
      console.error("ProfilPenginapan.load:", error);
    } finally {
      this.state.loading = false;
    }
  },

  /* =====================================
     RENDER
  ===================================== */

  render() {
    this.renderCards();

    this.renderPagination();

    this.refreshIcons();
  },

  /* =====================================
     RENDER CARDS
  ===================================== */

  renderCards() {
    const container = document.getElementById("profilPenginapanGrid");

    if (!container) {
      return;
    }

    const rows = this.state.rows || [];

    if (!rows.length) {
      container.innerHTML = `

      <div class="profil-empty">

        <div class="profil-empty-icon">
          <i data-lucide="building-2"></i>
        </div>

        <h3>
          Penginapan tidak ditemukan
        </h3>

        <p>
          Tidak ada data yang sesuai dengan pencarian.
        </p>

      </div>

    `;

      this.refreshIcons();

      return;
    }

    container.innerHTML = rows.map((row) => this.renderCard(row)).join("");

    this.refreshIcons();
  },

  /* =====================================
     CARD
  ===================================== */

  renderCard(row) {
    const active =
      String(row.status || "")
        .trim()
        .toUpperCase() === "AKTIF";

    const ready = row.siapReservasi === true;

    const location = [row.desa, row.kecamatan, row.kabupaten]
      .filter(Boolean)
      .join(", ");

    const foto = String(row.foto || "").trim();

    return `

    <article
      class="profil-card"
      data-id="${this.escape(row.id)}"
    >

      <!-- =================================
           FOTO
      ================================== -->

      <div class="profil-card-image">

        ${
          foto
            ? `

              <img
                src="${this.escape(foto)}"
                alt="${this.escape(row.nama || "Penginapan")}"
                loading="lazy"
                decoding="async"
              >

            `
            : `

              <div class="profil-card-image-empty">

                <i data-lucide="building-2"></i>

                <span>
                  Foto belum tersedia
                </span>

              </div>

            `
        }

      </div>


      <!-- =================================
           BODY
      ================================== -->

      <div class="profil-card-body">


        <!-- HEADER -->

        <div class="profil-card-heading">

          <div class="profil-card-title">

            <h3>
              ${this.escape(row.nama || "-")}
            </h3>

            <span class="profil-card-type">

              ${this.escape(row.jenisPenginapan || "-")}

            </span>

          </div>


          <span
            class="
              profil-status
              ${active ? "is-active" : "is-inactive"}
            "
          >

            ${active ? "Aktif" : "Non Aktif"}

          </span>

        </div>


        <!-- LOCATION -->

        <div class="profil-card-location">

          <i data-lucide="map-pin"></i>

          <span>
            ${this.escape(location || "-")}
          </span>

        </div>


        <!-- DESCRIPTION -->

        ${
          row.deskripsi
            ? `

              <p class="profil-card-description">

                ${this.escape(row.deskripsi)}

              </p>

            `
            : `

              <p class="profil-card-description is-empty">

                Belum ada deskripsi penginapan.

              </p>

            `
        }


        <!-- =================================
             STATS
        ================================== -->

        <div class="profil-card-stats">


          <div class="profil-stat">

            <i data-lucide="bed-double"></i>

            <div>

              <strong>
                ${row.totalUnit || 0}
              </strong>

              <span>
                Unit
              </span>

            </div>

          </div>


          <div class="profil-stat">

            <i data-lucide="users"></i>

            <div>

              <strong>
                ${row.totalKapasitas || 0}
              </strong>

              <span>
                Kapasitas
              </span>

            </div>

          </div>


          <div class="profil-stat">

            <i data-lucide="calendar-days"></i>

            <div>

              <strong>
                ${row.totalMusim || 0}
              </strong>

              <span>
                Musim
              </span>

            </div>

          </div>


          <div class="profil-stat">

            <i data-lucide="badge-dollar-sign"></i>

            <div>

              <strong>
                ${row.totalHarga || 0}
              </strong>

              <span>
                Harga
              </span>

            </div>

          </div>

        </div>


        <!-- =================================
             FOOTER
        ================================== -->

        <div class="profil-card-footer">


          <span
            class="
              profil-readiness
              ${ready ? "is-ready" : "is-pending"}
            "
          >

            <i
              data-lucide="${ready ? "check-circle-2" : "clock-3"}"
            ></i>

            ${ready ? "Siap Reservasi" : "Belum Siap"}

          </span>


          <button
            class="btn btn-outline btn-sm profil-detail-btn"
            type="button"
            onclick="
              ProfilPenginapan.detail(
                '${this.escape(row.id)}'
              )
            "
          >

            Lihat Profil

            <i data-lucide="arrow-right"></i>

          </button>

        </div>

      </div>

    </article>

  `;
  },

  /* =====================================
     PAGINATION
  ===================================== */

  renderPagination() {
    const container = document.getElementById("paginationProfilPenginapan");

    if (!container) {
      return;
    }

    if (this.state.totalPages <= 1) {
      container.innerHTML = "";

      return;
    }

    let html = "";

    if (this.state.page > 1) {
      html += `

        <button
          class="btn btn-outline"
          onclick="
            ProfilPenginapan.changePage(
              ${this.state.page - 1}
            )
          "
        >

          <i data-lucide="chevron-left"></i>

        </button>

      `;
    }

    for (let i = 1; i <= this.state.totalPages; i++) {
      html += `

        <button
          class="
            btn
            ${i === this.state.page ? "btn-primary" : "btn-outline"}
          "
          onclick="
            ProfilPenginapan.changePage(
              ${i}
            )
          "
        >

          ${i}

        </button>

      `;
    }

    if (this.state.page < this.state.totalPages) {
      html += `

        <button
          class="btn btn-outline"
          onclick="
            ProfilPenginapan.changePage(
              ${this.state.page + 1}
            )
          "
        >

          <i data-lucide="chevron-right"></i>

        </button>

      `;
    }

    container.innerHTML = html;
  },

  /* =====================================
     CHANGE PAGE
  ===================================== */

  changePage(page) {
    if (page < 1 || page > this.state.totalPages) {
      return;
    }

    this.state.page = page;

    this.load();
  },

  /* =====================================
     DETAIL
  ===================================== */

  detail(id) {
    localStorage.setItem("profilPenginapanId", id);

    Router.navigate("profil-penginapan-detail");
  },

  /* =====================================
     REFRESH ICON
  ===================================== */

  refreshIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },

  /* =====================================
     ESCAPE
  ===================================== */

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },
};
