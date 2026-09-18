import {type Request, type Response, type NextFunction} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import userModel from "./models/user.js"

type RequestObj = Request & {user?: any};
type JwtRes = JwtPayload & {username: any};

export async function auth(req: RequestObj, res: Response, next: NextFunction) {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else {
            return res.status(401).json({
                status: false,
                message: "unauthorized"
            });
        }

        const user = jwt.verify(token as string, process.env.JWTSECRET as string) as JwtRes;

        if (!user || !user.username) return res.status(401).json({
            status: false,
            message: "unauthorized"
        });

        const userData = await userModel.findOne({username: user.username});

        req.user = userData;
        return next();
    } catch (err) {
        return res.status(500).json({
            status: true,
            message: "internal server error",
            error: err
        })
    }
}