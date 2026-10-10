/* =========================================================
   DIENG STAY
   OWNER PENCAIRAN
========================================================= */

const OwnerPencairan = (() => {
  let initialized = false;

  /* =======================================================
     DUMMY DATA
  ======================================================= */

  const payouts = [
    {
      id: "SET-261006184158-9737",

      period: "01 Oktober – 31 Oktober 2026",

      amount: 2150000,

      totalReservation: 3,

      status: "PAID",

      paidAt: "07 Oktober 2026",

      bankName: "BCA",

      bankAccountNumber: "1234567890",

      bankAccountName: "Chasby",

      reference: "toodsfmlsdf",
    },

    {
      id: "SET-261006204137-6140",

      period: "06 Oktober 2026",

      amount: 500000,

      totalReservation: 1,

      status: "PAID",

      paidAt: "06 Oktober 2026",

      bankName: "BCA",

      bankAccountNumber: "1234567890",

      bankAccountName: "Chasby",

      reference: "TEST-BANK-TRANSFER-20261006-001",
    },

    {
      id: "SET-261008-0001",

      period: "01 November – 30 November 2026",

      amount: 900000,

      totalReservation: 2,

      status: "PENDING",

      paidAt: "",

      bankName: "BCA",

      bankAccountNumber: "1234567890",

      bankAccountName: "Chasby",

      reference: "",
    },
  ];

  /* =======================================================
     INIT
  ======================================================= */

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[OWNER PENCAIRAN] INIT");

    render();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  function render() {
    updateSummary();

    renderList();

    renderIcons();
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  function updateSummary() {
    const pending = payouts
      .filter((item) => item.status === "PENDING")
      .reduce((total, item) => total + Number(item.amount || 0), 0);

    const paid = payouts
      .filter((item) => item.status === "PAID")
      .reduce((total, item) => total + Number(item.amount || 0), 0);

    const pendingElement = document.getElementById("pendingPayoutTotal");

    const paidElement = document.getElementById("paidPayoutTotal");

    if (pendingElement) {
      pendingElement.textContent = formatCurrency(pending);
    }

    if (paidElement) {
      paidElement.textContent = formatCurrency(paid);
    }
  }

  /* =======================================================
     LIST
  ======================================================= */

  function renderList() {
    const container = document.getElementById("payoutList");

    if (!container) {
      return;
    }

    if (!Array.isArray(payouts) || payouts.length === 0) {
      container.innerHTML = `

        <div
          class="owner-payout-empty"
        >

          <div
            class="owner-payout-empty-icon"
          >

            <i
              data-lucide="wallet"
            ></i>

          </div>


          <strong>
            Belum ada pencairan
          </strong>


          <span>
            Riwayat pencairan Anda akan
            muncul di sini.
          </span>

        </div>

      `;

      return;
    }

    container.innerHTML = payouts.map((item) => renderPayout(item)).join("");
  }

  /* =======================================================
     PAYOUT CARD
  ======================================================= */

  function renderPayout(payout) {
    const isPaid = payout.status === "PAID";

    const statusLabel = isPaid ? "Sudah Cair" : "Belum Cair";

    const statusClass = isPaid ? "paid" : "pending";

    return `

      <article
        class="
          owner-payout-history-card
        "
      >


        <div
          class="
            owner-payout-history-header
          "
        >

          <div
            class="
              owner-payout-history-title
            "
          >

            <strong>
              Pencairan
            </strong>

            <span>
              ${escapeHtml(payout.period)}
            </span>

          </div>


          <span
            class="
              owner-payout-status
              ${statusClass}
            "
          >

            ${isPaid ? "✓" : "•"}

            ${statusLabel}

          </span>

        </div>



        <div
          class="
            owner-payout-history-amount
          "
        >

          <span>
            Total pencairan
          </span>

          <strong>
            ${formatCurrency(payout.amount)}
          </strong>

        </div>



        <div
          class="
            owner-payout-history-meta
          "
        >

          <div
            class="
              owner-payout-meta-item
            "
          >

            <span>
              Reservasi
            </span>

            <strong>
              ${Number(payout.totalReservation || 0)}
              reservasi
            </strong>

          </div>


          <div
            class="
              owner-payout-meta-item
            "
          >

            <span>
              ${isPaid ? "Tanggal cair" : "Status"}

            </span>

            <strong>

              ${isPaid ? escapeHtml(payout.paidAt) : "Menunggu pencairan"}

            </strong>

          </div>

        </div>



        ${
          isPaid
            ? `

              <div
                class="
                  owner-payout-bank
                "
              >

                <div
                  class="
                    owner-payout-bank-icon
                  "
                >

                  <i
                    data-lucide="landmark"
                  ></i>

                </div>


                <div
                  class="
                    owner-payout-bank-content
                  "
                >

                  <span>
                    Rekening pencairan
                  </span>

                  <strong>

                    ${escapeHtml(payout.bankName)}

                    ·

                    ${maskAccountNumber(payout.bankAccountNumber)}

                  </strong>

                </div>

              </div>

            `
            : ""
        }


      </article>

    `;
  }

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",

      currency: "IDR",

      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  /* =======================================================
     MASK ACCOUNT
  ======================================================= */

  function maskAccountNumber(value) {
    const account = String(value || "");

    if (account.length <= 4) {
      return account;
    }

    return "••••" + account.slice(-4);
  }

  /* =======================================================
     ICON
  ======================================================= */

  function renderIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  /* =======================================================
     ESCAPE
  ======================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     PUBLIC
  ======================================================= */

  return {
    init,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  OwnerPencairan.init();
});
