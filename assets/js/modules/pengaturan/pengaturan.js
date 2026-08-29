/* =========================================
   QEDEV PENGATURAN MODULE
========================================= */

const Pengaturan = {
  /* =====================================
     STATE
  ===================================== */

  state: {
    penginapan: [],
    jenisPenginapan: "",
    pengaturanUnit: [],
    loading: false,
  },

  /* =====================================
     INIT
  ===================================== */

  async init() {
    console.log("[Pengaturan] Module Loaded");

    this.resetState();

    this.bindEvents();

    this.refreshIcons();

    await this.loadPenginapan();
  },

  /* =====================================
     RESET STATE
  ===================================== */

  resetState() {
    this.state = {
      penginapan: [],
      jenisPenginapan: "",
      pengaturanUnit: [],
      loading: false,
    };
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const select = document.getElementById("settingsJenisPenginapan");

    if (!select) {
      console.warn("[Pengaturan] Select jenis penginapan tidak ditemukan.");

      return;
    }

    /*
     * Hindari event listener dobel
     */

    if (select.dataset.bound === "true") {
      return;
    }

    select.dataset.bound = "true";

    select.addEventListener("change", async (event) => {
      const jenis = event.target.value || "";

      await this.handleJenisChange(jenis);
    });
  },

  /* =====================================
     LOAD PENGINAPAN
  ===================================== */

  async loadPenginapan() {
    try {
      this.state.loading = true;

      const result = await PenginapanService.getAll();

      console.log("[Pengaturan] PENGINAPAN RESULT:", result);

      if (!result?.success) {
        throw new Error(result?.message || "Gagal mengambil data penginapan.");
      }

      const rows = result?.data?.rows || result?.data || [];

      this.state.penginapan = Array.isArray(rows) ? rows : [];

      this.renderJenisPenginapan();
    } catch (error) {
      console.error("[Pengaturan] LOAD PENGINAPAN ERROR:", error);

      Toast.error(error.message || "Gagal memuat data penginapan.");
    } finally {
      this.state.loading = false;
    }
  },

  /* =====================================
     RENDER JENIS PENGINAPAN
  ===================================== */

  renderJenisPenginapan() {
    const select = document.getElementById("settingsJenisPenginapan");

    if (!select) {
      return;
    }

    /*
     * Ambil jenis penginapan unik
     */

    const jenisList = [
      ...new Set(
        this.state.penginapan
          .map((item) => item.jenisPenginapan || item.jenis || "")
          .map((jenis) => String(jenis).trim())
          .filter(Boolean),
      ),
    ];

    /*
     * Sort alphabetic
     */

    jenisList.sort((a, b) => a.localeCompare(b));

    const options = jenisList
      .map((jenis) => {
        return `
          <option value="${this.escape(jenis)}">
            ${this.escape(jenis)}
          </option>
        `;
      })
      .join("");

    select.innerHTML = `
      <option value="">
        Pilih Jenis Penginapan
      </option>

      ${options}
    `;

    /*
     * Reset state
     */

    this.state.jenisPenginapan = "";

    this.state.pengaturanUnit = [];

    /*
     * Reset list
     */

    this.renderUnitConfig([]);

    this.refreshIcons();
  },

  /* =====================================
     HANDLE JENIS CHANGE
  ===================================== */

  async handleJenisChange(jenis) {
    this.state.jenisPenginapan = jenis || "";

    if (!jenis) {
      this.state.pengaturanUnit = [];

      this.renderUnitConfig([]);

      return;
    }

    await this.loadUnitConfig(jenis);
  },

  /* =====================================
     LOAD UNIT CONFIG
  ===================================== */

  async loadUnitConfig(jenis) {
    try {
      this.setListLoading();

      const result = await PengaturanUnitService.getByJenis(jenis);

      console.log("[Pengaturan] UNIT CONFIG RESULT:", result);

      if (!result?.success) {
        throw new Error(result?.message || "Gagal mengambil konfigurasi unit.");
      }

      let rows = result?.data || [];

      if (!Array.isArray(rows)) {
        rows = [];
      }

      /*
       * Hanya konfigurasi aktif
       */

      rows = rows.filter((item) => {
        return String(item.status || "Aktif").toLowerCase() === "aktif";
      });

      /*
       * Sort berdasarkan urutan
       */

      rows.sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));

      this.state.pengaturanUnit = rows;

      this.renderUnitConfig(rows);
    } catch (error) {
      console.error("[Pengaturan] LOAD UNIT CONFIG ERROR:", error);

      this.state.pengaturanUnit = [];

      this.renderUnitConfig([]);

      Toast.error(error.message || "Gagal memuat konfigurasi unit.");
    }
  },

  /* =====================================
   SAVE EDIT FIELD
===================================== */

  /* =====================================
   SAVE EDIT FIELD
===================================== */

  async saveEditField(item) {
    if (this.state.loading) {
      return;
    }

    const label =
      document.getElementById("editPengaturanLabel")?.value.trim() || "";

    const tipeInput =
      document.getElementById("editPengaturanTipe")?.value || "text";

    const opsi =
      document.getElementById("editPengaturanOpsi")?.value.trim() || "";

    const urutan =
      Number(document.getElementById("editPengaturanUrutan")?.value) || 0;

    const tampil =
      document.getElementById("editPengaturanTampil")?.checked === true;

    const wajib =
      document.getElementById("editPengaturanWajib")?.checked === true;

    const status =
      document.getElementById("editPengaturanStatus")?.value || "Aktif";

    /* ==============================
     VALIDASI
  ============================== */

    if (!item?.id) {
      Toast.error("ID konfigurasi tidak ditemukan.");

      return;
    }

    if (!label) {
      Toast.error("Label field wajib diisi.");

      return;
    }

    if (!urutan || urutan < 1) {
      Toast.error("Urutan harus lebih besar dari 0.");

      return;
    }

    if (tipeInput === "select" && !opsi) {
      Toast.error("Opsi wajib diisi untuk tipe Select.");

      return;
    }

    /* ==============================
     PAYLOAD
  ============================== */

    const payload = {
      id: item.id,

      jenisPenginapan: item.jenisPenginapan,

      field: item.field,

      label,

      tipeInput,

      tampil,

      wajib,

      opsi: tipeInput === "select" ? opsi : "",

      urutan,

      status,
    };

    console.log("[Pengaturan] EDIT PAYLOAD:", payload);

    /* ==============================
     SUBMIT
  ============================== */

    try {
      this.state.loading = true;

      const button = document.getElementById("btnSimpanEditPengaturan");

      if (button) {
        button.disabled = true;

        button.innerHTML = `
        <span class="loading-spinner"></span>
        Menyimpan...
      `;
      }

      /* ============================
       API UPDATE
    ============================ */

      const result = await PengaturanUnitService.update(payload);

      console.log("[Pengaturan] UPDATE RESULT:", result);

      /* ============================
       RESPONSE CHECK
    ============================ */

      if (!result?.success) {
        throw new Error(result?.message || "Gagal menyimpan konfigurasi.");
      }

      /* ============================
       CLOSE MODAL
    ============================ */

      Modal.close();

      /* ============================
       RELOAD CONFIG
    ============================ */

      await this.loadUnitConfig(this.state.jenisPenginapan);

      /* ============================
       SUCCESS
    ============================ */

      Toast.success(result.message || "Konfigurasi field berhasil diperbarui.");
    } catch (error) {
      console.error("[Pengaturan] UPDATE ERROR:", error);

      Toast.error(error.message || "Gagal menyimpan konfigurasi.");
    } finally {
      this.state.loading = false;
    }
  },

  /* =====================================
     LOADING LIST
  ===================================== */

  setListLoading() {
    const container = document.getElementById("pengaturanUnitList");

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="settings-empty">

        <div class="settings-empty-icon">
          <span class="loading-spinner"></span>
        </div>

        <h3>
          Memuat konfigurasi...
        </h3>

        <p>
          Mengambil pengaturan field unit.
        </p>

      </div>
    `;

    this.refreshIcons();
  },

  /* =====================================
     RENDER UNIT CONFIG
  ===================================== */

  /* =====================================
   RENDER UNIT CONFIG
===================================== */

  renderUnitConfig(rows = []) {
    const container = document.getElementById("pengaturanUnitList");

    if (!container) {
      return;
    }

    /* ================================
     BELUM PILIH JENIS
  ================================= */

    if (!this.state.jenisPenginapan) {
      container.innerHTML = `
      <div class="settings-empty">

        <div class="settings-empty-icon">
          <i data-lucide="settings-2"></i>
        </div>

        <h3>
          Belum ada konfigurasi
        </h3>

        <p>
          Pilih jenis penginapan terlebih dahulu.
        </p>

      </div>
    `;

      this.refreshIcons();

      return;
    }

    /* ================================
     TIDAK ADA CONFIG
  ================================= */

    if (!rows.length) {
      container.innerHTML = `
      <div class="settings-empty">

        <div class="settings-empty-icon">
          <i data-lucide="file-cog"></i>
        </div>

        <h3>
          Belum ada field
        </h3>

        <p>
          Belum ada konfigurasi field untuk
          <strong>
            ${this.escape(this.state.jenisPenginapan)}
          </strong>.
        </p>

      </div>
    `;

      this.refreshIcons();

      return;
    }

    /* ================================
     RENDER LIST
  ================================= */

    container.innerHTML = rows
      .map((item, index) => this.renderConfigItem(item, index))
      .join("");

    /* ================================
     BIND ACTION
  ================================= */

    this.bindFieldActions();

    this.refreshIcons();
  },

  /* =====================================
     RENDER CONFIG ITEM
  ===================================== */

  /* =====================================
   RENDER CONFIG ITEM
===================================== */

  renderConfigItem(item, index = 0) {
    const id = item.id || "";

    const field = item.field || "-";

    const label = item.label || field;

    const tipeInput = item.tipeInput || "text";

    const tampil = this.isTrue(item.tampil);

    const wajib = this.isTrue(item.wajib);

    const status = item.status || "Aktif";

    const urutan = item.urutan || index + 1;

    const opsi = item.opsi || "";

    return `
    <div
      class="settings-field-item"
      data-id="${this.escape(id)}"
    >

      <!-- ORDER -->

      <div class="settings-field-order">
        ${this.escape(String(urutan))}
      </div>


      <!-- MAIN -->

      <div class="settings-field-main">

        <div class="settings-field-title">

          <strong>
            ${this.escape(label)}
          </strong>

          <span class="settings-field-code">
            ${this.escape(field)}
          </span>

        </div>


        <div class="settings-field-meta">

          <span class="settings-badge">
            ${this.escape(tipeInput)}
          </span>


          ${
            tampil
              ? `
                <span class="settings-badge success">
                  <span class="settings-badge-dot"></span>
                  Tampil
                </span>
              `
              : `
                <span class="settings-badge muted">
                  Tidak Tampil
                </span>
              `
          }


          ${
            wajib
              ? `
                <span class="settings-badge warning">
                  Wajib
                </span>
              `
              : `
                <span class="settings-badge muted">
                  Opsional
                </span>
              `
          }

        </div>


        ${
          opsi
            ? `
              <div class="settings-field-options">

                <span class="settings-option-label">
                  Opsi
                </span>

                <span class="settings-option-value">
                  ${this.escape(opsi)}
                </span>

              </div>
            `
            : ""
        }

      </div>


      <!-- STATUS -->

      <div class="settings-field-status">

        <span class="settings-status-active">

          <span class="settings-status-dot"></span>

          ${this.escape(status)}

        </span>

      </div>


      <!-- ACTION -->

      <div class="settings-field-action">

        <button
          type="button"
          class="btn btn-secondary btn-sm"
          data-action="edit-field"
          data-id="${this.escape(id)}"
        >

          <i data-lucide="pencil"></i>

          <span>
            Edit
          </span>

        </button>

      </div>

    </div>
  `;
  },

  /* =====================================
     BIND FIELD ACTIONS
  ===================================== */

  bindFieldActions() {
    const container = document.getElementById("pengaturanUnitList");

    if (!container) {
      return;
    }

    container
      .querySelectorAll('[data-action="edit-field"]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id || "";

          if (!id) {
            Toast.error("ID konfigurasi tidak ditemukan.");

            return;
          }

          this.openEditField(id);
        });
      });
  },

  /* =====================================
     OPEN EDIT FIELD
  ===================================== */

  /* =====================================
   OPEN EDIT FIELD
===================================== */

  openEditField(id) {
    const item = this.state.pengaturanUnit.find(
      (row) => String(row.id) === String(id),
    );

    if (!item) {
      Toast.error("Data konfigurasi tidak ditemukan.");

      return;
    }

    console.log("[Pengaturan] EDIT FIELD:", item);

    Modal.open({
      title: "Edit Konfigurasi Field",

      size: "md",

      body: this.renderEditFieldForm(item),

      footer: `
      <button
        type="button"
        class="btn btn-outline"
        id="btnBatalEditPengaturan"
      >
        Batal
      </button>

      <button
        type="button"
        class="btn btn-primary"
        id="btnSimpanEditPengaturan"
      >
        <i data-lucide="save"></i>
        Simpan Perubahan
      </button>
    `,
    });

    this.refreshIcons();

    this.updateEditOptionVisibility();

    document
      .getElementById("editPengaturanTipe")
      ?.addEventListener("change", () => {
        this.updateEditOptionVisibility();
      });

    /* =================================
     BATAL
  ================================= */

    document
      .getElementById("btnBatalEditPengaturan")
      ?.addEventListener("click", () => {
        Modal.close();
      });

    /* =================================
     SIMPAN
  ================================= */

    document
      .getElementById("btnSimpanEditPengaturan")
      ?.addEventListener("click", () => {
        this.saveEditField(item);
      });
  },

  /* =====================================
   RENDER EDIT FIELD FORM
===================================== */

  renderEditFieldForm(item = {}) {
    const tipeInput = String(item.tipeInput || "text").toLowerCase();

    const tampil = this.isTrue(item.tampil);

    const wajib = this.isTrue(item.wajib);

    const status =
      String(item.status || "Aktif").toLowerCase() === "non aktif"
        ? "Non Aktif"
        : "Aktif";

    return `
    <form
      id="formEditPengaturan"
      class="settings-edit-form"
    >

      <!-- ============================
           INFORMASI FIELD
      ============================= -->

      <div class="settings-edit-info">

        <div class="settings-edit-info-icon">
          <i data-lucide="settings-2"></i>
        </div>

        <div>

          <strong>
            ${this.escape(item.label || item.field || "-")}
          </strong>

          <span>
            ${this.escape(item.field || "-")}
          </span>

        </div>

      </div>


      <!-- ============================
           LABEL
      ============================= -->

      <div class="form-group">

        <label class="form-label">
          Label Field
        </label>

        <input
          type="text"
          id="editPengaturanLabel"
          class="form-control"
          value="${this.escape(item.label || "")}"
          placeholder="Contoh: Nama Unit"
        >

        <small class="form-help">
          Nama yang ditampilkan pada form unit.
        </small>

      </div>


      <!-- ============================
           TIPE INPUT
      ============================= -->

      <div class="form-group">

        <label class="form-label">
          Tipe Input
        </label>

        <select
          id="editPengaturanTipe"
          class="form-control"
        >

          <option
            value="text"
            ${tipeInput === "text" ? "selected" : ""}
          >
            Text
          </option>

          <option
            value="number"
            ${tipeInput === "number" ? "selected" : ""}
          >
            Number
          </option>

          <option
            value="select"
            ${tipeInput === "select" ? "selected" : ""}
          >
            Select
          </option>

          <option
            value="textarea"
            ${tipeInput === "textarea" ? "selected" : ""}
          >
            Textarea
          </option>

          <option
            value="file"
            ${tipeInput === "file" ? "selected" : ""}
          >
            File
          </option>

        </select>

      </div>


      <!-- ============================
           OPSI
      ============================= -->

      <div
        class="form-group"
        id="editPengaturanOpsiGroup"
      >

        <label class="form-label">
          Opsi Select
        </label>

        <input
          type="text"
          id="editPengaturanOpsi"
          class="form-control"
          value="${this.escape(item.opsi || "")}"
          placeholder="Contoh: Single Bed|Double Bed|Twin"
        >

        <small class="form-help">
          Pisahkan setiap pilihan dengan tanda
          <strong>|</strong>.
        </small>

      </div>


      <!-- ============================
           URUTAN
      ============================= -->

      <div class="form-group">

        <label class="form-label">
          Urutan
        </label>

        <input
          type="number"
          id="editPengaturanUrutan"
          class="form-control"
          min="1"
          value="${this.escape(item.urutan || "")}"
        >

        <small class="form-help">
          Menentukan posisi field pada form unit.
        </small>

      </div>


      <!-- ============================
           TOGGLE
      ============================= -->

      <div class="settings-edit-options">

        <!-- TAMPIL -->

        <label class="settings-toggle-row">

          <span class="settings-toggle-content">

            <strong>
              Tampilkan Field
            </strong>

            <small>
              Field akan muncul pada form unit.
            </small>

          </span>

          <input
            type="checkbox"
            id="editPengaturanTampil"
            ${tampil ? "checked" : ""}
          >

          <span class="settings-toggle-switch"></span>

        </label>


        <!-- WAJIB -->

        <label class="settings-toggle-row">

          <span class="settings-toggle-content">

            <strong>
              Field Wajib
            </strong>

            <small>
              Pengguna wajib mengisi field ini.
            </small>

          </span>

          <input
            type="checkbox"
            id="editPengaturanWajib"
            ${wajib ? "checked" : ""}
          >

          <span class="settings-toggle-switch"></span>

        </label>

      </div>


      <!-- ============================
           STATUS
      ============================= -->

      <div class="form-group">

        <label class="form-label">
          Status
        </label>

        <select
          id="editPengaturanStatus"
          class="form-control"
        >

          <option
            value="Aktif"
            ${status === "Aktif" ? "selected" : ""}
          >
            Aktif
          </option>

          <option
            value="Non Aktif"
            ${status === "Non Aktif" ? "selected" : ""}
          >
            Non Aktif
          </option>

        </select>

      </div>


      <!-- ============================
           HIDDEN ID
      ============================= -->

      <input
        type="hidden"
        id="editPengaturanId"
        value="${this.escape(item.id || "")}"
      >

    </form>
  `;
  },

  /* =====================================
   UPDATE OPSI VISIBILITY
===================================== */

  updateEditOptionVisibility() {
    const tipe = document.getElementById("editPengaturanTipe");

    const group = document.getElementById("editPengaturanOpsiGroup");

    if (!tipe || !group) {
      return;
    }

    const isSelect = tipe.value === "select";

    group.style.display = isSelect ? "" : "none";
  },

  /* =====================================
     HELPERS
  ===================================== */

  isTrue(value) {
    return value === true || String(value).toUpperCase() === "TRUE";
  },

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  refreshIcons() {
    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }
  },
};
