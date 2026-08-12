/* =========================================
   RESERVASI HELPER
========================================= */

const ReservasiHelper = {
  /* =====================================
     FORMAT CURRENCY
  ===================================== */

  formatCurrency(value = 0) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  },

  /* =====================================
     FORMAT DATE
  ===================================== */

  formatDate(date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  },

  /* =====================================
     COUNT NIGHT
  ===================================== */

  countNight(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);

    const end = new Date(checkOut);

    const diff = end - start;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  /* =====================================
     GENERATE BOOKING CODE
  ===================================== */

  generateBookingCode() {
    const now = new Date();

    const y = now.getFullYear().toString().slice(-2);

    const m = String(now.getMonth() + 1).padStart(2, "0");

    const d = String(now.getDate()).padStart(2, "0");

    const random = Math.floor(Math.random() * 9000 + 1000);

    return `RSV-${y}${m}${d}-${random}`;
  },

  /* =====================================
     GET TODAY
  ===================================== */

  today() {
    return new Date().toISOString().split("T")[0];
  },

  /* =====================================
     IS SAME DATE
  ===================================== */

  isSameDate(date1, date2) {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
  },

  /* =====================================
   GET BADGE CLASS
===================================== */

  getBadgeClass(status = "") {
    switch (status) {
      case "TERSEDIA":
        return "badge-success";

      case "PROMO":
        return "badge-warning";

      case "SISA 1":
        return "badge-danger";

      case "FULL":
        return "badge-secondary";

      default:
        return "badge-primary";
    }
  },
};
