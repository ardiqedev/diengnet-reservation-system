/* =========================================
   PAYMENT VALIDATOR
========================================= */

const PaymentValidator = (() => {
  /* =====================================
       VALIDATE
    ===================================== */

  function validate(data, proof = null) {
    if (!data.paymentDate) {
      Toast.warning("Tanggal pembayaran wajib diisi.");

      return false;
    }

    if (!data.paymentMethod) {
      Toast.warning("Metode pembayaran wajib dipilih.");

      return false;
    }

    if (!data.paymentAmount || Number(data.paymentAmount) <= 0) {
      Toast.warning("Nominal pembayaran harus lebih dari 0.");

      return false;
    }

    const needReference = [
      PaymentMethod.TRANSFER,

      PaymentMethod.QRIS,

      PaymentMethod.CREDIT_CARD,
    ].includes(data.paymentMethod);

    if (needReference) {
      if (!data.paymentReference?.trim()) {
        Toast.warning("Nomor referensi wajib diisi.");

        return false;
      }

      if (!proof) {
        Toast.warning("Bukti pembayaran wajib diupload.");

        return false;
      }
    }

    return true;
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    validate,
  };
})();
