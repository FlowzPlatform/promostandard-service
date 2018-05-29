// Initializes the `promoStandardLocation` service on path `/promoStandardLocation`
const createService = require('feathers-rethinkdb');
const hooks = require('./promo-standard-location.hooks');
const filters = require('./promo-standard-location.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'promo_standard_location',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/promoStandardLocation', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('promoStandardLocation');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
