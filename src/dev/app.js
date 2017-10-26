import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { grampsExpress } from '../index';

const app = express();

const enableMockData =
  process.env.NODE_ENV !== 'production' && process.env.GRAMPS_MODE !== 'live';

app.use(bodyParser.json());

const { fromRequestContext } = grampsExpress({
  dataSources: [],
  enableMockData,
  extraContext: req => ({ req }),
});
app.all(
  '/graphql',
  graphqlExpress(req => {
    const gramps = fromRequestContext(req, req.res);
    return {
      schema: gramps.schema,
      context: gramps.context,
      formatError: gramps.formatError,
    };
  }),
);

app.get(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

export default app;
