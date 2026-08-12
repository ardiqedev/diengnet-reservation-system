/* =========================================
   RESERVASI MODULE
========================================= */

const Reservasi = {
  currentView: "list",

  currentPage: 1,

  editingId: null,

  booking: {},

  /* =====================================
     INIT
  ===================================== */

  init() {
    this.bindEvents();

    this.loadData();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    /* ===============================
       SEARCH
    ============================== */

    document
      .getElementById("searchReservasi")
      ?.addEventListener("input", () => {
        this.loadData();
      });

    /* ===============================
       FILTER STATUS
    ============================== */

    document.getElementById("status")?.addEventListener("change", () => {
      this.loadData();
    });

    /* ===============================
       FILTER CHANNEL
    ============================== */

    document.getElementById("channel")?.addEventListener("change", () => {
      this.loadData();
    });
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData(page = 1) {
    Loading.show();

    try {
      const result = await ReservasiService.getAll(page);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const rows = result.data.rows;

      this.render({
        rows,
      });

      Pagination.render({
        target: "#paginationReservasi",

        page: result.data.page,

        totalPages: result.data.totalPages,

        onChange: (page) => {
          this.loadData(page);
        },
      });

      /* ===============================
         SUMMARY
      ============================== */

      document.getElementById("totalReservasi").textContent = result.data.total;

      document.getElementById("checkinHariIni").textContent = rows.filter(
        (x) => x.status === "CHECK IN",
      ).length;

      document.getElementById("checkoutHariIni").textContent = rows.filter(
        (x) => x.status === "CHECK OUT",
      ).length;

      document.getElementById("tamuMenginap").textContent = rows.filter(
        (x) => x.status === "CHECK IN",
      ).length;
    } catch (err) {
      console.error(err);

      Toast.error("Gagal memuat data.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     RENDER
  ===================================== */

  render(data = {}) {
    switch (this.currentView) {
      case "wizard":
        this.renderWizard();
        break;

      case "list":
      default:
        this.renderList(data.rows || []);
        break;
    }
  },

  renderList(rows = []) {
    Table.render({
      target: "#tableReservasi",

      columns: [
        {
          title: "Kode",

          field: "kodeReservasi",
        },

        {
          title: "Tamu",

          formatter: (row) => `

          <div>

            <strong>${row.namaTamu}</strong>

            <div class="text-muted">

              ${row.noHp}

            </div>

          </div>

        `,
        },

        {
          title: "Kamar",

          formatter: (row) => `

          <div>

            <strong>${row.kamar}</strong>

            <div class="text-muted">

              ${row.tipeKamar}

            </div>

          </div>

        `,
        },

        {
          title: "Menginap",

          formatter: (row) => `

          <div>

            <strong>${row.checkIn}</strong>

            <div class="text-muted">

              s/d ${row.checkOut}

            </div>

          </div>

        `,
        },

        {
          title: "Channel",

          className: "text-center",

          formatter: (row) => `

          <span class="badge badge-primary">

            ${row.channel}

          </span>

        `,
        },

        {
          title: "Total",

          className: "text-end",

          formatter: (row) =>
            "Rp " + Number(row.grandTotal || 0).toLocaleString("id-ID"),
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
              onclick="Reservasi.detail('${row.id}')">

              Detail

          </button>

          <button
              class="btn btn-primary btn-sm"
              onclick="Reservasi.edit('${row.id}')">

              Edit

          </button>

          <button
              class="btn btn-danger btn-sm"
              onclick="Reservasi.delete('${row.id}')">

              Hapus

          </button>

        `,
        },
      ],

      data: rows,
    });
  },

  /* =====================================
   RENDER WIZARD
===================================== */

  renderWizard() {
    const content = document.getElementById("content");

    content.innerHTML = `

    <div class="page">

        ${this.renderHeader()}

        ${this.renderStepper()}

        ${this.renderBody()}

        ${this.renderFooter()}

    </div>

  `;

    lucide.createIcons();
  },

  /* =====================================
   STEPPER
===================================== */

  renderStepper() {
    return `

    <div class="card">

        <div class="wizard-stepper">

            <div class="step active">

                1

                <span>

                    Cari Kamar

                </span>

            </div>

            <div class="step">

                2

                <span>

                    Pilih Kamar

                </span>

            </div>

            <div class="step">

                3

                <span>

                    Data Tamu

                </span>

            </div>

            <div class="step">

                4

                <span>

                    Konfirmasi

                </span>

            </div>

        </div>

    </div>

  `;
  },

  /* =====================================
   BODY
===================================== */

  renderBody() {
    switch (this.currentStep) {
      case 1:
        return this.renderStep1();

      case 2:
        return this.renderStep2();

      case 3:
        return this.renderStep3();

      case 4:
        return this.renderStep4();

      default:
        return this.renderStep1();
    }
  },

  /* =====================================
   FOOTER
===================================== */

  renderFooter() {
    return `

    <div class="wizard-footer">

        <button
            class="btn btn-outline"
            onclick="Reservasi.previousStep()">

            Sebelumnya

        </button>

        <button
            class="btn btn-primary"
            onclick="Reservasi.nextStep()">

            Selanjutnya

        </button>

    </div>

  `;
  },

  /* =====================================
     RESERVATION WIZARD
  ===================================== */

  openWizard() {
    this.currentView = "wizard";

    this.resetBooking();

    this.render();
  },

  closeWizard() {
    this.currentView = "list";

    this.loadData();
  },

  /* =====================================
   RESET BOOKING
===================================== */

  resetBooking() {
    this.booking = {};

    this.editingId = null;
  },

  /* =====================================
     DETAIL
  ===================================== */

  /* =====================================
   DETAIL
===================================== */

  async detail(id) {
    Loading.show();

    try {
      const result = await ReservasiService.getById(id);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Reservasi",

        sections: [
          {
            title: "Informasi Reservasi",

            fields: [
              {
                label: "Kode Reservasi",

                value: d.kodeReservasi,
              },

              {
                label: "Status",

                value: Badge.status(d.status),
              },

              {
                label: "Channel",

                value: d.channel,
              },
            ],
          },

          {
            title: "Tamu",

            fields: [
              {
                label: "Nama",

                value: d.namaTamu,
              },

              {
                label: "No HP",

                value: d.noHp,
              },

              {
                label: "Email",

                value: d.email || "-",
              },
            ],
          },

          {
            title: "Penginapan",

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
                label: "Kamar",

                value: d.kamar,
              },
            ],
          },

          {
            title: "Menginap",

            fields: [
              {
                label: "Check In",

                value: d.checkIn,
              },

              {
                label: "Check Out",

                value: d.checkOut,
              },

              {
                label: "Jumlah Malam",

                value: d.jumlahMalam + " Malam",
              },
            ],
          },

          {
            title: "Pembayaran",

            fields: [
              {
                label: "Subtotal",

                value: "Rp " + Number(d.subtotal).toLocaleString("id-ID"),
              },

              {
                label: "Diskon",

                value: "Rp " + Number(d.diskon).toLocaleString("id-ID"),
              },

              {
                label: "Grand Total",

                value: "Rp " + Number(d.grandTotal).toLocaleString("id-ID"),
              },
            ],
          },

          {
            title: "Catatan",

            fields: [
              {
                label: "Catatan",

                value: d.catatan || "-",

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

  /* =====================================
   EDIT
===================================== */

  async edit(id) {
    Loading.show();

    try {
      const result = await ReservasiService.getById(id);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      this.editingId = id;

      this.booking = {
        ...result.data,
      };

      this.currentView = "wizard";

      this.render();
    } catch (err) {
      console.error(err);

      Toast.error("Gagal memuat reservasi.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
   DELETE
===================================== */

  async delete(id) {
    const ok = await Confirm.show({
      title: "Hapus Reservasi",

      message: "Yakin ingin menghapus reservasi ini?",

      confirmText: "Hapus",

      cancelText: "Batal",

      type: "danger",
    });

    if (!ok) return;

    Loading.show();

    try {
      const result = await ReservasiService.delete(id);

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
};
