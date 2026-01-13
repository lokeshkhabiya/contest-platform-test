import { authController } from "@/controller/auth.controller";
import express, { Router } from "express";

const router: Router = express.Router(); 

router.post("/signup", authController.signup); 
router.post("/login", authController.login); 

export default router;