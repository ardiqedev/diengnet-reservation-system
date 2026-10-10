/* =========================================
   SETTLEMENT MODULE
========================================= */

const Settlement = (() => {
  /* =====================================
     STATE
  ===================================== */

  let owners = [];

  let owner = null;

  let ownerId = "";

  let periodStart = "";

  let periodEnd = "";

  let summary = {
    totalReservation: 0,
    totalAmount: 0,
    reservations: [],
  };

  let reservations = [];

  let settlement = null;

  let settlementDetails = [];

  let initialized = false;

  let loadRequestId = 0;

  /* =====================================
     INIT
  ===================================== */

  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[SETTLEMENT] INIT");

    setDefaultPeriod();

    render();

    await loadOwners();

    bindEvents();
  }

  /* =====================================
     DEFAULT PERIOD
  ===================================== */

  function setDefaultPeriod() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

    periodStart = `${year}-${month}-01`;

    periodEnd = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  }

  /* =====================================
     LOAD OWNERS
  ===================================== */

  async function loadOwners() {
    try {
      /*
       * Mengikuti endpoint USER
       * yang sudah tersedia di backend.
       */

      const result = await API.post("user.owner");

      console.log("[SETTLEMENT] OWNER RESULT:", result);

      if (!result.success) {
        Toast.error(result.message || "Gagal memuat data owner.");

        return;
      }

      owners = Array.isArray(result.data) ? result.data : [];

      render();

      bindEvents();
    } catch (error) {
      console.error("[SETTLEMENT] Load owner error:", error);

      Toast.error("Gagal memuat data owner.");
    }
  }

  /* =====================================
     LOAD SETTLEMENT
  ===================================== */

  /* =====================================
   LOAD SETTLEMENT
===================================== */

  async function loadSettlement() {
    if (!ownerId) {
      owner = null;

      reservations = [];

      settlement = null;

      settlementDetails = [];

      summary = {
        totalReservation: 0,
        totalAmount: 0,
        reservations: [],
      };

      render();

      bindEvents();

      return;
    }

    if (!periodStart || !periodEnd) {
      Toast.error("Periode settlement wajib diisi.");

      return;
    }

    if (periodStart > periodEnd) {
      Toast.error("Periode mulai tidak boleh melebihi periode akhir.");

      return;
    }

    /* =================================
     REQUEST GUARD
  ================================= */

    const requestId = ++loadRequestId;

    Loading.show();

    try {
      console.log("[SETTLEMENT] LOAD:", {
        requestId,
        ownerId,
        periodStart,
        periodEnd,
      });

      const [summaryResult, eligibleResult, settlementResult] =
        await Promise.all([
          SettlementService.getSummary(ownerId, periodStart, periodEnd),

          SettlementService.getEligible(ownerId, periodStart, periodEnd),

          SettlementService.getByOwnerAndPeriod(
            ownerId,
            periodStart,
            periodEnd,
          ),
        ]);

      /* =================================
       IGNORE OLD REQUEST
    ================================= */

      if (requestId !== loadRequestId) {
        console.log("[SETTLEMENT] IGNORE OLD REQUEST:", requestId);

        return;
      }

      console.log("[SETTLEMENT] SUMMARY RESULT:", summaryResult);

      console.log("[SETTLEMENT] ELIGIBLE RESULT:", eligibleResult);

      console.log("[SETTLEMENT] EXISTING RESULT:", settlementResult);

      /* =================================
       VALIDASI SUMMARY
    ================================= */

      if (!summaryResult.success) {
        Toast.error(
          summaryResult.message || "Gagal memuat summary settlement.",
        );

        return;
      }

      /* =================================
       VALIDASI ELIGIBLE
    ================================= */

      if (!eligibleResult.success) {
        Toast.error(
          eligibleResult.message || "Gagal memuat reservasi eligible.",
        );

        return;
      }

      /* =================================
       VALIDASI EXISTING SETTLEMENT
    ================================= */

      if (!settlementResult.success) {
        Toast.error(
          settlementResult.message || "Gagal memuat settlement existing.",
        );

        return;
      }

      /* =================================
       SET STATE
    ================================= */

      summary = summaryResult.data || {
        totalReservation: 0,
        totalAmount: 0,
        reservations: [],
      };

      reservations = Array.isArray(eligibleResult.data)
        ? eligibleResult.data
        : [];

      settlement = settlementResult.data?.settlement || null;

      settlementDetails = Array.isArray(settlementResult.data?.details)
        ? settlementResult.data.details
        : [];

      /* =================================
       OWNER
    ================================= */

      owner =
        owners.find(
          (item) =>
            String(item.id || item.userId || item.ownerId || "") ===
            String(ownerId),
        ) || null;

      /* =================================
       RENDER
    ================================= */

      render();

      bindEvents();
    } catch (error) {
      /* =================================
       IGNORE ERROR FROM OLD REQUEST
    ================================= */

      if (requestId !== loadRequestId) {
        console.log("[SETTLEMENT] IGNORE OLD REQUEST ERROR:", requestId);

        return;
      }

      console.error("[SETTLEMENT] Load error:", error);

      Toast.error(error.message || "Gagal memuat settlement.");
    } finally {
      /*
       * Hanya request terbaru yang
       * boleh menutup loading.
       */

      if (requestId === loadRequestId) {
        Loading.hide();
      }
    }
  }

  /* =====================================
     CREATE SETTLEMENT
  ===================================== */

  async function createSettlement() {
    if (!ownerId) {
      Toast.error("Owner wajib dipilih.");

      return;
    }

    if (!periodStart || !periodEnd) {
      Toast.error("Periode settlement wajib diisi.");

      return;
    }

    if (periodStart > periodEnd) {
      Toast.error("Periode mulai tidak boleh melebihi periode akhir.");

      return;
    }

    if (!Array.isArray(reservations) || reservations.length === 0) {
      Toast.error("Tidak ada reservasi eligible untuk dibuat.");

      return;
    }

    const button = document.getElementById("btnCreateSettlement");

    if (button) {
      button.disabled = true;

      button.textContent = "Membuat...";
    }

    try {
      console.log("[SETTLEMENT] CREATE:", {
        ownerId,
        periodStart,
        periodEnd,
      });

      const result = await SettlementService.create(
        ownerId,
        periodStart,
        periodEnd,
      );

      console.log("[SETTLEMENT] CREATE RESULT:", result);

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal membuat settlement.");

        return;
      }

      /*
       * Settlement hasil create
       * tidak disimpan ke state manual.
       *
       * loadSettlement() akan mengambil
       * settlement terbaru dari backend.
       */

      Toast.success("Settlement berhasil dibuat.");

      /*
       * Reload data.
       *
       * Reservation yang sudah masuk
       * settlement detail seharusnya
       * tidak lagi muncul sebagai eligible.
       */

      await loadSettlement();
    } catch (error) {
      console.error("[SETTLEMENT] CREATE ERROR:", error);

      Toast.error(error?.message || "Gagal membuat settlement.");
    } finally {
      const currentButton = document.getElementById("btnCreateSettlement");

      if (currentButton) {
        currentButton.disabled = false;

        currentButton.textContent = "Buat Settlement";
      }
    }
  }

  /* =====================================
   MARK READY
===================================== */

  async function markReadySettlement() {
    if (!settlement || !settlement.id) {
      Toast.error("Settlement belum tersedia.");

      return;
    }

    if (settlement.status !== "DRAFT") {
      Toast.error("Settlement sudah tidak berada pada status DRAFT.");

      return;
    }

    if (
      !Number(settlement.totalReservation) ||
      Number(settlement.totalReservation) <= 0
    ) {
      Toast.error("Settlement belum memiliki reservation.");

      return;
    }

    const button = document.getElementById("btnMarkSettlementReady");

    if (button) {
      button.disabled = true;
      button.textContent = "Memproses...";
    }

    try {
      console.log("[SETTLEMENT] MARK READY:", settlement.id);

      const result = await SettlementService.markReady(settlement.id);

      console.log("[SETTLEMENT] MARK READY RESULT:", result);

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal menandai settlement READY.");

        return;
      }

      Toast.success("Settlement berhasil ditandai siap dicairkan.");

      await loadSettlement();
    } catch (error) {
      console.error("[SETTLEMENT] MARK READY ERROR:", error);

      Toast.error(error?.message || "Gagal menandai settlement READY.");
    } finally {
      const currentButton = document.getElementById("btnMarkSettlementReady");

      if (currentButton) {
        currentButton.disabled = false;
        currentButton.textContent = "Tandai Siap Dicairkan";
      }
    }
  }

  /* =====================================
   SUBMIT TO BANK
===================================== */

  async function submitSettlementToBank() {
    if (!settlement || !settlement.id) {
      Toast.error("Settlement belum tersedia.");

      return;
    }

    if (settlement.status !== "READY") {
      Toast.error("Settlement harus berstatus READY untuk diajukan ke bank.");

      return;
    }

    const button = document.getElementById("btnSubmitSettlementBank");

    if (button) {
      button.disabled = true;

      button.textContent = "Memproses...";
    }

    try {
      console.log("[SETTLEMENT] SUBMIT TO BANK:", settlement.id);

      const result = await SettlementService.submitToBank(settlement.id);

      console.log("[SETTLEMENT] SUBMIT TO BANK RESULT:", result);

      if (!result || !result.success) {
        Toast.error(result?.message || "Gagal mengajukan settlement ke bank.");

        return;
      }

      Toast.success("Settlement berhasil diajukan ke bank.");

      await loadSettlement();
    } catch (error) {
      console.error("[SETTLEMENT] SUBMIT TO BANK ERROR:", error);

      Toast.error(error?.message || "Gagal mengajukan settlement ke bank.");
    } finally {
      const currentButton = document.getElementById("btnSubmitSettlementBank");

      if (currentButton) {
        currentButton.disabled = false;

        currentButton.textContent = "Ajukan ke Bank";
      }
    }
  }

  /* =====================================
   MARK PROCESSING
===================================== */

  async function markProcessingSettlement() {
    if (!settlement || !settlement.id) {
      Toast.error("Settlement belum tersedia.");
      return;
    }

    if (settlement.status !== "SUBMITTED_TO_BANK") {
      Toast.error(
        "Settlement harus berstatus Diajukan ke Bank untuk diproses.",
      );

      return;
    }

    const button = document.getElementById("btnMarkSettlementProcessing");

    if (button) {
      button.disabled = true;

      button.textContent = "Memproses...";
    }

    try {
      console.log("[SETTLEMENT] MARK PROCESSING:", settlement.id);

      const result = await SettlementService.markProcessing(settlement.id);

      console.log("[SETTLEMENT] MARK PROCESSING RESULT:", result);

      if (!result || !result.success) {
        Toast.error(
          result?.message || "Gagal mengubah settlement menjadi PROCESSING.",
        );

        return;
      }

      Toast.success("Settlement berhasil masuk proses pencairan.");

      await loadSettlement();
    } catch (error) {
      console.error("[SETTLEMENT] MARK PROCESSING ERROR:", error);

      Toast.error(
        error?.message || "Gagal mengubah settlement menjadi PROCESSING.",
      );
    } finally {
      const currentButton = document.getElementById(
        "btnMarkSettlementProcessing",
      );

      if (currentButton) {
        currentButton.disabled = false;

        currentButton.textContent = "Tandai Sedang Diproses";
      }
    }
  }

  /* =====================================
   MARK PAID
===================================== */

  async function markPaidSettlement() {
    if (!settlement || !settlement.id) {
      Toast.error("Settlement belum tersedia.");
      return;
    }

    if (settlement.status !== "PROCESSING") {
      Toast.error(
        "Settlement harus berstatus Sedang Diproses untuk ditandai sudah dibayar.",
      );

      return;
    }

    const user = typeof Auth?.getUser === "function" ? Auth.getUser() : null;

    const paidBy = String(
      user?.id || user?.userId || user?.username || "SYSTEM",
    ).trim();

    const content = `
    <div class="form-group">

      <label>
        Referensi Transfer Bank
      </label>

      <input
        type="text"
        id="settlementBankTransferReference"
        class="form-control"
        placeholder="Contoh: TRF-BCA-20261007-001"
        autocomplete="off"
      >

      <div class="form-help">
        Masukkan nomor referensi transaksi dari bank.
      </div>

    </div>


    <div class="form-group">

      <label>
        Dibayar Oleh
      </label>

      <input
        type="text"
        class="form-control"
        value="${escapeHtml(paidBy)}"
        disabled
      >

    </div>
  `;

    const footer = `
    <button
      type="button"
      class="btn btn-secondary"
      id="btnCancelMarkPaid"
    >
      Batal
    </button>


    <button
      type="button"
      class="btn btn-primary"
      id="btnConfirmMarkPaid"
    >
      Tandai Sudah Dibayar
    </button>
  `;

    Modal.open({
      title: "Konfirmasi Pembayaran Owner",
      content,
      footer,
      size: "sm",
    });

    document
      .getElementById("btnCancelMarkPaid")
      ?.addEventListener("click", () => {
        Modal.close();
      });

    document
      .getElementById("btnConfirmMarkPaid")
      ?.addEventListener("click", async () => {
        const referenceInput = document.getElementById(
          "settlementBankTransferReference",
        );

        const bankTransferReference = String(
          referenceInput?.value || "",
        ).trim();

        if (!bankTransferReference) {
          Toast.error("Referensi transfer bank wajib diisi.");

          return;
        }

        const button = document.getElementById("btnConfirmMarkPaid");

        if (button) {
          button.disabled = true;
          button.textContent = "Memproses...";
        }

        try {
          console.log("[SETTLEMENT] MARK PAID:", {
            settlementId: settlement.id,
            bankTransferReference,
            paidBy,
          });

          const result = await SettlementService.markPaid(
            settlement.id,
            bankTransferReference,
            paidBy,
          );

          console.log("[SETTLEMENT] MARK PAID RESULT:", result);

          if (!result || !result.success) {
            throw new Error(
              result?.message || "Gagal menandai settlement PAID.",
            );
          }

          Modal.close();

          Toast.success("Settlement berhasil ditandai sudah dibayar.");

          await loadSettlement();
        } catch (error) {
          console.error("[SETTLEMENT] MARK PAID ERROR:", error);

          Toast.error(error?.message || "Gagal menandai settlement PAID.");
        } finally {
          const currentButton = document.getElementById("btnConfirmMarkPaid");

          if (currentButton) {
            currentButton.disabled = false;
            currentButton.textContent = "Tandai Sudah Dibayar";
          }
        }
      });
  }

  /* =====================================
   ADD RESERVATION TO SETTLEMENT
===================================== */

  async function addReservationToSettlement(reservationId) {
    if (!settlement || !settlement.id) {
      Toast.error("Settlement belum tersedia.");

      return;
    }

    const settlementStatus = String(settlement.status || "")
      .trim()
      .toUpperCase();

    if (settlementStatus !== "DRAFT") {
      Toast.error("Reservation hanya dapat ditambahkan ke settlement DRAFT.");

      return;
    }

    if (!reservationId) {
      Toast.error("Reservation ID wajib diisi.");

      return;
    }

    const button = document.querySelector(
      `.btn-add-settlement[data-reservation-id="${reservationId}"]`,
    );

    if (button) {
      button.disabled = true;

      button.textContent = "Menambahkan...";
    }

    try {
      console.log("[SETTLEMENT] ADD RESERVATION:", {
        settlementId: settlement.id,

        reservationId,
      });

      const result = await SettlementService.addReservation(
        settlement.id,
        reservationId,
      );

      console.log("[SETTLEMENT] ADD RESERVATION RESULT:", result);

      if (!result || !result.success) {
        Toast.error(
          result?.message || "Gagal menambahkan reservation ke settlement.",
        );

        return;
      }

      Toast.success("Reservation berhasil ditambahkan ke settlement.");

      /*
       * Reload seluruh data settlement.
       *
       * Reservation yang sudah masuk
       * settlement detail tidak lagi
       * muncul sebagai eligible.
       *
       * Total reservation dan total amount
       * juga akan dihitung ulang dari backend.
       */

      await loadSettlement();
    } catch (error) {
      console.error("[SETTLEMENT] ADD RESERVATION ERROR:", error);

      Toast.error(
        error?.message || "Gagal menambahkan reservation ke settlement.",
      );
    } finally {
      /*
       * Setelah loadSettlement(),
       * element lama kemungkinan sudah
       * diganti. Jadi cek kembali.
       */

      const currentButton = document.querySelector(
        `.btn-add-settlement[data-reservation-id="${reservationId}"]`,
      );

      if (currentButton) {
        currentButton.disabled = false;

        currentButton.textContent = "Tambahkan";
      }
    }
  }

  /* =====================================
     RENDER
  ===================================== */

  function render() {
    const content = document.getElementById("content");

    if (!content) {
      console.error("[SETTLEMENT] #content tidak ditemukan.");

      return;
    }

    content.innerHTML = SettlementView.render({
      owners,

      owner,

      summary,

      reservations,

      settlement,

      settlementDetails,

      state: {
        ownerId,

        periodStart,

        periodEnd,
      },
    });

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  /* =====================================
     EVENTS
  ===================================== */

  function bindEvents() {
    /* =================================
     OWNER
  ================================= */

    document
      .getElementById("settlementOwner")
      ?.addEventListener("change", (event) => {
        ownerId = String(event.target.value || "").trim();
      });

    /* =================================
     PERIOD START
  ================================= */

    document
      .getElementById("settlementPeriodStart")
      ?.addEventListener("change", (event) => {
        periodStart = String(event.target.value || "").trim();
      });

    /* =================================
     PERIOD END
  ================================= */

    document
      .getElementById("settlementPeriodEnd")
      ?.addEventListener("change", (event) => {
        periodEnd = String(event.target.value || "").trim();
      });

    /* =================================
     LOAD
  ================================= */

    document
      .getElementById("btnLoadSettlement")
      ?.addEventListener("click", loadSettlement);

    /* =================================
     CREATE
  ================================= */

    document
      .getElementById("btnCreateSettlement")
      ?.addEventListener("click", createSettlement);

    /* =================================
     MARK READY
  ================================= */

    document
      .getElementById("btnMarkSettlementReady")
      ?.addEventListener("click", markReadySettlement);

    /* =================================
   SUBMIT TO BANK
================================= */

    document
      .getElementById("btnSubmitSettlementBank")
      ?.addEventListener("click", submitSettlementToBank);

    document
      .getElementById("btnMarkSettlementProcessing")
      ?.addEventListener("click", markProcessingSettlement);

    /* =================================
   MARK PAID
================================= */

    document
      .getElementById("btnMarkSettlementPaid")
      ?.addEventListener("click", markPaidSettlement);

    /* =================================
     ADD RESERVATION
  ================================= */

    document.querySelectorAll(".btn-add-settlement").forEach((button) => {
      button.addEventListener("click", () => {
        const reservationId = String(button.dataset.reservationId || "").trim();

        addReservationToSettlement(reservationId);
      });
    });
  }

  /* =====================================
     REFRESH
  ===================================== */

  async function refresh() {
    await loadSettlement();
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    init,

    refresh,
  };
})();
