import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";


const start = async () => {
  await connectDB();


  app.listen(5000, "0.0.0.0", () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

start();