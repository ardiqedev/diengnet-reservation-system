/* =========================================
   SETTLEMENT VIEW
========================================= */

const SettlementView = (() => {
  /* =====================================
     FORMAT CURRENCY
  ===================================== */

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function renderCommissionSummary(settlement = {}) {
    const gross = Number(settlement.totalAmount || 0);
    const rate = Number(settlement.commissionRate || 0);
    const commission = Number(settlement.commissionAmount || 0);
    const net = Number(settlement.netAmount ?? gross - commission);

    return `
    <div class="settlement-payout-summary">
      <div class="settlement-payout-row">
        <span>Total Bruto</span>
        <strong>${formatCurrency(gross)}</strong>
      </div>

      <div class="settlement-payout-row">
        <span>Komisi Platform (${rate}%)</span>
        <strong>− ${formatCurrency(commission)}</strong>
      </div>

      <div class="settlement-payout-row settlement-payout-net">
        <span>Total Bersih Owner</span>
        <strong>${formatCurrency(net)}</strong>
      </div>
    </div>
  `;
  }

  /* =====================================
     FORMAT DATE
  ===================================== */

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* =====================================
     ESCAPE HTML
  ===================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =====================================
     OWNER OPTIONS
  ===================================== */

  function renderOwnerOptions(owners = [], selectedOwnerId = "") {
    if (!Array.isArray(owners)) {
      return `
        <option value="">
          Pilih Owner
        </option>
      `;
    }

    return `
      <option value="">
        Pilih Owner
      </option>

      ${owners
        .map((owner) => {
          const id = String(
            owner.id || owner.userId || owner.ownerId || "",
          ).trim();

          const name =
            owner.name || owner.nama || owner.fullName || owner.username || id;

          const selected = id === String(selectedOwnerId) ? "selected" : "";

          return `
          <option
            value="${escapeHtml(id)}"
            ${selected}
          >
            ${escapeHtml(name)}
          </option>
        `;
        })
        .join("")}
    `;
  }

  /* =====================================
     FILTER
  ===================================== */

  function renderFilter(owners = [], state = {}) {
    return `

      <div class="card settlement-filter">

       

        <div class="card-title">
            Filter Pencairan Owner
        </div>


        <div class="form-grid">

          <div class="form-group">

            <label for="settlementOwner">
              Owner
            </label>

            <select
              id="settlementOwner"
              class="form-control"
            >

              ${renderOwnerOptions(owners, state.ownerId)}

            </select>

          </div>


          <div class="form-group">

            <label for="settlementPeriodStart">
              Periode Mulai
            </label>

            <input
              type="date"
              id="settlementPeriodStart"
              class="form-control"
              value="${escapeHtml(state.periodStart || "")}"
            />

          </div>


          <div class="form-group">

            <label for="settlementPeriodEnd">
              Periode Akhir
            </label>

            <input
              type="date"
              id="settlementPeriodEnd"
              class="form-control"
              value="${escapeHtml(state.periodEnd || "")}"
            />

          </div>


          <div
            class="form-group"
            style="
              display:flex;
              align-items:flex-end;
            "
          >

            <button
              type="button"
              class="btn btn-primary"
              id="btnLoadSettlement"
            >
              Tampilkan
            </button>

          </div>

        </div>

      </div>

    `;
  }

  /* =====================================
     SUMMARY
  ===================================== */

  function renderSummary(summary = {}) {
    const totalReservation = Number(summary.totalReservation || 0);

    const totalAmount = Number(summary.totalAmount || 0);

    return `
    <div class="settlement-summary">

      <div class="settlement-summary-grid">

        <!-- RESERVASI -->
        <div class="settlement-summary-card">

          <div class="settlement-summary-icon">
            <i data-lucide="clipboard-check"></i>
          </div>

          <div class="settlement-summary-content">

            <div class="settlement-summary-label">
              Reservasi Siap Dicairkan
            </div>

            <div class="settlement-summary-value">
              ${totalReservation}
            </div>

            <div class="settlement-summary-description">
              Reservasi yang memenuhi syarat pencairan.
            </div>

          </div>

        </div>


        <!-- TOTAL PENCAIRAN -->
        <div class="settlement-summary-card">

          <div class="settlement-summary-icon">
            <i data-lucide="wallet"></i>
          </div>

          <div class="settlement-summary-content">

            <div class="settlement-summary-label">
              Total Pencairan
            </div>

            <div class="settlement-summary-value">
              ${formatCurrency(totalAmount)}
            </div>

            <div class="settlement-summary-description">
              Total pembayaran yang akan dicairkan.
            </div>

          </div>

        </div>


        <!-- PAYMENT VERIFIED -->
        <div class="settlement-summary-card">

          <div class="settlement-summary-icon">
            <i data-lucide="badge-check"></i>
          </div>

          <div class="settlement-summary-content">

            <div class="settlement-summary-label">
              Pembayaran Terverifikasi
            </div>

            <div class="settlement-summary-value">
              ${totalReservation}
            </div>

            <div class="settlement-summary-description">
              Pembayaran tamu yang sudah diverifikasi.
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
  }

  /* =====================================
     OWNER BANK INFO
  ===================================== */

  function renderOwnerBank(owner = {}) {
    if (!owner || !owner.ownerId) {
      return "";
    }

    return `

      <div class="card settlement-bank-card">

        <div class="card-title">
          Rekening Owner
        </div>


        <div class="settlement-bank-grid">

          <div>

            <span class="card-label">
              Owner
            </span>

            <strong>
              ${escapeHtml(owner.ownerName || "-")}
            </strong>

          </div>


          <div>

            <span class="card-label">
              Bank
            </span>

            <strong>
              ${escapeHtml(owner.bankName || "-")}
            </strong>

          </div>


          <div>

            <span class="card-label">
              Nomor Rekening
            </span>

            <strong>
              ${escapeHtml(owner.bankAccountNumber || "-")}
            </strong>

          </div>


          <div>

            <span class="card-label">
              Nama Rekening
            </span>

            <strong>
              ${escapeHtml(owner.bankAccountName || "-")}
            </strong>

          </div>

        </div>

      </div>

    `;
  }

  /* =====================================
     EMPTY STATE
  ===================================== */

  function renderEmpty() {
    return `

      <div class="card settlement-empty">

        <div class="empty-state">

          <div class="empty-state-icon">
            <i data-lucide="wallet-cards"></i>
          </div>

          <strong>
            Belum Ada Reservasi Eligible
          </strong>

          <p>
            Belum ada reservasi yang memenuhi
            syarat settlement pada periode ini.
          </p>

        </div>

      </div>

    `;
  }

  /* =====================================
     RESERVATION ITEM
  ===================================== */

  /* =====================================
   RESERVATION ITEM
===================================== */

  function renderReservation(item = {}, settlement = null) {
    const reservationKode = item.reservationKode || "-";

    const penginapanNama = item.penginapanNama || "-";

    const nomorKamar = item.nomorKamar || "-";

    const namaTamu = item.namaTamu || "-";

    const checkIn = formatDate(item.checkIn);

    const checkOut = formatDate(item.checkOut);

    const grandTotal = formatCurrency(item.grandTotal);

    /*
     * Tombol hanya tersedia
     * jika settlement masih DRAFT.
     */

    const settlementStatus = String(settlement?.status || "")
      .trim()
      .toUpperCase();

    const canAdd = settlement && settlement.id && settlementStatus === "DRAFT";

    const actionHtml = canAdd
      ? `
        <div class="settlement-reservation-action">

          <button
            type="button"
            class="btn btn-primary btn-add-settlement"
            data-settlement-id="${escapeHtml(settlement.id)}"
            data-reservation-id="${escapeHtml(item.reservationId || "")}"
          >
            Tambahkan
          </button>

        </div>
      `
      : "";

    return `

    <div class="settlement-reservation-card">

      <div class="settlement-reservation-main">

        <div>

          <div class="settlement-reservation-code">
            ${escapeHtml(reservationKode)}
          </div>

          <strong class="settlement-reservation-guest">
            ${escapeHtml(namaTamu)}
          </strong>

        </div>


        <strong class="settlement-reservation-amount">
          ${grandTotal}
        </strong>

      </div>


      <div class="settlement-reservation-info">

        <div>

          <span>
            Penginapan
          </span>

          <strong>
            ${escapeHtml(penginapanNama)}
          </strong>

        </div>


        <div>

          <span>
            Kamar
          </span>

          <strong>
            ${escapeHtml(nomorKamar)}
          </strong>

        </div>


        <div>

          <span>
            Check-in
          </span>

          <strong>
            ${escapeHtml(checkIn)}
          </strong>

        </div>


        <div>

          <span>
            Check-out
          </span>

          <strong>
            ${escapeHtml(checkOut)}
          </strong>

        </div>

      </div>


      ${actionHtml}

    </div>

  `;
  }

  /* =====================================
     RESERVATION LIST
  ===================================== */

  /* =====================================
   RESERVATION LIST
===================================== */

  function renderReservations(reservations = [], settlement = null) {
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return renderEmpty();
    }

    return `

    <div class="card settlement-list-card">

      <div class="card-header">

        <div>

          <div class="card-title">
            Reservasi Eligible
          </div>

          <div class="card-subtitle">
            ${reservations.length}
            reservasi siap diproses.
          </div>

        </div>

      </div>


      <div class="settlement-reservation-list">

        ${reservations
          .map((item) => renderReservation(item, settlement))
          .join("")}

      </div>

    </div>

  `;
  }

  function renderExistingSettlement(settlement = null) {
    if (!settlement) {
      return "";
    }

    const status = String(settlement.status || "DRAFT").trim();

    const statusLabel =
      {
        DRAFT: "Draft",

        READY: "Siap Dicairkan",

        SUBMITTED_TO_BANK: "Diajukan ke Bank",

        PROCESSING: "Sedang Diproses",

        PAID: "Sudah Dibayar",

        REJECTED: "Ditolak",
      }[status] || status;

    /* =================================
     PAID AUDIT
  ================================= */

    const paidAt = settlement.paidAt ? String(settlement.paidAt) : "-";

    const paidBy = settlement.paidBy ? String(settlement.paidBy) : "-";

    const bankTransferReference = settlement.bankTransferReference
      ? String(settlement.bankTransferReference)
      : "-";

    return `
    <div class="card settlement-existing">

      <div class="card-title">
        Settlement Sudah Dibuat
      </div>


      <div class="settlement-existing-body">

        <div class="settlement-existing-row">

          <span>ID Settlement</span>

          <strong>
            ${escapeHtml(settlement.id || "-")}
          </strong>

        </div>


        <div class="settlement-existing-row">

          <span>Status</span>

          <div class="settlement-existing-status">

            ${
              status === "PAID"
                ? `
                  <span class="settlement-status-badge settlement-status-paid">
                    ✓ Sudah Dibayar
                  </span>
                `
                : `
                  <strong>
                    ${escapeHtml(statusLabel)}
                  </strong>
                `
            }

          </div>

        </div>


        <div class="settlement-existing-row">

          <span>Total Reservasi</span>

          <strong>
            ${Number(settlement.totalReservation || 0)}
          </strong>

        </div>


        ${renderCommissionSummary(settlement)}

      </div>


      ${
        status === "DRAFT"
          ? `
            <div class="settlement-existing-actions">

              <button
                type="button"
                id="btnMarkSettlementReady"
                class="btn btn-primary"
              >
                Tandai Siap Dicairkan
              </button>

            </div>
          `
          : ""
      }


      ${
        status === "READY"
          ? `
            <div class="settlement-existing-actions">

              <button
                type="button"
                id="btnSubmitSettlementBank"
                class="btn btn-primary"
              >
                Ajukan ke Bank
              </button>

            </div>
          `
          : ""
      }


      ${
        status === "SUBMITTED_TO_BANK"
          ? `
            <div class="settlement-existing-actions">

              <button
                type="button"
                id="btnMarkSettlementProcessing"
                class="btn btn-primary"
              >
                Tandai Sedang Diproses
              </button>

            </div>
          `
          : ""
      }


      ${
        status === "PROCESSING"
          ? `
            <div class="settlement-existing-actions">

              <button
                type="button"
                id="btnMarkSettlementPaid"
                class="btn btn-primary"
              >
                Tandai Sudah Dibayar
              </button>

            </div>
          `
          : ""
      }


      ${
        status === "PAID"
          ? `
            <div class="settlement-paid">

              <div class="settlement-paid-header">

                <div class="settlement-paid-icon">
                  ✓
                </div>

                <div>

                  <div class="settlement-paid-title">
                    Pencairan Selesai
                  </div>

                  <div class="settlement-paid-subtitle">
                    Settlement ini sudah dibayarkan kepada owner.
                  </div>

                </div>

              </div>


              <div class="settlement-paid-info">

                <div class="settlement-paid-info-item">

                  <span>
                    Referensi Transfer
                  </span>

                  <strong>
                    ${escapeHtml(bankTransferReference)}
                  </strong>

                </div>


                <div class="settlement-paid-info-item">

                  <span>
                    Dibayar Pada
                  </span>

                  <strong>
                    ${escapeHtml(paidAt)}
                  </strong>

                </div>


                <div class="settlement-paid-info-item">

                  <span>
                    Dibayar Oleh
                  </span>

                  <strong>
                    ${escapeHtml(paidBy)}
                  </strong>

                </div>

              </div>

            </div>
          `
          : ""
      }


    </div>
  `;
  }

  /* =====================================
     CREATE ACTION
  ===================================== */

  function renderCreateAction(reservations = [], settlement = null) {
    /*
     * Settlement sudah pernah dibuat
     * untuk owner + periode tersebut.
     */
    if (settlement) {
      return "";
    }

    /*
     * Tidak ada reservasi eligible.
     */
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return "";
    }

    return `
    <div class="settlement-action-bar">

      <div>
        <strong>${reservations.length} reservasi</strong>

        <span>
          siap dibuat menjadi settlement.
        </span>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        id="btnCreateSettlement"
      >
        Buat Settlement
      </button>

    </div>
  `;
  }

  /* =====================================
     CREATED SETTLEMENT
  ===================================== */

  function renderCreatedSettlement(settlement = {}) {
    if (!settlement || !settlement.id) {
      return "";
    }

    const status = String(settlement.status || "DRAFT")
      .trim()
      .toUpperCase();

    const statusLabel =
      {
        DRAFT: "Draft",
        READY: "Siap Dicairkan",
        SUBMITTED_TO_BANK: "Diajukan ke Bank",
        PROCESSING: "Sedang Diproses",
        PAID: "Sudah Dibayar",
        REJECTED: "Ditolak",
      }[status] || status;

    return `
      <div class="card settlement-created-card">

        <div class="card-header">

          <div>
            <div class="card-title">
              Pencairan Berhasil Dibuat
            </div>

            <div class="card-subtitle">
              Pencairan owner berhasil dibuat dan menunggu proses berikutnya.
            </div>
          </div>

          <span class="settlement-status-badge">
            ${escapeHtml(statusLabel)}
          </span>

        </div>


        <div class="settlement-created-grid">

          <div>
            <span class="card-label">
              ID Pencairan
            </span>

            <strong>
              ${escapeHtml(settlement.id)}
            </strong>
          </div>


          <div>
            <span class="card-label">
              Owner
            </span>

            <strong>
              ${escapeHtml(settlement.ownerName || "-")}
            </strong>
          </div>


          <div>
            <span class="card-label">
              Periode
            </span>

            <strong>
              ${escapeHtml(settlement.periodStart || "-")}
              →
              ${escapeHtml(settlement.periodEnd || "-")}
            </strong>
          </div>


          <div>
            <span class="card-label">
              Reservasi
            </span>

            <strong>
              ${Number(settlement.totalReservation || 0)}
            </strong>
          </div>


          ${renderCommissionSummary(settlement)}


          <div>
            <span class="card-label">
              Status
            </span>

            <strong>
              ${escapeHtml(statusLabel)}
            </strong>
          </div>

        </div>

      </div>
    `;
  }

  /* =====================================
     PAGE
  ===================================== */
  function render({
    owners = [],
    owner = {},
    summary = {},
    reservations = [],
    settlement = null,
    settlementDetails = [],
    state = {},
  } = {}) {
    return `

    <div class="settlement-page">

      <div class="page-header">

        <div>

          <h1>
            Pencairan Owner
          </h1>

          <p>
            Kelola pencairan pembayaran kepada owner.
          </p>

        </div>

      </div>


      ${renderFilter(owners, state)}


      ${renderOwnerBank(owner)}


      ${renderSummary(summary)}


      ${renderReservations(reservations)}


      ${renderExistingSettlement(settlement)}


      ${renderSettlementDetails(settlementDetails, settlement)}


      ${renderCreateAction(reservations, settlement)}

    </div>

  `;
  }

  /* =====================================
   SETTLEMENT DETAIL
===================================== */

  function renderSettlementDetails(settlementDetails = [], settlement = null) {
    if (!settlement || !settlement.id) {
      return "";
    }

    if (!Array.isArray(settlementDetails) || settlementDetails.length === 0) {
      return `
      <div class="card settlement-detail-card">

        <div class="card-header">

          <div>
            <div class="card-title">
              Reservation Dalam Settlement
            </div>

            <div class="card-subtitle">
              Belum ada reservation yang masuk ke settlement ini.
            </div>
          </div>

        </div>

      </div>
    `;
    }

    return `
    <div class="card settlement-detail-card">

      <div class="card-header">

        <div>
          <div class="card-title">
            Reservation Dalam Settlement
          </div>

          <div class="card-subtitle">
            ${settlementDetails.length}
            reservation sudah masuk ke pencairan ini.
          </div>
        </div>

      </div>


      <div class="settlement-detail-list">

        ${settlementDetails
          .map((detail, index) => {
            const reservationKode =
              detail.reservationKode || detail.reservationId || "-";

            const namaTamu = detail.namaTamu || "-";

            const penginapanNama = detail.penginapanNama || "-";

            const nomorKamar = detail.nomorKamar || "-";

            const checkIn = detail.checkIn || "-";

            const checkOut = detail.checkOut || "-";

            const grandTotal = Number(detail.grandTotal || 0);

            return `
              <div class="settlement-detail-item">

                <div class="settlement-detail-main">

                  <div class="settlement-detail-number">
                    ${index + 1}
                  </div>

                  <div class="settlement-detail-content">

                    <div class="settlement-detail-code">
                      ${escapeHtml(reservationKode)}
                    </div>

                    <div class="settlement-detail-guest">
                      ${escapeHtml(namaTamu)}
                    </div>

                    <div class="settlement-detail-meta">

                      <span>
                        ${escapeHtml(penginapanNama)}
                      </span>

                      <span>
                        Kamar ${escapeHtml(nomorKamar)}
                      </span>

                    </div>

                  </div>

                  <div class="settlement-detail-amount">

                    ${formatCurrency(grandTotal)}

                  </div>

                </div>


                <div class="settlement-detail-info">

                  <div>
                    <span>Check-in</span>
                    <strong>
                      ${escapeHtml(checkIn)}
                    </strong>
                  </div>

                  <div>
                    <span>Check-out</span>
                    <strong>
                      ${escapeHtml(checkOut)}
                    </strong>
                  </div>

                  <div>
                    <span>Payment ID</span>
                    <strong>
                      ${escapeHtml(detail.paymentId || "-")}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      ${formatCurrency(detail.paymentAmount || 0)}
                    </strong>
                  </div>

                </div>

              </div>
            `;
          })
          .join("")}

      </div>


      <div class="settlement-detail-total">

        <span>
          Total ${settlementDetails.length} Reservation
        </span>

        <strong>
          ${formatCurrency(settlement.totalAmount || 0)}
        </strong>

      </div>

    </div>
  `;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    render,

    renderFilter,

    renderSummary,

    renderOwnerBank,

    renderReservations,

    renderReservation,

    renderCreateAction,

    renderCreatedSettlement,
  };
})();
