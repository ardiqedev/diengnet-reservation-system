/* =========================================
   CHANNEL SERVICE
========================================= */

const ChannelService = {
  /* =====================================
     GET ALL
  ===================================== */

  async getAll() {
    return {
      success: true,

      message: "Data channel berhasil diambil.",

      data: [
        {
          id: "WEBSITE",
          nama: "Website",
        },

        {
          id: "OWNER",
          nama: "Owner",
        },

        {
          id: "AGEN",
          nama: "Agen",
        },
      ],

      meta: {},
    };
  },
};
