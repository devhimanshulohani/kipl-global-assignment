// Must be the first import — env.ts validates process.env at boot and fails fast.
import { env } from './config/env';

import app from './app';
import { sequelize } from './config/db';
import './models';
import logger from './utils/logger';

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('database connected');
    app.listen(env.PORT, () =>
      logger.info(`server listening on :${env.PORT} (${env.NODE_ENV})`)
    );
  } catch (err) {
    logger.error({ err }, 'failed to start');
    process.exit(1);
  }
})();
