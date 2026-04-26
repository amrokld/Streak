import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useHabits } from "../Context/HabitContext";
import { useTasks } from "../Context/TaskContext";
import { getToday, getYesterday } from "../utils/dateHelpers";
import { useLanguage } from "../Context/LanguageContext";
import { isHabitScheduledForToday } from "../utils/habitSchedule";

import HabitCard from "../components/HabitCard";
import ConfirmModal from "../components/ConfirmModel";
import Onboarding from "./Onboarding";


export default function Today() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { accent, bg, cardBg, text, subText, borderColor } = getTokens(isDark);
  const { t, lang } = useLanguage();
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
  const [toast, setToast] = useState("");
  const [hiddenDoneHabitIds, setHiddenDoneHabitIds] = useState(new Set());

  const [showNotesField, setShowNotesField] = useState(false);
  const [showEditNotesField, setShowEditNotesField] = useState(false);
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskSubtasks, setNewTaskSubtasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!showNewTaskModal) setShowNotesField(false);
  }, [showNewTaskModal]);

  useEffect(() => {
    if (!taskToEdit) setShowEditNotesField(false);
  }, [taskToEdit]);

  const handleToggleRealSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    const newSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st);
    updateTask(taskId, { subtasks: newSubtasks });
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => ({ ...prev, subtasks: newSubtasks }));
    }
  };

  const today = getToday();
  const todayStr = today;

  // Calendar state for New Task
  const [newTaskDate, setNewTaskDate] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [calDate, setCalDate] = useState(new Date());
  const curYear = calDate.getFullYear();
  const curMonth = calDate.getMonth();
  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const monthKeys = ["monthJanuary", "monthFebruary", "monthMarch", "monthApril", "monthMay", "monthJune", "monthJuly", "monthAugust", "monthSeptember", "monthOctober", "monthNovember", "monthDecember"];
  const dayKeys = ["daySu", "dayMo", "dayTu", "dayWe", "dayTh", "dayFr", "daySa"];

  const handlePrevMonth = (e) => { e.preventDefault(); setCalDate(new Date(curYear, curMonth - 1, 1)); };
  const handleNextMonth = (e) => { e.preventDefault(); setCalDate(new Date(curYear, curMonth + 1, 1)); };
  const handleDateSelect = (day) => {
    const m = String(curMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setNewTaskDate(`${curYear}-${m}-${d}`);
    setShowDateMenu(false);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };


  // -- Priority helpers --
  const getPriorityColor = (p) => {
    if (p === "urgent") return "#ef4444";
    if (p === "important") return "#f59e0b";
    return "#22c55e";
  };

  const getPriorityBg = (p) => {
    if (p === "urgent") return isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)";
    if (p === "important") return isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)";
    return isDark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.08)";
  };

  const getDateLabel = (dueDate) => {
    if (!dueDate) return null;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dueDate === today) return t("todayBadge");
    if (dueDate === yesterdayStr) return t("yesterday");
    if (dueDate === tomorrowStr) return t("tomorrow");
    return new Date(dueDate + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' });
  };


  // Filtering
  const pendingHabits = habits.filter((h) => isHabitScheduledForToday(h) && h.lastCompletedDate !== today);
  const doneHabits = habits.filter((h) => isHabitScheduledForToday(h) && h.lastCompletedDate === today);

  const overdueTasks = tasks.filter((t) => !t.done && t.dueDate && t.dueDate < today);
  const todayTasks = tasks.filter((t) => !t.done && t.dueDate === today);
  const completedTasks = tasks.filter((t) => t.done && (t.dueDate <= today || !t.dueDate));
  const forceCloseCards = Boolean(habitToDelete || habitToEdit);
  const totalTasks = tasks.filter(t => !t.done || t.done).length;
  const completedTasksCount = tasks.filter(t => t.done).length;

  const totalHabits = habits.length;
  const completedHabitsCount = doneHabits.length;
  const remainingHabits = totalHabits - completedHabitsCount;
  const allDone = pendingHabits.length === 0 && overdueTasks.length === 0 && todayTasks.length === 0;
  const tasksLeftToday = overdueTasks.length + todayTasks.length;
  const totalTasksToday = tasksLeftToday + completedTasks.length;

  const visibleCompletedHabits = doneHabits.filter(h => !hiddenDoneHabitIds.has(h.id));
  const hasCompleted = visibleCompletedHabits.length > 0 || completedTasks.length > 0;



  const handleRemoveAllCompleted = () => {
    completedTasks.forEach(task => deleteTask(task.id));
    setHiddenDoneHabitIds(new Set(doneHabits.map(h => h.id)));
    setShowCompleted(false);
  };



  const sectionTitle = (label, color = subText) => (
    <p style={{ color, fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
      {label}
    </p>
  );

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    addTask(taskText, taskPriority, newTaskDate || todayStr, newTaskNotes, newTaskSubtasks.filter(st => st.text.trim() !== ""));
    setTaskText("");
    setNewTaskNotes("");
    setNewTaskSubtasks([]);
    setNewTaskDate("");
    setShowNotesField(false);
    setTaskPriority("important");
    setShowNewTaskModal(false);
  };

  return (
    <div style={{ backgroundColor: bg, color: text, minHeight: "100vh", padding: "40px 60px" }}>

      {/* 1. HEADER */}
      <div id="tour-today-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
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
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t("newHabit")}
            </span>
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
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {t("tasks")}
            </span>

          </button>
        </div>
      </div>

      {/* 2. BODY COLUMNS */}
      {!allDone && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", alignItems: "start" }}>

          {/* LEFT: HABITS */}
          <section>
            {totalHabits > 0 && (
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

                {totalHabits > 0 && remainingHabits > 0 && (
                  <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>
                    {remainingHabits === totalHabits ? (
                      <>
                        <span style={{ color: accent, fontWeight: 700 }}>{remainingHabits}</span> {t("habitsWaitingToday")}
                      </>
                    ) : remainingHabits === 1 ? (
                      <>
                        <span style={{ color: accent, fontWeight: 700 }}>1</span> {t("habitLeftFinishStrong")}
                      </>
                    ) : (
                      <>
                        <span style={{ color: accent, fontWeight: 700 }}>{remainingHabits}</span> {t("habitsLeftToday")}
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    mode="today"
                    onCheckIn={(id) => {
                      checkInHabit(id, ({ freezeUsed, freezeEarned }) => {
                        if (freezeEarned) {
                          showToast(t("freezeEarned"));
                        } else if (freezeUsed) {
                          showToast(t("streakSavedByFreeze"));
                        } else {
                          showToast(t("checkedIn"));
                        }
                      });
                    }}
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

              {totalTasksToday > 0 && tasksLeftToday > 0 && (
                <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>
                  {tasksLeftToday === totalTasksToday ? (
                    <>
                      <span style={{ color: accent, fontWeight: 700 }}>{tasksLeftToday}</span> {t("tasksWaitingToday")}
                    </>
                  ) : tasksLeftToday === 1 ? (
                    <>
                      <span style={{ color: accent, fontWeight: 700 }}>1</span> {t("taskLeftFinishStrong")}
                    </>
                  ) : (
                    <>
                      <span style={{ color: accent, fontWeight: 700 }}>{tasksLeftToday}</span> {t("tasksLeftToday")}
                    </>
                  )}
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <AnimatePresence mode="popLayout">
                {[...overdueTasks, ...todayTasks].map((task) => {
                  const isOverdue = task.dueDate && task.dueDate < today;
                  const isTodayStr = task.dueDate === today;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      key={task.id}
                      className="group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden"
                      style={{
                        backgroundColor: cardBg,
                        borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
                      }}
                      whileHover={{
                        scale: 1.01,
                        boxShadow: `0 10px 30px -10px ${getPriorityColor(task.priority)}40`,
                        borderColor: `${getPriorityColor(task.priority)}50`
                      }}
                    >
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

                      <div className="flex-1 overflow-hidden ml-2 cursor-pointer" onClick={() => setSelectedTask(task)}>
                        <span
                          className={`text-xl font-medium block truncate transition-colors ${task.done ? "line-through" : ""}`}
                          style={{ color: task.done ? subText : text }}
                        >
                          {task.text}
                        </span>
                        {task.notes && (
                          <span className="block text-sm mt-1 whitespace-pre-wrap" style={{ color: subText, opacity: 0.8 }}>
                            {task.notes}
                          </span>
                        )}
                        {task.subtasks?.length > 0 && (
                          <span className="block text-[11px] font-bold mt-1.5" style={{ color: accent, opacity: 0.9 }}>
                            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} Subtasks
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 ml-10 md:ml-0 shrink-0">
                        {!task.done && (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span
                              className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full"
                              style={{
                                color: getPriorityColor(task.priority),
                                backgroundColor: getPriorityBg(task.priority),
                                border: `1px solid ${getPriorityColor(task.priority)}35`,
                              }}
                            >
                              {t(task.priority)}
                            </span>

                            {task.dueDate && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  color: isOverdue ? "#3b82f6" : subText,
                                  backgroundColor: isOverdue ? "rgba(59,130,246,0.12)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                  border: isOverdue ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
                                  boxShadow: isOverdue ? "0 0 6px rgba(59,130,246,0.25)" : "none",
                                }}
                              >
                                {isOverdue ? t("overdue") : getDateLabel(task.dueDate)}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all ml-2">
                          <button
                            className="hover:scale-110 transition-transform"
                            style={{ color: subText }}
                            onClick={() => setTaskToEdit(task)}
                          >
                            <svg className="w-5 h-5 hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            className="hover:scale-110 transition-transform"
                            style={{ color: subText }}
                            onClick={() => deleteTask(task.id)}
                          >
                            <svg className="w-5 h-5 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </div>
      )}

      {/* 3. EMPTY STATE (UPGRADED) */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "80px", // Pushes it higher than exact center for better balance
            textAlign: "center"
          }}
        >
          {/* Animated Icon */}
          <div
            style={{
              fontSize: "44px",
              color: accent,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: "2px",
              textShadow: `
                                0 1px 0 rgba(255,255,255,0.15),
                                0 2px 6px rgba(0,0,0,0.4),
                                0 0 12px ${accent}22
                                `
            }}
          >
            ✦
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: "32px",
            fontWeight: 900,
            color: accent,
            marginBottom: "14px", // 14px spacing
            textShadow: `0 0 20px ${accent}33`,
            letterSpacing: "0.02em"
          }}>
            {t("doneForToday")}
          </h2>

          {/* Subtitle */}
          <p style={{
            color: subText,
            fontSize: "16px",
            opacity: 0.6,
            fontWeight: 500
          }}>
            {t("restWell")}
          </p>

          {/* Optional Secondary Text Enhancement */}
          <p style={{
            color: subText,
            fontSize: "12px",
            marginTop: "24px",
            opacity: 0.3,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}>
            {t("earnedBreak")}
          </p>
        </motion.div>
      )}

      {/* 4. COMPLETED SECTION */}
      {hasCompleted && (
        <div style={{ marginTop: "60px", borderTop: `1px solid ${borderColor}`, paddingTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{ background: "none", border: "none", color: subText, fontSize: "13px", cursor: "pointer", fontWeight: 700 }}
            >
              {showCompleted ? t("hideCompletedLink") : t("showCompletedLink")}
            </button>

            {/* Remove All Button — only when expanded */}
            {showCompleted && (
              <button
                onClick={handleRemoveAllCompleted}
                style={{ background: "none", border: "none", color: "#ef4444", fontSize: "11px", cursor: "pointer", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.6 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
              >
                {t("clearAll") || "Clear All"}
              </button>
            )}
          </div>


          <AnimatePresence>
            {showCompleted && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "60px" }}>
                  {/* Completed Habits Column */}
                  <div>
                    {sectionTitle(t("completedHabits"))}
                    <div className="flex flex-col gap-2 opacity-50">
                      {visibleCompletedHabits.map((habit) => (
                        <div key={habit.id} style={{ backgroundColor: cardBg, padding: "12px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between" }}>
                          <span style={{ textDecoration: "line-through" }}>{habit.name}</span>
                          <span>🔥 {habit.currentStreak}</span>
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
      )}


      {/* 5. NEW TASK MODAL */}
      {showNewTaskModal && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md animate-fade-in"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)" }}
          onClick={() => { setShowNewTaskModal(false); setShowDateMenu(false); setShowPriorityMenu(false); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl border relative"
            style={{
              backgroundColor: cardBg,
              color: text,
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              boxShadow: isDark
                ? `0 0 50px ${accent}20, 0 20px 40px rgba(0,0,0,0.8)`
                : `0 0 40px ${accent}30, 0 20px 40px rgba(0,0,0,0.15)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-3xl font-bold text-center" style={{ color: accent }}>
              {t("whatNeedsDone") || "What needs to be done?"}
            </h1>

            <form onSubmit={handleAddTask} className="flex flex-col gap-4 w-72">
              <input
                autoFocus
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                placeholder={t("forExample") || "E.g., Finish report..."}
                className="w-full px-4 py-3 rounded-xl mb-2 text-sm font-medium outline-none transition-colors border"
                style={{
                  backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                  color: text,
                  borderColor: taskText.trim() ? accent : "transparent"
                }}
              />

              <div className="flex gap-4 w-full mb-3 justify-center">
                {(!showNotesField && !newTaskNotes) && (
                  <button
                    type="button"
                    onClick={() => setShowNotesField(true)}
                    className="text-[11px] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                    style={{ color: accent }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {t("addNote") || "Add Note"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setNewTaskSubtasks([...newTaskSubtasks, { id: Date.now().toString() + Math.random(), text: "", done: false }])}
                  className="text-[11px] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                  style={{ color: accent }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  {t("addSubtask") || "Add Subtask"}
                </button>
              </div>

              {/* NOTES UI */}
              <AnimatePresence>
                {(showNotesField || newTaskNotes) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full flex flex-col mb-3 overflow-hidden relative">
                    <button type="button" onClick={() => { setShowNotesField(false); setNewTaskNotes(""); }} className="absolute top-2.5 right-2.5 text-red-500 opacity-40 hover:opacity-100 transition-all p-1.5 z-10 hover:bg-red-500/10 rounded-full" title="Remove Note">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    </button>
                    <textarea
                      value={newTaskNotes}
                      onChange={e => setNewTaskNotes(e.target.value)}
                      placeholder={t("optionalNote") || "Optional note"}
                      className="w-full h-20 px-4 py-3 pr-10 rounded-xl text-sm outline-none resize-none transition-colors border"
                      style={{
                        backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                        color: text,
                        borderColor: newTaskNotes.trim() ? accent : "transparent"
                      }}
                      autoFocus={showNotesField && !newTaskNotes}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* REAL SUBTASKS UI */}
              <AnimatePresence>
                {newTaskSubtasks.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full flex flex-col gap-2 mb-4 overflow-hidden">
                    {newTaskSubtasks.map((st, i) => (
                      <div key={st.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: accent }} />
                        <input
                          value={st.text}
                          onChange={e => {
                            const newSt = [...newTaskSubtasks];
                            newSt[i].text = e.target.value;
                            setNewTaskSubtasks(newSt);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none border transition-colors"
                          style={{
                            backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                            color: text,
                            borderColor: st.text.trim() ? accent : "transparent"
                          }}
                          placeholder="Subtask text..."
                          autoFocus
                        />
                        <button type="button" onClick={() => {
                          const newSt = newTaskSubtasks.filter((_, idx) => idx !== i);
                          setNewTaskSubtasks(newSt);
                        }} className="text-red-500 opacity-50 hover:opacity-100 hover:scale-110 transition-all p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Priority Selection */}
              <div className="flex justify-center gap-2">
                {["important", "urgent", "optional"].map((cat) => {
                  const active = taskPriority === cat;
                  const colors = {
                    urgent: "#ef4444",
                    important: "#f59e0b",
                    optional: "#22c55e"
                  };
                  const color = colors[cat];

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTaskPriority(cat)}
                      className="px-3 py-1 rounded-full text-xs transition font-bold capitalize"
                      style={{
                        border: `1px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                        backgroundColor: active ? (isDark ? `${color}15` : `${color}15`) : "transparent",
                        color: color
                      }}
                    >
                      {t(cat)}
                    </button>
                  );
                })}
              </div>

              {/* Date Selection */}
              <div className="flex justify-center mt-1 relative z-50">
                <div onClick={() => { setShowDateMenu(!showDateMenu); setShowPriorityMenu(false); }} className="flex items-center justify-center px-4 py-2 rounded-xl transition cursor-pointer border select-none w-1/2" style={{ backgroundColor: showDateMenu ? (isDark ? "#444" : "#e2e8f0") : "transparent", borderColor: showDateMenu ? accent : (isDark ? "#444" : "#cbd5e1") }}>
                  {newTaskDate ? (
                    <span className="text-sm font-bold tracking-wider" style={{ color: text }}>{newTaskDate}</span>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: subText }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {t("date")}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {showDateMenu && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-12 left-1/2 -translate-x-1/2 w-64 p-4 rounded-3xl border shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: cardBg, borderColor: isDark ? "#444" : "#e2e8f0" }}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm" style={{ color: text }}>{t(monthKeys[curMonth])} {curYear}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition"><svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                          <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition"><svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2 uppercase" style={{ color: subText }}>
                        {dayKeys.map(dk => <span key={dk}>{t(dk)}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const m = String(curMonth + 1).padStart(2, '0');
                          const d = String(day).padStart(2, '0');
                          const dateStr = `${curYear}-${m}-${d}`;
                          const isSelected = newTaskDate === dateStr;
                          const isCalToday = todayStr === dateStr;
                          return (
                            <button type="button" key={day} onClick={(e) => { e.preventDefault(); handleDateSelect(day); }} className="w-full aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all" style={{ backgroundColor: isSelected ? accent : (isCalToday ? `${accent}30` : "transparent"), color: isSelected ? (isDark ? "#000" : "#fff") : text, border: isCalToday && !isSelected ? `1px solid ${accent}` : "1px solid transparent" }}>{day}</button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: isDark ? "#444" : "#e2e8f0" }}>
                        <button onClick={(e) => { e.preventDefault(); setNewTaskDate(""); setShowDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: subText }}>{t("clear")}</button>
                        <button onClick={(e) => { e.preventDefault(); setNewTaskDate(todayStr); setShowDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: accent }}>{t("today")}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="relative group w-full py-2 mt-2 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: "transparent",
                  color: accent,
                  border: `1px solid ${accent}`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
                <span
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                  style={{ color: isDark ? "#000" : "#fff" }}
                >
                  {t("add")}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200 text-center">
                  {t("add")}
                </span>
              </button>
            </form>

            <button
              onClick={() => { setShowNewTaskModal(false); setShowDateMenu(false); setShowPriorityMenu(false); }}
              className="relative group text-sm font-medium transition-all duration-300 mt-0"
              style={{ color: subText }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.8)" }}
              >
                {t("cancel")}
              </span>
              <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
                {t("cancel")}
              </span>
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

      {/* EDIT TASK MODAL */}
      {taskToEdit && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md animate-fade-in transition-all duration-300"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)" }}
          onClick={() => {
            setTaskToEdit(null);
            setShowEditPriorityMenu(false);
            setShowEditDateMenu(false);
          }}
        >
          <div
            className="flex flex-col items-center gap-4 px-8 py-8 rounded-3xl border relative"
            style={{
              backgroundColor: cardBg,
              color: text,
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              boxShadow: isDark
                ? `0 0 50px ${accent}20, 0 20px 40px rgba(0, 0, 0, 0.8)`
                : `0 0 40px ${accent}30, 0 20px 40px rgba(0, 0, 0, 0.15)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-3xl font-bold text-center" style={{ color: accent }}>
              {t("editingTask") || "Edit Task"}
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskToEdit.text.trim()) return;
                updateTask(taskToEdit.id, taskToEdit);
                setTaskToEdit(null);
              }}
              className="flex flex-col gap-3 w-72"
            >
              <input
                autoFocus
                value={taskToEdit.text}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, text: e.target.value })}
                placeholder={t("whatToCall")}
                className="w-full px-4 py-3 rounded-xl mb-2 text-sm font-medium outline-none transition-colors border"
                style={{
                  backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                  color: text,
                  borderColor: taskToEdit.text.trim() ? accent : "transparent"
                }}
              />

              <div className="flex gap-4 w-full mb-2 justify-center">
                {(!showEditNotesField && !taskToEdit.notes) && (
                  <button
                    type="button"
                    onClick={() => setShowEditNotesField(true)}
                    className="text-[11px] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                    style={{ color: accent }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {t("addNote") || "Add Note"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTaskToEdit({ ...taskToEdit, subtasks: [...(taskToEdit.subtasks || []), { id: Date.now().toString() + Math.random(), text: "", done: false }] })}
                  className="text-[11px] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-all"
                  style={{ color: accent }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  {t("addSubtask") || "Add Subtask"}
                </button>
              </div>

              {/* NOTES UI */}
              <AnimatePresence>
                {(showEditNotesField || taskToEdit.notes) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full flex flex-col mb-2 overflow-hidden relative">
                    <button type="button" onClick={() => { setShowEditNotesField(false); setTaskToEdit({ ...taskToEdit, notes: "" }); }} className="absolute top-2.5 right-2.5 text-red-500 opacity-40 hover:opacity-100 transition-all p-1.5 z-10 hover:bg-red-500/10 rounded-full" title="Remove Note">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                    </button>
                    <textarea
                      value={taskToEdit.notes || ""}
                      onChange={e => setTaskToEdit({ ...taskToEdit, notes: e.target.value })}
                      placeholder={t("optionalNote") || "Optional note"}
                      className="w-full h-24 px-4 py-3 pr-10 rounded-xl text-sm outline-none resize-none transition-colors border"
                      style={{
                        backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                        color: text,
                        borderColor: (taskToEdit.notes || "").trim() ? accent : "transparent"
                      }}
                      autoFocus={showEditNotesField && !taskToEdit.notes}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* REAL SUBTASKS UI */}
              <AnimatePresence>
                {(taskToEdit.subtasks?.length > 0) && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full flex flex-col gap-2 mb-4 overflow-hidden">
                    {taskToEdit.subtasks.map((st, i) => (
                      <div key={st.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: accent }} />
                        <input
                          value={st.text}
                          onChange={e => {
                            const newSt = [...taskToEdit.subtasks];
                            newSt[i].text = e.target.value;
                            setTaskToEdit({ ...taskToEdit, subtasks: newSt });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none border transition-colors"
                          style={{
                            backgroundColor: isDark ? "#3a3a3a" : "#f3f4f6",
                            color: text,
                            borderColor: st.text.trim() ? accent : "transparent"
                          }}
                          placeholder="Subtask text..."
                        />
                        <button type="button" onClick={() => {
                          const newSt = taskToEdit.subtasks.filter((_, idx) => idx !== i);
                          setTaskToEdit({ ...taskToEdit, subtasks: newSt });
                        }} className="text-red-500 opacity-50 hover:opacity-100 hover:scale-110 transition-all p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Priority Selection */}
              <div className="flex justify-center gap-2">
                {["important", "urgent", "optional"].map((cat) => {
                  const active = taskToEdit.priority === cat;
                  const colors = {
                    urgent: "#ef4444",
                    important: "#f59e0b",
                    optional: "#22c55e"
                  };
                  const color = colors[cat];

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTaskToEdit({ ...taskToEdit, priority: cat })}
                      className="px-3 py-1 rounded-full text-xs transition font-bold capitalize"
                      style={{
                        border: `1px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                        backgroundColor: active ? (isDark ? `${color}15` : `${color}15`) : "transparent",
                        color: color
                      }}
                    >
                      {t(cat)}
                    </button>
                  );
                })}
              </div>

              {/* Date Selection */}
              <div className="flex justify-center mt-1 relative z-50">
                <div onClick={() => { setShowEditDateMenu(!showEditDateMenu); setShowEditPriorityMenu(false); }} className="flex items-center justify-center px-4 py-2 rounded-xl transition cursor-pointer border select-none w-1/2" style={{ backgroundColor: showEditDateMenu ? (isDark ? "#444" : "#e2e8f0") : "transparent", borderColor: showEditDateMenu ? accent : (isDark ? "#444" : "#cbd5e1") }}>
                  {taskToEdit.dueDate ? (
                    <span className="text-sm font-bold tracking-wider" style={{ color: text }}>{taskToEdit.dueDate}</span>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: subText }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {t("date")}
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {showEditDateMenu && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-12 left-1/2 -translate-x-1/2 w-64 p-4 rounded-3xl border shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: cardBg, borderColor: isDark ? "#444" : "#e2e8f0" }}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm" style={{ color: text }}>{t(monthKeys[curMonth])} {curYear}</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition"><svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                          <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition"><svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2 uppercase" style={{ color: subText }}>
                        {dayKeys.map(dk => <span key={dk}>{t(dk)}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const m = String(curMonth + 1).padStart(2, '0');
                          const d = String(day).padStart(2, '0');
                          const dateStr = `${curYear}-${m}-${d}`;
                          const isSelected = taskToEdit.dueDate === dateStr;
                          const isCalToday = todayStr === dateStr;
                          return (
                            <button type="button" key={day} onClick={(e) => { e.preventDefault(); setTaskToEdit({ ...taskToEdit, dueDate: dateStr }); setShowEditDateMenu(false); }} className="w-full aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all" style={{ backgroundColor: isSelected ? accent : (isCalToday ? `${accent}30` : "transparent"), color: isSelected ? (isDark ? "#000" : "#fff") : text, border: isCalToday && !isSelected ? `1px solid ${accent}` : "1px solid transparent" }}>{day}</button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: isDark ? "#444" : "#e2e8f0" }}>
                        <button onClick={(e) => { e.preventDefault(); setTaskToEdit({ ...taskToEdit, dueDate: null }); setShowEditDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: subText }}>{t("clear")}</button>
                        <button onClick={(e) => { e.preventDefault(); setTaskToEdit({ ...taskToEdit, dueDate: todayStr }); setShowEditDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: accent }}>{t("today")}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="relative group w-full py-2 mt-2 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: "transparent",
                  color: accent,
                  border: `1px solid ${accent}`
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0 pointer-events-none" style={{ backgroundColor: accent }} />
                <span
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none"
                  style={{ color: isDark ? "#000" : "#fff" }}
                >
                  {t("save")}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200 text-center">
                  {t("save")}
                </span>
              </button>
            </form>

            <button
              onClick={() => {
                setTaskToEdit(null);
                setShowEditPriorityMenu(false);
                setShowEditDateMenu(false);
              }}
              className="relative group text-sm font-medium transition-all duration-300 mt-0"
              style={{ color: subText }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.8)" }}
              >
                {t("cancel")}
              </span>
              <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
                {t("cancel")}
              </span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* VIEW TASK MODAL */}
      {selectedTask && createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center backdrop-blur-md animate-fade-in"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md p-8 rounded-[32px] border flex flex-col shadow-2xl relative"
            style={{
              backgroundColor: cardBg,
              borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
              boxShadow: isDark ? `0 20px 40px rgba(0,0,0,0.5), 0 0 40px ${accent}20` : `0 20px 40px rgba(0,0,0,0.1), 0 0 40px ${accent}20`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6 shrink-0">
              <h2 className="text-2xl font-black leading-tight" style={{ color: text }}>{selectedTask.text}</h2>
              <span
                className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full mt-1 shrink-0"
                style={{
                  color: getPriorityColor(selectedTask.priority),
                  backgroundColor: getPriorityBg(selectedTask.priority),
                  border: `1px solid ${getPriorityColor(selectedTask.priority)}35`
                }}
              >
                {t(selectedTask.priority)}
              </span>
            </div>

            <div className="overflow-y-auto pr-2 mb-6" style={{ maxHeight: "calc(85vh - 180px)", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <style>{`
                        .overflow-y-auto::-webkit-scrollbar { display: none; }
                      `}</style>
              {selectedTask.notes && (
                <p className="text-[15px] leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: text }}>{selectedTask.notes}</p>
              )}

              {selectedTask.subtasks?.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {selectedTask.subtasks.map((st, i) => (
                    <div key={st.id} className="flex items-start gap-3 my-1" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all shrink-0"
                        style={{
                          borderColor: st.done ? accent : borderColor,
                          backgroundColor: st.done ? accent : "transparent"
                        }}
                        onClick={() => handleToggleRealSubtask(selectedTask.id, st.id)}
                      >
                        <AnimatePresence>
                          {st.done && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-3.5 h-3.5" style={{ color: isDark ? "#000" : "#ffffff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>
                      <span className={`text-[15px] transition-all leading-relaxed ${st.done ? "line-through opacity-50" : ""}`} style={{ color: text }}>{st.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {!selectedTask.notes && (!selectedTask.subtasks || selectedTask.subtasks.length === 0) && (
                <p className="text-sm italic opacity-50" style={{ color: subText }}>{t("noNotesOrSubtasks") || "No notes or subtasks for this task."}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t shrink-0" style={{ borderColor: isDark ? "#444" : "#e2e8f0" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { deleteTask(selectedTask.id); setSelectedTask(null); }}
                className="px-4 py-2 text-sm font-bold rounded-xl transition-colors hover:bg-red-500/10 text-red-500"
              >
                {t("delete") || "Delete"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${accent}40` }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setTaskToEdit(selectedTask); setSelectedTask(null); }}
                className="px-5 py-2 text-sm font-bold rounded-xl shadow-sm transition-colors"
                style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
              >
                {t("edit") || "Edit Task"}
              </motion.button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* TOAST */}
      <div className="fixed bottom-10 inset-x-0 flex justify-center z-50 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 py-3 rounded-full shadow-xl text-sm font-medium whitespace-nowrap"
              style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

  );
}
