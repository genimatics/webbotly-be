import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { id: string };
}
interface JwtPayloadWithUser {
    id: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token!,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload & JwtPayloadWithUser;

        req.user = { id: decoded.id };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};