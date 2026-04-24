import { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";

const TaskContext = createContext();

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.tasks);
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(
                (t) => t && typeof t === "object" && typeof t.id !== "undefined"
            );
        } catch {
            return [];
        }
    });

    // ---- PERSIST ----
    useEffect(() => {
        if (!Array.isArray(tasks)) return;
        try {
            localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
        } catch (err) {
            console.error("Failed to persist tasks:", err);
        }
    }, [tasks]);


    // ---- ADD ----
    const addTask = (text, priority, dueDate, notes, subtasks = []) => {
        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            done: false,
            priority,
            dueDate: dueDate || null,
            notes: notes ? notes.trim() : "",
            subtasks
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    // ---- RESTORE ----
    const restoreTask = (task) => {
        setTasks((prev) => [task, ...prev]);
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

    // ---- UPDATE TASK ----
    const updateTask = (id, updates) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    // ---- CLEAR COMPLETED ----
    const clearCompleted = () =>
        setTasks((prev) => prev.filter((t) => !t.done));

    return (
        <TaskContext.Provider value={{ tasks, addTask, restoreTask, toggleDone, deleteTask, editTask, clearCompleted, updateTask }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    return useContext(TaskContext);
}
