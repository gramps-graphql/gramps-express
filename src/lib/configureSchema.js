import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

import pkg from '../../package.json';
import rootSchema from '../rootSchema.graphql';

/**
 * Reduce an array of data source resolvers into a single object.
 *
 * We take a root resolver and one or more type resolvers from each supplied
 * data source, combines them into a single object, and returns it for use with
 * makeExecutableSchema. This is how we make the data sources composable.
 *
 * This done to keep complicated logic out of the data sources themselves,
 * in hopes that my suffering will improve your developer experience.
 *
 * @param  {string}  type     resolvers to combine (query|mutation|data|mock)
 * @param  {array}   sources  data sources to combine
 * @param  {object?} initial  object to use as the reducer’s initial value
 * @return {object}           the combined resolvers
 */
export const combineResolvers = (type, sources, initial = {}) =>
  sources.reduce(
    (combined, source) => ({
      ...combined,
      ...source.resolvers[`${type}Resolvers`],
    }),
    initial,
  );

/**
 * Generates an executable schema for use with `graphqlExpress`.
 *
 * @see http://dev.apollodata.com/tools/graphql-tools/generate-schema.html#makeExecutableSchema
 *
 * @param  {array}  config.sources  all data sources to be composed
 * @param  {object} config.logger   a logger for debugging
 * @param  {object} config.options  options for makeExecutableSchema
 * @return {object}                 the result of makeExecutableSchema
 */
export const getSchema = ({ sources, logger, options }) =>
  makeExecutableSchema({
    // Combine all the schema definitions into an array.
    typeDefs: [rootSchema, ...sources.map(source => source.schema)],
    resolvers: {
      Query: combineResolvers('query', sources, {
        grampsVersion: /* istanbul ignore next */ () => pkg.version,
      }),
      Mutation: combineResolvers('mutation', sources, {
        grampsPing: /* istanbul ignore next */ () => 'GET OFF MY LAWN',
      }),
      ...combineResolvers('data', sources),
    },

    logger,
    ...options,
  });

/**
 * Adds mock resolvers for simulating responses for an array of data sources.
 *
 * @see http://dev.apollodata.com/tools/graphql-tools/mocking.html#addMockFunctionsToSchema
 *
 * @param  {array}   config.sources            GraphQL data source objects
 * @param  {object}  config.schema             return from makeExecutableSchema
 * @param  {boolean} config.preserveResolvers  whether to use resolvers in mocks
 * @return {object}                            the executable schema
 */
export const addMockFunctions = ({ sources, schema, options }) => {
  addMockFunctionsToSchema({
    mocks: combineResolvers('mock', sources),
    schema,
    ...options,
  });

  return schema;
};
