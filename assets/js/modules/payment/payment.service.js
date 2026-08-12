/* =========================================
   PAYMENT SERVICE
========================================= */

const PaymentService = (() => {
  /* =====================================
     GET BY BOOKING ID
  ===================================== */

  async function getByBookingId(bookingId) {
    return API.post("payment.list", {
      bookingId,
    });
  }

  /* =====================================
     SAVE
  ===================================== */

  async function save(data, proof = null) {
    const payload = {
      ...data,
      proof,
    };

    if (data.id) {
      return API.post("payment.update", payload);
    }

    return API.post("payment.store", payload);
  }

  /* =====================================
     REMOVE
  ===================================== */

  async function remove(id) {
    return API.post("payment.delete", {
      id,
    });
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getByBookingId,

    save,

    remove,
  };
})();
