const assert = require('assert');
const app = require('../../src/app');

describe('\'promoStandardLocation\' service', () => {
  it('registered the service', () => {
    const service = app.service('promo-standard-location');

    assert.ok(service, 'Registered the service');
  });
});
