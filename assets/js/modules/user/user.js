/* =========================================
   USER MODULE
========================================= */

const Pengguna = {
  keyword: "",

  /* =====================================
     INIT
  ===================================== */

  init() {
    console.log("Pengguna Module Loaded");

    this.bindEvents();

    this.loadData();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    Search.init({
      input: "#searchUser",

      delay: 400,

      onSearch: (keyword) => {
        this.keyword = keyword;

        this.updateSearchClear();

        this.loadData(1, false);
      },
    });

    const clearButton = document.querySelector("#clearSearchUser");

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const input = document.querySelector("#searchUser");

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
    const input = document.querySelector("#searchUser");

    const clearButton = document.querySelector("#clearSearchUser");

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
      const result = await UserService.getAll({
        page,
        limit: 10,
        keyword: this.keyword || "",
      });

      console.log("USER RESULT :", result);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal mengambil data pengguna.");

        return;
      }

      this.render(result?.data?.rows || []);

      Pagination.render({
        target: "#paginationUser",

        page: result?.data?.page || 1,

        totalPages: result?.data?.totalPages || 1,

        onChange: (page) => {
          this.loadData(page);
        },
      });
    } catch (error) {
      console.error("USER LOAD ERROR:", error);

      Toast.error(error.message || "Gagal memuat data pengguna.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     RENDER TABLE
  ===================================== */

  render(rows = []) {
    Table.render({
      target: "#tableUser",

      columns: [
        {
          title: "Nama",
          field: "nama",
        },

        {
          title: "WhatsApp",
          field: "whatsapp",
        },

        {
          title: "Username",
          field: "username",
        },

        {
          title: "Role",
          field: "role",
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
            onclick="Pengguna.detail('${row.id}')"
          >
            Detail
          </button>

          <button
            class="btn btn-primary btn-sm"
            onclick="Pengguna.edit('${row.id}')"
          >
            Edit
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

  openForm() {
    if (typeof UserForm === "undefined") {
      Toast.error("UserForm belum tersedia.");

      return;
    }

    UserForm.openCreate();
  },

  /* =====================================
     EDIT
  ===================================== */

  async edit(id) {
    if (!id) {
      Toast.error("ID pengguna tidak ditemukan.");

      return;
    }

    if (typeof UserForm === "undefined") {
      Toast.error("UserForm belum tersedia.");

      return;
    }

    await UserForm.openEdit(id);
  },

  /* =====================================
   DETAIL
===================================== */

  async detail(id) {
    if (!id) {
      Toast.error("ID pengguna tidak ditemukan.");

      return;
    }

    Loading.show();

    try {
      const result = await UserService.getById(id);

      console.log("USER DETAIL RESULT :", result);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal mengambil detail pengguna.");

        return;
      }

      const d = result.data;

      Detail.open({
        title: "Detail Pengguna",

        sections: [
          /* ===============================
           INFORMASI PENGGUNA
        =============================== */

          {
            title: "Informasi Pengguna",

            fields: [
              {
                label: "Nama",

                value: d.nama || "-",
              },

              {
                label: "WhatsApp",

                value: d.whatsapp || "-",
              },

              {
                label: "Username",

                value: d.username || "-",
              },

              {
                label: "Role",

                value: d.role || "-",
              },

              {
                label: "Status",

                value: Badge.status(d.status),
              },
            ],
          },

          /* ===============================
           INFORMASI SISTEM
        =============================== */

          {
            title: "Informasi Sistem",

            fields: [
              {
                label: "ID Pengguna",

                value: d.id || "-",
              },

              {
                label: "Dibuat",

                value: d.createdAt || "-",
              },

              {
                label: "Diperbarui",

                value: d.updatedAt || "-",
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("USER DETAIL ERROR:", error);

      Toast.error(error.message || "Gagal mengambil detail pengguna.");
    } finally {
      Loading.hide();
    }
  },
};
