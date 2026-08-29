/* =========================================
   PAYMENT SERVICE
========================================= */

const PaymentService = (() => {
  /* =====================================
     GET BY RESERVATION
  ===================================== */

  async function getByReservationId(reservationId) {
    if (!reservationId) {
      return {
        success: false,
        message: "Reservation ID wajib diisi.",
        data: [],
        meta: {},
      };
    }

    return API.post("payment.list", {
      reservationId,
    });
  }

  /* =====================================
     GET BY ID
  ===================================== */

  async function getById(id) {
    if (!id) {
      return {
        success: false,
        message: "Payment ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("payment.detail", {
      id,
    });
  }

  /* =====================================
     SAVE
  ===================================== */

  async function save(data = {}, proof = null) {
    const payload = {
      ...data,

      /*
       * Proof dikirim ke backend
       * sebagai bagian dari payload.
       */

      proof: proof || data.proof || "",
    };

    return API.post("payment.store", payload);
  }

  /* =====================================
     VERIFY
  ===================================== */

  async function verify(id, verifiedBy = "") {
    if (!id) {
      return {
        success: false,
        message: "Payment ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("payment.verify", {
      id,

      verifiedBy,
    });
  }

  /* =====================================
     REJECT
  ===================================== */

  async function reject(id) {
    if (!id) {
      return {
        success: false,
        message: "Payment ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("payment.reject", {
      id,
    });
  }

  /* =====================================
     REMOVE
  ===================================== */

  async function remove() {
    throw new Error("Payment tidak mendukung hard delete.");
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getByReservationId,

    getById,

    save,

    verify,

    reject,

    remove,
  };
})();
