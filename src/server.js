// The regenerator runtime is required for async/await calls.
import 'regenerator-runtime/runtime';
import { EOL } from 'os';

import app from './app';

// Get the port from the various places it can be set
const port = parseInt(process.env.PORT, 10) || 8080;

// Start the server, then display app details and URL info.
app.set('port', port);
app.listen(app.get('port'), () => {
  const message = [
    `${EOL}============================================================`,
    `    GrAMPS is running in ${process.env.NODE_ENV} mode on port ${port}`,
    '',
    `    GraphiQL: http://localhost:${port}/graphiql`,
    `============================================================${EOL}`,
  ];
  console.info(message.join(EOL)); // eslint-disable-line no-console
});
