import { runServer } from "@/Server.mjs";
import {
  config,
  populateCommandLineConfig,
  populateEnvironmentConfig
} from "@/config/Config.mjs";
import { initializeLogger, logger } from "@/log/Logger.mjs";
import { Command } from "commander";

const command = new Command();
command.option("-v, --verbose", "Enable verbose log output");
command.parse(process.argv);

populateEnvironmentConfig(config);
populateCommandLineConfig(config, command);

initializeLogger(logger);
await runServer();
