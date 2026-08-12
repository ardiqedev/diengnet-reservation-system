/* =========================================
   MODAL ENGINE
========================================= */

const Modal = {
  modal: null,

  dialog: null,

  /* =====================================
     INIT
  ===================================== */

  async init() {
    await Router.loadComponent("components/modal.html", "modalContainer");

    this.modal = document.getElementById("modal");

    this.dialog = this.modal.querySelector(".modal-dialog");

    this.bindEvents();
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    document.getElementById("modalClose")?.addEventListener("click", () => {
      this.close();
    });

    /* klik backdrop */

    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    /* tombol ESC */

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("show")) {
        this.close();
      }
    });
  },

  /* =====================================
     OPEN
  ===================================== */

  /* =====================================
   OPEN
===================================== */

  open(options = {}) {
    const {
      title = "",

      body = "",

      footer = "",

      size = "md",
    } = options;

    this.setSize(size);

    this.setTitle(title);

    this.setBody(body);

    this.setFooter(footer);

    this.modal.classList.add("show");

    document.body.style.overflow = "hidden";
  },
  /* =====================================
   SET TITLE
===================================== */

  setTitle(title = "") {
    document.getElementById("modalTitle").innerHTML = title;
  },

  /* =====================================
   SET BODY
===================================== */

  setBody(body = "") {
    const modalBody = document.getElementById("modalBody");

    modalBody.innerHTML = body;

    lucide.createIcons();

    const firstInput = modalBody.querySelector("input, select, textarea");

    firstInput?.focus();

    return modalBody;
  },

  /* =====================================
   SET FOOTER
===================================== */

  setFooter(footer = "") {
    document.getElementById("modalFooter").innerHTML = footer;

    lucide.createIcons();
  },

  /* =====================================
   SET SIZE
===================================== */

  setSize(size = "md") {
    this.dialog.className = "modal-dialog";

    this.dialog.classList.add(`modal-${size}`);
  },

  /* =====================================
   IS OPEN
===================================== */

  isOpen() {
    return this.modal?.classList.contains("show");
  },

  /* =====================================
     CLOSE
  ===================================== */

  close() {
    this.modal.classList.remove("show");

    document.body.style.overflow = "";
  },
};
