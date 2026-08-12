/* =========================================
   RESERVASI STATUS ENGINE
========================================= */

const ReservasiStatusEngine = (() => {
  /* =====================================
       CHANGE STATUS
    ===================================== */

  async function changeStatus(id, status) {}

  /* =====================================
       BOOKED
    ===================================== */

  async function booked(id) {}

  /* =====================================
       CHECK IN
    ===================================== */

  async function checkIn(id) {}

  /* =====================================
       CHECK OUT
    ===================================== */

  async function checkOut(id) {}

  /* =====================================
       CANCEL
    ===================================== */

  async function cancel(id) {}

  /* =====================================
       RESTORE
    ===================================== */

  async function restore(id) {}

  return {
    changeStatus,

    booked,

    checkIn,

    checkOut,

    cancel,

    restore,
  };
})();
