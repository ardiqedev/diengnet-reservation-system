/* =========================================
   SKELETON ENGINE
========================================= */

const Skeleton = {
  /* =====================================
     TABLE
  ===================================== */

  table(target, rows = 8) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = `

      <div class="skeleton-table">

    `;

    for (let i = 0; i < rows; i++) {
      html += `

        <div class="skeleton-row">

            <div class="skeleton skeleton-lg"></div>

            <div class="skeleton"></div>

            <div class="skeleton"></div>

            <div class="skeleton"></div>

            <div class="skeleton-sm"></div>

        </div>

      `;
    }

    html += `</div>`;

    el.innerHTML = html;
  },

  /* =====================================
     CARD
  ===================================== */

  card(target, total = 4) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = "";

    for (let i = 0; i < total; i++) {
      html += `

      <div class="card">

          <div class="card-body">

              <div class="skeleton skeleton-title"></div>

              <div class="skeleton skeleton-text"></div>

              <div class="skeleton skeleton-text"></div>

          </div>

      </div>

      `;
    }

    el.innerHTML = html;
  },

  /* =====================================
     PROFIL PENGINAPAN
  ===================================== */

  profilCard(target, total = 6) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = "";

    for (let i = 0; i < total; i++) {
      html += `

        <div class="profil-card skeleton-profil-card">

          <!-- FOTO -->

          <div class="profil-card-image">

            <div
              class="skeleton skeleton-image"
            ></div>

          </div>


          <!-- BODY -->

          <div class="profil-card-body">

            <!-- HEADER -->

            <div class="profil-card-heading">

              <div class="profil-card-title">

                <div
                  class="
                    skeleton
                    skeleton-profil-title
                  "
                ></div>

                <div
                  class="
                    skeleton
                    skeleton-profil-type
                  "
                ></div>

              </div>


              <div
                class="
                  skeleton
                  skeleton-profil-status
                "
              ></div>

            </div>


            <!-- LOCATION -->

            <div class="profil-skeleton-location">

              <div
                class="
                  skeleton
                  skeleton-location-icon
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-location-text
                "
              ></div>

            </div>


            <!-- DESCRIPTION -->

            <div
              class="
                skeleton
                skeleton-description
              "
            ></div>

            <div
              class="
                skeleton
                skeleton-description short
              "
            ></div>


            <!-- STATS -->

            <div
              class="
                profil-card-stats
                profil-skeleton-stats
              "
            >

              <div class="profil-skeleton-stat">
                <div class="skeleton skeleton-stat-icon"></div>
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-stat-label"></div>
              </div>

              <div class="profil-skeleton-stat">
                <div class="skeleton skeleton-stat-icon"></div>
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-stat-label"></div>
              </div>

              <div class="profil-skeleton-stat">
                <div class="skeleton skeleton-stat-icon"></div>
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-stat-label"></div>
              </div>

              <div class="profil-skeleton-stat">
                <div class="skeleton skeleton-stat-icon"></div>
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-stat-label"></div>
              </div>

            </div>


            <!-- FOOTER -->

            <div class="profil-card-footer">

              <div
                class="
                  skeleton
                  skeleton-readiness
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-detail-button
                "
              ></div>

            </div>

          </div>

        </div>

      `;
    }

    el.innerHTML = html;
  },

  /* =====================================
     LIST
  ===================================== */

  list(target, total = 6) {
    const el = document.querySelector(target);

    if (!el) return;

    let html = "";

    for (let i = 0; i < total; i++) {
      html += `

      <div class="skeleton-list">

          <div class="skeleton-avatar"></div>

          <div>

              <div class="skeleton skeleton-title"></div>

              <div class="skeleton skeleton-text"></div>

          </div>

      </div>

      `;
    }

    el.innerHTML = html;
  },

  /* =====================================
   DETAIL PENGINAPAN
===================================== */

  detail(target) {
    const el = document.querySelector(target);

    if (!el) return;

    el.innerHTML = `

    <div class="skeleton-detail">

      <!-- ================================
           COVER
      ================================= -->

      <div class="skeleton-detail-cover">

        <div class="skeleton skeleton-detail-image"></div>

      </div>


      <!-- ================================
           PROPERTY INFO
      ================================= -->

      <div class="skeleton-detail-info">

        <!-- LOCATION -->

        <div
          class="
            skeleton
            skeleton-detail-location
          "
        ></div>


        <!-- TITLE -->

        <div
          class="
            skeleton
            skeleton-detail-title
          "
        ></div>


        <!-- TYPE -->

        <div
          class="
            skeleton
            skeleton-detail-type
          "
        ></div>


        <!-- DESCRIPTION -->

        <div
          class="
            skeleton
            skeleton-detail-description
          "
        ></div>

        <div
          class="
            skeleton
            skeleton-detail-description short
          "
        ></div>


        <!-- ================================
             META
        ================================= -->

        <div class="skeleton-detail-meta">

          <div class="skeleton-detail-meta-item">

            <div
              class="
                skeleton
                skeleton-detail-meta-label
              "
            ></div>

            <div
              class="
                skeleton
                skeleton-detail-meta-value
              "
            ></div>

          </div>


          <div class="skeleton-detail-meta-item">

            <div
              class="
                skeleton
                skeleton-detail-meta-label
              "
            ></div>

            <div
              class="
                skeleton
                skeleton-detail-meta-value
              "
            ></div>

          </div>

        </div>


        <!-- ================================
             RESERVATION
        ================================= -->

        <div class="skeleton-detail-reservation">

          <div
            class="
              skeleton
              skeleton-detail-section-title
            "
          ></div>

          <div
            class="
              skeleton
              skeleton-detail-section-text
            "
          ></div>


          <!-- FORM -->

          <div class="skeleton-detail-form">

            <div class="skeleton-detail-field">
              <div
                class="
                  skeleton
                  skeleton-detail-label
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-detail-input
                "
              ></div>
            </div>


            <div class="skeleton-detail-field">
              <div
                class="
                  skeleton
                  skeleton-detail-label
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-detail-input
                "
              ></div>
            </div>


            <div class="skeleton-detail-field">
              <div
                class="
                  skeleton
                  skeleton-detail-label
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-detail-input
                "
              ></div>
            </div>


            <div class="skeleton-detail-field">
              <div
                class="
                  skeleton
                  skeleton-detail-label
                "
              ></div>

              <div
                class="
                  skeleton
                  skeleton-detail-input
                "
              ></div>
            </div>

          </div>


          <!-- BUTTON -->

          <div
            class="
              skeleton
              skeleton-detail-button
            "
          ></div>

        </div>

      </div>

    </div>

  `;
  },

  /* =====================================
     HIDE
  ===================================== */

  hide(target) {
    const el = document.querySelector(target);

    if (!el) return;

    el.innerHTML = "";
  },
};
