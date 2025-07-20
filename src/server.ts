import {  createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import colors from 'colors'; // Ensure correct import
import config from './app/config';
import { initSocketIO } from './socketIo';
import createDefaultAdmin from './app/DB/createDefaultAdmin';
import logger from './app/helpers/logger';
import cronJob from './app/utils/cornJob';

// Create a new HTTP server
const socketServer = createServer();



let server: Server;

async function main() {
  try {
    // console.log('config.database_url', config.database_url);
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);

    createDefaultAdmin()
    // Start Express server
    // server = app.listen(Number(config.port), config.ip as string, () => {
    cronJob()
    // Start HTTP server
    server = createServer(app);

    server.listen(Number(config.port), () => {
      console.log(
        colors.green(`App is listening on http://${config.ip}:${config.port}`).bold,
      );

    // Initialize Socket.IO
    initSocketIO(socketServer);
    

     
    });
  } catch (err: any) {
    console.error('Error starting the server:', err);
    console.log(err);

    logger.error({
      message: err?.message,
      status: err?.status || 500,
      method: "server-start",
      url: "server-start",
      stack: err?.stack,
    });
    process.exit(1);
  }
}

main();

// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1); // Ensure process exits
});

// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

