import { graphqlExpress } from 'apollo-server-express';

import { formatError } from './helpers/errors';
import { getSchema, addMockFunctions } from './lib/configureSchema';
import loadExternalDataSources from './lib/loadExternalDataSources';

// Export so only one import is required for GrAMPS users.
export { graphiqlExpress } from 'apollo-server-express';

export const grampsExpress = ({
  dataSources = [],
  extraContext = () => ({}),
  graphqlExpressOptions = {},
  logger = console,
  makeExecutableSchemaOptions = {
    allowUndefinedInResolve: process.env.NODE_ENV === 'production',
  },
  addMockFunctionsToSchemaOptions = {
    preserveResolvers: false,
  },
}) => {
  const sources = [...dataSources, ...loadExternalDataSources({ logger })];
  const schema = getSchema({ sources, logger, makeExecutableSchemaOptions });

  if ('schema' in graphqlExpressOptions) {
    throw new Error(
      'Schema cannot be added directly. See the data source documenation for ' +
        'more details. https://ibm.biz/graphql-data-source',
    );
  }

  if ('context' in graphqlExpressOptions) {
    throw new Error(
      'Context cannot be added directly. See the data source documenation for ' +
        'more details. https://ibm.biz/graphql-data-source',
    );
  }

  // Add mock functions to the schema.
  addMockFunctions({ sources, schema, ...addMockFunctionsToSchemaOptions });

  return graphqlExpress((req, res) => {
    const context = sources.reduce(
      (models, source) => ({
        ...models,
        [source.context]: source.model,
      }),
      extraContext(req, res),
    );

    return {
      schema,
      context,
      formatError,
      ...graphqlExpressOptions,
    };
  });
};
