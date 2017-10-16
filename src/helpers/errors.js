import uuid from 'uuid';
import { EOL } from 'os';
import {
  initSevenBoom,
  SevenBoom,
  formatErrorGenerator,
} from 'graphql-apollo-errors';

// Define the available error data that can be returned in every error.
const customErrorFields = [
  // Putting this first (out of order) to control display order in server logs.
  {
    label: 'Error GUID',
    name: 'guid',
    order: 10,
    default: () => uuid.v4(),
  },
  {
    label: 'Description',
    name: 'description',
    order: 1,
  },
  {
    label: 'Error Code',
    name: 'errorCode',
    order: 2,
    default: 'BLUEMIX_GRAPHQL_ERROR',
  },
  {
    label: 'GraphQL Model',
    name: 'graphqlModel',
    order: 3,
  },
  {
    label: 'Target Endpoint',
    name: 'targetEndpoint',
    order: 4,
  },
  {
    label: 'Documentation',
    name: 'docsLink',
    order: 5,
  },
];

// Add the custom fields. Copy the array because this function mutates its args.
initSevenBoom([...customErrorFields]);

/**
 * Creates a custom error or wraps an existing error.
 *
 * @see https://github.com/GiladShoham/seven-boom
 * @see https://github.com/hapijs/boom
 *
 * @param  {Object?}        config                 error configuration
 * @param  {Error|boolean?} config.error           Error object to modify
 * @param  {number?}        config.statusCode      HTTP status code (e.g. 404)
 * @param  {Object?}        config.data            supplied data (e.g. vars)
 * @param  {string?}        config.message         human-readable error message
 * @param  {string?}        config.errorCode       custom error code
 * @param  {string?}        config.graphqlModel    which GraphQL model errored
 * @param  {string?}        config.targetEndpoint  where data was loaded from
 * @param  {string?}        config.docsLink        link to help docs
 * @return {Error}                                 SevenBoom error for output
 */
export function GrampsError(
  {
    error = false,
    statusCode = false,
    data = null,
    message = '',
    description = null,
    errorCode = 'BLUEMIX_GRAPHQL_ERROR',
    graphqlModel = null,
    targetEndpoint = null,
    docsLink = null,
  } = {},
) {
  const httpErrorCode = statusCode || error.statusCode || 500;

  // If we’re wrapping an error, the function and first three arguments change.
  const fn = error ? 'wrap' : 'create';
  const baseArgs = error
    ? [error, httpErrorCode, message]
    : [httpErrorCode, message, data];

  // Add the custom arguments to the first three.
  const args = baseArgs.concat([
    description,
    errorCode,
    graphqlModel,
    targetEndpoint,
    docsLink,
  ]);

  // Call the function and spread the args array into individual arguments.
  return SevenBoom[fn](...args);
}

/**
 * Builds a list of error details based on what details are available.
 *
 * For each available field, check if the error contains info that matches it.
 * We also add a label for human readability and removes empty array elements.
 *
 * @param  {array} fields  detail fields to format
 * @param  {Error} error   the error data for display
 * @return {array}         list of formatted error details
 */
const formatDetailsArray = (fields, error) =>
  fields
    .filter(field => field.name !== 'guid')
    .map(field => error[field.name] && `${field.label}: ${error[field.name]}`)
    .filter(field => !!field);

/**
 * Checks incoming errors to ensure the formatting is correct.
 * @param  {Object}      error  error to be formatted
 * @return {GrampsError}        formatted GrAMPS error
 */
export const handleQueryErrors = error => {
  if (!error.isBoom) {
    // Check to make sure we don’t swallow GraphQL syntax errors, etc..
    return GrampsError({
      error,
      errorCode: 'GRAPHQL_ERROR',
      description: error.message,
      data: {
        locations: error.locations,
        path: error.path,
      },
    });
  }

  return error;
};

/**
 * Accepts a SevenBoom error object and generates a formatted server log.
 * @param  {object} error                 the SevenBoom error object
 * @param  {object} error.data            supplied data (e.g. arguments, vars)
 * @param  {array}  error.stack           the error’s stack trace
 * @param  {object} error.output          object containing error output
 * @param  {object} error.output.payload  generated payload from SevenBoom
 * @return {void}
 */
export const printDetailedServerLog = logger => ({
  data,
  stack,
  output: { payload },
}) => {
  const details = formatDetailsArray(customErrorFields, payload);
  const defaultMsg = 'something went wrong 💀 ';
  const message = payload.description || payload.message || defaultMsg;

  // The first line has special formatting to make it useful + searchable.
  details.unshift(`Error: ${message} (${payload.guid})`);

  // Data is an object, so we need to do a little extra formatting.
  if (data) {
    details.push(`Data: ${JSON.stringify(data, null, 2)}`);
  }

  // Create a single string that joins each section with two line breaks.
  const log = [details.join(EOL), stack].join(EOL.repeat(2));

  logger.error(log);
};

/**
 * Formats and sanitizes the error message for public display.
 * @param  {Error} error  the processed SevenBoom error
 * @return {Error}        the display-safe error
 */
export const formatClientErrorData = error => {
  /* eslint-disable no-param-reassign */
  if (process.env.NODE_ENV === 'production') {
    // Not all API endpoints are public, so hide those in production.
    delete error.targetEndpoint;

    // Clients can’t reach most internal docs, so hide those as well.
    delete error.docsLink;
  }

  // The message prop is overwritten by either GraphQL or SevenBoom.
  if (!error.description) {
    error.description = error.message;
    delete error.message;
  }

  // To avoid escaped quotes, change them to single quotes.
  error.description = error.description.replace(/"/g, "'");

  /* eslint-enable no-param-reassign */

  return error;
};

/**
 * Custom error formatting for the GraphQL server.
 * @see http://dev.apollodata.com/tools/apollo-server/setup.html#graphqlOptions
 * @see https://github.com/GiladShoham/graphql-apollo-errors
 */
export const formatError = (logger = console) =>
  formatErrorGenerator({
    hooks: {
      onOriginalError: handleQueryErrors,
      onProcessedError: printDetailedServerLog(logger),
      onFinalError: formatClientErrorData,
    },
  });
