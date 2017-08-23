import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';

import pkg from '../../package.json';
import rootSchema from '../rootSchema.graphql';

/**
 * Generates an executable schema for use with `graphqlExpress`.
 * @param {array} sources all data sources to be exposed through GraphQL
 */
export const getSchema = ({ sources, logger, makeExecutableSchemaOptions }) =>
  makeExecutableSchema({
    // Combine all the schema definitions into an array.
    typeDefs: [rootSchema, ...sources.map(source => source.schema)],

    /*
     * What’s happening here is painfully complicated logic for taking a root
     * resolver and one or more type resolvers from each supplied data source,
     * combining them into a single object, and placing that into the
     * `resolvers` property.
     *
     * I’m doing it this way to keep complicated logic out of the data source
     * folders, in hopes that my suffering will improve your dev experience.
     */
    resolvers: {
      // Reduces the array of source query resolvers into a single object.
      Query: sources.reduce(
        (queries, source) => ({
          ...queries,
          ...source.resolvers.queryResolvers,
        }),
        {
          // Return the current package version.
          version: /* istanbul ignore next */ () => pkg.version,
        },
      ),

      // Reduces the array of mutation resolvers into a single object.
      Mutation: sources.reduce(
        (mutations, source) => ({
          ...mutations,
          ...source.resolvers.mutationResolvers,
        }),
        {
          // This is a simple “are you alive” check.
          ping: /* istanbul ignore next */ () => true,
        },
      ),

      // Retrieves the data resolvers, then spreads them into individual objects.
      ...sources.reduce(
        (resolvers, source) => ({
          ...resolvers,
          ...source.resolvers.dataResolvers,
        }),
        {},
      ),
    },

    logger,
    ...makeExecutableSchemaOptions,
  });

export const addMockFunctions = ({
  sources,
  schema,
  enableMockData = process.env.NODE_ENV !== 'production',
  preserveResolvers = process.env.NODE_ENV !== 'production',
}) => {
  // If we’re in local mode, use mock data.
  /* istanbul ignore else: no else case required */
  if (enableMockData) {
    addMockFunctionsToSchema({
      schema,
      preserveResolvers,

      // Each data source defines its own mock resolvers, so combine them here.
      mocks: sources.reduce(
        (mocks, source) => ({
          ...mocks,

          // Mock resolvers are not required, so fall back to an empty object.
          ...(source.resolvers.mockResolvers || {}),
        }),
        {},
      ),
    });
  }

  return schema;
};
