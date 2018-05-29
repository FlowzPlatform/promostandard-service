const promoStandardCharges = require('./promo-standard-charges/promo-standard-charges.service.js');
const promoStandardColors = require('./promo-standard-colors/promo-standard-colors.service.js');
const promoStandardDecorationMethod = require('./promo-standard-decoration-method/promo-standard-decoration-method.service.js');
const promoStandardLocation = require('./promo-standard-location/promo-standard-location.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(promoStandardCharges);
  app.configure(promoStandardColors);
  app.configure(promoStandardDecorationMethod);
  app.configure(promoStandardLocation);
};
