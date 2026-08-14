/* =========================================
   DIENG NET
   PUBLIC — HOME
========================================= */

const PublicHome = (() => {
  /* =========================================
     CONFIG
  ========================================= */

  const CONFIG = {
    limit: 3,
    status: "Aktif",
  };

  /* =========================================
     STATE
  ========================================= */

  const state = {
    rows: [],
    loading: false,
  };

  /* =========================================
     ELEMENT
  ========================================= */

  function getStayList() {
    return document.getElementById("stayList");
  }

  /* =========================================
     INIT
  ========================================= */

  async function init() {
    console.log("[PublicHome] Init");

    const list = getStayList();

    if (!list) {
      console.warn("[PublicHome] #stayList tidak ditemukan.");

      return;
    }

    renderLoading();

    await load();
  }

  /* =========================================
     LOAD STAY
  ========================================= */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    renderLoading();

    try {
      console.log("[PublicHome] Load penginapan");

      const result = await API.post("penginapan.list", {
        page: 1,
        limit: CONFIG.limit,
        keyword: "",
        status: CONFIG.status,
      });

      console.log("[PublicHome] Result:", result);

      /*
       * Response backend:
       *
       * {
       *   success: true,
       *   data: {
       *     rows: [],
       *     page: 1,
       *     limit: 3,
       *     total: ...
       *   }
       * }
       */

      if (!result || result.success === false) {
        throw new Error(result?.message || "Gagal memuat data penginapan.");
      }

      const data = result?.data || {};

      state.rows = Array.isArray(data.rows)
        ? data.rows.slice(0, CONFIG.limit)
        : [];

      console.log("[PublicHome] Rows:", state.rows);

      render();
    } catch (error) {
      console.error("[PublicHome] Load error:", error);

      state.rows = [];

      renderError(error?.message || "Gagal memuat penginapan.");
    } finally {
      state.loading = false;
    }
  }

  /* =========================================
     RENDER
  ========================================= */

  function render() {
    const container = getStayList();

    if (!container) {
      return;
    }

    if (!state.rows.length) {
      renderEmpty();

      return;
    }

    container.innerHTML = state.rows.map((item) => renderCard(item)).join("");
  }

  /* =========================================
     CARD
  ========================================= */

  function renderCard(item = {}) {
    const id = item.id || "";

    const name = escapeHtml(item.nama || "Penginapan Dieng");

    const location = escapeHtml(formatLocation(item));

    const description = escapeHtml(
      item.deskripsi || "Temukan tempat menginap yang nyaman di kawasan Dieng.",
    );

    const image = getImageUrl(item);

    /*
     * Untuk sekarang semua card
     * menuju halaman listing penginapan.
     *
     * Detail page tidak kita aktifkan
     * dari homepage dulu.
     */

    const detailUrl = "penginapan.html";

    return `
      <article
        class="stay-card"
        data-id="${escapeAttribute(id)}"
      >

        <!-- =====================================
             IMAGE
        ====================================== -->

        <a
          href="${detailUrl}"
          class="stay-image"
          aria-label="Lihat ${name}"
        >

          ${
            image
              ? `
                <img
                  src="${escapeAttribute(image)}"
                  alt="${name}"
                  loading="lazy"
                />
              `
              : `
                <div
                  class="stay-image-placeholder"
                  aria-hidden="true"
                ></div>
              `
          }

        </a>


        <!-- =====================================
             CONTENT
        ====================================== -->

        <div class="stay-content">

          <span class="stay-location">
            ${location}
          </span>


          <h3>
            ${name}
          </h3>


          <p>
            ${description}
          </p>


          <a
            href="${detailUrl}"
            class="text-link"
          >
            Explore stay
            <span>→</span>
          </a>

        </div>

      </article>
    `;
  }

  /* =========================================
     LOCATION
  ========================================= */

  function formatLocation(item = {}) {
    const parts = [];

    if (item.desa) {
      parts.push(item.desa);
    }

    if (item.kecamatan) {
      parts.push(item.kecamatan);
    }

    if (!parts.length && item.kabupaten) {
      parts.push(item.kabupaten);
    }

    if (!parts.length && item.provinsi) {
      parts.push(item.provinsi);
    }

    if (!parts.length) {
      return "Dieng, Wonosobo";
    }

    return parts.join(", ");
  }

  /* =========================================
     IMAGE
  ========================================= */

  function getImageUrl(item = {}) {
    const candidates = [
      item.coverUrl,
      item.cover_url,

      item.imageUrl,
      item.image_url,

      item.fotoUrl,
      item.foto_url,

      item.thumbnailUrl,
      item.thumbnail_url,

      item.cover?.url,
      item.cover?.downloadUrl,

      item.logoUrl,
      item.logo?.url,
    ];

    const source = candidates.find(
      (value) => typeof value === "string" && value.trim() !== "",
    );

    if (!source) {
      return "";
    }

    return normalizeImageUrl(source);
  }

  /* =========================================
     NORMALIZE IMAGE URL
  ========================================= */

  function normalizeImageUrl(url) {
    const value = String(url || "").trim();

    if (!value) {
      return "";
    }

    /*
     * Sudah thumbnail Google Drive
     */

    if (value.includes("drive.google.com/thumbnail")) {
      return value;
    }

    /*
     * Google Drive URL
     *
     * Contoh:
     * drive.google.com/file/d/FILE_ID/view
     */

    let match = value.match(/drive\.google\.com\/file\/d\/([^/]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /*
     * Google Drive open?id=
     */

    match = value.match(/drive\.google\.com\/open\?id=([^&]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /*
     * Google Drive uc?id=
     */

    match = value.match(/drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/);

    if (match) {
      return (
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(match[1]) +
        "&sz=w1200"
      );
    }

    /*
     * Google Drive URL dengan query ?id=
     */

    try {
      const parsed = new URL(value);

      const driveId = parsed.searchParams.get("id");

      if (driveId && parsed.hostname.includes("drive.google.com")) {
        return (
          "https://drive.google.com/thumbnail?id=" +
          encodeURIComponent(driveId) +
          "&sz=w1200"
        );
      }
    } catch (error) {
      /*
       * Bukan URL absolut.
       * Kita biarkan sebagai URL biasa.
       */
    }

    /*
     * URL biasa
     */

    return value;
  }

  /* =========================================
     LOADING
  ========================================= */

  function renderLoading() {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div
        class="stay-loading"
        aria-label="Memuat penginapan"
      >

        <div class="stay-loading-card"></div>

        <div class="stay-loading-card"></div>

        <div class="stay-loading-card"></div>

      </div>
    `;
  }

  /* =========================================
     EMPTY
  ========================================= */

  function renderEmpty() {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="stay-empty">

        <h3>
          No stays available
        </h3>

        <p>
          Belum ada penginapan yang
          tersedia saat ini.
        </p>

      </div>
    `;
  }

  /* =========================================
     ERROR
  ========================================= */

  function renderError(message) {
    const container = getStayList();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="stay-error">

        <h3>
          Penginapan belum dapat dimuat
        </h3>

        <p>
          ${escapeHtml(message)}
        </p>

        <button
          type="button"
          class="stay-retry-btn"
        >
          Coba Lagi
        </button>

      </div>
    `;

    const retryButton = container.querySelector(".stay-retry-btn");

    if (retryButton) {
      retryButton.addEventListener("click", load);
    }
  }

  /* =========================================
     ESCAPE HTML
  ========================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =========================================
     ESCAPE ATTRIBUTE
  ========================================= */

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  /* =========================================
     REFRESH
  ========================================= */

  async function refresh() {
    state.rows = [];

    await load();
  }

  /* =========================================
     PUBLIC API
  ========================================= */

  return {
    init,

    load,

    refresh,

    getState() {
      return {
        ...state,
        rows: [...state.rows],
      };
    },
  };
})();

/* =========================================
   AUTO INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  PublicHome.init();
});
