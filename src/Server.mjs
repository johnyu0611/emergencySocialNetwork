import cors from "cors";
import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { logger } from "@/log/Logger.mjs";
import { config } from "@/config/Config.mjs";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authRouter } from "@/route/api.mjs";

dotenv.config();

// const uri = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASS)}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=FSE`;
const url = 'mongodb+srv://laineyl:123@fse.qw9qk.mongodb.net/?retryWrites=true&w=majority&appName=FSE'

mongoose.connect(url)
  .then(() => 
    console.log('MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

const loggerContext = "Server";

export async function runServer() {
  logger.debug({ context: loggerContext }, "Setting up Server");
  
  const app = express();
  
  app.use(express.json());
  app.use('/api/auth', authRouter);
 
  
  app.use(express.static(config.server.staticFolder));

  const server = createServer(app);
  const io = new Server(server, {
    path: `${config.server.apiBasePath}/socket.io/`
  });

  // Set up CORS
  if (config.environment.development === "true") {
    app.use(cors());
    logger.warn({ context: loggerContext }, "CORS middleware enabled globally");
  }
  

  const { port } = config.server;
  server.listen(port, () => {
    logger.info({ context: loggerContext }, "Server is listening at port %d", port);
  });
}