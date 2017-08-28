import '../../src/dev/server';

import app from '../../src/dev/app';

jest.mock('../../src/dev/app', () => ({
  set: jest.fn(),
  get: jest.fn(() => 9999),
  listen: jest.fn((port, fn) => fn()),
}));

describe('dev/server', () => {
  it('sets the port appropriately', () => {
    expect(app.set).toHaveBeenCalledWith('port', 8080);
  });

  it('calls the listen method with the correct arguments', () => {
    expect(app.listen.mock.calls[0][0]).toBe(9999);
  });
});
