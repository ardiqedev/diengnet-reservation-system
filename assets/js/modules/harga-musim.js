/* =========================================
   HARGA MUSIM MODULE
========================================= */

const HargaMusim = {
  editingId: null,

  penginapanMap: {},
  musimMap: {},

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("Harga Musim Module Loaded");

    this.bindEvents();

    this.loadData();
  },

  /* =====================================
     EVENTS
  ===================================== */

  bindEvents() {
    /* Reserved for future events */
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData(page = 1) {
    Loading.show();

    try {
      /*
       * Load harga + master secara paralel
       */

      const [hargaResult, penginapanResult, musimResult] = await Promise.all([
        HargaMusimService.getAll({
          page,

          limit: 10,
        }),

        PenginapanService.getAll(),

        MusimService.getAll(),
      ]);

      /* ===============================
         VALIDASI HARGA
      =============================== */

      if (!hargaResult.success) {
        Toast.error(hargaResult.message || "Gagal memuat data harga musim.");

        return;
      }

      /* ===============================
         BUILD MASTER MAP
      =============================== */

      this.buildMasterMap(penginapanResult, musimResult);

      /* ===============================
         DATA
      =============================== */

      const data = hargaResult.data || {};

      const rows = data.rows || [];

      /* ===============================
         ENRICH DATA
      =============================== */

      const enrichedRows = rows.map((row) => ({
        ...row,

        penginapan: this.getPenginapanName(row.penginapanId),

        musim: this.getMusimName(row.musimId),
      }));

      /* ===============================
         RENDER
      =============================== */

      this.render(enrichedRows);

      /* ===============================
         PAGINATION
      =============================== */

      Pagination.render({
        target: "#paginationHargaMusim",

        page: data.page || page,

        totalPages: data.totalPages || 1,

        onChange: (nextPage) => {
          this.loadData(nextPage);
        },
      });

      /* ===============================
         SUMMARY
      =============================== */

      this.renderSummary(data, enrichedRows);
    } catch (error) {
      console.error("HargaMusim.loadData:", error);

      Toast.error(error.message || "Gagal memuat data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     BUILD MASTER MAP
  ===================================== */

  buildMasterMap(penginapanResult, musimResult) {
    this.penginapanMap = {};

    this.musimMap = {};

    /* ===============================
       PENGINAPAN
    =============================== */

    if (penginapanResult && penginapanResult.success) {
      const rows = penginapanResult.data?.rows || penginapanResult.data || [];

      rows.forEach((row) => {
        if (!row.id) {
          return;
        }

        this.penginapanMap[String(row.id)] =
          row.nama || row.namaPenginapan || row.id;
      });
    }

    /* ===============================
       MUSIM
    =============================== */

    if (musimResult && musimResult.success) {
      const rows = musimResult.data?.rows || musimResult.data || [];

      rows.forEach((row) => {
        if (!row.id) {
          return;
        }

        this.musimMap[String(row.id)] = row.nama || row.kode || row.id;
      });
    }
  },

  /* =====================================
     GET PENGINAPAN NAME
  ===================================== */

  getPenginapanName(id) {
    if (!id) {
      return "-";
    }

    return this.penginapanMap[String(id)] || id;
  },

  /* =====================================
     GET MUSIM NAME
  ===================================== */

  getMusimName(id) {
    if (!id) {
      return "-";
    }

    return this.musimMap[String(id)] || id;
  },

  /* =====================================
     SUMMARY
  ===================================== */

  renderSummary(data, rows) {
    const totalElement = document.getElementById("totalHargaMusim");

    const aktifElement = document.getElementById("totalAktif");

    /*
     * Jumlah penginapan yang
     * memiliki konfigurasi harga.
     */

    const penginapanIds = new Set(
      rows

        .map((row) => String(row.penginapanId || ""))

        .filter(Boolean),
    );

    const penginapanElement = document.getElementById("totalPenginapan");

    if (totalElement) {
      totalElement.textContent =
        data.summary?.total ?? data.total ?? rows.length;
    }

    if (aktifElement) {
      aktifElement.textContent =
        data.summary?.aktif ??
        rows.filter((row) => row.status === "ACTIVE").length;
    }

    if (penginapanElement) {
      penginapanElement.textContent = penginapanIds.size;
    }
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  render(rows) {
    Table.render({
      target: "#tableHargaMusim",

      columns: [
        {
          title: "Penginapan",

          field: "penginapan",
        },

        {
          title: "Musim",

          field: "musim",
        },

        {
          title: "Weekday",

          className: "text-end",

          formatter: (row) => this.formatCurrency(row.hargaWeekday),
        },

        {
          title: "Weekend",

          className: "text-end",

          formatter: (row) => this.formatCurrency(row.hargaWeekend),
        },

        {
          title: "Long Weekend",

          className: "text-end",

          formatter: (row) => this.formatCurrency(row.hargaLongWeekend),
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
                onclick="
                  HargaMusim.detail('${row.id}')
                ">

                Detail

              </button>


              <button
                class="btn btn-primary btn-sm"
                onclick="
                  HargaMusim.edit('${row.id}')
                ">

                Edit

              </button>


              <button
                class="btn btn-danger btn-sm"
                onclick="
                  HargaMusim.delete('${row.id}')
                ">

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
    Modal.open({
      title: data ? "Edit Harga Musim" : "Tambah Harga Musim",

      size: "xl",

      body: this.renderForm(),

      footer: this.renderFooter(data),
    });

    /* ===============================
       LOAD MASTER
    =============================== */

    await Promise.all([this.loadPenginapan(), this.loadMusim()]);

    /* ===============================
       EDIT MODE
    =============================== */

    if (data) {
      this.editingId = data.id;

      Form.setData(
        {
          penginapanId: data.penginapanId,

          musimId: data.musimId,

          hargaWeekday: data.hargaWeekday,

          hargaWeekend: data.hargaWeekend,

          hargaLongWeekend: data.hargaLongWeekend,

          minimalMalam: data.minimalMalam,

          status: data.status,

          catatan: data.catatan,
        },

        "#formHargaMusim",
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
        id="formHargaMusim"
        class="form">


        <!-- ===========================
             MASTER
        ============================ -->

        <div class="form-section">

          <div class="form-section-title">
            Informasi Harga
          </div>


          <div class="form-grid">


            <div class="form-row">

              <label class="form-label">

                Penginapan

                <span>*</span>

              </label>


              <select
                id="penginapanId"
                class="form-control">

                <option value="">
                  Pilih Penginapan
                </option>

              </select>

            </div>


            <div class="form-row">

              <label class="form-label">

                Musim

                <span>*</span>

              </label>


              <select
                id="musimId"
                class="form-control">

                <option value="">
                  Pilih Musim
                </option>

              </select>

            </div>


          </div>

        </div>


        <!-- ===========================
             HARGA
        ============================ -->

        <div class="form-section">

          <div class="form-section-title">
            Tarif
          </div>


          <div class="form-grid">


            <div class="form-row">

              <label class="form-label">

                Harga Weekday

                <span>*</span>

              </label>


              <input
                id="hargaWeekday"
                type="number"
                min="0"
                class="form-control"
                placeholder="350000">

            </div>


            <div class="form-row">

              <label class="form-label">

                Harga Weekend

                <span>*</span>

              </label>


              <input
                id="hargaWeekend"
                type="number"
                min="0"
                class="form-control"
                placeholder="450000">

            </div>


            <div class="form-row">

              <label class="form-label">

                Harga Long Weekend

                <span>*</span>

              </label>


              <input
                id="hargaLongWeekend"
                type="number"
                min="0"
                class="form-control"
                placeholder="500000">

            </div>


            <div class="form-row">

              <label class="form-label">

                Minimal Menginap

              </label>


              <input
                id="minimalMalam"
                type="number"
                min="1"
                class="form-control"
                value="1">

            </div>


            <div class="form-row">

              <label class="form-label">

                Status

              </label>


              <select
                id="status"
                class="form-control">

                <option value="ACTIVE">
                  Aktif
                </option>

                <option value="INACTIVE">
                  Non Aktif
                </option>

              </select>

            </div>


          </div>

        </div>


        <!-- ===========================
             CATATAN
        ============================ -->

        <div class="form-section">

          <div class="form-section-title">
            Informasi Tambahan
          </div>


          <div class="form-grid">

            <div class="form-row full">

              <label class="form-label">
                Catatan
              </label>


              <textarea
                id="catatan"
                rows="4"
                class="form-control"></textarea>

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
        onclick="HargaMusim.save()">

        ${data ? "Update Harga" : "Simpan Harga"}

      </button>

    `;
  },

  /* =====================================
     LOAD PENGINAPAN
  ===================================== */

  async loadPenginapan() {
    const result = await PenginapanService.getAll();

    if (!result.success) {
      Toast.error(result.message || "Gagal memuat penginapan.");

      return;
    }

    const rows = result.data?.rows || result.data || [];

    Dropdown.render({
      target: "#penginapanId",

      placeholder: "Pilih Penginapan",

      data: rows,

      valueField: "id",

      textField: "nama",
    });
  },

  /* =====================================
     LOAD MUSIM
  ===================================== */

  async loadMusim() {
    const result = await MusimService.getAll();

    if (!result.success) {
      Toast.error(result.message || "Gagal memuat musim.");

      return;
    }

    const rows = result.data?.rows || result.data || [];

    Dropdown.render({
      target: "#musimId",

      placeholder: "Pilih Musim",

      data: rows,

      valueField: "id",

      textField: "nama",
    });
  },

  /* =====================================
     SAVE
  ===================================== */

  async save() {
    const data = Form.getData("#formHargaMusim");

    /* ===============================
       VALIDASI
    =============================== */

    if (!data.penginapanId) {
      Toast.warning("Pilih Penginapan.");

      return;
    }

    if (!data.musimId) {
      Toast.warning("Pilih Musim.");

      return;
    }

    if (data.hargaWeekday === "" || data.hargaWeekday == null) {
      Toast.warning("Masukkan Harga Weekday.");

      return;
    }

    if (data.hargaWeekend === "" || data.hargaWeekend == null) {
      Toast.warning("Masukkan Harga Weekend.");

      return;
    }

    if (data.hargaLongWeekend === "" || data.hargaLongWeekend == null) {
      Toast.warning("Masukkan Harga Long Weekend.");

      return;
    }

    /* ===============================
       PAYLOAD
    =============================== */

    const payload = {
      id: this.editingId || this.generateId(),

      penginapanId: data.penginapanId,

      musimId: data.musimId,

      hargaWeekday: Number(data.hargaWeekday),

      hargaWeekend: Number(data.hargaWeekend),

      hargaLongWeekend: Number(data.hargaLongWeekend),

      minimalMalam: Number(data.minimalMalam) || 1,

      mataUang: "IDR",

      status: data.status || "ACTIVE",

      catatan: data.catatan || "",
    };

    console.log("HargaMusim Payload:", payload);

    /* ===============================
       SAVE
    =============================== */

    Loading.show();

    try {
      let result;

      if (this.editingId) {
        result = await HargaMusimService.update(this.editingId, payload);
      } else {
        result = await HargaMusimService.create(payload);
      }

      if (!result.success) {
        Toast.error(result.message || "Gagal menyimpan harga musim.");

        return;
      }

      Toast.success(result.message);

      Modal.close();

      this.editingId = null;

      await this.loadData();
    } catch (error) {
      console.error("HargaMusim.save:", error);

      Toast.error(error.message || "Terjadi kesalahan.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     DETAIL
  ===================================== */

  async detail(id) {
    const result = await HargaMusimService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    const d = result.data;

    const penginapan = d.penginapan || this.getPenginapanName(d.penginapanId);

    const musim = d.musim || this.getMusimName(d.musimId);

    Detail.open({
      title: "Detail Harga Musim",

      sections: [
        {
          title: "Informasi Harga",

          fields: [
            {
              label: "Penginapan",

              value: penginapan,
            },

            {
              label: "Musim",

              value: musim,
            },

            {
              label: "Status",

              value: d.status,
            },
          ],
        },

        {
          title: "Tarif",

          fields: [
            {
              label: "Weekday",

              value: this.formatCurrency(d.hargaWeekday),
            },

            {
              label: "Weekend",

              value: this.formatCurrency(d.hargaWeekend),
            },

            {
              label: "Long Weekend",

              value: this.formatCurrency(d.hargaLongWeekend),
            },

            {
              label: "Minimal Menginap",

              value: `${d.minimalMalam || 1} Malam`,
            },

            {
              label: "Mata Uang",

              value: d.mataUang || "IDR",
            },
          ],
        },

        {
          title: "Catatan",

          fields: [
            {
              label: "Keterangan",

              value: d.catatan || "-",

              full: true,
            },
          ],
        },
      ],
    });
  },

  /* =====================================
     EDIT
  ===================================== */

  async edit(id) {
    const result = await HargaMusimService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    await this.openForm(result.data);
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    Confirm.open({
      title: "Hapus Harga Musim",

      message: "Apakah Anda yakin ingin menghapus data harga musim ini?",

      type: "danger",

      confirmText: "Ya, Hapus",

      cancelText: "Batal",

      onConfirm: async () => {
        const result = await HargaMusimService.delete(id);

        if (!result.success) {
          Toast.error(result.message);

          return;
        }

        Toast.success(result.message || "Harga musim berhasil dihapus.");

        await this.loadData();
      },
    });
  },

  /* =====================================
     FORMAT CURRENCY
  ===================================== */

  formatCurrency(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
  },

  /* =====================================
     GENERATE ID
  ===================================== */

  generateId() {
    return "HM" + Date.now();
  },
};
