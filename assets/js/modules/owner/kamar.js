/* =========================================================
   DIENG STAY
   OWNER KAMAR
========================================================= */

const OwnerKamar = (() => {
  let initialized = false;

  /* =======================================================
     DUMMY DATA
  ======================================================= */

  let rooms = [
    {
      id: "UNT0001",
      name: "Cabin A",
      type: "Cabin",
      capacity: "2 tamu",
      active: true,
    },

    {
      id: "UNT0002",
      name: "Cabin B",
      type: "Cabin",
      capacity: "2 tamu",
      active: true,
    },

    {
      id: "UNT0003",
      name: "Cabin C",
      type: "Cabin",
      capacity: "4 tamu",
      active: true,
    },

    {
      id: "UNT0004",
      name: "Villa 1",
      type: "Villa",
      capacity: "4 tamu",
      active: true,
    },

    {
      id: "UNT0005",
      name: "Villa 2",
      type: "Villa",
      capacity: "6 tamu",
      active: false,
    },
  ];

  /* =======================================================
     INIT
  ======================================================= */

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;

    console.log("[OWNER KAMAR] INIT");

    render();
  }

  /* =======================================================
     RENDER
  ======================================================= */

  function render() {
    const container = document.getElementById("roomList");

    if (!container) {
      return;
    }

    container.innerHTML = rooms.map((room) => renderRoom(room)).join("");

    updateSummary();

    bindEvents();

    renderIcons();
  }

  /* =======================================================
     ROOM
  ======================================================= */

  function renderRoom(room) {
    const active = Boolean(room.active);

    return `

      <article
        class="owner-room-card"
      >


        <div
          class="owner-room-icon"
        >

          <i
            data-lucide="bed-double"
          ></i>

        </div>



        <div
          class="owner-room-content"
        >

          <strong>

            ${escapeHtml(room.name)}

          </strong>


          <span>

            ${escapeHtml(room.type)}

            ·

            ${escapeHtml(room.capacity)}

          </span>


          <span
            class="
              owner-room-status
              ${active ? "active" : "inactive"}
            "
          >

            ${active ? "Aktif" : "Nonaktif"}

          </span>

        </div>



        <button
          type="button"
          class="
            owner-room-toggle
            ${active ? "active" : ""}
          "
          data-room-id="${escapeHtml(room.id)}"
          aria-label="${active ? "Nonaktifkan kamar" : "Aktifkan kamar"}"
          aria-pressed="${active}"
        ></button>


      </article>

    `;
  }

  /* =======================================================
     EVENTS
  ======================================================= */

  function bindEvents() {
    document.querySelectorAll(".owner-room-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const roomId = String(button.dataset.roomId || "").trim();

        toggleRoom(roomId);
      });
    });
  }

  /* =======================================================
     TOGGLE
  ======================================================= */

  function toggleRoom(roomId) {
    const room = rooms.find((item) => item.id === roomId);

    if (!room) {
      return;
    }

    room.active = !room.active;

    console.log("[OWNER KAMAR] TOGGLE:", {
      roomId: room.id,

      name: room.name,

      active: room.active,
    });

    render();
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  function updateSummary() {
    const active = rooms.filter((room) => room.active).length;

    const inactive = rooms.length - active;

    const activeElement = document.getElementById("activeRoomCount");

    const inactiveElement = document.getElementById("inactiveRoomCount");

    if (activeElement) {
      activeElement.textContent = active;
    }

    if (inactiveElement) {
      inactiveElement.textContent = inactive;
    }
  }

  /* =======================================================
     ICON
  ======================================================= */

  function renderIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  /* =======================================================
     ESCAPE
  ======================================================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     PUBLIC
  ======================================================= */

  return {
    init,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  OwnerKamar.init();
});
