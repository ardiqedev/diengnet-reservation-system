/* =========================================
   RESERVASI SERVICE
========================================= */

const ReservasiService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(filters = {}) {
    return API.post("reservation.list", {
      search: filters.search || "",

      status: filters.status || "",

      channel: filters.channel || "",

      penginapanId: filters.penginapanId || "",

      unitId: filters.unitId || "",

      tanggal: filters.tanggal || "",

      limit: filters.limit || ReservasiDefault.LIMIT,
    });
  },

  /* =====================================
     SEARCH ROOM
  ===================================== */

  async searchRoom(filter = {}) {
    return ReservasiAvailability.search(filter);
  },

  /* =====================================
     SAVE
  ===================================== */

  async save(data = {}) {
    return API.post("reservation.store", data);
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.detail", {
      id: reservationId,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.delete", {
      id: reservationId,
    });
  },

  /* =====================================
     BOOK
  ===================================== */

  async book(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.book", {
      id: reservationId,
    });
  },

  /* =====================================
     CHECK IN
     
     Frontend hanya meneruskan request
     ke backend.

     Validasi final dilakukan oleh:
     
     ReservationController
            ↓
     ReservationService
            ↓
     PaymentService
            ↓
     Repository
  ===================================== */

  async checkIn(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.checkin", {
      id: reservationId,
    });
  },

  /* =====================================
     CHECK OUT
     
     Frontend hanya meneruskan request
     ke backend.
  ===================================== */

  async checkOut(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.checkout", {
      id: reservationId,
    });
  },

  /* =====================================
     EXPIRE
  ===================================== */

  async expire(id) {
    const reservationId = String(id || "").trim();

    if (!reservationId) {
      throw new Error("ID reservasi wajib diisi.");
    }

    return API.post("reservation.expire", {
      id: reservationId,
    });
  },
};
