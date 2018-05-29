const assert = require('assert');
const app = require('../../src/app');

describe('\'promoStandardDecorationMethod\' service', () => {
  it('registered the service', () => {
    const service = app.service('promo-standard-decoration-method');

    assert.ok(service, 'Registered the service');
  });
});
