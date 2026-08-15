import { app } from './app.js';
import { environment } from './config/environment.js';
import {
  checkDatabaseConnection,
  closeDatabaseConnection
} from './config/database.js';

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();

    const server = app.listen(
      environment.port,
      () => {console.log(`back-actions running on port ${environment.port}`);
      }
    );

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down server.`);

      server.close(
        async () => {
          await closeDatabaseConnection();
          process.exit(0);
        }
      );
    };

    process.on('SIGTERM',
      () => {
        void shutdown('SIGTERM');
      }
    );

    process.on('SIGINT',
      () => {
        void shutdown('SIGINT');
      }
    );
  } catch (error) {
    console.error('Unable to start server.', error);
    await closeDatabaseConnection();
    process.exit(1);
  }
}

void startServer();