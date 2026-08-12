/* =========================================
   RESERVASI STEP 3
   DATA TAMU
========================================= */

const ReservasiStep3 = {
  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `

      <div class="card">

        <div class="card-header">

          <h3>

            Data Tamu

          </h3>

          <p>

            Lengkapi informasi pemesan.

          </p>

        </div>

        <div class="card-body">

          <form
            id="formStep3"
            class="form">

            <!-- ===========================
                 DATA PEMESAN
            ============================ -->

            <div class="form-section">

              <div class="form-section-title">

                Informasi Tamu

              </div>

              <div class="form-grid">

                <div class="form-row">

                  <label class="form-label">

                    Nama Pemesan

                    <span>*</span>

                  </label>

                  <input
                    id="namaTamu"
                    type="text"
                    class="form-control">

                </div>

                <div class="form-row">

                  <label class="form-label">

                    Nomor HP

                    <span>*</span>

                  </label>

                  <input
                    id="noHp"
                    type="text"
                    class="form-control">

                </div>

                <div class="form-row">

                  <label class="form-label">

                    Email

                  </label>

                  <input
                    id="email"
                    type="email"
                    class="form-control">

                </div>

              </div>

            </div>

            <!-- ===========================
                 CATATAN
            ============================ -->

            <div class="form-section">

              <div class="form-section-title">

                Informasi Tambahan

              </div>

              <div class="form-grid">

                <div class="form-row full">

                  <label class="form-label">

                    Permintaan Khusus

                  </label>

                  <textarea
                    id="catatan"
                    rows="4"
                    class="form-control"></textarea>

                </div>

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

  init() {
    this.bindEvents();

    this.loadBooking();
  },

  /* =====================================
     LOAD BOOKING
  ===================================== */

  loadBooking() {
    Form.setData(
      {
        namaTamu: Reservasi.booking.namaTamu || "",

        noHp: Reservasi.booking.noHp || "",

        email: Reservasi.booking.email || "",

        catatan: Reservasi.booking.catatan || "",
      },
      "#formStep3",
    );
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {},

  /* =====================================
     NEXT
  ===================================== */

  next() {
    const form = Form.getData("#formStep3");

    if (!ReservasiValidator.step3(form)) {
      return;
    }

    Reservasi.booking = {
      ...Reservasi.booking,

      namaTamu: form.namaTamu,

      noHp: form.noHp,

      email: form.email,

      catatan: form.catatan,
    };

    Reservasi.goToStep(4);
  },
};
