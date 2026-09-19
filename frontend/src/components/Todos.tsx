import axios from "axios";
import { useState } from "react";
import CreateTodo from "./createTodo";
import { useTodos } from "../App";

export interface TodoProps {
  _id: string;
  title: string;
  description: string;
  toBeCompletedTill: string;
  priority: string;
  createdAt: string;
  completedAt?: string;
}

function Todo({
  _id,
  title,
  description,
  toBeCompletedTill,
  priority,
  createdAt,
  completedAt,
}: TodoProps) {
  const [editing, setEditing] = useState(false);
  const {setTodos} = useTodos();
  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const isChecked = event.target.checked;

    axios.patch("http://localhost:4000/api/todo", {
      todoId: _id,
      completed: isChecked
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleDelete() {
    axios.delete(`http://localhost:4000/api/todo/${_id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then((res) => {
      console.log(res.data);
      setTodos((todos) => todos.filter((todo) => todo._id !== _id));
    }).catch((err) => {
      console.error(err);
    });
  }

  return (
    <div className="diagram">
      <div className="header">
        <h3>{title}</h3>
      </div>

      <div className="small-box blue blue-box">
        {priority}
      </div>

      <div className="label">
        Due: {toBeCompletedTill}
      </div>

      <div className="content">
        <p>{description}</p>
      </div>

      <div className="footer">
        <div className="time">
          Created: {createdAt}
        </div>

        <div className="time">
          <input type="checkbox" checked={!!completedAt} onChange={handleCheckboxChange} />
          Completed: {completedAt || "Not completed"}
        </div>
      </div>

      <button className="delete-button" onClick={handleDelete}>Delete</button>
      {editing ? <CreateTodo editTodo={{_id, title, priority, toBeCompletedTill, description, createdAt, completedAt, setEditing} as TodoProps & {setEditing: React.Dispatch<React.SetStateAction<Boolean>>}}></CreateTodo> : 
        <button className="edit-button" onClick={() => setEditing((prev) => !prev)}>Edit</button>
      }
    </div>
  );
}

export default Todo;