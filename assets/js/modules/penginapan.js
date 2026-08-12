/* =========================================
   PENGINAPAN MODULE
========================================= */

const Penginapan = {
  editingId: null,
  keyword: "",
  searchTimer: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("Penginapan Module Loaded");

    this.bindEvents();
    this.loadData();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  /* =====================================
   BIND EVENTS
===================================== */

  bindEvents() {
    Search.init({
      input: "#searchPenginapan",

      onSearch: (keyword) => {
        this.keyword = keyword;

        this.updateSearchClear();

        this.loadData(1, false);
      },
    });

    /* =====================================
     CLEAR SEARCH
  ===================================== */

    const clearButton = document.querySelector("#clearSearchPenginapan");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const input = document.querySelector("#searchPenginapan");

        if (!input) return;

        input.value = "";

        this.keyword = "";

        this.updateSearchClear();

        this.loadData(1, false);

        input.focus();
      });
    }
  },

  updateSearchClear() {
    const input = document.querySelector("#searchPenginapan");

    const clearButton = document.querySelector("#clearSearchPenginapan");

    if (!input || !clearButton) return;

    if (input.value.trim()) {
      clearButton.classList.add("show");
    } else {
      clearButton.classList.remove("show");
    }
  },

  /* =====================================
     OPEN FORM
  ===================================== */

  openForm(data = null) {
    Modal.open({
      title: data ? "Edit Penginapan" : "Tambah Penginapan",

      size: "xl",

      body: this.renderForm(),

      footer: this.renderFooter(data),
    });

    Upload.init({
      id: "logoPenginapan",

      accept: "image/*",

      maxSize: 2,

      multiple: false,

      maxWidth: 600,

      quality: 0.8,

      format: "webp",
    });

    Upload.init({
      id: "coverPenginapan",

      accept: "image/*",

      maxSize: 5,

      multiple: false,

      maxWidth: 1600,

      quality: 0.9,

      format: "jpeg",
    });

    if (data) {
      this.editingId = data.id;

      Form.setData(
        {
          namaPenginapan: data.nama,
          jenisPenginapan: data.jenis,
          kategoriPenginapan: data.kategori,
          namaPemilik: data.pemilik,
          whatsappPemilik: data.whatsapp,
          username: data.username,
          provinsi: data.provinsi,
          kabupaten: data.kabupaten,
          kecamatan: data.kecamatan,
          desa: data.desa,
          alamat: data.alamat,
          maps: data.maps,
          jamCheckIn: data.checkIn,
          jamCheckOut: data.checkOut,
        },
        "#formPenginapan",
      );

      Upload.load("logoPenginapan", {
        url: data.logoUrl,
        name: "Logo Penginapan",
      });

      Upload.load("coverPenginapan", {
        url: data.coverUrl,
        name: "Cover Penginapan",
      });
    } else {
      this.editingId = null;
    }
  },

  /* =====================================
   RENDER FORM
===================================== */

  renderForm() {
    return `

    <form id="formPenginapan" class="form">

        <!-- =====================================
             INFORMASI PENGINAPAN
        ====================================== -->

        <div class="form-section">

            <div class="form-section-title">

                Informasi Penginapan

            </div>

            <div class="form-grid">

                <div class="form-row">

                    <label class="form-label">

                        Nama Penginapan

                        <span>*</span>

                    </label>

                    <input
                        id="namaPenginapan"
                        type="text"
                        class="form-control"
                        placeholder="Masukkan nama penginapan">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Jenis Penginapan

                        <span>*</span>

                    </label>

                    <select
                        id="jenisPenginapan"
                        class="form-control">

                        <option value="">
                            Pilih Jenis Penginapan
                        </option>

                        <option>Homestay</option>

                        <option>Villa</option>

                        <option>Hotel</option>

                        <option>Guest House</option>

                        <option>Hostel</option>

                        <option>Camping Ground</option>

                    </select>

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Kategori

                    </label>

                    <select
                        id="kategoriPenginapan"
                        class="form-control">

                        <option>Standard</option>

                        <option>Premium</option>

                        <option>Luxury</option>

                    </select>

                </div>
             

                <div class="form-row">

                    <label class="form-label">

                        Jam Check In

                    </label>

                    <input
                        id="jamCheckIn"
                        type="time"
                        value="14:00"
                        class="form-control">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Jam Check Out

                    </label>

                    <input
                        id="jamCheckOut"
                        type="time"
                        value="12:00"
                        class="form-control">

                </div>

            </div>

        </div>

        <!-- =====================================
             INFORMASI PEMILIK
        ====================================== -->

        <div class="form-section">

            <div class="form-section-title">

                Informasi Pemilik

            </div>

            <div class="form-grid">

                <div class="form-row">

                    <label class="form-label">

                        Nama Pemilik

                        <span>*</span>

                    </label>

                    <input
                        id="namaPemilik"
                        class="form-control"
                        placeholder="Masukkan nama pemilik">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Nomor WhatsApp

                        <span>*</span>

                    </label>

                    <input
                        id="whatsappPemilik"
                        class="form-control"
                        placeholder="08xxxxxxxxxx">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Username

                        <span>*</span>

                    </label>

                    <input
                        id="username"
                        class="form-control"
                        placeholder="Username login">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Password Awal

                    </label>

                    <input
                        id="password"
                        class="form-control"
                        placeholder="Generate otomatis"
                        readonly>

                </div>

            </div>

        </div>

        <!-- =====================================
             LOKASI PENGINAPAN
        ====================================== -->

        <div class="form-section">

            <div class="form-section-title">

                Lokasi Penginapan

            </div>

            <div class="form-grid">

                <div class="form-row">

                    <label class="form-label">

                        Provinsi

                    </label>

                    <input
                        id="provinsi"
                        class="form-control">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Kabupaten

                    </label>

                    <input
                        id="kabupaten"
                        class="form-control">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Kecamatan

                    </label>

                    <input
                        id="kecamatan"
                        class="form-control">

                </div>

                <div class="form-row">

                    <label class="form-label">

                        Desa

                    </label>

                    <input
                        id="desa"
                        class="form-control">

                </div>

                <div class="form-row full">

                    <label class="form-label">

                        Alamat Lengkap

                    </label>

                    <textarea
                        id="alamat"
                        class="form-control"
                        placeholder="Masukkan alamat lengkap"></textarea>

                </div>

                <div class="form-row full">

                    <label class="form-label">

                        Google Maps URL

                    </label>

                    <input
                        id="maps"
                        class="form-control"
                        placeholder="https://maps.google.com/...">

                </div>

            </div>

        </div>

        <!-- =====================================
            MEDIA
        ===================================== -->

        <div class="form-section">

            <div class="form-section-title">

                Media

            </div>

            <div class="form-grid">

                <!-- ==========================
                    LOGO
                =========================== -->

                <div
                    class="upload"
                    data-upload="logoPenginapan">

                    <label class="upload-box">

                        <div class="upload-icon">

                            <i data-lucide="image"></i>

                        </div>

                        <div class="upload-title">

                            Upload Logo

                        </div>

                        <div class="upload-text">

                            Klik untuk memilih logo
                            <br>

                            JPG • PNG • WEBP

                        </div>

                        <input
                            type="file"
                            accept="image/*">

                    </label>

                    <div class="upload-preview">

                      <img class="upload-image">

                      <div class="upload-info">

                          <div class="upload-name"></div>

                          <div class="upload-size"></div>

                      </div>

                      <div class="upload-actions">

                          <button
                              type="button"
                              class="btn btn-outline btn-sm"
                              onclick="Upload.change('logoPenginapan')">

                              Ganti

                          </button>

                          <button
                              type="button"
                              class="upload-remove"
                              onclick="Upload.remove('logoPenginapan')">

                              <i data-lucide="x"></i>

                          </button>

                      </div>

                  </div>

                </div>

                <!-- ==========================
                    COVER
                =========================== -->

                <div
                    class="upload"
                    data-upload="coverPenginapan">

                    <label class="upload-box">

                        <div class="upload-icon">

                            <i data-lucide="image-plus"></i>

                        </div>

                        <div class="upload-title">

                            Upload Cover

                        </div>

                        <div class="upload-text">

                            Klik untuk memilih cover
                            <br>

                            JPG • PNG • WEBP

                        </div>

                        <input
                            type="file"
                            accept="image/*">

                    </label>

                    <div class="upload-preview">

                      <img class="upload-image">

                      <div class="upload-info">

                          <div class="upload-name"></div>

                          <div class="upload-size"></div>

                      </div>

                      <div class="upload-actions">

                          <button
                              type="button"
                              class="btn btn-outline btn-sm"
                              onclick="Upload.change('coverPenginapan')">

                              Ganti

                          </button>

                          <button
                              type="button"
                              class="upload-remove"
                              onclick="Upload.remove('coverPenginapan')">

                              <i data-lucide="x"></i>

                          </button>

                      

                  </div>
                </div>

            </div>

        </div>

    </form>

    `;
  },

  /* =====================================
     FOOTER
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

        onclick="Penginapan.save()">

        ${data ? "Update Penginapan" : "Simpan Penginapan"}

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
      namaPenginapan: {
        required: true,
        label: "Nama Penginapan wajib diisi",
      },

      jenisPenginapan: {
        required: true,
        label: "Pilih jenis penginapan",
      },

      namaPemilik: {
        required: true,
        label: "Nama pemilik wajib diisi",
      },

      whatsappPemilik: {
        required: true,
        label: "Nomor WhatsApp wajib diisi",
      },

      username: {
        required: true,
        label: "Username wajib diisi",
      },
    });

    if (!valid) return;

    /* ===============================
       GET FORM
    ============================== */

    const form = Form.getData("#formPenginapan");

    /* ===============================
       MAPPING DATA
    ============================== */

    const data = {
      id: this.editingId || this.generateId(),

      nama: form.namaPenginapan,

      jenis: form.jenisPenginapan,

      kategori: form.kategoriPenginapan,

      pemilik: form.namaPemilik,

      whatsapp: form.whatsappPemilik,

      username: form.username,

      password: form.password,

      provinsi: form.provinsi,

      kabupaten: form.kabupaten,

      kecamatan: form.kecamatan,

      desa: form.desa,

      alamat: form.alamat,

      maps: form.maps,

      checkIn: form.jamCheckIn,

      checkOut: form.jamCheckOut,

      status: "Aktif",

      logo: await Upload.serialize("logoPenginapan"),

      cover: await Upload.serialize("coverPenginapan"),

      createdAt: new Date().toISOString(),
    };

    Loading.show();

    try {
      let result;

      if (this.editingId) {
        result = await PenginapanService.update(this.editingId, data);
      } else {
        result = await PenginapanService.create(data);
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
     LOAD DATA
    ===================================== */

  /* =====================================
   LOAD DATA
===================================== */

  async loadData(page = 1, showLoading = true) {
    if (showLoading) {
      Loading.show();
    }

    try {
      const result = await PenginapanService.getAll({
        page,

        limit: 10,

        keyword: this.keyword || "",
      });

      console.log("[Penginapan] RESULT:", result);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const rows = Array.isArray(result.data?.rows) ? result.data.rows : [];

      console.log("[Penginapan] ROWS:", rows);

      /* ===============================
       RENDER TABLE
    =============================== */

      this.render(rows);

      /* ===============================
       PAGINATION
    =============================== */

      Pagination.render({
        target: "#paginationPenginapan",

        page: result.data.page,

        totalPages: result.data.totalPages,

        onChange: (nextPage) => {
          this.loadData(nextPage);
        },
      });

      /* ===============================
       SUMMARY
    =============================== */

      const totalPenginapan = document.getElementById("totalPenginapan");

      const penginapanAktif = document.getElementById("penginapanAktif");

      const totalKamar = document.getElementById("totalKamar");

      if (totalPenginapan) {
        totalPenginapan.textContent = result.data.total || 0;
      }

      if (penginapanAktif) {
        penginapanAktif.textContent = rows.filter(
          (item) => String(item.status).toLowerCase() === "aktif",
        ).length;
      }

      /*
       * Untuk sementara total kamar belum
       * dihitung dari backend penginapan.
       *
       * Jangan hardcode 186.
       */

      if (totalKamar) {
        totalKamar.textContent = "-";
      }
    } catch (err) {
      console.error("[Penginapan] Load error:", err);

      Toast.error("Gagal memuat data penginapan.");
    } finally {
      if (showLoading) {
        Loading.hide();
      }
    }
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  render(rows) {
    Table.render({
      target: "#tablePenginapan",

      columns: [
        {
          title: "Nama Penginapan",
          field: "nama",
        },

        {
          title: "Jenis",
          field: "jenis",
        },

        {
          title: "Pemilik",
          field: "pemilik",
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

            <div class="table-actions">

              <button
                class="btn btn-outline btn-sm"
                onclick="Penginapan.detail('${row.id}')">

                Detail

              </button>

              <button
                class="btn btn-primary btn-sm"
                onclick="Penginapan.edit('${row.id}')">

                Edit

              </button>

              <button
                class="btn btn-danger btn-sm"
                onclick="Penginapan.delete('${row.id}')">

                Hapus

              </button>

            </div>

          `,
        },
      ],

      data: rows,
    });
  },

  /* =====================================
     EDIT
  ===================================== */

  async edit(id) {
    Loading.show();

    try {
      const result = await PenginapanService.getById(id);

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

  async delete(id) {
    const result = await PenginapanService.getById(id);

    if (!result.success) {
      Toast.error(result.message);
      return;
    }

    const d = result.data;

    Confirm.open({
      title: "Hapus Penginapan",

      type: "danger",

      html: `

            <div class="delete-info">

                <h4>${d.nama}</h4>

                <p>${d.pemilik}</p>

                <span>${d.jenis}</span>

            </div>

            <p>
                Data yang dihapus tidak dapat dikembalikan.
            </p>

        `,

      confirmText: "Ya, Hapus",

      onConfirm: async () => {
        Loading.show();

        try {
          const res = await PenginapanService.remove(id);

          if (!res.success) {
            Toast.error(res.message);

            return;
          }

          Toast.success(res.message);

          this.loadData();
        } finally {
          Loading.hide();
        }
      },
    });
  },

  async detail(id) {
    const result = await PenginapanService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    const d = result.data;
    console.log("DATA :", d);
    console.log("LOGO :", d.logoUrl);
    console.log("COVER:", d.coverUrl);

    Detail.open({
      title: "Detail Penginapan",

      header: {
        image: d.logoUrl,

        icon: "hotel",

        title: d.nama,

        subtitle: `${d.jenis} • ${d.kategori}`,

        badge: Badge.status(d.status),
      },

      sections: [
        /* =====================================
           MEDIA
        ===================================== */

        {
          title: "Media",

          fields: [
            {
              label: "Cover",

              type: "image",

              value: d.coverUrl,

              full: true,
            },
          ],
        },

        /* =====================================
           INFORMASI PENGINAPAN
        ===================================== */

        {
          title: "Informasi Penginapan",

          fields: [
            {
              label: "Nama Penginapan",

              value: d.nama,
            },

            {
              label: "Jenis",

              value: d.jenis,
            },

            {
              label: "Kategori",

              value: d.kategori,
            },

            {
              label: "Jumlah Kamar",

              value: "-",
            },
          ],
        },

        /* =====================================
           INFORMASI PEMILIK
        ===================================== */

        {
          title: "Informasi Pemilik",

          fields: [
            {
              label: "Nama",

              value: d.pemilik,
            },

            {
              label: "WhatsApp",

              value: d.whatsapp,
            },

            {
              label: "Username",

              value: d.username,
            },
          ],
        },

        /* =====================================
           LOKASI
        ===================================== */

        {
          title: "Lokasi",

          fields: [
            {
              label: "Provinsi",

              value: d.provinsi,
            },

            {
              label: "Kabupaten",

              value: d.kabupaten,
            },

            {
              label: "Kecamatan",

              value: d.kecamatan,
            },

            {
              label: "Desa",

              value: d.desa,
            },

            {
              label: "Alamat",

              value: d.alamat,

              full: true,
            },

            {
              label: "Google Maps",

              value: d.maps,

              full: true,
            },
          ],
        },
      ],
    });
  },

  /* =====================================
    GENERATE ID
    ===================================== */

  generateId() {
    return "PGN" + Date.now();
  },
};
