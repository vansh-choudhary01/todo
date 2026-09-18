import Todo, { type TodoProps } from './components/Todos';
import axios from 'axios';
import CreateTodo from "./components/createTodo";
import { createContext, useContext, useEffect, useState } from 'react';

type TodoContextType = {
  todos: TodoProps[],
  setTodos: React.Dispatch<React.SetStateAction<TodoProps[]>>;
}

export const TodoContext = createContext<TodoContextType | null>(null);

function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<TodoProps[]>([]);

  return (
    <TodoContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodoContext)!;

  return context;
}

function TodoList() {
  const context = useContext(TodoContext);
  const {todos, setTodos} = context!;
  
  useEffect(() => {
    try {
    axios.get('http://localhost:4000/api/todo',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          page: "1",
          limit: "10",
          stDate: new Date(Date.now()).setHours(0, 0, 0, 0).toString(),
          endDate: new Date(Date.now()).setHours(23, 59, 59, 999).toString(),
          completed: "false"
        }
      },
    ).then((res) => {
      setTodos(res.data.data);
    }).catch((err) => {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
  }, []);

  return (
    <div className="App">
      <CreateTodo />
      <div className="todo-list">
        {todos.map((todo) => (
        <Todo key={todo._id} {...todo} />
      ))}
      </div>
    </div>
  );
}

function Project() {
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="App">
        <h1>Please login to view your todos</h1>
        <div>
          <h1>Login</h1>
          <form onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;

            const res: { data: { token: string }, status: number } = await axios.post("http://localhost:4000/api/login", {
              username,
              password
            });

            if (res.status === 200) {
              localStorage.setItem('token', res.data.token);
              window.location.reload();
            } else {
              alert("Login failed");
            }
          }}>
            <input type="text" name="username" placeholder="Username" />
            <input type="password" name="password" placeholder="Password" />
            <button type="submit">Login</button>
          </form>
        </div>
        <div>
          <h1>Register</h1>
          <form onSubmit={async (e) => {
            try {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;

            const res: { data: { token: string }, status: number } = await axios.post("http://localhost:4000/api/signup", {
              username,
              password
            });

            if (res.status === 201) {
              alert("Registration successful, please login");
            } else {
              alert("Registration failed");
            }
          } catch (err) {
            alert("Registration failed");
          }
          }}>
            <input type="text" name="username" placeholder="Username" />
            <input type="password" name="password" placeholder="password" />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    )
  } else {
    return (
      <div className="App">
        <h1>Your Todos</h1>
        <TodoList />
      </div>
    )
  }
}

function App() {
  return (
    <TodoProvider>
      <Project />
    </TodoProvider>
  );
}
export default App;