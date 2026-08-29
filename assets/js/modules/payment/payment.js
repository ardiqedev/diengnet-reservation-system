/* =========================================
   PAYMENT CONTROLLER
========================================= */

const Payment = (() => {
  /* =====================================
     STATE
  ===================================== */

  let booking = null;

  let payments = [];

  let currentView = "workspace";

  /* =====================================
     OPEN
  ===================================== */

  async function open(data = {}) {
    booking = data;

    currentView = "workspace";

    await load();
  }

  /* =====================================
     LOAD
  ===================================== */

  /* =====================================
   LOAD
===================================== */

  async function load() {
    if (!booking?.id) {
      console.error("[PAYMENT] Booking tidak valid:", booking);

      Toast.error("Data reservasi tidak valid.");

      return;
    }

    console.log("[PAYMENT] BOOKING:", booking);

    console.log("[PAYMENT] RESERVATION ID:", booking.id);

    try {
      const result = await PaymentService.getByReservationId(booking.id);

      console.log("[PAYMENT] LIST RESULT:", result);

      if (!result.success) {
        Toast.error(result.message || "Gagal memuat data pembayaran.");

        return;
      }

      payments = Array.isArray(result.data) ? result.data : [];

      console.log("[PAYMENT] PAYMENTS:", payments);

      render();
    } catch (error) {
      console.error("[PAYMENT] Load error:", error);

      Toast.error("Gagal memuat data pembayaran.");
    }
  }

  /* =====================================
     RENDER
  ===================================== */

  function render() {
    const options = getView();

    if (!Modal.isOpen()) {
      Modal.open(options);
    } else {
      Modal.setTitle(options.title);

      Modal.setSize(options.size);

      Modal.setBody(options.body);

      Modal.setFooter(options.footer);
    }

    bindEvents();
  }

  /* =====================================
     VIEW
  ===================================== */

  function getView() {
    switch (currentView) {
      case "form":
        return {
          title: "Tambah Pembayaran",

          size: "md",

          body: PaymentForm.render(booking),

          footer: "",
        };

      case "workspace":

      default:
        return {
          title: "Pembayaran",

          size: "lg",

          body: PaymentView.render(booking, payments),

          footer: "",
        };
    }
  }

  /* =====================================
     SHOW WORKSPACE
  ===================================== */

  function showWorkspace() {
    currentView = "workspace";

    render();
  }

  /* =====================================
     SHOW FORM
  ===================================== */

  function showForm() {
    currentView = "form";

    render();
  }

  /* =====================================
     EVENTS
  ===================================== */

  function bindEvents() {
    if (currentView === "form") {
      bindFormEvents();

      return;
    }

    bindWorkspaceEvents();
  }

  /* =====================================
     WORKSPACE EVENTS
  ===================================== */

  function bindWorkspaceEvents() {
    /* ---------------------------------
       ADD PAYMENT
    --------------------------------- */

    document
      .getElementById("btnAddPayment")
      ?.addEventListener("click", showForm);

    /* ---------------------------------
       VERIFY PAYMENT
    --------------------------------- */

    document
      .querySelectorAll('[data-action="verify-payment"]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          verifyPayment(button.dataset.paymentId);
        });
      });

    /* ---------------------------------
       REJECT PAYMENT
    --------------------------------- */

    document
      .querySelectorAll('[data-action="reject-payment"]')
      .forEach((button) => {
        button.addEventListener("click", () => {
          rejectPayment(button.dataset.paymentId);
        });
      });
  }

  /* =====================================
     FORM EVENTS
  ===================================== */

  function bindFormEvents() {
    Upload.init("paymentProof");

    togglePaymentFields();

    document
      .getElementById("paymentMethod")
      ?.addEventListener("change", togglePaymentFields);

    document
      .getElementById("btnCancelPayment")
      ?.addEventListener("click", showWorkspace);

    document
      .getElementById("btnSavePayment")
      ?.addEventListener("click", submit);
  }

  /* =====================================
     TOGGLE PAYMENT FIELDS
  ===================================== */

  function togglePaymentFields() {
    const method = document.getElementById("paymentMethod")?.value;

    const proofSection = document.getElementById("paymentProofSection");

    const referenceSection = document.getElementById("paymentReferenceSection");

    const needReference = [
      PaymentMethod.TRANSFER,

      PaymentMethod.QRIS,

      PaymentMethod.CREDIT_CARD,
    ].includes(method);

    if (referenceSection) {
      referenceSection.style.display = needReference ? "block" : "none";
    }

    if (proofSection) {
      proofSection.style.display = needReference ? "block" : "none";
    }
  }

  /* =====================================
   VERIFY PAYMENT
===================================== */

  async function verifyPayment(paymentId) {
    if (!paymentId) {
      Toast.error("Payment ID tidak valid.");

      return;
    }

    const confirmed = window.confirm(
      "Apakah pembayaran ini benar dan ingin diverifikasi?",
    );

    if (!confirmed) {
      return;
    }

    Loading.show();

    try {
      const result = await PaymentService.verify(paymentId, "USR001");

      if (!result.success) {
        Toast.error(result.message || "Gagal memverifikasi pembayaran.");

        return;
      }

      Toast.success(result.message || "Pembayaran berhasil diverifikasi.");

      await load();
      if (typeof Reservasi?.refresh === "function") {
        await Reservasi.refresh();
      }
    } catch (error) {
      console.error("[PAYMENT] Verify error:", error);

      Toast.error("Gagal memverifikasi pembayaran.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     REJECT PAYMENT
  ===================================== */

  /* =====================================
   REJECT PAYMENT
===================================== */

  async function rejectPayment(paymentId) {
    if (!paymentId) {
      Toast.error("Payment ID tidak valid.");

      return;
    }

    const confirmed = window.confirm("Apakah pembayaran ini ingin ditolak?");

    if (!confirmed) {
      return;
    }

    Loading.show();

    try {
      const result = await PaymentService.reject(paymentId);

      if (!result.success) {
        Toast.error(result.message || "Gagal menolak pembayaran.");

        return;
      }

      Toast.success(result.message || "Pembayaran berhasil ditolak.");

      await load();
      if (typeof Reservasi?.refresh === "function") {
        await Reservasi.refresh();
      }
    } catch (error) {
      console.error("[PAYMENT] Reject error:", error);

      Toast.error("Gagal menolak pembayaran.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     SUBMIT PAYMENT
  ===================================== */

  /* =====================================
   SUBMIT PAYMENT
===================================== */

  async function submit() {
    if (!booking?.id) {
      Toast.error("Data reservasi tidak valid.");

      return;
    }

    const payload = {
      reservationId: booking.id,

      ...Form.getData("#paymentForm"),
    };

    const proof = Upload.getFile("paymentProof");

    /* =================================
     VALIDATION
  ================================= */

    if (!PaymentValidator.validate(payload, proof, booking, payments)) {
      return;
    }

    Loading.show();

    try {
      const result = await PaymentService.save(payload, proof);

      if (!result.success) {
        Toast.error(result.message || "Pembayaran gagal disimpan.");

        return;
      }

      Toast.success(
        result.message ||
          "Pembayaran berhasil dikirim dan menunggu verifikasi.",
      );

      /*
       * Kembali ke workspace
       * setelah backend berhasil.
       */

      currentView = "workspace";

      await load();
    } catch (error) {
      console.error("[PAYMENT] Submit error:", error);

      Toast.error(error.message || "Pembayaran gagal disimpan.");
    } finally {
      Loading.hide();
    }
  }

  /* =====================================
     REFRESH
  ===================================== */

  async function refresh() {
    await load();
  }

  /* =====================================
     PUBLIC API
  ===================================== */

  return {
    open,

    refresh,

    showWorkspace,

    showForm,

    verifyPayment,

    rejectPayment,
  };
})();
