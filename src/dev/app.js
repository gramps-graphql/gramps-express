import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { grampsExpress } from '../index';

const app = express();

app.use(bodyParser.json());

app.use(
  grampsExpress({
    dataSources: [],
    enableMockData: process.env.NODE_ENV !== 'production',
    extraContext: req => ({ req }),
  }),
);

app.all(
  '/graphql',
  graphqlExpress(req => ({
    schema: req.gramps.schema,
    context: req.gramps.context,
    formatError: req.gramps.formatError,
  })),
);

app.get(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

export default app;
