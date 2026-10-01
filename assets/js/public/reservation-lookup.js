/* =========================================
   DIENG NET
   RESERVATION LOOKUP
========================================= */

/* =========================================
   ELEMENTS
========================================= */

const lookupForm = document.getElementById("reservationLookupForm");

const lookupCode = document.getElementById("reservationCode");

const lookupWhatsapp = document.getElementById("reservationWhatsapp");

const lookupButton = document.getElementById("reservationLookupButton");

const lookupError = document.getElementById("reservationLookupError");

const lookupResult = document.getElementById("reservationLookupResult");

const lookupCard = document.getElementById("lookupCard");

/* =========================================
   MOBILE MENU
========================================= */

const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const mobileMenu = document.getElementById("mobileMenu");

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.toggle("active");

    mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

/* =========================================
   FORM SUBMIT
========================================= */

if (lookupForm) {
  lookupForm.addEventListener("submit", handleLookup);
}

/* =========================================
   LOOKUP
========================================= */

async function handleLookup(event) {
  event.preventDefault();

  /* =====================================
     CLEAR ERROR
  ===================================== */

  hideError();

  /* =====================================
     GET INPUT
  ===================================== */

  const kode = String(lookupCode?.value || "")
    .trim()
    .toUpperCase();

  const noHp = String(lookupWhatsapp?.value || "").trim();

  /* =====================================
     VALIDATION
  ===================================== */

  if (!kode) {
    showError("Kode reservasi wajib diisi.");

    lookupCode?.focus();

    return;
  }

  if (!noHp) {
    showError("Nomor WhatsApp wajib diisi.");

    lookupWhatsapp?.focus();

    return;
  }

  /* =====================================
     LOADING
  ===================================== */

  setLoading(true);

  try {
    /* ===================================
       API
    =================================== */

    const response = await API.post(
      "reservation.lookup",

      {
        kode,
        noHp,
      },
    );

    /* ===================================
       DATA
    =================================== */

    const reservation = response?.data || response?.result || null;

    if (!reservation) {
      throw new Error("Data reservasi tidak ditemukan.");
    }

    /* ===================================
       RENDER
    =================================== */

    renderReservation(reservation);
  } catch (error) {
    console.error("RESERVATION LOOKUP ERROR:", error);

    showError(error?.message || "Reservasi tidak dapat ditemukan.");
  } finally {
    setLoading(false);
  }
}

/* =========================================
   RENDER RESERVATION
========================================= */

function renderReservation(reservation = {}) {
  const kode = escapeHtml(reservation.kode || "-");

  const namaTamu = escapeHtml(reservation.namaTamu || "-");

  const penginapanNama = escapeHtml(reservation.penginapanNama || "-");

  const nomorKamar = escapeHtml(reservation.nomorKamar || "-");

  const tipeKamar = escapeHtml(reservation.tipeKamar || "-");

  const checkIn = formatDate(reservation.checkIn);

  const checkOut = formatDate(reservation.checkOut);

  const dewasa = Number(reservation.dewasa || 0);

  const anak = Number(reservation.anak || 0);

  const status = formatStatus(reservation.status);

  const paymentStatus = String(reservation.paymentStatus || "")
    .trim()
    .toUpperCase();

  const paymentAction = getPaymentAction(reservation);

  const total = formatCurrency(reservation.grandTotal);

  lookupResult.innerHTML = `

    <article class="reservation-result-card">

      <!-- =================================
           HEADER
      ================================== -->

      <div class="reservation-result-header">

        <div class="reservation-result-code-label">
          RESERVATION CODE
        </div>

        <h2 class="reservation-result-code">
          ${kode}
        </h2>

      </div>


      <!-- =================================
           BODY
      ================================== -->

      <div class="reservation-result-body">

        <!-- PROPERTY -->

        <div class="reservation-result-property">

          <div class="reservation-result-property-label">
            GUEST
          </div>

          <div class="reservation-result-property-name">
            ${namaTamu}
          </div>

          <div class="reservation-result-status">
            ${escapeHtml(status)}
          </div>

        </div>


        <!-- INFO -->

        <div class="reservation-result-grid">

          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              STAY
            </div>

            <div class="reservation-result-item-value">
              ${penginapanNama}
            </div>

          </div>


          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              ROOM
            </div>

            <div class="reservation-result-item-value">
              ${nomorKamar}
              ${tipeKamar !== "-" ? `<br>${tipeKamar}` : ""}
            </div>

          </div>


          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              CHECK-IN
            </div>

            <div class="reservation-result-item-value">
              ${checkIn}
            </div>

          </div>


          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              CHECK-OUT
            </div>

            <div class="reservation-result-item-value">
              ${checkOut}
            </div>

          </div>


          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              GUESTS
            </div>

            <div class="reservation-result-item-value">
              ${dewasa} Adult${dewasa !== 1 ? "s" : ""}
              ${anak > 0 ? ` · ${anak} Child${anak !== 1 ? "ren" : ""}` : ""}
            </div>

          </div>


          <div class="reservation-result-item">

            <div class="reservation-result-item-label">
              CHANNEL
            </div>

            <div class="reservation-result-item-value">
              ${escapeHtml(reservation.channel || "-")}
            </div>

          </div>

        </div>


        <!-- TOTAL -->

        <div class="reservation-result-total">

          <span class="reservation-result-total-label">
            Total reservation
          </span>

          <strong class="reservation-result-total-value">
            ${total}
          </strong>

        </div>

      </div>

      <!-- =================================
            CONTINUE PAYMENT
        ================================= -->

        ${
          paymentAction.type === "PAYMENT_REQUIRED"
            ? `

          <button
            type="button"
            class="reservation-lookup-continue"
            id="continuePaymentButton"
          >
            Continue Payment →
          </button>

        `
            : ""
        }


        ${
          paymentAction.type === "PAYMENT_PENDING"
            ? `

          <button
            type="button"
            class="reservation-lookup-continue is-disabled"
            disabled
          >
            Payment Submitted
          </button>

        `
            : ""
        }


        ${
          paymentAction.type === "PAYMENT_REJECTED"
            ? `

          <button
            type="button"
            class="reservation-lookup-continue"
            id="continuePaymentButton"
          >
            Pay Again →
          </button>

        `
            : ""
        }


      <!-- =================================
           FOOTER
      ================================== -->

      <div class="reservation-result-footer">

        <p>
          Reservation details retrieved successfully.
        </p>

      </div>

    </article>

  `;

  const continuePaymentButton = document.getElementById(
    "continuePaymentButton",
  );

  continuePaymentButton?.addEventListener("click", () => {
    const penginapanId = reservation.penginapanId || "";

    const kode = reservation.kode || "";

    if (!penginapanId || !kode) {
      return;
    }

    sessionStorage.setItem(
      "publicReservationRecovery",
      JSON.stringify(reservation),
    );

    const url =
      `./penginapan-detail.html` +
      `?id=${encodeURIComponent(penginapanId)}` +
      `&reservation=${encodeURIComponent(kode)}`;

    window.location.href = url;
  });

  /* =====================================
     SHOW RESULT
  ===================================== */

  lookupResult.hidden = false;

  /*
   * Scroll ke hasil hanya kalau
   * result berada di bawah viewport.
   */

  setTimeout(function () {
    lookupResult.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 50);
}

/* =========================================
   LOADING STATE
========================================= */

function setLoading(loading) {
  if (!lookupButton) {
    return;
  }

  lookupButton.disabled = loading;

  if (loading) {
    lookupButton.textContent = "Finding reservation...";
  } else {
    lookupButton.textContent = "Find reservation";
  }
}

/* =========================================
   ERROR
========================================= */

function showError(message) {
  if (!lookupError) {
    return;
  }

  lookupError.textContent = message;

  lookupError.hidden = false;
}

function hideError() {
  if (!lookupError) {
    return;
  }

  lookupError.textContent = "";

  lookupError.hidden = true;
}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(String(value));
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPaymentAction(reservation) {
  const status = String(reservation?.status || "")
    .trim()
    .toUpperCase();

  const paymentStatus = String(reservation?.paymentStatus || "")
    .trim()
    .toUpperCase();

  /* ================================
     BELUM BAYAR
  ================================= */

  if (status === "DRAFT" && (!paymentStatus || paymentStatus === "UNPAID")) {
    return {
      type: "PAYMENT_REQUIRED",
      label: "Continue Payment",
      disabled: false,
    };
  }

  /* ================================
     SUDAH SUBMIT
  ================================= */

  if (paymentStatus === "PENDING") {
    return {
      type: "PAYMENT_PENDING",
      label: "Payment Submitted",
      disabled: true,
    };
  }

  /* ================================
     DITOLAK
  ================================= */

  if (paymentStatus === "REJECTED") {
    return {
      type: "PAYMENT_REJECTED",
      label: "Pay Again",
      disabled: false,
    };
  }

  /* ================================
     SUDAH BOOKED / CHECK IN /
     COMPLETED
  ================================= */

  return {
    type: "NO_PAYMENT",
    label: "",
    disabled: true,
  };
}

/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* =========================================
   FORMAT STATUS
========================================= */

function formatStatus(status) {
  const value = String(status || "")
    .trim()
    .toUpperCase();

  const labels = {
    DRAFT: "RESERVATION ON HOLD",

    BOOKED: "BOOKED",

    CHECK_IN: "CHECKED IN",

    CHECK_OUT: "CHECKED OUT",

    COMPLETED: "COMPLETED",

    CANCELLED: "CANCELLED",

    CANCELED: "CANCELLED",
  };

  return labels[value] || value || "UNKNOWN";
}

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
