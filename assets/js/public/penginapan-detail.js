/* ============================================================
   DIENG NET
   PUBLIC — PENGINAPAN DETAIL
   ============================================================

   PUBLIC RESERVATION WIZARD

   FLOW:

   URL
    ↓
   penginapan.detail
    ↓
   STEP 1
   Search
    ↓
   reservation.availability
    ↓
   STEP 2
   Choose Unit
    ↓
   booking.price
    ↓
   STEP 3
   Guest Information
    ↓
   STEP 4
   Confirmation
    ↓
   reservation.store
    ↓
   DRAFT + HOLD

   IMPORTANT:

   - Tidak menggunakan Dummy
   - Tidak menggunakan Service langsung
   - Tidak menggunakan Repository
   - Semua request melalui API
   - Harga final selalu ditentukan backend
   - Unit menggunakan unitId
   - Channel public = WEBSITE
   ============================================================ */

const PublicPenginapanDetail = (() => {
  /* ==========================================================
     CONSTANT
  ========================================================== */
  const CHANNEL = "WEBSITE";
  const TOTAL_STEPS = 4;
  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    slug: "",

    penginapan: null,

    step: 1,

    loading: false,

    error: null,

    units: [],

    /*
     * Semua unit aktif milik penginapan.
     *
     * Digunakan untuk:
     * - Unit showcase
     * - Menampilkan semua unit
     * - Menentukan status availability
     */
    allUnits: [],

    /*
     * Reservation yang terkait
     * dengan penginapan ini.
     */
    reservations: [],

    selectedUnit: null,

    selectedFromShowcase: false,

    pricing: null,

    searching: false,

    pricingLoading: false,

    pricingRequest: null,

    submitting: false,

    booking: {
      checkIn: "",

      checkOut: "",

      dewasa: 2,

      anak: 0,

      namaTamu: "",

      noHp: "",

      email: "",

      catatan: "",
    },

    result: null,

    payment: {
      paymentDate: "",
      paymentMethod: "TRANSFER",
      paymentAmount: 0,
      paymentReference: "",
      paymentNote: "",

      proofFile: null,
      proofFileName: "",
      proofMimeType: "",
      proofPreviewUrl: "",

      proofUploading: false,
      submitting: false,
    },
  };

  /* ==========================================================
     DOM
  ========================================================== */

  const dom = {};

  /* ==========================================================
     INIT
  ========================================================== */

  async function init() {
    console.log("[PublicPenginapanDetail] Init");

    cacheDom();

    initMobileMenu();

    const params = new URLSearchParams(window.location.search);

    const propertyId = String(params.get("id") || "").trim();

    state.slug = String(params.get("slug") || "").trim();

    console.log("[PublicPenginapanDetail] Property ID:", propertyId);

    console.log("[PublicPenginapanDetail] Slug:", state.slug);

    if (!propertyId && !state.slug) {
      showError("Penginapan tidak ditemukan.");

      return;
    }

    setDefaultDates();

    renderWizard();

    await load();
  }

  /* ==========================================================
     CACHE DOM
  ========================================================== */

  function cacheDom() {
    dom.loading = document.getElementById("detailLoading");

    dom.content = document.getElementById("detailContent");

    dom.error = document.getElementById("detailError");

    dom.errorMessage = document.getElementById("detailErrorMessage");

    dom.footer = document.getElementById("publicFooter");

    dom.cover = document.getElementById("detailCover");

    dom.location = document.getElementById("detailLocation");

    dom.title = document.getElementById("detailTitle");

    dom.type = document.getElementById("detailType");

    dom.description = document.getElementById("detailDescription");

    dom.meta = document.getElementById("detailMeta");

    dom.unitShowcase = document.getElementById("unitShowcase");

    dom.stepper = document.getElementById("wizardStepper");

    dom.wizardContent = document.getElementById("wizardContent");

    dom.wizardError = document.getElementById("wizardError");

    dom.wizardFooter = document.getElementById("wizardFooter");

    dom.mobileMenuBtn = document.getElementById("mobileMenuBtn");

    dom.mobileMenu = document.getElementById("mobileMenu");
  }

  /* ==========================================================
     GET SLUG
  ========================================================== */

  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);

    return String(params.get("slug") || params.get("id") || "").trim();
  }

  /* ==========================================================
   BIND SHOWCASE UNIT EVENTS
========================================================== */

  function bindShowcaseUnitEvents() {
    if (!dom.unitShowcase) {
      return;
    }

    dom.unitShowcase
      .querySelectorAll(".public-unit-showcase-select")
      .forEach((button) => {
        button.addEventListener("click", async () => {
          const unitId = button.dataset.unitId;

          if (!unitId) {
            return;
          }

          await selectShowcaseUnit(unitId);
        });
      });
  }

  /* ==========================================================
   SELECT SHOWCASE UNIT
========================================================== */

  /* ==========================================================
   SELECT SHOWCASE UNIT
========================================================== */

  function selectShowcaseUnit(unitId) {
    const unit = state.allUnits.find(
      (item) => String(item.id) === String(unitId),
    );

    if (!unit) {
      return;
    }

    const status = getShowcaseUnitStatus(unit);

    if (status.code !== "AVAILABLE") {
      return;
    }

    /* ========================================================
     SIMPAN UNIT YANG DIPILIH DARI OUR ROOMS
  ======================================================== */

    state.selectedUnit = unit;

    state.selectedFromShowcase = true;

    state.units = [unit];

    state.pricing = null;

    state.step = 1;

    renderWizard();

    scrollWizard();
  }

  /* ==========================================================
     LOAD PROPERTY
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      const params = new URLSearchParams(window.location.search);

      const id = String(params.get("id") || "").trim();

      const slug = String(params.get("slug") || "").trim();

      const detailPayload = id ? { id } : { slug };

      console.log("[PublicPenginapanDetail] Detail payload:", detailPayload);

      const result = await API.post("penginapan.detail", detailPayload);

      console.log("[PublicPenginapanDetail] Property:", result);

      const penginapan = result?.data || null;

      if (!penginapan) {
        throw new Error("Penginapan tidak ditemukan.");
      }

      state.penginapan = penginapan;

      /*
       * Load data tambahan secara paralel.
       *
       * Ketiga proses ini tidak perlu menunggu
       * satu sama lain.
       */
      const [startingPrice] = await Promise.all([
        loadStartingPrice(),

        loadUnitShowcase(),

        loadInitialAvailability(),
      ]);

      state.startingPrice = startingPrice;

      renderProperty();

      await restoreReservationPayment();
    } catch (error) {
      console.error("[PublicPenginapanDetail] Load error:", error);

      state.error = error?.message || "Gagal memuat penginapan.";

      showError(state.error);
    } finally {
      state.loading = false;

      hideLoading();
    }
  }

  async function restoreReservationPayment() {
    const params = new URLSearchParams(window.location.search);

    const reservationCode = String(params.get("reservation") || "").trim();

    if (!reservationCode) {
      return false;
    }

    const stored = sessionStorage.getItem("publicReservationRecovery");

    if (!stored) {
      console.warn(
        "[PublicPenginapanDetail] Reservation recovery data tidak ditemukan.",
      );

      return false;
    }

    try {
      const reservation = JSON.parse(stored);

      if (!reservation || reservation.kode !== reservationCode) {
        console.warn(
          "[PublicPenginapanDetail] Reservation recovery tidak cocok.",
        );

        return false;
      }

      /*
       * Pastikan reservasi memang milik
       * penginapan yang sedang dibuka.
       */
      if (
        String(reservation.penginapanId || "").trim() !==
        String(state.penginapan?.id || "").trim()
      ) {
        console.warn(
          "[PublicPenginapanDetail] Reservation bukan milik penginapan ini.",
        );

        return false;
      }

      state.result = reservation;

      state.step = 4;

      renderPaymentPage();

      sessionStorage.removeItem("publicReservationRecovery");

      scrollWizard();

      return true;
    } catch (error) {
      console.error(
        "[PublicPenginapanDetail] Reservation recovery error:",
        error,
      );

      sessionStorage.removeItem("publicReservationRecovery");

      return false;
    }
  }

  /* ==========================================================
   LOAD STARTING PRICE
========================================================== */

  async function loadStartingPrice() {
    try {
      const result = await API.post("harga.list", {
        page: 1,
        limit: 100,
        keyword: "",
        status: "ACTIVE",
        penginapanId: state.penginapan.id,
      });

      const rows = Array.isArray(result?.data?.rows) ? result.data.rows : [];

      const penginapanId = String(state.penginapan?.id || "").trim();

      const prices = rows
        .filter((row) => {
          const status = String(row.status || "")
            .trim()
            .toUpperCase();

          if (status && status !== "ACTIVE") {
            return false;
          }

          return String(row.penginapanId || "").trim() === penginapanId;
        })
        .flatMap((row) => [
          Number(row.hargaWeekday) || 0,
          Number(row.hargaWeekend) || 0,
          Number(row.hargaLongWeekend) || 0,
        ])
        .filter((price) => price > 0);

      return prices.length ? Math.min(...prices) : 0;
    } catch (error) {
      console.error("[PublicPenginapanDetail] Starting price error:", error);

      return 0;
    }
  }
  /* ==========================================================
   LOAD UNIT SHOWCASE
========================================================== */

  async function loadUnitShowcase() {
    if (!state.penginapan?.id) {
      return;
    }

    try {
      console.log(
        "[PublicPenginapanDetail] Load unit showcase:",
        state.penginapan.id,
      );

      /* =========================================
       LOAD ACTIVE UNIT
    ========================================= */

      const unitResult = await API.post("unit.active", {
        penginapanId: state.penginapan.id,
      });

      console.log("[PublicPenginapanDetail] Unit showcase result:", unitResult);

      const unitData = unitResult?.data || [];

      if (Array.isArray(unitData)) {
        state.allUnits = unitData;
      } else if (Array.isArray(unitData.rows)) {
        state.allUnits = unitData.rows;
      } else {
        state.allUnits = [];
      }

      /* =========================================
       LOAD RESERVATIONS
    ========================================= */

      const reservationResult = await API.post("reservation.list", {
        penginapanId: state.penginapan.id,

        limit: 100,
      });

      console.log(
        "[PublicPenginapanDetail] Unit reservations:",
        reservationResult,
      );

      const reservationData = reservationResult?.data || [];

      if (Array.isArray(reservationData)) {
        state.reservations = reservationData;
      } else if (Array.isArray(reservationData.rows)) {
        state.reservations = reservationData.rows;
      } else {
        state.reservations = [];
      }

      console.log("[PublicPenginapanDetail] All units:", state.allUnits);

      console.log("[PublicPenginapanDetail] Reservations:", state.reservations);
    } catch (error) {
      console.error("[PublicPenginapanDetail] Unit showcase error:", error);

      /*
       * Jangan membuat detail penginapan
       * gagal hanya karena showcase unit gagal.
       */

      state.allUnits = [];

      state.reservations = [];
    }
  }

  /* ==========================================================
     RENDER PROPERTY
  ========================================================== */

  function renderProperty() {
    const item = state.penginapan;

    if (!item) {
      showError("Penginapan tidak ditemukan.");

      return;
    }

    renderCover(item);

    renderInfo(item);

    renderMeta(item);

    renderUnitShowcase();

    hideError();

    if (dom.content) {
      dom.content.hidden = false;
    }

    if (dom.footer) {
      dom.footer.hidden = false;
    }

    renderWizard();

    createIcons();
  }

  /* ==========================================================
     COVER
  ========================================================== */

  function renderCover(item = {}) {
    if (!dom.cover) {
      return;
    }

    const image = resolveImage(item);

    if (!image) {
      dom.cover.innerHTML = `

        <div
          class="stay-detail-cover-placeholder"
          aria-hidden="true"
        ></div>

      `;

      return;
    }

    dom.cover.innerHTML = `

      <img
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(item.nama || "Penginapan Dieng")}"
        loading="eager"
      />

    `;
  }

  /* ==========================================================
     INFO
  ========================================================== */

  function renderInfo(item = {}) {
    if (dom.location) {
      dom.location.textContent = formatLocation(item);
    }

    if (dom.title) {
      dom.title.textContent = item.nama || "Penginapan Dieng";
    }

    if (dom.type) {
      dom.type.textContent = item.jenis || item.kategori || "Penginapan";
    }

    if (dom.description) {
      dom.description.textContent =
        item.deskripsi || "Nikmati pengalaman menginap di Dieng.";
    }

    updateDocumentTitle(item.nama);
  }

  /* ==========================================================
     META
  ========================================================== */

  function renderMeta(item = {}) {
    if (!dom.meta) {
      return;
    }

    const address = item.alamat || "Alamat penginapan belum tersedia.";

    const mapsUrl = item.maps || "";

    const mapQuery = getMapQuery(item);

    dom.meta.innerHTML = `

      <div class="stay-detail-meta-item">

        <span class="stay-detail-meta-label">
          Address
        </span>

        <span class="stay-detail-meta-value">
          ${escapeHtml(address)}
        </span>

        ${
          mapQuery
            ? `

              <div class="stay-map-card">

                <iframe
                  src="https://www.google.com/maps?q=${encodeURIComponent(
                    mapQuery,
                  )}&output=embed"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen
                ></iframe>

                <div class="stay-map-footer">

                  <span class="stay-map-label">
                    Lokasi Penginapan
                  </span>

                  ${
                    mapsUrl
                      ? `

                        <a
                          href="${escapeAttribute(mapsUrl)}"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="stay-map-button"
                        >
                          Buka Google Maps
                          <span aria-hidden="true">
                            ↗
                          </span>
                        </a>

                      `
                      : ""
                  }

                </div>

              </div>

            `
            : ""
        }

      </div>

    `;
  }

  /* ==========================================================
   RENDER UNIT SHOWCASE
========================================================== */

  function renderUnitShowcase() {
    if (!dom.unitShowcase) {
      return;
    }

    const units = Array.isArray(state.allUnits) ? state.allUnits : [];

    if (!units.length) {
      dom.unitShowcase.innerHTML = `
      <div class="public-unit-showcase-empty">

        <i
          data-lucide="bed-double"
          aria-hidden="true"
        ></i>

        <strong>
          No rooms available
        </strong>

        <span>
          Belum ada unit aktif untuk penginapan ini.
        </span>

      </div>
    `;

      createIcons();

      return;
    }

    dom.unitShowcase.innerHTML = units
      .map((unit, index) => renderShowcaseCard(unit, index))
      .join("");

    bindShowcaseUnitEvents();

    createIcons();
  }

  /* ==========================================================
   GET UNIT STARTING PRICE
========================================================== */

  function getUnitStartingPrice(unit = {}) {
    /*
     * PRIORITAS 1
     * Jika unit langsung membawa harga.
     */
    const directPrice =
      Number(unit.startingPrice) ||
      Number(unit.harga) ||
      Number(unit.price) ||
      0;

    if (directPrice > 0) {
      return directPrice;
    }

    /*
     * PRIORITAS 2
     * Jika unit membawa daftar harga.
     */
    const hargaMusim = Array.isArray(unit.hargaMusim) ? unit.hargaMusim : [];

    const values = hargaMusim
      .flatMap((row) => [
        Number(row.hargaWeekday) || 0,
        Number(row.hargaWeekend) || 0,
        Number(row.hargaLongWeekend) || 0,
        Number(row.weekday) || 0,
        Number(row.weekend) || 0,
        Number(row.harga) || 0,
      ])
      .filter((price) => price > 0);

    if (values.length) {
      return Math.min(...values);
    }

    /*
     * PRIORITAS 3
     * Fallback ke harga public penginapan
     * yang sudah tersedia di state.
     *
     * Ini hanya untuk tampilan card.
     * Harga final booking tetap dari
     * booking.price / backend.
     */
    const penginapanId = String(state.penginapan?.id || "").trim();

    const groupedPrices = state.pricesByPenginapan?.[penginapanId] || [];

    if (groupedPrices.length) {
      const prices = groupedPrices
        .flatMap((row) => [
          Number(row.hargaWeekday) || 0,
          Number(row.hargaWeekend) || 0,
          Number(row.hargaLongWeekend) || 0,
        ])
        .filter((price) => price > 0);

      if (prices.length) {
        return Math.min(...prices);
      }
    }

    /*
     * Tidak ada harga.
     */
    return 0;
  }

  /* ==========================================================
   RENDER SHOWCASE CARD
========================================================== */

  function renderShowcaseCard(unit = {}, index = 0) {
    const id = String(unit.id || "").trim();

    const nama = unit.nama || `Unit ${index + 1}`;

    const tipe = unit.tipe || unit.jenis || "";

    const description =
      unit.deskripsi ||
      unit.description ||
      "Unit nyaman dengan fasilitas yang siap menemani pengalaman menginap Anda.";

    const image = resolveImage(unit);

    const dewasa = Number(unit.kapasitasDewasa) || 0;

    const anak = Number(unit.kapasitasAnak) || 0;

    const bedCount = Number(unit.jumlahBed) || 0;

    const bedType = unit.jenisBed || "";

    const luas = Number(unit.luas) || 0;

    const fasilitas = normalizeFasilitas(unit.fasilitas);

    const status = getShowcaseUnitStatus(unit);

    const statusClass = status.className;

    const isAvailable = status.code === "AVAILABLE";

    const startingPrice =
      getUnitStartingPrice(unit) || Number(state.startingPrice) || 0;

    return `
    <article
      class="
        public-unit-showcase-card
        ${statusClass}
      "
      data-unit-id="${escapeAttribute(id)}"
    >

      <!-- =====================================
           IMAGE
      ====================================== -->

      <div class="public-unit-showcase-image">

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
                class="
                  public-unit-showcase-image-placeholder
                "
                aria-hidden="true"
              >
                <i
                  data-lucide="image"
                  aria-hidden="true"
                ></i>
              </div>
            `
        }

        <span
          class="
            public-unit-showcase-status
            ${statusClass}
          "
        >
          <span
            class="public-unit-status-dot"
          ></span>

          ${escapeHtml(status.label)}
        </span>

      </div>


      <!-- =====================================
           CONTENT
      ====================================== -->

      <div class="public-unit-showcase-content">

        <div class="public-unit-showcase-heading">

          <div>

            <span class="public-unit-number">
              ${String(index + 1).padStart(2, "0")}
            </span>

            <h3>
              ${escapeHtml(nama)}
            </h3>

            ${
              tipe
                ? `
                  <span
                    class="public-unit-type"
                  >
                    ${escapeHtml(tipe)}
                  </span>
                `
                : ""
            }

          </div>

        </div>


        <!-- ===================================
             DESCRIPTION
        ==================================== -->

        <p
          class="public-unit-description"
        >
          ${escapeHtml(description)}
        </p>


        <!-- ===================================
             META
        ==================================== -->

        <div
          class="public-unit-meta"
        >

          ${
            dewasa
              ? `
                <span>
                  <i
                    data-lucide="users"
                    aria-hidden="true"
                  ></i>

                  ${dewasa} Dewasa
                </span>
              `
              : ""
          }

          ${
            anak
              ? `
                <span>
                  <i
                    data-lucide="baby"
                    aria-hidden="true"
                  ></i>

                  ${anak} Anak
                </span>
              `
              : ""
          }

          ${
            bedCount
              ? `
                <span>
                  <i
                    data-lucide="bed-double"
                    aria-hidden="true"
                  ></i>

                  ${bedCount}
                  ${escapeHtml(bedType)}
                </span>
              `
              : ""
          }

          ${
            luas
              ? `
                <span>
                  <i
                    data-lucide="maximize"
                    aria-hidden="true"
                  ></i>

                  ${luas} m²
                </span>
              `
              : ""
          }

        </div>


        <!-- ===================================
             FACILITIES
        ==================================== -->

        ${
          fasilitas
            ? `
              <div
                class="
                  public-unit-facilities
                "
              >

                ${fasilitas
                  .split(",")
                  .map(
                    (item) => `
                      <span>
                        ${escapeHtml(item.trim())}
                      </span>
                    `,
                  )
                  .join("")}

              </div>
            `
            : ""
        }


        <!-- ===================================
             PRICE
        ==================================== -->

        ${
          startingPrice > 0
            ? `
              <div
                class="
                  public-unit-starting-price
                "
              >

                <span>
                  Mulai dari
                </span>

                <strong>
                  ${formatCurrency(startingPrice)}
                </strong>

                <small>
                  /kamar/malam
                </small>

              </div>
            `
            : ""
        }


        <!-- ===================================
             ACTION
        ==================================== -->

        <div
          class="
            public-unit-showcase-action
          "
        >

          <button
            type="button"
            class="btn btn-dark public-unit-showcase-select"
            data-unit-id="${escapeAttribute(id)}"
            ${!isAvailable ? "disabled" : ""}
          >
            ${isAvailable ? "Select this room" : "Not available"}

            ${
              isAvailable
                ? `
                  <span aria-hidden="true">
                    →
                  </span>
                `
                : ""
            }

          </button>

        </div>

      </div>

    </article>
  `;
  }

  /* ==========================================================
   GET SHOWCASE UNIT STATUS
========================================================== */

  function getShowcaseUnitStatus(unit = {}) {
    const unitId = String(unit.id || "").trim();

    const reservations = state.reservations.filter(
      (reservation) => String(reservation.unitId || "").trim() === unitId,
    );

    /*
     * Belum ada reservasi.
     */

    if (!reservations.length) {
      return {
        code: "AVAILABLE",
        label: "Available",
        className: "is-available",
      };
    }

    /*
     * Cek apakah ada reservation
     * yang sedang blocking.
     */

    const blocking = reservations.some((reservation) =>
      isShowcaseReservationBlocking(
        reservation,
        state.booking.checkIn,
        state.booking.checkOut,
      ),
    );

    if (blocking) {
      /*
       * Bedakan BOOKED dengan HOLD.
       */

      const hasBooked = reservations.some((reservation) => {
        const status = String(reservation.status || "")
          .trim()
          .toUpperCase();

        return (
          (status === "BOOKED" || status === "CHECK_IN") &&
          isShowcaseDateOverlap(
            reservation,
            state.booking.checkIn,
            state.booking.checkOut,
          )
        );
      });

      if (hasBooked) {
        return {
          code: "BOOKED",
          label: "Booked",
          className: "is-booked",
        };
      }

      return {
        code: "HOLD",
        label: "Temporarily unavailable",
        className: "is-hold",
      };
    }

    return {
      code: "AVAILABLE",
      label: "Available",
      className: "is-available",
    };
  }

  /* ==========================================================
   CHECK RESERVATION BLOCKING
========================================================== */

  function isShowcaseReservationBlocking(
    reservation = {},
    requestedCheckIn,
    requestedCheckOut,
  ) {
    const status = String(reservation.status || "")
      .trim()
      .toUpperCase();

    /*
     * BOOKED
     */

    if (status === "BOOKED") {
      return isShowcaseDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /*
     * CHECK IN
     */

    if (status === "CHECK_IN") {
      return isShowcaseDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /*
     * DRAFT + HOLD
     */

    if (status === "DRAFT") {
      if (!reservation.holdUntil) {
        return false;
      }

      const holdUntil = new Date(reservation.holdUntil);

      if (Number.isNaN(holdUntil.getTime())) {
        return false;
      }

      /*
       * HOLD EXPIRED
       */

      if (holdUntil.getTime() <= Date.now()) {
        return false;
      }

      return isShowcaseDateOverlap(
        reservation,
        requestedCheckIn,
        requestedCheckOut,
      );
    }

    /*
     * Status lainnya tidak blocking.
     */

    return false;
  }

  /* ==========================================================
   DATE OVERLAP
========================================================== */

  function isShowcaseDateOverlap(
    reservation = {},
    requestedCheckIn,
    requestedCheckOut,
  ) {
    if (!reservation.checkIn || !reservation.checkOut) {
      return false;
    }

    const reservationIn = new Date(`${reservation.checkIn}T00:00:00`);

    const reservationOut = new Date(`${reservation.checkOut}T00:00:00`);

    const requestedIn = new Date(`${requestedCheckIn}T00:00:00`);

    const requestedOut = new Date(`${requestedCheckOut}T00:00:00`);

    if (
      Number.isNaN(reservationIn.getTime()) ||
      Number.isNaN(reservationOut.getTime()) ||
      Number.isNaN(requestedIn.getTime()) ||
      Number.isNaN(requestedOut.getTime())
    ) {
      return false;
    }

    return requestedIn < reservationOut && requestedOut > reservationIn;
  }

  /* ==========================================================
     WIZARD
  ========================================================== */

  function renderWizard() {
    /* ==========================================================
     OUR ROOMS VISIBILITY
     Showcase hanya tampil pada STEP 1
  ========================================================== */

    if (dom.unitShowcase) {
      const showcaseSection = dom.unitShowcase.closest(".stay-detail-rooms");

      if (showcaseSection) {
        showcaseSection.hidden = state.step !== 1;
      }
    }

    updateStepper();

    if (!dom.wizardContent) {
      return;
    }

    clearWizardError();

    switch (state.step) {
      case 1:
        renderStep1();

        break;

      case 2:
        renderStep3();

        break;

      case 3:
        renderStep4();

        break;

      default:
        state.step = 1;

        renderStep1();
    }

    renderWizardFooter();

    createIcons();
  }

  /* ==========================================================
     STEPPER
  ========================================================== */

  function updateStepper() {
    if (!dom.stepper) {
      return;
    }

    dom.stepper
      .querySelectorAll(".public-wizard-step")
      .forEach((stepElement) => {
        const step = Number(stepElement.dataset.step);

        stepElement.classList.toggle("active", step === state.step);

        stepElement.classList.toggle("completed", step < state.step);
      });
  }

  /* ==========================================================
     STEP 1
  ========================================================== */

  /* ==========================================================
   STEP 1
========================================================== */

  function renderStep1() {
    const selectedUnit = state.selectedUnit;

    const hasSelectedUnit = !!selectedUnit;

    const selectedUnitName =
      selectedUnit?.nama ||
      selectedUnit?.namaUnit ||
      selectedUnit?.name ||
      selectedUnit?.kode ||
      "Room selected";

    const selectedUnitType =
      selectedUnit?.tipe || selectedUnit?.type || selectedUnit?.jenis || "";

    dom.wizardContent.innerHTML = `

    <div class="public-wizard-panel">

      <div class="public-wizard-panel-heading">

        <span class="eyebrow eyebrow-dark">
          STEP 1
        </span>

        <h3>
          Find your stay
        </h3>

        <p>
          Choose your dates and number of guests.
        </p>

      </div>


      ${
        hasSelectedUnit
          ? `
            <!-- SELECTED ROOM -->

            <div class="public-wizard-selected-unit">

              <div class="public-wizard-selected-unit-icon">
                <i
                  data-lucide="bed-double"
                  aria-hidden="true"
                ></i>
              </div>

              <div class="public-wizard-selected-unit-info">

                <span class="public-wizard-selected-unit-label">
                  ROOM SELECTED
                </span>

                <strong>
                  ${escapeHtml(selectedUnitName)}
                </strong>

                ${
                  selectedUnitType
                    ? `
                      <small>
                        ${escapeHtml(selectedUnitType)}
                      </small>
                    `
                    : ""
                }

              </div>

              <span class="public-wizard-selected-unit-check">
                <i
                  data-lucide="check"
                  aria-hidden="true"
                ></i>
              </span>

            </div>
          `
          : ""
      }


      <div class="booking-fields">

        <!-- CHECK IN -->

        <div class="booking-field">

          <label
            for="wizardCheckIn"
          >
            CHECK-IN
          </label>

          <input
            type="date"
            id="wizardCheckIn"
            value="${escapeAttribute(state.booking.checkIn)}"
          />

        </div>


        <!-- CHECK OUT -->

        <div class="booking-field">

          <label
            for="wizardCheckOut"
          >
            CHECK-OUT
          </label>

          <input
            type="date"
            id="wizardCheckOut"
            value="${escapeAttribute(state.booking.checkOut)}"
          />

        </div>


        <!-- ADULT -->

        <div class="booking-field">

          <label
            for="wizardDewasa"
          >
            ADULTS
          </label>

          <select
            id="wizardDewasa"
          >

            ${renderGuestOptions(state.booking.dewasa, 1, 10)}

          </select>

        </div>


        <!-- CHILD -->

        <div class="booking-field">

          <label
            for="wizardAnak"
          >
            CHILDREN
          </label>

          <select
            id="wizardAnak"
          >

            ${renderGuestOptions(state.booking.anak, 0, 10)}

          </select>

        </div>

      </div>


      <div class="public-wizard-availability-action">

        <button
          type="button"
          class="btn btn-dark"
          id="checkAvailabilityButton"
        >
          Check Availability
        </button>

      </div>


      <div class="public-wizard-note">

        <i
          data-lucide="info"
          aria-hidden="true"
        ></i>

        <span>
          Ketersediaan unit akan dicek berdasarkan
          tanggal dan kapasitas tamu.
        </span>

      </div>

      ${
        state.units.length
          ? `
        <div class="public-availability-result">

          <div class="public-wizard-panel-heading">

            <span class="eyebrow eyebrow-dark">
              AVAILABLE ROOMS
            </span>

            <h3>
              Choose your room.
            </h3>

            <p>
              ${state.units.length}
              unit tersedia untuk pilihan Anda.
            </p>

          </div>


          <div class="public-unit-list">

            ${state.units
              .map((unit, index) => renderUnitCard(unit, index))
              .join("")}

          </div>

        </div>
      `
          : ""
      }      

    </div>

  `;

    bindStep1Events();
  }
  /* ==========================================================
     STEP 1 EVENTS
  ========================================================== */

  function bindStep1Events() {
    const checkIn = document.getElementById("wizardCheckIn");

    const checkOut = document.getElementById("wizardCheckOut");

    const dewasa = document.getElementById("wizardDewasa");

    const anak = document.getElementById("wizardAnak");

    const checkAvailabilityButton = document.getElementById(
      "checkAvailabilityButton",
    );

    const continueStep1Button = document.getElementById("continueStep1Button");

    /* =====================================
     CHECK AVAILABILITY
  ===================================== */

    checkAvailabilityButton?.addEventListener("click", async () => {
      const valid = readAndValidateStep1();

      if (!valid) {
        return;
      }

      await searchAvailability();
    });

    /* =====================================
     CONTINUE STEP 1
  ===================================== */

    continueStep1Button?.addEventListener("click", () => {
      if (!state.selectedUnit) {
        showWizardError("Silakan pilih kamar terlebih dahulu.");

        return;
      }

      clearWizardError();

      state.step = 2;

      renderWizard();

      scrollWizard();
    });

    /* =====================================
     CHECK IN
  ===================================== */

    if (checkIn) {
      checkIn.addEventListener("change", () => {
        state.booking.checkIn = checkIn.value;

        updateCheckoutMin();
      });
    }

    /* =====================================
     CHECK OUT
  ===================================== */

    if (checkOut) {
      checkOut.addEventListener("change", () => {
        state.booking.checkOut = checkOut.value;
      });
    }

    /* =====================================
     DEWASA
  ===================================== */

    if (dewasa) {
      dewasa.addEventListener("change", () => {
        state.booking.dewasa = Number(dewasa.value) || 1;
      });
    }

    /* =====================================
     ANAK
  ===================================== */

    if (anak) {
      anak.addEventListener("change", () => {
        state.booking.anak = Number(anak.value) || 0;
      });
    }

    /* =====================================
     CHECKOUT MINIMUM
  ===================================== */

    updateCheckoutMin();

    /* =====================================
     UNIT EVENTS

     Availability sekarang berada
     tetap di STEP 1.
  ===================================== */

    if (state.units.length) {
      bindUnitEvents();
    }
  }

  /* ==========================================================
     STEP 2
  ========================================================== */

  function renderStep2() {
    const units = state.units;

    if (!units.length) {
      dom.wizardContent.innerHTML = `

      <div class="public-wizard-panel">

        <div class="public-wizard-panel-heading">

          <span class="eyebrow eyebrow-dark">
            STEP 2
          </span>

          <h3>
            No unit available
          </h3>

          <p>
            Tidak ada unit yang tersedia
            untuk tanggal dan jumlah tamu tersebut.
          </p>

        </div>


        <div class="public-wizard-empty">

          <i
            data-lucide="calendar-x"
            aria-hidden="true"
          ></i>

          <strong>
            Tidak ada unit tersedia.
          </strong>

          <span>
            Coba tanggal atau jumlah tamu yang berbeda.
          </span>

        </div>

      </div>

    `;

      return;
    }

    dom.wizardContent.innerHTML = `

    <div class="public-wizard-panel">

      <div class="public-wizard-panel-heading">

        <span class="eyebrow eyebrow-dark">
          STEP 2
        </span>

        <h3>
          Available rooms
        </h3>

        <p>
          ${units.length}
          unit tersedia untuk pilihan Anda.
        </p>

      </div>


      <div class="public-unit-list">

        ${units.map((unit, index) => renderUnitCard(unit, index)).join("")}

      </div>

    </div>

  `;

    bindUnitEvents();
  }

  /* ==========================================================
     UNIT CARD
  ========================================================== */

  function renderUnitCard(unit = {}, index = 0) {
    const id = unit.id || "";

    const nama = unit.nama || "Unit";

    const tipe = unit.tipe || "";

    const image = resolveImage(unit);

    const dewasa = Number(unit.kapasitasDewasa) || 0;

    const anak = Number(unit.kapasitasAnak) || 0;

    const bedCount = Number(unit.jumlahBed) || 0;

    const bedType = unit.jenisBed || "";

    const luas = Number(unit.luas) || 0;

    const fasilitas = normalizeFasilitas(unit.fasilitas);

    const selected =
      state.selectedUnit && String(state.selectedUnit.id) === String(id);

    return `

      <article
        class="
          public-unit-card
          ${selected ? "is-selected" : ""}
        "
        data-unit-id="${escapeAttribute(id)}"
      >

        ${
          image
            ? `

              <div class="public-unit-image">

                <img
                  src="${escapeAttribute(image)}"
                  alt="${escapeAttribute(nama)}"
                  loading="lazy"
                />

              </div>

            `
            : `
              <div
                class="public-unit-image public-unit-image-placeholder"
                aria-hidden="true"
              ></div>
            `
        }


        <div class="public-unit-content">

          <div class="public-unit-header">

            <div>

              <span class="public-unit-number">
                ${String(index + 1).padStart(2, "0")}
              </span>

              <h4>
                ${escapeHtml(nama)}
              </h4>

              ${
                tipe
                  ? `
                    <span class="public-unit-type">
                      ${escapeHtml(tipe)}
                    </span>
                  `
                  : ""
              }

            </div>


            <span class="public-unit-status">
              Available
            </span>

          </div>


          <div class="public-unit-meta">

            ${
              dewasa
                ? `
                  <span>
                    ${dewasa} Dewasa
                  </span>
                `
                : ""
            }

            ${
              anak
                ? `
                  <span>
                    ${anak} Anak
                  </span>
                `
                : ""
            }

            ${
              bedCount
                ? `
                  <span>
                    ${bedCount}
                    ${escapeHtml(bedType)}
                  </span>
                `
                : ""
            }

            ${
              luas
                ? `
                  <span>
                    ${luas} m²
                  </span>
                `
                : ""
            }

          </div>


          ${
            fasilitas
              ? `
                <div class="public-unit-facilities">

                  ${fasilitas
                    .split(",")
                    .map(
                      (item) =>
                        `<span>
                          ${escapeHtml(item.trim())}
                        </span>`,
                    )
                    .join("")}

                </div>
              `
              : ""
          }


          <button
            type="button"
            class="btn btn-dark public-unit-select"
            data-unit-id="${escapeAttribute(id)}"
          >
            ${selected ? "Selected" : "Select this unit"}
          </button>

        </div>

      </article>

    `;
  }

  /* ==========================================================
     UNIT EVENTS
  ========================================================== */

  function bindUnitEvents() {
    dom.wizardContent
      .querySelectorAll(".public-unit-select")
      .forEach((button) => {
        button.addEventListener("click", async () => {
          await selectUnit(button.dataset.unitId);
        });
      });
  }

  /* ==========================================================
     SELECT UNIT
  ========================================================== */

  function selectUnit(unitId) {
    const unit = state.units.find((item) => String(item.id) === String(unitId));

    if (!unit) {
      showWizardError("Unit tidak ditemukan.");

      return;
    }

    state.selectedUnit = unit;

    state.pricing = null;

    clearWizardError();

    renderWizard();
  }

  /* ==========================================================
     STEP 3
  ========================================================== */

  function renderStep3() {
    const unit = state.selectedUnit;

    const pricing = state.pricing;

    dom.wizardContent.innerHTML = `

      <div class="public-wizard-panel">

        <div class="public-wizard-panel-heading">

          <span class="eyebrow eyebrow-dark">
            STEP 3
          </span>

          <h3>
            Guest information
          </h3>

          <p>
            Masukkan data tamu yang akan menginap.
          </p>

        </div>


        <!-- SELECTED UNIT -->

        <div class="public-booking-summary">

          <div>

            <span>
              UNIT
            </span>

            <strong>
              ${escapeHtml(unit?.nama || "-")}
            </strong>

          </div>


          <div>

            <span>
              STAY
            </span>

            <strong>
              ${formatDate(state.booking.checkIn)}
              →
              ${formatDate(state.booking.checkOut)}
            </strong>

          </div>


          <div>

            <span>
              GUESTS
            </span>

            <strong>
              ${state.booking.dewasa}
              Dewasa
              •
              ${state.booking.anak}
              Anak
            </strong>

          </div>

        </div>


        ${pricing ? renderCompactPricing(pricing) : ""}


        <!-- GUEST FORM -->

        <div class="public-guest-form">

          <div class="booking-field">

            <label
              for="guestNama"
            >
              NAMA TAMU *
            </label>

            <input
              type="text"
              id="guestNama"
              maxlength="100"
              autocomplete="name"
              value="${escapeAttribute(state.booking.namaTamu)}"
              placeholder="Nama lengkap"
            />

          </div>


          <div class="booking-field">

            <label
              for="guestNoHp"
            >
              NO. WHATSAPP *
            </label>

            <input
              type="tel"
              id="guestNoHp"
              maxlength="30"
              autocomplete="tel"
              value="${escapeAttribute(state.booking.noHp)}"
              placeholder="08xxxxxxxxxx"
            />

          </div>


          <div class="booking-field">

            <label
              for="guestEmail"
            >
              EMAIL
            </label>

            <input
              type="email"
              id="guestEmail"
              maxlength="150"
              autocomplete="email"
              value="${escapeAttribute(state.booking.email)}"
              placeholder="nama@email.com"
            />

          </div>


          <div class="booking-field">

            <label
              for="guestCatatan"
            >
              CATATAN
            </label>

            <textarea
              id="guestCatatan"
              rows="4"
              maxlength="500"
              placeholder="Permintaan khusus (opsional)"
            >${escapeHtml(state.booking.catatan)}</textarea>

          </div>

        </div>

      </div>

    `;

    bindStep3Events();
  }

  /* ==========================================================
     STEP 3 EVENTS
  ========================================================== */

  function bindStep3Events() {
    const nama = document.getElementById("guestNama");

    const noHp = document.getElementById("guestNoHp");

    const email = document.getElementById("guestEmail");

    const catatan = document.getElementById("guestCatatan");

    if (nama) {
      nama.addEventListener("input", () => {
        state.booking.namaTamu = nama.value;
      });
    }

    if (noHp) {
      noHp.addEventListener("input", () => {
        state.booking.noHp = noHp.value;
      });
    }

    if (email) {
      email.addEventListener("input", () => {
        state.booking.email = email.value;
      });
    }

    if (catatan) {
      catatan.addEventListener("input", () => {
        state.booking.catatan = catatan.value;
      });
    }
  }

  /* ==========================================================
     STEP 4
  ========================================================== */

  /* ==========================================================
   STEP 4
========================================================== */

  function renderStep4() {
    const unit = state.selectedUnit;

    const pricing = state.pricing || {};

    dom.wizardContent.innerHTML = `

    <div class="public-wizard-panel public-confirm-panel">

      <div class="public-wizard-panel-heading">

        <span class="eyebrow eyebrow-dark">
          STEP 4
        </span>

        <h3>
          Confirm your booking
        </h3>

        <p>
          Periksa kembali detail reservasi sebelum melanjutkan.
        </p>

      </div>


      <!-- CONFIRMATION HEADER -->

      <div class="public-confirm-header">

        <div class="public-confirm-property">

          <span class="public-confirm-label">
            STAY
          </span>

          <strong>
            ${escapeHtml(state.penginapan?.nama || "-")}
          </strong>

        </div>


        <div class="public-confirm-room">

          <span class="public-confirm-label">
            UNIT
          </span>

          <strong>
            ${escapeHtml(unit?.nama || "-")}
          </strong>

          ${
            unit?.tipe
              ? `
                <span class="public-confirm-secondary">
                  ${escapeHtml(unit.tipe)}
                </span>
              `
              : ""
          }

        </div>

      </div>


      <!-- STAY DETAILS -->

      <div class="public-confirm-details">

        <div class="public-confirm-detail">

          <span class="public-confirm-label">
            CHECK-IN
          </span>

          <strong>
            ${formatDate(state.booking.checkIn)}
          </strong>

        </div>


        <div class="public-confirm-detail">

          <span class="public-confirm-label">
            CHECK-OUT
          </span>

          <strong>
            ${formatDate(state.booking.checkOut)}
          </strong>

        </div>


        <div class="public-confirm-detail">

          <span class="public-confirm-label">
            GUESTS
          </span>

          <strong>
            ${state.booking.dewasa}
            Dewasa
            <span class="public-confirm-dot">•</span>
            ${state.booking.anak}
            Anak
          </strong>

        </div>

      </div>


      <!-- GUEST -->

      <div class="public-confirm-guest">

        <div class="public-confirm-guest-heading">

          <span class="public-confirm-label">
            GUEST
          </span>

          <i
            data-lucide="user-round"
            aria-hidden="true"
          ></i>

        </div>


        <div class="public-confirm-guest-info">

          <strong>
            ${escapeHtml(state.booking.namaTamu || "-")}
          </strong>

          <span>
            ${escapeHtml(state.booking.noHp || "-")}
          </span>

          ${
            state.booking.email
              ? `
                <span>
                  ${escapeHtml(state.booking.email)}
                </span>
              `
              : ""
          }

        </div>

      </div>


      <!-- PRICE -->

      ${renderFullPricing(pricing)}


      <!-- HOLD NOTICE -->

      <div class="public-confirm-notice">

        <div class="public-confirm-notice-icon">

          <i
            data-lucide="clock-3"
            aria-hidden="true"
          ></i>

        </div>

        <div>

          <strong>
            Temporary hold
          </strong>

          <span>
            Setelah reservasi dibuat, unit akan
            ditahan sementara sesuai kebijakan sistem.
          </span>

        </div>

      </div>


    </div>

  `;
  }

  /* ==========================================================
   UPLOAD PAYMENT PROOF
========================================================== */

  async function uploadPaymentProof() {
    const file = state.payment.proofFile;

    if (!file) {
      showWizardError("Bukti pembayaran wajib diupload.");

      return null;
    }

    if (!validatePaymentProof(file)) {
      return null;
    }

    if (!state.result?.id) {
      showWizardError("ID reservasi tidak ditemukan.");

      return null;
    }

    state.payment.proofUploading = true;

    try {
      const base64 = await fileToBase64(file);

      const payload = {
        reservationId: state.result.id,

        fileName: file.name,

        mimeType: file.type,

        base64,
      };

      console.log("[PublicPenginapanDetail] Payment proof upload:", {
        reservationId: payload.reservationId,

        fileName: payload.fileName,

        mimeType: payload.mimeType,

        size: file.size,
      });

      const result = await API.post("payment.proof.upload", payload);

      console.log("[PublicPenginapanDetail] Payment proof result:", result);

      if (!result || result.success === false) {
        throw new Error(
          result?.message || "Gagal mengupload bukti pembayaran.",
        );
      }

      return result.data || result;
    } catch (error) {
      console.error(
        "[PublicPenginapanDetail] Payment proof upload error:",
        error,
      );

      showWizardError(error?.message || "Gagal mengupload bukti pembayaran.");

      return null;
    } finally {
      state.payment.proofUploading = false;
    }
  }

  /* ==========================================================
     COMPACT PRICING
  ========================================================== */

  function renderCompactPricing(pricing = {}) {
    const total = Number(pricing.total || pricing.grandTotal || 0);

    return `

      <div class="public-price-summary">

        <div>

          <span>
            Total stay
          </span>

          <strong>
            ${formatCurrency(total)}
          </strong>

        </div>

        <span>
          Harga dihitung oleh sistem.
        </span>

      </div>

    `;
  }

  /* ==========================================================
   CALCULATE PRICE
========================================================== */

  async function calculatePrice() {
    /* ======================================================
     VALIDATE UNIT
  ====================================================== */

    if (!state.selectedUnit?.id) {
      showWizardError("Silakan pilih unit terlebih dahulu.");

      return null;
    }

    /* ======================================================
     JIKA REQUEST SEDANG BERJALAN
     
     Tunggu request yang sama.
     Jangan return null.
  ====================================================== */

    if (state.pricingLoading && state.pricingRequest) {
      return await state.pricingRequest;
    }

    /* ======================================================
     PAYLOAD
  ====================================================== */

    const payload = {
      penginapanId: state.penginapan.id,

      unitId: state.selectedUnit.id,

      channel: CHANNEL,

      checkIn: state.booking.checkIn,

      checkOut: state.booking.checkOut,

      dewasa: state.booking.dewasa,

      anak: state.booking.anak,
    };

    console.log("[PublicPenginapanDetail] Pricing:", payload);

    /* ======================================================
     REQUEST
  ====================================================== */

    state.pricingLoading = true;

    clearWizardError();

    state.pricingRequest = (async () => {
      try {
        const result = await API.post("booking.price", payload);

        console.log("[PublicPenginapanDetail] Pricing result:", result);

        if (!result || result.success === false) {
          throw new Error(result?.message || "Gagal menghitung harga.");
        }

        const pricing = result.data || result;

        if (!pricing || Number(pricing.total) <= 0) {
          throw new Error("Total harga reservasi tidak valid.");
        }

        state.pricing = pricing;

        return pricing;
      } catch (error) {
        console.error("[PublicPenginapanDetail] Pricing error:", error);

        state.pricing = null;

        showWizardError(error?.message || "Gagal menghitung harga.");

        return null;
      } finally {
        state.pricingLoading = false;

        state.pricingRequest = null;
      }
    })();

    return await state.pricingRequest;
  }

  /* ==========================================================
     FULL PRICING
  ========================================================== */

  function renderFullPricing(pricing = {}) {
    const nights = Array.isArray(pricing.nights) ? pricing.nights : [];

    const jumlahMalam =
      Number(pricing.jumlahMalam) ||
      nights.length ||
      calculateNightCount(state.booking.checkIn, state.booking.checkOut);

    const subtotal = Number(pricing.subtotal) || Number(pricing.roomPrice) || 0;

    const extraPerson =
      Number(pricing.extraPersonPrice) || Number(pricing.extraPerson) || 0;

    const discount = Number(pricing.discount) || 0;

    const tax = Number(pricing.tax) || 0;

    const total = Number(pricing.total) || Number(pricing.grandTotal) || 0;

    return `

      <div class="public-full-pricing">

        <div class="public-full-pricing-header">

          <span>
            PRICE SUMMARY
          </span>

          <strong>
            ${jumlahMalam}
            ${jumlahMalam === 1 ? "night" : "nights"}
          </strong>

        </div>


        ${
          nights.length
            ? `
              <div class="public-night-list">

                ${nights
                  .map(
                    (night) => `

                      <div class="public-night-row">

                        <span>
                          ${formatDate(night.tanggal || night.date || "")}
                        </span>

                        <strong>
                          ${formatCurrency(
                            Number(
                              night.harga || night.price || night.nominal || 0,
                            ),
                          )}
                        </strong>

                      </div>

                    `,
                  )
                  .join("")}

              </div>
            `
            : ""
        }


        <div class="public-price-line">

          <span>
            Room / Unit
          </span>

          <strong>
            ${formatCurrency(subtotal)}
          </strong>

        </div>


        ${
          extraPerson > 0
            ? `
              <div class="public-price-line">

                <span>
                  Extra Person
                </span>

                <strong>
                  ${formatCurrency(extraPerson)}
                </strong>

              </div>
            `
            : ""
        }


        ${
          discount > 0
            ? `
              <div class="public-price-line">

                <span>
                  Discount
                </span>

                <strong>
                  -
                  ${formatCurrency(discount)}
                </strong>

              </div>
            `
            : ""
        }


        ${
          tax > 0
            ? `
              <div class="public-price-line">

                <span>
                  Tax
                </span>

                <strong>
                  ${formatCurrency(tax)}
                </strong>

              </div>
            `
            : ""
        }


        <div class="public-price-total">

          <span>
            TOTAL
          </span>

          <strong>
            ${formatCurrency(total)}
          </strong>

        </div>

      </div>

    `;
  }

  function bindPaymentEvents() {
    document
      .getElementById("paymentProofFile")
      ?.addEventListener("change", handlePaymentProofChange);

    document
      .getElementById("paymentSubmitButton")
      ?.addEventListener("click", submitPayment);

    document
      .getElementById("backToStaysButton")
      ?.addEventListener("click", () => {
        window.location.href = "./penginapan.html";
      });
  }

  /* ==========================================================
     WIZARD FOOTER
  ========================================================== */

  function renderWizardFooter() {
    if (!dom.wizardFooter) {
      return;
    }

    let html = "";

    /* ======================================================
       STEP 1
    ====================================================== */

    if (state.step === 1) {
      html = `

        <button
          type="button"
          class="btn btn-outline"
          id="wizardCancelButton"
        >
          Back to stays
        </button>

        <button
          type="button"
          class="btn btn-dark"
          id="wizardNextButton"
        >
          Continue →
        </button>

      `;
    } else if (state.step === 2) {
      /* ======================================================
       STEP 2
    ====================================================== */
      html = `

        <button
          type="button"
          class="btn btn-outline"
          id="wizardPreviousButton"
        >
          Back
        </button>

        <button
          type="button"
          class="btn btn-dark"
          id="wizardNextButton"
          ${!state.selectedUnit ? "disabled" : ""}
        >
          Continue
        </button>

      `;
    } else if (state.step === 3) {
      /* ======================================================
       STEP 3
    ====================================================== */
      html = `

        <button
          type="button"
          class="btn btn-outline"
          id="wizardPreviousButton"
        >
          Back
        </button>

        <button
          type="button"
          class="btn btn-dark"
          id="wizardNextButton"
        >
          Review booking
        </button>

      `;
    } else if (state.step === 4) {
      /* ======================================================
       STEP 4
    ====================================================== */
      html = `

        <button
          type="button"
          class="btn btn-outline"
          id="wizardPreviousButton"
          ${state.submitting ? "disabled" : ""}
        >
          Back
        </button>

        <button
          type="button"
          class="btn btn-dark"
          id="wizardSubmitButton"
          ${state.submitting ? "disabled" : ""}
        >
          ${state.submitting ? "Creating booking..." : "Book now"}
        </button>

      `;
    }

    dom.wizardFooter.innerHTML = html;

    bindWizardFooterEvents();
  }

  /* ==========================================================
     FOOTER EVENTS
  ========================================================== */

  function bindWizardFooterEvents() {
    document
      .getElementById("wizardCancelButton")
      ?.addEventListener("click", () => {
        window.location.href = "./penginapan.html";
      });

    document
      .getElementById("wizardPreviousButton")
      ?.addEventListener("click", () => {
        previousStep();
      });

    document
      .getElementById("wizardNextButton")
      ?.addEventListener("click", () => {
        nextStep();
      });

    document
      .getElementById("wizardSubmitButton")
      ?.addEventListener("click", () => {
        submitBooking();
      });
  }

  /* ==========================================================
     NEXT STEP
  ========================================================== */

  async function nextStep() {
    clearWizardError();

    /* ======================================================
     STEP 1
  ====================================================== */

    if (state.step === 1) {
      const valid = readAndValidateStep1();

      if (!valid) {
        return;
      }

      /*
       * User memilih kamar dari OUR ROOMS.
       *
       * Server tetap melakukan validasi
       * availability dan pricing.
       */

      if (state.selectedFromShowcase && state.selectedUnit?.id) {
        await continueWithSelectedUnit();

        return;
      }

      /*
       * Jika belum memilih kamar,
       * untuk sementara jangan lanjut.
       *
       * Room selection sekarang berasal
       * dari OUR ROOMS.
       */

      if (!state.selectedUnit?.id) {
        showWizardError("Silakan pilih kamar terlebih dahulu dari OUR ROOMS.");

        return;
      }

      /*
       * Validasi availability + pricing
       * untuk kamar yang sudah dipilih.
       */

      await continueWithSelectedUnit();

      return;
    }

    /* ======================================================
     STEP 2 — GUEST
  ====================================================== */

    if (state.step === 2) {
      const valid = readAndValidateStep3();

      if (!valid) {
        return;
      }

      state.step = 3;

      renderWizard();

      scrollWizard();

      return;
    }

    /* ======================================================
     STEP 3 — CONFIRM
  ====================================================== */

    if (state.step === 3) {
      await submitBooking();

      return;
    }
  }

  /* ==========================================================
   CONTINUE WITH SELECTED SHOWCASE UNIT
========================================================== */

  async function continueWithSelectedUnit() {
    if (state.searching) {
      return;
    }

    state.searching = true;

    clearWizardError();

    setSearchButtonLoading(true);

    try {
      const payload = {
        penginapanId: state.penginapan.id,

        checkIn: state.booking.checkIn,

        checkOut: state.booking.checkOut,

        dewasa: state.booking.dewasa,

        anak: state.booking.anak,
      };

      console.log("[PublicPenginapanDetail] Checking selected unit:", payload);

      const result = await API.post("reservation.availability", payload);

      console.log(
        "[PublicPenginapanDetail] Selected unit availability:",
        result,
      );

      if (!result || result.success === false) {
        throw new Error(result?.message || "Gagal mengecek ketersediaan unit.");
      }

      const data = result.data;

      const availableUnits = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
          ? data.rows
          : [];

      /*
       * Cari kembali unit yang sebelumnya
       * dipilih dari OUR ROOMS.
       */
      const availableUnit = availableUnits.find(
        (item) => String(item.id) === String(state.selectedUnit.id),
      );

      /*
       * Unit sudah tidak tersedia
       * untuk tanggal / kapasitas ini.
       */
      if (!availableUnit) {
        showWizardError(
          "Kamar yang dipilih tidak tersedia pada tanggal tersebut. Silakan pilih tanggal lain.",
        );

        return;
      }

      /*
       * Gunakan data unit hasil pengecekan server.
       */
      state.selectedUnit = availableUnit;

      state.units = [availableUnit];

      state.pricing = null;

      /*
       * Hitung harga berdasarkan:
       * - penginapan
       * - unit
       * - tanggal
       * - jumlah tamu
       */
      const pricing = await calculatePrice();

      if (!pricing) {
        return;
      }

      /*
       * Semua valid.
       * Karena kamar sudah dipilih dari OUR ROOMS,
       * lanjut ke STEP 2 — GUEST.
       */
      state.step = 2;

      renderWizard();

      scrollWizard();
    } catch (error) {
      console.error(
        "[PublicPenginapanDetail] Selected unit availability error:",
        error,
      );

      showWizardError(error?.message || "Gagal mengecek ketersediaan unit.");
    } finally {
      state.searching = false;

      setSearchButtonLoading(false);
    }
  }

  /* ==========================================================
     PREVIOUS STEP
  ========================================================== */

  function previousStep() {
    if (state.step <= 1) {
      return;
    }

    state.step -= 1;

    renderWizard();

    scrollWizard();
  }

  /* ==========================================================
     READ + VALIDATE STEP 1
  ========================================================== */

  function readAndValidateStep1() {
    const checkIn =
      document.getElementById("wizardCheckIn")?.value || state.booking.checkIn;

    const checkOut =
      document.getElementById("wizardCheckOut")?.value ||
      state.booking.checkOut;

    const dewasa =
      Number(
        document.getElementById("wizardDewasa")?.value || state.booking.dewasa,
      ) || 0;

    const anak =
      Number(
        document.getElementById("wizardAnak")?.value || state.booking.anak,
      ) || 0;

    state.booking.checkIn = checkIn;

    state.booking.checkOut = checkOut;

    state.booking.dewasa = dewasa;

    state.booking.anak = anak;

    if (!checkIn) {
      showWizardError("Tanggal check-in wajib dipilih.");

      return false;
    }

    if (!checkOut) {
      showWizardError("Tanggal check-out wajib dipilih.");

      return false;
    }

    if (checkOut <= checkIn) {
      showWizardError("Tanggal check-out harus setelah check-in.");

      return false;
    }

    if (dewasa < 1) {
      showWizardError("Minimal 1 tamu dewasa.");

      return false;
    }

    if (anak < 0) {
      showWizardError("Jumlah anak tidak valid.");

      return false;
    }

    return true;
  }

  /* ==========================================================
   LOAD INITIAL AVAILABILITY
   Dipanggil otomatis saat detail penginapan dibuka.
   Availability tetap berada di STEP 1.
========================================================== */

  async function loadInitialAvailability() {
    if (!state.penginapan?.id) {
      return;
    }

    if (!state.booking.checkIn || !state.booking.checkOut) {
      return;
    }

    try {
      const payload = {
        penginapanId: state.penginapan.id,
        checkIn: state.booking.checkIn,
        checkOut: state.booking.checkOut,
        dewasa: state.booking.dewasa,
        anak: state.booking.anak,
      };

      console.log("[PublicPenginapanDetail] Initial availability:", payload);

      const result = await API.post("reservation.availability", payload);

      console.log(
        "[PublicPenginapanDetail] Initial availability result:",
        result,
      );

      if (!result || result.success === false) {
        throw new Error(result?.message || "Gagal memuat ketersediaan unit.");
      }

      const data = result.data;

      /*
       * HASIL AVAILABILITY LANGSUNG
       * MENJADI SUMBER DATA UNIT.
       *
       * Tidak lagi menggunakan:
       * - availableUnitIds
       * - availabilityChecked
       * - allUnits untuk menentukan availability
       */

      state.units = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
          ? data.rows
          : [];

      state.selectedUnit = null;

      state.selectedFromShowcase = false;

      state.pricing = null;

      state.step = 1;

      renderWizard();
    } catch (error) {
      console.error(
        "[PublicPenginapanDetail] Initial availability error:",
        error,
      );

      /*
       * Jangan membuat halaman detail gagal
       * hanya karena availability gagal dimuat.
       */

      state.units = [];

      renderWizard();
    }
  }

  /* ==========================================================
     SEARCH AVAILABILITY
  ========================================================== */

  async function searchAvailability() {
    if (state.searching) {
      return;
    }

    state.searching = true;

    clearWizardError();

    setSearchButtonLoading(true);

    try {
      const payload = {
        penginapanId: state.penginapan.id,

        checkIn: state.booking.checkIn,

        checkOut: state.booking.checkOut,

        dewasa: state.booking.dewasa,

        anak: state.booking.anak,
      };

      console.log("[PublicPenginapanDetail] Availability:", payload);

      const result = await API.post("reservation.availability", payload);

      console.log("[PublicPenginapanDetail] Availability result:", result);

      if (!result || result.success === false) {
        throw new Error(result?.message || "Gagal mencari unit tersedia.");
      }

      const data = result.data;

      state.units = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
          ? data.rows
          : [];

      /* =========================================
   HASIL AVAILABILITY ADALAH SUMBER KEBENARAN
========================================= */

      state.selectedUnit = null;

      state.selectedFromShowcase = false;

      state.pricing = null;

      state.step = 1;

      renderWizard();

      scrollWizard();
    } catch (error) {
      console.error("[PublicPenginapanDetail] Availability error:", error);

      showWizardError(error?.message || "Gagal mencari unit tersedia.");
    } finally {
      state.searching = false;

      setSearchButtonLoading(false);
    }
  }

  /* ==========================================================
   SELECT UNIT
========================================================== */

  async function selectUnit(unitId) {
    const unit = state.units.find((item) => String(item.id) === String(unitId));

    if (!unit) {
      showWizardError("Unit tidak ditemukan.");

      return;
    }

    /* ======================================================
     SET SELECTED UNIT
  ====================================================== */

    state.selectedUnit = unit;
    state.selectedFromShowcase = false;

    state.pricing = null;

    clearWizardError();

    /* ======================================================
     RENDER SELECTED STATE
  ====================================================== */

    renderWizard();

    /* ======================================================
     CALCULATE PRICE
  ====================================================== */

    await calculatePrice();
  }

  /* ==========================================================
     READ + VALIDATE STEP 3
  ========================================================== */

  function readAndValidateStep3() {
    const nama = document.getElementById("guestNama")?.value?.trim() || "";

    const noHpRaw = document.getElementById("guestNoHp")?.value?.trim() || "";

    const email = document.getElementById("guestEmail")?.value?.trim() || "";

    const catatan =
      document.getElementById("guestCatatan")?.value?.trim() || "";

    const noHp = normalizeWhatsapp(noHpRaw);

    state.booking.namaTamu = nama;

    state.booking.noHp = noHp;

    state.booking.email = email;

    state.booking.catatan = catatan;

    if (!nama) {
      showWizardError("Nama tamu wajib diisi.");

      return false;
    }

    if (!noHp) {
      showWizardError("Nomor WhatsApp wajib diisi.");

      return false;
    }

    if (noHp.length < 10) {
      showWizardError("Nomor WhatsApp tidak valid.");

      return false;
    }

    if (email && !isValidEmail(email)) {
      showWizardError("Format email tidak valid.");

      return false;
    }

    return true;
  }

  /* ==========================================================
     SUBMIT BOOKING
  ========================================================== */

  async function submitBooking() {
    if (state.submitting) {
      return;
    }

    clearWizardError();

    /*
     * Pastikan semua data
     * masih lengkap.
     */

    if (!state.penginapan?.id) {
      showWizardError("Data penginapan tidak valid.");

      return;
    }

    if (!state.selectedUnit?.id) {
      showWizardError("Unit belum dipilih.");

      return;
    }

    if (!state.pricing) {
      const pricing = await calculatePrice();

      if (!pricing) {
        return;
      }
    }

    if (!state.booking.namaTamu || !state.booking.noHp) {
      state.step = 3;

      renderWizard();

      showWizardError("Data tamu belum lengkap.");

      return;
    }

    state.submitting = true;

    renderWizard();

    try {
      /*
       * IMPORTANT:
       *
       * Jangan mengirim harga final
       * dari frontend sebagai sumber
       * kebenaran.
       *
       * Backend ReservationService.create()
       * akan menghitung ulang pricing.
       */

      const payload = {
        penginapanId: state.penginapan.id,

        penginapanNama: state.penginapan.nama || "",

        unitId: state.selectedUnit.id,

        nomorKamar: state.selectedUnit.nama || "",

        tipeKamar: state.selectedUnit.tipe || "",

        namaTamu: state.booking.namaTamu,

        noHp: state.booking.noHp,

        email: state.booking.email,

        catatan: state.booking.catatan,

        checkIn: state.booking.checkIn,

        checkOut: state.booking.checkOut,

        dewasa: state.booking.dewasa,

        anak: state.booking.anak,

        channel: CHANNEL,
      };

      console.log("[PublicPenginapanDetail] reservation.store:", payload);

      const result = await API.post("reservation.store", payload);

      console.log("[PublicPenginapanDetail] reservation.store result:", result);

      if (!result || result.success === false) {
        throw new Error(result?.message || "Reservasi gagal dibuat.");
      }

      state.result = result.data || null;

      showSuccess();
    } catch (error) {
      console.error("[PublicPenginapanDetail] Booking error:", error);

      state.submitting = false;

      renderWizard();

      showWizardError(error?.message || "Gagal membuat reservasi.");
    }
  }

  function openWhatsappBooking() {
    const reservation = state.result || {};

    const kode = reservation.kode || reservation.id || "";

    const phone = normalizeWhatsapp(state.booking.noHp);

    if (!kode || !phone) {
      console.warn("[PublicPenginapanDetail] WhatsApp data tidak lengkap.");
      return;
    }

    const lookupUrl = `${window.location.origin}/public/reservation-lookup?kode=${encodeURIComponent(kode)}`;

    const message = [
      "Booking Anda berhasil dibuat 🎉",
      "",
      `Nomor Reservasi: ${kode}`,
      "",
      "Silakan lanjutkan proses booking dengan melakukan pembayaran.",
      "",
      "Untuk melihat detail reservasi dan melanjutkan pembayaran, silakan buka link berikut:",
      "",
      lookupUrl,
      "",
      "Gunakan nomor reservasi dan nomor telepon yang digunakan saat melakukan booking.",
      "",
      "Terima kasih 🙏",
      "Dieng Net",
    ].join("\n");

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  function normalizeWhatsapp(value) {
    let phone = String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");

    if (phone.startsWith("08")) {
      phone = "62" + phone.substring(1);
    }

    if (phone.startsWith("+62")) {
      phone = phone.substring(1);
    }

    return phone;
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  function showSuccess() {
    state.submitting = false;

    state.step = 4;

    renderPaymentPage();

    scrollWizard();
  }

  /* ==========================================================
   PAYMENT PAGE
========================================================== */

  function renderPaymentPage() {
    if (!dom.wizardContent) {
      return;
    }

    const reservation = state.result || {};

    const reservationId = reservation.id || reservation.kode || "";

    const kode = reservation.kode || reservation.id || "-";

    const penginapan =
      reservation.penginapanNama || state.penginapan?.nama || "-";

    const unit =
      reservation.nomorKamar ||
      reservation.unitNama ||
      state.selectedUnit?.nama ||
      "-";

    const checkIn = reservation.checkIn || state.booking.checkIn;

    const checkOut = reservation.checkOut || state.booking.checkOut;

    const total = Number(reservation.grandTotal || 0);

    dom.wizardContent.innerHTML = `

    <div class="public-wizard-panel payment-result-panel">

      <!-- =================================
           SUCCESS
      ================================== -->

      <div class="payment-success-icon">
        <i
          data-lucide="check"
          aria-hidden="true"
        ></i>
      </div>


      <div class="public-wizard-panel-heading">

        <span class="eyebrow eyebrow-dark">
          RESERVATION CREATED
        </span>

        <h3>
          Your stay is reserved.
        </h3>

        <p>
          Reservasi berhasil dibuat dan unit
          telah masuk ke proses hold.
        </p>

      </div>


      <!-- =================================
           RESERVATION SUMMARY
      ================================== -->

      <div class="public-booking-summary">

        <div>

          <span>
            RESERVATION CODE
          </span>

          <strong>
            ${escapeHtml(kode)}
          </strong>

        </div>


        <div>

          <span>
            STAY
          </span>

          <strong>
            ${escapeHtml(penginapan)}
          </strong>

        </div>


        <div>

          <span>
            UNIT
          </span>

          <strong>
            ${escapeHtml(unit)}
          </strong>

        </div>


        <div>

          <span>
            CHECK-IN
          </span>

          <strong>
            ${formatDate(checkIn)}
          </strong>

        </div>


        <div>

          <span>
            CHECK-OUT
          </span>

          <strong>
            ${formatDate(checkOut)}
          </strong>

        </div>


        <div>

          <span>
            TOTAL
          </span>

          <strong>
            ${formatCurrency(total)}
          </strong>

        </div>

      </div>


      <!-- =================================
           PAYMENT
      ================================== -->

      <div class="public-payment-box">

        <span class="eyebrow eyebrow-dark">
          PAYMENT
        </span>

        <h4>
          Complete your payment.
        </h4>

        <p>
          Silakan lakukan pembayaran sesuai
          total reservasi untuk melanjutkan
          proses booking.
        </p>


        <!-- TOTAL -->

        <div class="public-payment-total">

          <span>
            TOTAL PEMBAYARAN
          </span>

          <strong>
            ${formatCurrency(total)}
          </strong>

        </div>


        <!-- =================================
             TRANSFER INFO
        ================================== -->

        <div class="public-payment-method">

          <div class="public-payment-method-heading">

            <i
              data-lucide="landmark"
              aria-hidden="true"
            ></i>

            <div>

              <strong>
                Bank Transfer
              </strong>

              <span>
                Transfer sesuai nominal di atas.
              </span>

            </div>

          </div>


          <div class="public-payment-bank">

            <span>
              BANK
            </span>

            <strong>
              BCA
            </strong>

            <span>
              NO. REKENING
            </span>

            <strong>
              1234567890
            </strong>

            <span>
              ATAS NAMA
            </span>

            <strong>
              DIENG NET
            </strong>

          </div>

        </div>


        <!-- =================================
             PAYMENT FORM
        ================================== -->

        <div class="public-payment-form">

          <div class="booking-field">

            <label for="paymentDate">
              TANGGAL PEMBAYARAN *
            </label>

            <input
              type="date"
              id="paymentDate"
            />

          </div>


          <div class="booking-field">

            <label for="paymentAmount">
              NOMINAL PEMBAYARAN *
            </label>

            <input
              type="number"
              id="paymentAmount"
              min="1"
              value="${total}"
            />

          </div>


          <div class="booking-field">

            <label for="paymentReference">
              NOMOR REFERENSI *
            </label>

            <input
              type="text"
              id="paymentReference"
              maxlength="100"
              placeholder="Contoh: TRX123456"
            />

          </div>


          <div class="booking-field">

            <label for="paymentNote">
              CATATAN
            </label>

            <textarea
              id="paymentNote"
              rows="3"
              maxlength="500"
              placeholder="Catatan pembayaran (opsional)"
            ></textarea>

          </div>


          <div class="booking-field payment-proof-field">

            <label for="paymentProofFile">
              BUKTI PEMBAYARAN *
            </label>

            <input
              type="file"
              id="paymentProofFile"
              accept="image/jpeg,image/png,image/webp"
              hidden
            />

            <label
              for="paymentProofFile"
              class="payment-proof-upload"
              id="paymentProofUpload"
            >

              <span class="payment-proof-upload-icon">
                <i data-lucide="upload"></i>
              </span>

              <strong>
                Upload bukti transfer
              </strong>

              <span>
                JPG, PNG atau WEBP • Maks. 5 MB
              </span>

            </label>


            <div
              id="paymentProofPreview"
              class="payment-proof-preview"
              hidden
            ></div>

          </div>

        </div>


        <!-- =================================
             PAYMENT ERROR
        ================================== -->

        <div
          id="paymentError"
          class="booking-error"
          hidden
        ></div>


        <!-- =================================
             PAYMENT ACTION
        ================================== -->

        <div class="public-payment-actions">

          <button
            type="button"
            class="btn btn-dark"
            id="paymentSubmitButton"
          >
            Submit payment
          </button>

          <button
            type="button"
            class="btn btn-outline"
            id="backToStaysButton"
          >
            Back to stays
          </button>

        </div>

      </div>

    </div>

  `;

    bindPaymentEvents();

    setDefaultPaymentDate();

    createIcons();
  }

  /* ==========================================================
     DEFAULT DATES
  ========================================================== */

  function setDefaultDates() {
    const today = new Date();

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    state.booking.checkIn = formatInputDate(today);

    state.booking.checkOut = formatInputDate(tomorrow);
  }

  function setDefaultPaymentDate() {
    const input = document.getElementById("paymentDate");

    if (!input) {
      return;
    }

    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    input.value = `${year}-${month}-${day}`;
  }

  /* ==========================================================
   SUBMIT PAYMENT
========================================================== */

  /* ==========================================================
   SUBMIT PAYMENT
========================================================== */

  async function submitPayment() {
    if (state.paymentSubmitting) {
      return;
    }

    clearWizardError();

    const reservation = state.result || {};

    const reservationId = reservation.id || reservation.kode || "";

    if (!reservationId) {
      showPaymentError("ID reservasi tidak ditemukan.");

      return;
    }

    const paymentDate =
      document.getElementById("paymentDate")?.value?.trim() || "";

    const paymentAmount =
      Number(document.getElementById("paymentAmount")?.value) || 0;

    const paymentReference =
      document.getElementById("paymentReference")?.value?.trim() || "";

    const paymentNote =
      document.getElementById("paymentNote")?.value?.trim() || "";

    const proofFile =
      document.getElementById("paymentProofFile")?.files?.[0] || null;

    /* =====================================
     VALIDATE
  ===================================== */

    if (!paymentDate) {
      showPaymentError("Tanggal pembayaran wajib diisi.");

      return;
    }

    if (paymentAmount <= 0) {
      showPaymentError("Nominal pembayaran tidak valid.");

      return;
    }

    if (!paymentReference) {
      showPaymentError("Nomor referensi wajib diisi.");

      return;
    }

    if (!proofFile) {
      showPaymentError("Bukti pembayaran wajib diupload.");

      return;
    }

    if (!validatePaymentProof(proofFile)) {
      return;
    }

    state.paymentSubmitting = true;

    setPaymentSubmitLoading(true);

    try {
      /* =================================
       1. FILE → BASE64
    ================================= */

      const base64 = await fileToBase64(proofFile);

      /* =================================
       2. UPLOAD GOOGLE DRIVE
    ================================= */

      const uploadPayload = {
        reservationId,

        fileName: proofFile.name,

        mimeType: proofFile.type,

        base64,
      };

      console.log("[PublicPayment] Upload proof:", {
        reservationId,
        fileName: proofFile.name,
        mimeType: proofFile.type,
        size: proofFile.size,
      });

      const uploadResult = await API.post(
        "payment.proof.upload",
        uploadPayload,
      );

      console.log("[PublicPayment] Upload result:", uploadResult);

      if (!uploadResult || uploadResult.success === false) {
        throw new Error(
          uploadResult?.message || "Gagal mengupload bukti pembayaran.",
        );
      }

      const proof = uploadResult.data || uploadResult;

      /* =================================
       3. AMBIL PROOF DATA
    ================================= */

      const proofFileId = proof.fileId || proof.id || "";

      const proofUrl = proof.url || proof.proofUrl || proof.fileUrl || "";

      if (!proofFileId && !proofUrl) {
        throw new Error(
          "Bukti pembayaran berhasil diupload tetapi data file tidak ditemukan.",
        );
      }

      /* =================================
       4. PAYMENT STORE
    ================================= */

      const paymentPayload = {
        reservationId,

        paymentDate,

        paymentMethod: "TRANSFER",

        paymentAmount,

        paymentReference,

        paymentNote,

        proof: proofUrl,

        proofFileId,

        proofFileName: proof.fileName || proofFile.name,

        proofMimeType: proof.mimeType || proofFile.type,

        proofSize: proof.size || proofFile.size,
      };

      console.log("[PublicPayment] payment.store:", paymentPayload);

      const paymentResult = await API.post("payment.store", paymentPayload);

      console.log("[PublicPayment] payment.store result:", paymentResult);

      if (!paymentResult || paymentResult.success === false) {
        throw new Error(
          paymentResult?.message || "Gagal menyimpan pembayaran.",
        );
      }

      /* =================================
       5. SUCCESS
    ================================= */

      state.paymentResult = paymentResult.data || paymentResult;

      renderPaymentSubmitted();
    } catch (error) {
      console.error("[PublicPayment] Submit error:", error);

      showPaymentError(error?.message || "Gagal mengirim pembayaran.");
    } finally {
      state.paymentSubmitting = false;

      setPaymentSubmitLoading(false);
    }
  }

  function setPaymentSubmitLoading(loading) {
    const button = document.getElementById("paymentSubmitButton");

    if (!button) {
      return;
    }

    button.disabled = Boolean(loading);

    button.textContent = loading ? "Uploading payment..." : "Submit payment";
  }

  function showPaymentError(message) {
    const element = document.getElementById("paymentError");

    if (!element) {
      return;
    }

    element.textContent = message || "Terjadi kesalahan.";

    element.hidden = false;
  }

  function clearPaymentError() {
    const element = document.getElementById("paymentError");

    if (!element) {
      return;
    }

    element.textContent = "";

    element.hidden = true;
  }

  function renderPaymentSubmitted() {
    if (!dom.wizardContent) {
      return;
    }

    const reservation = state.result || {};

    const payment = state.payment || {};

    const kode = reservation.kode || reservation.id || "-";

    const total = Number(reservation.grandTotal || 0);

    dom.wizardContent.innerHTML = `

    <div class="public-wizard-panel payment-pending-panel">

      <div class="payment-success-icon">

        <i
          data-lucide="clock-3"
          aria-hidden="true"
        ></i>

      </div>


      <div class="public-wizard-panel-heading">

        <span class="eyebrow eyebrow-dark">
          PAYMENT SUBMITTED
        </span>

        <h3>
          Payment is pending.
        </h3>

        <p>
          Bukti pembayaran berhasil dikirim
          dan sedang menunggu verifikasi admin.
        </p>

      </div>


      <div class="public-booking-summary">

        <div>

          <span>
            RESERVATION CODE
          </span>

          <strong>
            ${escapeHtml(kode)}
          </strong>

        </div>


        <div>

          <span>
            PAYMENT STATUS
          </span>

          <strong>
            PENDING
          </strong>

        </div>


        <div>

          <span>
            PAYMENT METHOD
          </span>

          <strong>
            TRANSFER
          </strong>

        </div>


        <div>

          <span>
            AMOUNT
          </span>

          <strong>
            ${formatCurrency(total)}
          </strong>

        </div>

      </div>


      <div class="public-payment-notice">

        <i
          data-lucide="info"
          aria-hidden="true"
        ></i>

        <span>
          Reservasi Anda masih dalam proses hold.
          Simpan kode reservasi untuk proses
          selanjutnya.
        </span>

      </div>


      <div class="public-payment-actions">

        <button
          type="button"
          class="btn btn-dark"
          id="paymentBackToStays"
        >
          Back to stays
        </button>

      </div>

    </div>

  `;

    document
      .getElementById("paymentBackToStays")
      ?.addEventListener("click", () => {
        window.location.href = "./penginapan.html";
      });

    createIcons();
  }

  /* ==========================================================
     UPDATE CHECKOUT MIN
  ========================================================== */

  function updateCheckoutMin() {
    const checkIn =
      document.getElementById("wizardCheckIn")?.value || state.booking.checkIn;

    const checkOut = document.getElementById("wizardCheckOut");

    if (!checkIn || !checkOut) {
      return;
    }

    const nextDay = new Date(`${checkIn}T00:00:00`);

    if (Number.isNaN(nextDay.getTime())) {
      return;
    }

    nextDay.setDate(nextDay.getDate() + 1);

    const minValue = formatInputDate(nextDay);

    checkOut.min = minValue;

    if (!checkOut.value || checkOut.value <= checkIn) {
      checkOut.value = minValue;

      state.booking.checkOut = minValue;
    }
  }

  /* ==========================================================
   FILE TO BASE64
========================================================== */

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = String(reader.result || "");

        /*
         * FileReader menghasilkan:
         *
         * data:image/png;base64,AAAA...
         *
         * Backend hanya membutuhkan:
         *
         * AAAA...
         */

        const base64 = result.includes(",") ? result.split(",")[1] : result;

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Gagal membaca file bukti pembayaran."));
      };

      reader.readAsDataURL(file);
    });
  }

  /* ==========================================================
   VALIDATE PAYMENT PROOF
========================================================== */

  function validatePaymentProof(file) {
    if (!file) {
      showPaymentError("Bukti pembayaran wajib diupload.");

      return false;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showPaymentError("Format bukti harus JPG, PNG atau WEBP.");

      return false;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showPaymentError("Ukuran bukti maksimal 5 MB.");

      return false;
    }

    return true;
  }

  /* ==========================================================
   PAYMENT PROOF FILE
========================================================== */

  function handlePaymentProofChange(event) {
    clearPaymentError();

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validatePaymentProof(file)) {
      event.target.value = "";

      return;
    }

    const preview = document.getElementById("paymentProofPreview");

    if (!preview) {
      return;
    }

    const url = URL.createObjectURL(file);

    preview.hidden = false;

    preview.innerHTML = `

    <div class="payment-proof-preview-image">

      <img
        src="${escapeAttribute(url)}"
        alt="Preview bukti pembayaran"
      />

    </div>


    <div class="payment-proof-preview-info">

      <strong>
        ${escapeHtml(file.name)}
      </strong>

      <span>
        ${formatFileSize(file.size)}
      </span>

    </div>


    <button
      type="button"
      class="btn btn-outline payment-proof-remove"
      id="paymentProofRemove"
    >
      Hapus
    </button>

  `;

    document
      .getElementById("paymentProofRemove")
      ?.addEventListener("click", () => {
        event.target.value = "";

        preview.hidden = true;

        preview.innerHTML = "";

        URL.revokeObjectURL(url);
      });
  }

  function formatFileSize(bytes = 0) {
    const size = Number(bytes) || 0;

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function removePaymentProof() {
    const input = document.getElementById("paymentProofFile");

    const preview = document.getElementById("paymentProofPreview");

    if (state.payment.proofPreviewUrl) {
      URL.revokeObjectURL(state.payment.proofPreviewUrl);
    }

    state.payment.proofFile = null;

    state.payment.proofFileName = "";

    state.payment.proofMimeType = "";

    state.payment.proofPreviewUrl = "";

    if (input) {
      input.value = "";
    }

    if (preview) {
      preview.hidden = true;

      preview.innerHTML = "";
    }
  }

  /* ==========================================================
     SEARCH BUTTON LOADING
  ========================================================== */

  function setSearchButtonLoading(loading) {
    const button = document.getElementById("wizardNextButton");

    if (!button) {
      return;
    }

    button.disabled = loading;

    if (loading) {
      button.textContent = "Checking availability...";
    }
  }

  /* ==========================================================
     WIZARD ERROR
  ========================================================== */

  function showWizardError(message) {
    if (!dom.wizardError) {
      return;
    }

    dom.wizardError.textContent = message || "Terjadi kesalahan.";

    dom.wizardError.hidden = false;

    dom.wizardError.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  function clearWizardError() {
    if (!dom.wizardError) {
      return;
    }

    dom.wizardError.textContent = "";

    dom.wizardError.hidden = true;
  }

  /* ==========================================================
     RENDER GUEST OPTIONS
  ========================================================== */

  function renderGuestOptions(selected, min, max) {
    let html = "";

    for (let i = min; i <= max; i++) {
      html += `

        <option
          value="${i}"
          ${Number(selected) === i ? "selected" : ""}
        >
          ${i}
          ${i === 1 ? "Guest" : "Guests"}
        </option>

      `;
    }

    return html;
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
     MAP QUERY
  ========================================================== */

  function getMapQuery(item = {}) {
    if (item.maps) {
      try {
        const url = new URL(item.maps);

        const match = url.pathname.match(/\/maps\/search\/(.+)/);

        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      } catch (error) {
        console.warn("[PublicPenginapanDetail] Invalid Maps URL.");
      }
    }

    return [item.nama, item.alamat, item.desa, item.kecamatan, item.kabupaten]
      .filter(Boolean)
      .join(", ");
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
     DRIVE IMAGE
  ========================================================== */

  function resolveDriveImage(url) {
    if (!url) {
      return "";
    }

    const match = url.match(/[?&]id=([^&]+)/);

    if (match) {
      return "https://drive.google.com/thumbnail?id=" + match[1] + "&sz=w1600";
    }

    return url;
  }

  /* ==========================================================
     FACILITAS
  ========================================================== */

  function normalizeFasilitas(value) {
    if (!value) {
      return "";
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean)
        .join(", ");
    }

    return String(value).trim();
  }

  /* ==========================================================
     FORMAT CURRENCY
  ========================================================== */

  function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",

      currency: "IDR",

      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }).format(date);
  }

  /* ==========================================================
     FORMAT INPUT DATE
  ========================================================== */

  function formatInputDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* ==========================================================
     CALCULATE NIGHT COUNT
  ========================================================== */

  function calculateNightCount(checkIn, checkOut) {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(`${checkIn}T00:00:00`);

    const end = new Date(`${checkOut}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 0;
    }

    const diff = end.getTime() - start.getTime();

    return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);
  }

  /* ==========================================================
     VALIDATE EMAIL
  ========================================================== */

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ==========================================================
     DOCUMENT TITLE
  ========================================================== */

  function updateDocumentTitle(nama) {
    if (!nama) {
      return;
    }

    document.title = `Dieng Net — ${nama}`;
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  /* ==========================================================
   LOADING
========================================================== */

  function showLoading() {
    if (dom.loading) {
      dom.loading.hidden = false;

      Skeleton.detail("#detailLoading");
    }

    if (dom.content) {
      dom.content.hidden = true;
    }

    if (dom.footer) {
      dom.footer.hidden = true;
    }

    hideError();
  }

  function hideLoading() {
    if (dom.loading) {
      dom.loading.hidden = true;
    }
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  function showError(message) {
    hideLoading();

    if (dom.content) {
      dom.content.hidden = true;
    }

    if (dom.footer) {
      dom.footer.hidden = true;
    }

    if (dom.errorMessage) {
      dom.errorMessage.textContent = message || "Penginapan tidak ditemukan.";
    }

    if (dom.error) {
      dom.error.hidden = false;
    }
  }

  function hideError() {
    if (dom.error) {
      dom.error.hidden = true;
    }
  }

  /* ==========================================================
     SCROLL WIZARD
  ========================================================== */

  function scrollWizard() {
    const wizard = document.getElementById("reservationWizard");

    if (!wizard) {
      return;
    }

    window.setTimeout(() => {
      const top = wizard.getBoundingClientRect().top + window.scrollY - 100;

      window.scrollTo({
        top,

        behavior: "smooth",
      });
    }, 80);
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

  /* ==========================================================
     LUCIDE
  ========================================================== */

  function createIcons() {
    if (
      typeof lucide !== "undefined" &&
      typeof lucide.createIcons === "function"
    ) {
      lucide.createIcons();
    }
  }

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

    nextStep,

    previousStep,

    getState() {
      return {
        ...state,

        units: [...state.units],

        booking: {
          ...state.booking,
        },
      };
    },
  };
})();

/* ============================================================
   BOOTSTRAP
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  PublicPenginapanDetail.init();
});
