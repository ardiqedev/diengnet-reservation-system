/* =========================================
   PAYMENT FORM
========================================= */

const PaymentForm = (() => {
  /* =====================================
     RENDER
  ===================================== */

  function render(booking = {}) {
    const today = new Date().toISOString().split("T")[0];

    return `

        <form
            id="paymentForm"
            class="form">

            <div class="form-group">

                <label class="form-label">

                    Tanggal

                </label>

                <input
                    type="date"
                    id="paymentDate"
                    class="form-control"
                    value="${today}">

            </div>

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

            <div class="form-group">

                <label class="form-label">

                    Nominal

                </label>

                <input
                    type="number"
                    id="paymentAmount"
                    class="form-control"
                    placeholder="0">

            </div>

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

                    Simpan

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
