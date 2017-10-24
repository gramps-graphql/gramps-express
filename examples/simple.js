import Express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { grampsExpress } from '../src';

const app = Express();

app.use(
  '/graphql',

  // Required for POST requests.
  bodyParser.json(),

  // Create a combined (but empty) schema and context.
  grampsExpress(),

  // Use the data sources and context object from GrAMPS.
  graphqlExpress(req => ({
    schema: req.gramps.schema,
    context: req.gramps.context,
  })),
);

app.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

app.listen(2551, () => {
  console.log('Visit http://localhost:2551/graphiql in your browser.');
});
