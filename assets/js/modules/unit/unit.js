/* =========================================
   UNIT MODULE
========================================= */

const Unit = {
  keyword: "",

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("Unit Module Loaded");

    this.bindEvents();

    this.loadData();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    Search.init({
      input: "#searchUnit",

      delay: 400,

      onSearch: (keyword) => {
        this.keyword = keyword;

        this.updateSearchClear();

        this.loadData(1, false);
      },
    });

    /* ===============================
       CLEAR SEARCH
    =============================== */

    const clearButton = document.querySelector("#clearSearchUnit");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const input = document.querySelector("#searchUnit");

        if (input) {
          input.value = "";
        }

        this.keyword = "";

        this.updateSearchClear();

        this.loadData(1, false);
      });
    }
  },

  /* =====================================
     UPDATE SEARCH CLEAR
  ===================================== */

  updateSearchClear() {
    const input = document.querySelector("#searchUnit");

    const clearButton = document.querySelector("#clearSearchUnit");

    if (!input || !clearButton) {
      return;
    }

    if (input.value.trim()) {
      clearButton.classList.add("show");
    } else {
      clearButton.classList.remove("show");
    }
  },

  /* =====================================
     LOAD DATA
  ===================================== */

  async loadData(page = 1, showLoading = true) {
    if (showLoading) {
      Loading.show();
    }

    try {
      const result = await UnitService.getAll({
        page,

        limit: 10,

        keyword: this.keyword || "",
      });

      console.log("UNIT RESULT :", result);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal mengambil data unit.");

        return;
      }

      /* ===============================
         RENDER TABLE
      =============================== */

      this.render(result?.data?.rows || []);

      /* ===============================
         PAGINATION
      =============================== */

      Pagination.render({
        target: "#paginationUnit",

        page: result?.data?.page || 1,

        totalPages: result?.data?.totalPages || 1,

        onChange: (page) => {
          this.loadData(page);
        },
      });
    } catch (error) {
      console.error("UNIT LOAD ERROR:", error);

      Toast.error(error.message || "Gagal memuat data unit.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  render(rows = []) {
    Table.render({
      target: "#tableUnit",

      columns: [
        {
          title: "Penginapan",

          field: "penginapan",
        },

        {
          title: "Unit",

          field: "nama",
        },

        {
          title: "Tipe",

          field: "tipe",
        },

        {
          title: "Kapasitas",

          formatter: (row) =>
            `${row.kapasitasDewasa || 0} Dewasa • ${
              row.kapasitasAnak || 0
            } Anak`,
        },

        {
          title: "Bed",

          formatter: (row) => `${row.jumlahBed || 0} ${row.jenisBed || ""}`,
        },

        {
          title: "Status",

          className: "text-center",

          formatter: (row) => Badge.status(row.status),
        },

        {
          title: "Aksi",

          className: "text-center",

          formatter: (row) => `
            <button
              class="btn btn-outline btn-sm"
              onclick="Unit.detail('${row.id}')"
            >
              Detail
            </button>

            <button
              class="btn btn-primary btn-sm"
              onclick="Unit.edit('${row.id}')"
            >
              Edit
            </button>

            <button
              class="btn btn-danger btn-sm"
              onclick="Unit.delete('${row.id}')"
            >
              Hapus
            </button>
          `,
        },
      ],

      data: rows,
    });
  },

  /* =====================================
     CREATE
  ===================================== */

  async openForm() {
    if (typeof UnitForm === "undefined") {
      Toast.error("UnitForm belum tersedia.");

      return;
    }

    await UnitForm.openCreate();
  },

  /* =====================================
     EDIT
  ===================================== */

  async edit(id) {
    if (!id) {
      Toast.error("ID unit tidak ditemukan.");

      return;
    }

    if (typeof UnitForm === "undefined") {
      Toast.error("UnitForm belum tersedia.");

      return;
    }

    await UnitForm.openEdit(id);
  },

  /* =====================================
     DETAIL
  ===================================== */

  async detail(id) {
    if (!id) {
      Toast.error("ID unit tidak ditemukan.");

      return;
    }

    Loading.show();

    try {
      const result = await UnitService.getById(id);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal mengambil data unit.");

        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Unit",

        sections: [
          /* ===============================
             FOTO
          =============================== */

          {
            title: "Foto Unit",

            fields: [
              {
                label: "",

                value: d.fotoUrl || "",

                type: "image",

                full: true,
              },
            ],
          },

          /* ===============================
             INFORMASI
          =============================== */

          {
            title: "Informasi",

            fields: [
              {
                label: "Penginapan",

                value: d.penginapan || "-",
              },

              {
                label: "Nama Unit",

                value: d.nama || "-",
              },

              {
                label: "Tipe",

                value: d.tipe || "-",
              },

              {
                label: "Status",

                value: Badge.status(d.status),
              },
            ],
          },

          /* ===============================
             SPESIFIKASI
          =============================== */

          {
            title: "Spesifikasi",

            fields: [
              {
                label: "Kapasitas",

                value: `${d.kapasitasDewasa || 0} Dewasa • ${
                  d.kapasitasAnak || 0
                } Anak`,
              },

              {
                label: "Bed",

                value: `${d.jumlahBed || 0} ${d.jenisBed || ""}`,
              },

              {
                label: "Luas",

                value: `${d.luas || 0} m²`,
              },
            ],
          },

          /* ===============================
             INFORMASI TAMBAHAN
          =============================== */

          {
            title: "Informasi Tambahan",

            fields: [
              {
                label: "Fasilitas",

                value: d.fasilitas || "-",
              },

              {
                label: "Deskripsi",

                value: d.deskripsi || "-",

                full: true,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("UNIT DETAIL ERROR:", error);

      Toast.error(error.message || "Gagal mengambil data unit.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     DELETE
  ===================================== */

  delete(id) {
    if (!id) {
      Toast.error("ID unit tidak ditemukan.");

      return;
    }

    Confirm.open({
      title: "Hapus Unit",

      message: "Unit akan dinonaktifkan.",

      type: "danger",

      confirmText: "Hapus",

      onConfirm: async () => {
        Loading.show();

        try {
          const result = await UnitService.remove(id);

          if (!result?.success) {
            Toast.error(result?.message || "Gagal menonaktifkan unit.");

            return;
          }

          Toast.success(result.message || "Unit berhasil dinonaktifkan.");

          await this.loadData();
        } catch (error) {
          console.error("UNIT DELETE ERROR:", error);

          Toast.error(error.message || "Gagal menonaktifkan unit.");
        } finally {
          Loading.hide();
        }
      },
    });
  },
};
