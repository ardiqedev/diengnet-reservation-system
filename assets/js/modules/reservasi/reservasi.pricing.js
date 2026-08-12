/* =========================================
   RESERVASI PRICING
========================================= */

const ReservasiPricing = {
  /* =====================================
     CALCULATE
  ===================================== */

  calculate(booking = {}) {
    const roomPrice = this.calculateRoomPrice(booking);

    const extraPerson = this.calculateExtraPerson(booking);

    const discount = this.calculateDiscount(booking);

    const tax = this.calculateTax(roomPrice, extraPerson, discount);

    const total = roomPrice + extraPerson - discount + tax;

    return {
      roomPrice,

      extraPerson,

      discount,

      tax,

      total,
    };
  },

  /* =====================================
   ROOM PRICE
===================================== */

  calculateRoomPrice(booking = {}) {
    const night = ReservasiHelper.countNight(booking.checkIn, booking.checkOut);

    return (Number(booking.roomPrice) || 0) * night;
  },

  /* =====================================
     EXTRA PERSON
  ===================================== */
  calculateExtraPerson(booking = {}) {
    return Number(booking.extraPerson) || 0;
  },

  /* =====================================
     DISCOUNT
  ===================================== */

  calculateDiscount() {
    return 0;
  },

  /* =====================================
     TAX
  ===================================== */

  calculateTax() {
    return 0;
  },

  /* =====================================
     GRAND TOTAL
  ===================================== */

  calculateGrandTotal(booking = {}) {
    return this.calculate(booking).total;
  },
};
