/* =========================================
   RESERVASI STEP 2
   PILIH UNIT
========================================= */

const ReservasiStep2 = {
  rooms: [],

  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `

      <div class="card">

        <div class="card-header">

          <h3>
            Pilih Unit
          </h3>

          <p>
            Pilih unit yang tersedia sesuai pencarian.
          </p>

        </div>


        <div class="card-body">

          <div
            id="bookingSummary"
            class="booking-summary">
          </div>


          <div
            id="availableRooms"
            class="room-grid">
          </div>

        </div>

      </div>

    `;
  },

  /* =====================================
     RENDER SUMMARY
  ===================================== */

  renderSummary(totalUnit = 0) {
    const booking = Reservasi.booking;

    const container = document.getElementById("bookingSummary");

    if (!container) {
      return;
    }

    const malam = ReservasiHelper.countNight(booking.checkIn, booking.checkOut);

    container.innerHTML = `

      <div class="booking-summary-card">

        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Penginapan
          </div>

          <div class="booking-summary-value">
            ${booking.penginapanNama || "-"}
          </div>

        </div>


        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Channel
          </div>

          <div class="booking-summary-value">
            ${booking.channel || "-"}
          </div>

        </div>


        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Menginap
          </div>

          <div class="booking-summary-value">

            ${ReservasiHelper.formatDate(booking.checkIn)}

            -

            ${ReservasiHelper.formatDate(booking.checkOut)}

          </div>

        </div>


        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Lama Menginap
          </div>

          <div class="booking-summary-value">
            ${malam} Malam
          </div>

        </div>


        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Tamu
          </div>

          <div class="booking-summary-value">

            ${booking.dewasa || 0}
            Dewasa

            •

            ${booking.anak || 0}
            Anak

          </div>

        </div>


        <div class="booking-summary-item">

          <div class="booking-summary-label">
            Unit Ditemukan
          </div>

          <div class="booking-summary-value">

            ${totalUnit}
            Unit

          </div>

        </div>

      </div>

    `;
  },

  /* =====================================
     INIT
  ===================================== */

  async init() {
    Loading.show();

    try {
      const units = await this.loadRooms();

      this.renderSummary(units.length);

      this.renderRooms(units);
    } catch (err) {
      console.error("STEP 2 ERROR:", err);

      Toast.error("Gagal memuat unit.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     LOAD UNITS
  ===================================== */

  async loadRooms() {
    try {
      return await ReservasiAvailability.search(Reservasi.booking);
    } catch (err) {
      console.error(err);

      return [];
    }
  },

  /* =====================================
     RENDER UNITS
  ===================================== */

  renderRooms(units = []) {
    this.rooms = units;

    const container = document.getElementById("availableRooms");

    if (!container) {
      return;
    }

    if (!units.length) {
      container.innerHTML = `

        <div class="empty-state">

          Tidak ada unit tersedia
          untuk tanggal dan jumlah tamu
          yang dipilih.

        </div>

      `;

      return;
    }

    const html = units.map((unit) => this.renderCard(unit)).join("");

    container.innerHTML = html;

    /*
     * Jika icon menggunakan
     * Lucide.
     */

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  },

  /* =====================================
     RENDER CARD
  ===================================== */

  renderCard(unit) {
    const kapasitasDewasa = Number(unit.kapasitasDewasa) || 0;

    const kapasitasAnak = Number(unit.kapasitasAnak) || 0;

    const jumlahBed = Number(unit.jumlahBed) || 0;

    const luas = Number(unit.luas) || 0;

    const foto = unit.fotoUrl || "";

    return `

      <div class="room-card">


        <!-- =========================
             FOTO
        ========================== -->

        <div class="room-image">

          ${
            foto
              ? `

                <img
                  src="${foto}"
                  alt="${unit.nama || "Unit"}">

              `
              : `

                <div
                  class="room-image-placeholder">

                  <i
                    data-lucide="image">
                  </i>

                </div>

              `
          }

        </div>


        <!-- =========================
             BODY
        ========================== -->

        <div class="room-content">


          <!-- =======================
               HEADER
          ======================== -->

          <div class="room-header">

            <div>

              <h3
                class="room-title">

                ${unit.nama || "-"}

              </h3>


              ${
                unit.tipe
                  ? `

                    <div
                      class="room-number">

                      ${unit.tipe}

                    </div>

                  `
                  : ""
              }

            </div>


            <span
              class="badge badge-success">

              TERSEDIA

            </span>

          </div>


          <!-- =======================
               INFO
          ======================== -->

          <div class="room-info">


            <div>

              👥
              ${kapasitasDewasa}
              Dewasa

              ${
                kapasitasAnak > 0
                  ? `

                    •
                    ${kapasitasAnak}
                    Anak

                  `
                  : ""
              }

            </div>


            <div>

              🛏
              ${jumlahBed}
              ${unit.jenisBed || ""}

            </div>


            ${
              luas > 0
                ? `

                  <div>

                    📐
                    ${luas} m²

                  </div>

                `
                : ""
            }


          </div>


          <!-- =======================
               FASILITAS
          ======================== -->

          ${
            unit.fasilitas
              ? `

                <div
                  class="room-facilities">

                  ${unit.fasilitas}

                </div>

              `
              : ""
          }


          <!-- =======================
               FOOTER
          ======================== -->

          <div class="room-footer">


            <div class="room-price">

              <strong>

                Harga

              </strong>

              <small>
                akan dihitung
              </small>

            </div>


            <button
              class="btn btn-primary"
              onclick="
                ReservasiStep2.selectRoom(
                  '${unit.id}'
                )
              ">

              Pilih

            </button>


          </div>


        </div>

      </div>

    `;
  },

  /* =====================================
     SELECT UNIT
  ===================================== */

  selectRoom(unitId) {
    const unit = this.rooms.find((item) => String(item.id) === String(unitId));

    if (!unit) {
      Toast.warning("Unit tidak ditemukan.");

      return;
    }

    /*
     * Simpan data Unit
     * ke booking.
     */

    Reservasi.booking = {
      ...Reservasi.booking,

      unitId: unit.id,

      unitNama: unit.nama || "",

      unitTipe: unit.tipe || "",

      kapasitasDewasa: Number(unit.kapasitasDewasa) || 0,

      kapasitasAnak: Number(unit.kapasitasAnak) || 0,

      jumlahBed: Number(unit.jumlahBed) || 0,

      jenisBed: unit.jenisBed || "",

      luas: Number(unit.luas) || 0,

      fasilitas: unit.fasilitas || "",

      fotoUrl: unit.fotoUrl || "",

      /*
       * Harga sementara.
       * Nanti diisi oleh pricing engine.
       */

      roomPrice: Number(unit.roomPrice) || 0,
    };

    console.log("[RESERVASI] UNIT SELECTED:", unit);

    Reservasi.goToStep(3);
  },

  /* =====================================
     NEXT
  ===================================== */

  next() {
    if (!ReservasiValidator.step2(Reservasi.booking)) {
      return;
    }

    Reservasi.goToStep(3);
  },
};
