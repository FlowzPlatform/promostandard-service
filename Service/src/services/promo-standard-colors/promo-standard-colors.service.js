// Initializes the `promoStandardColors` service on path `/promoStandardColors`
const createService = require('feathers-rethinkdb');
const hooks = require('./promo-standard-colors.hooks');
const filters = require('./promo-standard-colors.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'promo_standard_colors',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/promoStandardColors', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('promoStandardColors');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
