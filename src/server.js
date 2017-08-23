// The regenerator runtime is required for async/await calls.
import 'regenerator-runtime/runtime';

import app from './app';

// Get the port from the various places it can be set
const port = parseInt(process.env.PORT, 10) || 8080;

// Start the server, then display app details and URL info.
app.set('port', port);
app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log(`App running at http://localhost:${app.get('port')}`);
});
