/* ============================================================
   RESERVASI DETAIL VIEW
   ============================================================
   Menangani seluruh tampilan Detail Reservasi.

   Tanggung Jawab:
   - Render Header
   - Render Status
   - Render Data Tamu
   - Render Data Kamar
   - Render Informasi Menginap
   - Render Ringkasan Pembayaran
   - Render Footer

   Tidak boleh:
   - Mengakses Dummy
   - Mengakses Service
   - Business Logic
   - Validasi
   - Simpan Data
   ============================================================
 */

const ReservasiDetail = (() => {
  // ============================================================
  // PUBLIC
  // ============================================================

  function render(booking = {}) {
    return `
      ${renderHeader(booking)}

      ${renderStatus(booking)}

      ${renderGuestSection(booking)}

      ${renderRoomSection(booking)}

      ${renderStaySection(booking)}

      ${renderPaymentSection(booking)}

      ${renderFooter(booking)}
    `;
  }

  // ============================================================
  // HEADER
  // ============================================================

  function renderHeader(booking = {}) {
    return `
      <div class="page-header">

        <div>

          <h1 class="page-title">
            Detail Reservasi
          </h1>

          <p class="page-description">
            ${booking.kodeReservasi || "-"}
          </p>

        </div>

        <div class="detail-header-meta">

          <div class="detail-date">

            ${ReservasiHelper.formatDate(booking.checkIn)}

            &nbsp;•&nbsp;

            ${ReservasiHelper.formatDate(booking.checkOut)}

          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // STATUS
  // ============================================================

  function renderStatus(booking = {}) {
    const status = booking.status || "";

    const statusInfo = {
      [ReservasiStatus.DRAFT]: {
        className: "secondary",
        title: "DRAFT",
        description: "Reservasi masih berupa draft.",
      },

      [ReservasiStatus.BOOKED]: {
        className: "primary",
        title: "BOOKED",
        description: "Reservasi telah dibuat dan menunggu tamu datang.",
      },

      [ReservasiStatus.CHECK_IN]: {
        className: "success",
        title: "CHECK IN",
        description: "Tamu sedang menginap.",
      },

      [ReservasiStatus.CHECK_OUT]: {
        className: "secondary",
        title: "CHECK OUT",
        description: "Reservasi telah selesai.",
      },

      [ReservasiStatus.CANCELLED]: {
        className: "danger",
        title: "CANCELLED",
        description: "Reservasi telah dibatalkan.",
      },
    };

    const current = statusInfo[status] || {
      className: "light",
      title: status || "-",
      description: "",
    };

    return `
      <div class="detail-status ${current.className}">

        <div class="detail-status-title">
          ${current.title}
        </div>

        <div class="detail-status-description">
          ${current.description}
        </div>

      </div>
    `;
  }

  // ============================================================
  // GUEST
  // ============================================================

  function renderGuestSection(booking = {}) {
    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Data Tamu
        </div>

        <div class="summary-section-desc">
          Informasi tamu yang melakukan reservasi.
        </div>

        <div class="summary-grid">

          <div class="summary-row">

            <div class="summary-label">
              Nama Tamu
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

          <div class="summary-row">

            <div class="summary-label">
              Catatan
            </div>

            <div class="summary-value">
              ${booking.catatan || "-"}
            </div>

          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // ROOM
  // ============================================================

  function renderRoomSection(booking = {}) {
    /*
     * Contract booking saat ini:
     *
     * penginapanNama → nama penginapan
     * penginapanId   → ID penginapan
     *
     * tipeKamarId    → ID tipe kamar
     * tipeKamar      → nama tipe kamar
     *
     * kamarId        → ID unit/kamar
     * nomorKamar     → nomor unit/kamar
     *
     * Field lama:
     * penginapan
     * kamar
     *
     * tetap diberikan sebagai fallback
     * untuk kompatibilitas dummy lama.
     */

    const penginapanNama = booking.penginapanNama || booking.penginapan || "-";

    const tipeKamar = booking.tipeKamar || "-";

    const nomorKamar =
      booking.nomorKamar || booking.kamar || booking.unit || "-";

    const channel = booking.channel || "-";

    const musim = booking.musim || "-";

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Data Kamar
        </div>

        <div class="summary-section-desc">
          Informasi penginapan, kamar, dan sumber reservasi.
        </div>

        <div class="summary-grid">

          <div class="summary-row">

            <div class="summary-label">
              Penginapan
            </div>

            <div class="summary-value">
              ${penginapanNama}
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Tipe Kamar
            </div>

            <div class="summary-value">
              ${tipeKamar}
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Nomor Kamar
            </div>

            <div class="summary-value">
              ${nomorKamar}
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Channel
            </div>

            <div class="summary-value">
              ${channel}
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Musim
            </div>

            <div class="summary-value">
              ${musim}
            </div>

          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // STAY
  // ============================================================

  function renderStaySection(booking = {}) {
    const jumlahMalam =
      booking.jumlahMalam ||
      ReservasiHelper.countNight(booking.checkIn, booking.checkOut);

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Informasi Menginap
        </div>

        <div class="summary-section-desc">
          Detail jadwal menginap dan jumlah tamu.
        </div>

        <div class="summary-grid">

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
              ${jumlahMalam} Malam
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Dewasa
            </div>

            <div class="summary-value">
              ${booking.dewasa || 0} Orang
            </div>

          </div>

          <div class="summary-row">

            <div class="summary-label">
              Anak
            </div>

            <div class="summary-value">
              ${booking.anak || 0} Orang
            </div>

          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // PAYMENT
  // ============================================================

  function renderPaymentSection(booking = {}) {
    /*
     * Contract pricing saat ini:
     *
     * roomPrice
     * extraPerson
     * discount
     * tax
     * grandTotal
     *
     * Field lama tetap diberi fallback
     * agar dummy lama tidak langsung rusak.
     */

    const roomPrice = Number(booking.roomPrice || 0);

    const extraPerson = Number(booking.extraPerson || 0);

    const discount = Number(booking.discount ?? booking.diskon ?? 0);

    const tax = Number(booking.tax ?? booking.pajak ?? 0);

    const grandTotal = Number(booking.grandTotal ?? booking.total ?? 0);

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Ringkasan Pembayaran
        </div>

        <div class="summary-section-desc">
          Rincian biaya reservasi yang telah dihitung.
        </div>

        <div class="budget-list">

          <div class="budget-item">

            <span>
              Tarif Kamar
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(roomPrice)}
            </strong>

          </div>

          <div class="budget-item">

            <span>
              Extra Person
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(extraPerson)}
            </strong>

          </div>

          <div class="budget-item">

            <span>
              Diskon
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(discount)}
            </strong>

          </div>

          <div class="budget-item">

            <span>
              Pajak
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(tax)}
            </strong>

          </div>

        </div>

        <div class="budget-total">

          <div>
            Grand Total
          </div>

          <div>
            ${ReservasiHelper.formatCurrency(grandTotal)}
          </div>

        </div>

      </div>
    `;
  }

  // ============================================================
  // FOOTER
  // ============================================================

  function renderFooter(booking = {}) {
    return `
      <div class="detail-footer">

        <button
          class="btn btn-secondary"
          id="btnClose">

          Tutup

        </button>

        <button
          class="btn btn-warning"
          id="btnPayment">

          <i data-lucide="credit-card"></i>

          Pembayaran

        </button>

        <button
          class="btn btn-primary"
          id="btnInvoice">

          <i data-lucide="receipt-text"></i>

          Invoice

        </button>

        ${ReservasiAction.render(booking)}

      </div>
    `;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    render,
  };
})();
