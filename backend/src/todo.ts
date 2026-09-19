import { Router, type Request, type Response } from "express";
import todoModel from "./models/todo.js"
import z from "zod";
import mongoose from "mongoose";

const todoRouter = Router();

todoRouter.post("/", async (req: Request, res: Response) => {
    try {
        const {title, description, toBeCompletedTill, priority} = req.body;
        const user = req.user;

        const todo = await todoModel.create({title, description, toBeCompletedTill, priority, user: user._id});

        res.status(201).json({
            status: true,
            message: "Todo created successfully",
            data: todo
        })
    } catch (err) {
        res.status(500).json({
            status: "false",
            message: "internal server error",
            error: err
        })
    }
});
interface FailterObj {
    createdAt: {
        "$gte": string,
        "$lte": string
    };
    priority?: NonNullable<"normal" | "medium" | "high" | null | undefined>;
    completedAt?: { $ne: null } | null | undefined;
    user: mongoose.Types.ObjectId;
}

const quearyValidater = z.object({
    page: z.string().default("1"),
    limit: z.string().default("10"),
    stDate: z.string(),
    endDate: z.string(),
    priority: z.enum(["normal", "medium", "high"]).optional(),
    completed: z.enum(["true", "false"]).optional()
})

todoRouter.get("/", async (req: Request, res: Response) => {
    try {
        const queary = req.query;
        const validate = quearyValidater.safeParse(queary);

        if (!validate.success) {
            console.log(validate.error);
            return res.status(400).json({
                status: false,
                message: "queary validation error"
            });
        }

        const {page, limit, stDate, endDate, priority, completed} = validate.data;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const user = req.user;

        const filter: FailterObj = {
            createdAt: {$gte: stDate, $lte: endDate},
            user: user._id
        }
        if (priority) filter.priority = priority;
        if (completed) filter.completedAt = completed === "true" ? {$ne: null} : null;

        const todos = await todoModel.find(filter).skip((pageNum - 1) * limitNum).limit(limitNum);

        return res.status(200).json({
            status: true,
            message: "Todos fetched successfully",
            data: todos
        });
        
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: "internal server error",
            error: err
        })
    }
})

todoRouter.patch("/", async (req: Request, res: Response) => {
    try {
        const {title, description, toBeCompletedTill, priority, todoId, completed} = req.body;
        const user = req.user;

        const todo = await todoModel.findOne({_id: todoId, user: user._id});

        if (!todo) return res.status(404).json({
            status: false,
            message: 'Todo not found'
        });

        if (title) todo.title = title;
        if (description) todo.description = description;
        if (toBeCompletedTill) todo.toBeCompletedTill = toBeCompletedTill;
        if (priority) todo.priority = priority;
        if (completed === true || completed === "true") todo.completedAt = new Date();

        await todo.save();
        return res.status(200).json({
            status: true,
            message: "Todo updated successfully",
            data: todo
        })
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: "internal server error",
            error: err
        })
    }
})

todoRouter.delete("/:todoId", async (req: Request, res: Response) => {
    try {
        const {todoId} = req.params;
        const user = req.user;

        const todo = await todoModel.findOneAndDelete({_id: todoId, user: user._id});

        if (!todo) return res.status(404).json({
            status: false,
            message: 'Todo not found'
        });

        return res.status(200).json({
            status: true,
            message: "Todo deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: "internal server error",
            error: err
        })
    }
})

export default todoRouter;