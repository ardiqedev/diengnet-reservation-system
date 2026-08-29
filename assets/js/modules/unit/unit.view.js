/* =========================================
   QEDEV UNIT VIEW
========================================= */

const UnitView = {
  /* =====================================
     PAGE
  ===================================== */

  render() {
    return `
      <div class="page">

        <!-- =================================
             HEADER
        ================================== -->

        <div class="page-header">

          <div>
            <h1>Master Unit</h1>

            <p>
              Kelola seluruh unit yang tersedia
              pada setiap penginapan.
            </p>
          </div>

          <button
            type="button"
            class="btn btn-primary"
            id="btnTambahUnit"
          >
            <i data-lucide="plus"></i>
            Tambah Unit
          </button>

        </div>


        <!-- =================================
             SUMMARY
        ================================== -->

        <div class="stats-grid">

          <div class="card stat-card">

            <div class="stat-content">

              <div class="stat-title">
                Total Unit
              </div>

              <div
                id="totalUnit"
                class="stat-value"
              >
                0
              </div>

            </div>

            <div class="stat-icon">
              <i data-lucide="bed-double"></i>
            </div>

          </div>


          <div class="card stat-card">

            <div class="stat-content">

              <div class="stat-title">
                Total Kapasitas
              </div>

              <div
                id="totalKapasitas"
                class="stat-value"
              >
                0 Orang
              </div>

            </div>

            <div class="stat-icon">
              <i data-lucide="users"></i>
            </div>

          </div>


          <div class="card stat-card">

            <div class="stat-content">

              <div class="stat-title">
                Unit Aktif
              </div>

              <div
                id="totalAktif"
                class="stat-value"
              >
                0
              </div>

            </div>

            <div class="stat-icon">
              <i data-lucide="circle-check"></i>
            </div>

          </div>

        </div>


        <!-- =================================
             TOOLBAR
        ================================== -->

        <div class="search-box">

          <i data-lucide="search"></i>

          <input
            id="searchUnit"
            type="text"
            class="form-control"
            placeholder="Cari unit atau penginapan..."
          />

          <button
            type="button"
            id="clearSearchUnit"
            class="search-clear"
            aria-label="Hapus pencarian"
          >
            <i data-lucide="x"></i>
          </button>

        </div>


        <!-- =================================
             TABLE
        ================================== -->

        <div class="card">

          <div id="tableUnit"></div>

          <div
            id="paginationUnit"
            class="pagination-wrapper"
          ></div>

        </div>

      </div>
    `;
  },

  /* =====================================
     FORM CONTAINER
  ===================================== */

  renderFormContainer() {
    return `
      <div
        id="unitFormContainer"
        class="unit-form-container"
      ></div>
    `;
  },

  /* =====================================
     LOADING
  ===================================== */

  renderLoading(targetId) {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.innerHTML = `
      <div class="table-loading">

        <div class="loading-spinner"></div>

        <span>
          Memuat data unit...
        </span>

      </div>
    `;
  },

  /* =====================================
     EMPTY
  ===================================== */

  renderEmpty(targetId) {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.innerHTML = `
      <div class="empty-state">

        <i data-lucide="bed-double"></i>

        <h3>Belum ada unit</h3>

        <p>
          Belum ada unit yang terdaftar
          pada penginapan.
        </p>

      </div>
    `;

    lucide.createIcons();
  },

  /* =====================================
     ERROR
  ===================================== */

  renderError(targetId, message = "Gagal memuat data unit.") {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.innerHTML = `
      <div class="empty-state">

        <i data-lucide="circle-alert"></i>

        <h3>Terjadi Kesalahan</h3>

        <p>${message}</p>

      </div>
    `;

    lucide.createIcons();
  },

  /* =====================================
     SUMMARY
  ===================================== */

  renderSummary(summary = {}) {
    const totalUnit = document.getElementById("totalUnit");

    const totalKapasitas = document.getElementById("totalKapasitas");

    const totalAktif = document.getElementById("totalAktif");

    if (totalUnit) {
      totalUnit.textContent = summary.totalUnit || 0;
    }

    if (totalKapasitas) {
      totalKapasitas.textContent = `${summary.totalKapasitas || 0} Orang`;
    }

    if (totalAktif) {
      totalAktif.textContent = summary.totalAktif || 0;
    }
  },

  /* =====================================
     REFRESH ICON
  ===================================== */

  refreshIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },
};
