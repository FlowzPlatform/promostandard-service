// Initializes the `promoStandardCharges` service on path `/promoStandardCharges`
const createService = require('feathers-rethinkdb');
const hooks = require('./promo-standard-charges.hooks');
const filters = require('./promo-standard-charges.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'promo_standard_charges',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/promoStandardCharges', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('promoStandardCharges');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
