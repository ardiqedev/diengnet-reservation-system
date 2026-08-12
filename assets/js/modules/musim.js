/* =========================================
   TIPE KAMAR MODULE
========================================= */

const Musim = {
  editingId: null,

  /* =====================================
       INIT
    ===================================== */

  init() {
    console.log("Musim Module Loaded");

    this.bindEvents();

    this.loadData();
  },

  /* =====================================
       EVENTS
    ===================================== */

  bindEvents() {},

  /* =====================================
       LOAD DATA
    ===================================== */

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData(page = 1) {
    Loading.show();

    try {
      const result = await MusimService.getAll(page);

      if (!result.success) {
        Toast.error(result.message);
        return;
      }

      const rows = result.data.rows;

      this.render(rows);

      Pagination.render({
        target: "#paginationMusim",

        page: result.data.page,

        totalPages: result.data.totalPages,

        onChange: (page) => {
          this.loadData(page);
        },
      });

      /* ===========================
       SUMMARY
    =========================== */

      const totalAktif = rows.filter((item) => item.status === "Aktif").length;

      const totalNonAktif = rows.filter(
        (item) => item.status === "Non Aktif",
      ).length;

      document.getElementById("totalMusim").textContent = result.data.total;

      document.getElementById("totalAktif").textContent = totalAktif;

      document.getElementById("totalNonAktif").textContent = totalNonAktif;
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
      target: "#tableMusim",

      columns: [
        {
          title: "Kode",

          field: "kode",
        },

        {
          title: "Nama Musim",

          field: "nama",
        },

        {
          title: "Periode",

          formatter: (row) =>
            `${this.formatDate(row.tanggalMulai)} s/d ${this.formatDate(row.tanggalSelesai)}`,
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
              onclick="Musim.detail('${row.id}')">

              Detail

          </button>

          <button
              class="btn btn-primary btn-sm"
              onclick="Musim.edit('${row.id}')">

              Edit

          </button>

          <button
              class="btn btn-danger btn-sm"
              onclick="Musim.delete('${row.id}')">

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

  /* =====================================
   OPEN FORM
===================================== */

  async openForm(data = null) {
    this.editingId = data ? data.id : null;

    Modal.open({
      title: data ? "Edit Musim" : "Tambah Musim",

      size: "lg",

      body: this.renderForm(),

      footer: this.renderFooter(data),
    });

    /* ===========================
     EDIT MODE
  =========================== */

    if (data) {
      Form.setData(
        {
          kode: data.kode,

          nama: data.nama,

          tanggalMulai: this.toInputDate(data.tanggalMulai),

          tanggalSelesai: this.toInputDate(data.tanggalSelesai),

          status: data.status,

          keterangan: data.keterangan,
        },
        "#formMusim",
      );
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
    id="formMusim"
    class="form">

    <!-- ===========================
         INFORMASI MUSIM
    ============================ -->

    <div class="form-section">

        <div class="form-section-title">

            Informasi Musim

        </div>

        <div class="form-grid">

            <div class="form-row">

                <label class="form-label">

                    Kode Musim

                    <span>*</span>

                </label>

                <input
                    id="kode"
                    type="text"
                    class="form-control"
                    placeholder="Contoh : PEAK">

            </div>

            <div class="form-row">

                <label class="form-label">

                    Nama Musim

                    <span>*</span>

                </label>

                <input
                    id="nama"
                    type="text"
                    class="form-control"
                    placeholder="Contoh : Peak Season">

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

    <!-- ===========================
         PERIODE
    ============================ -->

    <div class="form-section">

        <div class="form-section-title">

            Periode

        </div>

        <div class="form-grid">

            <div class="form-row">

                <label class="form-label">

                    Tanggal Mulai

                    <span>*</span>

                </label>

                <input
                    id="tanggalMulai"
                    type="date"
                    class="form-control">

            </div>

            <div class="form-row">

                <label class="form-label">

                    Tanggal Selesai

                    <span>*</span>

                </label>

                <input
                    id="tanggalSelesai"
                    type="date"
                    class="form-control">

            </div>

        </div>

    </div>

    <!-- ===========================
         INFORMASI TAMBAHAN
    ============================ -->

    <div class="form-section">

        <div class="form-section-title">

            Informasi Tambahan

        </div>

        <div class="form-grid">

            <div class="form-row full">

                <label class="form-label">

                    Keterangan

                </label>

                <textarea
                    id="keterangan"
                    rows="4"
                    class="form-control"
                    placeholder="Masukkan keterangan musim..."></textarea>

            </div>

        </div>

    </div>

</form>

`;
  },

  /* =====================================
       RENDER FOOTER
    ===================================== */

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
        onclick="Musim.save()">

        ${data ? "Update Musim" : "Simpan Musim"}

    </button>

  `;
  },
  /* =====================================
       SAVE
    ===================================== */

  /* =====================================
   SAVE
===================================== */

  async save() {
    /* ===============================
     VALIDASI
  ============================== */

    const valid = Validator.validate({
      kode: {
        required: true,
        label: "Kode musim wajib diisi",
      },

      nama: {
        required: true,
        label: "Nama musim wajib diisi",
      },

      tanggalMulai: {
        required: true,
        label: "Tanggal mulai wajib diisi",
      },

      tanggalSelesai: {
        required: true,
        label: "Tanggal selesai wajib diisi",
      },
    });

    if (!valid) return;

    /* ===============================
     GET FORM
  ============================== */

    const form = Form.getData("#formMusim");
    if (new Date(form.tanggalMulai) > new Date(form.tanggalSelesai)) {
      Toast.warning(
        "Tanggal mulai tidak boleh lebih besar dari tanggal selesai.",
      );
      return;
    }

    /* ===============================
     MAPPING
  ============================== */

    const data = {
      id: this.editingId || this.generateId(),

      kode: form.kode.trim(),

      nama: form.nama.trim(),

      tanggalMulai: form.tanggalMulai,

      tanggalSelesai: form.tanggalSelesai,

      status: form.status,

      keterangan: form.keterangan,
    };

    Loading.show();

    try {
      let result;

      if (this.editingId) {
        result = await MusimService.update(this.editingId, data);
      } else {
        result = await MusimService.create(data);
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

  /* =====================================
   DETAIL
===================================== */

  /* =====================================
   DETAIL
===================================== */

  async detail(id) {
    Loading.show();

    try {
      const result = await MusimService.getById(id);

      if (!result.success) {
        Toast.error(result.message);
        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Musim",

        sections: [
          {
            title: "Informasi Musim",

            fields: [
              {
                label: "Kode Musim",
                value: d.kode,
              },

              {
                label: "Nama Musim",
                value: d.nama,
              },

              {
                label: "Status",
                value: Badge.status(d.status),
              },
            ],
          },

          {
            title: "Periode",

            fields: [
              {
                label: "Tanggal Mulai",
                value: this.formatDate(d.tanggalMulai),
              },

              {
                label: "Tanggal Selesai",
                value: this.formatDate(d.tanggalSelesai),
              },
            ],
          },

          {
            title: "Informasi Tambahan",

            fields: [
              {
                label: "Keterangan",
                value: d.keterangan || "-",
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
      const result = await MusimService.getById(id);

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

  /* =====================================
   DELETE
===================================== */

  delete(id) {
    Confirm.open({
      title: "Hapus Musim",

      message: "Apakah Anda yakin ingin menghapus data musim ini?",

      type: "danger",

      confirmText: "Hapus",

      cancelText: "Batal",

      onConfirm: async () => {
        Loading.show();

        try {
          const result = await MusimService.delete(id);

          if (!result.success) {
            Toast.error(result.message);
            return;
          }

          Toast.success(result.message);

          await this.loadData();
        } catch (err) {
          console.error(err);

          Toast.error("Terjadi kesalahan.");
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
    return "MS" + Date.now();
  },

  /* =====================================
   FORMAT TANGGAL
===================================== */

  formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  },

  /* =====================================
   DATE INPUT
===================================== */

  toInputDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  },
};
