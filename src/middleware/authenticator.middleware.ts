import UserModel from "../model/user.model";
import { errorLogger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import EventModel from "../model/event.model";

dotenv.config();


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing or malformed" });
    }
    const token = authHeader.split(" ")[1];

    try {
        const secret = process.env.JWT_SECRETE;
        if (!secret) {
            throw new Error("JWT secret not configured");
        }
        const decoded = jwt.verify(token, secret) as { userId: string };

        console.log(decoded);
        

        const user = await UserModel.findById(decoded.userId);
        console.log(user);
        
        if (!user) {
            return res.status(401).json({ message: "Invalid token: user not found" });

        }
        // attach user to request object
        (req as any).userId = user.id;
        next();
    } catch (error) {
        errorLogger.error({ error }, "Authentication error");
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


export const hasAccess = async (req: Request, res: Response, next: NextFunction) => {
    const userId: string = (req as any).userId;
    const eventId = req.params.id;
    try {
        const event = await EventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (event.createddBy !== userId) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
        }
        next();
    } catch (error) {
        errorLogger.error({ error }, "Authorization error");
        return res.status(500).json({ message: "Internal server error" });
    }
};
    


