/* =========================================
   PAYMENT FORM
========================================= */

const PaymentForm = (() => {
  /* =====================================
     RENDER
  ===================================== */

  function render(reservation = {}) {
    const today = new Date().toISOString().split("T")[0];

    const grandTotal = Number(reservation.grandTotal || 0);

    const formattedTotal = ReservasiHelper.formatCurrency(grandTotal);

    return `

      <form
        id="paymentForm"
        class="form">

        <!-- =================================
             RESERVATION SUMMARY
        ================================== -->

        <div class="summary-section">

          <div class="summary-section-title">
            Ringkasan Reservasi
          </div>

          <div class="budget-list">

            <div class="budget-item">

              <span>
                Kode Reservasi
              </span>

              <strong>
                ${reservation.kodeReservasi || "-"}
              </strong>

            </div>

            <div class="budget-item">

              <span>
                Tamu
              </span>

              <strong>
                ${reservation.namaTamu || "-"}
              </strong>

            </div>

            <div class="budget-total">

              <div>
                Total Reservasi
              </div>

              <strong>
                ${formattedTotal}
              </strong>

            </div>

          </div>

        </div>


        <!-- =================================
             PAYMENT DATE
        ================================== -->

        <div class="form-group">

          <label class="form-label">
            Tanggal Pembayaran
          </label>

          <input
            type="date"
            id="paymentDate"
            class="form-control"
            value="${today}">

        </div>


        <!-- =================================
             PAYMENT METHOD
        ================================== -->

        <div class="form-group">

          <label class="form-label">
            Metode Pembayaran
          </label>

          <select
            id="paymentMethod"
            class="form-control">

            <option value="${PaymentMethod.CASH}">
              Cash
            </option>

            <option value="${PaymentMethod.TRANSFER}">
              Transfer
            </option>

            <option value="${PaymentMethod.QRIS}">
              QRIS
            </option>

            <option value="${PaymentMethod.CREDIT_CARD}">
              Credit Card
            </option>

          </select>

        </div>


        <!-- =================================
             PAYMENT AMOUNT
        ================================== -->

        <div class="form-group">

          <label class="form-label">
            Nominal Pembayaran
          </label>

          <input
            type="number"
            id="paymentAmount"
            class="form-control"
            value="${grandTotal}"
            readonly>

          <small class="form-help">
            Pembayaran wajib dilakukan secara penuh.
          </small>

        </div>


        <!-- =================================
             REFERENCE
        ================================== -->

        <div
          id="paymentReferenceSection"
          class="form-group"
          style="display:none;">

          <label class="form-label">
            Nomor Referensi
          </label>

          <input
            type="text"
            id="paymentReference"
            class="form-control"
            placeholder="Nomor Referensi">

        </div>


        <!-- =================================
             PAYMENT PROOF
        ================================== -->

        <div
          id="paymentProofSection"
          class="form-group"
          style="display:none;">

          <label class="form-label">
            Bukti Pembayaran
          </label>

          <div
            class="upload"
            data-upload="paymentProof">

            <input
              type="file"
              accept="image/*"
              hidden>

            <label class="upload-box">

              <div class="upload-icon">

                <i data-lucide="image-plus"></i>

              </div>

              <div class="upload-title">
                Klik untuk memilih file
              </div>

              <div class="upload-text">
                JPG, PNG maksimal 5 MB
              </div>

            </label>

            <div class="upload-preview">

              <img
                class="upload-image"
                src=""
                alt="Preview">

              <div class="upload-info">

                <div class="upload-name">
                  -
                </div>

                <div class="upload-size">
                  -
                </div>

              </div>

              <button
                type="button"
                class="upload-remove">

                <i data-lucide="trash-2"></i>

              </button>

            </div>

          </div>

        </div>


        <!-- =================================
             NOTE
        ================================== -->

        <div class="form-group">

          <label class="form-label">
            Catatan
          </label>

          <textarea
            id="paymentNote"
            class="form-control"
            rows="3"
            placeholder="Catatan pembayaran"></textarea>

        </div>


        <!-- =================================
             FOOTER
        ================================== -->

        <div class="form-footer">

          <button
            type="button"
            id="btnCancelPayment"
            class="btn btn-secondary">

            Batal

          </button>

          <button
            type="button"
            id="btnSavePayment"
            class="btn btn-primary">

            Kirim Pembayaran

          </button>

        </div>

      </form>

    `;
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    render,
  };
})();
