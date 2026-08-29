/* =========================================
   PAYMENT DUMMY
========================================= */

const PaymentDummy = (() => {
  /* =====================================
     DATA
  ===================================== */

  const payments = [
    /* ===================================
       RSV002
       FULL PAYMENT - VERIFIED
       GRAND TOTAL: 750.000
    =================================== */

    {
      id: "PAY001",

      reservationId: "RSV002",

      paymentDate: "2026-07-20",

      paymentMethod: PaymentMethod.TRANSFER,

      paymentAmount: 750000,

      paymentReference: "TRX123456",

      paymentNote: "Full payment",

      proof: "",

      status: PaymentTransactionStatus.VERIFIED,

      verifiedBy: "USR001",

      verifiedAt: "2026-07-20T10:00:00",

      createdAt: "2026-07-20T09:30:00",

      updatedAt: "2026-07-20T10:00:00",
    },

    /* ===================================
       RSV001
       FULL PAYMENT - PENDING
       GRAND TOTAL: 750.000
    =================================== */

    {
      id: "PAY002",

      reservationId: "RSV001",

      paymentDate: "2026-08-26",

      paymentMethod: PaymentMethod.QRIS,

      paymentAmount: 750000,

      paymentReference: "QRIS-260826-0001",

      paymentNote: "Pembayaran full, menunggu verifikasi.",

      proof: "",

      status: PaymentTransactionStatus.PENDING,

      verifiedBy: "",

      verifiedAt: null,

      createdAt: "2026-08-26T19:00:00",

      updatedAt: null,
    },

    /* ===================================
       RSV003
       FULL PAYMENT - VERIFIED
       GRAND TOTAL: 2.800.000
    =================================== */

    {
      id: "PAY003",

      reservationId: "RSV003",

      paymentDate: "2026-08-20",

      paymentMethod: PaymentMethod.TRANSFER,

      paymentAmount: 2800000,

      paymentReference: "TRX-280820-0003",

      paymentNote: "Full payment verified.",

      proof: "",

      status: PaymentTransactionStatus.VERIFIED,

      verifiedBy: "USR001",

      verifiedAt: "2026-08-20T15:00:00",

      createdAt: "2026-08-20T14:00:00",

      updatedAt: "2026-08-20T15:00:00",
    },

    /* ===================================
       RSV004
       REJECTED
       GRAND TOTAL: 2.000.000
    =================================== */

    {
      id: "PAY004",

      reservationId: "RSV004",

      paymentDate: "2026-08-21",

      paymentMethod: PaymentMethod.TRANSFER,

      paymentAmount: 2000000,

      paymentReference: "TRX-210820-0004",

      paymentNote: "Bukti pembayaran tidak valid.",

      proof: "",

      status: PaymentTransactionStatus.REJECTED,

      verifiedBy: "USR001",

      verifiedAt: "2026-08-21T16:00:00",

      createdAt: "2026-08-21T15:00:00",

      updatedAt: "2026-08-21T16:00:00",
    },
  ];

  /* =====================================
     GET ALL
  ===================================== */

  function getAll() {
    return [...payments];
  }

  /* =====================================
     GET BY RESERVATION
  ===================================== */

  function getByReservationId(reservationId) {
    return payments.filter(
      (payment) => payment.reservationId === reservationId,
    );
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

  function create(data = {}, proof = null) {
    const payment = {
      id: crypto.randomUUID(),

      ...data,

      paymentAmount: Number(data.paymentAmount || 0),

      proof,

      /*
       * Semua payment baru selalu
       * masuk PENDING.
       *
       * Frontend tidak boleh langsung
       * membuat VERIFIED.
       */

      status: PaymentTransactionStatus.PENDING,

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

  function update(data = {}, proof = null) {
    const index = payments.findIndex((payment) => payment.id === data.id);

    if (index === -1) {
      return null;
    }

    payments[index] = {
      ...payments[index],

      ...data,

      paymentAmount: Number(
        data.paymentAmount ?? payments[index].paymentAmount ?? 0,
      ),

      proof: proof ?? payments[index].proof,

      updatedAt: new Date().toISOString(),
    };

    return payments[index];
  }

  /* =====================================
     REMOVE
  ===================================== */

  function remove() {
    /*
     * Hard delete payment sengaja
     * tidak digunakan.
     */

    return false;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getAll,

    getByReservationId,

    getById,

    create,

    update,

    remove,
  };
})();
