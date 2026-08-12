/* =========================================
   INVOICE DUMMY
========================================= */

const InvoiceDummy = (() => {
  /* =====================================
       DATA
    ===================================== */

  const invoices = [
    {
      id: "INV001",

      bookingId: "RSV001",

      invoiceNumber: "INV-260701-0001",

      invoiceDate: "2026-07-01",

      status: "UNPAID",

      createdAt: "2026-07-01T10:00:00",

      updatedAt: "",
    },

    {
      id: "INV002",

      bookingId: "RSV002",

      invoiceNumber: "INV-260702-0002",

      invoiceDate: "2026-07-02",

      status: "DP",

      createdAt: "2026-07-02T10:00:00",

      updatedAt: "",
    },

    {
      id: "INV003",
      bookingId: "RSV003",
      invoiceNumber: "INV-260703-0003",
      invoiceDate: "2026-12-20",
      status: "PAID",
      createdAt: "...",
      updatedAt: "",
    },
    {
      id: "INV004",
      bookingId: "RSV004",
      invoiceNumber: "INV-260704-0004",
      invoiceDate: "2026-08-01",
      status: "PAID",
      createdAt: "...",
      updatedAt: "",
    },
  ];

  /* =====================================
       GET ALL
    ===================================== */

  function getAll() {
    return [...invoices];
  }

  /* =====================================
       GET BY BOOKING
    ===================================== */

  function getByBookingId(bookingId) {
    return invoices.find((invoice) => invoice.bookingId === bookingId);
  }

  /* =====================================
       GET BY ID
    ===================================== */

  function getById(id) {
    return invoices.find((invoice) => invoice.id === id);
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    getAll,

    getByBookingId,

    getById,
  };
})();
