/**
 * ============================================================
 * RESERVASI LIST VIEW
 * ============================================================
 * Menangani seluruh tampilan halaman List Reservasi.
 *
 * Tanggung Jawab:
 * - Render Header
 * - Render Summary
 * - Render Toolbar
 * - Render Table
 * - Render Empty State
 *
 * Tidak boleh:
 * - Mengakses Dummy
 * - Mengakses Service
 * - Menyimpan Data
 * - Business Logic
 * ============================================================
 */

const ReservasiList = (() => {
  // ============================================================
  // PUBLIC
  // ============================================================

  function render(data = [], summary = {}) {
    return `

        ${renderHeader()}

        ${renderSummary(summary)}

        ${renderToolbar()}

        ${renderTable(data)}

        ${renderPagination()}

    `;
  }

  // ============================================================
  // HEADER
  // ============================================================

  function renderHeader() {
    return `
    
        <div class="page-header">

            <div>

                <h1 class="page-title">

                    Reservasi

                </h1>

                <p class="page-description">

                    Kelola data reservasi penginapan beserta proses check-in dan check-out tamu.

                </p>

            </div>

            <div class="page-actions">

                <button
                    class="btn btn-primary"
                    id="btnTambahReservasi">

                    <i class="fas fa-plus"></i>

                    Reservasi Baru

                </button>

            </div>

        </div>

    `;
  }

  /* ============================================================
   SUMMARY
============================================================ */

  function renderSummary(summary = {}) {
    return `

        <div class="reservasi-summary">

            <div class="reservasi-summary-grid">

                <div class="reservasi-summary-card">

                    <div class="reservasi-summary-content">

                        <div class="reservasi-summary-value">

                            ${summary.totalReservasi ?? 0}

                        </div>

                        <div class="reservasi-summary-label">

                            Total Reservasi

                        </div>

                    </div>

                    <div class="reservasi-summary-icon primary">

                        <i data-lucide="calendar-days"></i>

                    </div>

                </div>

                <div class="reservasi-summary-card">

                    <div class="reservasi-summary-content">

                        <div class="reservasi-summary-value">

                            ${summary.checkInHariIni ?? 0}

                        </div>

                        <div class="reservasi-summary-label">

                            Check-in Hari Ini

                        </div>

                    </div>

                    <div class="reservasi-summary-icon success">

                        <i data-lucide="log-in"></i>

                    </div>

                </div>

                <div class="reservasi-summary-card">

                    <div class="reservasi-summary-content">

                        <div class="reservasi-summary-value">

                            ${summary.checkOutHariIni ?? 0}

                        </div>

                        <div class="reservasi-summary-label">

                            Check-out Hari Ini

                        </div>

                    </div>

                    <div class="reservasi-summary-icon warning">

                        <i data-lucide="log-out"></i>

                    </div>

                </div>

                <div class="reservasi-summary-card">

                    <div class="reservasi-summary-content">

                        <div class="reservasi-summary-value">

                            ${ReservasiHelper.formatCurrency(summary.totalPendapatan ?? 0)}

                        </div>

                        <div class="reservasi-summary-label">

                            Total Pendapatan

                        </div>

                    </div>

                    <div class="reservasi-summary-icon danger">

                        <i data-lucide="wallet"></i>

                    </div>

                </div>

            </div>

        </div>

    `;
  }

  // ============================================================
  // TOOLBAR
  // ============================================================

  // ============================================================
  // TOOLBAR
  // ============================================================

  function renderToolbar() {
    const filters = Reservasi.filters || {};

    return `

    <div class="reservasi-toolbar">

        <!-- SEARCH -->

        <div class="reservasi-toolbar-search">

            <i data-lucide="search"></i>

            <input
                type="text"
                id="searchReservasi"
                class="form-control"
                value="${escapeHtml(filters.search || "")}"
                placeholder="Cari kode reservasi, nama tamu, atau penginapan...">

        </div>


        <div class="reservasi-toolbar-filter">

            <!-- STATUS -->

            <select
                id="filterStatus"
                class="form-select">

                <option value=""
                  ${!filters.status ? "selected" : ""}>
                    Semua Status
                </option>

                <option
                    value="${ReservasiStatus.DRAFT}"
                    ${filters.status === ReservasiStatus.DRAFT ? "selected" : ""}>
                    Draft
                </option>

                <option
                    value="${ReservasiStatus.BOOKED}"
                    ${filters.status === ReservasiStatus.BOOKED ? "selected" : ""}>
                    Booked
                </option>

                <option
                    value="${ReservasiStatus.CHECK_IN}"
                    ${filters.status === ReservasiStatus.CHECK_IN ? "selected" : ""}>
                    Check In
                </option>

                <option
                    value="${ReservasiStatus.CHECK_OUT}"
                    ${filters.status === ReservasiStatus.CHECK_OUT ? "selected" : ""}>
                    Check Out
                </option>

                <option
                    value="${ReservasiStatus.CANCELLED}"
                    ${filters.status === ReservasiStatus.CANCELLED ? "selected" : ""}>
                    Cancelled
                </option>

                <option
                    value="${ReservasiStatus.EXPIRED}"
                    ${filters.status === ReservasiStatus.EXPIRED ? "selected" : ""}>
                    Expired
                </option>

            </select>


            <!-- CHANNEL -->

            <select
                id="filterChannel"
                class="form-select">

                <option value=""
                  ${!filters.channel ? "selected" : ""}>
                    Semua Channel
                </option>

                <option
                    value="${BookingChannel.WEBSITE}"
                    ${filters.channel === BookingChannel.WEBSITE ? "selected" : ""}>
                    Website
                </option>

                <option
                    value="${BookingChannel.OWNER}"
                    ${filters.channel === BookingChannel.OWNER ? "selected" : ""}>
                    Owner
                </option>

                <option
                    value="${BookingChannel.AGEN}"
                    ${filters.channel === BookingChannel.AGEN ? "selected" : ""}>
                    Agen
                </option>

            </select>


            <!-- TANGGAL -->

            <input
                type="date"
                id="filterTanggal"
                class="form-control"
                value="${filters.tanggal || ""}">

        </div>


        <!-- REFRESH -->

        <div class="reservasi-toolbar-action">

            <button
                class="btn btn-outline"
                id="btnRefreshReservasi">

                <i data-lucide="refresh-cw"></i>

                Refresh

            </button>

        </div>

    </div>

  `;
  }

  // ============================================================
  // CONTENT
  // ============================================================

  function renderContent(data = []) {
    if (!Array.isArray(data) || data.length === 0) {
      return renderEmptyState();
    }

    return `

        <div class="page-content">

            ${renderTable(data)}

        </div>

    `;
  }

  // ============================================================
  // TABLE
  // ============================================================

  /* ============================================================
   TABLE
============================================================ */

  function renderTable(data = []) {
    if (!data.length) {
      return renderEmptyState();
    }

    return `

        <div class="reservasi-table">

            <div class="reservasi-table-wrapper">

                <table class="table">

                    ${renderTableHeader()}

                    ${renderTableBody(data)}

                </table>

            </div>

        </div>

    `;
  }

  /* ============================================================
   PAGINATION
============================================================ */

  function renderPagination() {
    return `

        <div class="reservasi-pagination">

            <div
                class="reservasi-pagination-info"
                id="reservasiPaginationInfo">

            </div>

            <div class="reservasi-pagination-wrapper">

                <div id="paginationReservasi"></div>

            </div>

        </div>

    `;
  }

  // ============================================================
  // TABLE HEADER
  // ============================================================

  function renderTableHeader() {
    return `

        <thead class="reservasi-table-head">

            <tr>

                <th>No</th>

                <th>Kode</th>

                <th>Tamu</th>

                <th>Penginapan</th>

                <th>Check In</th>

                <th>Check Out</th>

                <th>Status</th>

                <th>Channel</th>

                <th>Total</th>

                <th class="text-center">

                    Aksi

                </th>

            </tr>

        </thead>

    `;
  }

  // ============================================================
  // TABLE BODY
  // ============================================================

  function renderTableBody(data = []) {
    return `

        <tbody>

            ${data.map((item, index) => renderTableRow(item, index)).join("")}

        </tbody>

    `;
  }

  // ============================================================
  // TABLE ROW
  // ============================================================

  function renderTableRow(item, index) {
    return `

        <tr class="reservasi-row">

            <td>

                ${item.rowNumber || index + 1}

            </td>

            <td>

                ${item.kode || "-"}

            </td>

            <td>

                ${item.namaTamu || "-"}

            </td>

            <td>
                
                ${item.penginapanNama || "-"}

            </td>

            <td>

                ${ReservasiHelper.formatDate(item.checkIn)}

            </td>

            <td>

                ${ReservasiHelper.formatDate(item.checkOut)}

            </td>

            <td>

                ${renderStatusBadge(item.status)}

            </td>

            <td>

                ${item.channel || "-"}

            </td>

            <td>

                ${ReservasiHelper.formatCurrency(item.grandTotal || 0)}

            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="btn-icon"
                        data-action="detail"
                        data-id="${item.id}"
                        title="Lihat Detail">

                        <i data-lucide="eye"></i>

                    </button>

                    <button
                        class="btn-icon text-danger"                        
                        data-action="status"
                        data-id="${item.id}"
                        title="Hapus Reservasi">

                       
                        <i data-lucide="refresh-cw"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  /* ============================================================
   EMPTY STATE
============================================================ */

  function renderEmptyState() {
    return `

        <div class="reservasi-empty">

            <div class="reservasi-empty-icon">

                <i data-lucide="calendar-search"></i>

            </div>

            <h3 class="reservasi-empty-title">

                Belum Ada Reservasi

            </h3>

            <p class="reservasi-empty-description">

                Belum terdapat data reservasi.
                Klik tombol di bawah untuk membuat reservasi baru.

            </p>

            <button
                class="btn btn-primary"
                id="btnEmptyCreateReservasi">

                <i data-lucide="plus"></i>

                Reservasi Baru

            </button>

        </div>

    `;
  }

  // ============================================================
  // STATUS BADGE
  // ============================================================

  function renderStatusBadge(status = "") {
    const badges = {
      [ReservasiStatus.DRAFT]: {
        className: "badge badge-light",
        label: "Draft",
      },

      [ReservasiStatus.BOOKED]: {
        className: "badge badge-primary",
        label: "Booked",
      },

      [ReservasiStatus.CHECK_IN]: {
        className: "badge badge-success",
        label: "Check In",
      },

      [ReservasiStatus.CHECK_OUT]: {
        className: "badge badge-secondary",
        label: "Check Out",
      },

      [ReservasiStatus.CANCELLED]: {
        className: "badge badge-danger",
        label: "Cancelled",
      },

      [ReservasiStatus.EXPIRED]: {
        className: "badge badge-dark",
        label: "Expired",
      },
    };

    const badge = badges[status] || {
      className: "badge badge-light",

      label: status || "-",
    };

    return `

    <span class="${badge.className}">

        ${badge.label}

    </span>

  `;
  }

  // ============================================================
  // ESCAPE HTML
  // ============================================================

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    render,

    // renderHeader,

    // renderSummary,

    // renderToolbar,

    // renderContent,

    // renderTable,

    // renderEmptyState,
  };
})();
