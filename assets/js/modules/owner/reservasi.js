/* =========================================================
   DIENG STAY
   OWNER RESERVATION
========================================================= */

const OwnerReservasi = (() => {
  let initialized = false;

  const dom = {};

  /* =========================================================
     INIT
  ========================================================= */

  function init() {
    if (initialized) return;

    initialized = true;

    console.log("[OWNER RESERVASI] INIT");

    /* =====================================
     AUTH INIT
  ====================================== */

    Auth.init();

    cacheDom();
    bindEvents();
    renderIcons();
    renderEmpty();
  }

  /* =========================================================
     DOM
  ========================================================= */

  function cacheDom() {
    dom.input = document.getElementById("reservationCode");

    dom.clear = document.getElementById("btnClearReservation");

    dom.search = document.getElementById("btnSearchReservation");

    dom.result = document.getElementById("reservationResult");
  }

  /* =========================================================
     EVENTS
  ========================================================= */

  function bindEvents() {
    dom.input?.addEventListener("input", handleInput);

    dom.input?.addEventListener("keydown", handleEnter);

    dom.clear?.addEventListener("click", clearSearch);

    dom.search?.addEventListener("click", searchReservation);
  }

  function handleEnter(event) {
    if (event.key !== "Enter") return;

    event.preventDefault();

    searchReservation();
  }

  function handleInput() {
    const code = String(dom.input?.value || "").trim();

    if (dom.clear) {
      dom.clear.hidden = !code;
    }
  }

  /* =========================================================
     SEARCH RESERVATION
  ========================================================= */

  async function searchReservation() {
    const kode = String(dom.input?.value || "")
      .trim()
      .toUpperCase();

    if (!kode) {
      renderEmpty(
        "Nomor reservasi belum diisi",
        "Masukkan kode reservasi yang diberikan saat booking.",
      );

      dom.input?.focus();

      return;
    }

    /* =====================================
     OWNER
  ====================================== */

    const user = Auth.user();

    if (!user?.id) {
      console.error("[OWNER RESERVASI] OWNER TIDAK DITEMUKAN");

      renderEmpty("Sesi Owner tidak ditemukan", "Silakan login kembali.");

      return;
    }

    /* =====================================
     LOADING
  ====================================== */

    setLoading(true);

    try {
      console.log("[OWNER RESERVASI] OWNER LOOKUP:", {
        ownerId: user.id,
        kode,
      });

      /* ===================================
       API
    ==================================== */

      const response = await API.post("owner.reservationLookup", {
        ownerId: user.id,

        kode,
      });

      console.log("[OWNER RESERVASI] OWNER LOOKUP RESPONSE:", response);

      /* ===================================
       ERROR
    ==================================== */

      if (!response?.success) {
        renderEmpty(
          "Reservasi tidak ditemukan",
          response?.message || "Reservasi tidak ditemukan.",
        );

        return;
      }

      /* ===================================
       NORMALIZE
    ==================================== */

      const reservation = normalizeReservation(response.data);

      console.log("[OWNER RESERVASI] RESERVATION:", reservation);

      /* ===================================
       RENDER
    ==================================== */

      renderReservation(reservation);
    } catch (error) {
      console.error("[OWNER RESERVASI] OWNER LOOKUP ERROR:", error);

      renderEmpty(
        "Terjadi kesalahan",
        error?.message || "Reservasi gagal diperiksa. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     NORMALIZE RESERVATION
  ========================================================= */

  function normalizeReservation(data = {}) {
    const dewasa = Number(data.dewasa || 0);

    const anak = Number(data.anak || 0);

    const jumlahTamu = dewasa + anak;

    return {
      ...data,

      kode: String(data.kode || "").trim(),

      namaTamu: String(data.namaTamu || "-").trim(),

      jumlahTamu:
        jumlahTamu > 0 ? `${jumlahTamu} Tamu` : "Jumlah tamu tidak tersedia",

      checkIn: formatDate(data.checkIn),

      checkOut: formatDate(data.checkOut),

      nomorKamar: String(data.nomorKamar || "").trim() || "-",

      tipeKamar: String(data.tipeKamar || "").trim() || "-",

      penginapanNama: String(data.penginapanNama || "").trim() || "-",

      grandTotal: Number(data.grandTotal || 0),

      status: String(data.status || "")
        .trim()
        .toUpperCase(),

      paymentStatus: String(data.paymentStatus || "")
        .trim()
        .toUpperCase(),
    };
  }

  /* =========================================================
     RENDER EMPTY
  ========================================================= */

  function renderEmpty(
    title = "Belum ada reservasi",
    message = "Masukkan nomor reservasi untuk melihat detail tamu.",
  ) {
    if (!dom.result) return;

    dom.result.innerHTML = `
      <div class="reservation-empty">
        <div class="reservation-empty-icon">
          <i data-lucide="search" aria-hidden="true"></i>
        </div>

        <strong>${escapeHtml(title)}</strong>

        <span>${escapeHtml(message)}</span>
      </div>
    `;

    renderIcons();
  }

  /* =========================================================
     RENDER RESERVATION
  ========================================================= */

  function renderReservation(reservation = {}) {
    if (!dom.result) return;

    const status = String(reservation.status || "")
      .trim()
      .toUpperCase();

    const statusLabel = getStatusLabel(status);

    const statusClass = getStatusClass(status);

    const paymentLabel = getPaymentLabel(reservation.paymentStatus);

    const paymentClass = getPaymentClass(reservation.paymentStatus);

    const action = getMainAction(status);

    dom.result.innerHTML = `
      <div class="reservation-result-heading">
        <strong>Hasil Reservasi</strong>

        <span>1 reservasi</span>
      </div>

      <article class="reservation-card">

        <div class="reservation-card-header">

          <span class="reservation-code">
            ${escapeHtml(reservation.kode)}
          </span>

          <span class="reservation-status ${statusClass}">
            ${escapeHtml(statusLabel)}
          </span>

        </div>

        <div class="reservation-card-body">

          <!-- TAMU -->

          <div class="reservation-guest">

            <strong>
              ${escapeHtml(reservation.namaTamu)}
            </strong>

            <span>
              ${escapeHtml(reservation.jumlahTamu)}
            </span>

          </div>

          <!-- INFO -->

          <div class="reservation-info-list">

            <!-- PERIODE -->

            <div class="reservation-info-item">

              <div class="reservation-info-icon">
                <i data-lucide="calendar-days"></i>
              </div>

              <div class="reservation-info-content">

                <span>Periode Menginap</span>

                <strong>
                  ${escapeHtml(reservation.checkIn)}
                  →
                  ${escapeHtml(reservation.checkOut)}
                </strong>

              </div>

            </div>

            <!-- KAMAR -->

            <div class="reservation-info-item">

              <div class="reservation-info-icon">
                <i data-lucide="bed-double"></i>
              </div>

              <div class="reservation-info-content">

                <span>Kamar</span>

                <strong>
                  ${escapeHtml(reservation.nomorKamar)}
                </strong>

                <small>
                  ${escapeHtml(reservation.tipeKamar)}
                </small>

              </div>

            </div>

            <!-- PENGINAPAN -->

            <div class="reservation-info-item">

              <div class="reservation-info-icon">
                <i data-lucide="building-2"></i>
              </div>

              <div class="reservation-info-content">

                <span>Penginapan</span>

                <strong>
                  ${escapeHtml(reservation.penginapanNama)}
                </strong>

              </div>

            </div>

          </div>

          <!-- PAYMENT -->

          <div class="reservation-payment">

            <div>

              <span class="reservation-payment-label">
                Pembayaran
              </span>

            </div>

            <div class="reservation-payment-value">

              <strong>
                ${formatCurrency(reservation.grandTotal)}
              </strong>

              <span class="${paymentClass}">
                ${escapeHtml(paymentLabel)}
              </span>

            </div>

          </div>

        </div>

        ${
          action
            ? `
              <div class="reservation-card-footer">

                <button
                  type="button"
                  class="reservation-main-action"
                  id="btnReservationAction"
                >

                  <span>
                    ${escapeHtml(action.label)}
                  </span>

                  <i data-lucide="${action.icon}"></i>

                </button>

              </div>
            `
            : ""
        }

      </article>
    `;

    renderIcons();

    bindAction(status, reservation);
  }

  /* =========================================================
     MAIN ACTION
  ========================================================= */

  function getMainAction(status) {
    if (status === "BOOKED") {
      return {
        label: "Check-in",
        icon: "log-in",
      };
    }

    if (status === "CHECK_IN") {
      return {
        label: "Check-out",
        icon: "log-out",
      };
    }

    return null;
  }

  async function bindAction(status, reservation) {
    const button = document.getElementById("btnReservationAction");

    if (!button) return;

    button.addEventListener("click", async () => {
      await handleReservationAction(status, reservation);
    });
  }

  /* =========================================================
   RESERVATION ACTION
========================================================= */

  async function handleReservationAction(status, reservation) {
    const user = Auth.user();

    if (!user?.id) {
      renderEmpty("Sesi Owner tidak ditemukan", "Silakan login kembali.");

      return;
    }

    const reservationId = String(reservation?.id || "").trim();

    if (!reservationId) {
      renderEmpty("Reservasi tidak valid", "ID reservasi tidak ditemukan.");

      return;
    }

    const isCheckIn = status === "BOOKED";

    const isCheckOut = status === "CHECK_IN";

    if (!isCheckIn && !isCheckOut) {
      return;
    }

    const actionLabel = isCheckIn ? "Check-in" : "Check-out";

    const confirmed = window.confirm(
      `Konfirmasi ${actionLabel} untuk tamu ini?`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);

    try {
      const action = isCheckIn
        ? "owner.reservationCheckIn"
        : "owner.reservationCheckOut";

      console.log("[OWNER RESERVASI] ACTION START:", {
        action,
        ownerId: user.id,
        reservationId,
      });

      const response = await API.post(action, {
        ownerId: user.id,

        reservationId,
      });

      console.log("[OWNER RESERVASI] ACTION RESPONSE:", response);

      if (!response?.success) {
        throw new Error(response?.message || `${actionLabel} gagal.`);
      }

      /* =====================================
       REFRESH RESERVATION
    ====================================== */

      const lookupResponse = await API.post("owner.reservationLookup", {
        ownerId: user.id,

        kode: reservation.kode,
      });

      if (!lookupResponse?.success) {
        throw new Error(
          "Status berhasil diperbarui, tetapi data reservasi gagal dimuat ulang.",
        );
      }

      const updatedReservation = normalizeReservation(lookupResponse.data);

      renderReservation(updatedReservation);

      console.log(`[OWNER RESERVASI] ${actionLabel.toUpperCase()} SUCCESS`);
    } catch (error) {
      console.error(
        `[OWNER RESERVASI] ${actionLabel.toUpperCase()} ERROR:`,
        error,
      );

      renderEmpty(
        `${actionLabel} gagal`,
        error?.message || `Tamu gagal melakukan ${actionLabel.toLowerCase()}.`,
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* =========================================================
   ACTION LOADING
========================================================= */

  function setActionLoading(isLoading) {
    const button = document.getElementById("btnReservationAction");

    if (!button) return;

    button.disabled = isLoading;

    if (isLoading) {
      button.innerHTML = `
      <i data-lucide="loader-circle"></i>

      <span>Memproses...</span>
    `;

      button.classList.add("reservation-search-loading");

      renderIcons();

      return;
    }

    button.classList.remove("reservation-search-loading");
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function getStatusLabel(status) {
    const labels = {
      BOOKED: "Booked",
      CHECK_IN: "Check-in",
      CHECK_OUT: "Check-out",
      CANCELLED: "Dibatalkan",
      EXPIRED: "Expired",
    };

    return labels[status] || status || "Unknown";
  }

  function getStatusClass(status) {
    const classes = {
      BOOKED: "reservation-status-booked",
      CHECK_IN: "reservation-status-checkin",
      CHECK_OUT: "reservation-status-checkout",
      CANCELLED: "reservation-status-checkout",
      EXPIRED: "reservation-status-checkout",
    };

    return classes[status] || "reservation-status-checkout";
  }

  /* =========================================================
     PAYMENT
  ========================================================= */

  function getPaymentLabel(status) {
    const labels = {
      VERIFIED: "Terverifikasi",
      PENDING: "Menunggu Pembayaran",
      REJECTED: "Ditolak",
      UNPAID: "Belum Dibayar",
    };

    return labels[status] || "Status Tidak Diketahui";
  }

  function getPaymentClass(status) {
    const classes = {
      VERIFIED: "reservation-payment-verified",
      PENDING: "reservation-payment-pending",
      REJECTED: "reservation-payment-rejected",
      UNPAID: "reservation-payment-unpaid",
    };

    return classes[status] || "";
  }

  /* =========================================================
     LOADING
  ========================================================= */

  function setLoading(isLoading) {
    if (!dom.search) return;

    dom.search.disabled = isLoading;

    if (isLoading) {
      dom.search.innerHTML = `
        <i data-lucide="loader-circle"></i>

        <span>Mencari Reservasi...</span>
      `;

      dom.search.classList.add("reservation-search-loading");

      renderIcons();

      return;
    }

    dom.search.innerHTML = `
      <i data-lucide="search"></i>

      <span>Cari Reservasi</span>
    `;

    dom.search.classList.remove("reservation-search-loading");

    renderIcons();
  }

  /* =========================================================
     CLEAR
  ========================================================= */

  function clearSearch() {
    if (dom.input) {
      dom.input.value = "";
    }

    if (dom.clear) {
      dom.clear.hidden = true;
    }

    renderEmpty();

    dom.input?.focus();
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /* =========================================================
     PHONE MASK
  ========================================================= */

  function maskPhone(value) {
    const phone = String(value || "").trim();

    if (phone.length <= 4) {
      return "****";
    }

    return `${phone.slice(0, 2)}******${phone.slice(-2)}`;
  }

  /* =========================================================
     ICON
  ========================================================= */

  function renderIcons() {
    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }
  }

  /* =========================================================
     ESCAPE HTML
  ========================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return {
    init,
  };
})();

/* =========================================================
   BOOTSTRAP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  OwnerReservasi.init();
});
