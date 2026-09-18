import axios from "axios";

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
      window.location.reload();
    }).catch((err) => {
      console.error(err);
    });
  }

  function handleEdit(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    try {
    event.preventDefault();
    const { value, name } = event.target;
    
    axios.patch("http://localhost:4000/api/todo", {
      todoId: _id,
      [name]: value
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
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
    </div>
  );
}

export default Todo;