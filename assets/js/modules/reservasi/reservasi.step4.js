/* =========================================
   RESERVASI STEP 4
   REVIEW & KONFIRMASI
========================================= */

const ReservasiStep4 = {
  /* =====================================
     STATE
  ===================================== */

  pricing: null,

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

  async init() {
    Loading.show();

    try {
      const booking = Reservasi.booking || {};

      /* ===============================
       CALCULATE PRICING
    =============================== */

      this.pricing = await BookingService.calculatePrice(booking);

      /* ===============================
       SAVE PRICING TO BOOKING
    =============================== */

      Reservasi.booking = {
        ...booking,

        subtotal: this.pricing.subtotal,

        extraPerson: this.pricing.extraPersonPrice,

        discount: this.pricing.discount,

        tax: this.pricing.tax,

        grandTotal: this.pricing.total,

        total: this.pricing.total,

        jumlahMalam: this.pricing.jumlahMalam,

        minimumStay: this.pricing.minimumStay,

        mataUang: this.pricing.mataUang,

        nights: this.pricing.nights,
      };

      this.renderSummary();
    } catch (error) {
      console.error("[STEP4] PRICING ERROR:", error);

      Toast.error(error.message || "Gagal menghitung harga reservasi.");
    } finally {
      Loading.hide();
    }
  },

  /* =====================================
     RENDER SUMMARY
  ===================================== */

  renderSummary() {
    const booking = Reservasi.booking || {};

    const pricing = this.pricing;

    const container = document.getElementById("reservationSummary");

    if (!container) {
      return;
    }

    if (!pricing) {
      container.innerHTML = `

        <div class="empty-state">

          Harga reservasi belum dapat dihitung.

        </div>

      `;

      return;
    }

    container.innerHTML = `

      <div class="card">

        <div class="card-header">

          <h3>
            Review Draft Reservasi
          </h3>

          <p>
            Pastikan seluruh informasi sudah benar
            sebelum draft reservasi dibuat.
          </p>

        </div>


        <div class="card-body">

          ${this.renderReservationSection(booking)}

          ${this.renderUnitSection(booking)}

          ${this.renderGuestSection(booking)}

          ${this.renderNightlyPriceSection(pricing)}

          ${this.renderBudgetSection(pricing)}

        </div>

      </div>

    `;
  },

  /* =====================================
     RESERVATION SECTION
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

              ${booking.penginapanNama || booking.penginapan || "-"}

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Channel
            </div>

            <div class="summary-value">

              ${booking.channelNama || booking.channel || "-"}

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

              ${booking.jumlahMalam || 0}
              Malam

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Dewasa
            </div>

            <div class="summary-value">

              ${Number(booking.dewasa) || 0}

              Orang

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Anak
            </div>

            <div class="summary-value">

              ${Number(booking.anak) || 0}

              Orang

            </div>

          </div>


        </div>

      </div>

    `;
  },

  /* =====================================
     UNIT SECTION
  ===================================== */

  renderUnitSection(booking) {
    return `

      <div class="summary-section">

        <div class="summary-section-title">
          Detail Unit
        </div>


        <div class="summary-grid">


          <div class="summary-row">

            <div class="summary-label">
              Unit
            </div>

            <div class="summary-value">

              ${booking.unitNama || booking.unit || "-"}

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Tipe Unit
            </div>

            <div class="summary-value">

              ${booking.unitTipe || booking.tipe || "-"}

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Kapasitas Unit
            </div>

            <div class="summary-value">

              ${Number(booking.kapasitasDewasa) || 0}

              Dewasa

              •

              ${Number(booking.kapasitasAnak) || 0}

              Anak

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Bed
            </div>

            <div class="summary-value">

              ${Number(booking.jumlahBed) || 0}

              ${booking.jenisBed || "-"}

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Luas
            </div>

            <div class="summary-value">

              ${booking.luas ? `${booking.luas} m²` : "-"}

            </div>

          </div>


          <div class="summary-row">

            <div class="summary-label">
              Minimal Menginap
            </div>

            <div class="summary-value">

              ${pricingMinimumStay(booking, this.pricing)}

              Malam

            </div>

          </div>


        </div>

      </div>

    `;
  },

  /* =====================================
     GUEST SECTION
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


          <div
            class="summary-row summary-full"
          >

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
     NIGHTLY PRICE
  ===================================== */

  renderNightlyPriceSection(pricing) {
    const nights = Array.isArray(pricing.nights) ? pricing.nights : [];

    if (!nights.length) {
      return "";
    }

    const rows = nights
      .map(
        (night) => `

          <div class="budget-item">

            <div>

              <strong>
                ${ReservasiHelper.formatDate(night.tanggal)}
              </strong>

              <small
                style="
                  display:block;
                  opacity:.7;
                "
              >

                ${night.hari}
                •
                ${night.jenisHarga}

              </small>

            </div>


            <strong>

              ${ReservasiHelper.formatCurrency(night.harga)}

            </strong>

          </div>

        `,
      )
      .join("");

    return `

      <div class="summary-section">

        <div class="summary-section-title">
          Rincian Harga per Malam
        </div>


        <div class="summary-section-desc">
          Harga dihitung berdasarkan musim
          yang berlaku pada setiap tanggal.
        </div>


        <div class="budget-list">

          ${rows}

        </div>

      </div>

    `;
  },

  /* =====================================
     BUDGET SECTION
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

            <span>
              Harga Unit
            </span>

            <strong>

              ${ReservasiHelper.formatCurrency(pricing.subtotal)}

            </strong>

          </div>


          <div class="budget-item">

            <span>
              Extra Person
            </span>

            <strong>

              ${ReservasiHelper.formatCurrency(pricing.extraPersonPrice || 0)}

            </strong>

          </div>


          <div class="budget-item">

            <span>
              Diskon
            </span>

            <strong class="text-success">

              -

              ${ReservasiHelper.formatCurrency(pricing.discount || 0)}

            </strong>

          </div>


          <div class="budget-item">

            <span>
              Pajak
            </span>

            <strong>

              ${ReservasiHelper.formatCurrency(pricing.tax || 0)}

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
    if (this.submitting) {
      return;
    }

    this.submitting = true;

    try {
      const booking = {
        ...Reservasi.booking,
      };

      console.log("[STEP4] SAVE BOOKING:", booking);

      /* ==============================
       VALIDASI
    ============================== */

      if (!ReservasiValidator.step4(booking)) {
        return;
      }

      /* ==============================
       SIMPAN RESERVASI
    ============================== */

      const result = await ReservasiService.save(booking);

      console.log("[STEP4] RESERVATION CREATED:", result);

      Toast.success("Reservasi berhasil dibuat.");

      /* ==============================
       SELESAI
    ============================== */

      if (typeof Reservasi.reset === "function") {
        Reservasi.reset();
      }

      Router.navigate("reservasi");
    } catch (error) {
      console.error("[STEP4] SAVE ERROR:", error);

      Toast.error(error.message || "Gagal menyimpan reservasi.");
    } finally {
      this.submitting = false;
    }
  },

  /* =====================================
     VALIDATE
  ===================================== */

  validateBooking() {
    return ReservasiValidator.step4(Reservasi.booking);
  },

  /* =====================================
     PREPARE BOOKING
  ===================================== */

  prepareBooking() {
    const booking = Reservasi.booking || {};

    const pricing = this.pricing;

    if (!pricing) {
      throw new Error("Pricing reservasi belum dihitung.");
    }

    return {
      id: booking.id || crypto.randomUUID(),

      kodeReservasi:
        booking.kodeReservasi ||
        booking.bookingCode ||
        ReservasiHelper.generateBookingCode(),

      penginapanId: booking.penginapanId || "",

      penginapan: booking.penginapanNama || booking.penginapan || "",

      unitId: booking.unitId || booking.kamarId || "",

      unit: booking.unitNama || booking.unit || "",

      unitTipe: booking.unitTipe || booking.tipe || "",

      musimId: pricing.nights?.[0]?.musimId || booking.musimId || "",

      musim: booking.musim || "",

      channel: booking.channel || "",

      channelNama: booking.channelNama || "",

      tamuId: booking.tamuId || "",

      namaTamu: booking.namaTamu || "",

      noHp: booking.noHp || "",

      email: booking.email || "",

      checkIn: booking.checkIn || "",

      checkOut: booking.checkOut || "",

      jumlahMalam: pricing.jumlahMalam || 0,

      dewasa: Number(booking.dewasa || 0),

      anak: Number(booking.anak || 0),

      kapasitasDewasa: Number(booking.kapasitasDewasa || 0),

      kapasitasAnak: Number(booking.kapasitasAnak || 0),

      roomPrice: Number(pricing.subtotal || 0),

      extraPerson: Number(pricing.extraPersonPrice || 0),

      subtotal: Number(pricing.subtotal || 0),

      diskon: Number(pricing.discount || 0),

      pajak: Number(pricing.tax || 0),

      grandTotal: Number(pricing.total || 0),

      mataUang: pricing.mataUang || "IDR",

      nights: pricing.nights || [],

      status: ReservasiStatus.DRAFT,

      paymentStatus: "UNPAID",

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),

      catatan: booking.catatan || "",
    };
  },

  /* =====================================
     SAVE BOOKING
  ===================================== */

  async saveBooking(data) {
    return await ReservasiService.save(data);
  },

  /* =====================================
     AFTER SAVE
  ===================================== */

  afterSave(result) {
    Toast.success(result.message || "Draft reservasi berhasil dibuat.");

    Reservasi.resetBooking();

    Reservasi.closeWizard();
  },
};

/* =========================================
   HELPER
========================================= */

function pricingMinimumStay(booking, pricing) {
  return pricing?.minimumStay || booking?.minimalMalam || 1;
}
