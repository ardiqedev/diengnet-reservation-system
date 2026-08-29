/* =========================================
   DETAIL PROFIL PENGINAPAN
========================================= */

const DetailProfilPenginapan = {
  /* =====================================
     STATE
  ===================================== */

  state: {
    id: null,
    loading: false,
    data: null,
  },

  /* =====================================
     INIT
  ===================================== */

  async init() {
    console.log("DETAIL PROFIL PENGINAPAN INIT");

    this.state.id = this.getPenginapanId();

    if (!this.state.id) {
      console.error("ID penginapan tidak ditemukan.");

      this.renderError("ID penginapan tidak ditemukan.");

      return;
    }

    this.bindEvents();

    await this.load();
  },

  /* =====================================
     GET ID
  ===================================== */

  getPenginapanId() {
    return (
      localStorage.getItem("profilPenginapanId") ||
      localStorage.getItem("selectedPenginapanId") ||
      localStorage.getItem("penginapanId") ||
      ""
    );
  },

  /* =====================================
     LOAD
  ===================================== */

  async load() {
    if (this.state.loading) {
      return;
    }

    this.state.loading = true;

    this.showLoading();

    try {
      const res = await ProfilPenginapanService.getById(this.state.id);

      console.log("=== DETAIL PROFIL RESULT ===");

      console.log(res);

      if (!res || !res.success) {
        throw new Error(res?.message || "Data profil penginapan gagal dimuat.");
      }

      this.state.data = res.data;

      console.log("=== DETAIL PROFIL DATA ===");

      console.log(this.state.data);

      this.render(this.state.data);
    } catch (error) {
      console.error("DETAIL PROFIL ERROR:", error);

      this.renderError(error.message || "Gagal memuat profil penginapan.");
    } finally {
      this.state.loading = false;
    }
  },

  /* =====================================
     BIND EVENTS
  ===================================== */

  bindEvents() {
    const back = document.getElementById("btnBackProfilPenginapan");

    back?.addEventListener("click", () => {
      Router.navigate("profil-penginapan");
    });

    const edit = document.getElementById("btnEditProfilPenginapan");

    edit?.addEventListener("click", () => {
      console.log("EDIT PENGINAPAN:", this.state.id);
    });

    const unit = document.getElementById("btnLihatSemuaUnit");

    unit?.addEventListener("click", () => {
      Router.navigate("unit");
    });

    const musim = document.getElementById("btnKelolaMusim");

    musim?.addEventListener("click", () => {
      Router.navigate("musim");
    });

    const harga = document.getElementById("btnKelolaHargaMusim");

    harga?.addEventListener("click", () => {
      Router.navigate("harga-musim");
    });
  },

  /* =====================================
     RENDER
  ===================================== */

  render(data) {
    const penginapan = data?.penginapan || {};

    const statistik = data?.statistik || {};

    const units = Array.isArray(data?.units) ? data.units : [];

    const musim = Array.isArray(data?.musim) ? data.musim : [];

    const harga = Array.isArray(data?.harga) ? data.harga : [];

    this.renderHero(penginapan, statistik);

    this.renderUnits(units, statistik);

    this.renderMusim(musim);

    this.renderHarga(harga, musim);

    this.updateCounts(statistik, units, musim, harga);

    lucide.createIcons();
  },

  /* =====================================
     HERO
  ===================================== */

  renderHero(penginapan, statistik) {
    const el = document.getElementById("profilDetailHero");

    if (!el) {
      return;
    }

    const nama = this.escape(penginapan.nama || "-");

    const jenis = this.escape(penginapan.jenis || "-");

    const status = String(penginapan.status || "");

    const alamat = this.escape(penginapan.alamat || "-");

    const desa = this.escape(penginapan.desa || "");

    const kecamatan = this.escape(penginapan.kecamatan || "");

    const kabupaten = this.escape(penginapan.kabupaten || "");

    const lokasi = [desa, kecamatan, kabupaten].filter(Boolean).join(", ");

    const deskripsi = this.escape(penginapan.deskripsi || "");

    const coverUrl = penginapan.coverUrl || penginapan.foto || "";

    const totalUnit = Number(statistik.totalUnit || 0);

    const totalKapasitas = Number(statistik.totalKapasitas || 0);

    const totalMusim = Number(statistik.totalMusim || 0);

    const totalHarga = Number(statistik.totalHarga || 0);

    const siap = totalUnit > 0 && totalMusim > 0 && totalHarga > 0;

    el.innerHTML = `

      <div class="profil-detail-hero-main">

        <!-- FOTO -->

        <div class="profil-detail-cover">

          ${
            coverUrl
              ? `

                <img
                  src="${this.escapeAttribute(coverUrl)}"
                  alt="${nama}"
                  class="profil-detail-cover-image"
                  loading="lazy"
                />

              `
              : `

                <div class="profil-detail-cover-empty">

                  <i data-lucide="hotel"></i>

                  <span>
                    Foto belum tersedia
                  </span>

                </div>

              `
          }

        </div>


        <!-- INFORMASI -->

        <div class="profil-detail-main-info">

          <div class="profil-detail-name-row">

            <div>

              <div class="profil-detail-name">

                ${nama}

                <span
                  class="
                    profil-detail-status
                    ${this.getStatusClass(status)}
                  "
                >
                  ${this.escape(status || "-")}
                </span>

              </div>


              <div class="profil-detail-meta">

                <span>
                  <i data-lucide="building-2"></i>
                  ${jenis}
                </span>


                ${
                  lokasi
                    ? `

                      <span>
                        <i data-lucide="map-pin"></i>
                        ${lokasi}
                      </span>

                    `
                    : ""
                }

              </div>

            </div>

          </div>


          <div class="profil-detail-contact-list">

            <div class="profil-detail-contact-item">

              <i data-lucide="map-pin"></i>

              <div>

                <span class="profil-detail-contact-label">
                  Alamat
                </span>

                <strong>
                  ${alamat}
                </strong>

              </div>

            </div>


            ${
              penginapan.maps
                ? `

                  <div class="profil-detail-contact-item">

                    <i data-lucide="map"></i>

                    <div>

                      <span class="profil-detail-contact-label">
                        Maps
                      </span>

                      <a
                        href="${this.escapeAttribute(penginapan.maps)}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Lihat lokasi
                      </a>

                    </div>

                  </div>

                `
                : ""
            }


            <div class="profil-detail-contact-item">

              <i data-lucide="file-text"></i>

              <div>

                <span class="profil-detail-contact-label">
                  Deskripsi
                </span>

                <strong class="${deskripsi ? "" : "is-muted"}">

                  ${deskripsi || "Belum ada deskripsi."}

                </strong>

              </div>

            </div>

          </div>

        </div>


        <!-- STATISTIK -->

        <div class="profil-detail-summary">

          <div class="profil-detail-summary-grid">

            ${this.renderSummaryStat("bed-double", totalUnit, "Total Unit")}


            ${this.renderSummaryStat(
              "users",
              totalKapasitas,
              "Total Kapasitas",
              "Orang",
            )}


            ${this.renderSummaryStat(
              "calendar-range",
              totalMusim,
              "Total Musim",
            )}


            ${this.renderSummaryStat(
              "badge-dollar-sign",
              totalHarga,
              "Konfigurasi Tarif",
            )}

          </div>


          <div
            class="
              profil-detail-readiness
              ${siap ? "ready" : "not-ready"}
            "
          >

            <div class="profil-readiness-icon">

              <i data-lucide="${siap ? "check" : "clock-3"}"></i>

            </div>


            <div>

              <strong>

                ${siap ? "SIAP UNTUK RESERVASI" : "BELUM SIAP"}

              </strong>

              <span>

                ${
                  siap
                    ? "Semua konfigurasi telah lengkap."
                    : "Lengkapi unit, musim, dan tarif terlebih dahulu."
                }

              </span>

            </div>

          </div>

        </div>

      </div>

    `;
  },

  /* =====================================
     SUMMARY STAT
  ===================================== */

  renderSummaryStat(icon, value, label, suffix = "") {
    return `

      <div class="profil-summary-stat">

        <div class="profil-summary-icon">

          <i data-lucide="${icon}"></i>

        </div>


        <div>

          <strong>
            ${value}
          </strong>

          <span>
            ${label}
            ${suffix ? ` ${suffix}` : ""}
          </span>

        </div>

      </div>

    `;
  },

  /* =====================================
     UNITS
  ===================================== */

  renderUnits(units) {
    const el = document.getElementById("profilDetailUnits");

    if (!el) {
      return;
    }

    if (!units.length) {
      el.innerHTML = `

        <div class="profil-detail-empty">

          <i data-lucide="bed-double"></i>

          <span>
            Belum ada unit penginapan.
          </span>

        </div>

      `;

      return;
    }

    const rows = units
      .map((unit) => {
        const nama = this.escape(unit.nama || "-");

        const tipe = this.escape(unit.tipe || "-");

        const kapasitas =
          Number(unit.kapasitasDewasa || 0) + Number(unit.kapasitasAnak || 0);

        const jumlahBed = this.escape(unit.jumlahBed || "-");

        const jenisBed = this.escape(unit.jenisBed || "");

        const status = this.escape(unit.status || "-");

        return `

              <div class="profil-table-row">

                <div>
                  <strong>
                    ${nama}
                  </strong>
                </div>


                <div>
                  ${tipe}
                </div>


                <div>
                  ${kapasitas} Orang
                </div>


                <div>
                  ${jumlahBed}

                  ${jenisBed ? ` ${jenisBed}` : ""}
                </div>


                <div>

                  <span
                    class="
                      profil-table-status
                      ${this.getStatusClass(status)}
                    "
                  >
                    ${status}
                  </span>

                </div>

              </div>

            `;
      })
      .join("");

    el.innerHTML = `

      <div class="profil-table">

        <div class="profil-table-header">

          <div>Nama Unit</div>

          <div>Tipe</div>

          <div>Kapasitas</div>

          <div>Jumlah Bed</div>

          <div>Status</div>

        </div>


        ${rows}

      </div>

      <div class="profil-table-footer">

        Menampilkan
        ${units.length}
        unit

      </div>

    `;
  },

  /* =====================================
     MUSIM
  ===================================== */

  renderMusim(musim) {
    const el = document.getElementById("profilDetailMusim");

    if (!el) {
      return;
    }

    if (!musim.length) {
      el.innerHTML = `

        <div class="profil-detail-empty">

          <i data-lucide="calendar-range"></i>

          <span>
            Belum ada musim aktif.
          </span>

        </div>

      `;

      return;
    }

    const rows = musim
      .map((item) => {
        const nama = this.escape(item.nama || "-");

        const periode = this.formatPeriod(
          item.tanggalMulai,
          item.tanggalSelesai,
        );

        const deskripsi = this.escape(item.keterangan || "-");

        const status = this.escape(item.status || "-");

        return `

              <div class="profil-table-row">

                <div>
                  <strong>
                    ${nama}
                  </strong>
                </div>


                <div>
                  ${periode}
                </div>


                <div>
                  ${deskripsi}
                </div>


                <div>

                  <span
                    class="
                      profil-table-status
                      ${this.getStatusClass(status)}
                    "
                  >
                    ${status}
                  </span>

                </div>

              </div>

            `;
      })
      .join("");

    el.innerHTML = `

      <div class="profil-table">

        <div class="profil-table-header musim-header">

          <div>Musim</div>

          <div>Periode</div>

          <div>Deskripsi</div>

          <div>Status</div>

        </div>


        ${rows}

      </div>


      <div class="profil-table-footer">

        Menampilkan
        ${musim.length}
        musim

      </div>

    `;
  },

  /* =====================================
     HARGA
  ===================================== */

  renderHarga(harga, musim) {
    const el = document.getElementById("profilDetailHarga");

    if (!el) {
      return;
    }

    if (!harga.length) {
      el.innerHTML = `

        <div class="profil-detail-empty">

          <i data-lucide="badge-dollar-sign"></i>

          <span>
            Belum ada harga aktif.
          </span>

        </div>

      `;

      return;
    }

    const musimMap = {};

    musim.forEach((item) => {
      musimMap[String(item.id)] = item;
    });

    const rows = harga
      .map((item) => {
        const musimItem = musimMap[String(item.musimId)] || {};

        const namaMusim = this.escape(musimItem.nama || item.musimId || "-");

        const periode = this.formatPeriod(
          musimItem.tanggalMulai,
          musimItem.tanggalSelesai,
        );

        const weekday = this.formatCurrency(item.hargaWeekday);

        const weekend = this.formatCurrency(item.hargaWeekend);

        const longWeekend = this.formatCurrency(item.hargaLongWeekend);

        const minimalMalam = Number(item.minimalMalam || 0);

        const status = this.escape(item.status || "-");

        return `

              <div class="profil-price-row">

                <div>
                  <strong>
                    ${namaMusim}
                  </strong>
                </div>


                <div>
                  ${periode}
                </div>


                <div class="price-weekday">
                  ${weekday}
                </div>


                <div class="price-weekend">
                  ${weekend}
                </div>


                <div class="price-longweekend">
                  ${longWeekend}
                </div>


                <div>
                  ${minimalMalam}
                  Malam
                </div>


                <div>

                  <span
                    class="
                      profil-table-status
                      ${this.getStatusClass(status)}
                    "
                  >
                    ${status}
                  </span>

                </div>

              </div>

            `;
      })
      .join("");

    el.innerHTML = `

      <div class="profil-price-table">

        <div class="profil-price-header">

          <div>Musim</div>

          <div>Periode</div>

          <div>Weekday</div>

          <div>Weekend</div>

          <div>Long Weekend</div>

          <div>Minimal Menginap</div>

          <div>Status</div>

        </div>


        ${rows}

      </div>


      <div class="profil-table-footer">

        Menampilkan
        ${harga.length}
        konfigurasi tarif

      </div>

    `;
  },

  /* =====================================
     UPDATE COUNTS
  ===================================== */

  updateCounts(statistik, units, musim, harga) {
    const unitCount = document.getElementById("profilDetailUnitCount");

    const musimCount = document.getElementById("profilDetailMusimCount");

    const hargaCount = document.getElementById("profilDetailHargaCount");

    if (unitCount) {
      unitCount.textContent = `${units.length} Unit`;
    }

    if (musimCount) {
      musimCount.textContent = `${musim.length} Musim`;
    }

    if (hargaCount) {
      hargaCount.textContent = `${harga.length} Harga`;
    }
  },

  /* =====================================
     LOADING
  ===================================== */

  showLoading() {
    const hero = document.getElementById("profilDetailHero");

    const units = document.getElementById("profilDetailUnits");

    const musim = document.getElementById("profilDetailMusim");

    const harga = document.getElementById("profilDetailHarga");

    if (hero) {
      hero.innerHTML = `

        <div class="profil-detail-loading">

          <div class="skeleton skeleton-cover"></div>

          <div class="profil-loading-info">

            <div class="skeleton skeleton-title"></div>

            <div class="skeleton skeleton-text"></div>

            <div class="skeleton skeleton-text"></div>

          </div>

        </div>

      `;
    }

    if (units) {
      units.innerHTML = `<div class="profil-detail-loading-lines"></div>`;
    }

    if (musim) {
      musim.innerHTML = `<div class="profil-detail-loading-lines"></div>`;
    }

    if (harga) {
      harga.innerHTML = `<div class="profil-detail-loading-lines"></div>`;
    }
  },

  /* =====================================
     ERROR
  ===================================== */

  renderError(message) {
    const hero = document.getElementById("profilDetailHero");

    if (!hero) {
      return;
    }

    hero.innerHTML = `

      <div class="profil-detail-error">

        <i data-lucide="circle-alert"></i>

        <h3>
          Gagal memuat profil penginapan
        </h3>

        <p>
          ${this.escape(message)}
        </p>

        <button
          class="btn btn-primary"
          type="button"
          onclick="DetailProfilPenginapan.load()"
        >
          <i data-lucide="refresh-cw"></i>

          Coba Lagi
        </button>

      </div>

    `;

    lucide.createIcons();
  },

  /* =====================================
     STATUS CLASS
  ===================================== */

  getStatusClass(status) {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "aktif" || value === "active") {
      return "status-active";
    }

    if (value === "non aktif" || value === "nonaktif" || value === "inactive") {
      return "status-inactive";
    }

    return "status-default";
  },

  /* =====================================
     FORMAT CURRENCY
  ===================================== */

  formatCurrency(value) {
    const number = Number(value || 0);

    if (!number) {
      return "Rp 0";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  },

  /* =====================================
     FORMAT PERIOD
  ===================================== */

  formatPeriod(start, end) {
    if (!start && !end) {
      return "-";
    }

    const format = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    };

    if (start && end) {
      return `
        ${format(start)}
        -
        ${format(end)}
      `;
    }

    return format(start || end);
  },

  /* =====================================
     ESCAPE HTML
  ===================================== */

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /* =====================================
     ESCAPE ATTRIBUTE
  ===================================== */

  escapeAttribute(value) {
    return this.escape(value);
  },
};
