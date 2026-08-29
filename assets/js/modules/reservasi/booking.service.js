/* =========================================
   QEDEV BOOKING SERVICE
   FRONTEND
========================================= */

const BookingService = {
  /* =====================================
     CALCULATE PRICE
  ===================================== */

  async calculatePrice(booking = {}) {
    if (!booking || typeof booking !== "object") {
      throw new Error("Data booking tidak valid.");
    }

    /* ===============================
       REQUEST BACKEND
    =============================== */

    const result = await API.post("booking.price", booking);

    /* ===============================
       VALIDATE RESPONSE
    =============================== */

    if (!result?.success) {
      throw new Error(result?.message || "Gagal menghitung harga reservasi.");
    }

    return result.data;
  },
};
