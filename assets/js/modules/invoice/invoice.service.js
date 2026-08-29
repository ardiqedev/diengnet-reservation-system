/* =========================================
   INVOICE SERVICE
========================================= */

const InvoiceService = (() => {
  /* =====================================
     GET BY RESERVATION
  ===================================== */

  async function getByReservation(reservationId) {
    /* =================================
       VALIDATE ID
    ================================= */

    const id = String(reservationId || "").trim();

    if (!id) {
      throw new Error("ID reservasi wajib diisi.");
    }

    /* =================================
       REQUEST BACKEND
    ================================= */

    const response = await API.post("invoice.detail", {
      reservationId: id,
    });

    /* =================================
       VALIDATE RESPONSE
    ================================= */

    if (!response) {
      throw new Error("Response invoice tidak tersedia.");
    }

    /* =================================
       HANDLE API ERROR
    ================================= */

    if (response.success === false) {
      throw new Error(response.message || "Gagal mengambil data invoice.");
    }

    /* =================================
       GET DATA
       
       API biasanya mengembalikan:
       
       {
         success: true,
         message: "...",
         data: {...}
       }
    ================================= */

    const data = response.data || response;

    if (!data || typeof data !== "object") {
      throw new Error("Data invoice tidak valid.");
    }

    /* =================================
       RETURN
    ================================= */

    return data;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getByReservation,
  };
})();
