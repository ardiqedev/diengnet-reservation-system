/* =========================================
   TEST PENGATURAN UNIT SERVICE
========================================= */

async function testPengaturanUnitService() {
  try {
    const result = await PengaturanUnitService.getByJenis("Hotel");

    console.log("PENGATURAN UNIT RESULT:", result);
  } catch (error) {
    console.error("PENGATURAN UNIT ERROR:", error);
  }
}
