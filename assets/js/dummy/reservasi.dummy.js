/* =========================================
   DUMMY RESERVASI
========================================= */

const ReservasiDummy = {
  /* =====================================
     CONFIG
  ===================================== */

  /*
   * Reservation Hold
   *
   * Reservasi DRAFT hanya ditahan
   * maksimal 12 jam sejak dibuat.
   */

  HOLD_DURATION_HOURS: 12,

  /* =====================================
     DATA
  ===================================== */

  data: [
    /* ===================================
       RSV001
       DRAFT + HOLD
    =================================== */

    {
      id: "RSV001",
      kodeReservasi: "RES-260826-0001",

      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",

      unitId: "UNIT001",
      unit: "STD-01",

      musimId: "MS001",
      musim: "Low Season",

      channel: BookingChannel.WEBSITE,

      tamuId: "TM001",
      namaTamu: "Budi Santoso",
      noHp: "081234567890",
      email: "budi@gmail.com",

      checkIn: "2026-09-10",
      checkOut: "2026-09-12",
      jumlahMalam: 2,

      dewasa: 2,
      anak: 1,

      weekday: 350000,
      weekend: 400000,
      extraPerson: 50000,

      subtotal: 750000,
      diskon: 0,
      pajak: 0,
      grandTotal: 750000,

      status: ReservasiStatus.DRAFT,

      paymentStatus: "UNPAID",

      createdAt: "2026-08-26T10:00:00+07:00",

      /*
       * Hold 12 jam
       *
       * 10:00 → 22:00
       */

      holdUntil: "2026-08-26T22:00:00+07:00",

      catatan: "Menunggu pembayaran full.",
    },

    /* ===================================
       RSV002
       BOOKED + FULL PAYMENT
    =================================== */

    {
      id: "RSV002",
      kodeReservasi: "RES-260825-0002",

      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",

      unitId: "UNIT002",
      unit: "STD-02",

      musimId: "MS001",
      musim: "Low Season",

      channel: BookingChannel.WEBSITE,

      tamuId: "TM002",
      namaTamu: "Siti Aminah",
      noHp: "081355667788",
      email: "siti@gmail.com",

      checkIn: "2026-09-11",
      checkOut: "2026-09-13",
      jumlahMalam: 2,

      dewasa: 2,
      anak: 0,

      weekday: 375000,
      weekend: 425000,
      extraPerson: 50000,

      subtotal: 800000,
      diskon: 50000,
      pajak: 0,
      grandTotal: 750000,

      status: ReservasiStatus.BOOKED,

      paymentStatus: "PAID",

      createdAt: "2026-08-25T09:00:00+07:00",

      holdUntil: null,

      catatan: "Full payment telah diverifikasi.",
    },

    /* ===================================
       RSV003
       CHECK IN
    =================================== */

    {
      id: "RSV003",
      kodeReservasi: "RES-260824-0003",

      penginapanId: "PGN002",
      penginapan: "Villa Arjuna",

      unitId: "UNIT010",
      unit: "FM-01",

      musimId: "MS003",
      musim: "Peak Season",

      channel: BookingChannel.AGEN,

      tamuId: "TM003",
      namaTamu: "Andi Saputra",
      noHp: "082233445566",
      email: "andi@gmail.com",

      checkIn: "2026-08-24",
      checkOut: "2026-08-27",
      jumlahMalam: 3,

      dewasa: 4,
      anak: 2,

      weekday: 900000,
      weekend: 1000000,
      extraPerson: 100000,

      subtotal: 2900000,
      diskon: 100000,
      pajak: 0,
      grandTotal: 2800000,

      status: ReservasiStatus.CHECK_IN,

      paymentStatus: "PAID",

      createdAt: "2026-08-20T10:00:00+07:00",

      holdUntil: null,

      catatan: "Tamu sedang menginap",
    },

    /* ===================================
       RSV004
       CHECK OUT
    =================================== */

    {
      id: "RSV004",
      kodeReservasi: "RES-260820-0004",

      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",

      unitId: "UNIT005",
      unit: "DLX-01",

      musimId: "MS002",
      musim: "High Season",

      channel: BookingChannel.WEBSITE,

      tamuId: "TM004",
      namaTamu: "Linda Marlina",
      noHp: "085677889900",
      email: "linda@gmail.com",

      checkIn: "2026-08-20",
      checkOut: "2026-08-23",
      jumlahMalam: 3,

      dewasa: 2,
      anak: 1,

      weekday: 650000,
      weekend: 700000,
      extraPerson: 75000,

      subtotal: 2000000,
      diskon: 0,
      pajak: 0,
      grandTotal: 2000000,

      status: ReservasiStatus.CHECK_OUT,

      paymentStatus: "PAID",

      createdAt: "2026-08-18T10:00:00+07:00",

      holdUntil: null,

      catatan: "Reservasi selesai",
    },

    /* ===================================
       RSV005
       EXPIRED
    =================================== */

    {
      id: "RSV005",
      kodeReservasi: "RES-260825-0005",

      penginapanId: "PGN001",
      penginapan: "Homestay Dieng Indah",

      unitId: "UNIT003",
      unit: "STD-03",

      musimId: "MS001",
      musim: "Low Season",

      channel: BookingChannel.WEBSITE,

      tamuId: "TM005",
      namaTamu: "Rina Wulandari",
      noHp: "081234567891",
      email: "rina@gmail.com",

      checkIn: "2026-09-15",
      checkOut: "2026-09-17",
      jumlahMalam: 2,

      dewasa: 2,
      anak: 0,

      weekday: 500000,
      weekend: 500000,
      extraPerson: 0,

      subtotal: 1000000,
      diskon: 0,
      pajak: 0,
      grandTotal: 1000000,

      status: ReservasiStatus.EXPIRED,

      paymentStatus: "UNPAID",

      createdAt: "2026-08-25T08:00:00+07:00",

      holdUntil: null,

      catatan: "Reservation hold telah berakhir.",
    },
  ],

  /* =====================================
     HOLD HELPER
  ===================================== */

  getHoldUntil(createdAt = null) {
    const created = createdAt ? new Date(createdAt) : new Date();

    if (Number.isNaN(created.getTime())) {
      return null;
    }

    return new Date(
      created.getTime() + this.HOLD_DURATION_HOURS * 60 * 60 * 1000,
    ).toISOString();
  },

  /* =====================================
     CHECK HOLD ACTIVE
  ===================================== */

  isHoldActive(reservation = {}) {
    if (reservation.status !== ReservasiStatus.DRAFT) {
      return false;
    }

    if (!reservation.holdUntil) {
      return false;
    }

    const holdUntil = new Date(reservation.holdUntil);

    if (Number.isNaN(holdUntil.getTime())) {
      return false;
    }

    return holdUntil.getTime() > Date.now();
  },

  /* =====================================
     EXPIRE RESERVATION
  ===================================== */

  expire(id) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Reservasi tidak ditemukan.",
      };
    }

    const reservation = this.data[index];

    if (reservation.status !== ReservasiStatus.DRAFT) {
      return {
        success: false,

        message: "Reservasi tidak dapat di-expire.",
      };
    }

    const now = new Date().toISOString();

    this.data[index] = {
      ...reservation,

      status: ReservasiStatus.EXPIRED,

      paymentStatus: "UNPAID",

      holdUntil: null,

      updatedAt: now,

      expiredAt: now,
    };

    return {
      success: true,

      message: "Reservation hold telah berakhir.",

      data: this.data[index],
    };
  },

  /* =====================================
     EXPIRE EXPIRED HOLDS
  ===================================== */

  expireExpiredHolds() {
    const now = Date.now();

    this.data.forEach((reservation) => {
      if (reservation.status !== ReservasiStatus.DRAFT) {
        return;
      }

      if (!reservation.holdUntil) {
        return;
      }

      const holdUntil = new Date(reservation.holdUntil);

      if (Number.isNaN(holdUntil.getTime())) {
        return;
      }

      if (holdUntil.getTime() <= now) {
        const updatedAt = new Date().toISOString();

        reservation.status = ReservasiStatus.EXPIRED;

        reservation.paymentStatus = "UNPAID";

        reservation.holdUntil = null;

        reservation.updatedAt = updatedAt;

        reservation.expiredAt = updatedAt;
      }
    });
  },

  /* =====================================
     AVAILABILITY ENGINE
  ===================================== */

  /* =====================================
     BLOCKING STATUS
  ===================================== */

  isBlockingStatus(status) {
    return [
      ReservasiStatus.DRAFT,
      ReservasiStatus.BOOKED,
      ReservasiStatus.CHECK_IN,
    ].includes(status);
  },

  /* =====================================
     DATE OVERLAP
  ===================================== */

  isDateOverlap(checkInA, checkOutA, checkInB, checkOutB) {
    if (!checkInA || !checkOutA || !checkInB || !checkOutB) {
      return false;
    }

    const startA = new Date(checkInA);
    const endA = new Date(checkOutA);

    const startB = new Date(checkInB);
    const endB = new Date(checkOutB);

    if (
      Number.isNaN(startA.getTime()) ||
      Number.isNaN(endA.getTime()) ||
      Number.isNaN(startB.getTime()) ||
      Number.isNaN(endB.getTime())
    ) {
      return false;
    }

    return startA < endB && endA > startB;
  },

  /* =====================================
     AVAILABILITY CONFLICT
  ===================================== */

  hasAvailabilityConflict(reservation = {}, excludeId = null) {
    if (!reservation?.unitId) {
      return false;
    }

    if (!reservation?.checkIn || !reservation?.checkOut) {
      return false;
    }

    return this.data.some((existing) => {
      /* ===============================
         SKIP DIRI SENDIRI
      =============================== */

      if (excludeId && existing.id === excludeId) {
        return false;
      }

      /* ===============================
         STATUS TIDAK MEMBLOKIR
      =============================== */

      if (!this.isBlockingStatus(existing.status)) {
        return false;
      }

      /* ===============================
         UNIT BERBEDA
      =============================== */

      if (existing.unitId !== reservation.unitId) {
        return false;
      }

      /* ===============================
         CEK TANGGAL OVERLAP
      =============================== */

      return this.isDateOverlap(
        reservation.checkIn,
        reservation.checkOut,
        existing.checkIn,
        existing.checkOut,
      );
    });
  },

  /* =====================================
     GET ALL
  ===================================== */

  getAll(page = 1) {
    /*
     * Sebelum data dikirim,
     * pastikan seluruh DRAFT yang hold-nya
     * sudah habis berubah menjadi EXPIRED.
     */

    this.expireExpiredHolds();

    const limit = 10;

    const total = this.data.length;

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const currentPage = Math.min(Math.max(Number(page) || 1, 1), totalPages);

    const start = (currentPage - 1) * limit;

    const rows = this.data.slice(start, start + limit);

    return {
      success: true,

      message: "Data berhasil diambil",

      data: {
        rows,

        total,

        page: currentPage,

        limit,

        totalPages,
      },
    };
  },

  /* =====================================
     GET PENGINAPAN
  ===================================== */

  getPenginapan() {
    return {
      success: true,

      data: [
        {
          id: "PGN001",

          nama: "Homestay Dieng Indah",

          status: "Aktif",
        },

        {
          id: "PGN002",

          nama: "Villa Arjuna",

          status: "Aktif",
        },

        {
          id: "PGN003",

          nama: "Dieng Family Homestay",

          status: "Aktif",
        },

        {
          id: "PGN004",

          nama: "Penginapan Sikunir View",

          status: "Aktif",
        },
      ],
    };
  },

  /* =====================================
     GET BY ID
  ===================================== */

  getById(id) {
    /*
     * Cek hold terlebih dahulu agar ketika
     * detail dibuka setelah hold habis,
     * status sudah konsisten.
     */

    this.expireExpiredHolds();

    const item = this.data.find((x) => x.id === id);

    return {
      success: !!item,

      message: item ? "Data ditemukan" : "Data tidak ditemukan",

      data: item || null,
    };
  },

  /* =====================================
     GET CHANNEL
  ===================================== */

  getChannel() {
    return {
      success: true,

      data: [
        {
          id: "OWNER",

          kode: "OWNER",

          nama: "Walk In / Owner",

          aktif: true,
        },

        {
          id: "WEBSITE",

          kode: "WEBSITE",

          nama: "Website",

          aktif: true,
        },

        {
          id: "AGEN",

          kode: "AGEN",

          nama: "Agen",

          aktif: true,
        },
      ],
    };
  },

  /* =====================================
     GET AVAILABLE ROOMS
  ===================================== */

  getAvailableRooms() {
    return [
      {
        id: "UNIT001",

        penginapanId: "PGN001",

        nomor: "STD-01",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 1,

        bed: "Queen Bed",

        roomPrice: 350000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "UNIT002",

        penginapanId: "PGN001",

        nomor: "STD-02",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 1,

        bed: "Queen Bed",

        roomPrice: 350000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "UNIT003",

        penginapanId: "PGN001",

        nomor: "STD-03",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 1,

        bed: "Queen Bed",

        roomPrice: 350000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "UNIT010",

        penginapanId: "PGN002",

        nomor: "FM-01",

        tipeKamarId: "TP003",

        tipeKamar: "Family Room",

        kapasitasDewasa: 4,

        kapasitasAnak: 2,

        bed: "2 Queen Bed",

        roomPrice: 900000,

        extraPerson: 100000,

        minimalMalam: 2,

        status: "TERSEDIA",

        badge: "TERSEDIA",

        foto: "",
      },

      {
        id: "UNIT005",

        penginapanId: "PGN004",

        nomor: "STD-01",

        tipeKamarId: "TP001",

        tipeKamar: "Standard Room",

        kapasitasDewasa: 2,

        kapasitasAnak: 0,

        bed: "Queen Bed",

        roomPrice: 325000,

        extraPerson: 50000,

        minimalMalam: 1,

        status: "TERSEDIA",

        badge: "PROMO",

        foto: "",
      },
    ];
  },

  /* =====================================
     SAVE
  ===================================== */

  save(data = {}) {
    const now = new Date().toISOString();

    const reservation = {
      ...data,

      id: data.id || crypto.randomUUID(),

      status: ReservasiStatus.DRAFT,

      paymentStatus: "UNPAID",

      createdAt: data.createdAt || now,

      holdUntil: this.getHoldUntil(data.createdAt || now),

      updatedAt: now,

      expiredAt: null,
    };

    this.data.unshift(reservation);

    return {
      success: true,

      message: "Reservasi berhasil dibuat dan ditahan selama 12 jam.",

      data: reservation,
    };
  },

  /* =====================================
     UPDATE
  ===================================== */

  update(id, data = {}) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Data tidak ditemukan.",
      };
    }

    const reservation = this.data[index];

    /*
     * Reservasi yang sudah selesai diproses
     * tidak boleh sembarang diubah kembali
     * melalui update umum.
     */

    if (
      [
        ReservasiStatus.BOOKED,
        ReservasiStatus.CHECK_IN,
        ReservasiStatus.CHECK_OUT,
        ReservasiStatus.EXPIRED,
      ].includes(reservation.status)
    ) {
      return {
        success: false,

        message: "Reservasi yang sudah diproses tidak dapat diubah.",
      };
    }

    this.data[index] = {
      ...reservation,

      ...data,

      id: reservation.id,

      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,

      message: "Reservasi berhasil diperbarui.",

      data: this.data[index],
    };
  },

  /* =====================================
     BOOK
  ===================================== */

  book(id) {
    /*
     * Pastikan hold yang sudah habis
     * diproses terlebih dahulu.
     */

    this.expireExpiredHolds();

    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Reservasi tidak ditemukan.",
      };
    }

    const reservation = this.data[index];

    /* ===============================
       VALIDASI STATUS
    =============================== */

    if (reservation.status !== ReservasiStatus.DRAFT) {
      return {
        success: false,

        message: "Reservasi tidak dapat di-book.",
      };
    }

    /* ===============================
       VALIDASI HOLD
    =============================== */

    /* ===============================
       VALIDASI HOLD
    =============================== */

    if (!this.isHoldActive(reservation)) {
      /*
       * Safety net:
       * kalau hold ternyata sudah habis,
       * langsung ubah menjadi EXPIRED.
       */

      this.expire(id);

      return {
        success: false,

        message:
          "Reservation hold telah berakhir. Reservasi tidak dapat dikonfirmasi.",
      };
    }

    /* ===============================
       VALIDASI AVAILABILITY
    =============================== */

    if (this.hasAvailabilityConflict(reservation, reservation.id)) {
      return {
        success: false,

        message: "Kamar sudah tidak tersedia pada tanggal tersebut.",
      };
    }

    /* ===============================
       BOOK RESERVATION
    =============================== */

    const now = new Date().toISOString();

    this.data[index] = {
      ...reservation,

      status: ReservasiStatus.BOOKED,

      paymentStatus: "PAID",

      holdUntil: null,

      bookedAt: now,

      bookedBy: "USR001",

      updatedAt: now,
    };

    return {
      success: true,

      message: "Reservasi berhasil dikonfirmasi.",

      data: this.data[index],
    };
  },

  /* =====================================
     CHECK IN
  ===================================== */

  checkIn(id) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Reservasi tidak ditemukan.",
      };
    }

    const reservation = this.data[index];

    /* ===============================
       VALIDASI STATUS
    =============================== */

    if (reservation.status !== ReservasiStatus.BOOKED) {
      return {
        success: false,

        message: "Reservasi belum berstatus BOOKED.",
      };
    }

    /* ===============================
       VALIDASI PEMBAYARAN
    =============================== */

    if (reservation.paymentStatus !== "PAID") {
      return {
        success: false,

        message: "Pembayaran belum lunas.",
      };
    }

    /* ===============================
       UPDATE CHECK IN
    =============================== */

    const now = new Date().toISOString();

    this.data[index] = {
      ...reservation,

      status: ReservasiStatus.CHECK_IN,

      checkInAt: now,

      checkedInBy: "USR001",

      updatedAt: now,
    };

    return {
      success: true,

      message: "Tamu berhasil Check In.",

      data: this.data[index],
    };
  },

  /* =====================================
     CHECK OUT
  ===================================== */

  checkOut(id) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Reservasi tidak ditemukan.",
      };
    }

    const reservation = this.data[index];

    /* ===============================
       VALIDASI STATUS
    =============================== */

    if (reservation.status !== ReservasiStatus.CHECK_IN) {
      return {
        success: false,

        message: "Reservasi belum berstatus CHECK IN.",
      };
    }

    /* ===============================
       UPDATE CHECK OUT
    =============================== */

    const now = new Date().toISOString();

    this.data[index] = {
      ...reservation,

      status: ReservasiStatus.CHECK_OUT,

      checkOutAt: now,

      checkedOutBy: "USR001",

      updatedAt: now,
    };

    return {
      success: true,

      message: "Tamu berhasil Check Out.",

      data: this.data[index],
    };
  },

  /* =====================================
     DELETE
  ===================================== */

  delete(id) {
    const index = this.data.findIndex((x) => x.id === id);

    if (index === -1) {
      return {
        success: false,

        message: "Data tidak ditemukan.",
      };
    }

    this.data.splice(index, 1);

    return {
      success: true,

      message: "Reservasi berhasil dihapus.",
    };
  },
};
