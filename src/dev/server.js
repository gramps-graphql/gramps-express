import { EOL } from 'os';

import logger from '../lib/defaultLogger';
import app from './app';

// Get the port from the various places it can be set
const port = parseInt(process.env.PORT, 10) || 8080;
const mode =
  process.env.NODE_ENV === 'production' || process.env.GRAMPS_MODE === 'live'
    ? 'live'
    : 'mock';

// Start the server, then display app details and URL info.
app.set('port', port);
app.listen(app.get('port'), () => {
  const message = [
    `${EOL}============================================================`,
    `    GrAMPS is running in ${mode} mode on port ${port}`,
    '',
    `    GraphiQL: http://localhost:${port}/graphiql`,
    `============================================================${EOL}`,
  ];
  logger.info(message.join(EOL)); // eslint-disable-line no-console
});
