/* =========================================
   RESERVASI STATUS ENGINE
========================================= */

const ReservasiStatusEngine = (() => {
  /* =====================================
     STATUS LABEL
  ===================================== */

  const LABELS = Object.freeze({
    [ReservasiStatus.DRAFT]: "Draft",

    [ReservasiStatus.BOOKED]: "Booked",

    [ReservasiStatus.CHECK_IN]: "Check In",

    [ReservasiStatus.CHECK_OUT]: "Check Out",

    [ReservasiStatus.CANCELLED]: "Cancelled",

    [ReservasiStatus.EXPIRED]: "Expired",
  });

  /* =====================================
     ALLOWED TRANSITIONS
  ===================================== */

  const TRANSITIONS = Object.freeze({
    [ReservasiStatus.DRAFT]: Object.freeze([
      ReservasiStatus.BOOKED,

      ReservasiStatus.CANCELLED,

      ReservasiStatus.EXPIRED,
    ]),

    [ReservasiStatus.BOOKED]: Object.freeze([
      ReservasiStatus.CHECK_IN,

      ReservasiStatus.CANCELLED,
    ]),

    [ReservasiStatus.CHECK_IN]: Object.freeze([ReservasiStatus.CHECK_OUT]),

    [ReservasiStatus.CHECK_OUT]: Object.freeze([]),

    [ReservasiStatus.CANCELLED]: Object.freeze([]),

    [ReservasiStatus.EXPIRED]: Object.freeze([]),
  });

  /* =====================================
     GET LABEL
  ===================================== */

  function getLabel(status) {
    return LABELS[status] || status || "-";
  }

  /* =====================================
     GET NEXT STATUS
  ===================================== */

  function getNextStatuses(status) {
    return [...(TRANSITIONS[status] || [])];
  }

  /* =====================================
     CAN CHANGE STATUS
  ===================================== */

  function canChange(currentStatus, nextStatus) {
    if (!currentStatus || !nextStatus) {
      return false;
    }

    const allowed = TRANSITIONS[currentStatus] || [];

    return allowed.includes(nextStatus);
  }

  /* =====================================
     IS FINAL STATUS
  ===================================== */

  function isFinal(status) {
    return (
      status === ReservasiStatus.CHECK_OUT ||
      status === ReservasiStatus.CANCELLED ||
      status === ReservasiStatus.EXPIRED
    );
  }

  /* =====================================
     IS ACTIVE STATUS
  ===================================== */

  function isActive(status) {
    return (
      status === ReservasiStatus.DRAFT ||
      status === ReservasiStatus.BOOKED ||
      status === ReservasiStatus.CHECK_IN
    );
  }

  /* =====================================
     IS HOLD STATUS
  ===================================== */

  function isHold(status) {
    return status === ReservasiStatus.DRAFT;
  }

  /* =====================================
     IS BOOKED
  ===================================== */

  function isBooked(status) {
    return (
      status === ReservasiStatus.BOOKED || status === ReservasiStatus.CHECK_IN
    );
  }

  /* =====================================
     IS EXPIRED
  ===================================== */

  function isExpired(status) {
    return status === ReservasiStatus.EXPIRED;
  }

  /* =====================================
     CHANGE STATUS
  ===================================== */

  async function changeStatus(id, status) {
    if (!id) {
      return {
        success: false,
        message: "ID reservasi tidak valid.",
      };
    }

    if (!status) {
      return {
        success: false,
        message: "Status reservasi tidak valid.",
      };
    }

    /*
     * Business execution belum dilakukan di frontend.
     *
     * Backend merupakan source of truth.
     *
     * Nantinya:
     *
     * Frontend
     *    ↓
     * ReservasiService
     *    ↓
     * GAS API
     *    ↓
     * Backend validation
     *    ↓
     * Firestore
     */

    return {
      success: false,
      message: "Perubahan status belum tersedia.",
    };
  }

  /* =====================================
     BOOKED
  ===================================== */

  async function booked(id) {
    return changeStatus(id, ReservasiStatus.BOOKED);
  }

  /* =====================================
     CHECK IN
  ===================================== */

  async function checkIn(id) {
    return changeStatus(id, ReservasiStatus.CHECK_IN);
  }

  /* =====================================
     CHECK OUT
  ===================================== */

  async function checkOut(id) {
    return changeStatus(id, ReservasiStatus.CHECK_OUT);
  }

  /* =====================================
     CANCEL
  ===================================== */

  async function cancel(id) {
    return changeStatus(id, ReservasiStatus.CANCELLED);
  }

  /* =====================================
     RESTORE
  ===================================== */

  async function restore(id) {
    /*
     * RESTORE bukan status.
     *
     * Business rule restore belum ditentukan.
     *
     * Jangan mengubah:
     *
     * CANCELLED → BOOKED
     * EXPIRED   → BOOKED
     *
     * hanya dari frontend.
     */

    return {
      success: false,
      message: "Restore belum memiliki aturan bisnis.",
    };
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getLabel,

    getNextStatuses,

    canChange,

    isFinal,

    isActive,

    isHold,

    isBooked,

    isExpired,

    changeStatus,

    booked,

    checkIn,

    checkOut,

    cancel,

    restore,
  };
})();
