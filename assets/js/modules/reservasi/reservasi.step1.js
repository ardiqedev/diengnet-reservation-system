/* =========================================
   RESERVASI STEP 1
   CARI KAMAR
========================================= */

const ReservasiStep1 = {
  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `

      <div class="card">

        <div class="card-header">

          <h3>

            Cari Kamar

          </h3>

          <p>

            Tentukan tanggal menginap dan sumber reservasi.

          </p>

        </div>

        <div class="card-body">

          <form
            id="formStep1"
            class="form">

            <div class="form-grid">

              <div class="form-row">

                <label class="form-label">

                  Penginapan

                  <span>*</span>

                </label>

                <select
                  id="penginapanId"
                  class="form-control">

                  <option value="">

                    Pilih Penginapan

                  </option>

                </select>

              </div>

              <div class="form-row">

                <label class="form-label">

                  Channel

                  <span>*</span>

                </label>

                <select
                  id="channel"
                  class="form-control">

                  <option value="">

                    Pilih Channel

                  </option>

                </select>

              </div>

              <div class="form-row">

                <label class="form-label">

                  Check In

                  <span>*</span>

                </label>

                <input
                  id="checkIn"
                  type="date"
                  class="form-control">

              </div>

              <div class="form-row">

                <label class="form-label">

                  Check Out

                  <span>*</span>

                </label>

                <input
                  id="checkOut"
                  type="date"
                  class="form-control">

              </div>

              <div class="form-row">

                <label class="form-label">

                  Dewasa

                </label>

                <input
                  id="dewasa"
                  type="number"
                  min="1"
                  value="2"
                  class="form-control">

              </div>

              <div class="form-row">

                <label class="form-label">

                  Anak

                </label>

                <input
                  id="anak"
                  type="number"
                  min="0"
                  value="0"
                  class="form-control">

              </div>

            </div>

          </form>

        </div>

      </div>

    `;
  },

  /* =====================================
     INIT
  ===================================== */

  async init() {
    this.bindEvents();

    await this.loadPenginapan();

    await this.loadChannel();
  },

  /* =====================================
     LOAD PENGINAPAN
  ===================================== */

  /* =====================================
   LOAD PENGINAPAN
===================================== */

  async loadPenginapan() {
    try {
      const result = await PenginapanService.getAll({
        page: 1,
        limit: 100,
        status: "Aktif",
      });

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal memuat data penginapan.");

        return;
      }

      /* ===============================
       NORMALIZE DATA
    =============================== */

      let rows = [];

      if (Array.isArray(result.data)) {
        rows = result.data;
      } else if (result.data && Array.isArray(result.data.rows)) {
        rows = result.data.rows;
      }

      Dropdown.render({
        target: "#penginapanId",

        data: rows,

        valueField: "id",

        textField: "nama",

        placeholder: "Pilih Penginapan",
      });
    } catch (error) {
      console.error("[RESERVASI] Load penginapan error:", error);

      Toast.error("Gagal memuat data penginapan.");
    }
  },

  /* =====================================
   LOAD CHANNEL
===================================== */

  /* =====================================
   LOAD CHANNEL
===================================== */

  async loadChannel() {
    try {
      const result = await ChannelService.getAll();

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal memuat channel.");

        return;
      }

      Dropdown.render({
        target: "#channel",

        data: result.data,

        valueField: "id",

        textField: "nama",

        placeholder: "Pilih Channel",
      });
    } catch (error) {
      console.error("[RESERVASI] Load channel error:", error);

      Toast.error("Gagal memuat channel.");
    }
  },

  /* =====================================
   BIND EVENTS
===================================== */

  bindEvents() {
    // Tidak ada event khusus Step 1.
  },

  /* =====================================
   NEXT
===================================== */

  next() {
    /* ===============================
     GET FORM
  ============================== */

    const form = Form.getData("#formStep1");

    /* ===============================
     VALIDATE
  ============================== */

    if (!ReservasiValidator.step1(form)) {
      return;
    }

    /* ===============================
     GET SELECT OPTION
  ============================== */

    const penginapan = document.getElementById("penginapanId");

    const channel = document.getElementById("channel");

    /* ===============================
     SAVE BOOKING
  ============================== */

    Reservasi.booking = {
      ...Reservasi.booking,

      penginapanId: form.penginapanId,

      penginapanNama: penginapan.options[penginapan.selectedIndex].text,

      channel: form.channel,

      channelNama: channel.options[channel.selectedIndex].text,

      checkIn: form.checkIn,

      checkOut: form.checkOut,

      dewasa: Number(form.dewasa) || 1,

      anak: Number(form.anak) || 0,
    };

    /* ===============================
     NEXT STEP
  ============================== */

    Reservasi.goToStep(Reservasi.currentStep + 1);
  },
};
