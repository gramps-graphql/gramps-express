import {
  loadDevDataSources,
  overrideLocalSources,
} from '../../src/lib/externalDataSources';
import defaultLogger from '../../src/lib/defaultLogger';

jest.mock('../../src/lib/defaultLogger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('lib/externalDataSources', () => {
  afterEach(() => {
    delete process.env.GQL_DATA_SOURCES;
  });

  describe('loadDevDataSources()', () => {
    it('returns an empty array if no external sources are specified', () => {
      const sources = loadDevDataSources({ logger: defaultLogger });

      expect(sources).toBeDefined();
      expect(sources).toHaveLength(0);
    });

    it('returns an external source if one is supplied', () => {
      process.env.GQL_DATA_SOURCES = './test/fixtures/externalDataSourceOne';
      const sources = loadDevDataSources({ logger: defaultLogger });

      expect(sources).toBeDefined();
      expect(sources).toHaveLength(1);
      expect(sources[0].context).toEqual('ExternalOne');
    });

    it('returns two external sources if two are supplied', () => {
      process.env.GQL_DATA_SOURCES =
        './test/fixtures/externalDataSourceOne, ./test/fixtures/externalDataSourceTwo';
      const sources = loadDevDataSources({ logger: defaultLogger });

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

  describe('overrideLocalSources()', () => {
    const sources = [
      { context: 'One', value: 'local' },
      { context: 'Two', value: 'local' },
      { context: 'Three', value: 'local' },
    ];

    it('properly overrides local sources with dev versions', () => {
      const devSources = [
        { context: 'Two', value: 'external' },
        { context: 'Three', value: 'external' },
      ];

      expect(
        overrideLocalSources({ sources, devSources, logger: defaultLogger }),
      ).toEqual([
        { context: 'One', value: 'local' },
        { context: 'Two', value: 'external' },
        { context: 'Three', value: 'external' },
      ]);
    });

    it('does nothing if no dev sources are supplied', () => {
      expect(
        overrideLocalSources({
          sources,
          devSources: [],
          logger: defaultLogger,
        }),
      ).toEqual(sources);
    });
  });
});
