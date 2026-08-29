/* =========================================
   RESERVASI ACTION
========================================= */

const ReservasiAction = (() => {
  /* =====================================
     GET ACTIONS
  ===================================== */

  function getActions(booking = {}) {
    const { status = "" } = booking;

    switch (status) {
      case ReservasiStatus.DRAFT:
        return getDraftActions();

      case ReservasiStatus.BOOKED:
        return getBookedActions();

      case ReservasiStatus.CHECK_IN:
        return getCheckInActions();

      case ReservasiStatus.CHECK_OUT:
        return getCheckOutActions();

      case ReservasiStatus.CANCELLED:
        return getCancelledActions();

      default:
        return [];
    }
  }

  /* =====================================
     DRAFT ACTIONS
  ===================================== */

  function getDraftActions() {
    return [];
  }

  /* =====================================
     BOOKED ACTIONS
  ===================================== */

  function getBookedActions() {
    return [
      {
        id: ReservasiActionType.CHECK_IN,

        label: "Check In",

        icon: "log-in",

        className: "btn-success",

        visible: true,

        disabled: false,
      },
    ];
  }

  /* =====================================
     CHECK IN ACTIONS
  ===================================== */

  function getCheckInActions() {
    return [
      {
        id: ReservasiActionType.CHECK_OUT,

        label: "Check Out",

        icon: "log-out",

        className: "btn-warning",

        visible: true,

        disabled: false,
      },
    ];
  }

  /* =====================================
     CHECK OUT ACTIONS
  ===================================== */

  function getCheckOutActions() {
    return [
      {
        id: ReservasiActionType.INVOICE,

        label: "Cetak Invoice",

        icon: "printer",

        className: "btn-outline",

        visible: true,

        disabled: false,
      },
    ];
  }

  /* =====================================
     CANCELLED ACTIONS
  ===================================== */

  function getCancelledActions() {
    return [
      {
        id: ReservasiActionType.RESTORE,

        label: "Restore",

        icon: "rotate-ccw",

        className: "btn-secondary",

        visible: true,

        disabled: false,
      },
    ];
  }

  /* =====================================
     RENDER
  ===================================== */

  function render(booking = {}) {
    const actions = getActions(booking);

    if (!actions.length) {
      return "";
    }

    return `
      <div class="reservasi-actions">
        ${actions.map(renderButton).join("")}
      </div>
    `;
  }

  /* =====================================
     RENDER BUTTON
  ===================================== */

  function renderButton(action = {}) {
    if (!action.visible) {
      return "";
    }

    return `
      <button
        type="button"
        class="btn ${action.className}"
        data-reservasi-action="${action.id}"
        ${action.disabled ? "disabled" : ""}>

        <i data-lucide="${action.icon}"></i>

        <span>${action.label}</span>

      </button>
    `;
  }

  /* =====================================
     HANDLE
  ===================================== */

  function handle(action, booking = {}) {
    switch (action) {
      case ReservasiActionType.PAYMENT:
        payment(booking);
        break;

      case ReservasiActionType.CHECK_IN:
        checkIn(booking);
        break;

      case ReservasiActionType.CHECK_OUT:
        checkOut(booking);
        break;

      case ReservasiActionType.CANCEL:
        cancel(booking);
        break;

      case ReservasiActionType.RESTORE:
        restore(booking);
        break;

      case ReservasiActionType.INVOICE:
        printInvoice(booking);
        break;

      default:
        console.warn("[RESERVASI] Unknown action:", action);
    }
  }

  /* =====================================
     PAYMENT
  ===================================== */

  function payment(booking) {
    if (!booking?.id) {
      Toast.error("Data reservasi tidak valid.");

      return;
    }

    if (typeof Payment === "undefined") {
      console.error("[RESERVASI] Payment module tidak tersedia.");

      Toast.error("Modul pembayaran tidak tersedia.");

      return;
    }

    Payment.open(booking);
  }

  /* =====================================
     CHECK IN
  ===================================== */

  /* =====================================
   CHECK IN
===================================== */

  async function checkIn(booking) {
    /* =====================================
     VALIDATE BOOKING
  ===================================== */

    if (!booking?.id) {
      Toast.error("Data reservasi tidak valid.");

      return;
    }

    /* =====================================
     STATUS
     
     Frontend hanya melakukan guard ringan.
     Validasi lifecycle final tetap di backend.
  ===================================== */

    if (booking.status !== ReservasiStatus.BOOKED) {
      Toast.warning("Reservasi belum dapat Check In.");

      return;
    }

    /* =====================================
     CONFIRM
  ===================================== */

    const confirmed = window.confirm(
      `Check In tamu "${booking.namaTamu}" sekarang?`,
    );

    if (!confirmed) {
      return;
    }

    /* =====================================
     LOADING
  ===================================== */

    Loading.show();

    try {
      /* =================================
       BACKEND CHECK IN
       
       Backend yang menentukan:
       - tanggal
       - payment
       - unit
       - collision
       - lifecycle
    ================================= */

      const result = await ReservasiService.checkIn(booking.id);

      /* =================================
       BUSINESS ERROR
    ================================= */

      if (!result?.success) {
        Toast.error(result?.message || "Gagal melakukan Check In.");

        return;
      }

      /* =================================
       SUCCESS
    ================================= */

      Toast.success("Tamu berhasil Check In.");

      /* =================================
       CLOSE DETAIL MODAL
    ================================= */

      Modal.close();

      /* =================================
       REFRESH RESERVATION LIST
    ================================= */

      await Reservasi.loadData();
    } catch (error) {
      console.error("[RESERVASI] Check In error:", error);

      Toast.error(error?.message || "Gagal melakukan Check In.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     CHECK OUT
  ===================================== */

  async function checkOut(booking) {
    if (!booking?.id) {
      Toast.error("Data reservasi tidak valid.");

      return;
    }

    if (booking.status !== ReservasiStatus.CHECK_IN) {
      Toast.warning("Reservasi belum dapat Check Out.");

      return;
    }

    const confirmed = window.confirm(
      `Check Out tamu "${booking.namaTamu}" sekarang?`,
    );

    if (!confirmed) {
      return;
    }

    Loading.show();

    try {
      /*
       * Lifecycle melalui Service.
       */

      const result = await ReservasiService.checkOut(booking.id);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal melakukan Check Out.");

        return;
      }

      Toast.success("Tamu berhasil Check Out.");

      Modal.close();

      await Reservasi.loadData();
    } catch (error) {
      console.error("[RESERVASI] Check Out error:", error);

      Toast.error(error?.message || "Gagal melakukan Check Out.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     CANCEL
  ===================================== */

  function cancel(booking) {
    console.log("[RESERVASI] Cancel:", booking);

    /*
     * TODO:
     * Implement setelah lifecycle
     * CANCELLED difinalisasi.
     */
  }

  /* =====================================
     RESTORE
  ===================================== */

  function restore(booking) {
    console.log("[RESERVASI] Restore:", booking);

    /*
     * TODO:
     * Implement setelah lifecycle
     * Restore difinalisasi.
     */
  }

  /* =====================================
     PRINT INVOICE
  ===================================== */

  function printInvoice(booking) {
    if (!booking?.id) {
      Toast.error("Data reservasi tidak valid.");

      return;
    }

    if (booking.status !== ReservasiStatus.CHECK_OUT) {
      Toast.warning("Invoice hanya dapat dicetak setelah Check Out.");

      return;
    }

    if (typeof Invoice === "undefined") {
      console.error("[RESERVASI] Invoice module tidak tersedia.");

      Toast.error("Modul invoice tidak tersedia.");

      return;
    }

    Invoice.open(booking.id);
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getActions,

    render,

    handle,
  };
})();
