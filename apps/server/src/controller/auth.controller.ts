import { loginSchema, signupSchema } from "@/utils/types";
import prisma from "@contest-platform-assignment/db";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const signup = async (req: Request, res: Response) => {
    try {
        const { success, data } = signupSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const { name, email, password, role } = data;

        const checkExistingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (checkExistingUser) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "EMAIL_ALREADY_EXISTS",
            });
        }

        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashPassword,
                role: role || "contestee",
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while signup:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { success, data } = loginSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const { email, password } = data;

        const checkExistingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!checkExistingUser) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "INVALID_CREDENTIALS",
            });
        }

        const verifyPassword = await bcrypt.compare(
            password,
            checkExistingUser.password
        );

        if (!verifyPassword) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "INVALID_CREDENTIALS",
            });
        }

        const token = jwt.sign(
            { userId: checkExistingUser.id, role: checkExistingUser.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
		
        return res.status(200).json({
            success: true,
            data: {
                token: token,
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while login:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

export const authController = {
    signup,
    login,
};
