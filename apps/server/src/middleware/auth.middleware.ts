import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validateToken = async (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded;
};

export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        role: "creator" | "contestee";
    };
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "UNAUTHORIZED",
            });
        }

        const decoded = await validateToken(token);

        (req as AuthenticatedRequest).user = decoded as {
            userId: string;
            role: "creator" | "contestee";
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            data: null,
            error: "UNAUTHORIZED",
        });
    }
};
