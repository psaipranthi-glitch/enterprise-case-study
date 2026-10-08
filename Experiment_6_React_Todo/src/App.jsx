import { useEffect, useState } from "react";

function App() {
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem("tasks");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [task, setTask] = useState("");

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    function addTask(event) {
        event.preventDefault();
        const text = task.trim();
        if (!text) return;

        setTasks(previous => [
            ...previous,
            { id: Date.now(), text, completed: false }
        ]);
        setTask("");
    }

    function toggleTask(id) {
        setTasks(previous =>
            previous.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            )
        );
    }

    function deleteTask(id) {
        setTasks(previous => previous.filter(item => item.id !== id));
    }

    function clearCompleted() {
        setTasks(previous => previous.filter(item => !item.completed));
    }

    const completedCount = tasks.filter(item => item.completed).length;

    return (
        <main className="todo">
            <h1>Pyata Sai Pranathi's ToDo App</h1>
            <p>Roll No: 160124748016</p>

            <form onSubmit={addTask}>
                <input
                    value={task}
                    onChange={event => setTask(event.target.value)}
                    placeholder="Enter a task"
                    aria-label="Task"
                />
                <button type="submit">Add</button>
            </form>

            <div className="summary">
                {tasks.length} task(s) | {completedCount} completed
            </div>

            {tasks.length === 0 && <p>No tasks yet. Add your first task.</p>}

            {tasks.map(item => (
                <div className="task" key={item.id}>
                    <span
                        className={item.completed ? "done" : ""}
                        onClick={() => toggleTask(item.id)}
                        role="button"
                        tabIndex="0"
                    >
                        {item.text}
                    </span>
                    <button type="button" onClick={() => deleteTask(item.id)}>
                        Delete
                    </button>
                </div>
            ))}

            {completedCount > 0 && (
                <button type="button" onClick={clearCompleted}>
                    Clear Completed
                </button>
            )}
        </main>
    );
}

export default App;
