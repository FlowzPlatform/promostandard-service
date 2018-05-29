const assert = require('assert');
const app = require('../../src/app');

describe('\'promoStandardColors\' service', () => {
  it('registered the service', () => {
    const service = app.service('promo-standard-colors');

    assert.ok(service, 'Registered the service');
  });
});
