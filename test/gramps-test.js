import * as apollo from 'apollo-server-express';

import { grampsExpress } from '../src/gramps';
import * as cfg from '../src/lib/configureSchema';

// Stub out the functions that are tested elsewhere.
cfg.getSchema = jest.fn(opts => opts);
cfg.addMockFunctions = jest.fn();
apollo.graphqlExpress = jest.fn();

describe('GrAMPS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('grampsExpress()', () => {
    it('properly configures a schema when called with no options', () => {
      /*
       * This is a little clever: `graphqlExpress` accepts a function as its
       * argument, so we capture that function, assign the return value to a
       * variable, and check that it has the expected shape.
       */
      let mockReturn;
      apollo.graphqlExpress = jest.fn(fn => {
        mockReturn = fn({}, {});
      });

      grampsExpress();

      expect(cfg.getSchema).toHaveBeenCalledWith({
        sources: [],
        logger: console,
        options: {},
      });

      expect(cfg.addMockFunctions).not.toHaveBeenCalled();
      expect(apollo.graphqlExpress).toHaveBeenCalled();
      expect(mockReturn).toEqual(
        expect.objectContaining({
          context: {},
          formatError: expect.any(Function),
          schema: expect.any(Object),
        }),
      );
    });

    it('throws an error if a context option is supplied for graphqlExpress', () => {
      const shouldThrow = () => {
        grampsExpress({
          apollo: {
            graphqlExpress: {
              context: {
                shouldFail: true,
              },
            },
          },
        });
      };

      expect(shouldThrow).toThrowError(/Cannot set context directly/);
    });

    it('throws an error if a schema option is supplied for graphqlExpress', () => {
      const shouldThrow = () => {
        grampsExpress({
          apollo: {
            graphqlExpress: {
              schema: {
                shouldFail: true,
              },
            },
          },
        });
      };

      expect(shouldThrow).toThrowError(/Cannot set schema directly/);
    });

    it('adds mock functions when the enableMockData flag is true', () => {
      grampsExpress({
        enableMockData: true,
      });

      expect(cfg.addMockFunctions).toHaveBeenCalled();
    });

    it('properly combines contexts', () => {
      const dataSources = [
        { context: 'Foo', model: { foo: 'test' } },
        { context: 'Bar', model: { bar: 'test' } },
      ];

      let mockReturn;
      apollo.graphqlExpress = jest.fn(fn => {
        mockReturn = fn({}, {});
      });

      grampsExpress({ dataSources });

      expect(mockReturn.context).toEqual({
        Foo: {
          foo: 'test',
        },
        Bar: {
          bar: 'test',
        },
      });
    });

    it('properly adds extra context', () => {
      let mockReturn;
      apollo.graphqlExpress = jest.fn(fn => {
        mockReturn = fn({}, {});
      });

      grampsExpress({ extraContext: () => ({ extra: 'test' }) });

      expect(mockReturn.context).toEqual({
        extra: 'test',
      });
    });
  });
});
