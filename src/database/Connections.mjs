import { AbstractDatabase } from "@/database/Abstract.mjs";
import { logger } from "@/log/Logger.mjs";
import mongoose from "mongoose";

export class MongoDBConnection extends AbstractDatabase {
  static #instance = null;
  static #initializationSymbol = "*";
  static #loggerContext = "MongoDBConnection";
  static #user;
  static #password;
  static #dbCluster;
  static #dbName;
  static #dbAppName;

  constructor({
    user,
    password,
    dbCluster,
    dbName,
    dbAppName,
    symbol,
    dbType
  }) {
    if (symbol !== MongoDBConnection.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton MongoDBConnection class via constructor"
      );
    }
    super({ dbType: dbType });
    MongoDBConnection.#user = user;
    MongoDBConnection.#password = password;
    MongoDBConnection.#dbCluster = dbCluster;
    MongoDBConnection.#dbName = dbName;
    MongoDBConnection.#dbAppName = dbAppName;
  }

  static async connect(user, password, dbCluster, dbName, dbAppName) {
    if (!MongoDBConnection.#instance) {
      new MongoDBConnection({
        user,
        password,
        dbCluster,
        dbName,
        dbAppName,
        symbol: MongoDBConnection.#initializationSymbol,
        dbType: "MongoDB"
      });

      await mongoose.connect(
        [
          "mongodb+srv://",
          `${MongoDBConnection.#user}:${MongoDBConnection.#password}`,
          `@${MongoDBConnection.#dbCluster}/${MongoDBConnection.#dbName}`,
          `?retryWrites=true&w=majority&appName=${MongoDBConnection.#dbAppName}`
        ].join("")
      );

      MongoDBConnection.#instance = mongoose.connection;
      logger.info(
        { context: MongoDBConnection.#loggerContext },
        `Connected to MongoDB as ${MongoDBConnection.#user}`
      );
    }

    return MongoDBConnection.#instance;
  }

  // reserved for test db
  static async getNewConnection(user, password, dbCluster, dbName, dbAppName) {
    if (MongoDBConnection.#instance) {
      await MongoDBConnection.closeConnection(); // discard old instance and initiate a new one
      MongoDBConnection.#instance = null;
    }

    await MongoDBConnection.connect(
      user,
      password,
      dbCluster,
      dbName,
      dbAppName
    );
  }

  static async clearCollection(collectionName) {
    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
    logger.info(
      { context: MongoDBConnection.#loggerContext },
      `Cleared collection ${collectionName}`
    );
  }

  static async clearDB() {
    // const db = MongoDBConnection.#instance;
    const collections = Object.keys(MongoDBConnection.#instance.collections);

    await Promise.all(
      collections.map(async (collectionName) => {
        const collection =
          MongoDBConnection.#instance.collections[collectionName];
        await collection.deleteMany({});
      })
    );
    logger.info({ context: MongoDBConnection.#loggerContext }, `Cleared DB`);
  }

  static dropDB() {
    MongoDBConnection.#instance.dropDatabase();
    logger.info({ context: MongoDBConnection.#loggerContext }, `Dropped DB`);
  }

  static async closeConnection() {
    if (MongoDBConnection.#instance) {
      await MongoDBConnection.#instance.close();
      MongoDBConnection.#instance = null;
      logger.info(
        { context: MongoDBConnection.#loggerContext },
        "Disconnected to MongoDB"
      );
    }
  }
}
