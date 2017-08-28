import loadExternalDataSources from '../../src/lib/loadExternalDataSources';
import defaultLogger from '../../src/lib/defaultLogger';

jest.mock('../../src/lib/defaultLogger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('lib/loadExternalDataSources', () => {
  afterEach(() => {
    delete process.env.GQL_DATA_SOURCES;
  });

  it('returns an empty array if no external sources are specified', () => {
    const sources = loadExternalDataSources({ logger: defaultLogger });

    expect(sources).toBeDefined();
    expect(sources).toHaveLength(0);
  });

  it('returns an external source if one is supplied', () => {
    process.env.GQL_DATA_SOURCES = './test/fixtures/externalDataSourceOne';
    const sources = loadExternalDataSources({ logger: defaultLogger });

    expect(sources).toBeDefined();
    expect(sources).toHaveLength(1);
    expect(sources[0].context).toEqual('ExternalOne');
  });

  it('returns two external sources if two are supplied', () => {
    process.env.GQL_DATA_SOURCES =
      './test/fixtures/externalDataSourceOne, ./test/fixtures/externalDataSourceTwo';
    const sources = loadExternalDataSources({ logger: defaultLogger });

    expect(sources).toBeDefined();
    expect(sources).toHaveLength(2);
    expect(sources[0]).toEqual(
      expect.objectContaining({
        context: expect.any(String),
        schema: expect.any(String),
        resolvers: expect.any(Object),
        model: expect.any(Object),
      }),
    );
    expect(sources[0].context).toEqual('ExternalOne');
    expect(sources[1].context).toEqual('ExternalTwo');
  });
});
