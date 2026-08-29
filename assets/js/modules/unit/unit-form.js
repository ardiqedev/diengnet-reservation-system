/* =========================================
   QEDEV UNIT FORM
   Dynamic Form berdasarkan
   master_pengaturan_unit
========================================= */

const UnitForm = {
  /* =====================================
     CONFIG
  ===================================== */

  PHOTO: {
    maxFiles: 5,
    maxWidth: 1600,
    quality: 0.82,
    format: "webp",
    fallbackFormat: "jpeg",
  },

  /* =====================================
     STATE
  ===================================== */

  state: {
    mode: "create",

    unitId: null,

    penginapanId: "",

    jenisPenginapan: "",

    pengaturan: [],

    data: {},

    foto: [],

    existingFoto: null,

    submitting: false,
  },

  /* =====================================
     OPEN CREATE
  ===================================== */

  async openCreate() {
    this.resetState();

    this.state.mode = "create";

    this.renderContainer();

    this.renderLoading();

    await this.loadPenginapan();
  },

  /* =====================================
     RESET STATE
  ===================================== */

  resetState() {
    this.clearPhotoUrls();

    this.state = {
      mode: "create",

      unitId: null,

      penginapanId: "",

      jenisPenginapan: "",

      pengaturan: [],

      data: {},

      foto: [],

      existingFoto: null,

      submitting: false,
    };
  },

  /* =====================================
     CONTAINER
  ===================================== */

  renderContainer() {
    let container = document.getElementById("unitFormContainer");

    if (!container) {
      container = document.createElement("div");

      container.id = "unitFormContainer";

      document.body.appendChild(container);
    }
  },

  /* =====================================
     LOADING
  ===================================== */

  renderLoading() {
    const container = document.getElementById("unitFormContainer");

    if (!container) {
      return;
    }

    container.innerHTML = `

      <div class="modal-overlay">

        <div class="modal">

          <div class="modal-body">

            <div class="form-loading">

              <div class="loading-spinner"></div>

              <span>
                Memuat form unit...
              </span>

            </div>

          </div>

        </div>

      </div>

    `;
  },

  /* =====================================
     LOAD PENGINAPAN
  ===================================== */

  async loadPenginapan() {
    try {
      const result = await PenginapanService.getAll();

      if (!result?.success) {
        throw new Error(result?.message || "Gagal mengambil data penginapan.");
      }

      const rows = result?.data?.rows || result?.data || [];

      this.renderPenginapan(rows);
    } catch (error) {
      console.error("UNIT FORM PENGINAPAN ERROR:", error);

      this.renderError(error.message);
    }
  },

  /* =====================================
     RENDER PENGINAPAN
  ===================================== */

  renderPenginapan(rows = []) {
    let container = document.getElementById("unitFormContainer");

    /* =====================================
     CREATE CONTAINER JIKA BELUM ADA
  ===================================== */

    if (!container) {
      container = document.createElement("div");

      container.id = "unitFormContainer";

      document.body.appendChild(container);
    }

    /* =====================================
     OPTIONS
  ===================================== */

    const options = rows
      .map((item) => {
        const id = item.id || "";

        const nama = item.nama || item.namaPenginapan || "-";

        const jenis = item.jenisPenginapan || item.jenis || "";

        const selected =
          String(id) === String(this.state.penginapanId || "")
            ? "selected"
            : "";

        return `
        <option
          value="${this.escape(id)}"
          data-jenis="${this.escape(jenis)}"
          ${selected}
        >
          ${this.escape(nama)}
        </option>
      `;
      })
      .join("");

    /* =====================================
     RENDER
  ===================================== */

    container.innerHTML = `

    <div class="modal show">

      <div class="modal-dialog modal-lg">

        <div class="modal-header">

          <div>

            <h2>
              ${this.state.mode === "edit" ? "Edit Unit" : "Tambah Unit"}
            </h2>

            <p>
              Atur informasi unit penginapan.
            </p>

          </div>

          <button
            type="button"
            class="modal-close"
            data-action="close"
          >
            <i data-lucide="x"></i>
          </button>

        </div>


        <form
          id="formUnit"
          class="modal-body"
        >

          <!-- ==========================
               PENGINAPAN
          =========================== -->

          <div class="form-group">

            <label>
              Penginapan
              <span class="required">*</span>
            </label>

            <select
              id="unitPenginapan"
              name="penginapanId"
              class="form-control"
              required
            >

              <option value="">
                Pilih Penginapan
              </option>

              ${options}

            </select>

            <small
              id="jenisPenginapanInfo"
              class="form-help"
            ></small>

          </div>


          <!-- ==========================
               DYNAMIC FIELDS
          =========================== -->

          <div
            id="dynamicUnitFields"
            class="form-grid"
          ></div>


          <!-- ==========================
               ACTIONS
          =========================== -->

          <div
            id="unitFormActions"
            class="modal-footer"
          >

            <button
              type="button"
              class="btn btn-secondary"
              data-action="close"
            >
              Batal
            </button>

            <button
              type="submit"
              class="btn btn-primary"
              id="btnSimpanUnit"
            >
              ${this.state.mode === "edit" ? "Simpan Perubahan" : "Simpan Unit"}
            </button>

          </div>

        </form>

      </div>

    </div>

  `;

    /* =====================================
     BIND
  ===================================== */

    this.bindEvents();

    /* =====================================
     ICON
  ===================================== */

    this.refreshIcons();

    /* =====================================
     GET SELECT DARI CONTAINER
  ===================================== */

    const select = container.querySelector("#unitPenginapan");

    if (!select) {
      console.error(
        "UNIT FORM: select #unitPenginapan tidak ditemukan.",
        container,
      );

      return;
    }

    /* =====================================
     INITIAL PENGINAPAN
  ===================================== */

    if (select.value) {
      this.handlePenginapanChange(select.value);
    }
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const container = document.getElementById("unitFormContainer");

    if (!container) {
      return;
    }

    const select = document.getElementById("unitPenginapan");

    select?.addEventListener("change", (event) => {
      this.handlePenginapanChange(event.target.value);
    });

    container.querySelectorAll('[data-action="close"]').forEach((button) => {
      button.addEventListener("click", () => this.close());
    });

    const form = document.getElementById("formUnit");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      this.submit();
    });
  },

  /* =====================================
     PENGINAPAN CHANGE
  ===================================== */

  async handlePenginapanChange(penginapanId) {
    if (!penginapanId) {
      this.state.penginapanId = "";

      this.state.jenisPenginapan = "";

      this.state.pengaturan = [];

      this.clearPhotos();

      this.updateJenisInfo();

      this.renderDynamicFields();

      return;
    }

    const select = document.getElementById("unitPenginapan");

    const option = [...(select?.options || [])].find(
      (item) => item.value === penginapanId,
    );

    const jenis = option?.dataset?.jenis || "";

    this.state.penginapanId = penginapanId;

    this.state.jenisPenginapan = jenis;

    this.state.pengaturan = [];

    this.clearPhotos();

    this.updateJenisInfo();

    await this.loadPengaturan(penginapanId);
  },

  /* =====================================
     LOAD PENGATURAN
  ===================================== */

  async loadPengaturan(penginapanId) {
    const jenis = this.state.jenisPenginapan;

    if (!jenis) {
      console.warn("Jenis penginapan belum tersedia.");

      return;
    }

    try {
      this.renderFieldsLoading();

      const result = await PengaturanUnitService.getByJenis(jenis);

      if (!result?.success) {
        throw new Error(result?.message || "Gagal mengambil pengaturan unit.");
      }

      let rows = result?.data || [];

      rows = rows

        /* ==========================
             STATUS
          =========================== */

        .filter(
          (item) => String(item.status || "Aktif").toLowerCase() === "aktif",
        )

        /* ==========================
             TAMPIL
          =========================== */

        .filter(
          (item) =>
            item.tampil === true ||
            String(item.tampil).toUpperCase() === "TRUE",
        )

        /* ==========================
             URUTAN
          =========================== */

        .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));

      this.state.pengaturan = rows;

      this.renderDynamicFields();
    } catch (error) {
      console.error("UNIT FORM PENGATURAN ERROR:", error);

      this.renderError(error.message);
    }
  },

  /* =====================================
     LOADING FIELDS
  ===================================== */

  renderFieldsLoading() {
    const target = document.getElementById("dynamicUnitFields");

    if (!target) {
      return;
    }

    target.innerHTML = `

      <div class="form-loading">

        <div class="loading-spinner"></div>

        <span>
          Memuat pengaturan unit...
        </span>

      </div>

    `;
  },

  /* =====================================
     RENDER DYNAMIC FIELDS
  ===================================== */

  renderDynamicFields() {
    const target = document.getElementById("dynamicUnitFields");

    if (!target) {
      return;
    }

    if (!this.state.jenisPenginapan || !this.state.pengaturan.length) {
      target.innerHTML = "";

      return;
    }

    target.innerHTML = this.state.pengaturan
      .map((config) => this.renderField(config))
      .join("");

    this.bindDynamicFields();

    this.refreshIcons();
  },

  /* =====================================
     BIND DYNAMIC FIELDS
  ===================================== */

  bindDynamicFields() {
    const target = document.getElementById("dynamicUnitFields");

    if (!target) {
      return;
    }

    target.querySelectorAll("[data-unit-photo]").forEach((input) => {
      this.bindPhotoInput(input);
    });
  },

  /* =====================================
     FIELD
  ===================================== */

  renderField(config) {
    const field = config.field;

    const label = config.label || field;

    const type = String(config.tipeInput || "text").toLowerCase();

    const required =
      config.wajib === true || String(config.wajib).toUpperCase() === "TRUE";

    const value = this.state.data?.[field] ?? "";

    const requiredAttr = required ? "required" : "";

    const requiredMark = required ? `<span class="required">*</span>` : "";

    let input = "";

    /* =================================
       SELECT
    ================================== */

    if (type === "select") {
      const options = this.parseOptions(config.opsi);

      input = `

        <select
          class="form-control"
          name="${this.escape(field)}"
          data-field="${this.escape(field)}"
          ${requiredAttr}
        >

          <option value="">
            Pilih ${this.escape(label)}
          </option>

          ${options
            .map((option) => {
              const selected =
                String(option) === String(value) ? "selected" : "";

              return `

                <option
                  value="${this.escape(option)}"
                  ${selected}
                >
                  ${this.escape(option)}
                </option>

              `;
            })
            .join("")}

        </select>

      `;
    } else if (type === "textarea") {
      /* =================================
       TEXTAREA
    ================================== */
      input = `

        <textarea
          class="form-control"
          name="${this.escape(field)}"
          data-field="${this.escape(field)}"
          rows="4"
          ${requiredAttr}
        >${this.escape(value)}</textarea>

      `;
    } else if (type === "number") {
      /* =================================
       NUMBER
    ================================== */
      input = `

        <input
          type="number"
          class="form-control"
          name="${this.escape(field)}"
          data-field="${this.escape(field)}"
          value="${this.escape(value)}"
          min="0"
          ${requiredAttr}
        >

      `;
    } else if (type === "file") {
      /* =================================
     FILE
  ================================== */

      input = `

    <div
      class="unit-photo-upload"
      data-field="${this.escape(field)}"
    >

      <input
        type="file"
        id="unitFoto"
        name="foto"
        accept="image/*"
        multiple
        class="form-control"
        data-unit-photo
      >

      <div
        id="unitPhotoPreview"
        class="unit-photo-preview"
      ></div>

      <small class="form-help">
        Maksimal 5 foto. Ukuran foto asli bebas.
        Foto akan dikompres otomatis.
      </small>

    </div>

  `;
    } else {
      /* =================================
       TEXT
    ================================== */
      input = `

        <input
          type="text"
          class="form-control"
          name="${this.escape(field)}"
          data-field="${this.escape(field)}"
          value="${this.escape(value)}"
          ${requiredAttr}
        >

      `;
    }

    return `

      <div
        class="form-group"
        data-unit-field="${this.escape(field)}"
      >

        <label>

          ${this.escape(label)}

          ${requiredMark}

        </label>

        ${input}

      </div>

    `;
  },

  /* =====================================
     OPTIONS
  ===================================== */

  parseOptions(value) {
    if (!value) {
      return [];
    }

    return String(value)
      .split("|")

      .map((item) => item.trim())

      .filter(Boolean);
  },

  /* =====================================
     JENIS INFO
  ===================================== */

  updateJenisInfo() {
    const target = document.getElementById("jenisPenginapanInfo");

    if (!target) {
      return;
    }

    target.textContent = this.state.jenisPenginapan
      ? `Jenis penginapan: ${this.state.jenisPenginapan}`
      : "";
  },

  /* =====================================
     PHOTO INPUT
  ===================================== */

  bindPhotoInput(input) {
    if (!input) {
      return;
    }

    input.addEventListener("change", async (event) => {
      const files = [...event.target.files];

      if (!files.length) {
        return;
      }

      /* ==========================
           MAX 5
        =========================== */

      const remaining = this.PHOTO.maxFiles - this.state.foto.length;

      if (remaining <= 0) {
        Toast.error("Maksimal 5 foto.");

        input.value = "";

        return;
      }

      const selectedFiles = files.slice(0, remaining);

      if (files.length > remaining) {
        Toast.error(`Maksimal ${this.PHOTO.maxFiles} foto.`);
      }

      input.disabled = true;

      try {
        for (const file of selectedFiles) {
          if (!file.type.startsWith("image/")) {
            Toast.error(`${file.name} bukan file gambar.`);

            continue;
          }

          try {
            const result = await this.compressPhoto(file);

            this.state.foto.push(result);
          } catch (error) {
            console.error("COMPRESS FOTO ERROR:", error);

            Toast.error(`Gagal memproses ${file.name}.`);
          }
        }

        this.state.foto = this.state.foto.slice(0, this.PHOTO.maxFiles);

        this.renderPhotoPreview();
      } finally {
        input.disabled = false;

        input.value = "";
      }
    });
  },

  /* =====================================
     COMPRESS PHOTO
  ===================================== */

  compressPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();

        image.onload = () => {
          let width = image.width;

          let height = image.height;

          /* ======================
                   RESIZE
                ======================= */

          if (width > this.PHOTO.maxWidth) {
            height = (height * this.PHOTO.maxWidth) / width;

            width = this.PHOTO.maxWidth;
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;

          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Canvas tidak tersedia."));

            return;
          }

          context.drawImage(image, 0, 0, width, height);

          const preferredMime =
            this.PHOTO.format === "webp" ? "image/webp" : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Gagal melakukan kompresi foto."));

                return;
              }

              resolve({
                blob,

                name: this.buildPhotoName(file.name, blob.type),

                type: blob.type,

                size: blob.size,

                previewUrl: URL.createObjectURL(blob),
              });
            },

            preferredMime,

            this.PHOTO.quality,
          );
        };

        image.onerror = () => {
          reject(new Error("File gambar tidak dapat dibaca."));
        };

        image.src = event.target.result;
      };

      reader.onerror = () => {
        reject(new Error("File tidak dapat dibaca."));
      };

      reader.readAsDataURL(file);
    });
  },

  /* =====================================
     PHOTO NAME
  ===================================== */

  buildPhotoName(originalName, mime) {
    const baseName = String(originalName || "foto-unit")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-");

    const extension = mime === "image/webp" ? "webp" : "jpg";

    return `${baseName}.${extension}`;
  },

  /* =====================================
     PHOTO PREVIEW
  ===================================== */

  /* =========================================
   RENDER PHOTO PREVIEW
========================================= */

  /* =====================================
   PHOTO PREVIEW
===================================== */

  renderPhotoPreview() {
    const container = document.getElementById("unitPhotoPreview");

    if (!container) {
      return;
    }

    /* =====================================
     FOTO BARU
  ===================================== */

    if (this.state.foto.length > 0) {
      container.innerHTML = this.state.foto
        .map(
          (photo, index) => `
          <div class="photo-preview-item">

            <img
              src="${this.escape(photo.previewUrl)}"
              alt="${this.escape(photo.name || "Foto Unit")}"
            />

            <button
              type="button"
              class="photo-remove"
              data-photo-index="${index}"
            >
              <i data-lucide="x"></i>
            </button>

          </div>
        `,
        )
        .join("");

      container.querySelectorAll("[data-photo-index]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.photoIndex);

          this.removePhoto(index);
        });
      });

      this.refreshIcons();

      return;
    }

    /* =====================================
     FOTO LAMA
  ===================================== */

    if (this.state.existingFoto?.url) {
      container.innerHTML = `
      <div class="photo-preview-item">

        <img
          src="${this.escape(this.state.existingFoto.url)}"
          alt="Foto Unit"
        >

        <span class="photo-existing-badge">
          Foto saat ini
        </span>

      </div>
    `;

      return;
    }

    /* =====================================
     KOSONG
  ===================================== */

    container.innerHTML = "";
  },

  /* =====================================
     REMOVE PHOTO
  ===================================== */

  /* =========================================
   REMOVE PHOTO
========================================= */

  removePhoto(index) {
    if (index < 0 || index >= this.state.foto.length) {
      return;
    }

    const photo = this.state.foto[index];

    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    this.state.foto.splice(index, 1);

    const input = document.getElementById("unitFoto");

    if (input && this.state.foto.length === 0) {
      input.value = "";
    }

    this.renderPhotoPreview();
  },

  /* =====================================
   CLEAR PHOTOS
===================================== */

  clearPhotos() {
    this.clearPhotoUrls();

    this.state.foto = [];

    this.renderPhotoPreview();
  },

  /* =====================================
     CLEAR PHOTO URL
  ===================================== */

  clearPhotoUrls() {
    if (!Array.isArray(this.state.foto)) {
      return;
    }

    this.state.foto.forEach((photo) => {
      if (photo?.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);

        photo.previewUrl = null;
      }
    });
  },

  /* =====================================
     GET FORM DATA
  ===================================== */

  getFormData() {
    const form = document.getElementById("formUnit");

    if (!form) {
      return null;
    }

    const formData = new FormData(form);

    const data = {};

    this.state.pengaturan.forEach((config) => {
      const field = config.field;

      const type = String(config.tipeInput || "").toLowerCase();

      /* ==========================
           FILE DIPISAH
        =========================== */

      if (type === "file") {
        return;
      }

      data[field] = formData.get(field) ?? "";
    });

    data.penginapanId = this.state.penginapanId;

    return data;
  },

  /* =====================================
   OPEN EDIT
===================================== */

  /* =====================================
   OPEN EDIT
===================================== */

  async openEdit(unitId) {
    if (!unitId) {
      Toast.error("ID unit tidak ditemukan.");
      return;
    }

    try {
      /* ===============================
       RESET
    =============================== */

      this.resetState();

      this.state.mode = "edit";
      this.state.unitId = unitId;

      /* ===============================
       GET DETAIL UNIT
    =============================== */

      const result = await UnitService.getById(unitId);

      console.log("UNIT DETAIL RESULT:", result);

      if (!result?.success) {
        throw new Error(result?.message || "Data unit tidak ditemukan.");
      }

      const unit = result.data;

      if (!unit) {
        throw new Error("Data unit kosong.");
      }

      /* ===============================
       SET UNIT DATA
    =============================== */

      this.state.data = {
        ...unit,
      };

      this.state.penginapanId = unit.penginapanId || "";

      /* ===============================
       GET MASTER PENGINAPAN
    =============================== */

      const penginapanResult = await PenginapanService.getAll();

      if (!penginapanResult?.success) {
        throw new Error(
          penginapanResult?.message || "Gagal mengambil data penginapan.",
        );
      }

      const rows = penginapanResult?.data?.rows || penginapanResult?.data || [];

      /* ===============================
       FIND PENGINAPAN
    =============================== */

      const penginapan = rows.find(
        (item) =>
          String(item.id || "") === String(this.state.penginapanId || ""),
      );

      if (!penginapan) {
        throw new Error("Data penginapan unit tidak ditemukan.");
      }

      /* ===============================
       GET JENIS PENGINAPAN
    =============================== */

      this.state.jenisPenginapan =
        penginapan.jenisPenginapan || penginapan.jenis || "";

      if (!this.state.jenisPenginapan) {
        throw new Error("Jenis penginapan tidak ditemukan.");
      }

      console.log("UNIT EDIT PENGINAPAN:", penginapan);

      console.log("UNIT EDIT JENIS:", this.state.jenisPenginapan);

      /* ===============================
       GET PENGATURAN UNIT
    =============================== */

      const pengaturanResult = await PengaturanUnitService.getByJenis(
        this.state.jenisPenginapan,
      );

      console.log("UNIT EDIT PENGATURAN:", pengaturanResult);

      if (!pengaturanResult?.success) {
        throw new Error(
          pengaturanResult?.message || "Gagal mengambil pengaturan unit.",
        );
      }

      let pengaturan = pengaturanResult?.data || [];

      /* ===============================
       FILTER STATUS
    =============================== */

      pengaturan = pengaturan.filter(
        (item) => String(item.status || "Aktif").toLowerCase() === "aktif",
      );

      /* ===============================
       FILTER TAMPIL
    =============================== */

      pengaturan = pengaturan.filter(
        (item) =>
          item.tampil === true || String(item.tampil).toUpperCase() === "TRUE",
      );

      /* ===============================
       SORT
    =============================== */

      pengaturan.sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));

      this.state.pengaturan = pengaturan;

      /* ===============================
       RENDER MODAL
    =============================== */

      this.renderPenginapan(rows);

      await this.handlePenginapanChange(this.state.penginapanId);

      /* ===============================
       FILL EXISTING DATA
    =============================== */

      this.fillFormData(this.state.data);

      /* ===============================
       LOAD EXISTING PHOTO
    =============================== */

      if (unit.fotoUrl) {
        this.loadExistingPhoto(unit);
      }

      /* ===============================
       REFRESH ICON
    =============================== */

      this.refreshIcons();

      console.log("UNIT EDIT READY:", this.state);
    } catch (error) {
      console.error("UNIT OPEN EDIT ERROR:", error);

      Toast.error(error.message || "Gagal membuka data unit.");
    }
  },

  /* =========================================
   FILL FORM DATA
========================================= */

  fillFormData(data = {}) {
    const form = document.getElementById("formUnit");

    if (!form) {
      return;
    }

    /* =====================================
     PENGINAPAN
  ===================================== */

    const penginapanSelect = [...form.elements].find(
      (element) => element.name === "penginapanId",
    );

    if (penginapanSelect) {
      penginapanSelect.value = data.penginapanId || "";
    }

    /* =====================================
     DYNAMIC FIELDS
  ===================================== */

    this.state.pengaturan.forEach((config) => {
      const field = config.field;

      const type = String(config.tipeInput || "").toLowerCase();

      /* ===============================
         FILE
      =============================== */

      if (type === "file") {
        return;
      }

      const element = [...form.elements].find((item) => item.name === field);

      if (!element) {
        return;
      }

      const value = data[field] ?? "";

      /* ===============================
         CHECKBOX
      =============================== */

      if (type === "checkbox" || element.type === "checkbox") {
        element.checked =
          value === true || String(value).toLowerCase() === "true";

        return;
      }

      /* ===============================
         RADIO
      =============================== */

      if (element.type === "radio") {
        const radios = form.querySelectorAll(`[name="${field}"]`);

        radios.forEach((radio) => {
          radio.checked = String(radio.value) === String(value);
        });

        return;
      }

      /* ===============================
         SELECT
      =============================== */

      if (element.tagName === "SELECT") {
        element.value = String(value);

        return;
      }

      /* ===============================
         TEXT / NUMBER / TEXTAREA
      =============================== */

      element.value = value;
    });

    /* =====================================
     UPDATE STATE
  ===================================== */

    this.state.data = {
      ...this.state.data,
      ...data,
    };
  },

  /* =====================================
   LOAD EXISTING PHOTO
===================================== */

  loadExistingPhoto(unit) {
    if (!unit?.fotoUrl) {
      return;
    }

    this.state.existingFoto = {
      id: unit.fotoId || "",
      url: unit.fotoUrl,
      name: unit.fotoName || "Foto Unit",
    };

    this.renderPhotoPreview();
  },

  /* =====================================
   GET PHOTOS
===================================== */

  getPhotos() {
    return this.state.foto.map((photo) => ({
      blob: photo.blob || null,
      name: photo.name || "",
      type: photo.type || "",
      size: photo.size || 0,
    }));
  },

  /* =====================================
   GET PHOTO UPLOAD
===================================== */

  async getPhotoUpload() {
    const photos = this.getPhotos();

    if (!photos.length) {
      return null;
    }

    /*
     * Untuk sementara kita proses foto pertama.
     * Struktur backend saat ini masih foto tunggal.
     */

    const photo = photos[0];

    if (!photo?.blob) {
      return null;
    }

    const base64 = await this.fileToBase64(photo.blob);

    return {
      name: photo.name,

      type: photo.type,

      size: photo.size,

      base64,
    };
  },

  /* =========================================
   FILE TO BASE64
========================================= */

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result !== "string") {
          reject(new Error("Gagal membaca file."));

          return;
        }

        /*
         * Hapus prefix:
         * data:image/webp;base64,...
         */

        const base64 = result.split(",")[1] || "";

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Gagal membaca foto."));
      };

      reader.readAsDataURL(file);
    });
  },

  /* =====================================
   SUBMIT
===================================== */

  async submit() {
    if (this.state.submitting) {
      return;
    }

    /* ===============================
     FORM
  =============================== */

    const form = document.getElementById("formUnit");

    if (!form) {
      return;
    }

    /* ===============================
     VALIDATION
  =============================== */

    if (!form.reportValidity()) {
      return;
    }

    /* ===============================
     FORM DATA
  =============================== */

    const data = this.getFormData();

    if (!data) {
      return;
    }

    /* ===============================
     SUBMITTING
  =============================== */

    this.state.submitting = true;

    const button = document.getElementById("btnSimpanUnit");

    if (button) {
      button.disabled = true;

      button.innerHTML = `
      <span class="loading-spinner"></span>
      Menyimpan...
    `;
    }

    try {
      /* ===============================
       FOTO
    =============================== */

      const foto = await this.getPhotoUpload();

      if (foto) {
        data.foto = foto;
      }

      /* ===============================
       DEBUG
    =============================== */

      console.log("UNIT FORM DATA:", data);
      console.log("UNIT FORM FOTO:", foto);

      /* ===============================
       SAVE
    =============================== */

      let result;

      if (this.state.mode === "edit") {
        result = await UnitService.update(this.state.unitId, data);
      } else {
        result = await UnitService.create(data);
      }

      /* ===============================
       RESULT
    =============================== */

      console.log("UNIT SAVE RESULT:", result);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal menyimpan unit.");

        return;
      }

      /* ===============================
       SUCCESS
    =============================== */

      Toast.success(result.message || "Unit berhasil disimpan.");

      /* ===============================
       CLOSE MODAL
    =============================== */

      this.close();

      /* ===============================
       REFRESH LIST
    =============================== */

      if (typeof Unit !== "undefined" && typeof Unit.loadData === "function") {
        console.log("[UnitForm] Refresh Unit list...");

        await Unit.loadData();

        console.log("[UnitForm] Unit list refreshed.");
      } else {
        console.warn("[UnitForm] Unit.loadData() tidak ditemukan.");
      }
    } catch (error) {
      console.error("UNIT FORM SUBMIT ERROR:", error);

      Toast.error(error.message || "Gagal menyimpan unit.");
    } finally {
      this.state.submitting = false;

      if (button) {
        button.disabled = false;

        button.textContent =
          this.state.mode === "edit" ? "Simpan Perubahan" : "Simpan Unit";
      }
    }
  },

  /* =====================================
     ERROR
  ===================================== */

  renderError(message) {
    const target = document.getElementById("dynamicUnitFields");

    if (!target) {
      return;
    }

    target.innerHTML = `

      <div class="empty-state">

        <i data-lucide="circle-alert"></i>

        <h3>
          Gagal memuat pengaturan
        </h3>

        <p>
          ${this.escape(message)}
        </p>

      </div>

    `;

    this.refreshIcons();
  },

  /* =====================================
     CLOSE
  ===================================== */

  close() {
    this.clearPhotoUrls();

    const container = document.getElementById("unitFormContainer");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    this.resetState();
  },

  /* =====================================
     ESCAPE HTML
  ===================================== */

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =====================================
     ICON
  ===================================== */

  refreshIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },
};
