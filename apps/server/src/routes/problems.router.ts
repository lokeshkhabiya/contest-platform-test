import { problemsController } from "@/controller/problems.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/:problemId", authMiddleware, problemsController.getProblem);

export default router;