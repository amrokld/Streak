import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useHabits } from "../Context/HabitContext";
import { useTasks } from "../Context/TaskContext";
import { getToday } from "../utils/dateHelpers";
import { useLanguage } from "../Context/LanguageContext";

import HabitCard from "../components/HabitCard";
import ConfirmModal from "../components/ConfirmModel";
import Onboarding from "./Onboarding";


export default function Today() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { accent, bg, cardBg, text, subText, borderColor } = getTokens(isDark);
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Contexts
    const { habits, deleteHabit, updateHabit, checkInHabit } = useHabits();
    const { tasks, addTask, toggleDone, deleteTask, updateTask } = useTasks();
    const { setShowNewHabit } = useOutletContext();
    const { showNewHabit } = useOutletContext();
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [showEditPriorityMenu, setShowEditPriorityMenu] = useState(false);
    const [showEditDateMenu, setShowEditDateMenu] = useState(false);

    // Local state
    const [showCompleted, setShowCompleted] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);
    const [habitToEdit, setHabitToEdit] = useState(null);

    // Task Form State
    const [taskText, setTaskText] = useState("");
    const [taskPriority, setTaskPriority] = useState("important");
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);

    const today = getToday();

    // Filtering
    const pendingHabits = habits.filter((h) => h.lastCheck !== today);
    const doneHabits = habits.filter((h) => h.lastCheck === today);

    const overdueTasks = tasks.filter((t) => !t.done && t.dueDate && t.dueDate < today);
    const todayTasks = tasks.filter((t) => !t.done && t.dueDate === today);
    const completedTasks = tasks.filter((t) => t.done && (t.dueDate <= today || !t.dueDate));
    const forceCloseCards = Boolean(habitToDelete || habitToEdit);
    const totalTasks = tasks.filter(t => !t.done || t.done).length;
    const completedTasksCount = tasks.filter(t => t.done).length;

    const totalHabits = habits.length;
    const completedHabitsCount = doneHabits.length;
    const allDone = pendingHabits.length === 0 && overdueTasks.length === 0 && todayTasks.length === 0;

    const sectionTitle = (label, color = subText) => (
        <p style={{ color, fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            {label}
        </p>
    );

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;
        addTask(taskText, taskPriority, today); // Auto-date today
        setTaskText("");
        setShowNewTaskModal(false);
    };

    return (
        <div style={{ backgroundColor: bg, color: text, minHeight: "100vh", padding: "40px 60px" }}>

            {/* 1. HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
                <div>
                    <h1 style={{ fontSize: "52px", fontWeight: 900, letterSpacing: "0.08em", color: accent, lineHeight: 1, textShadow: `0 0 15px ${accent}44` }}>
                        {t("todayTitle")}
                    </h1>
                    <p style={{ color: subText, fontSize: "14px", marginTop: "14px", lineHeight: "1.6" }}>{t("focusSubtitle")}</p>

                    {(totalHabits > 0 || totalTasks > 0) && (
                        <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "4px" }}></div>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => setShowNewHabit(true)}
                        className="group relative overflow-hidden transition-all duration-300 active:scale-95"
                        style={{
                            padding: "8px 18px", background: "none", border: `2px solid ${accent}`,
                            borderRadius: "12px", color: accent, fontSize: "12px", fontWeight: 800, cursor: "pointer"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = accent;
                            e.currentTarget.style.color = isDark ? "#000" : "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = accent;
                        }}
                    >
                        + {t("newHabit")}
                    </button>

                    <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="group transition-all duration-300 active:scale-95"
                        style={{
                            padding: "8px 18px", backgroundColor: accent, border: `2px solid ${accent}`,
                            borderRadius: "12px", color: isDark ? "#000" : "#fff", fontSize: "12px",
                            fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 20px -5px ${accent}44`
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? "#1f1f1f" : "#f2f4f8";
                            e.currentTarget.style.color = accent;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = accent;
                            e.currentTarget.style.color = isDark ? "#000" : "#fff";
                        }}
                    >
                        + {t("tasks")}
                    </button>
                </div>
            </div>

            {/* 2. BODY COLUMNS */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", alignItems: "start" }}>

                {/* LEFT: HABITS */}
                <section>
                    <div style={{ marginBottom: "12px" }}>

                        <p style={{
                            color: accent,
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase"
                        }}>
                            {t("habitsSection")}
                        </p>

                        {totalHabits > 0 && (
                            <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>
                                <span style={{ color: accent, fontWeight: 700 }}>
                                    {completedHabitsCount}
                                </span>
                                {` / ${totalHabits} ${t("completedHabits")}`}
                            </p>
                        )}

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {pendingHabits.map((habit) => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onDeleteRequest={setHabitToDelete}
                                    onEditCategory={setHabitToEdit}
                                    forceClose={forceCloseCards}
                                />
                            ))}
                        </AnimatePresence>
                        {pendingHabits.length === 0 && !allDone && (
                            <p style={{ color: subText, opacity: 0.5, fontStyle: "italic" }}>{t("allHabits")}</p>
                        )}
                    </div>
                </section>

                {/* RIGHT: TASKS */}
                <section>

                    <div style={{ marginBottom: "12px" }}>

                        <p style={{
                            color: accent,
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase"
                        }}>
                            {t("tasks")}
                        </p>

                        {totalTasks > 0 && (
                            <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>
                                <span style={{ color: accent, fontWeight: 700 }}>
                                    {completedTasksCount}
                                </span>
                                {` / ${totalTasks} ${t("Completed tasks")}`}
                            </p>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <AnimatePresence mode="popLayout">
                            {[...overdueTasks, ...todayTasks].map((task) => {
                                const isOverdue = task.dueDate && task.dueDate < today;
                                const isTodayStr = task.dueDate === today;

                                // Priority color helper
                                const getPriorityColor = (p) => {
                                    if (p === "urgent") return "#ef4444";
                                    if (p === "important") return "#f59e0b";
                                    return "#22c55e";
                                };

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        key={task.id}
                                        className="group flex items-center gap-4 p-4 rounded-3xl border transition-colors relative"
                                        style={{
                                            backgroundColor: cardBg,
                                            borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                                        }}
                                    >
                                        {/* Checkbox (Same as Task Page) */}
                                        <div className="flex items-center justify-center cursor-pointer" onClick={() => toggleDone(task.id)}>
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110 shadow-sm"
                                                style={{
                                                    borderColor: task.done ? accent : borderColor,
                                                    backgroundColor: task.done ? accent : "transparent"
                                                }}
                                            >
                                                <AnimatePresence>
                                                    {task.done && (
                                                        <motion.svg
                                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                            className="w-3.5 h-3.5"
                                                            style={{ color: isDark ? "#000" : "#ffffff" }}
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </motion.svg>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Task Title */}
                                        <div className="flex-1 overflow-hidden">
                                            <span
                                                className="text-lg font-medium block truncate"
                                                style={{ color: task.done ? subText : getPriorityColor(task.priority) }}
                                            >
                                                {task.text}
                                            </span>
                                        </div>

                                        {/* Overdue Badge */}
                                        {isOverdue && (
                                            <span
                                                className="text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider"
                                                style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                                            >
                                                {t("overdueSection")}
                                            </span>
                                        )}

                                        {/* Edit Action */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 ml-2"
                                            style={{ color: subText }}
                                            onClick={() => setTaskToEdit(task)}
                                        >
                                            <svg className="w-5 h-5 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>

                                        {/* Delete Action */}
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110 ml-2"
                                            style={{ color: subText }}
                                            onClick={() => deleteTask(task.id)}
                                        >
                                            <svg className="w-5 h-5 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </section>
            </div>

            {/* 3. EMPTY STATE */}
            {allDone && (
                <div style={{ textAlign: "center", marginTop: "100px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>✦</div>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: accent }}>{t("doneForToday")}</h2>
                    <p style={{ color: subText }}>{t("restWell")}</p>
                </div>
            )}

            {/* 4. COMPLETED SECTION */}
            <div style={{ marginTop: "60px", borderTop: `1px solid ${borderColor}`, paddingTop: "20px" }}>
                <button onClick={() => setShowCompleted(!showCompleted)} style={{ background: "none", border: "none", color: subText, fontSize: "13px", cursor: "pointer" }}>
                    {showCompleted ? t("hideCompletedLink") : t("showCompletedLink")}
                </button>

                <AnimatePresence>
                    {showCompleted && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "60px" }}>
                                {/* Completed Habits Column */}
                                <div>
                                    {sectionTitle(t("completedHabits"))}
                                    <div className="flex flex-col gap-2 opacity-50">
                                        {doneHabits.map(habit => (
                                            <div key={habit.id} style={{ backgroundColor: cardBg, padding: "12px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ textDecoration: "line-through" }}>{habit.name}</span>
                                                <span>🔥 {habit.streak}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Completed Tasks Column */}
                                <div>
                                    {sectionTitle(t("completedTasks"))}
                                    <div className="flex flex-col gap-2 opacity-50">
                                        {completedTasks.map(task => (
                                            <div key={task.id} style={{ backgroundColor: cardBg, padding: "12px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ textDecoration: "line-through" }}>{task.text}</span>
                                                <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: accent }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 5. NEW TASK MODAL */}
            {showNewTaskModal && createPortal(
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md animate-fade-in"
                    style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)" }}
                    onClick={() => setShowNewTaskModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="w-full max-w-md p-10 rounded-[32px] border relative"
                        style={{
                            backgroundColor: cardBg,
                            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                            boxShadow: isDark
                                ? `0 0 50px ${accent}20, 0 30px 60px rgba(0, 0, 0, 0.8)`
                                : `0 0 40px ${accent}30, 0 30px 60px rgba(0, 0, 0, 0.15)`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: "28px", fontWeight: 900, color: accent, marginBottom: "8px", textAlign: "center" }}>
                            {t("whatNeedsDone")}
                        </h2>
                        <p style={{ color: subText, fontSize: "14px", marginBottom: "32px", textAlign: "center" }}>
                            Adding to your list for {today}
                        </p>

                        <form onSubmit={handleAddTask}>
                            <input
                                autoFocus
                                value={taskText}
                                onChange={(e) => setTaskText(e.target.value)}
                                placeholder={t("habitPlaceholder")}
                                className="w-full mb-6 px-6 py-4 rounded-2xl text-lg font-medium outline-none transition-all"
                                style={{
                                    backgroundColor: isDark ? "#3a3a3a" : "#f1f5f9",
                                    color: text,
                                    border: `2px solid transparent`
                                }}
                                onFocus={(e) => e.target.style.borderColor = accent}
                                onBlur={(e) => e.target.style.borderColor = "transparent"}
                            />

                            <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
                                {["urgent", "important", "optional"].map(p => {
                                    const colors = { urgent: "#ef4444", important: "#f59e0b", optional: "#22c55e" };
                                    const isActive = taskPriority === p;
                                    return (
                                        <button
                                            type="button"
                                            key={p}
                                            onClick={() => setTaskPriority(p)}
                                            style={{
                                                flex: 1, padding: "12px", borderRadius: "14px",
                                                border: `1px solid ${isActive ? colors[p] : borderColor}`,
                                                backgroundColor: isActive ? `${colors[p]}15` : "transparent",
                                                color: isActive ? colors[p] : subText,
                                                fontWeight: 800, fontSize: "12px", textTransform: "uppercase",
                                                letterSpacing: "0.05em", transition: "all 0.2s"
                                            }}
                                        >
                                            {t(p)}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95"
                                style={{
                                    backgroundColor: taskText.trim() ? accent : (isDark ? "#444" : "#e5e7eb"),
                                    color: taskText.trim() ? (isDark ? "#000" : "#fff") : subText,
                                    opacity: taskText.trim() ? 1 : 0.5,
                                    cursor: taskText.trim() ? "pointer" : "default"
                                }}
                            >
                                {t("add")}
                            </button>
                        </form>

                        <button
                            className="mt-6 w-full text-sm font-bold opacity-40 hover:opacity-100 transition"
                            onClick={() => setShowNewTaskModal(false)}
                        >
                            {t("cancel")}
                        </button>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* 6. MODALS HELPERS */}
            {habitToDelete && <ConfirmModal title={t("deleteHabitQ")} message={`"${habitToDelete.name}" ${t("willBeRemoved")}`} confirmText={t("delete")} onCancel={() => setHabitToDelete(null)} onConfirm={() => { deleteHabit(habitToDelete.id); setHabitToDelete(null); }} />}
            {/* Add Category Edit Modal here if needed, similar to Home.jsx */}

            {showNewHabit && (
                <Onboarding
                    mode="new-habit"
                    onClose={() => setShowNewHabit(false)}
                />
            )}

            {habitToEdit && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md animate-fade-in"
                    style={{
                        backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)"
                    }}
                    onClick={() => setHabitToEdit(null)}
                >
                    <div
                        className="rounded-3xl px-10 py-10 w-96 border flex flex-col items-center"
                        style={{
                            backgroundColor: cardBg,
                            color: text,
                            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold mb-8" style={{ color: accent }}>
                            {t("changeCategory")}
                        </h3>

                        <div className="flex flex-col items-center gap-3 w-full">
                            {["urgent", "important", "optional"].map((cat) => {
                                const colors = {
                                    urgent: "#ef4444",
                                    important: "#f59e0b",
                                    optional: "#22c55e"
                                };
                                const active = habitToEdit.category === cat;
                                const color = colors[cat];

                                return (
                                    <button
                                        key={cat}
                                        className="relative block w-full py-2.5 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95 group"
                                        style={{
                                            backgroundColor: active ? color : "transparent",
                                            color: active ? (isDark ? "#000" : "#fff") : color,
                                            border: `1px solid ${active ? "transparent" : color}`
                                        }}
                                        onClick={() => {
                                            updateHabit(habitToEdit.id, { category: cat });
                                            setHabitToEdit(null);
                                        }}
                                    >
                                        {!active && (
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none"
                                                style={{ backgroundColor: color }}
                                            />
                                        )}

                                        {!active && (
                                            <span
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none capitalize"
                                                style={{ color: isDark ? "#000" : "#fff" }}
                                            >
                                                {t(cat)}
                                            </span>
                                        )}

                                        <span className={`relative z-10 block capitalize ${!active ? "group-hover:opacity-0 transition-opacity duration-200" : ""}`}>
                                            {t(cat)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className="mt-6 text-sm opacity-50 hover:opacity-100"
                            onClick={() => setHabitToEdit(null)}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {taskToEdit && createPortal(
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl"
                    style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.4)" }}
                    onClick={() => {
                        setTaskToEdit(null);
                        setShowEditPriorityMenu(false);
                        setShowEditDateMenu(false);
                    }}
                >
                    <div
                        className="w-full max-w-md p-8 rounded-3xl border"
                        style={{
                            backgroundColor: cardBg,
                            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                updateTask(taskToEdit.id, taskToEdit);
                                setTaskToEdit(null);
                            }}
                        >
                            <h2 className="text-xl font-bold text-center mb-6" style={{ color: accent }}>
                                Editing Task
                            </h2>

                            <input
                                autoFocus
                                value={taskToEdit.text}
                                onChange={(e) => setTaskToEdit({ ...taskToEdit, text: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border mb-6 bg-transparent outline-none"
                                style={{ color: text, borderColor: borderColor }}
                            />

                            {/* PRIORITY */}
                            <div className="flex justify-center gap-3 mb-6">
                                {["urgent", "important", "optional"].map(p => {
                                    const colors = {
                                        urgent: "#ef4444",
                                        important: "#f59e0b",
                                        optional: "#22c55e"
                                    };
                                    return (
                                        <button
                                            type="button"
                                            key={p}
                                            onClick={() => setTaskToEdit({ ...taskToEdit, priority: p })}
                                            className="px-4 py-2 rounded-xl font-bold capitalize"
                                            style={{
                                                color: colors[p],
                                                border: `1px solid ${colors[p]}`,
                                                backgroundColor: taskToEdit.priority === p ? `${colors[p]}20` : "transparent"
                                            }}
                                        >
                                            {t(p)}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl font-bold"
                                style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                            >
                                {t("save")}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
