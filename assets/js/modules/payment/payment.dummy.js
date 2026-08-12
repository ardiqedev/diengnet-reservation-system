/* =========================================
   PAYMENT DUMMY
========================================= */

const PaymentDummy = (() => {
  /* =====================================
       DATA
    ===================================== */

  const payments = [
    {
      id: "PAY001",
      bookingId: "RSV001",
      paymentDate: "2026-07-20",
      paymentMethod: PaymentMethod.TRANSFER,
      paymentAmount: 500000,
      paymentReference: "TRX123456",
      paymentNote: "DP",
      proof: "",
      verified: true,
      verifiedBy: "USR001",
      verifiedAt: "2026-07-20T10:00:00",
      createdAt: "2026-07-20T10:00:00",
      updatedAt: "",
    },
    {
      id: "PAY002",
      bookingId: "RSV001",
      paymentDate: "2026-07-22",
      paymentMethod: PaymentMethod.CASH,
      paymentAmount: 1000000,
      paymentReference: "",
      paymentNote: "Pelunasan",
      proof: "",
      verified: true,
      verifiedBy: "USR001",
      verifiedAt: "2026-07-22T15:30:00",
      createdAt: "2026-07-22T15:30:00",
      updatedAt: "",
    },
  ];

  /* =====================================
       GET ALL
    ===================================== */

  function getAll() {
    return [...payments];
  }

  /* =====================================
       GET BY BOOKING
    ===================================== */

  function getByBookingId(bookingId) {
    return payments.filter((payment) => payment.bookingId === bookingId);
  }

  /* =====================================
       GET BY ID
    ===================================== */

  function getById(id) {
    return payments.find((payment) => payment.id === id);
  }

  /* =====================================
       CREATE
    ===================================== */

  function create(data, proof = null) {
    const payment = {
      id: crypto.randomUUID(),

      ...data,

      proof,

      verified: false,

      verifiedBy: "",

      verifiedAt: null,

      createdAt: new Date().toISOString(),

      updatedAt: null,
    };

    payments.unshift(payment);

    return payment;
  }

  /* =====================================
       UPDATE
    ===================================== */

  function update(data, proof = null) {
    const index = payments.findIndex((payment) => payment.id === data.id);

    if (index === -1) {
      return null;
    }

    payments[index] = {
      ...payments[index],

      ...data,

      proof: proof ?? payments[index].proof,

      updatedAt: new Date().toISOString(),
    };

    return payments[index];
  }

  /* =====================================
       REMOVE
    ===================================== */

  function remove(id) {
    const index = payments.findIndex((payment) => payment.id === id);

    if (index === -1) {
      return false;
    }

    payments.splice(index, 1);

    return true;
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    getAll,

    getByBookingId,

    getById,

    create,

    update,

    remove,
  };
})();
