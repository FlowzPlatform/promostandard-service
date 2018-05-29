const assert = require('assert');
const app = require('../../src/app');

describe('\'promoStandardCharges\' service', () => {
  it('registered the service', () => {
    const service = app.service('promo-standard-charges');

    assert.ok(service, 'Registered the service');
  });
});
