import { app } from './app.js';
import { environment } from './config/environment.js';
import {
  checkDatabaseConnection,
  closeDatabaseConnection
} from './config/database.js';

const HOST = '0.0.0.0';

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();

    const server = app.listen(
      environment.port,
      HOST,
      () => {
        console.log(`back-actions running on ${HOST}:${environment.port}`);
      }
    );

    let isShuttingDown = false;

    const shutdown = async (signal: string): Promise<void> => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      console.log(`${signal} received. Shutting down server.`);

      server.close(
        async (error?: Error) => {
          if (error) {
            console.error('Unable to close HTTP server.', error);

            await closeDatabaseConnection();
            process.exit(1);
          }

          try {
            await closeDatabaseConnection();

            console.log('PostgreSQL connection pool closed.');

            process.exit(0);
          } catch (shutdownError) {
            console.error('Unable to close PostgreSQL connection pool.', shutdownError);

            process.exit(1);
          }
        }
      );
    };

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    }
    );

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    }
    );
  } catch (error) {
    console.error('Unable to start server.', error);

    try {
      await closeDatabaseConnection();
    } catch (shutdownError) {
      console.error(
        'Unable to close PostgreSQL connection pool after startup failure.',
        shutdownError
      );
    }

    process.exit(1);
  }
}

void startServer();