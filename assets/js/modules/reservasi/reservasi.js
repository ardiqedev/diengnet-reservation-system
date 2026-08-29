/* =========================================
   RESERVASI MODULE
========================================= */

const Reservasi = {
  currentView: "list",

  currentStep: 1,

  currentPage: 1,

  booking: {},

  searchTimer: null,

  /* =====================================
     LIST FILTER STATE
  ===================================== */

  filters: {
    search: "",
    status: "",
    channel: "",
    penginapanId: "",
    unitId: "",
    tanggal: "",
  },

  /* =====================================
     INIT
  ===================================== */

  init() {
    this.bindEvents();

    this.loadData(1);
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    // Event Global
  },

  /* =====================================
     BIND WIZARD EVENTS
  ===================================== */

  bindWizardEvents() {
    /* ===============================
       CANCEL
    ============================== */

    document
      .getElementById("btnCancelWizard")
      ?.addEventListener("click", () => {
        this.closeWizard();
      });

    /* ===============================
       PREVIOUS STEP
    ============================== */

    document
      .getElementById("btnPreviousStep")
      ?.addEventListener("click", () => {
        this.previousStep();
      });

    /* ===============================
       NEXT STEP
    ============================== */

    document.getElementById("btnNextStep")?.addEventListener("click", () => {
      this.nextStep();
    });
  },

  /* =====================================
   LOAD DATA
===================================== */

  async loadData(page = 1, options = {}) {
    const { loading = true } = options;

    if (loading) {
      Loading.show();
    }

    try {
      /* ===============================
       CURRENT PAGE
    =============================== */

      this.currentPage = page;

      /* ===============================
       BUILD FILTER
    =============================== */

      const filters = {
        search: this.filters.search || "",
        status: this.filters.status || "",
        channel: this.filters.channel || "",
        penginapanId: this.filters.penginapanId || "",
        unitId: this.filters.unitId || "",
        tanggal: this.filters.tanggal || "",
        limit: ReservasiDefault.LIMIT,
      };

      console.log("RESERVATION LIST FILTER:", filters);

      /* ===============================
       API
    =============================== */

      const result = await ReservasiService.getAll(filters);

      /* ===============================
       RESPONSE VALIDATION
    =============================== */

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal mengambil data reservasi.");

        return;
      }

      /* ===============================
       NORMALIZE RESPONSE
    =============================== */

      let rows = [];

      let total = 0;

      let totalPages = 1;

      let limit = ReservasiDefault.LIMIT;

      /*
       * Backend sekarang:
       *
       * data: [...]
       *
       * Tetapi kita tetap support
       * response pagination object.
       */

      if (Array.isArray(result.data)) {
        rows = result.data;

        total = rows.length;

        totalPages = 1;
      } else if (result.data && typeof result.data === "object") {
        rows = Array.isArray(result.data.rows) ? result.data.rows : [];

        total = Number(result.data.total ?? rows.length);

        totalPages = Number(result.data.totalPages ?? 1);

        limit = Number(result.data.limit ?? ReservasiDefault.LIMIT);
      }

      /* ===============================
       TODAY
    =============================== */

      const today = new Date().toISOString().slice(0, 10);

      /* ===============================
       BUILD SUMMARY
    =============================== */

      const summary = {
        totalReservasi: total,

        checkInHariIni: rows.filter(
          (row) =>
            row.checkIn === today && row.status === ReservasiStatus.BOOKED,
        ).length,

        checkOutHariIni: rows.filter(
          (row) =>
            row.checkOut === today && row.status === ReservasiStatus.CHECK_IN,
        ).length,

        totalPendapatan: rows.reduce(
          (totalValue, row) => totalValue + Number(row.grandTotal || 0),
          0,
        ),
      };

      /* ===============================
       RENDER
    =============================== */

      const content = document.getElementById("content");

      if (!content) {
        console.error("Element #content tidak ditemukan.");

        return;
      }

      content.innerHTML = ReservasiList.render(rows, summary);

      /* ===============================
       BIND LIST EVENTS
    =============================== */

      this.bindListEvents();

      /* ===============================
       LUCIDE
    =============================== */

      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }

      /* ===============================
       PAGINATION
    =============================== */

      const pagination = document.getElementById("paginationReservasi");

      if (pagination) {
        pagination.innerHTML = "";
      }

      if (pagination && totalPages > 1) {
        Pagination.render({
          target: "#paginationReservasi",

          page: this.currentPage,

          totalPages,

          onChange: (nextPage) => {
            this.loadData(nextPage, {
              loading: false,
            });
          },
        });
      }

      /* ===============================
       PAGINATION INFO
    =============================== */

      const info = document.getElementById("reservasiPaginationInfo");

      if (info) {
        if (total === 0) {
          info.textContent = "Tidak ada data reservasi";
        } else {
          const start = (this.currentPage - 1) * limit + 1;

          const end = Math.min(start + rows.length - 1, total);

          info.textContent = `Menampilkan ${start}–${end} dari ${total} reservasi`;
        }
      }
    } catch (err) {
      console.error("RESERVATION LOAD ERROR:", err);

      Toast.error("Gagal memuat data reservasi.");
    } finally {
      if (loading) {
        Loading.hide();
      }
    }
  },

  /* =====================================
     REFRESH
  ===================================== */

  async refresh() {
    await this.loadData(this.currentPage || 1, {
      loading: false,
    });
  },

  /* =====================================
   BIND LIST EVENTS
===================================== */

  bindListEvents() {
    /* ===============================
     TAMBAH RESERVASI
  ============================== */

    document
      .getElementById("btnTambahReservasi")
      ?.addEventListener("click", () => {
        this.openWizard();
      });

    document.getElementById("btnEmptyAdd")?.addEventListener("click", () => {
      this.openWizard();
    });

    document
      .getElementById("btnEmptyCreateReservasi")
      ?.addEventListener("click", () => {
        this.openWizard();
      });

    /* ===============================
     SEARCH
  ============================== */

    document
      .getElementById("searchReservasi")
      ?.addEventListener("input", (e) => {
        /*
         * Simpan nilai apa adanya.
         * Jangan trim di setiap keystroke.
         */

        this.filters.search = e.target.value;

        /*
         * Batalkan timer sebelumnya.
         */

        clearTimeout(this.searchTimer);

        /*
         * Debounce 400ms.
         */

        this.searchTimer = setTimeout(() => {
          this.filters.search = this.filters.search.trim();

          this.loadData(1, {
            loading: false,
          });
        }, 400);
      });

    /* ===============================
     FILTER STATUS
  ============================== */

    document.getElementById("filterStatus")?.addEventListener("change", (e) => {
      this.filters.status = e.target.value;

      this.loadData(1, {
        loading: false,
      });
    });

    /* ===============================
     FILTER CHANNEL
  ============================== */

    document
      .getElementById("filterChannel")
      ?.addEventListener("change", (e) => {
        this.filters.channel = e.target.value;

        this.loadData(1, {
          loading: false,
        });
      });

    /* ===============================
     FILTER PENGINAPAN
  ============================== */

    document
      .getElementById("filterPenginapan")
      ?.addEventListener("change", (e) => {
        this.filters.penginapanId = e.target.value;

        this.loadData(1, {
          loading: false,
        });
      });

    /* ===============================
     FILTER UNIT
  ============================== */

    document.getElementById("filterUnit")?.addEventListener("change", (e) => {
      this.filters.unitId = e.target.value;

      this.loadData(1, {
        loading: false,
      });
    });

    /* ===============================
     FILTER TANGGAL
  ============================== */

    document
      .getElementById("filterTanggal")
      ?.addEventListener("change", (e) => {
        this.filters.tanggal = e.target.value;

        this.loadData(1, {
          loading: false,
        });
      });

    /* ===============================
     REFRESH
  ============================== */

    document
      .getElementById("btnRefreshReservasi")
      ?.addEventListener("click", () => {
        this.loadData(this.currentPage || 1, {
          loading: true,
        });
      });

    /* ===============================
     TABLE ACTION
  ============================== */

    document
      .querySelector(".reservasi-table")
      ?.addEventListener("click", (e) => {
        const button = e.target.closest("[data-action]");

        if (!button) return;

        const { action, id } = button.dataset;

        switch (action) {
          case "detail":
            this.detail(id);

            break;

          case "status":
            this.changeStatus(id);

            break;
        }
      });
  },

  /* =====================================
     RENDER
  ===================================== */

  render() {
    switch (this.currentView) {
      case "wizard":
        this.renderWizard();

        break;
    }
  },

  /* =====================================
     RENDER WIZARD
  ===================================== */

  renderWizard() {
    document.getElementById("content").innerHTML = ReservasiView.render(
      this.currentStep,
    );

    this.bindWizardEvents();

    const stepComponent = {
      1: ReservasiStep1,
      2: ReservasiStep2,
      3: ReservasiStep3,
      4: ReservasiStep4,
    };

    stepComponent[this.currentStep]?.init?.();

    lucide.createIcons();
  },

  /* =====================================
     RESERVATION WIZARD
  ===================================== */

  openWizard() {
    this.currentView = "wizard";

    this.currentStep = 1;

    this.resetBooking();

    this.renderWizard();
  },

  closeWizard() {
    this.currentView = "list";

    this.currentStep = 1;

    this.booking = {};

    /*
     * Filter TIDAK di-reset.
     *
     * Ketika kembali dari wizard,
     * user tetap mendapatkan filter
     * terakhir yang dipakai.
     */

    this.loadData(this.currentPage || 1);
  },

  /* =====================================
     NEXT STEP
  ===================================== */

  nextStep() {
    switch (this.currentStep) {
      case 1:
        ReservasiStep1.next();
        break;

      case 2:
        ReservasiStep2.next();
        break;

      case 3:
        ReservasiStep3.next();
        break;

      case 4:
        ReservasiStep4.save();
        break;
    }
  },

  /* =====================================
     PREVIOUS STEP
  ===================================== */

  previousStep() {
    this.goToStep(this.currentStep - 1);
  },

  /* =====================================
     GO TO STEP
  ===================================== */

  goToStep(step) {
    if (step < 1 || step > 4) {
      return;
    }

    this.currentStep = step;

    this.renderWizard();
  },

  /* =====================================
     RESET BOOKING
  ===================================== */

  resetBooking() {
    this.booking = {};

    this.currentStep = 1;

    this.pricing = null;
  },

  /* ===============================
     DETAIL
  =============================== */

  async detail(id) {
    Loading.show();

    try {
      const result = await ReservasiService.getById(id);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const booking = result.data;

      this.selectedId = id;

      this.selectedBooking = booking;

      Modal.open({
        title: "Detail Reservasi",
        size: "lg",
        body: ReservasiDetail.render(booking),
      });

      this.bindDetailEvents();

      lucide.createIcons();
    } catch (err) {
      console.error(err);

      Toast.error("Gagal mengambil data.");
    } finally {
      Loading.hide();
    }
  },

  /* ===============================
     DETAIL EVENTS
  =============================== */

  bindDetailEvents() {
    document.querySelectorAll("[data-reservasi-action]").forEach((button) => {
      button.addEventListener("click", () => {
        ReservasiAction.handle(
          button.dataset.reservasiAction,
          this.selectedBooking,
        );
      });
    });

    document.getElementById("btnPayment")?.addEventListener("click", () => {
      Payment.open(this.selectedBooking);
    });

    document.getElementById("btnInvoice")?.addEventListener("click", () => {
      Invoice.open(this.selectedBooking.id);
    });

    document.getElementById("btnClose")?.addEventListener("click", () => {
      Modal.close();
    });
  },

  /* =====================================
     CHANGE STATUS
  ===================================== */

  async changeStatus(id) {
    const result = await ReservasiService.getById(id);

    if (!result.success) {
      Toast.error(result.message);

      return;
    }

    this.selectedId = id;

    this.selectedBooking = result.data;

    // Akan kita buka Status Modal
    console.log("Status Reservasi :", result.data.status);
  },
};
