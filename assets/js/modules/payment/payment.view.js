/* =========================================
   PAYMENT VIEW
========================================= */

const PaymentView = (() => {
  /* =====================================
     PAYMENT STATUS
  ===================================== */

  function getPaymentStatus(payments = []) {
    if (!payments.length) {
      return "UNPAID";
    }

    const hasPending = payments.some(
      (payment) => payment.status === PaymentTransactionStatus.PENDING,
    );

    if (hasPending) {
      return "PENDING";
    }

    const hasVerified = payments.some(
      (payment) => payment.status === PaymentTransactionStatus.VERIFIED,
    );

    if (hasVerified) {
      return "VERIFIED";
    }

    const hasRejected = payments.some(
      (payment) => payment.status === PaymentTransactionStatus.REJECTED,
    );

    if (hasRejected) {
      return "REJECTED";
    }

    return "UNPAID";
  }

  /* =====================================
     STATUS CARD
  ===================================== */

  function renderStatus(booking = {}, payments = []) {
    const status = getPaymentStatus(payments);

    let badge = "🔴";
    let title = "BELUM BAYAR";
    let description = "Belum ada pembayaran.";

    switch (status) {
      case "PENDING":
        badge = "🟡";
        title = "MENUNGGU VERIFIKASI";
        description =
          "Pembayaran telah dikirim dan sedang menunggu verifikasi.";
        break;

      case "VERIFIED":
        badge = "🟢";
        title = "PEMBAYARAN TERVERIFIKASI";
        description = "Pembayaran telah diverifikasi.";
        break;

      case "REJECTED":
        badge = "🔴";
        title = "PEMBAYARAN DITOLAK";
        description = "Pembayaran terakhir ditolak.";
        break;

      case "UNPAID":
      default:
        badge = "🔴";
        title = "BELUM BAYAR";
        description = "Belum ada pembayaran.";
        break;
    }

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Status Pembayaran
        </div>

        <div class="budget-total">

          <div>

            <strong>
              ${badge} ${title}
            </strong>

            <br>

            <small>
              ${description}
            </small>

          </div>

        </div>

      </div>
    `;
  }

  /* =====================================
     RENDER
  ===================================== */

  function render(booking = {}, payments = []) {
    return `
      ${renderStatus(booking, payments)}

      ${renderSummary(booking, payments)}

      ${renderHistory(payments)}

      ${renderFooter(booking, payments)}
    `;
  }

  /* =====================================
     SUMMARY
  ===================================== */

  function renderSummary(booking = {}, payments = []) {
    /*
     * Hanya pembayaran VERIFIED
     * yang dihitung sebagai uang masuk.
     */

    const totalPaid = PaymentHelper.getTotalPaid(payments);

    const remaining = PaymentHelper.getRemaining(booking.grandTotal, payments);

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Ringkasan Pembayaran
        </div>

        <div class="budget-list">

          <div class="budget-item">

            <span>
              Grand Total
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(booking.grandTotal || 0)}
            </strong>

          </div>

          <div class="budget-item">

            <span>
              Total Dibayar
            </span>

            <strong>
              ${ReservasiHelper.formatCurrency(totalPaid)}
            </strong>

          </div>

          <div class="budget-total">

            <div>
              Sisa Pembayaran
            </div>

            <div>
              ${ReservasiHelper.formatCurrency(remaining)}
            </div>

          </div>

        </div>

      </div>
    `;
  }

  /* =====================================
     HISTORY
  ===================================== */

  function renderHistory(payments = []) {
    if (!payments.length) {
      return `
        <div class="summary-section">

          <div class="summary-section-title">
            Riwayat Pembayaran
          </div>

          <p>
            Belum ada pembayaran.
          </p>

        </div>
      `;
    }

    return `
      <div class="summary-section">

        <div class="summary-section-title">
          Riwayat Pembayaran
        </div>

        <div class="budget-list">

          ${payments.map(renderItem).join("")}

        </div>

      </div>
    `;
  }

  /* =====================================
     PAYMENT ITEM
  ===================================== */

  function renderItem(item = {}) {
    const status = PaymentHelper.getTransactionStatus(item);

    const isPending = item.status === PaymentTransactionStatus.PENDING;

    const isVerified = item.status === PaymentTransactionStatus.VERIFIED;

    const isRejected = item.status === PaymentTransactionStatus.REJECTED;

    return `
      <div class="budget-item">

        <div>

          <strong>
            ${status.label}
          </strong>

          <br>

          <small>
            ${item.paymentMethod || "-"}
            •
            ${ReservasiHelper.formatDate(item.paymentDate)}
          </small>

          ${
            item.paymentReference
              ? `
                <br>

                <small>
                  Ref: ${item.paymentReference}
                </small>
              `
              : ""
          }

          ${
            isPending
              ? `
                <div
                  style="
                    margin-top: 10px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                  "
                >

                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    data-action="verify-payment"
                    data-payment-id="${item.id}"
                  >
                    Verifikasi Pembayaran
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline btn-sm"
                    data-action="reject-payment"
                    data-payment-id="${item.id}"
                  >
                    Tolak
                  </button>

                </div>
              `
              : ""
          }

          ${
            isVerified
              ? `
                <br>

                <small class="text-success">
                  Pembayaran telah diverifikasi.
                </small>
              `
              : ""
          }

          ${
            isRejected
              ? `
                <br>

                <small class="text-danger">
                  Pembayaran ditolak.
                </small>
              `
              : ""
          }

        </div>

        <strong>
          ${ReservasiHelper.formatCurrency(item.paymentAmount || 0)}
        </strong>

      </div>
    `;
  }

  /* =====================================
     FOOTER
  ===================================== */

  function renderFooter(booking = {}, payments = []) {
    const totalPaid = PaymentHelper.getTotalPaid(payments);

    const remaining = PaymentHelper.getRemaining(booking.grandTotal, payments);

    const hasPending = payments.some(
      (payment) => payment.status === PaymentTransactionStatus.PENDING,
    );

    /*
     * Masih ada pembayaran menunggu verifikasi.
     */

    if (hasPending) {
      return `
        <div class="wizard-footer">

          <div>
            <strong>
              Pembayaran sedang menunggu verifikasi.
            </strong>

            <br>

            <small>
              Total yang belum terverifikasi tidak
              dihitung sebagai pembayaran.
            </small>
          </div>

        </div>
      `;
    }

    /*
     * Sudah lunas berdasarkan pembayaran VERIFIED.
     */

    if (remaining <= 0 && totalPaid > 0) {
      return `
        <div class="wizard-footer">

          <div class="text-success">
            Pembayaran telah lunas.
          </div>

        </div>
      `;
    }

    /*
     * Belum lunas dan tidak ada
     * transaksi pending.
     */

    return `
      <div class="wizard-footer">

        <button
          class="btn btn-primary"
          id="btnAddPayment"
        >
          Bayar Sekarang
        </button>

      </div>
    `;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    render,
    renderStatus,
    renderSummary,
    renderHistory,
    renderFooter,
  };
})();
