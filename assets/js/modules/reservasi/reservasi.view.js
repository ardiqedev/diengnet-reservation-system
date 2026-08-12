/**
 * ============================================================
 * RESERVASI WIZARD VIEW
 * ============================================================
 * Menangani seluruh tampilan Wizard Reservasi.
 *
 * Tanggung Jawab:
 * - Render Header
 * - Render Stepper
 * - Render Content
 * - Render Footer
 *
 * Tidak boleh:
 * - Mengakses Dummy
 * - Mengakses Service
 * - Business Logic
 * - Validasi
 * - Simpan Data
 * ============================================================
 */

const ReservasiView = (() => {
  // ============================================================
  // PUBLIC
  // ============================================================

  function render(step = 1) {
    return `

            ${renderHeader()}

            ${renderStepper(step)}

            ${renderContent(step)}

            ${renderFooter(step)}

        `;
  }

  // ============================================================
  // HEADER
  // ============================================================

  function renderHeader() {
    return `

        <div class="page-header">

            <div>

                <h1 class="page-title">

                    Reservasi Baru

                </h1>

                <p class="page-description">

                    Lengkapi proses reservasi hingga selesai.

                </p>

            </div>

        </div>

    `;
  }

  // ============================================================
  // STEPPER
  // ============================================================

  function renderStepper(step = 1) {
    const steps = ["Pencarian", "Pilih Kamar", "Data Tamu", "Konfirmasi"];

    return `

        <div class="wizard-stepper">

            ${steps
              .map((title, index) => {
                const stepNumber = index + 1;

                let className = "";

                if (step === stepNumber) {
                  className = "active";
                } else if (step > stepNumber) {
                  className = "completed";
                }

                return `

                    <div class="wizard-step ${className}">

                        <div class="wizard-step-number">

                            ${stepNumber}

                        </div>

                        <div class="wizard-step-title">

                            ${title}

                        </div>

                    </div>

                `;
              })
              .join("")}

        </div>

    `;
  }

  // ============================================================
  // CONTENT
  // ============================================================

  function renderContent(step = 1) {
    const component = getStepComponent(step);

    if (!component || typeof component.render !== "function") {
      return "";
    }

    return `

        <div class="wizard-content">

            ${component.render()}

        </div>

        `;
  }

  // ============================================================
  // FOOTER
  // ============================================================

  function renderFooter(step = 1) {
    const FIRST_STEP = 1;

    const LAST_STEP = 4;

    const isFirst = step === FIRST_STEP;

    const isLast = step === LAST_STEP;

    return `

        <div class="wizard-footer">

            ${
              isFirst
                ? `
                        <button
                            class="btn btn-outline"
                            id="btnCancelWizard">

                            Batal

                        </button>
                    `
                : `
                        <button
                            class="btn btn-outline"
                            id="btnPreviousStep">

                            Sebelumnya

                        </button>
                    `
            }

            ${
              isLast
                ? `
                        <button
                            class="btn btn-success"
                            id="btnNextStep">

                            Simpan Reservasi

                        </button>
                    `
                : `
                        <button
                            class="btn btn-primary"
                            id="btnNextStep">

                            Selanjutnya

                        </button>
                    `
            }

        </div>

    `;
  }

  // ============================================================
  // STEP COMPONENT
  // ============================================================

  function getStepComponent(step = 1) {
    const steps = {
      1: ReservasiStep1,

      2: ReservasiStep2,

      3: ReservasiStep3,

      4: ReservasiStep4,
    };

    return steps[step] || null;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    render,
  };
})();
