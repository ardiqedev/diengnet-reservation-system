/* =========================================
   RESERVASI STATUS
========================================= */

const ReservasiStatus = Object.freeze({
  DRAFT: "DRAFT",

  BOOKED: "BOOKED",

  CHECK_IN: "CHECK IN",

  CHECK_OUT: "CHECK OUT",

  CANCELLED: "CANCELLED",
});

/* =========================================
   ACTION TYPE
========================================= */

const ReservasiActionType = Object.freeze({
  PAYMENT: "payment",

  CHECK_IN: "checkin",

  CHECK_OUT: "checkout",

  CANCEL: "cancel",

  RESTORE: "restore",

  INVOICE: "invoice",
});

/* =========================================
   BOOKING CHANNEL
========================================= */

const BookingChannel = Object.freeze({
  WEBSITE: "WEBSITE",

  OWNER: "OWNER",

  AGEN: "AGEN",

  WALK_IN: "WALK IN",
});
