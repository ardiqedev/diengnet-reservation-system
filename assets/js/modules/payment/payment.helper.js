/* =========================================
   PAYMENT HELPER
========================================= */

const PaymentHelper = (() => {
  /* =====================================
       TOTAL PAID
    ===================================== */

  function getTotalPaid(payments = []) {
    return payments.reduce(
      (total, payment) => total + Number(payment.paymentAmount || 0),

      0,
    );
  }

  /* =====================================
       REMAINING
    ===================================== */

  function getRemaining(grandTotal = 0, payments = []) {
    return Math.max(
      0,

      Number(grandTotal) - getTotalPaid(payments),
    );
  }

  /* =====================================
       STATUS
    ===================================== */

  function getStatus(grandTotal = 0, payments = []) {
    const totalPaid = getTotalPaid(payments);

    const remaining = getRemaining(grandTotal, payments);

    if (totalPaid <= 0) {
      return {
        code: "UNPAID",

        label: "Belum Bayar",

        color: "danger",
      };
    }

    if (remaining <= 0) {
      return {
        code: "PAID",

        label: "Lunas",

        color: "success",
      };
    }

    return {
      code: "DP",

      label: "DP",

      color: "warning",
    };
  }

  /* =====================================
       VERIFIED
    ===================================== */

  function getVerification(payment = {}) {
    return payment.verified
      ? {
          label: "Verified",

          color: "success",
        }
      : {
          label: "Pending",

          color: "warning",
        };
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    getTotalPaid,

    getRemaining,

    getStatus,

    getVerification,
  };
})();
