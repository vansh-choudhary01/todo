import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    discription: {
        type: String,
    },
    toBeCompletedTill: {
        type:Date
    },
    priority: {
        type:String,
        enum: ['normal', 'medium', 'high']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true,
})

export default mongoose.model("todo", todoSchema);