import Todo, { type TodoProps } from './components/Todos';
import axios from 'axios';
import CreateTodo from "./components/createTodo";
import { createContext, useContext, useEffect, useState } from 'react';
const backendUrl = import.meta.env.VITE_REACT_BACKEND_URL;

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

type filter = {
  page: number;
  limit: number;
  stDate: string;
  endDate: string;
  completed: string | undefined
}

function TodoList() {
  const context = useContext(TodoContext);
  const { todos, setTodos } = context!;
  const [filter, setFilter] = useState<filter>({
    page: 1,
    limit: 10,
    stDate: new Date(Date.now()).setHours(0, 0, 0, 0).toString(),
    endDate: new Date(Date.now()).setHours(23, 59, 59, 999).toString(),
    completed: undefined
  })

  useEffect(() => {
    try {
      axios.get(`https://todo-ybuz.naaspeeti.xyz/api/todo`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          params: filter
        },
      ).then((res) => {
        setTodos(res.data.data);
      }).catch((err) => {
        console.error(err);
      });
    } catch (err) {
      console.error(err);
    }
  }, [filter]);

  return (
    <div className="App">
      <CreateTodo />
      <div className="todo-list">
        <input type="date" value={filter.stDate} onChange={(event) => setFilter((filter) => { return { ...filter, page: 1, stDate: event.target.value } })}></input>
        <input type="date" value={filter.endDate} onChange={(event) => setFilter((filter) => { return { ...filter, page: 1, endDate: event.target.value } })}></input>
        <select name='completedSelect' value={filter.completed} onChange={(event) => setFilter((filter) => { return { ...filter, page: 1, completed: event.target.value === "" ? undefined : event.target.value } })}>
          <option value="">All</option>
          <option value="true">completed Only</option>
          <option value="false">Not completed</option>
        </select>
        {todos.map((todo) => (
          <Todo key={todo._id} {...todo} />
        ))}
      </div>
      <div className="pagination">
        <button disabled={filter.page === 1} onClick={() => setFilter((filter) => { return { ...filter, page: filter.page - 1 } })}>
          Prev
        </button>
        <button disabled={todos.length % 10 != 0} onClick={() => setFilter((filter) => { return { ...filter, page: filter.page + 1 } })}>
          Next
        </button>
      </div>
    </div>
  );
}

function Project() {
  let [token, setToken] = useState(localStorage.getItem('token'));
  console.log("token", token)
  let [screen, setScreen] = useState("login");

  if (!token) {
    return (
      <div className="App">
        {screen === "login" ? <>
          <h1>Please login to view your todos</h1>
          <div>
            <h1>Login</h1>
            <form onSubmit={async (e) => {
              try {
              e.preventDefault();

              const formData = new FormData(e.currentTarget);
              const username = formData.get('username') as string;
              const password = formData.get('password') as string;

              const res: { data: { token: string }, status: number } = await axios.post(`https://todo-ybuz.naaspeeti.xyz/api/login`, {
                username,
                password
              });

              if (res.status === 200) {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token)
              } else {
                alert("Login failed");
              }
            } catch (err) {
              alert("Login failed");
            }
            }}>
              <input type="text" name="username" placeholder="Username" />
              <input type="password" name="password" placeholder="Password" />
              <button type="submit">Login</button>
            </form>
          </div>
        </> :
          <>
            <h1>Please register to view your todos</h1>
            <div>
              <h1>Register</h1>
              <form onSubmit={async (e) => {
                try {
                  e.preventDefault();

                  const formData = new FormData(e.currentTarget);
                  const username = formData.get('username') as string;
                  const password = formData.get('password') as string;

                  const res: { data: { token: string }, status: number } = await axios.post(`https://todo-ybuz.naaspeeti.xyz/api/signup`, {
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
          </>
        }
        <div>
          <button onClick={() => setScreen(prev => prev === "login" ? "register" : "login")}>
            {screen === "login" ? "switch to register" : "switch to login"}
          </button>
        </div>
      </div>
    )

  } else {
    return (
      <div className="App">
        <div>

          <h1>Your Todos</h1>
          <button onClick={() => { localStorage.removeItem('token'); setToken(null); }}>logout</button>
        </div>
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