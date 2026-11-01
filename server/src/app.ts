import express from "express";
import morgan from "morgan";
import staticMiddleware from "./middleware/static.middleware.js";

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/user", (_req, res) => {
    res.status(200).json({
      message: "Server is running! Automation working in server too",
    });
  });

  staticMiddleware(app);

  return app;
};

export default createApp;
