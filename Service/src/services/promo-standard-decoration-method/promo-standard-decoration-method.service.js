// Initializes the `promoStandardDecorationMethod` service on path `/promoStandardDecorationMethod`
const createService = require('feathers-rethinkdb');
const hooks = require('./promo-standard-decoration-method.hooks');
const filters = require('./promo-standard-decoration-method.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'promo_standard_decoration_method',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/promoStandardDecorationMethod', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('promoStandardDecorationMethod');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
