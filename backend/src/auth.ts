import {Router, type Request, type Response} from "express";
import userModel from "./models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userRouter = Router();

userRouter.post("/signup", async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body;

        const saltRounds = 10;

        const hashpass = await bcrypt.hash(password, saltRounds);

        const user = await userModel.create({username, password: hashpass});

        return res.status(201).json({
            status: true,
            message: "signup successfull",
            data: user
        });
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: err as any
        });
    }
})

userRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body;

        const user = await userModel.findOne({username: username});

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "user isn't availabe, wrong username or password"
            });
        }

        const compare = await bcrypt.compare(password, user.password as string);

        if (!compare) {
            return res.status(401).json({
                status: false,
                message: "username or password is wrong"
            });
        }

        const token = jwt.sign({
            username: user.username
        }, process.env.JWTSECRET as string, { expiresIn: '7d' });

        return res.status(200).json({
            status: true,
            message: "login successfully",
            token: token
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: err
        });
    }
});

export default userRouter;