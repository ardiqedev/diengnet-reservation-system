/* =========================================
   LOADING ENGINE
========================================= */

const Loading = {
  overlay: null,

  /* =====================================
     INIT
  ===================================== */

  init() {
    // Gunakan overlay yang sudah ada jika tersedia
    const existing = document.getElementById("loadingOverlay");

    if (existing) {
      this.overlay = existing;
      return;
    }

    const overlay = document.createElement("div");

    overlay.id = "loadingOverlay";
    overlay.className = "loading-overlay";

    overlay.innerHTML = `
      <div class="loading-box">

        <i
          data-lucide="loader-circle"
          class="loading-icon">
        </i>

        <div
          id="loadingText"
          class="loading-text">
          Memuat...
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    // Simpan referensi sebelum ikon diproses
    this.overlay = overlay;

    // Render ikon Lucide
    if (typeof lucide !== "undefined") {
      lucide.createIcons();

      // Pastikan animasi terpasang pada SVG hasil render
      const icon = overlay.querySelector(".loading-icon");

      if (icon) {
        icon.style.setProperty(
          "animation",
          "loadingSpin 0.8s linear infinite",
          "important",
        );

        icon.style.setProperty("transform-origin", "center center");
      }
    }
  },

  /* =====================================
     SHOW
  ===================================== */

  show(text = "Memuat...") {
    this.init();

    if (!this.overlay) return;

    const loadingText = this.overlay.querySelector("#loadingText");

    if (loadingText) {
      loadingText.textContent = text;
    }

    this.overlay.classList.add("show");

    document.body.style.overflow = "hidden";
  },

  /* =====================================
     HIDE
  ===================================== */

  hide() {
    if (!this.overlay) {
      this.overlay = document.getElementById("loadingOverlay");
    }

    if (!this.overlay) return;

    this.overlay.classList.remove("show");

    document.body.style.overflow = "";
  },

  /* =====================================
     TOGGLE
  ===================================== */

  toggle(state, text = "Memuat...") {
    if (state) {
      this.show(text);
    } else {
      this.hide();
    }
  },
};
