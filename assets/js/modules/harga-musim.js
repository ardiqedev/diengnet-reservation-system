/* =========================================
   HARGA MUSIM MODULE
========================================= */

const HargaMusim = {
  editingId: null,

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
    document.addEventListener("change", async (e) => {
      if (e.target.id === "penginapanId") {
        await this.loadTipeKamar(e.target.value);

        document.getElementById("tipeKamarId").value = "";
      }
    });
  },

  /* =====================================
     LOAD DATA
===================================== */

  async loadData(page = 1) {
    Loading.show();

    try {
      const result = await HargaMusimService.getAll({
        page,
        limit: 10,
      });

      if (!result.success) {
        Toast.error(result.message || "Gagal memuat data harga musim.");
        return;
      }

      const data = result.data || {};
      const rows = data.rows || [];

      this.render(rows);

      Pagination.render({
        target: "#paginationHargaMusim",

        page: data.page || page,

        totalPages: data.totalPages || 1,

        onChange: (nextPage) => {
          this.loadData(nextPage);
        },
      });

      document.getElementById("totalHargaMusim").textContent =
        data.summary?.total ?? data.total ?? rows.length;

      document.getElementById("totalAktif").textContent =
        data.summary?.aktif ?? 0;
    } catch (error) {
      console.error("HargaMusim.loadData:", error);

      Toast.error(error.message || "Gagal memuat data.");
    } finally {
      Loading.hide();
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
          title: "Tipe Kamar",
          field: "tipeKamar",
        },

        {
          title: "Musim",
          field: "musim",
        },

        {
          title: "Weekday",
          className: "text-end",

          formatter: (row) =>
            "Rp " + Number(row.hargaWeekday || 0).toLocaleString("id-ID"),
        },

        {
          title: "Weekend",
          className: "text-end",

          formatter: (row) =>
            "Rp " + Number(row.hargaWeekend || 0).toLocaleString("id-ID"),
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
            onclick="HargaMusim.detail('${row.id}')">

            Detail

          </button>

          <button
            class="btn btn-primary btn-sm"
            onclick="HargaMusim.edit('${row.id}')">

            Edit

          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="HargaMusim.delete('${row.id}')">

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

    /* ===========================
       LOAD DROPDOWN
    =========================== */

    await Promise.all([
      this.loadPenginapan(),
      this.loadTipeKamar(data ? data.penginapanId : ""),
      this.loadMusim(),
    ]);
    /* ===========================
       EDIT MODE
    =========================== */

    if (data) {
      this.editingId = data.id;

      Form.setData(
        {
          penginapanId: data.penginapanId,

          tipeKamarId: data.tipeKamarId,

          musimId: data.musimId,

          tanggalMulai: data.tanggalMulai,

          tanggalSelesai: data.tanggalSelesai,

          weekday: data.weekday,

          weekend: data.weekend,

          extraPerson: data.extraPerson,

          minimalMalam: data.minimalMalam,

          status: data.status,

          catatan: data.catatan,
        },
        "#formHargaMusim",
      );
      document.getElementById("tipeKamarId").disabled = false;
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
        INFORMASI
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

                    Tipe Kamar

                    <span>*</span>

                </label>               

                <select
                    id="tipeKamarId"
                    class="form-control"
                    disabled>

                    <option value="">

                        Pilih Penginapan Dahulu

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

                </label>

                <input
                    id="tanggalMulai"
                    type="date"
                    class="form-control">

            </div>

            <div class="form-row">

                <label class="form-label">

                    Tanggal Selesai

                </label>

                <input
                    id="tanggalSelesai"
                    type="date"
                    class="form-control">

            </div>

        </div>

    </div>

    <!-- ===========================
        HARGA
    ============================ -->

    <div class="form-section">

        <div class="form-section-title">

            Harga

        </div>

        <div class="form-grid">

            <div class="form-row">

                <label class="form-label">

                    Tarif Weekday

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

                    Tarif Weekend

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

                    Tarif Extra Person

                </label>

          
                <input
                    id="hargaExtraBed"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="50000">

            </div>

            <div class="form-row">

                <label class="form-label">

                    Minimal Menginap

                </label>

                <input
                    id="minimalMalam"
                    type="number"
                    min="1"
                    class="form-control">

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

    if (!result.success) return;

    Dropdown.render({
      target: "#penginapanId",

      placeholder: "Pilih Penginapan",

      data: result.data.rows,

      valueField: "id",

      textField: "nama",
    });
  },

  /* =====================================
     LOAD TIPE KAMAR
===================================== */

  async loadTipeKamar(penginapanId = "") {
    const result = await TipeKamarService.getAll();

    if (!result.success) return;

    let rows = result.data.rows;

    if (penginapanId) {
      rows = rows.filter((item) => item.penginapanId === penginapanId);
    }

    const select = document.getElementById("tipeKamarId");

    select.disabled = !penginapanId;

    Dropdown.render({
      target: "#tipeKamarId",

      placeholder: penginapanId
        ? "Pilih Tipe Kamar"
        : "Pilih Penginapan Dahulu",

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

    if (!result.success) return;

    Dropdown.render({
      target: "#musimId",

      placeholder: "Pilih Musim",

      data: result.data.rows,

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
      Toast.warning("Pilih Penginapan");
      return;
    }

    if (!data.tipeKamarId) {
      Toast.warning("Pilih Tipe Kamar");
      return;
    }

    if (!data.musimId) {
      Toast.warning("Pilih Musim");
      return;
    }

    if (!data.hargaWeekday) {
      Toast.warning("Masukkan Tarif Weekday");
      return;
    }

    if (!data.hargaWeekend) {
      Toast.warning("Masukkan Tarif Weekend");
      return;
    }

    /* ===============================
     GET MASTER
  =============================== */

    const penginapan = await PenginapanService.getById(data.penginapanId);

    const tipe = await TipeKamarService.getById(data.tipeKamarId);

    const musim = await MusimService.getById(data.musimId);

    if (!penginapan.success || !tipe.success || !musim.success) {
      Toast.error("Data master tidak ditemukan.");
      return;
    }

    /* ===============================
     MAPPING
  =============================== */

    const payload = {
      id: this.editingId || this.generateId(),

      penginapanId: data.penginapanId,

      penginapan: penginapan.data.nama,

      tipeKamarId: data.tipeKamarId,

      tipeKamar: tipe.data.nama,

      musimId: data.musimId,

      musim: musim.data.nama,

      tanggalMulai: data.tanggalMulai,

      tanggalSelesai: data.tanggalSelesai,

      hargaWeekday: Number(data.hargaWeekday),

      hargaWeekend: Number(data.hargaWeekend),

      hargaExtraBed: Number(data.hargaExtraBed) || 0,

      minimalMalam: Number(data.minimalMalam) || 1,

      mataUang: "IDR",

      status: data.status,

      catatan: data.catatan,
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
        Toast.error(result.message);
        return;
      }

      Toast.success(result.message);

      Modal.close();

      this.editingId = null;

      await this.loadData();
    } catch (err) {
      console.error(err);

      Toast.error(err.message || "Terjadi kesalahan.");
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

  async detail(id) {
    const result = await HargaMusimService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    const d = result.data;

    Detail.open({
      title: "Detail Harga Musim",

      sections: [
        {
          title: "Informasi Harga",

          fields: [
            {
              label: "Penginapan",

              value: d.penginapan,
            },

            {
              label: "Tipe Kamar",

              value: d.tipeKamar,
            },

            {
              label: "Musim",

              value: d.musim,
            },

            {
              label: "Status",

              value: d.status,
            },
          ],
        },

        {
          title: "Periode",

          fields: [
            {
              label: "Tanggal Mulai",

              value: d.tanggalMulai,
            },

            {
              label: "Tanggal Selesai",

              value: d.tanggalSelesai,
            },

            {
              label: "Minimal Menginap",

              value: d.minimalMalam + " Malam",
            },
          ],
        },

        {
          title: "Harga",

          fields: [
            {
              title: "Harga",

              fields: [
                {
                  label: "Weekday",
                  value:
                    "Rp " + Number(d.hargaWeekday || 0).toLocaleString("id-ID"),
                },

                {
                  label: "Weekend",
                  value:
                    "Rp " + Number(d.hargaWeekend || 0).toLocaleString("id-ID"),
                },

                {
                  label: "Extra Person",
                  value:
                    "Rp " +
                    Number(d.hargaExtraBed || 0).toLocaleString("id-ID"),
                },

                {
                  label: "Mata Uang",
                  value: d.mataUang || "IDR",
                },
              ],
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

  /* =====================================
     EDIT
===================================== */

  async edit(id) {
    const result = await HargaMusimService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    this.openForm(result.data);
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

        Toast.success("Harga musim berhasil dihapus.");

        this.loadData();
      },
    });
  },
  /* =====================================
       GENERATE ID
    ===================================== */

  generateId() {
    return "HM" + Date.now();
  },
};
