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

    selectedUnit: null,

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

    state.slug = getSlugFromUrl();

    console.log("[PublicPenginapanDetail] Slug:", state.slug);

    if (!state.slug) {
      showError("Slug penginapan tidak ditemukan.");

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

    return String(params.get("slug") || "").trim();
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
      const result = await API.post("penginapan.detail", {
        slug: state.slug,
      });

      console.log("[PublicPenginapanDetail] Property:", result);

      const penginapan = result?.data || null;

      if (!penginapan) {
        throw new Error("Penginapan tidak ditemukan.");
      }

      state.penginapan = penginapan;

      renderProperty();
    } catch (error) {
      console.error("[PublicPenginapanDetail] Load error:", error);

      state.error = error?.message || "Gagal memuat penginapan.";

      showError(state.error);
    } finally {
      state.loading = false;

      hideLoading();
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
     WIZARD
  ========================================================== */

  function renderWizard() {
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
        renderStep2();

        break;

      case 3:
        renderStep3();

        break;

      case 4:
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

  function renderStep1() {
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

    if (checkIn) {
      checkIn.addEventListener("change", () => {
        state.booking.checkIn = checkIn.value;

        updateCheckoutMin();
      });
    }

    if (checkOut) {
      checkOut.addEventListener("change", () => {
        state.booking.checkOut = checkOut.value;
      });
    }

    if (dewasa) {
      dewasa.addEventListener("change", () => {
        state.booking.dewasa = Number(dewasa.value) || 1;
      });
    }

    if (anak) {
      anak.addEventListener("change", () => {
        state.booking.anak = Number(anak.value) || 0;
      });
    }

    updateCheckoutMin();
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
            Choose your unit
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

  function renderStep4() {
    const unit = state.selectedUnit;

    const pricing = state.pricing || {};

    dom.wizardContent.innerHTML = `

      <div class="public-wizard-panel">

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


        <!-- PROPERTY -->

        <div class="public-confirm-section">

          <span class="public-confirm-label">
            STAY
          </span>

          <strong>
            ${escapeHtml(state.penginapan?.nama || "-")}
          </strong>

        </div>


        <!-- UNIT -->

        <div class="public-confirm-section">

          <span class="public-confirm-label">
            UNIT
          </span>

          <strong>
            ${escapeHtml(unit?.nama || "-")}
          </strong>

          ${
            unit?.tipe
              ? `
                <span>
                  ${escapeHtml(unit.tipe)}
                </span>
              `
              : ""
          }

        </div>


        <!-- DATES -->

        <div class="public-confirm-grid">

          <div class="public-confirm-section">

            <span class="public-confirm-label">
              CHECK-IN
            </span>

            <strong>
              ${formatDate(state.booking.checkIn)}
            </strong>

          </div>


          <div class="public-confirm-section">

            <span class="public-confirm-label">
              CHECK-OUT
            </span>

            <strong>
              ${formatDate(state.booking.checkOut)}
            </strong>

          </div>


          <div class="public-confirm-section">

            <span class="public-confirm-label">
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


        <!-- GUEST -->

        <div class="public-confirm-section">

          <span class="public-confirm-label">
            GUEST
          </span>

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


        <!-- PRICE -->

        ${renderFullPricing(pricing)}


        <!-- HOLD NOTICE -->

        <div class="public-wizard-note">

          <i
            data-lucide="clock-3"
            aria-hidden="true"
          ></i>

          <span>
            Setelah reservasi dibuat, unit akan
            ditahan sementara sesuai kebijakan sistem.
          </span>

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
          Search availability
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

      await searchAvailability();

      return;
    }

    /* ======================================================
   STEP 2
====================================================== */

    if (state.step === 2) {
      if (!state.selectedUnit) {
        showWizardError("Silakan pilih unit terlebih dahulu.");

        return;
      }

      /* ====================================================
     PASTIKAN PRICING SELESAI
  ==================================================== */

      if (state.pricingLoading && state.pricingRequest) {
        await state.pricingRequest;
      }

      /* ====================================================
     JIKA BELUM ADA PRICING
  ==================================================== */

      if (!state.pricing) {
        const pricing = await calculatePrice();

        if (!pricing) {
          return;
        }
      }

      /* ====================================================
     NEXT
  ==================================================== */

      state.step = 3;

      renderWizard();

      scrollWizard();

      return;
    }

    /* ======================================================
       STEP 3
    ====================================================== */

    if (state.step === 3) {
      const valid = readAndValidateStep3();

      if (!valid) {
        return;
      }

      state.step = 4;

      renderWizard();

      scrollWizard();

      return;
    }

    /* ======================================================
       STEP 4
    ====================================================== */

    if (state.step === 4) {
      await submitBooking();
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

      state.selectedUnit = null;

      state.pricing = null;

      state.step = 2;

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

    button.textContent = loading
      ? "Checking availability..."
      : "Search availability";
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

  function showLoading() {
    if (dom.loading) {
      dom.loading.hidden = false;
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
