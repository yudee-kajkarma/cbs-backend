import app from './app';
import { connectToDatabase } from './config/database';
import { config } from './config/config';

(async () => {
  await connectToDatabase();
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });
})();
