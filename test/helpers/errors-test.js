import * as apolloErrors from 'graphql-apollo-errors';
import {
  GrampsError,
  formatError,
  formatClientErrorData,
  printDetailedServerLog,
} from '../../src';
import * as errors from '../../src/helpers/errors';
import defaultLogger from '../../src/lib/defaultLogger';

jest.mock('../../src/lib/defaultLogger.js', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

const mockError = {
  data: {},
  stack: '[stack trace goes here]',
  output: {
    payload: {
      guid: '1234',
      description: 'error description',
      message: 'error message',
      errorCode: 'TEST_ERROR_CODE',
      graphqlModel: 'testGraphQLModel',
      targetEndpoint: 'https://example.com/endpoint',
      docsLink: 'http://example.com/docs',
    },
  },
};

describe('lib/graphql/errors', () => {
  describe('handleQueryErrors()', () => {
    it('wraps GraphQL syntax errors properly', () => {
      const graphqlError = new Error();

      graphqlError.message = 'GraphQL syntax error';
      graphqlError.locations = [{ line: 2, column: 3 }];

      const err = errors.handleQueryErrors(graphqlError);

      expect(err.isBoom).toBe(true);
      expect(err.output.payload.description).toBe(graphqlError.message);
      expect(err.locations).toBe(graphqlError.locations);
      expect(err.output.payload.errorCode).toBe('GRAPHQL_ERROR');
    });

    it('passes through Boom errors as-is', () => {
      const mockBoomError = {
        isBoom: true,
      };

      expect(errors.handleQueryErrors(mockBoomError)).toBe(mockBoomError);
    });
  });

  describe('printDetailedServerLog()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('prints a detailed server log', () => {
      const spy = jest.spyOn(defaultLogger, 'error');

      errors.printDetailedServerLog(defaultLogger)(mockError);

      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Error: error description \(1234\)/),
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Description: error description/),
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Error Code: TEST_ERROR_CODE/),
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/GraphQL Model: testGraphQLModel/),
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(
          /Target Endpoint: https:\/\/example.com\/endpoint/,
        ),
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Documentation: http:\/\/example.com\/docs/),
      );
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/Data: {}/));
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/[stack trace goes here]/),
      );
    });

    it('only prints data if the prop is supplied', () => {
      const spy = jest.spyOn(defaultLogger, 'error');
      const mockErrorNoData = { ...mockError };

      delete mockErrorNoData.data;

      errors.printDetailedServerLog(defaultLogger)(mockErrorNoData);

      expect(spy).not.toHaveBeenCalledWith(expect.stringMatching(/Data:/));
    });

    it('only uses the message if no description is supplied', () => {
      const spy = jest.spyOn(defaultLogger, 'error');
      const mockErrorNoDescription = { ...mockError };

      delete mockErrorNoDescription.output.payload.description;

      errors.printDetailedServerLog(defaultLogger)(mockErrorNoDescription);

      expect(mockErrorNoDescription.output.payload.message).toEqual(
        'error message',
      );
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Error: error message/),
      );
    });

    it('prints a default message if neither description nor message exists', () => {
      const spy = jest.spyOn(defaultLogger, 'error');
      const mockErrorNoDescriptionOrMessage = { ...mockError };

      delete mockErrorNoDescriptionOrMessage.output.payload.description;
      delete mockErrorNoDescriptionOrMessage.output.payload.message;

      errors.printDetailedServerLog(defaultLogger)(
        mockErrorNoDescriptionOrMessage,
      );

      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Error: something went wrong/),
      );
    });
  });

  describe('formatClientErrorData()', () => {
    const mockClientError = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'error message',
      description: 'error description',
      errorCode: 'TEST_ERROR_CODE',
      graphqlModel: 'testGraphQLModel',
      targetEndpoint: 'https://example.com/endpoint',
      docsLink: 'http://example.com/docs',
      guid: '1234',
    };

    it('returns useful client-side errors', () => {
      expect(errors.formatClientErrorData(mockClientError)).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'error message',
        description: 'error description',
        errorCode: 'TEST_ERROR_CODE',
        graphqlModel: 'testGraphQLModel',
        targetEndpoint: 'https://example.com/endpoint',
        docsLink: 'http://example.com/docs',
        guid: '1234',
      });
    });

    it('removes sensitive data in production', () => {
      process.env.NODE_ENV = 'production';

      // This method mutates data, so we need a fresh copy.
      const productionMockError = { ...mockClientError };

      expect(errors.formatClientErrorData(productionMockError)).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'error message',
        description: 'error description',
        errorCode: 'TEST_ERROR_CODE',
        graphqlModel: 'testGraphQLModel',
        guid: '1234',
      });

      delete process.env.NODE_ENV;
    });

    it('substitutes the message for the description if absent', () => {
      const mockErrorNoDescription = { ...mockClientError };

      delete mockErrorNoDescription.description;

      expect(errors.formatClientErrorData(mockErrorNoDescription)).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        description: 'error message',
        errorCode: 'TEST_ERROR_CODE',
        graphqlModel: 'testGraphQLModel',
        targetEndpoint: 'https://example.com/endpoint',
        docsLink: 'http://example.com/docs',
        guid: '1234',
      });
    });

    it('swaps double quotes for single quotes to avoid gross formatting', () => {
      const mockErrorQuotes = {
        ...mockClientError,
        description: 'This has "quotes" in it.',
      };

      expect(errors.formatClientErrorData(mockErrorQuotes).description).toEqual(
        expect.stringMatching(/This has 'quotes' in it./),
      );
    });
  });

  describe('formatError()', () => {
    it('calls the error formatter with the proper arguments', () => {
      apolloErrors.formatErrorGenerator = jest.fn();

      formatError(defaultLogger);

      const arg = apolloErrors.formatErrorGenerator.mock.calls[0][0];

      expect(Object.keys(arg.hooks)).toEqual([
        'onOriginalError',
        'onProcessedError',
        'onFinalError',
      ]);
    });

    it('uses the console if no defaultLogger is provided', () => {
      // eslint-disable-next-line no-global-assign, no-console
      console.error = jest.fn();

      apolloErrors.formatErrorGenerator = jest.fn();
      errors.formatError();

      apolloErrors.formatErrorGenerator.mock.calls[0][0].hooks.onProcessedError(
        mockError,
      );

      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GrampsError()', () => {
    it('generates a SevenBoom error by default', () => {
      const error = GrampsError();
      const defaultError = 'Internal Server Error';
      const defaultMessage = 'An internal server error occurred';
      const defaultErrorCode = 'BLUEMIX_GRAPHQL_ERROR';

      expect(error.isBoom).toBe(true);
      expect(error.isServer).toBe(true);
      expect(error.message).toBe(defaultError);
      expect(error.output.statusCode).toBe(500);
      expect(error.output.payload.statusCode).toBe(500);
      expect(error.output.payload.error).toBe(defaultError);
      expect(error.output.payload.message).toBe(defaultMessage);
      expect(error.output.payload.description).toBeNull();
      expect(error.output.payload.errorCode).toBe(defaultErrorCode);
      expect(error.output.payload.graphqlModel).toBeNull();
      expect(error.output.payload.targetEndpoint).toBeNull();
      expect(error.output.payload.docsLink).toBeNull();
      expect(error.output.payload.guid).toBeTruthy();
    });

    it('wraps existing errors', () => {
      const error = new Error();
      const wrappedError = GrampsError({ error });

      expect(wrappedError.isBoom).toBe(true);
    });

    it('creates custom errors', () => {
      const error = GrampsError({
        statusCode: 418,
        message: 'error message',
        description: 'error description',
        graphqlModel: 'TestModel',
        targetEndpoint: 'https://example.org/test/endpoint',
        docsLink: 'https://example.org/docs',
      });

      expect(error.isBoom).toBe(true);
      expect(error.output.statusCode).toBe(418);
      expect(error.output.payload.message).toBe('error message');
      expect(error.output.payload.description).toBe('error description');
      expect(error.output.payload.graphqlModel).toBe('TestModel');
      expect(error.output.payload.targetEndpoint).toBe(
        'https://example.org/test/endpoint',
      );
      expect(error.output.payload.docsLink).toBe('https://example.org/docs');
    });
  });
});
