import { config } from "@/config/Config.mjs";
import { logger } from "@/log/Logger.mjs";
import mongoose from "mongoose";

class MongoDBConnection {
  dbInstance = null;

  constructor() {
    if (MongoDBConnection.dbInstance) {
      return MongoDBConnection.dbInstance;
    }
    this.loggerContext = "MongoDBConnection";
  }

  async connect() {
    if (MongoDBConnection.dbInstance) {
      return MongoDB.dbInstance;
    }

    await mongoose.connect(
      [
        "mongodb+srv://",
        `${config.environment.databaseUser}:${config.environment.databasePassword}`,
        `@${config.environment.databaseCluster}/${config.environment.databaseName}`,
        `?retryWrites=true&w=majority&appName=${config.environment.databaseAppName}`
      ].join("")
    );
    this.dbInstance = mongoose.connection;
    logger.info(
      { context: this.loggerContext },
      `Connected to MongoDB as ${config.environment.databaseUser}`
    );

    return this.dbInstance;
  }

  async closeConnection() {
    if (this.dbInstance) {
      await this.dbInstance.close();
      this.dbInstance = null;
      logger.info({ context: loggerContext }, "Disconnected to MongoDB");
    }
  }
}

export const mongoDBConnection = new MongoDBConnection();
