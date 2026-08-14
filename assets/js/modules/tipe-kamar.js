/* =========================================
   TIPE KAMAR MODULE
========================================= */

const TipeKamar = {
  editingId: null,

  keyword: "",

  searchTimer: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("Tipe Kamar Module Loaded");

    this.bindEvents();

    this.loadData();
  },

  /* =====================================
   BIND EVENTS
===================================== */

  bindEvents() {
    Search.init({
      input: "#searchTipeKamar",

      delay: 400,

      onSearch: (keyword) => {
        this.keyword = keyword;

        this.updateSearchClear();

        this.loadData(1, false);
      },
    });

    /* ===============================
     CLEAR SEARCH
  =============================== */

    const clearButton = document.querySelector("#clearSearchTipeKamar");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const input = document.querySelector("#searchTipeKamar");

        if (input) {
          input.value = "";
        }

        this.keyword = "";

        this.updateSearchClear();

        this.loadData(1, false);
      });
    }
  },

  /* =====================================
   REMOVE PHOTO PREVIEW
===================================== */

  removePhotoPreview() {
    Upload.remove("fotoTipeKamar");
  },

  /* =====================================
   UPDATE SEARCH CLEAR
===================================== */

  updateSearchClear() {
    const input = document.querySelector("#searchTipeKamar");

    const clearButton = document.querySelector("#clearSearchTipeKamar");

    if (!input || !clearButton) {
      return;
    }

    if (input.value.trim()) {
      clearButton.classList.add("show");
    } else {
      clearButton.classList.remove("show");
    }
  },

  /* =====================================
   LOAD DATA
===================================== */

  async loadData(page = 1, showLoading = true) {
    if (showLoading) {
      Loading.show();
    }

    try {
      const result = await TipeKamarService.getAll({
        page,

        limit: 10,

        keyword: this.keyword || "",
      });

      console.log("TIPE KAMAR RESULT :", result);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      /* ===============================
       RENDER
    =============================== */

      this.render(result.data.rows);

      /* ===============================
       PAGINATION
    =============================== */

      Pagination.render({
        target: "#paginationTipeKamar",

        page: result.data.page,

        totalPages: result.data.totalPages,

        onChange: (page) => {
          this.loadData(page);
        },
      });
    } catch (err) {
      console.error(err);

      Toast.error("Gagal memuat data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
   RENDER TABLE
===================================== */

  render(rows) {
    Table.render({
      target: "#tableTipeKamar",

      columns: [
        {
          title: "Penginapan",

          field: "penginapan",
        },

        {
          title: "Nama Tipe",

          field: "nama",
        },

        {
          title: "Kapasitas",

          formatter: (row) =>
            `${row.kapasitasDewasa} Dewasa • ${row.kapasitasAnak} Anak`,
        },

        {
          title: "Bed",

          formatter: (row) => `${row.jumlahBed} ${row.jenisBed}`,
        },

        {
          title: "Status",

          className: "text-center",

          formatter: (row) => Badge.status(row.status),
        },

        {
          title: "Aksi",

          className: "text-center",

          formatter: (row) => `

            <button
                class="btn btn-outline btn-sm"
                onclick="TipeKamar.detail('${row.id}')">

                Detail

            </button>

            <button
                class="btn btn-primary btn-sm"
                onclick="TipeKamar.edit('${row.id}')">

                Edit

            </button>

            <button
                class="btn btn-danger btn-sm"
                onclick="TipeKamar.delete('${row.id}')">

                Hapus

            </button>

        `,
        },
      ],

      data: rows,
    });
  },

  /* =====================================
   OPEN FORM
===================================== */

  async openForm(data = null) {
    this.editingId = data ? data.id : null;

    Modal.open({
      title: data ? "Edit Tipe Kamar" : "Tambah Tipe Kamar",

      size: "xl",

      body: this.renderForm(),

      footer: this.renderFooter(data),
    });

    await this.loadPenginapan();

    /* ===============================
     UPLOAD
  =============================== */

    Upload.init({
      id: "fotoTipeKamar",

      accept: "image/*",

      maxSize: 5,

      maxWidth: 1600,

      quality: 0.8,

      format: "webp",

      multiple: false,
    });

    if (data) {
      Form.setData(
        {
          penginapan: data.penginapanId,
          nama: data.nama,
          kapasitasDewasa: data.kapasitasDewasa,
          kapasitasAnak: data.kapasitasAnak,
          jumlahBed: data.jumlahBed,
          jenisBed: data.jenisBed,
          luas: data.luas,
          status: data.status,
          fasilitas: data.fasilitas,
          deskripsi: data.deskripsi,
        },
        "#formTipeKamar",
      );

      /* ===============================
       LOAD FOTO LAMA
    =============================== */

      if (data.fotoUrl) {
        Upload.load("fotoTipeKamar", {
          url: data.fotoUrl,

          name: data.fotoName || "Foto Tipe Kamar",

          type: "image/webp",

          size: data.fotoSize || 0,
        });
      }
    } else {
      this.editingId = null;
    }
  },

  /* =====================================
   RENDER EXISTING PHOTO
===================================== */

  renderExistingPhoto(data) {
    if (!data || !data.fotoUrl) {
      return;
    }

    Upload.load("fotoTipeKamar", {
      url: data.fotoUrl,
      name: data.fotoName || "Foto Tipe Kamar",
      type: "image/*",
      size: 0,
    });
  },

  removePhotoPreview() {
    Upload.remove("fotoTipeKamar");
  },
  /* =====================================
     LOAD PENGINAPAN
===================================== */

  async loadPenginapan() {
    const result = await PenginapanService.getAll();

    if (!result.success) return;

    Dropdown.render({
      target: "#penginapan",

      data: result.data.rows,

      valueField: "id",

      textField: "nama",

      placeholder: "Pilih Penginapan",
    });
  },

  /* =====================================
   RENDER FORM
===================================== */

  renderForm() {
    return `

    <form
      id="formTipeKamar"
      class="form">

      <!-- =====================================
           INFORMASI TIPE KAMAR
      ====================================== -->

      <div class="form-section">

        <div class="form-section-title">

          Informasi Tipe Kamar

        </div>

        <div class="form-grid">

          <div class="form-row">

            <label class="form-label">

              Penginapan

              <span>*</span>

            </label>

            <select
              id="penginapan"
              class="form-control">

              <option value="">

                Pilih Penginapan

              </option>

            </select>

          </div>

          <div class="form-row">

            <label class="form-label">

              Nama Tipe

              <span>*</span>

            </label>

            <input
              id="nama"
              type="text"
              class="form-control"
              placeholder="Contoh : Deluxe Room">

          </div>

        </div>

      </div>

      <!-- =====================================
           KAPASITAS & BED
      ====================================== -->

      <div class="form-section">

        <div class="form-section-title">

          Kapasitas & Bed

        </div>

        <div class="form-grid">

          <div class="form-row">

            <label class="form-label">

              Kapasitas Dewasa

            </label>

            <input
              id="kapasitasDewasa"
              type="number"
              min="1"
              class="form-control"
              placeholder="2">

          </div>

          <div class="form-row">

            <label class="form-label">

              Kapasitas Anak

            </label>

            <input
              id="kapasitasAnak"
              type="number"
              min="0"
              class="form-control"
              placeholder="1">

          </div>

          <div class="form-row">

            <label class="form-label">

              Jumlah Bed

            </label>

            <input
              id="jumlahBed"
              type="number"
              min="1"
              class="form-control"
              placeholder="1">

          </div>

          <div class="form-row">

            <label class="form-label">

              Jenis Bed

            </label>

            <select
              id="jenisBed"
              class="form-control">

              <option value="Single">Single</option>

              <option value="Twin">Twin</option>

              <option value="Double">Double</option>

              <option value="Queen">Queen</option>

              <option value="King">King</option>

            </select>

          </div>

          <div class="form-row">

            <label class="form-label">

              Luas Kamar (m²)

            </label>

            <input
              id="luas"
              type="number"
              min="1"
              class="form-control"
              placeholder="Contoh : 24">

          </div>

          <div class="form-row">

            <label class="form-label">

              Status

            </label>

            <select
              id="status"
              class="form-control">

              <option value="Aktif">

                Aktif

              </option>

              <option value="Non Aktif">

                Non Aktif

              </option>

            </select>

          </div>

        </div>

      </div>

      <!-- =====================================
           DESKRIPSI
      ====================================== -->

      <div class="form-section">

        <div class="form-section-title">

          Informasi Tambahan

        </div>

        <!-- =====================================
            FOTO TIPE KAMAR
        ====================================== -->

        <div class="form-row full">

          <label class="form-label">
            Foto Tipe Kamar
          </label>

          <div
            class="upload-component"
            data-upload="fotoTipeKamar"
          >

            <div class="upload-box">

              <div class="upload-icon">
                📷
              </div>

              <strong>
                Foto Tipe Kamar
              </strong>

              <small>
                JPG / PNG / WEBP • Maksimal 5 MB
              </small>

              <button
                type="button"
                class="btn btn-outline"
                onclick="Upload.change('fotoTipeKamar')"
              >
                Pilih Foto
              </button>

            </div>


            <div class="upload-preview">

              <img
                class="upload-image"
                alt="Preview foto tipe kamar"
              >

              <div class="upload-info">

                <strong class="upload-name"></strong>

                <small class="upload-size"></small>

              </div>

              <button
                type="button"
                class="btn btn-outline"
                onclick="Upload.change('fotoTipeKamar')"
              >
                Ganti Foto
              </button>

              <button
                type="button"
                class="btn btn-danger"
                onclick="Upload.remove('fotoTipeKamar')"
              >
                Hapus
              </button>

            </div>


            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
            >

          </div>

        </div>

        <div class="form-grid">

          <div class="form-row full">

            <label class="form-label">

              Fasilitas

            </label>

            <input
              id="fasilitas"
              type="text"
              class="form-control"
              placeholder="Pisahkan dengan koma (,). Contoh: WiFi, TV, Breakfast">

          </div>

          <div class="form-row full">

            <label class="form-label">

              Deskripsi

            </label>

            <textarea
              id="deskripsi"
              rows="5"
              class="form-control"
              placeholder="Masukkan deskripsi tipe kamar..."></textarea>

          </div>

        </div>

      </div>

    </form>

  `;
  },

  /* =====================================
       RENDER FOOTER
    ===================================== */

  renderFooter(data) {
    return `

        <button
            class="btn btn-outline"
            onclick="Modal.close()">

            Batal

        </button>

        <button
            class="btn btn-primary"
            onclick="TipeKamar.save()">

            ${data ? "Update Tipe Kamar" : "Simpan Tipe Kamar"}

        </button>

    `;
  },

  /* =====================================
       SAVE
    ===================================== */

  async save() {
    /* ===============================
     VALIDASI
  ============================== */

    const valid = Validator.validate({
      penginapan: {
        required: true,
        label: "Pilih penginapan",
      },

      nama: {
        required: true,
        label: "Nama tipe kamar wajib diisi",
      },
    });

    if (!valid) return;

    /* ===============================
     GET FORM
  ============================== */

    const form = Form.getData("#formTipeKamar");

    /* ===============================
     GET PENGINAPAN
  ============================== */

    const resultPenginapan = await PenginapanService.getById(form.penginapan);

    const penginapan = resultPenginapan.success ? resultPenginapan.data : null;

    /* ===============================
     FOTO
  ============================== */

    const foto = await Upload.serialize("fotoTipeKamar");

    /* ===============================
     DATA
  ============================== */

    const data = {
      id: this.editingId || this.generateId(),

      penginapanId: form.penginapan,

      penginapan: penginapan?.nama || "",

      nama: form.nama,

      kapasitasDewasa: Number(form.kapasitasDewasa) || 0,

      kapasitasAnak: Number(form.kapasitasAnak) || 0,

      jumlahBed: Number(form.jumlahBed) || 1,

      jenisBed: form.jenisBed,

      luas: Number(form.luas) || 0,

      fasilitas: form.fasilitas,

      deskripsi: form.deskripsi,

      status: form.status,

      /* ===============================
     FOTO
  =============================== */

      foto: foto,
    };

    Loading.show();

    try {
      let result;

      if (this.editingId) {
        result = await TipeKamarService.update(this.editingId, data);
      } else {
        result = await TipeKamarService.create(data);
      }

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      Toast.success(result.message);

      Modal.close();

      this.editingId = null;

      await this.loadData();
    } catch (err) {
      console.error(err);

      Toast.error("Terjadi kesalahan.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
   DETAIL
===================================== */

  async detail(id) {
    Loading.show();

    try {
      const result = await TipeKamarService.getById(id);

      if (!result.success) {
        Toast.error(result.message);
        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Tipe Kamar",

        sections: [
          /* =====================================
           FOTO TIPE KAMAR
        ===================================== */

          {
            title: "Foto Tipe Kamar",

            fields: [
              {
                label: "",
                value: d.fotoUrl || "",
                type: "image",
                full: true,
              },
            ],
          },

          /* =====================================
           INFORMASI
        ===================================== */

          {
            title: "Informasi",

            fields: [
              {
                label: "Penginapan",
                value: d.penginapan,
              },

              {
                label: "Nama Tipe",
                value: d.nama,
              },

              {
                label: "Status",
                value: Badge.status(d.status),
              },
            ],
          },

          /* =====================================
           SPESIFIKASI
        ===================================== */

          {
            title: "Spesifikasi",

            fields: [
              {
                label: "Kapasitas",
                value: `${d.kapasitasDewasa} Dewasa • ${d.kapasitasAnak} Anak`,
              },

              {
                label: "Bed",
                value: `${d.jumlahBed} ${d.jenisBed}`,
              },

              {
                label: "Luas",
                value: `${d.luas} m²`,
              },
            ],
          },

          /* =====================================
           INFORMASI TAMBAHAN
        ===================================== */

          {
            title: "Informasi Tambahan",

            fields: [
              {
                label: "Fasilitas",
                value: d.fasilitas || "-",
              },

              {
                label: "Deskripsi",
                value: d.deskripsi || "-",
                full: true,
              },
            ],
          },
        ],
      });
    } catch (err) {
      console.error(err);

      Toast.error("Gagal mengambil data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
   EDIT
===================================== */

  async edit(id) {
    Loading.show();

    try {
      const result = await TipeKamarService.getById(id);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      this.openForm(result.data);
    } catch (err) {
      console.error(err);

      Toast.error("Gagal mengambil data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
       DELETE
    ===================================== */

  /* =====================================
   DELETE
===================================== */

  delete(id) {
    Confirm.open({
      title: "Hapus Tipe Kamar",

      message: "Data tipe kamar akan dihapus permanen.",

      type: "danger",

      confirmText: "Hapus",

      onConfirm: async () => {
        Loading.show();

        try {
          const result = await TipeKamarService.remove(id);

          if (!result.success) {
            Toast.error(result.message);

            return;
          }

          Toast.success(result.message);

          await this.loadData();
        } finally {
          Loading.hide();
        }
      },
    });
  },

  /* =====================================
       GENERATE ID
    ===================================== */

  generateId() {
    return "TP" + Date.now();
  },
};
