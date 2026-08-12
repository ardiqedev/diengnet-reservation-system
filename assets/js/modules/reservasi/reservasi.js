/* =========================================
   RESERVASI MODULE
========================================= */

const Reservasi = {
  currentView: "list",

  currentStep: 1,

  currentPage: 1,

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

  async loadData(page = 1) {
    Loading.show();

    try {
      const result = await ReservasiService.getAll(page);

      if (!result.success) {
        Toast.error(result.message);

        return;
      }

      const rows = result.data.rows;

      /* ===============================
           BUILD SUMMARY
        ============================== */

      const summary = {
        totalReservasi: result.data.total,

        checkInHariIni: rows.filter(
          (row) => row.status === ReservasiStatus.CHECK_IN,
        ).length,

        checkOutHariIni: rows.filter(
          (row) => row.status === ReservasiStatus.CHECK_OUT,
        ).length,

        totalPendapatan: rows.reduce(
          (total, row) => total + Number(row.grandTotal || 0),
          0,
        ),
      };

      /* ===============================
           RENDER VIEW
        ============================== */

      document.getElementById("content").innerHTML = ReservasiList.render(
        rows,
        summary,
      );

      this.bindListEvents();

      /* ===============================
           PAGINATION
        ============================== */

      Pagination.render({
        target: "#paginationReservasi",

        page: result.data.page,

        totalPages: result.data.totalPages,

        onChange: (page) => {
          this.loadData(page);
        },
      });

      const info = document.getElementById("reservasiPaginationInfo");

      if (info) {
        const start = (result.data.page - 1) * result.data.limit + 1;

        const end = Math.min(start + rows.length - 1, result.data.total);

        info.textContent = `Menampilkan ${start}–${end} dari ${result.data.total} reservasi`;
      }

      /* ===============================
           BIND EVENTS
        ============================== */

      // Akan kita buat pada tahap berikutnya
      this.bindListEvents();
    } catch (err) {
      console.error(err);

      Toast.error("Gagal memuat data.");
    } finally {
      Loading.hide();
    }
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
      ?.addEventListener("input", () => {
        this.loadData();
      });

    /* ===============================
     FILTER STATUS
  ============================== */

    document.getElementById("filterStatus")?.addEventListener("change", () => {
      this.loadData();
    });

    /* ===============================
     FILTER CHANNEL
  ============================== */

    document.getElementById("filterChannel")?.addEventListener("change", () => {
      this.loadData();
    });

    /* ===============================
     FILTER TANGGAL
  ============================== */

    document.getElementById("filterTanggal")?.addEventListener("change", () => {
      this.loadData();
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

    this.loadData();
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
    if (step < 1 || step > 4) return;

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
============================== */

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
