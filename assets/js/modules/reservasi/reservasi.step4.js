/* =========================================
   RESERVASI STEP 4
   REVIEW & KONFIRMASI
========================================= */

const ReservasiStep4 = {
  /* =====================================
     RENDER
  ===================================== */

  render() {
    return `

      <div class="wizard-summary">

        <div id="reservationSummary"></div>

      </div>

    `;
  },

  /* =====================================
     INIT
  ===================================== */

  init() {
    this.renderSummary();
  },

  /* =====================================
     RENDER SUMMARY
  ===================================== */

  /* =====================================
   RENDER SUMMARY
===================================== */
  renderSummary() {
    const booking = Reservasi.booking;

    const pricing = ReservasiPricing.calculate(booking);

    const container = document.getElementById("reservationSummary");

    if (!container) return;

    container.innerHTML = `

        <div class="card">

            <div class="card-header">

                <h3>Review Draft Reservasi</h3>

                    <p>
                        Pastikan seluruh informasi sudah benar sebelum draft reservasi dibuat.
                    </p>

            </div>

            <div class="card-body">

                ${this.renderReservationSection(booking)}

                ${this.renderRoomSection(booking)}
                ${this.renderGuestSection(booking)}
                ${this.renderBudgetSection(pricing)}

            </div>

        </div>

    `;
  },

  /* =====================================
   RENDER RESERVATION CARD
===================================== */
  renderReservationSection(booking) {
    return `

    <div class="summary-section">

        <div class="summary-section-title">

            Detail Reservasi

        </div>

        <div class="summary-grid">

            <div class="summary-row">

                <div class="summary-label">

                    Penginapan

                </div>

                <div class="summary-value">

                    ${booking.penginapanNama || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Nomor Kamar

                </div>

                <div class="summary-value">

                    ${booking.nomorKamar || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Tipe Kamar

                </div>

                <div class="summary-value">

                    ${booking.tipeKamar || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Check In

                </div>

                <div class="summary-value">

                    ${ReservasiHelper.formatDate(booking.checkIn)}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Check Out

                </div>

                <div class="summary-value">

                    ${ReservasiHelper.formatDate(booking.checkOut)}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Jumlah Malam

                </div>

                <div class="summary-value">

                    ${ReservasiHelper.countNight(
                      booking.checkIn,
                      booking.checkOut,
                    )} Malam

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Nama Pemesan

                </div>

                <div class="summary-value">

                    ${booking.namaTamu || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    No HP

                </div>

                <div class="summary-value">

                    ${booking.noHp || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Channel

                </div>

                <div class="summary-value">

                    ${booking.channelNama || "-"}

                </div>

            </div>

        </div>

    </div>

  `;
  },

  /* =====================================
   RENDER ROOM CARD
===================================== */

  renderRoomSection(booking) {
    return `

    <div class="summary-section">

        <div class="summary-section-title">

            Detail Kamar

        </div>

        <div class="summary-grid">

            <div class="summary-row">

                <div class="summary-label">

                    Nomor Kamar

                </div>

                <div class="summary-value">

                    ${booking.nomorKamar || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Tipe Kamar

                </div>

                <div class="summary-value">

                    ${booking.tipeKamar || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Kapasitas

                </div>

                <div class="summary-value">

                    ${booking.dewasa || 0} Dewasa
                    •
                    ${booking.anak || 0} Anak

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Harga / Malam

                </div>

                <div class="summary-value">

                    ${ReservasiHelper.formatCurrency(booking.roomPrice || 0)}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Extra Person

                </div>

                <div class="summary-value">

                    ${ReservasiHelper.formatCurrency(booking.extraPerson || 0)}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Minimal Menginap

                </div>

                <div class="summary-value">

                    ${booking.minimalMalam || 1} Malam

                </div>

            </div>

        </div>

    </div>

  `;
  },

  /* =====================================
   RENDER GUEST CARD
===================================== */

  /* =====================================
   RENDER GUEST CARD
===================================== */

  renderGuestSection(booking) {
    return `

    <div class="summary-section">

        <div class="summary-section-title">

            Data Tamu

        </div>

        <div class="summary-grid">

            <div class="summary-row">

                <div class="summary-label">

                    Nama Pemesan

                </div>

                <div class="summary-value">

                    ${booking.namaTamu || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Nomor HP

                </div>

                <div class="summary-value">

                    ${booking.noHp || "-"}

                </div>

            </div>

            <div class="summary-row">

                <div class="summary-label">

                    Email

                </div>

                <div class="summary-value">

                    ${booking.email || "-"}

                </div>

            </div>

            <div class="summary-row summary-full">

                <div class="summary-label">

                    Permintaan Khusus

                </div>

                <div class="summary-value">

                    ${booking.catatan || "-"}

                </div>

            </div>

        </div>

    </div>

  `;
  },

  /* =====================================
   RENDER BUDGET SECTION
===================================== */

  renderBudgetSection(pricing) {
    return `

    <div class="summary-section">

      <div class="summary-section-title">

        Ringkasan Biaya

      </div>

      <div class="summary-section-desc">

        Ringkasan biaya reservasi.

      </div>

      <div class="budget-list">

        <div class="budget-item">

          <span>Harga Kamar</span>

          <strong>

            ${ReservasiHelper.formatCurrency(pricing.roomPrice)}

          </strong>

        </div>

        <div class="budget-item">

          <span>Extra Person</span>

          <strong>

            ${ReservasiHelper.formatCurrency(pricing.extraPerson)}

          </strong>

        </div>

        <div class="budget-item">

          <span>Diskon</span>

          <strong class="text-success">

            - ${ReservasiHelper.formatCurrency(pricing.discount)}

          </strong>

        </div>

        <div class="budget-item">

          <span>Pajak</span>

          <strong>

            ${ReservasiHelper.formatCurrency(pricing.tax)}

          </strong>

        </div>

      </div>

      <div class="budget-total">

        <div>

          Grand Total

        </div>

        <div>

          ${ReservasiHelper.formatCurrency(pricing.total)}

        </div>

      </div>

    </div>

  `;
  },

  /* =====================================
     SAVE
  ===================================== */
  async save() {
    if (!this.validateBooking()) return;

    const booking = this.prepareBooking();

    const result = await this.saveBooking(booking);

    if (!result.success) return;

    this.afterSave(result);
  },

  validateBooking() {
    return ReservasiValidator.step4(Reservasi.booking);
  },

  prepareBooking() {
    const booking = Reservasi.booking;

    const pricing = ReservasiPricing.calculate(booking);

    return {
      id: crypto.randomUUID(),

      bookingCode: ReservasiHelper.generateBookingCode(),

      status: "DRAFT",

      paymentStatus: "UNPAID",

      createdAt: new Date(),

      updatedAt: new Date(),

      ...booking,

      ...pricing,
    };
  },
  async saveBooking(data) {
    return await ReservasiService.save(data);
  },

  afterSave(result) {
    Toast.success("Draft reservasi berhasil dibuat.");

    Reservasi.resetBooking();

    Reservasi.closeWizard();
  },
};
