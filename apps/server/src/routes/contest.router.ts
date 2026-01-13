import { contestController } from "@/controller/contest.controller";
import { authMiddleware } from "@/middleware/auth.middleware";
import { roleMiddleware } from "@/middleware/role.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["creator"]), contestController.createContest);

router.get("/:id", authMiddleware, contestController.getContest);

router.post("/:id/mcq", authMiddleware, roleMiddleware(["creator"]), contestController.createContestMcq);

router.post("/:id/mcq/:mcqId/submit", authMiddleware, roleMiddleware(["contestee"]), contestController.submitContestMcq);

router.post("/:id/dsa", authMiddleware, roleMiddleware(["creator"]), contestController.createContestDsa);

export default router;