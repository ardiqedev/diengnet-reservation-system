/* =========================================
   RESERVASI CONSTANT
========================================= */

/* =========================================
   RESERVATION STATUS
========================================= */

const ReservasiStatus = Object.freeze({
  DRAFT: "DRAFT",

  BOOKED: "BOOKED",

  CHECK_IN: "CHECK_IN",

  CHECK_OUT: "CHECK_OUT",

  CANCELLED: "CANCELLED",

  EXPIRED: "EXPIRED",
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
});

/* =========================================
   RESERVATION HOLD
========================================= */

const ReservationHold = Object.freeze({
  DURATION_HOURS: 12,
});

/* =========================================
   DEFAULT
========================================= */

const ReservasiDefault = Object.freeze({
  PAGE: 1,

  LIMIT: 10,
});
