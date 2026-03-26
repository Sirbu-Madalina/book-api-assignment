import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import routes from "./routes";
import { setupDocs } from "./util/documentation";
import { testConnection } from "./repository/database";

dotenvFlow.config();

const app: Application = express();

function setupCors() {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      methods: "GET, PUT, POST, DELETE",
      allowedHeaders: [
        "auth-token",
        "Origin",
        "X-Request-Width",
        "Content-Type",
        "Accept",
      ],
      credentials: true,
    })
  );
}

setupCors();
app.use(express.json());
app.use("/api", routes);
setupDocs(app);

export async function startServer() {
  await testConnection();

  const PORT: number = parseInt(process.env.PORT as string) || 4000;

  app.listen(PORT, function () {
    console.log("Server running on port: " + PORT);
  });
}

export default app;