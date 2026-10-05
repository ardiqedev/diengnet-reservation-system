/* =========================================
   QEDEV USER SERVICE
========================================= */

const UserService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(payload = {}) {
    return API.post("user.list", {
      page: payload.page || 1,
      limit: payload.limit || 10,
      keyword: payload.keyword || "",
      status: payload.status || "",
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    if (!id) {
      throw new Error("ID pengguna wajib diisi.");
    }

    return API.post("user.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data = {}) {
    return API.post("user.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data = {}) {
    if (!id) {
      throw new Error("ID pengguna wajib diisi.");
    }

    return API.post("user.update", {
      id,
      ...data,
    });
  },
};
