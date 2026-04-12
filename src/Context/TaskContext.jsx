import { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.tasks);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // ---- PERSIST ----
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    }, [tasks]);

    // ---- ADD ----
    const addTask = (text, priority, dueDate) => {
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            done: false,
            priority,
            dueDate: dueDate || null
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    // ---- TOGGLE DONE ----
    const toggleDone = (id) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    // ---- DELETE ----
    const deleteTask = (id) =>
        setTasks((prev) => prev.filter((t) => t.id !== id));

    // ---- EDIT ----
    const editTask = (id, newText) => {
        if (!newText.trim()) {
            deleteTask(id);
            return;
        }
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, text: newText.trim() } : t))
        );
    };

    // ---- CLEAR COMPLETED ----
    const clearCompleted = () =>
        setTasks((prev) => prev.filter((t) => !t.done));

    return (
        <TaskContext.Provider value={{ tasks, addTask, toggleDone, deleteTask, editTask, clearCompleted }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}
