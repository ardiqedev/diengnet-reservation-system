/* =========================================
   CHANNEL SERVICE
========================================= */

const ChannelService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll(payload = {}) {
    return API.post("channel.list", {
      page: payload.page || 1,

      limit: payload.limit || 100,

      keyword: payload.keyword || "",

      status: payload.status || "",
    });
  },

  /* =====================================
     GET BY ID
  ===================================== */

  async getById(id) {
    return API.post("channel.detail", {
      id,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async create(data) {
    return API.post("channel.store", data);
  },

  /* =====================================
     UPDATE
  ===================================== */

  async update(id, data) {
    return API.post("channel.update", {
      id,
      ...data,
    });
  },

  /* =====================================
     DELETE
  ===================================== */

  async delete(id) {
    return API.post("channel.delete", {
      id,
    });
  },
};
