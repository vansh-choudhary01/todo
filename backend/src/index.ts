import express, {type Request, type Response} from "express";
import userRouter from "./auth.js";
import todoRouter from "./todo.js";
import mongoose from "mongoose";
import { auth } from "./authenticate.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();

mongoose.connect(process.env.MONGO_URL as string).then(() => {
    console.log("db connected");
})

app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
        status: true,
        message: "working fine"
    });
})

app.use(cors({
    "origin": "http://localhost:5173"
}))
app.use(express.json());

app.use("/api", userRouter);
app.use("/api/todo", auth, todoRouter);

const PORT = process.env.PORT || "4000"

app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`);
});