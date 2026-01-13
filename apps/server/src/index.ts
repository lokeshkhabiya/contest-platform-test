import { env } from "@contest-platform-assignment/env/server";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.router"
import contestRouter from "./routes/contest.router";
import problemsRouter from "./routes/problems.router";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth", authRouter);
app.use("/api/contests", contestRouter);
app.use("/api/problems", problemsRouter);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
