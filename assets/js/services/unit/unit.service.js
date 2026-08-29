/* =========================================
   QEDEV UNIT SERVICE
========================================= */

const UnitService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(payload = {}) {
    return API.post("unit.list", {
      page: payload.page || 1,

      limit: payload.limit || 10,

      keyword: payload.keyword || "",

      status: payload.status || "",

      penginapanId: payload.penginapanId || "",
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    if (!id) {
      throw new Error("ID unit wajib diisi.");
    }

    return API.post("unit.detail", {
      id,
    });
  },

  /* =====================================
     GET ACTIVE BY PENGINAPAN
  ===================================== */

  async getActiveByPenginapanId(penginapanId) {
    if (!penginapanId) {
      throw new Error("Penginapan wajib dipilih.");
    }

    return API.post("unit.active", {
      penginapanId,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data = {}) {
    return API.post("unit.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data = {}) {
    if (!id) {
      throw new Error("ID unit wajib diisi.");
    }

    return API.post("unit.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async remove(id) {
    if (!id) {
      throw new Error("ID unit wajib diisi.");
    }

    return API.post("unit.delete", {
      id,
    });
  },
};
