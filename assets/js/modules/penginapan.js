/* =========================================
   HTML ESCAPE HELPER
========================================= */

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

/* =========================================
   PENGINAPAN MODULE
========================================= */

const Penginapan = {
  editingId: null,

  keyword: "",

  searchTimer: null,

  owners: [],

  /* =====================================
     INIT
  ===================================== */

  async init() {
    console.log("Penginapan Module Loaded");

    this.bindEvents();

    await this.loadOwners();

    await this.loadData();
  },

  /* =====================================
     LOAD OWNERS
  ===================================== */

  async loadOwners() {
    try {
      const result = await PenginapanService.getOwners();

      console.log("[Penginapan] OWNER RESULT:", result);

      if (!result.success) {
        Toast.error(result.message || "Gagal mengambil data owner.");

        return;
      }

      this.owners = Array.isArray(result.data) ? result.data : [];

      console.log("[Penginapan] OWNERS:", this.owners);
    } catch (err) {
      console.error("[Penginapan] Owner error:", err);

      Toast.error("Gagal memuat data owner.");
    }
  },

  /* =====================================
     GET OWNER NAME
  ===================================== */

  getOwnerName(ownerId) {
    const owner = this.owners.find(
      (item) => String(item.id) === String(ownerId),
    );

    return owner?.nama || "-";
  },

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

  /* =====================================
     UPDATE SEARCH CLEAR
  ===================================== */

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

  async openForm(data = null) {
    if (!this.owners.length) {
      await this.loadOwners();
    }

    Modal.open({
      title: data ? "Edit Penginapan" : "Tambah Penginapan",

      size: "xl",

      body: this.renderForm(),

      footer: this.renderFooter(data),
    });

    /* =====================================
       LOGO
    ===================================== */

    Upload.init({
      id: "logoPenginapan",

      accept: "image/*",

      maxSize: 2,

      multiple: false,

      maxWidth: 600,

      quality: 0.8,

      format: "webp",
    });

    /* =====================================
       COVER
    ===================================== */

    Upload.init({
      id: "coverPenginapan",

      accept: "image/*",

      maxSize: 5,

      multiple: false,

      maxWidth: 1600,

      quality: 0.9,

      format: "jpeg",
    });

    /* =====================================
       EDIT DATA
    ===================================== */

    if (data) {
      this.editingId = data.id;

      Form.setData(
        {
          namaPenginapan: data.nama,

          jenisPenginapan: data.jenis,

          ownerId: data.ownerId,

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

    <form
      id="formPenginapan"
      class="form">

      <!-- =====================================
          INFORMASI PENGINAPAN
      ====================================== -->

      <div class="form-section">

        <div class="form-section-title">

          Informasi Penginapan

        </div>


        <div class="form-grid">


          <!-- =====================================
              NAMA PENGINAPAN
          ====================================== -->

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


          <!-- =====================================
              JENIS PENGINAPAN
          ====================================== -->

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

              <option value="Homestay">

                Homestay

              </option>

              <option value="Villa">

                Villa

              </option>

              <option value="Hotel">

                Hotel

              </option>

              <option value="Glamping">

                Glamping

              </option>

            </select>

          </div>


          <!-- =====================================
              CHECK IN
          ====================================== -->

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


          <!-- =====================================
              CHECK OUT
          ====================================== -->

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
           PEMILIK PENGINAPAN
      ====================================== -->

      <div class="form-section">

        <div class="form-section-title">

          Pemilik Penginapan

        </div>


        <div class="form-grid">


          <div class="form-row">

            <label class="form-label">

              Owner

              <span>*</span>

            </label>


            <select
              id="ownerId"
              class="form-control">

              <option value="">

                Pilih Owner

              </option>

              ${this.owners
                .map(
                  (owner) => `

                    <option
                      value="${escapeAttribute(owner.id)}">

                      ${escapeHtml(owner.nama)}

                    </option>

                  `,
                )
                .join("")}

            </select>

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
      ====================================== -->

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


              <img
                class="upload-image">


              <div class="upload-info">

                <div
                  class="upload-name">
                </div>

                <div
                  class="upload-size">
                </div>

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


              <img
                class="upload-image">


              <div class="upload-info">

                <div
                  class="upload-name">
                </div>

                <div
                  class="upload-size">
                </div>

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

      ownerId: {
        required: true,

        label: "Pilih owner penginapan",
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

      ownerId: form.ownerId,

      nama: form.namaPenginapan,

      jenis: form.jenisPenginapan,

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

      this.render(rows);

      /* ===============================
         PAGINATION
      ============================== */

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
      ============================== */

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

          field: "ownerId",

          formatter: (row) => this.getOwnerName(row.ownerId),
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

              <div
                class="table-actions">


                <button
                  class="btn btn-outline btn-sm"
                  onclick="
                    Penginapan.detail('${row.id}')
                  ">

                  Detail

                </button>


                <button
                  class="btn btn-primary btn-sm"
                  onclick="
                    Penginapan.edit('${row.id}')
                  ">

                  Edit

                </button>


                <button
                  class="btn btn-danger btn-sm"
                  onclick="
                    Penginapan.delete('${row.id}')
                  ">

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

      await this.openForm(result.data);
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

          <h4>
            ${escapeHtml(d.nama)}
          </h4>

          <p>
            ${escapeHtml(this.getOwnerName(d.ownerId))}
          </p>

          <span>
            ${escapeHtml(d.jenis || "-")}
          </span>

        </div>


        <p>
          Data yang dihapus tidak dapat
          dikembalikan.
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

          await this.loadData();
        } finally {
          Loading.hide();
        }
      },
    });
  },

  /* =====================================
     DETAIL
  ===================================== */

  async detail(id) {
    Loading.show();

    try {
      const result = await PenginapanService.getById(id);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Penginapan",

        header: {
          image: d.logoUrl,

          icon: "hotel",

          title: d.nama,

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
                label: "Pemilik",

                value: this.getOwnerName(d.ownerId),
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
    } catch (err) {
      console.error(err);

      Toast.error("Gagal mengambil data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     GENERATE ID
  ===================================== */

  generateId() {
    return "PGN" + Date.now();
  },
};
