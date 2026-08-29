/* =========================================
   INVOICE VIEW
========================================= */

const InvoiceView = (() => {
  /* =====================================
     RENDER
  ===================================== */

  function render(data = {}) {
    if (!data || typeof data !== "object") {
      return `
        <div class="invoice">
          <div class="invoice-empty">
            Data invoice tidak valid.
          </div>
        </div>
      `;
    }

    return `

      <div class="invoice">

        ${renderHeader(data)}

        ${renderBody(data)}

        ${renderFooter()}

      </div>

    `;
  }

  /* =====================================
     HEADER
  ===================================== */

  function renderHeader(data = {}) {
    const invoice = data.invoice || {};

    return `

      <div class="invoice-header">

        <div class="invoice-company">

          <div class="invoice-logo">

            DIENG STAY PMS

          </div>

          <div class="invoice-company-info">

            <div>
              Sistem Reservasi Penginapan
            </div>

            <div>
              Dieng, Banjarnegara, Jawa Tengah
            </div>

            <div>
              Telp : 08xxxxxxxxxx
            </div>

            <div>
              Email : info@diengstay.com
            </div>

          </div>

        </div>


        <div class="invoice-document">

          <h1>
            INVOICE
          </h1>


          <div class="invoice-document-info">

            ${renderInfoRow({
              label: "No Invoice",

              value: invoice.kode || "-",
            })}


            ${renderInfoRow({
              label: "Kode Reservasi",

              value: invoice.reservationId || "-",
            })}


            ${renderInfoRow({
              label: "Tanggal",

              value: formatDateTime(invoice.issuedAt),
            })}


            ${renderInfoRow({
              label: "Status",

              value: formatStatus(invoice.status),
            })}

          </div>

        </div>

      </div>

    `;
  }

  /* =====================================
     INFO ROW
  ===================================== */

  function renderInfoRow({ label = "-", value = "-", className = "" } = {}) {
    return `

      <div class="invoice-row ${className}">

        <span>
          ${escapeHtml(label)}
        </span>

        <strong>
          ${escapeHtml(value)}
        </strong>

      </div>

    `;
  }

  /* =====================================
     BODY
  ===================================== */

  function renderBody(data = {}) {
    return `

      <div class="invoice-grid">

        ${renderGuest(data)}

        ${renderProperty(data)}

      </div>


      ${renderSchedule(data)}


      ${renderSummary(data)}


      ${renderPayment(data)}


      ${renderNote(data)}


      ${renderSignature()}

    `;
  }

  /* =====================================
     GUEST
  ===================================== */

  function renderGuest(data = {}) {
    const guest = data.guest || {};

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          👤 Data Tamu

        </div>


        <div class="invoice-information">

          ${renderInfoRow({
            label: "Nama Tamu",

            value: guest.namaTamu || "-",
          })}


          ${renderInfoRow({
            label: "No. HP",

            value: guest.noHp || "-",
          })}


          ${renderInfoRow({
            label: "Email",

            value: guest.email || "-",
          })}

        </div>

      </div>

    `;
  }

  /* =====================================
     PROPERTY
  ===================================== */

  function renderProperty(data = {}) {
    const property = data.property || {};

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          🏡 Informasi Menginap

        </div>


        <div class="invoice-information">

          ${renderInfoRow({
            label: "Penginapan",

            value: property.penginapanNama || "-",
          })}


          ${renderInfoRow({
            label: "Tipe Kamar",

            value: property.tipeKamar || "-",
          })}


          ${renderInfoRow({
            label: "Nomor Kamar",

            value: property.nomorKamar || "-",
          })}


          ${renderInfoRow({
            label: "Channel",

            value: data.stay?.channel || "-",
          })}

        </div>

      </div>

    `;
  }

  /* =====================================
     SCHEDULE
  ===================================== */

  function renderSchedule(data = {}) {
    const stay = data.stay || {};

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          📅 Jadwal Menginap

        </div>


        <div class="invoice-information">

          ${renderInfoRow({
            label: "Check In",

            value: formatDate(stay.checkIn),
          })}


          ${renderInfoRow({
            label: "Check Out",

            value: formatDate(stay.checkOut),
          })}


          ${renderInfoRow({
            label: "Jumlah Malam",

            value: `${Number(stay.jumlahMalam || 0)} Malam`,
          })}


          ${renderInfoRow({
            label: "Dewasa",

            value: `${Number(stay.dewasa || 0)} Orang`,
          })}


          ${renderInfoRow({
            label: "Anak",

            value: `${Number(stay.anak || 0)} Orang`,
          })}

        </div>

      </div>

    `;
  }

  /* =====================================
     INVOICE ROW
  ===================================== */

  function renderInvoiceRow({
    description = "-",
    qty = "-",
    price = 0,
    subtotal = 0,
    isBold = false,
  } = {}) {
    return `

      <tr class="${isBold ? "invoice-row-bold" : ""}">

        <td>
          ${escapeHtml(description)}
        </td>


        <td class="text-center">
          ${escapeHtml(String(qty))}
        </td>


        <td class="text-end">

          ${formatCurrency(price)}

        </td>


        <td class="text-end">

          ${formatCurrency(subtotal)}

        </td>

      </tr>

    `;
  }

  /* =====================================
     SUMMARY
  ===================================== */

  function renderSummary(data = {}) {
    const pricing = data.pricing || {};

    const stay = data.stay || {};

    const jumlahMalam = Number(stay.jumlahMalam || 0);

    const roomPrice = Number(pricing.roomPrice || 0);

    const extraPerson = Number(pricing.extraPerson || 0);

    const discount = Number(pricing.discount || 0);

    const tax = Number(pricing.tax || 0);

    const grandTotal = Number(pricing.grandTotal || 0);

    /*
     * roomPrice pada reservation adalah
     * snapshot biaya kamar reservation.
     *
     * Jangan dikalikan lagi dengan
     * jumlah malam karena backend sudah
     * menyimpan roomPrice sebagai nilai
     * pricing reservation.
     */

    const roomSubtotal = roomPrice;

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          RINCIAN BIAYA

        </div>


        <table class="invoice-table">

          <thead>

            <tr>

              <th>
                Deskripsi
              </th>

              <th>
                Qty
              </th>

              <th>
                Harga
              </th>

              <th>
                Subtotal
              </th>

            </tr>

          </thead>


          <tbody>

            ${renderInvoiceRow({
              description: data.property?.tipeKamar || "Kamar",

              qty: `${jumlahMalam} Malam`,

              price: roomPrice,

              subtotal: roomSubtotal,
            })}


            ${
              extraPerson > 0
                ? renderInvoiceRow({
                    description: "Extra Person",

                    qty: "1",

                    price: extraPerson,

                    subtotal: extraPerson,
                  })
                : ""
            }


            ${
              discount > 0
                ? renderInvoiceRow({
                    description: "Diskon",

                    qty: "-",

                    price: 0,

                    subtotal: -discount,
                  })
                : ""
            }


            ${
              tax > 0
                ? renderInvoiceRow({
                    description: "Pajak",

                    qty: "-",

                    price: 0,

                    subtotal: tax,
                  })
                : ""
            }

          </tbody>


          <tfoot>

            <tr>

              <th colspan="3">

                TOTAL PEMBAYARAN

              </th>


              <th class="text-end">

                ${formatCurrency(grandTotal)}

              </th>

            </tr>

          </tfoot>

        </table>

      </div>

    `;
  }

  /* =====================================
     PAYMENT
  ===================================== */

  function renderPayment(data = {}) {
    const payment = data.payment || {};

    const grandTotal = Number(payment.grandTotal || 0);

    const totalVerified = Number(payment.totalVerified || 0);

    const remaining = Number(payment.remaining || 0);

    const isPaid = payment.isPaid === true;

    const status = isPaid ? "LUNAS" : "BELUM LUNAS";

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          💳 Status Pembayaran

        </div>


        <div class="invoice-information">

          ${renderInfoRow({
            label: "Total Tagihan",

            value: formatCurrency(grandTotal),
          })}


          ${renderInfoRow({
            label: "Pembayaran Terverifikasi",

            value: formatCurrency(totalVerified),
          })}


          ${renderInfoRow({
            label: "Sisa Pembayaran",

            value: formatCurrency(remaining),
          })}


          ${renderInfoRow({
            label: "Status",

            value: status,

            className: isPaid
              ? "invoice-payment-paid"
              : "invoice-payment-unpaid",
          })}

        </div>


        ${renderVerifiedPayments(payment.payments)}

      </div>

    `;
  }

  /* =====================================
     VERIFIED PAYMENTS
  ===================================== */

  function renderVerifiedPayments(payments = []) {
    if (!Array.isArray(payments) || payments.length === 0) {
      return "";
    }

    return `

      <div class="invoice-payment-list">

        <div class="invoice-payment-title">

          Riwayat Pembayaran Terverifikasi

        </div>


        <table class="invoice-table">

          <thead>

            <tr>

              <th>
                Tanggal
              </th>

              <th>
                Metode
              </th>

              <th>
                Referensi
              </th>

              <th>
                Jumlah
              </th>

            </tr>

          </thead>


          <tbody>

            ${payments.map((payment) => renderPaymentRow(payment)).join("")}

          </tbody>

        </table>

      </div>

    `;
  }

  /* =====================================
     PAYMENT ROW
  ===================================== */

  function renderPaymentRow(payment = {}) {
    const date =
      payment.verifiedAt || payment.updatedAt || payment.createdAt || "";

    const method = payment.paymentMethod || payment.method || "-";

    const reference =
      payment.reference || payment.referenceNumber || payment.id || "-";

    const amount = Number(payment.paymentAmount || 0);

    return `

      <tr>

        <td>

          ${formatDateTime(date)}

        </td>


        <td>

          ${escapeHtml(method)}

        </td>


        <td>

          ${escapeHtml(reference)}

        </td>


        <td class="text-end">

          ${formatCurrency(amount)}

        </td>

      </tr>

    `;
  }

  /* =====================================
     NOTE
  ===================================== */

  function renderNote(data = {}) {
    const note = data.note || data.catatan || "-";

    return `

      <div class="invoice-section">

        <div class="invoice-section-title">

          📝 Catatan

        </div>


        <div class="invoice-note">

          ${escapeHtml(note)}

        </div>

      </div>

    `;
  }

  /* =====================================
     SIGNATURE
  ===================================== */

  function renderSignature() {
    return `

      <div class="invoice-signature">

        <div class="invoice-signature-item">

          <div class="invoice-signature-title">

            Diterbitkan Oleh

          </div>


          <div class="invoice-signature-space"></div>


          <div class="invoice-signature-name">

            Dieng Stay PMS

          </div>

        </div>


        <div class="invoice-signature-item">

          <div class="invoice-signature-title">

            Diterima Oleh

          </div>


          <div class="invoice-signature-space"></div>


          <div class="invoice-signature-name">

            (...........................)

          </div>

        </div>

      </div>

    `;
  }

  /* =====================================
     FOOTER
  ===================================== */

  function renderFooter() {
    return `

      <div class="invoice-footer">

        <button
          type="button"
          class="btn btn-primary"
          id="btnPrintInvoice">

          Print Invoice

        </button>

      </div>

    `;
  }

  /* =====================================
     FORMAT CURRENCY
  ===================================== */

  function formatCurrency(amount) {
    const value = Number(amount || 0);

    return `Rp ${value.toLocaleString("id-ID")}`;
  }

  /* =====================================
     FORMAT DATE
  ===================================== */

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    if (
      typeof ReservasiHelper !== "undefined" &&
      typeof ReservasiHelper.formatDate === "function"
    ) {
      return ReservasiHelper.formatDate(value);
    }

    return escapeHtml(String(value));
  }

  /* =====================================
     FORMAT DATE TIME
  ===================================== */

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return escapeHtml(String(value));
    }

    return date.toLocaleString("id-ID");
  }

  /* =====================================
     FORMAT STATUS
  ===================================== */

  function formatStatus(status) {
    const value = String(status || "")
      .trim()
      .toUpperCase();

    if (value === "CHECK_OUT") {
      return "CHECK OUT";
    }

    if (value === "CHECK_IN") {
      return "CHECK IN";
    }

    return value || "-";
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
     PUBLIC API
  ===================================== */

  return {
    render,
  };
})();
