/* =========================================
   QEDEV API
========================================= */

const API = {};

/* =====================================
   CONFIG
===================================== */

API.baseUrl = CONFIG.API.URL;

/* =====================================
   REQUEST
===================================== */

API.request = async function (action, data = {}) {
  try {
    const payload = JSON.stringify({
      action,
      data,
    });

    const response = await fetch(this.baseUrl, {
      method: "POST",

      body: new URLSearchParams({
        payload,
      }),
    });

    /* =================================
       READ RESPONSE
    ================================= */

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("[API] Invalid JSON response:", text);

      throw new Error(
        `Server mengembalikan response tidak valid (${response.status}).`,
      );
    }

    /* =================================
       HTTP ERROR
    ================================= */

    if (!response.ok) {
      throw new Error(result?.message || `Request gagal (${response.status}).`);
    }

    /* =================================
       APPLICATION ERROR
    ================================= */

    if (result.success === false) {
      throw new Error(result.message || "Request gagal.");
    }

    return result;
  } catch (error) {
    console.error("[API] Request error:", error);

    /*
     * Jangan gunakan Toast di sini.
     * Public module bisa menangani error sendiri.
     */

    throw error;
  }
};

/* =====================================
   POST
===================================== */

API.post = function (action, data = {}) {
  return this.request(action, data);
};
