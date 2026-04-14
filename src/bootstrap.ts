import dotenv from "dotenv";

// load env FIRST
dotenv.config({
  path: "../.env",
});

// now safe to import everything else
import "./server";