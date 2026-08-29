/* =========================================
   RESERVASI VALIDATOR
========================================= */

const ReservasiValidator = {
  /* =====================================
     STEP 1
     CARI PENGINAPAN
  ===================================== */

  step1(data) {
    if (!data.penginapanId) {
      Toast.warning("Silakan pilih penginapan.");

      return false;
    }

    if (!data.channel) {
      Toast.warning("Silakan pilih channel.");

      return false;
    }

    if (!data.checkIn) {
      Toast.warning("Tanggal check in wajib diisi.");

      return false;
    }

    if (!data.checkOut) {
      Toast.warning("Tanggal check out wajib diisi.");

      return false;
    }

    if (new Date(data.checkIn) >= new Date(data.checkOut)) {
      Toast.warning("Tanggal check out harus setelah check in.");

      return false;
    }

    if (Number(data.dewasa) < 1) {
      Toast.warning("Minimal 1 tamu dewasa.");

      return false;
    }

    return true;
  },

  /* =====================================
     STEP 2
     PILIH UNIT
  ===================================== */

  /* =====================================
   STEP 2
   PILIH UNIT
===================================== */

  step2(data) {
    if (!data.unitId) {
      Toast.warning("Silakan pilih unit.");

      return false;
    }

    return true;
  },

  /* =====================================
     STEP 3
     DATA TAMU
  ===================================== */

  step3(data) {
    if (!data.namaTamu?.trim()) {
      Toast.warning("Nama pemesan wajib diisi.");

      return false;
    }

    if (!data.noHp?.trim()) {
      Toast.warning("Nomor HP wajib diisi.");

      return false;
    }

    return true;
  },

  /* =====================================
     STEP 4
     REVIEW
  ===================================== */

  /* =====================================
   STEP 4
   REVIEW
===================================== */

  step4(booking) {
    try {
      const pricing = BookingService.calculatePrice(booking);

      if (!pricing || Number(pricing.total) <= 0) {
        Toast.warning("Total reservasi belum valid.");

        return false;
      }

      return true;
    } catch (error) {
      console.error("[VALIDATOR] STEP4:", error);

      Toast.warning(error.message || "Harga reservasi belum valid.");

      return false;
    }
  },
};
