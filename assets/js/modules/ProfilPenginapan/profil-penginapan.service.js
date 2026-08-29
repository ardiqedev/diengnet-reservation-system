/* =========================================
   QEDEV PROFIL PENGINAPAN SERVICE
   FRONTEND
========================================= */

const ProfilPenginapanService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll({
    page = 1,
    limit = 6,
    keyword = "",
    jenisPenginapan = "",
  } = {}) {
    return await API.post("profil-penginapan.list", {
      page,
      limit,
      keyword,
      jenisPenginapan,
    });
  },

  /* =====================================
     GET DETAIL
  ===================================== */

  async getById(id) {
    return await API.post("profil-penginapan.detail", {
      id,
    });
  },
};
