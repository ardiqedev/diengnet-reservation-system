/* =========================================
   RESERVASI AVAILABILITY
========================================= */

const ReservasiAvailability = {
  /* =====================================
     SEARCH
  ===================================== */

  async search(filter = {}) {
    console.log("[AVAIL] SEARCH:", filter);

    let units = await this.getRooms(filter);

    console.log("[AVAIL] ACTIVE UNITS:", units);

    /* ================================
       FILTER PENGINAPAN
    ================================= */

    units = this.filterPenginapan(units, filter);

    /* ================================
       FILTER KAPASITAS
    ================================= */

    units = this.filterKapasitas(units, filter);

    console.log("[AVAIL] CAPACITY FILTER:", units);

    /* ================================
       FILTER STATUS
    ================================= */

    units = this.filterStatus(units);

    /* ================================
       FILTER TANGGAL
    ================================= */

    units = await this.filterTanggal(units, filter);

    console.log("[AVAIL] DATE AVAILABLE:", units);

    /* ================================
       PRICING
       sementara belum dihitung
    ================================= */

    units = await this.applyPricing(units, filter);

    /* ================================
       SORT
    ================================= */

    units = this.sortRooms(units);

    console.log("[AVAIL] AVAILABLE UNITS:", units);

    return units;
  },

  /* =====================================
     GET ROOMS / UNITS
  ===================================== */

  async getRooms(filter = {}) {
    if (!filter.penginapanId) {
      return [];
    }

    const result = await UnitService.getActiveByPenginapanId(
      filter.penginapanId,
    );

    if (!result.success) {
      throw new Error(result.message || "Gagal mengambil data unit.");
    }

    /* ================================
       ARRAY LANGSUNG
    ================================= */

    if (Array.isArray(result.data)) {
      return result.data;
    }

    /* ================================
       PAGINATED
    ================================= */

    if (Array.isArray(result.data?.rows)) {
      return result.data.rows;
    }

    return [];
  },

  /* =====================================
     FILTER PENGINAPAN
  ===================================== */

  filterPenginapan(units, filter) {
    if (!filter.penginapanId) {
      return units;
    }

    const penginapanId = String(filter.penginapanId).trim();

    return units.filter(
      (unit) => String(unit.penginapanId || "").trim() === penginapanId,
    );
  },

  /* =====================================
     FILTER KAPASITAS
  ===================================== */

  filterKapasitas(units, filter) {
    const dewasa = Number(filter.dewasa) || 0;

    const anak = Number(filter.anak) || 0;

    return units.filter((unit) => {
      const kapasitasDewasa = Number(unit.kapasitasDewasa) || 0;

      const kapasitasAnak = Number(unit.kapasitasAnak) || 0;

      return kapasitasDewasa >= dewasa && kapasitasAnak >= anak;
    });
  },

  /* =====================================
     FILTER STATUS
  ===================================== */

  filterStatus(units) {
    return units.filter(
      (unit) =>
        String(unit.status || "")
          .trim()
          .toUpperCase() === "AKTIF",
    );
  },

  /* =====================================
     FILTER TANGGAL
  ===================================== */

  async filterTanggal(units, filter) {
    if (!filter.checkIn || !filter.checkOut) {
      return units;
    }

    const penginapanId = String(filter.penginapanId || "").trim();

    if (!penginapanId) {
      return units;
    }

    /* ================================
       AMBIL RESERVASI PENGINAPAN
    ================================= */

    let reservations = [];

    try {
      const result = await API.post("reservation.list", {
        penginapanId,
        limit: 100,
      });

      if (result?.success) {
        if (Array.isArray(result.data)) {
          reservations = result.data;
        } else if (Array.isArray(result.data?.rows)) {
          reservations = result.data.rows;
        }
      }
    } catch (error) {
      console.error("[AVAIL] RESERVATION LOAD ERROR:", error);

      /*
       * Jangan menganggap unit kosong
       * hanya karena query reservation gagal.
       *
       * Untuk sementara kita kembalikan
       * unit yang lolos filter sebelumnya.
       */

      return units;
    }

    console.log("[AVAIL] RESERVATIONS:", reservations);

    /* ================================
       FILTER UNIT
    ================================= */

    return units.filter((unit) => {
      const unitId = String(unit.id || "").trim();

      /*
       * Cari reservasi yang memakai
       * unit ini.
       */

      const unitReservations = reservations.filter(
        (reservation) => String(reservation.unitId || "").trim() === unitId,
      );

      /*
       * Tidak ada reservasi
       * berarti tersedia.
       */

      if (unitReservations.length === 0) {
        return true;
      }

      /*
       * Cek collision.
       */

      const collision = unitReservations.some((reservation) =>
        this.isBlockingReservation(
          reservation,
          filter.checkIn,
          filter.checkOut,
        ),
      );

      return !collision;
    });
  },

  /* =====================================
     CHECK BLOCKING RESERVATION
  ===================================== */

  isBlockingReservation(reservation, requestedCheckIn, requestedCheckOut) {
    const status = String(reservation.status || "")
      .trim()
      .toUpperCase();

    /* ================================
       BOOKED
    ================================= */

    if (status === "BOOKED") {
      return this.isReservationDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /* ================================
       CHECK IN
    ================================= */

    if (status === "CHECK_IN") {
      return this.isReservationDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /* ================================
       DRAFT + HOLD
    ================================= */

    if (status === "DRAFT") {
      /*
       * DRAFT tanpa hold
       * tidak mengunci unit.
       */

      if (!reservation.holdUntil) {
        return false;
      }

      const holdUntil = this.toDate(reservation.holdUntil);

      /*
       * holdUntil tidak valid
       * dianggap tidak mengunci.
       */

      if (!holdUntil) {
        return false;
      }

      /*
       * HOLD sudah expired
       * tidak lagi mengunci unit.
       */

      if (holdUntil.getTime() <= Date.now()) {
        return false;
      }

      /*
       * HOLD masih aktif.
       * Sekarang cek collision tanggal.
       */

      return this.isReservationDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /* ================================
       STATUS LAIN
    ================================= */

    /*
     * CANCELLED
     * CANCELED
     * CHECK_OUT
     * COMPLETED
     * REJECTED
     * dan status lain
     *
     * tidak mengunci unit.
     */

    return false;
  },

  /* =====================================
     CHECK RESERVATION DATE OVERLAP
  ===================================== */

  isReservationDateOverlap(reservation, requestedCheckIn, requestedCheckOut) {
    if (!reservation.checkIn || !reservation.checkOut) {
      return false;
    }

    const reservationCheckIn = this.toDate(reservation.checkIn);

    const reservationCheckOut = this.toDate(reservation.checkOut);

    const requestedIn = this.toDate(requestedCheckIn);

    const requestedOut = this.toDate(requestedCheckOut);

    if (
      !reservationCheckIn ||
      !reservationCheckOut ||
      !requestedIn ||
      !requestedOut
    ) {
      return false;
    }

    /*
     * COLLISION FORMULA
     *
     * requestedIn < reservationOut
     * &&
     * requestedOut > reservationIn
     *
     * Checkout = check-in berikutnya
     * tetap diperbolehkan.
     */

    return (
      requestedIn < reservationCheckOut && requestedOut > reservationCheckIn
    );
  },

  /* =====================================
     DATE HELPER
  ===================================== */

  toDate(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  },

  /* =====================================
     APPLY PRICING
  ===================================== */

  async applyPricing(units, filter) {
    /*
     * Harga Musim BELUM disentuh.
     *
     * Untuk sekarang hanya
     * mempertahankan struktur unit.
     */

    return units.map((unit) => ({
      ...unit,

      roomPrice: Number(unit.roomPrice) || 0,
    }));
  },

  /* =====================================
     SORT
  ===================================== */

  sortRooms(units) {
    return [...units].sort((a, b) =>
      String(a.nama || "").localeCompare(String(b.nama || "")),
    );
  },
};
