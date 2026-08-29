/* =========================================
   QEDEV PENGATURAN UNIT SERVICE
========================================= */

const PengaturanUnitService = {
  /* =====================================
     GET BY JENIS PENGINAPAN
  ===================================== */

  async getByJenis(jenisPenginapan) {
    if (!jenisPenginapan) {
      throw new Error("Jenis penginapan wajib diisi.");
    }

    return API.post("pengaturan-unit.byJenis", {
      jenisPenginapan,
    });
  },

  /* =====================================
     UPDATE KONFIGURASI FIELD
  ===================================== */

  async update(payload = {}) {
    if (!payload?.id) {
      throw new Error("ID konfigurasi wajib diisi.");
    }

    return API.post("pengaturan-unit.update", payload);
  },
};
