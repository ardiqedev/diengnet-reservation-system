/* =========================================
   RESERVASI STEP 2
   PILIH KAMAR
========================================= */

const ReservasiStep2 = {
  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `

      <div class="card">

        <div class="card-header">

          <h3>

            Pilih Kamar

          </h3>

          <p>

            Pilih kamar yang tersedia sesuai pencarian.

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

  renderSummary(totalRoom = 0) {
    const booking = Reservasi.booking;

    const container = document.getElementById("bookingSummary");

    if (!container) return;

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

            ${booking.dewasa} Dewasa

            •

            ${booking.anak} Anak

        </div>

    </div>

    <div class="booking-summary-item">

        <div class="booking-summary-label">

            Kamar Ditemukan

        </div>

        <div class="booking-summary-value">

            ${totalRoom} Kamar

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
      const rooms = await this.loadRooms();
      this.renderSummary(rooms.length);

      this.renderRooms(rooms);
    } catch (err) {
      console.error(err);

      Toast.error("Gagal memuat kamar.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
   LOAD ROOMS
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
     RENDER ROOM
  ===================================== */

  renderRooms(rooms = []) {
    this.rooms = rooms;
    const container = document.getElementById("availableRooms");

    if (!container) return;

    if (!rooms.length) {
      container.innerHTML = `

            <div class="empty-state">

                Tidak ada kamar tersedia.

            </div>

        `;

      return;
    }

    const html = rooms.map((room) => this.renderCard(room)).join("");

    container.innerHTML = html;
  },

  /* =====================================
   RENDER CARD
===================================== */

  renderCard(room) {
    return `

    <div class="room-card">

      <!-- ===========================
           FOTO
      ============================ -->

      <div class="room-image">

        ${
          room.foto
            ? `<img src="${room.foto}" alt="${room.tipeKamar}">`
            : `
              <div class="room-image-placeholder">

                <i data-lucide="image"></i>

              </div>
            `
        }

      </div>

      <!-- ===========================
           BODY
      ============================ -->

      <div class="room-content">

        <div class="room-header">

          <div>

            <h3 class="room-title">

              ${room.tipeKamar}

            </h3>

            <div class="room-number">

              ${room.nomor}

            </div>

          </div>

          <span class="badge ${ReservasiHelper.getBadgeClass(room.badge)}">

                ${room.badge}

            </span>

        </div>

        <!-- =======================
             INFO
        ======================== -->

        <div class="room-info">

          <div>

            👥 ${room.kapasitasDewasa} Dewasa

            ${room.kapasitasAnak ? `• ${room.kapasitasAnak} Anak` : ""}

          </div>

          <div>

            🛏 ${room.bed}

          </div>

          <div>

            🌙 Minimal ${room.minimalMalam} malam

          </div>

        </div>

        <!-- =======================
             FOOTER
        ======================== -->

        <div class="room-footer">

          <div class="room-price">

            ${ReservasiHelper.formatCurrency(room.roomPrice)}

            <small>/ malam</small>

        </div>
          

          <button
              class="btn btn-primary"
              onclick="ReservasiStep2.selectRoom('${room.id}')">

              Pilih

          </button>

        </div>

      </div>

    </div>

  `;
  },

  /* =====================================
   SELECT ROOM
===================================== */

  selectRoom(roomId) {
    const room = this.rooms.find((x) => x.id === roomId);

    if (!room) return;

    Reservasi.booking = {
      ...Reservasi.booking,

      kamarId: room.id,

      nomorKamar: room.nomor,

      tipeKamarId: room.tipeKamarId,

      tipeKamar: room.tipeKamar,

      roomPrice: room.roomPrice,

      extraPerson: room.extraPerson,

      minimalMalam: room.minimalMalam,
    };

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
