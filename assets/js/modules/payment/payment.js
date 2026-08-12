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
    Loading.show();

    try {
      payments = await PaymentService.getByBookingId(booking.id);

      render();
    } catch (error) {
      console.error(error);

      Toast.error("Gagal memuat data pembayaran.");
    } finally {
      Loading.hide();
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

  function showWorkspace() {
    currentView = "workspace";

    render();
  }

  function showForm() {
    currentView = "form";

    render();
  }

  /* =====================================
     EVENTS
  ===================================== */

  function bindEvents() {
    switch (currentView) {
      case "form":
        bindFormEvents();
        break;

      case "workspace":
      default:
        bindWorkspaceEvents();
        break;
    }
  }

  function bindWorkspaceEvents() {
    document
      .getElementById("btnAddPayment")
      ?.addEventListener("click", showForm);
  }

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
     ACTION
  ===================================== */

  /* =====================================
   SUBMIT
===================================== */

  async function submit() {
    const payload = {
      bookingId: booking.id,

      ...Form.getData("#paymentForm"),
    };

    const proof = Upload.getFile("paymentProof");

    if (!PaymentValidator.validate(payload, proof)) {
      return;
    }

    await PaymentService.save(payload, proof);

    await refresh();

    showWorkspace();
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
  };
})();
