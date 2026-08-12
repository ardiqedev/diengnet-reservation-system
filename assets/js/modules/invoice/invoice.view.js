/* =========================================
   INVOICE VIEW
========================================= */

const InvoiceView = (() => {
  /* =====================================
       RENDER
    ===================================== */

  function render(booking = {}, invoice = {}, payments = []) {
    return `

        <div class="invoice">

            ${renderHeader(booking, invoice)}

            ${renderBody(booking, payments)}

            ${renderFooter()}

        </div>

    `;
  }

  /* =====================================
   HEADER
===================================== */

  function renderHeader(booking = {}, invoice = {}) {
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
                      value: invoice.invoiceNumber || "-",
                    })}

                    ${renderInfoRow({
                      label: "Kode Reservasi",
                      value: booking.kodeReservasi || "-",
                    })}

                    ${renderInfoRow({
                      label: "Tanggal",
                      value: ReservasiHelper.formatDate(invoice.invoiceDate),
                    })}

                    ${renderInfoRow({
                      label: "Status",
                      value: invoice.status || "-",
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

                ${label}

            </span>

            <strong>

                ${value}

            </strong>

        </div>

    `;
  }

  /* =====================================
   BODY
    ===================================== */

  /* =====================================
   BODY
===================================== */

  function renderBody(booking = {}, payments = []) {
    return `

        <div class="invoice-grid">

            ${renderGuest(booking)}

            ${renderStay(booking)}

        </div>

        ${renderSchedule(booking)}

        ${renderSummary(booking)}

        ${renderPayment(booking, payments)}

        ${renderNote(booking)}        

        ${renderSignature()}

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
    GUEST
    ===================================== */

  function renderGuest(booking = {}) {
    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                👤 Data Tamu

            </div>

            <div class="invoice-information">

                ${renderInfoRow({
                  label: "Nama Tamu",
                  value: booking.namaTamu || "-",
                })}

                ${renderInfoRow({
                  label: "No. HP",
                  value: booking.noHp || "-",
                })}

                ${renderInfoRow({
                  label: "Email",
                  value: booking.email || "-",
                })}

            </div>

        </div>

    `;
  }

  /* =====================================
    STAY
    ===================================== */

  function renderStay(booking = {}) {
    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                🏡 Informasi Menginap

            </div>

            <div class="invoice-information">

                ${renderInfoRow({
                  label: "Penginapan",
                  value: booking.penginapan || "-",
                })}

                ${renderInfoRow({
                  label: "Tipe Kamar",
                  value: booking.tipeKamar || "-",
                })}

                ${renderInfoRow({
                  label: "Nomor Kamar",
                  value: booking.kamar || "-",
                })}

                ${renderInfoRow({
                  label: "Channel",
                  value: booking.channel || "-",
                })}

            </div>

        </div>

    `;
  }

  /* =====================================
    SCHEDULE
    ===================================== */

  function renderSchedule(booking = {}) {
    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                📅 Jadwal Menginap

            </div>

            <div class="invoice-information">

                ${renderInfoRow({
                  label: "Check In",
                  value: ReservasiHelper.formatDate(booking.checkIn),
                })}

                ${renderInfoRow({
                  label: "Check Out",
                  value: ReservasiHelper.formatDate(booking.checkOut),
                })}

                ${renderInfoRow({
                  label: "Jumlah Malam",
                  value: `${booking.jumlahMalam || 0} Malam`,
                })}

                ${renderInfoRow({
                  label: "Dewasa",
                  value: `${booking.dewasa || 0} Orang`,
                })}

                ${renderInfoRow({
                  label: "Anak",
                  value: `${booking.anak || 0} Orang`,
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

                ${description}

            </td>

            <td class="text-center">

                ${qty}

            </td>

            <td class="text-end">

                ${ReservasiHelper.formatCurrency(price)}

            </td>

            <td class="text-end">

                ${ReservasiHelper.formatCurrency(subtotal)}

            </td>

        </tr>

    `;
  }

  /* =====================================
   SUMMARY
    ===================================== */

  function renderSummary(booking = {}) {
    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                RINCIAN BIAYA

            </div>

            <table class="invoice-table">

                <thead>

                    <tr>

                        <th>Deskripsi</th>

                        <th>Qty</th>

                        <th>Harga</th>

                        <th>Subtotal</th>

                    </tr>

                </thead>

                <tbody>

                    ${renderInvoiceRow({
                      description: booking.tipeKamar || "-",
                      qty: `${booking.jumlahMalam || 0} Malam`,
                      price: booking.weekday || 0,
                      subtotal:
                        (booking.weekday || 0) * (booking.jumlahMalam || 0),
                    })}

                    ${renderInvoiceRow({
                      description: "Extra Person",
                      qty: `${booking.anak || 0} Orang`,
                      price: booking.extraPerson || 0,
                      subtotal: booking.extraPerson || 0,
                    })}

                    ${renderInvoiceRow({
                      description: "Diskon",
                      qty: "-",
                      price: 0,
                      subtotal: booking.diskon || 0,
                    })}

                    ${renderInvoiceRow({
                      description: "Pajak",
                      qty: "-",
                      price: 0,
                      subtotal: booking.pajak || 0,
                    })}

                </tbody>

                <tfoot>

                    <tr>

                        <th colspan="3">

                            TOTAL PEMBAYARAN

                        </th>

                        <th class="text-end">

                            ${ReservasiHelper.formatCurrency(
                              booking.grandTotal,
                            )}

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

  function renderPayment(booking = {}, payments = []) {
    const totalPaid = PaymentHelper.getTotalPaid(payments);

    const remaining = PaymentHelper.getRemaining(booking.grandTotal, payments);

    const status = PaymentHelper.getStatus(booking.grandTotal, payments);

    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                💳 Status Pembayaran

            </div>

            <div class="invoice-information">

                ${renderInfoRow({
                  label: "Sudah Dibayar",
                  value: ReservasiHelper.formatCurrency(totalPaid),
                })}

                ${renderInfoRow({
                  label: "Sisa Pembayaran",
                  value: ReservasiHelper.formatCurrency(remaining),
                })}

                ${renderInfoRow({
                  label: "Status",
                  value: status.label,
                })}

            </div>

        </div>

    `;
  }

  /* =====================================
   NOTE
===================================== */

  function renderNote(booking = {}) {
    return `

        <div class="invoice-section">

            <div class="invoice-section-title">

                📝 Catatan

            </div>

            <div class="invoice-note">

                ${booking.catatan || "-"}

            </div>

        </div>

    `;
  }

  /* =====================================
   SIGNATURE
===================================== */

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
       PUBLIC API
    ===================================== */

  return {
    render,
  };
})();
