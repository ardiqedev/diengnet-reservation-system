/* =========================================
   PAYMENT VALIDATOR
========================================= */

const PaymentValidator = (() => {
  /* =====================================
     BASIC VALIDATION
  ===================================== */

  function validate(data = {}, proof = null, booking = {}, payments = []) {
    /* =================================
       RESERVATION
    ================================= */

    if (!data.reservationId) {
      Toast.warning("Reservasi tidak ditemukan.");

      return false;
    }

    /* =================================
       BOOKING TOTAL
    ================================= */

    const grandTotal = Number(booking.grandTotal || 0);

    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      Toast.warning("Total reservasi tidak valid.");

      return false;
    }

    /* =================================
       PAYMENT DATE
    ================================= */

    if (!data.paymentDate) {
      Toast.warning("Tanggal pembayaran wajib diisi.");

      return false;
    }

    /* =================================
       PAYMENT METHOD
    ================================= */

    if (!data.paymentMethod) {
      Toast.warning("Metode pembayaran wajib dipilih.");

      return false;
    }

    /* =================================
       PAYMENT AMOUNT
    ================================= */

    const amount = Number(data.paymentAmount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      Toast.warning("Nominal pembayaran harus lebih dari 0.");

      return false;
    }

    /* =================================
       FULL PAYMENT ONLY
    ================================= */

    if (amount !== grandTotal) {
      Toast.warning("Pembayaran harus sesuai total reservasi.");

      return false;
    }

    /* =================================
       TOTAL VERIFIED
    ================================= */

    const totalPaid = PaymentHelper.getTotalPaid(payments);

    /* =================================
       ALREADY PAID
    ================================= */

    if (totalPaid >= grandTotal) {
      Toast.warning("Reservasi ini sudah lunas.");

      return false;
    }

    /* =================================
       PENDING TRANSACTION
    ================================= */

    const hasPending = payments.some(
      (payment) => payment.status === PaymentTransactionStatus.PENDING,
    );

    if (hasPending) {
      Toast.warning("Masih ada pembayaran yang menunggu verifikasi.");

      return false;
    }

    /* =================================
       PAYMENT METHOD
    ================================= */

    const needReference = [
      PaymentMethod.TRANSFER,

      PaymentMethod.QRIS,

      PaymentMethod.CREDIT_CARD,
    ].includes(data.paymentMethod);

    /* =================================
       REFERENCE
    ================================= */

    if (needReference) {
      if (!data.paymentReference || !data.paymentReference.trim()) {
        Toast.warning("Nomor referensi wajib diisi.");

        return false;
      }
    }

    /* =================================
       PAYMENT PROOF
    ================================= */

    if (needReference) {
      if (!proof) {
        Toast.warning("Bukti pembayaran wajib diupload.");

        return false;
      }
    }

    /* =================================
       CASH
    ================================= */

    if (data.paymentMethod === PaymentMethod.CASH) {
      /*
       * Cash tidak membutuhkan:
       * - reference
       * - proof
       */
    }

    /* =================================
       VALID
    ================================= */

    return true;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    validate,
  };
})();
