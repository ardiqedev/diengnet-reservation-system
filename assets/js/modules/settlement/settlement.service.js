/* =========================================
   SETTLEMENT SERVICE
========================================= */

const SettlementService = (() => {
  /* =====================================
     GET ELIGIBLE
  ===================================== */

  async function getEligible(ownerId, periodStart, periodEnd) {
    if (!ownerId) {
      return {
        success: false,
        message: "Owner wajib diisi.",
        data: [],
        meta: {},
      };
    }

    if (!periodStart || !periodEnd) {
      return {
        success: false,
        message: "Periode settlement wajib diisi.",
        data: [],
        meta: {},
      };
    }

    return API.post("settlement.eligible", {
      ownerId,
      periodStart,
      periodEnd,
    });
  }

  /* =====================================
     GET SUMMARY
  ===================================== */

  async function getSummary(ownerId, periodStart, periodEnd) {
    if (!ownerId) {
      return {
        success: false,
        message: "Owner wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!periodStart || !periodEnd) {
      return {
        success: false,
        message: "Periode settlement wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.summary", {
      ownerId,
      periodStart,
      periodEnd,
    });
  }

  /* =====================================
     GET EXISTING SETTLEMENT
  ===================================== */

  async function getByOwnerAndPeriod(ownerId, periodStart, periodEnd) {
    if (!ownerId) {
      return {
        success: false,
        message: "Owner wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!periodStart || !periodEnd) {
      return {
        success: false,
        message: "Periode settlement wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.detail", {
      ownerId,
      periodStart,
      periodEnd,
    });
  }

  /* =====================================
     CREATE
  ===================================== */

  async function create(ownerId, periodStart, periodEnd) {
    if (!ownerId) {
      return {
        success: false,
        message: "Owner wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!periodStart || !periodEnd) {
      return {
        success: false,
        message: "Periode settlement wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.store", {
      ownerId,
      periodStart,
      periodEnd,
    });
  }

  /* =====================================
   ADD RESERVATION
===================================== */

  async function addReservation(settlementId, reservationId) {
    if (!settlementId) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!reservationId) {
      return {
        success: false,
        message: "Reservation ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.addReservation", {
      settlementId,
      reservationId,
    });
  }

  /* =====================================
     MARK READY
  ===================================== */

  async function markReady(id) {
    if (!id) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.markReady", {
      id,
    });
  }

  /* =====================================
     SUBMIT TO BANK
  ===================================== */

  async function submitToBank(id) {
    if (!id) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.submitToBank", {
      id,
    });
  }

  /* =====================================
     MARK PROCESSING
  ===================================== */

  async function markProcessing(id) {
    if (!id) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.markProcessing", {
      id,
    });
  }

  /* =====================================
     MARK PAID
  ===================================== */

  async function markPaid(id, bankTransferReference, paidBy) {
    if (!id) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!bankTransferReference) {
      return {
        success: false,
        message: "Referensi transfer bank wajib diisi.",
        data: null,
        meta: {},
      };
    }

    if (!paidBy) {
      return {
        success: false,
        message: "Paid By wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.markPaid", {
      id,
      bankTransferReference,
      paidBy,
    });
  }

  async function markProcessing(id) {
    id = String(id || "").trim();

    if (!id) {
      return {
        success: false,
        message: "Settlement ID wajib diisi.",
        data: null,
        meta: {},
      };
    }

    return API.post("settlement.markProcessing", {
      id,
    });
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    getEligible,

    getSummary,

    getByOwnerAndPeriod,

    create,

    addReservation,

    markReady,

    submitToBank,

    markProcessing,

    markPaid,
  };
})();
