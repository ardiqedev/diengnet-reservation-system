/* =========================================
   PAYMENT CONSTANT
========================================= */

/* =========================================
   PAYMENT SUMMARY STATUS
========================================= */

const PaymentStatus = Object.freeze({
  UNPAID: "UNPAID",

  PAID: "PAID",
});

/* =========================================
   PAYMENT TRANSACTION STATUS
========================================= */

const PaymentTransactionStatus = Object.freeze({
  PENDING: "PENDING",

  VERIFIED: "VERIFIED",

  REJECTED: "REJECTED",
});

/* =========================================
   PAYMENT METHOD
========================================= */

const PaymentMethod = Object.freeze({
  CASH: "CASH",

  TRANSFER: "TRANSFER",

  QRIS: "QRIS",

  CREDIT_CARD: "CREDIT_CARD",
});
