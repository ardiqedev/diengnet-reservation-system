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
        console.warn("Unknown action :", action);
    }
  }

  /* =====================================
       PAYMENT
    ===================================== */

  function payment(booking) {
    console.log("Payment", booking);

    // TODO
    // Pembayaran.open(booking);
  }

  /* =====================================
       CHECK IN
    ===================================== */

  function checkIn(booking) {
    console.log("Check In", booking);

    // TODO
  }

  /* =====================================
       CHECK OUT
    ===================================== */

  function checkOut(booking) {
    console.log("Check Out", booking);

    // TODO
  }

  /* =====================================
       CANCEL
    ===================================== */

  function cancel(booking) {
    console.log("Cancel", booking);

    // TODO
  }

  /* =====================================
       RESTORE
    ===================================== */

  function restore(booking) {
    console.log("Restore", booking);

    // TODO
  }

  /* =====================================
       PRINT INVOICE
    ===================================== */

  function printInvoice(booking) {
    console.log("Print Invoice", booking);

    // TODO
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
