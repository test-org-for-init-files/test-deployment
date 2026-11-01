import createApp from "./app.js";
import { config } from "dotenv";

config({ quiet: true });

const startServer = () => {
  const app = createApp();

  app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
  });
};

startServer();
