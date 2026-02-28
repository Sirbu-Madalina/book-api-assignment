import express, { Application, Request, Response } from "express";
import dotenvFlow from "dotenv-flow";
import { testConnection } from './repository/database';
import routes from './routes';
import { setupDocs } from "./util/documentation";
import cors from 'cors';

dotenvFlow.config();

const app: Application = express();

//CORS Setup
function setupCors(){
  app.use(cors({
    //Allow request from any origin
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

    //Allow methods 
    methods:'GET, PUT, POST, DELETE',

    //Allow Headers
    allowedHeaders: ['auth-token', 'Origin', 'X-Request-Width', 'Content-Type', 'Accept'],

    //Allow credentials
    credentials:true
  }))
}


export function startServer() {

  setupCors();
  
//makes the app understand json
  app.use(express.json());

  app.use('/api', routes);

  setupDocs(app);

//test connection to the database
  testConnection();

  const PORT: number = parseInt (process.env.PORT as string) || 4000;
  app.listen(PORT, function() {
    console.log("Server running on port: " + PORT);
  });
}

