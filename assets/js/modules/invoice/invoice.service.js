/* =========================================
   INVOICE SERVICE
========================================= */

const InvoiceService = (() => {
  /* =====================================
       GET BY RESERVATION
    ===================================== */

  async function getByReservation(bookingId) {
    const booking = ReservasiDummy.getById(bookingId).data;

    const invoice = InvoiceDummy.getByBookingId(bookingId);

    const payments = PaymentDummy.getByBookingId(bookingId);

    return {
      booking,

      invoice,

      payments,
    };
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    getByReservation,
  };
})();
