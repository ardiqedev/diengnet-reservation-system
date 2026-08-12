/* =========================================
   RESERVASI AVAILABILITY
========================================= */

const ReservasiAvailability = {
  /* =====================================
     SEARCH
  ===================================== */

  async search(filter = {}) {
    let rooms = await this.getRooms();

    rooms = this.filterPenginapan(rooms, filter);

    rooms = this.filterTanggal(rooms, filter);

    rooms = this.filterStatus(rooms);

    rooms = await this.applyPricing(rooms, filter);

    rooms = this.sortRooms(rooms);

    return rooms;
  },

  /* =====================================
     GET ROOMS
  ===================================== */

  async getRooms() {
    return ReservasiDummy.getAvailableRooms();
  },

  /* =====================================
     FILTER PENGINAPAN
  ===================================== */

  filterPenginapan(rooms, filter) {
    console.table(rooms);

    console.log(filter.penginapanId);

    if (!filter.penginapanId) return rooms;

    return rooms.filter((room) => room.penginapanId === filter.penginapanId);
  },

  /* =====================================
     FILTER TANGGAL
  ===================================== */

  filterTanggal(rooms, filter) {
    // sementara belum digunakan

    return rooms;
  },

  /* =====================================
     FILTER STATUS
  ===================================== */

  filterStatus(rooms) {
    return rooms.filter((room) => room.status === "TERSEDIA");
  },

  /* =====================================
     APPLY PRICING
  ===================================== */

  async applyPricing(rooms, filter) {
    return rooms.map((room) => ({
      ...room,

      roomPrice: room.roomPrice,
    }));
  },

  /* =====================================
     SORT
  ===================================== */

  sortRooms(rooms) {
    return rooms.sort((a, b) => a.nomor.localeCompare(b.nomor));
  },
};
