import { staticConfig } from "!config";
import { camelToUpper } from "@/util/Naming.mjs";
import dotenv from "dotenv";

const environmentConfig = {
  port: "",
  development: "",
  databaseUser: "",
  databasePassword: "",
  databaseCluster: "",
  databaseName: "",
  databaseAppName: "",
  jwtPreSharedKey: "",
  testDatabaseUser: "",
  testDatabasePassword: "",
  testDatabaseCluster: "",
  testDatabaseName: "",
  testDatabaseAppName: ""
};

const commandLineConfig = {
  verbose: undefined
};

export const config = {
  ...staticConfig,
  environment: environmentConfig,
  commandLine: commandLineConfig
};

export function populateEnvironmentConfig(config) {
  dotenv.config();

  for (const key of Object.keys(config.environment)) {
    const environmentVariableKey = camelToUpper(key);
    config.environment[key] = process.env[environmentVariableKey];
  }
}

export function populateCommandLineConfig(config, command) {
  const options = command.opts();
  for (const key of Object.keys(config.commandLine)) {
    config.commandLine[key] = options[key];
  }
}
