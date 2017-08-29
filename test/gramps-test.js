import grampsExpress from '../src/gramps';
import * as cfg from '../src/lib/configureSchema';

// Stub out the functions that are tested elsewhere.
cfg.getSchema = jest.fn(opts => opts);
cfg.addMockFunctions = jest.fn();

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grampsExpress()', () => {
    it('properly configures a schema when called with no options', () => {
      /*
       * Since GrAMPS is Express middleware, we want to simulate the result of
       * calling it in the Express pipeline.
       */
      const mockReq = {};
      grampsExpress()(mockReq, {}, jest.fn());

      expect(cfg.addMockFunctions).toHaveBeenCalled();
      expect(cfg.getSchema).toHaveBeenCalledWith({
        sources: [],
        logger: console,
        options: {},
      });

      expect(mockReq.gramps).toEqual(
        expect.objectContaining({
          context: {},
          formatError: expect.any(Function),
          schema: expect.any(Object),
        }),
      );
    });

    it('does not add mock functions when the enableMockData flag is false', () => {
      grampsExpress({ enableMockData: false });

      expect(cfg.addMockFunctions).not.toHaveBeenCalled();
    });

    it('properly combines contexts', () => {
      const dataSources = [
        { context: 'Foo', model: { foo: 'test' } },
        { context: 'Bar', model: { bar: 'test' } },
      ];

      const mockReq = {};
      grampsExpress({ dataSources })(mockReq, {}, jest.fn());

      expect(mockReq.gramps.context).toEqual({
        Foo: {
          foo: 'test',
        },
        Bar: {
          bar: 'test',
        },
      });
    });

    it('properly adds extra context', () => {
      const mockReq = {};
      grampsExpress({ extraContext: () => ({ extra: 'test' }) })(
        mockReq,
        {},
        jest.fn(),
      );
      grampsExpress();

      expect(mockReq.gramps.context).toEqual({
        extra: 'test',
      });
    });
  });
});
