/* =========================================
   QEDEV USER FORM
========================================= */

const UserForm = {
  /* =====================================
     STATE
  ===================================== */

  state: {
    mode: "create",

    userId: null,

    data: {},

    submitting: false,
  },

  /* =====================================
     OPEN CREATE
  ===================================== */

  openCreate() {
    this.resetState();

    this.state.mode = "create";

    this.render();
  },

  /* =====================================
     RESET STATE
  ===================================== */

  resetState() {
    this.state = {
      mode: "create",

      userId: null,

      data: {},

      submitting: false,
    };
  },

  /* =====================================
     CONTAINER
  ===================================== */

  renderContainer() {
    let container = document.getElementById("userFormContainer");

    if (!container) {
      container = document.createElement("div");

      container.id = "userFormContainer";

      document.body.appendChild(container);
    }

    return container;
  },

  /* =====================================
     RENDER
  ===================================== */

  render() {
    const container = this.renderContainer();

    const isEdit = this.state.mode === "edit";

    container.innerHTML = `
      <div class="modal show">

        <div class="modal-dialog modal-md">

          <!-- HEADER -->

          <div class="modal-header">

            <div>

              <h2>
                ${isEdit ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>

              <p>
                ${
                  isEdit
                    ? "Perbarui informasi pengguna."
                    : "Tambahkan pengguna baru ke sistem."
                }
              </p>

            </div>

            <button
              type="button"
              class="modal-close"
              data-action="close"
            >
              <i data-lucide="x"></i>
            </button>

          </div>


          <!-- FORM -->

          <form
            id="formUser"
            class="modal-body"
          >

            <!-- ==========================
                 INFORMASI PENGGUNA
            =========================== -->

            <div class="form-section">

              <div class="form-section-title">
                Informasi Pengguna
              </div>

              <div class="form-grid">

                <!-- NAMA -->

                <div class="form-group">

                  <label for="userNama">
                    Nama
                  </label>

                  <input
                    id="userNama"
                    type="text"
                    name="nama"
                    class="form-control"
                    placeholder="Nama pengguna"
                    required
                  />

                </div>


                <!-- WHATSAPP -->

                <div class="form-group">

                  <label for="userWhatsapp">
                    WhatsApp
                  </label>

                  <input
                    id="userWhatsapp"
                    type="text"
                    name="whatsapp"
                    class="form-control"
                    placeholder="628xxxxxxxxxx"
                    required
                  />

                </div>


                <!-- USERNAME -->

                <div class="form-group">

                  <label for="userUsername">
                    Username
                  </label>

                  <input
                    id="userUsername"
                    type="text"
                    name="username"
                    class="form-control"
                    placeholder="Username"
                    required
                  />

                </div>


                <!-- PASSWORD -->

                <div class="form-group">

                  <label for="userPassword">
                    Password
                  </label>

                  <input
                    id="userPassword"
                    type="password"
                    name="password"
                    class="form-control"
                    placeholder="${
                      isEdit
                        ? "Kosongkan jika tidak diubah"
                        : "Password pengguna"
                    }"
                    ${isEdit ? "" : "required"}
                  />

                  ${
                    isEdit
                      ? `
                        <small class="form-help">
                          Kosongkan jika password tidak ingin diubah.
                        </small>
                      `
                      : ""
                  }

                </div>


                <!-- ROLE -->

                <div class="form-group">

                  <label for="userRole">
                    Role
                  </label>

                  <select
                    id="userRole"
                    name="role"
                    class="form-control"
                    required
                  >

                    <option value="">
                      Pilih Role
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>

                    <option value="OWNER">
                      OWNER
                    </option>

                  </select>

                </div>


                <!-- STATUS -->

                <div class="form-group">

                  <label for="userStatus">
                    Status
                  </label>

                  <select
                    id="userStatus"
                    name="status"
                    class="form-control"
                    required
                  >

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Non Aktif">
                      Non Aktif
                    </option>

                  </select>

                </div>

              </div>

            </div>


            <!-- ACTION -->

            <div class="modal-footer">

              <button
                type="button"
                class="btn btn-secondary"
                data-action="close"
              >
                Batal
              </button>

              <button
                type="submit"
                class="btn btn-primary"
                id="btnSimpanUser"
              >
                ${isEdit ? "Simpan Perubahan" : "Simpan Pengguna"}
              </button>

            </div>

          </form>

        </div>

      </div>
    `;

    this.bindEvents();

    this.fillFormData(this.state.data);

    this.refreshIcons();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const container = document.getElementById("userFormContainer");

    if (!container) {
      return;
    }

    container.querySelectorAll('[data-action="close"]').forEach((button) => {
      button.addEventListener("click", () => {
        this.close();
      });
    });

    const form = document.getElementById("formUser");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();

      this.submit();
    });
  },

  /* =====================================
     OPEN EDIT
  ===================================== */

  async openEdit(userId) {
    if (!userId) {
      Toast.error("ID pengguna tidak ditemukan.");

      return;
    }

    Loading.show();

    try {
      /* ===============================
         RESET
      =============================== */

      this.resetState();

      this.state.mode = "edit";

      this.state.userId = userId;

      /* ===============================
         GET DETAIL
      =============================== */

      const result = await UserService.getById(userId);

      console.log("USER EDIT DETAIL RESULT:", result);

      if (!result?.success) {
        throw new Error(result?.message || "Data pengguna tidak ditemukan.");
      }

      const user = result.data;

      if (!user) {
        throw new Error("Data pengguna kosong.");
      }

      /* ===============================
         SET DATA
      =============================== */

      this.state.data = {
        ...user,
      };

      /* ===============================
         RENDER FORM
      =============================== */

      this.render();

      console.log("USER EDIT READY:", this.state);
    } catch (error) {
      console.error("USER OPEN EDIT ERROR:", error);

      Toast.error(error.message || "Gagal membuka data pengguna.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     FILL FORM DATA
  ===================================== */

  fillFormData(data = {}) {
    const form = document.getElementById("formUser");

    if (!form) {
      return;
    }

    const fields = ["nama", "whatsapp", "username", "role", "status"];

    fields.forEach((field) => {
      const element = form.elements[field];

      if (!element) {
        return;
      }

      element.value = data[field] ?? "";
    });

    /*
     * Password sengaja TIDAK diisi.
     *
     * Password lama tidak pernah
     * ditampilkan ke form.
     */

    const password = form.elements["password"];

    if (password) {
      password.value = "";
    }
  },

  /* =====================================
     GET FORM DATA
  ===================================== */

  getFormData() {
    const form = document.getElementById("formUser");

    if (!form) {
      return null;
    }

    const formData = new FormData(form);

    return {
      nama: String(formData.get("nama") || "").trim(),

      whatsapp: String(formData.get("whatsapp") || "").trim(),

      username: String(formData.get("username") || "").trim(),

      password: String(formData.get("password") || ""),

      role: String(formData.get("role") || "").trim(),

      status: String(formData.get("status") || "").trim(),
    };
  },

  /* =====================================
     SUBMIT
  ===================================== */

  async submit() {
    if (this.state.submitting) {
      return;
    }

    const form = document.getElementById("formUser");

    if (!form) {
      return;
    }

    /* ===============================
       VALIDATION
    =============================== */

    if (!form.reportValidity()) {
      return;
    }

    const data = this.getFormData();

    if (!data) {
      return;
    }

    /*
     * Saat EDIT:
     * password kosong berarti
     * password lama tetap.
     *
     * Jadi jangan kirim password
     * jika kosong.
     */

    if (this.state.mode === "edit" && !data.password) {
      delete data.password;
    }

    this.state.submitting = true;

    const button = document.getElementById("btnSimpanUser");

    if (button) {
      button.disabled = true;

      button.innerHTML = `
        <span class="loading-spinner"></span>
        Menyimpan...
      `;
    }

    try {
      console.log("USER FORM DATA:", data);

      let result;

      /* ===============================
         SAVE
      =============================== */

      if (this.state.mode === "edit") {
        result = await UserService.update(this.state.userId, data);
      } else {
        result = await UserService.create(data);
      }

      console.log("USER SAVE RESULT:", result);

      if (!result?.success) {
        Toast.error(result?.message || "Gagal menyimpan pengguna.");

        return;
      }

      /* ===============================
         SUCCESS
      =============================== */

      Toast.success(result.message || "Pengguna berhasil disimpan.");

      this.close();

      /* ===============================
         REFRESH LIST
      =============================== */

      if (
        typeof Pengguna !== "undefined" &&
        typeof Pengguna.loadData === "function"
      ) {
        await Pengguna.loadData();
      }
    } catch (error) {
      console.error("USER FORM SUBMIT ERROR:", error);

      Toast.error(error.message || "Gagal menyimpan pengguna.");
    } finally {
      this.state.submitting = false;

      if (button) {
        button.disabled = false;

        button.textContent =
          this.state.mode === "edit" ? "Simpan Perubahan" : "Simpan Pengguna";
      }
    }
  },

  /* =====================================
     CLOSE
  ===================================== */

  close() {
    const container = document.getElementById("userFormContainer");

    if (container) {
      container.innerHTML = "";
    }

    this.resetState();
  },

  /* =====================================
     ESCAPE HTML
  ===================================== */

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =====================================
     ICON
  ===================================== */

  refreshIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },
};
