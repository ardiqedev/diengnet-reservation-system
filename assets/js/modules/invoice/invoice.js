/* =========================================
   INVOICE
========================================= */

const Invoice = (() => {
  /* =====================================
     OPEN
  ===================================== */

  async function open(reservationId) {
    /* =================================
       VALIDATE ID
    ================================= */

    const id = String(reservationId || "").trim();

    if (!id) {
      Toast.error("ID reservasi tidak valid.");

      return;
    }

    /* =================================
       LOADING
    ================================= */

    Loading.show();

    try {
      /* =================================
         GET INVOICE

         Service bertanggung jawab
         mengambil data invoice dari
         backend.
      ================================= */

      const response = await InvoiceService.getByReservation(id);

      /* =================================
         NORMALIZE RESPONSE

         API dapat mengembalikan:
         1. data invoice langsung
         2. response wrapper { success, data }

         Kita support keduanya.
      ================================= */

      const data =
        response?.data && typeof response.data === "object"
          ? response.data
          : response;

      /* =================================
         VALIDATE RESPONSE
      ================================= */

      if (!data || typeof data !== "object") {
        throw new Error("Data invoice tidak valid.");
      }

      /* =================================
         VALIDATE INVOICE
      ================================= */

      if (!data.invoice || typeof data.invoice !== "object") {
        throw new Error("Informasi invoice tidak ditemukan.");
      }

      /* =================================
         VALIDATE RESERVATION

         Backend invoice sekarang
         menggunakan struktur:

         invoice
         guest
         property
         stay
         pricing
         payment
         timestamps
      ================================= */

      if (
        !data.guest ||
        !data.property ||
        !data.stay ||
        !data.pricing ||
        !data.payment
      ) {
        throw new Error("Struktur data invoice tidak lengkap.");
      }

      /* =================================
         LOG DEBUG

         Bisa dihapus setelah invoice
         frontend selesai.
      ================================= */

      console.log("[INVOICE] DATA:", data);

      /* =================================
         RENDER

         InvoiceView menerima satu
         object invoice lengkap.

         Tidak lagi menggunakan:
         data.booking
         data.payments
      ================================= */

      const html = InvoiceView.render(data);

      if (!html) {
        throw new Error("Invoice gagal dirender.");
      }

      /* =================================
         OPEN MODAL
      ================================= */

      Modal.open({
        title: "Invoice",

        size: "lg",

        body: html,
      });

      /* =================================
         BIND EVENTS
      ================================= */

      bindEvents();
    } catch (error) {
      console.error("[INVOICE] Open error:", error);

      Toast.error(error?.message || "Gagal memuat invoice.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     EVENTS
  ===================================== */

  function bindEvents() {
    const btnPrint = document.getElementById("btnPrintInvoice");

    if (!btnPrint) {
      return;
    }

    /* =================================
       PREVENT DUPLICATE LISTENER
    ================================= */

    btnPrint.onclick = print;
  }

  /* =====================================
     PRINT
  ===================================== */

  function print() {
    window.print();
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    open,
  };
})();
