import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { token_details, User, resetToken_details } from "../interfaces/user.interface";

export interface extendedRequest extends Request {
    info?: token_details;
    reset_info?: resetToken_details;
}

export const verifyToken = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['token'] as string;

        if (!token) {
            return res.status(401).json({
                error: "You do not have access"
            });
        }

        let data = jwt.verify(token, process.env.SECRET_KEY as string) as token_details;

        req.info = data;

        next();
    } catch (error) {
        return res.status(401).json({
            error: "Invalid token"
        });
    }   
};

export const authorizeAttendee = (req: extendedRequest, res: Response, next: NextFunction) => {
    if (req.info?.role === 'attendee') {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Attendees only." });
};

export const authorizeManager = (req: extendedRequest, res: Response, next: NextFunction) => {
    if (req.info?.role === 'manager') {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Managers only." });
};

export const authorizeSuperAdmin = (req: extendedRequest, res: Response, next: NextFunction) => {
    if (req.info?.role === 'super_admin') {
        return next();
    }
    return res.status(403).json({ error: "Access denied. Super admins only." });
};
