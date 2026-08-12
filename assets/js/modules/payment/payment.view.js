/* =========================================
   PAYMENT VIEW
========================================= */

const PaymentView = (() => {
  /* =====================================
   STATUS
===================================== */

  function renderStatus(booking = {}, payments = []) {
    const totalPaid = PaymentHelper.getTotalPaid(payments);

    const remaining = PaymentHelper.getRemaining(booking.grandTotal, payments);

    let badge = "🔴";
    let title = "BELUM BAYAR";
    let description = "Belum ada pembayaran.";

    if (totalPaid > 0 && remaining > 0) {
      badge = "🟡";
      title = "DP";
      description = "Pembayaran sebagian.";
    }

    if (remaining === 0 && totalPaid > 0) {
      badge = "🟢";
      title = "LUNAS";
      description = "Pembayaran telah selesai.";
    }

    return `

        <div class="summary-section">

            <div class="summary-section-title">

                Status Pembayaran

            </div>

            <div class="budget-total">

                <div>

                    <strong>${badge} ${title}</strong>

                    <br>

                    <small>${description}</small>

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

    ${renderFooter()}

    `;
  }

  /* =====================================
       SUMMARY
    ===================================== */

  function renderSummary(booking = {}, payments = []) {
    const totalPaid = payments.reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );

    const remaining = Math.max(0, Number(booking.grandTotal || 0) - totalPaid);

    return `

            <div class="summary-section">

                <div class="summary-section-title">

                    Ringkasan Pembayaran

                </div>

                <div class="budget-list">

                    <div class="budget-item">

                        <span>Grand Total</span>

                        <strong>

                            ${ReservasiHelper.formatCurrency(booking.grandTotal || 0)}

                        </strong>

                    </div>

                    <div class="budget-item">

                        <span>Total Dibayar</span>

                        <strong>

                            ${ReservasiHelper.formatCurrency(totalPaid)}

                        </strong>

                    </div>

                    <div class="budget-total">

                        <div>Sisa Pembayaran</div>

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
       ITEM
    ===================================== */

  function renderItem(item = {}) {
    return `

            <div class="budget-item">

                <div>

                    <strong>${item.status}</strong>

                    <br>

                    <small>

                        ${item.method}

                        •

                        ${ReservasiHelper.formatDate(item.paymentDate)}

                    </small>

                </div>

                <strong>

                    ${ReservasiHelper.formatCurrency(item.amount)}

                </strong>

            </div>

        `;
  }

  /* =====================================
       FOOTER
    ===================================== */

  function renderFooter() {
    return `

            <div class="wizard-footer">

                <button
                    class="btn btn-primary"
                    id="btnAddPayment">

                    Tambah Pembayaran

                </button>

            </div>

        `;
  }

  /* =====================================
       PUBLIC API
    ===================================== */

  return {
    render,
  };
})();
