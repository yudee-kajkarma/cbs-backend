import app from './app';
import { connectDB } from './config/database';
import { config } from './config/config';

(async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });
})();
