/* ============================================================
   DIENG NET
   PUBLIC — PENGINAPAN DETAIL
   ============================================================

   Responsibility:

   - Read slug from URL
   - Load penginapan detail
   - Load active room types
   - Render cover
   - Render information
   - Render rooms
   - Booking Bottom Sheet
   - Price calculation via booking.price
   - Loading state
   - Error state
   - Mobile menu

   Architecture:

   URL
    ↓
   PublicPenginapanDetail
    ↓
   API.post()
    ↓
   penginapan.detail
   tipe-kamar.active
   booking.price

   IMPORTANT:

   - Tidak menggunakan Dummy
   - Tidak menggunakan Service langsung
   - Tidak menggunakan Repository langsung
   ============================================================ */

const PublicPenginapanDetail = (() => {
  /* ==========================================================
     STATE
  ========================================================== */

  const state = {
    slug: "",

    penginapan: null,

    rooms: [],

    loading: false,

    error: null,

    booking: {
      checkIn: "",

      checkOut: "",

      guests: 2,

      selectedRoom: null,

      pricing: null,

      loading: false,

      error: null,
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

    initBookingEvents();

    state.slug = getSlugFromUrl();

    console.log("[PublicPenginapanDetail] Slug:", state.slug);

    /*
     * Booking sheet harus selalu
     * tertutup saat halaman pertama kali
     * dibuka.
     */

    closeBookingSheet({
      reset: false,
      restoreFocus: false,
    });

    if (!state.slug) {
      showError("Slug penginapan tidak ditemukan.");

      return;
    }

    await load();
  }

  /* ==========================================================
     CACHE DOM
  ========================================================== */

  function cacheDom() {
    /* ======================================================
       DETAIL DOM
    ====================================================== */

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

    dom.roomList = document.getElementById("roomList");

    /* ======================================================
       MOBILE MENU
    ====================================================== */

    dom.mobileMenuBtn = document.getElementById("mobileMenuBtn");

    dom.mobileMenu = document.getElementById("mobileMenu");

    /* ======================================================
       BOOKING SHEET
    ====================================================== */

    dom.bookingSheet = document.getElementById("bookingSheet");

    dom.bookingSheetBackdrop = document.getElementById("bookingSheetBackdrop");

    dom.bookingSheetClose = document.getElementById("bookingSheetClose");

    dom.bookingSection = document.getElementById("bookingSection");

    dom.bookingPanel = document.getElementById("bookingPanel");

    dom.bookingSelectedRoom = document.getElementById("bookingSelectedRoom");

    dom.bookingRoomName = document.getElementById("bookingRoomName");

    dom.bookingCheckIn = document.getElementById("bookingCheckIn");

    dom.bookingCheckOut = document.getElementById("bookingCheckOut");

    dom.bookingGuests = document.getElementById("bookingGuests");

    dom.bookingPriceResult = document.getElementById("bookingPriceResult");

    dom.bookingNightCount = document.getElementById("bookingNightCount");

    dom.bookingNightList = document.getElementById("bookingNightList");

    dom.bookingTotal = document.getElementById("bookingTotal");

    dom.bookingError = document.getElementById("bookingError");

    dom.bookingPriceButton = document.getElementById("bookingPriceButton");

    dom.bookingSubmitButton = document.getElementById("bookingSubmitButton");
  }

  /* ==========================================================
     GET SLUG
  ========================================================== */

  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);

    return String(params.get("slug") || "").trim();
  }

  /* ==========================================================
     LOAD
  ========================================================== */

  async function load() {
    if (state.loading) {
      return;
    }

    state.loading = true;

    showLoading();

    try {
      /* =====================================================
         1. LOAD PENGINAPAN
      ===================================================== */

      console.log("[PublicPenginapanDetail] Request penginapan.detail:", {
        slug: state.slug,
      });

      const result = await API.post("penginapan.detail", {
        slug: state.slug,
      });

      console.log("[PublicPenginapanDetail] Penginapan result:", result);

      const penginapan = result?.data || null;

      if (!penginapan) {
        throw new Error("Penginapan tidak ditemukan.");
      }

      state.penginapan = penginapan;

      /* =====================================================
         2. LOAD ACTIVE ROOM
      ===================================================== */

      console.log("[PublicPenginapanDetail] Request tipe-kamar.active:", {
        penginapanId: penginapan.id,
      });

      const roomResult = await API.post("tipe-kamar.active", {
        penginapanId: penginapan.id,
      });

      console.log("[PublicPenginapanDetail] Room result:", roomResult);

      const roomData = roomResult?.data || {};

      /*
       * Backend bisa mengembalikan:
       *
       * [
       *   ...
       * ]
       *
       * atau:
       *
       * {
       *   rows: []
       * }
       */

      if (Array.isArray(roomData)) {
        state.rooms = roomData;
      } else {
        state.rooms = Array.isArray(roomData.rows) ? roomData.rows : [];
      }

      console.log("[PublicPenginapanDetail] Rooms:", state.rooms);

      /* =====================================================
         3. RENDER
      ===================================================== */

      render();
    } catch (error) {
      console.error("[PublicPenginapanDetail] Load error:", error);

      state.error = error?.message || "Gagal memuat detail penginapan.";

      showError(state.error);
    } finally {
      state.loading = false;

      hideLoading();
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  function render() {
    const item = state.penginapan;

    if (!item) {
      showError("Penginapan tidak ditemukan.");

      return;
    }

    renderCover(item);

    renderInfo(item);

    renderMeta(item);

    renderRooms(state.rooms);

    hideError();

    if (dom.content) {
      dom.content.hidden = false;
    }

    if (dom.footer) {
      dom.footer.hidden = false;
    }
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

            <!-- =========================================
                 GOOGLE MAPS
            ========================================== -->

            <div class="stay-map-card">

              <iframe
                src="https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed"
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
                        <span aria-hidden="true">↗</span>
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
     ROOMS
  ========================================================== */

  function renderRooms(rooms = []) {
    if (!dom.roomList) {
      return;
    }

    if (!rooms.length) {
      dom.roomList.innerHTML = `

        <div class="room-card">

          <div class="room-card-top">

            <h3>
              Room information
            </h3>

          </div>

          <p class="room-description">
            Belum ada tipe kamar aktif
            untuk penginapan ini.
          </p>

        </div>

      `;

      return;
    }

    dom.roomList.innerHTML = rooms
      .map((room, index) => renderRoomCard(room, index))
      .join("");

    bindRoomButtons();
  }

  /* ==========================================================
     ROOM CARD
  ========================================================== */

  function renderRoomCard(room = {}, index = 0) {
    /* =====================================
     BASIC DATA
  ===================================== */

    const nama = room.nama || "Tipe Kamar";

    const roomId = room.id || room.tipeKamarId || "";

    const fotoUrl = room.fotoUrl || "";

    const deskripsi = room.deskripsi || "";

    const fasilitas = normalizeFasilitas(room.fasilitas);

    /* =====================================
     KAPASITAS
  ===================================== */

    const kapasitasDewasa = Number(room.kapasitasDewasa) || 0;

    const kapasitasAnak = Number(room.kapasitasAnak) || 0;

    /* =====================================
     BED
  ===================================== */

    const jumlahBed = Number(room.jumlahBed) || 0;

    const jenisBed = room.jenisBed || "";

    /* =====================================
     LUAS
  ===================================== */

    const luas = Number(room.luas) || 0;

    /* =====================================
     ROOM NUMBER
  ===================================== */

    const roomNumber = String(index + 1).padStart(2, "0");

    /* =====================================
     CAPACITY TEXT
  ===================================== */

    let capacityText = "";

    if (kapasitasDewasa) {
      capacityText += `${kapasitasDewasa} Dewasa`;
    }

    if (kapasitasAnak) {
      capacityText += capacityText
        ? ` • ${kapasitasAnak} Anak`
        : `${kapasitasAnak} Anak`;
    }

    /* =====================================
     BED TEXT
  ===================================== */

    let bedText = "";

    if (jumlahBed) {
      bedText = `${jumlahBed} ${jenisBed}`;
    } else {
      bedText = jenisBed;
    }

    /* =====================================
     IMAGE
  ===================================== */

    const imageHtml = fotoUrl
      ? `

      <div class="room-card-image">

        <img
          src="${escapeAttribute(fotoUrl)}"
          alt="${escapeAttribute(nama)}"
          loading="lazy"
          onerror="this.parentElement.style.display='none'"
        />

      </div>

    `
      : "";

    /* =====================================
     RENDER
  ===================================== */

    return `

    <article
      class="room-card"
      data-room-id="${escapeAttribute(roomId)}"
    >

      ${imageHtml}


      <!-- =================================
           HEADER
      ================================== -->

      <div class="room-card-header">

        <div>

          <span class="room-card-number">
            ${roomNumber}
          </span>

          <h3 class="room-card-title">
            ${escapeHtml(nama)}
          </h3>

        </div>

        <span class="room-status available">
          Available
        </span>

      </div>


      <!-- =================================
           DESCRIPTION
      ================================== -->

      ${
        deskripsi
          ? `

            <p class="room-card-description">
              ${escapeHtml(deskripsi)}
            </p>

          `
          : ""
      }


      <!-- =================================
           AMENITIES
      ================================== -->

      <div class="room-amenities">


        ${
          capacityText
            ? `

              <span class="room-amenity">
                ${escapeHtml(capacityText)}
              </span>

            `
            : ""
        }


        ${
          bedText
            ? `

              <span class="room-amenity">
                ${escapeHtml(bedText)}
              </span>

            `
            : ""
        }


        ${
          luas
            ? `

              <span class="room-amenity">
                ${escapeHtml(String(luas))} m²
              </span>

            `
            : ""
        }


        ${fasilitas ? renderFacilityItems(fasilitas) : ""}

      </div>


      <!-- =================================
           BOOKING ACTION
      ================================== -->

      <div class="room-booking-action">

        <button
          type="button"
          class="btn btn-dark room-select-button"
          data-room-id="${escapeAttribute(roomId)}"
        >
          Select this room
        </button>

      </div>

    </article>

  `;
  }

  /* ==========================================================
     FACILITY ITEMS
  ========================================================== */

  function renderFacilityItems(fasilitas) {
    return fasilitas
      .split(",")
      .map((item) => String(item).trim())
      .filter(Boolean)
      .map(
        (item) => `

          <span class="room-amenity">
            ${escapeHtml(item)}
          </span>

        `,
      )
      .join("");
  }

  /* ==========================================================
     BIND ROOM BUTTONS
  ========================================================== */

  function bindRoomButtons() {
    const buttons = dom.roomList?.querySelectorAll(".room-select-button");

    if (!buttons) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const roomId = button.dataset.roomId;

        selectRoom(roomId);
      });
    });
  }

  /* ==========================================================
     SELECT ROOM
  ========================================================== */

  function selectRoom(roomId) {
    const room = state.rooms.find(
      (item) => String(item.id || item.tipeKamarId || "") === String(roomId),
    );

    if (!room) {
      console.warn("[PublicPenginapanDetail] Room not found:", roomId);

      return;
    }

    /* ======================================================
       SET STATE
    ====================================================== */

    state.booking.selectedRoom = room;

    state.booking.pricing = null;

    state.booking.error = null;

    /* ======================================================
       UPDATE ROOM CARD
    ====================================================== */

    document.querySelectorAll(".room-card").forEach((card) => {
      const isSelected = String(card.dataset.roomId) === String(roomId);

      card.classList.toggle("is-selected", isSelected);

      const button = card.querySelector(".room-select-button");

      if (!button) {
        return;
      }

      button.textContent = isSelected ? "Selected" : "Select this room";
    });

    /* ======================================================
       SET BOOKING ROOM
    ====================================================== */

    if (dom.bookingRoomName) {
      dom.bookingRoomName.textContent = room.nama || "Tipe Kamar";
    }

    /* ======================================================
       RESET OLD PRICE
    ====================================================== */

    resetBookingResult();

    /* ======================================================
       DEFAULT DATES
    ====================================================== */

    setDefaultBookingDates();

    /* ======================================================
       OPEN BOTTOM SHEET
    ====================================================== */

    openBookingSheet();
  }

  /* ==========================================================
     BOOKING SHEET
  ========================================================== */

  function openBookingSheet() {
    if (!dom.bookingSheet) {
      return;
    }

    /*
     * Pastikan sheet visible.
     */

    dom.bookingSheet.hidden = false;

    dom.bookingSheet.setAttribute("aria-hidden", "false");

    /*
     * Body lock.
     */

    document.body.classList.add("booking-sheet-open");

    /*
     * Mark open state.
     */

    dom.bookingSheet.classList.add("is-open");

    /*
     * Focus tanggal.
     */

    window.setTimeout(() => {
      if (dom.bookingCheckIn && !dom.bookingCheckIn.disabled) {
        dom.bookingCheckIn.focus({
          preventScroll: true,
        });
      }
    }, 120);
  }

  /* ==========================================================
     CLOSE BOOKING SHEET
  ========================================================== */

  function closeBookingSheet(options = {}) {
    const { reset = true, restoreFocus = true } = options;

    if (!dom.bookingSheet) {
      return;
    }

    dom.bookingSheet.classList.remove("is-open");

    dom.bookingSheet.hidden = true;

    dom.bookingSheet.setAttribute("aria-hidden", "true");

    document.body.classList.remove("booking-sheet-open");

    if (reset) {
      resetBookingSheet();
    }

    /*
     * Kembalikan focus ke room
     * yang dipilih jika memungkinkan.
     */

    if (restoreFocus && state.booking.selectedRoom) {
      const roomId =
        state.booking.selectedRoom.id ||
        state.booking.selectedRoom.tipeKamarId ||
        "";

      const button = dom.roomList?.querySelector(
        `.room-select-button[data-room-id="${escapeSelectorValue(roomId)}"]`,
      );

      if (button) {
        window.setTimeout(() => button.focus(), 0);
      }
    }
  }

  /* ==========================================================
     RESET BOOKING SHEET
  ========================================================== */

  function resetBookingSheet() {
    state.booking.checkIn = "";

    state.booking.checkOut = "";

    state.booking.guests = Number(dom.bookingGuests?.value) || 2;

    state.booking.pricing = null;

    state.booking.loading = false;

    state.booking.error = null;

    resetBookingResult();

    /*
     * Room tetap selected.
     *
     * Kita tidak menghapus
     * selectedRoom karena user
     * masih memilih kamar tersebut.
     */
  }

  /* ==========================================================
     SET DEFAULT DATES
  ========================================================== */

  function setDefaultBookingDates() {
    if (!dom.bookingCheckIn || !dom.bookingCheckOut) {
      return;
    }

    const today = new Date();

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayValue = formatInputDate(today);

    const tomorrowValue = formatInputDate(tomorrow);

    dom.bookingCheckIn.value = todayValue;

    dom.bookingCheckOut.value = tomorrowValue;

    state.booking.checkIn = todayValue;

    state.booking.checkOut = tomorrowValue;

    /*
     * Pastikan checkout
     * minimal besok.
     */

    dom.bookingCheckOut.min = tomorrowValue;
  }

  /* ==========================================================
     BOOKING EVENTS
  ========================================================== */

  function initBookingEvents() {
    /* ======================================================
       CLOSE
    ====================================================== */

    if (dom.bookingSheetClose) {
      dom.bookingSheetClose.addEventListener("click", () => {
        closeBookingSheet();
      });
    }

    /* ======================================================
       BACKDROP
    ====================================================== */

    if (dom.bookingSheetBackdrop) {
      dom.bookingSheetBackdrop.addEventListener("click", () => {
        closeBookingSheet();
      });
    }

    /* ======================================================
       ESC
    ====================================================== */

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (dom.bookingSheet && !dom.bookingSheet.hidden) {
        closeBookingSheet();
      }
    });

    /* ======================================================
       CHECK IN
    ====================================================== */

    if (dom.bookingCheckIn) {
      dom.bookingCheckIn.addEventListener("change", () => {
        state.booking.checkIn = dom.bookingCheckIn.value;

        /*
         * Checkout tidak boleh
         * sebelum check-in.
         */

        updateCheckoutMin();

        resetBookingResult();
      });
    }

    /* ======================================================
       CHECK OUT
    ====================================================== */

    if (dom.bookingCheckOut) {
      dom.bookingCheckOut.addEventListener("change", () => {
        state.booking.checkOut = dom.bookingCheckOut.value;

        resetBookingResult();
      });
    }

    /* ======================================================
       GUESTS
    ====================================================== */

    if (dom.bookingGuests) {
      dom.bookingGuests.addEventListener("change", () => {
        state.booking.guests = Number(dom.bookingGuests.value) || 2;

        resetBookingResult();
      });
    }

    /* ======================================================
       PRICE
    ====================================================== */

    if (dom.bookingPriceButton) {
      dom.bookingPriceButton.addEventListener("click", calculatePrice);
    }

    /* ======================================================
       BOOK
    ====================================================== */

    if (dom.bookingSubmitButton) {
      dom.bookingSubmitButton.addEventListener("click", handleBookingSubmit);
    }
  }

  /* ==========================================================
     UPDATE CHECKOUT MIN
  ========================================================== */

  function updateCheckoutMin() {
    if (!dom.bookingCheckIn || !dom.bookingCheckOut) {
      return;
    }

    const checkIn = dom.bookingCheckIn.value;

    if (!checkIn) {
      return;
    }

    const nextDay = new Date(`${checkIn}T00:00:00`);

    if (Number.isNaN(nextDay.getTime())) {
      return;
    }

    nextDay.setDate(nextDay.getDate() + 1);

    const minValue = formatInputDate(nextDay);

    dom.bookingCheckOut.min = minValue;

    /*
     * Jika checkout sekarang
     * invalid, otomatis geser
     * ke hari berikutnya.
     */

    if (!dom.bookingCheckOut.value || dom.bookingCheckOut.value <= checkIn) {
      dom.bookingCheckOut.value = minValue;

      state.booking.checkOut = minValue;
    }
  }

  /* ==========================================================
   MAP QUERY
========================================================== */

  function getMapQuery(item = {}) {
    /*
     * Prioritas:
     * 1. URL maps dari database
     * 2. Nama + alamat
     */

    if (item.maps) {
      try {
        const url = new URL(item.maps);

        const match = url.pathname.match(/\/maps\/search\/(.+)/);

        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      } catch (err) {
        console.warn("URL Google Maps tidak valid.", err);
      }
    }

    /*
     * FALLBACK
     */

    return [item.nama, item.alamat, item.desa, item.kecamatan, item.kabupaten]
      .filter(Boolean)
      .join(", ");
  }

  /* ==========================================================
     CALCULATE PRICE
  ========================================================== */

  async function calculatePrice() {
    clearBookingError();

    /* ======================================================
       VALIDATE ROOM
    ====================================================== */

    if (!state.booking.selectedRoom) {
      showBookingError("Silakan pilih kamar terlebih dahulu.");

      return;
    }

    /* ======================================================
       READ FORM
    ====================================================== */

    const checkIn = dom.bookingCheckIn?.value || "";

    const checkOut = dom.bookingCheckOut?.value || "";

    const guests = Number(dom.bookingGuests?.value) || 2;

    state.booking.checkIn = checkIn;

    state.booking.checkOut = checkOut;

    state.booking.guests = guests;

    /* ======================================================
       VALIDATE CHECK-IN
    ====================================================== */

    if (!checkIn) {
      showBookingError("Tanggal check-in wajib dipilih.");

      dom.bookingCheckIn?.focus();

      return;
    }

    /* ======================================================
       VALIDATE CHECK-OUT
    ====================================================== */

    if (!checkOut) {
      showBookingError("Tanggal check-out wajib dipilih.");

      dom.bookingCheckOut?.focus();

      return;
    }

    /* ======================================================
       VALIDATE DATE
    ====================================================== */

    if (checkOut <= checkIn) {
      showBookingError("Tanggal check-out harus setelah check-in.");

      dom.bookingCheckOut?.focus();

      return;
    }

    /* ======================================================
       LOADING
    ====================================================== */

    setPriceLoading(true);

    try {
      const room = state.booking.selectedRoom;

      const roomId = room.id || room.tipeKamarId || "";

      if (!roomId) {
        throw new Error("ID tipe kamar tidak ditemukan.");
      }

      /*
       * IMPORTANT:
       *
       * Payload tetap sama
       * seperti engine yang sudah
       * kita tes sebelumnya.
       *
       * Tidak ada channel.
       */

      const payload = {
        penginapanId: state.penginapan.id,

        tipeKamarId: roomId,

        checkIn: checkIn,

        checkOut: checkOut,

        jumlahTamu: guests,
      };

      console.log("[PublicPenginapanDetail] booking.price:", payload);

      const result = await API.post("booking.price", payload);

      console.log("[PublicPenginapanDetail] booking.price result:", result);

      if (!result || result.success === false) {
        throw new Error(result?.message || "Gagal menghitung harga.");
      }

      const pricing = result.data || result;

      state.booking.pricing = pricing;

      renderPriceResult(pricing);
    } catch (error) {
      console.error("[PublicPenginapanDetail] Price error:", error);

      state.booking.error = error?.message || "Gagal menghitung harga.";

      showBookingError(state.booking.error);
    } finally {
      setPriceLoading(false);
    }
  }

  /* ==========================================================
     RENDER PRICE
  ========================================================== */

  function renderPriceResult(pricing = {}) {
    if (!dom.bookingPriceResult) {
      return;
    }

    /* ======================================================
       NIGHTS
    ====================================================== */

    const nights = Array.isArray(pricing.nights) ? pricing.nights : [];

    const jumlahMalam = Number(pricing.jumlahMalam) || nights.length || 0;

    if (dom.bookingNightCount) {
      dom.bookingNightCount.textContent = `${jumlahMalam} ${
        jumlahMalam === 1 ? "night" : "nights"
      }`;
    }

    /* ======================================================
       NIGHT LIST
    ====================================================== */

    if (dom.bookingNightList) {
      if (!nights.length) {
        dom.bookingNightList.innerHTML = "";
      } else {
        dom.bookingNightList.innerHTML = nights
          .map((night) => renderNightRow(night))
          .join("");
      }
    }

    /* ======================================================
       TOTAL
    ====================================================== */

    const total =
      Number(pricing.total) ||
      Number(pricing.grandTotal) ||
      Number(pricing.subtotal) ||
      0;

    if (dom.bookingTotal) {
      dom.bookingTotal.textContent = formatCurrency(total);
    }

    /* ======================================================
       SHOW RESULT
    ====================================================== */

    dom.bookingPriceResult.hidden = false;

    /* ======================================================
       SHOW BOOK BUTTON
    ====================================================== */

    if (dom.bookingSubmitButton) {
      dom.bookingSubmitButton.hidden = false;
    }
  }

  /* ==========================================================
     NIGHT ROW
  ========================================================== */

  function renderNightRow(night = {}) {
    const date = night.tanggal || night.date || night.tanggalMenginap || "";

    const price =
      Number(night.harga) || Number(night.price) || Number(night.nominal) || 0;

    return `

      <div class="booking-price-row">

        <span>
          ${escapeHtml(formatDate(date))}
        </span>

        <strong>
          ${formatCurrency(price)}
        </strong>

      </div>

    `;
  }

  /* ==========================================================
     RESET PRICE
  ========================================================== */

  function resetBookingResult() {
    state.booking.pricing = null;

    clearBookingError();

    if (dom.bookingPriceResult) {
      dom.bookingPriceResult.hidden = true;
    }

    if (dom.bookingSubmitButton) {
      dom.bookingSubmitButton.hidden = true;
    }
  }

  /* ==========================================================
     PRICE LOADING
  ========================================================== */

  function setPriceLoading(loading) {
    state.booking.loading = loading;

    if (!dom.bookingPriceButton) {
      return;
    }

    dom.bookingPriceButton.disabled = loading;

    dom.bookingPriceButton.textContent = loading
      ? "Checking price..."
      : "Check availability";
  }

  /* ==========================================================
     BOOKING ERROR
  ========================================================== */

  function showBookingError(message) {
    if (!dom.bookingError) {
      return;
    }

    dom.bookingError.textContent = message || "Terjadi kesalahan.";

    dom.bookingError.hidden = false;
  }

  function clearBookingError() {
    state.booking.error = null;

    if (dom.bookingError) {
      dom.bookingError.hidden = true;

      dom.bookingError.textContent = "";
    }
  }

  /* ==========================================================
     BOOKING SUBMIT
  ========================================================== */

  function handleBookingSubmit() {
    if (!state.booking.selectedRoom) {
      showBookingError("Silakan pilih kamar terlebih dahulu.");

      return;
    }

    if (!state.booking.pricing) {
      showBookingError("Silakan cek harga terlebih dahulu.");

      return;
    }

    /*
     * STEP BERIKUTNYA:
     *
     * Di sini nanti kita buka
     * guest information form:
     *
     * Nama tamu
     * No HP
     * Email
     * Catatan
     *
     * Lalu create reservation.
     *
     * BELUM DIAKTIFKAN SEKARANG.
     */

    console.log("[PublicPenginapanDetail] Booking ready:", {
      penginapan: state.penginapan,

      room: state.booking.selectedRoom,

      booking: state.booking,
    });

    showBookingError(
      "Harga sudah berhasil dihitung. Form pemesanan akan kita lanjutkan pada tahap berikutnya.",
    );
  }

  /* ==========================================================
     CAPACITY
  ========================================================== */

  function formatCapacity(value) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return `${number} guests`;
    }

    return String(value || "");
  }

  /* ==========================================================
     FASILITAS
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

    closeBookingSheet({
      reset: false,
      restoreFocus: false,
    });

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

    closeBookingSheet({
      reset: false,
      restoreFocus: false,
    });

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
     DOCUMENT TITLE
  ========================================================== */

  function updateDocumentTitle(nama) {
    if (!nama) {
      return;
    }

    document.title = `Dieng Net — ${nama}`;
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
     FORMAT CURRENCY
  ========================================================== */

  function formatCurrency(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
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
      return value;
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
     ESCAPE CSS SELECTOR VALUE
  ========================================================== */

  function escapeSelectorValue(value) {
    const stringValue = String(value ?? "");

    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(stringValue);
    }

    return stringValue.replace(/["\\]/g, "\\$&");
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    init,

    load,

    openBookingSheet,

    closeBookingSheet,

    getState() {
      return {
        ...state,

        rooms: [...state.rooms],

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
