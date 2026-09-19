import { useState } from "react";
import type { TodoProps } from "./Todos";
import axios from "axios";
import { useTodos } from "../App";
const backendUrl = import.meta.env.VITE_REACT_BACKEND_URL;

type CreateTodoProps = Omit<TodoProps, "_id" | "user" | "createdAt" | "updatedAt">;

export default function CreateTodo({ editTodo }: { editTodo?: TodoProps & {setEditing: React.Dispatch<React.SetStateAction<Boolean>>} }) {
    const {setTodos} = useTodos();
    console.log(editTodo);
    const [todo, setTodo] = useState<CreateTodoProps>({
        title: editTodo ? editTodo.title : '',
        description: editTodo ? editTodo.description : '',
        toBeCompletedTill: editTodo ? editTodo.toBeCompletedTill : '',
        priority: editTodo ? editTodo.priority : 'normal',
        completedAt: editTodo ? editTodo.completedAt : ''
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
    status: number } = editTodo ? await axios.patch(`https://todo-ybuz.naaspeeti.xyz/api/todo`, {...todo, todoId: editTodo._id}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }) : await axios.post(`https://todo-ybuz.naaspeeti.xyz/api/todo`, todo, {
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
        } else if (editTodo && res.status === 200) {
            alert("Todo updated successfully");
            setTodos((currentTodos) => currentTodos.map((curr) => curr._id === editTodo._id ? res.data.data : curr));
            setTodo({
                title: '',
                description: '',
                toBeCompletedTill: '',
                priority: 'normal',
                completedAt: ''
            });
            editTodo.setEditing(false);
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
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
            <button type="submit">{editTodo ? "Update Todo" : "Create Todo"}</button>
        </form>
    );
}