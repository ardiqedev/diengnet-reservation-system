/* =========================================
   INVOICE
========================================= */

const Invoice = (() => {
  /* =====================================
       OPEN
    ===================================== */

  async function open(bookingId) {
    Loading.show();

    try {
      const data = await InvoiceService.getByReservation(bookingId);

      Modal.open({
        title: "Invoice",

        size: "lg",

        body: InvoiceView.render(data.booking, data.invoice, data.payments),
      });

      bindEvents();
    } catch (error) {
      console.error(error);

      Toast.error("Gagal memuat invoice.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
       EVENTS
    ===================================== */

  function bindEvents() {
    const btnPrint = document.getElementById("btnPrintInvoice");

    if (!btnPrint) return;

    btnPrint.addEventListener("click", print);
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
