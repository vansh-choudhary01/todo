import { useState } from "react";
import type { TodoProps } from "./Todos";
import axios from "axios";

type CreateTodoProps = Omit<TodoProps, "_id" | "user" | "createdAt" | "updatedAt">;

export default function CreateTodo({ setTodos }: { setTodos: React.Dispatch<React.SetStateAction<TodoProps[]>> }) {
    const [todo, setTodo] = useState<CreateTodoProps>({
        title: '',
        description: '',
        toBeCompletedTill: '',
        priority: 'normal',
        completedAt: ''
    });

    function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        event.preventDefault();

        const { name, value } = event.target;

        setTodo((currentTodo) => ({
            ...currentTodo,
            [name]: value
        }));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        try {
        event.preventDefault();

        const res: { data: { data: TodoProps }
    status: number } = await axios.post("http://localhost:4000/api/todo", todo, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.status === 201) {
            alert("Todo created successfully");
            setTodos((currentTodos) => [...currentTodos, res.data.data]);
            setTodo({
                title: '',
                description: '',
                toBeCompletedTill: '',
                priority: 'normal',
                completedAt: ''
            });
        } else {
            alert("Failed to create todo");
        }
    } catch (err) {
        console.error(err);
        alert("Failed to create todo");
    }
}

    return (
        <form onSubmit={handleSubmit} className="create-todo-form">
            <input
                type="text"
                name="title"
                value={todo.title}
                onChange={handleChange}
                placeholder="Title
        "
            />
            <textarea
                name="description"
                value={todo.description}
                onChange={handleChange}
                placeholder="Description"
            />
            <input
                type="date"
                name="toBeCompletedTill"
                value={todo.toBeCompletedTill}
                onChange={handleChange}
                placeholder="To Be Completed"
            />
            <select
                name="priority"
                value={todo.priority}
                onChange={handleChange}
            >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
            </select>
            <button type="submit">Create Todo</button>
        </form>
    );
}