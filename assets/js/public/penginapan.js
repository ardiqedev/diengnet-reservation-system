/* ============================================================
   DIENG NET
   PUBLIC — PENGINAPAN
   ============================================================

   Responsibility:
   - Load penginapan aktif
   - Search penginapan
   - Filter desa
   - Filter jenis penginapan
   - Render listing
   - Loading state
   - Empty state
   - Mobile menu
   - Navigation detail

   Architecture:

   PublicPenginapan
        ↓
      API.post()
        ↓
   penginapan.list
        ↓
   Router
        ↓
   PenginapanController
        ↓
   PenginapanService
        ↓
   PenginapanRepository
        ↓
   Spreadsheet

   IMPORTANT:
   - Tidak menggunakan Dummy
   - Tidak menggunakan PenginapanService langsung
   - Tidak membuat endpoint desa baru
   ============================================================ */

const PublicPenginapan = (() => {
  /* ==========================================================
     CONFIG
  ========================================================== */

  const config = {
    page: 1,

    limit: 100,

    perPage: 6,

    status: "Aktif",
  };

  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    page: config.page,

    limit: config.limit,

    keyword: "",

    desa: "",

    jenis: "",

    status: config.status,

    rows: [],

    total: 0,

    totalPages: 1,

    loading: false,

    /*
     * Harga public
     *
     * Key:
     * penginapanId
     *
     * Value:
     * starting price
     */
    pricesByPenginapan: {},
  };

  /* ==========================================================
     DOM
  ========================================================== */

  const dom = {};

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[PublicPenginapan] Init");

    cacheDom();

    bindEvents();

    initMobileMenu();

    renderLoading();

    await load();
  }

  /* ==========================================================
     CACHE DOM
  ========================================================== */

  function cacheDom() {
    dom.list = document.getElementById("stayList");

    dom.pagination = document.getElementById("paginationPenginapan");

    dom.count = document.getElementById("stayCount");

    dom.empty = document.getElementById("listingEmpty");

    dom.loading = document.getElementById("listingLoading");

    dom.search = document.getElementById("searchPenginapan");

    /*
     * Lokasi public = DESA
     */

    dom.desa = document.getElementById("filterDesa");

    /*
     * Jenis penginapan
     */

    dom.jenis = document.getElementById("filterTipe");

    /*
     * Tombol search
     */

    dom.filterButton = document.getElementById("filterButton");

    /*
     * Mobile menu
     */

    dom.mobileMenuBtn = document.getElementById("mobileMenuBtn");

    dom.mobileMenu = document.getElementById("mobileMenu");
  }

  /* ==========================================================
     EVENTS
  ========================================================== */

  function bindEvents() {
    /* ========================================================
       SEARCH BUTTON
       ======================================================== */

    if (dom.filterButton) {
      dom.filterButton.addEventListener("click", applyFilter);
    }

    /* ========================================================
       SEARCH ENTER
       ======================================================== */

    if (dom.search) {
      dom.search.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        applyFilter();
      });
    }

    /* ========================================================
       FILTER DESA
       ======================================================== */

    if (dom.desa) {
      dom.desa.addEventListener("change", applyFilter);
    }

    /* ========================================================
       FILTER JENIS
       ======================================================== */

    if (dom.jenis) {
      dom.jenis.addEventListener("change", applyFilter);
    }
  }

  /* ==========================================================
     LOAD
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    renderLoading();

    try {
      console.log("[PublicPenginapan] Request:", {
        page: state.page,
        limit: state.limit,
        keyword: state.keyword,
        status: state.status,
      });

      /*
       * Public TIDAK mengakses PenginapanService.
       *
       * Semua request melalui API engine.
       */

      const result = await API.post("penginapan.list", {
        page: state.page,

        limit: state.limit,

        keyword: state.keyword,

        status: state.status,
      });

      console.log("[PublicPenginapan] Result:", result);

      /*
       * Response backend:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     rows: [],
       *     page: 1,
       *     limit: 100,
       *     total: 3,
       *     totalPages: 1
       *   }
       * }
       */

      const data = result?.data || {};

      state.rows = Array.isArray(data.rows) ? data.rows : [];

      state.total = Number(data.total || state.rows.length);

      state.totalPages = Number(data.totalPages || 1);

      state.page = Number(data.page || state.page);

      console.log("[PublicPenginapan] Rows:", state.rows);

      await loadPrices();

      /*
       * Setelah data berhasil dimuat,
       * bangun option Desa dan Jenis.
       */

      renderDesaOptions();

      renderJenisOptions();

      /*
       * Render listing.
       */

      render();
    } catch (error) {
      console.error("[PublicPenginapan] Load error:", error);

      state.rows = [];

      state.total = 0;

      state.totalPages = 1;

      renderError(error?.message || "Gagal memuat data penginapan.");
    } finally {
      state.loading = false;

      hideLoading();
    }
  }

  /* ==========================================================
   LOAD PUBLIC PRICES
========================================================== */

  async function loadPrices() {
    try {
      console.log("[PublicPenginapan] Request harga public");

      const result = await API.post("harga.list", {
        page: 1,

        /*
         * Ambil semua harga dalam satu request.
         * Bukan request satu-satu per penginapan.
         */
        limit: 1000,

        keyword: "",
      });

      console.log("[PublicPenginapan] Harga result:", result);

      const rows = Array.isArray(result?.data?.rows) ? result.data.rows : [];

      /*
       * Reset
       */
      state.pricesByPenginapan = {};

      /*
       * Hanya harga yang bisa ditampilkan
       */
      const validPrices = rows.filter((row) => {
        /*
         * STATUS
         */
        const status = String(row.status || "")
          .trim()
          .toUpperCase();

        if (status && status !== "AKTIF") {
          return false;
        }

        /*
         * CHANNEL PUBLIC
         *
         * Jika channel tersedia,
         * gunakan WEBSITE.
         *
         * Jika data lama belum memiliki channel,
         * tetap kita izinkan agar backward compatible.
         */
        const channel = String(row.channelId || row.channel || "")
          .trim()
          .toUpperCase();

        if (channel && channel !== "WEBSITE") {
          return false;
        }

        /*
         * Minimal harus punya penginapan
         */
        if (!row.penginapanId) {
          return false;
        }

        return true;
      });

      /*
       * GROUP BY PENGINAPAN
       */
      validPrices.forEach((row) => {
        const penginapanId = String(row.penginapanId).trim();

        if (!state.pricesByPenginapan[penginapanId]) {
          state.pricesByPenginapan[penginapanId] = [];
        }

        state.pricesByPenginapan[penginapanId].push(row);
      });

      console.log(
        "[PublicPenginapan] Prices grouped:",
        state.pricesByPenginapan,
      );
    } catch (error) {
      console.error("[PublicPenginapan] Load harga error:", error);

      /*
       * Jangan membuat halaman penginapan gagal
       * hanya karena harga gagal dimuat.
       */

      state.pricesByPenginapan = {};
    }
  }

  /* ==========================================================
     APPLY FILTER
  ========================================================== */

  function applyFilter() {
    state.keyword = dom.search?.value?.trim() || "";

    state.desa = dom.desa?.value?.trim() || "";

    state.jenis = dom.jenis?.value?.trim() || "";

    state.page = 1;

    console.log("[PublicPenginapan] Filter:", {
      keyword: state.keyword,
      desa: state.desa,
      jenis: state.jenis,
    });

    render();
  }

  /* ==========================================================
     GET FILTERED ROWS
  ========================================================== */

  function getFilteredRows() {
    const keyword = String(state.keyword || "")
      .trim()
      .toLowerCase();

    const desa = String(state.desa || "")
      .trim()
      .toLowerCase();

    const jenis = String(state.jenis || "")
      .trim()
      .toLowerCase();

    return state.rows.filter((item) => {
      /* ====================================================
           SEARCH
           ==================================================== */

      const searchableText = [
        item.nama,

        item.jenis,

        item.kategori,

        item.desa,

        item.kecamatan,

        item.kabupaten,

        item.provinsi,

        item.alamat,

        item.deskripsi,
      ]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value))
        .join(" ")
        .toLowerCase();

      const matchKeyword = !keyword || searchableText.includes(keyword);

      /* ====================================================
           DESA
           ==================================================== */

      const itemDesa = String(item.desa || "")
        .trim()
        .toLowerCase();

      const matchDesa = !desa || itemDesa === desa;

      /* ====================================================
           JENIS
           ==================================================== */

      const itemJenis = String(item.jenis || item.kategori || "")
        .trim()
        .toLowerCase();

      const matchJenis = !jenis || itemJenis === jenis;

      /* ====================================================
           FINAL
           ==================================================== */

      return matchKeyword && matchDesa && matchJenis;
    });
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  function render() {
    if (!dom.list) {
      console.warn("[PublicPenginapan] #stayList tidak ditemukan.");

      return;
    }

    const rows = getFilteredRows();

    updateCount(rows.length);

    /* ========================================================
     EMPTY
  ======================================================== */

    if (!rows.length) {
      renderEmpty();

      renderPagination(0);

      return;
    }

    hideEmpty();

    /* ========================================================
     CLIENT-SIDE PAGINATION
  ======================================================== */

    const totalPages = Math.ceil(rows.length / config.perPage);

    /*
     * Pastikan page tetap valid.
     */

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    if (state.page < 1) {
      state.page = 1;
    }

    state.totalPages = totalPages;

    /* ========================================================
     SLICE CURRENT PAGE
  ======================================================== */

    const start = (state.page - 1) * config.perPage;

    const end = start + config.perPage;

    const pageRows = rows.slice(start, end);

    /* ========================================================
     RENDER CARD
  ======================================================== */

    dom.list.innerHTML = pageRows.map((item) => renderCard(item)).join("");

    /* ========================================================
     RENDER PAGINATION
  ======================================================== */

    renderPagination(totalPages);
  }

  /* ==========================================================
   PAGINATION
========================================================== */

  function renderPagination(totalPages) {
    if (!dom.pagination) {
      return;
    }

    /*
     * Tidak perlu pagination kalau hanya
     * ada satu halaman.
     */

    if (totalPages <= 1) {
      dom.pagination.innerHTML = "";

      return;
    }

    Pagination.render({
      target: "#paginationPenginapan",

      page: state.page,

      totalPages,

      onChange: (nextPage) => {
        state.page = nextPage;

        render();

        /*
         * Scroll kembali ke awal listing
         * supaya UX public lebih nyaman.
         */

        const listTop = dom.list?.getBoundingClientRect().top;

        if (listTop !== undefined) {
          window.scrollBy({
            top: listTop - 120,
            behavior: "smooth",
          });
        }
      },
    });
  }

  /* ==========================================================
     RENDER CARD
  ========================================================== */

  function renderCard(item = {}) {
    const id = item.id || "";

    const nama = item.nama || "Penginapan Dieng";

    const jenis = item.jenis || item.kategori || "Penginapan";

    /*
     * =========================================
     * LOCATION
     * =========================================
     */

    const desa = item.desa || "";

    const kabupaten = item.kabupaten || "";

    const lokasi =
      [desa, kabupaten].filter(Boolean).join(", ") || "Dieng, Wonosobo";

    /*
     * =========================================
     * ADDRESS
     * =========================================
     */

    const alamat = item.alamat || "Alamat penginapan belum tersedia.";

    /*
     * =========================================
     * IMAGE
     * =========================================
     */

    const image = resolveImage(item);

    /*
     * =========================================
     * DETAIL URL
     * =========================================
     */

    const detailUrl = getDetailUrl(item);

    /*
     * =========================================
     * STARTING PRICE
     * =========================================
     *
     * Tetap menggunakan object item.
     *
     * getStartingPrice() akan membaca:
     *
     * state.pricesByPenginapan[item.id]
     *
     */

    const startingPrice = getStartingPrice(item);

    return `

    <article
      class="stay-card"
      data-id="${escapeAttribute(id)}"
    >

      <!-- =========================================
           IMAGE
      ========================================== -->

      <a
        href="${detailUrl}"
        class="stay-image"
        aria-label="Lihat ${escapeAttribute(nama)}"
      >

        ${
          image
            ? `
              <img
                src="${escapeAttribute(image)}"
                alt="${escapeAttribute(nama)}"
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


      <!-- =========================================
           CONTENT
      ========================================== -->

      <div class="stay-content">


        <!-- =========================================
             LOCATION
        ========================================== -->

        <div class="stay-location">

          <i
            data-lucide="map-pin"
            aria-hidden="true"
          ></i>

          <span>
            ${escapeHtml(lokasi)}
          </span>

        </div>


        <!-- =========================================
             NAME
        ========================================== -->

        <h3>
          ${escapeHtml(nama)}
        </h3>


        <!-- =========================================
             ADDRESS
        ========================================== -->

        <p class="stay-address">
          ${escapeHtml(alamat)}
        </p>


        <!-- =========================================
             PRICE + TYPE
        ========================================== -->

        <div class="stay-card-footer">


          <!-- TYPE BADGE -->

          <span class="stay-type">
            ${escapeHtml(jenis)}
          </span>


          <!-- STARTING PRICE -->

          ${
            startingPrice > 0
              ? `
                <div class="stay-starting-price">

                  <span class="stay-price-label">
                    Mulai dari
                  </span>

                  <strong class="stay-price-value">
                    ${formatCurrency(startingPrice)}
                  </strong>

                  <span class="stay-price-unit">
                    /kamar/malam
                  </span>

                </div>
              `
              : ""
          }

        </div>


        <!-- =========================================
             VIEW STAY
        ========================================== -->

        <a
          href="${detailUrl}"
          class="text-link stay-view-link"
        >

          <span>
            View stay
          </span>

          <span
            class="stay-view-arrow"
            aria-hidden="true"
          >
            →
          </span>

        </a>


      </div>

    </article>

  `;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  /* =========================================================
   GET STARTING PRICE
========================================================= */

  /* =========================================================
   GET STARTING PRICE
========================================================= */

  function getStartingPrice(item = {}) {
    const penginapanId = String(item.id || "").trim();

    /*
     * PRIORITAS 1
     * Harga public yang sudah di-load dan
     * sudah di-group berdasarkan penginapan.
     */

    const groupedPrices = state.pricesByPenginapan?.[penginapanId] || [];

    if (groupedPrices.length) {
      const values = groupedPrices.flatMap((row) => [
        Number(row.hargaWeekday) || 0,
        Number(row.hargaWeekend) || 0,
      ]);

      const validValues = values.filter((price) => price > 0);

      if (validValues.length) {
        return Math.min(...validValues);
      }
    }

    /*
     * PRIORITAS 2
     * Jika backend suatu saat langsung mengirim
     * startingPrice.
     */

    const directPrice =
      Number(item.startingPrice) ||
      Number(item.harga) ||
      Number(item.price) ||
      0;

    if (directPrice > 0) {
      return directPrice;
    }

    /*
     * PRIORITAS 3
     * Fallback jika item membawa daftar harga.
     */

    const prices = Array.isArray(item.hargaMusim) ? item.hargaMusim : [];

    const values = prices
      .flatMap((price) => [
        Number(price.hargaWeekday) || 0,
        Number(price.hargaWeekend) || 0,
        Number(price.weekday) || 0,
        Number(price.weekend) || 0,
        Number(price.harga) || 0,
      ])
      .filter((price) => price > 0);

    return values.length ? Math.min(...values) : 0;
  }

  /* ==========================================================
     LOCATION
  ========================================================== */

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

  /* ==========================================================
     DESA OPTIONS
  ========================================================== */

  function renderDesaOptions() {
    if (!dom.desa) {
      return;
    }

    /*
     * Simpan value yang sedang dipilih.
     */

    const currentValue = state.desa;

    /*
     * Ambil desa dari rows.
     */

    const desaList = [
      ...new Set(
        state.rows

          .map((item) => String(item.desa || "").trim())

          .filter(Boolean),
      ),
    ];

    /*
     * Urutkan alfabetis.
     */

    desaList.sort((a, b) => a.localeCompare(b, "id"));

    dom.desa.innerHTML = `

      <option value="">
        All locations
      </option>

    `;

    desaList.forEach((desa) => {
      const option = document.createElement("option");

      option.value = desa;

      option.textContent = desa;

      if (desa === currentValue) {
        option.selected = true;
      }

      dom.desa.appendChild(option);
    });
  }

  /* ==========================================================
     JENIS OPTIONS
  ========================================================== */

  function renderJenisOptions() {
    if (!dom.jenis) {
      return;
    }

    const currentValue = state.jenis;

    const jenisList = [
      ...new Set(
        state.rows

          .map((item) => String(item.jenis || item.kategori || "").trim())

          .filter(Boolean),
      ),
    ];

    jenisList.sort((a, b) => a.localeCompare(b, "id"));

    dom.jenis.innerHTML = `

      <option value="">
        All types
      </option>

    `;

    jenisList.forEach((jenis) => {
      const option = document.createElement("option");

      option.value = jenis;

      option.textContent = jenis;

      if (jenis === currentValue) {
        option.selected = true;
      }

      dom.jenis.appendChild(option);
    });
  }

  /* ==========================================================
     DETAIL URL
  ========================================================== */

  function getDetailUrl(item = {}) {
    const slug = item.slug || item.id || "";

    if (!slug) {
      return "#";
    }

    return "penginapan-detail.html?slug=" + encodeURIComponent(slug);
  }

  /* =========================================
   DRIVE IMAGE URL
========================================= */

  function resolveDriveImage(url) {
    if (!url) {
      return "";
    }

    const match = url.match(/[?&]id=([^&]+)/);

    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
    }

    return url;
  }

  /* ==========================================================
     IMAGE
  ========================================================== */

  function resolveImage(item = {}) {
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

    const image = candidates.find(
      (value) => typeof value === "string" && value.trim() !== "",
    );

    return image ? resolveDriveImage(image.trim()) : "";
  }
  /* ==========================================================
     LOADING
  ========================================================== */

  function renderLoading() {
    if (dom.loading) {
      dom.loading.hidden = false;
    }

    if (dom.list) {
      dom.list.innerHTML = `

        <div
          class="stay-loading"
          aria-label="Memuat penginapan"
        >

          <div
            class="stay-loading-card"
          ></div>

          <div
            class="stay-loading-card"
          ></div>

          <div
            class="stay-loading-card"
          ></div>

        </div>

      `;
    }
  }

  /* ==========================================================
     HIDE LOADING
  ========================================================== */

  function hideLoading() {
    if (dom.loading) {
      dom.loading.hidden = true;
    }
  }

  /* ==========================================================
     EMPTY
  ========================================================== */

  function renderEmpty() {
    if (!dom.list) {
      return;
    }

    dom.list.innerHTML = `

      <div class="stay-empty">

        <div
          class="stay-empty-icon"
          aria-hidden="true"
        >
          🏡
        </div>


        <h3>
          No stays found.
        </h3>


        <p>
          Try changing your search
          or filter.
        </p>

      </div>

    `;

    hideEmpty();
  }

  /* ==========================================================
     HIDE EMPTY
  ========================================================== */

  function hideEmpty() {
    if (dom.empty) {
      dom.empty.hidden = true;
    }
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  function renderError(message) {
    if (!dom.list) {
      return;
    }

    dom.list.innerHTML = `

      <div class="stay-error">

        <h3>
          Penginapan belum dapat dimuat
        </h3>


        <p>

          ${escapeHtml(message)}

        </p>


        <button
          type="button"
          class="btn btn-dark stay-retry-btn"
        >

          Coba Lagi

        </button>

      </div>

    `;

    hideEmpty();

    const retryButton = dom.list.querySelector(".stay-retry-btn");

    if (retryButton) {
      retryButton.addEventListener("click", load);
    }
  }

  /* ==========================================================
     COUNT
  ========================================================== */

  function updateCount(count) {
    if (!dom.count) {
      return;
    }

    dom.count.textContent = `${count} ${count === 1 ? "stay" : "stays"}`;
  }

  /* ==========================================================
     REFRESH
  ========================================================== */

  async function refresh() {
    state.page = 1;

    await load();
  }

  /* ==========================================================
     MOBILE MENU
  ========================================================== */

  function initMobileMenu() {
    const button = dom.mobileMenuBtn;

    const menu = dom.mobileMenu;

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");

      button.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");

        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =========================================
   BOOKING UI
========================================= */

  const BookingUI = (() => {
    let selectedRoom = null;

    const el = (id) => document.getElementById(id);

    /* =====================================
     INIT
  ===================================== */

    function init() {
      const priceButton = el("bookingPriceButton");

      if (priceButton) {
        priceButton.addEventListener("click", handleCheckPrice);
      }

      const continueButton = el("bookingContinueButton");

      if (continueButton) {
        continueButton.addEventListener("click", handleContinue);
      }
    }

    /* =====================================
     SELECT ROOM
  ===================================== */

    function selectRoom(room) {
      selectedRoom = room;

      const panel = el("bookingPanel");

      if (!panel) {
        return;
      }

      const roomName = el("bookingRoomName");

      if (roomName) {
        roomName.textContent = room.nama || "Room";
      }

      const roomPrice = el("bookingRoomPrice");

      if (roomPrice) {
        roomPrice.textContent = room.harga
          ? formatCurrency(room.harga)
          : "Harga mengikuti tanggal";
      }

      panel.hidden = false;

      panel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    /* =====================================
     CHECK PRICE
  ===================================== */

    async function handleCheckPrice() {
      hideError();

      const checkIn = el("bookingCheckIn")?.value;

      const checkOut = el("bookingCheckOut")?.value;

      const guests = Number(el("bookingGuests")?.value || 2);

      if (!selectedRoom) {
        showError("Silakan pilih kamar terlebih dahulu.");

        return;
      }

      if (!checkIn || !checkOut) {
        showError("Silakan pilih tanggal check-in dan check-out.");

        return;
      }

      if (checkOut <= checkIn) {
        showError("Tanggal check-out harus setelah check-in.");

        return;
      }

      const button = el("bookingPriceButton");

      setButtonLoading(button, true, "Checking price...");

      try {
        const result = await API.post("booking.price", {
          penginapanId: selectedRoom.penginapanId,

          tipeKamarId: selectedRoom.id,

          checkIn: checkIn,

          checkOut: checkOut,

          jumlahTamu: guests,
        });

        console.log("[BookingUI] Price result:", result);

        if (!result?.success) {
          throw new Error(result?.message || "Harga tidak dapat dihitung.");
        }

        renderPrice(result.data);
      } catch (error) {
        console.error("[BookingUI] Price error:", error);

        showError(error.message || "Gagal menghitung harga.");
      } finally {
        setButtonLoading(button, false, "Check price");
      }
    }

    /* =====================================
     RENDER PRICE
  ===================================== */

    function renderPrice(data) {
      const result = el("bookingPriceResult");

      if (!result) {
        return;
      }

      const nights = data.nights || [];

      const nightSummary = el("bookingNightSummary");

      if (nightSummary) {
        nightSummary.textContent = `${data.jumlahMalam || nights.length} ${
          (data.jumlahMalam || nights.length) === 1 ? "night" : "nights"
        }`;
      }

      const list = el("bookingNightList");

      if (list) {
        list.innerHTML = nights
          .map(
            (night) => `

            <div class="booking-night-row">

              <div class="booking-night-date">

                <strong>
                  ${formatBookingDate(night.tanggal)}
                </strong>

                <span>
                  ${night.hari || ""}
                </span>

              </div>

              <span class="booking-night-price">
                ${formatCurrency(night.harga || 0)}
              </span>

            </div>

          `,
          )
          .join("");
      }

      const total = el("bookingTotal");

      if (total) {
        total.textContent = formatCurrency(data.total || 0);
      }

      result.hidden = false;

      const continueButton = el("bookingContinueButton");

      if (continueButton) {
        continueButton.disabled = false;
      }

      result.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    /* =====================================
     CONTINUE
  ===================================== */

    function handleContinue() {
      if (!selectedRoom) {
        return;
      }

      console.log("[BookingUI] Continue booking", {
        room: selectedRoom,
        checkIn: el("bookingCheckIn")?.value,
        checkOut: el("bookingCheckOut")?.value,
        guests: el("bookingGuests")?.value,
      });

      /*
       * STEP BERIKUTNYA:
       *
       * Guest information
       *
       * Belum create reservation.
       */
    }

    /* =====================================
     HELPERS
  ===================================== */

    function formatCurrency(value) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(value || 0));
    }

    function formatBookingDate(value) {
      if (!value) {
        return "-";
      }

      const date = new Date(`${value}T00:00:00`);

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    function showError(message) {
      const error = el("bookingError");

      if (!error) {
        return;
      }

      error.textContent = message;

      error.hidden = false;
    }

    function hideError() {
      const error = el("bookingError");

      if (error) {
        error.hidden = true;
        error.textContent = "";
      }
    }

    function setButtonLoading(button, loading, text) {
      if (!button) {
        return;
      }

      button.disabled = loading;

      button.textContent = loading ? text : text;
    }

    return {
      init,
      selectRoom,
    };
  })();

  /* ==========================================================
     ESCAPE HTML
  ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  /* ==========================================================
     ESCAPE ATTRIBUTE
  ========================================================== */

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    init,

    load,

    refresh,

    applyFilter,

    render,

    getState() {
      return {
        ...state,

        rows: [...state.rows],
      };
    },
  };
})();

/* ============================================================
   BOOTSTRAP
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  PublicPenginapan.init();
});
