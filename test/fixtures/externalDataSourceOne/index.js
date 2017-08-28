import schema from './schema.graphql';
import resolvers from './resolvers';
import Connector from './connector';
import Model from './model';

export default {
  context: 'ExternalOne',
  schema,
  resolvers,
  model: new Model({ connector: new Connector() }),
};
