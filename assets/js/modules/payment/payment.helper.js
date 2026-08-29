/* =========================================
   PAYMENT HELPER
========================================= */

const PaymentHelper = (() => {
  /* =====================================
     VERIFIED PAYMENTS
  ===================================== */

  function getVerifiedPayments(payments = []) {
    return payments.filter(
      (payment) => payment.status === PaymentTransactionStatus.VERIFIED,
    );
  }

  /* =====================================
     TOTAL PAID
  ===================================== */

  function getTotalPaid(payments = []) {
    return getVerifiedPayments(payments).reduce(
      (total, payment) => total + Number(payment.paymentAmount || 0),
      0,
    );
  }

  /* =====================================
     REMAINING
  ===================================== */

  function getRemaining(grandTotal = 0, payments = []) {
    const total = Number(grandTotal || 0);

    const totalPaid = getTotalPaid(payments);

    return Math.max(0, total - totalPaid);
  }

  /* =====================================
     PAYMENT STATUS
  ===================================== */

  function getStatus(grandTotal = 0, payments = []) {
    const total = Number(grandTotal || 0);

    const totalPaid = getTotalPaid(payments);

    const remaining = getRemaining(total, payments);

    /*
     * Belum ada pembayaran VERIFIED.
     */

    if (totalPaid <= 0) {
      return {
        code: PaymentStatus.UNPAID,

        label: "Belum Bayar",

        color: "danger",
      };
    }

    /*
     * Sudah ada pembayaran VERIFIED,
     * tetapi belum memenuhi grand total.
     *
     * Kondisi ini tidak digunakan sebagai
     * flow normal karena sistem menggunakan
     * FULL PAYMENT.
     *
     * Tetap dikembalikan sebagai UNPAID agar
     * tidak dianggap PAID.
     */

    if (remaining > 0) {
      return {
        code: PaymentStatus.UNPAID,

        label: "Belum Lunas",

        color: "warning",
      };
    }

    /*
     * Total pembayaran VERIFIED sudah
     * memenuhi grand total.
     */

    return {
      code: PaymentStatus.PAID,

      label: "Lunas",

      color: "success",
    };
  }

  /* =====================================
     FULL PAYMENT CHECK
  ===================================== */

  function isFullyPaid(grandTotal = 0, payments = []) {
    const total = Number(grandTotal || 0);

    if (total <= 0) {
      return false;
    }

    return getRemaining(total, payments) === 0;
  }

  /* =====================================
     CAN MAKE PAYMENT
  ===================================== */

  function canMakePayment(grandTotal = 0, payments = []) {
    return !isFullyPaid(grandTotal, payments);
  }

  /* =====================================
     TRANSACTION STATUS
  ===================================== */

  function getTransactionStatus(payment = {}) {
    switch (payment.status) {
      case PaymentTransactionStatus.VERIFIED:
        return {
          label: "Verified",
          color: "success",
        };

      case PaymentTransactionStatus.REJECTED:
        return {
          label: "Rejected",
          color: "danger",
        };

      case PaymentTransactionStatus.PENDING:

      default:
        return {
          label: "Pending",
          color: "warning",
        };
    }
  }

  return {
    getVerifiedPayments,

    getTotalPaid,

    getRemaining,

    getStatus,

    isFullyPaid,

    canMakePayment,

    getTransactionStatus,
  };
})();
