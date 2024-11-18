import dotenv from "dotenv";

import express from "express";
import fs from "fs";
import path from "path";

import morgan from "morgan";
import { fileURLToPath } from "url";
import winston from "winston";
import connectDB from "./configs/db.js";
import projectRoutes from "./routes/project.routes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Morgan logging to access.log
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

connectDB();
app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/projects", projectRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    health: "OK",
    machine: {
      Host: `${req.hostname}`,
      IP: `${req.ip}`,
      OS: `${process.platform}`,
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`URL: http://localhost:${PORT}`);
});
