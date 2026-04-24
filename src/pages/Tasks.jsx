import { useState, useEffect, useRef } from "react";
import { useTheme } from "../Context/ThemeContext";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "../Context/TaskContext";
import { getTokens } from "../theme/tokens";
import { useLanguage } from "../Context/LanguageContext";

export default function Tasks() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { accent, bg, cardBg, text, subText, borderColor } = getTokens(isDark);
  const { t, lang } = useLanguage();

  const { tasks, addTask, restoreTask, toggleDone, deleteTask, clearCompleted, updateTask } = useTasks();

  const [filter, setFilter] = useState("all");

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("important");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);

  const [taskToEdit, setTaskToEdit] = useState(null);
  
  const [deletedTaskInfo, setDeletedTaskInfo] = useState(null);
  const toastTimer = useRef(null);

  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showEditPriorityMenu, setShowEditPriorityMenu] = useState(false);
  const [showEditDateMenu, setShowEditDateMenu] = useState(false);
  const [calDate, setCalDate] = useState(new Date());

  const newFormRef = useRef(null);
  const editFormRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (newFormRef.current && !newFormRef.current.contains(e.target)) {
        setShowPriorityMenu(false);
        setShowDateMenu(false);
      }
      if (editFormRef.current && !editFormRef.current.contains(e.target)) {
        setShowEditPriorityMenu(false);
        setShowEditDateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    addTask(newTaskText, newTaskPriority, newTaskDate, newTaskNotes);

    setNewTaskText("");
    setNewTaskNotes("");
    setNewTaskPriority("important");
    setNewTaskDate(todayStr);
    setShowDateMenu(false);
    setShowPriorityMenu(false);
    setShowNewTaskModal(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aOverdue = a.dueDate && a.dueDate < todayStr && !a.done;
    const bOverdue = b.dueDate && b.dueDate < todayStr && !b.done;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    const pWeight = { urgent: 3, important: 2, optional: 1 };
    return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
  });

  const filteredTasks = sortedTasks.filter(t => {
    if (filter === "all") return true;
    return t.priority === filter;
  });

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
    const yesterday = new Date(todayStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const tomorrow = new Date(todayStr);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dueDate === todayStr) return t("todayBadge") || "Today";
    if (dueDate === yesterdayStr) return t("yesterday") || "Yesterday";
    if (dueDate === tomorrowStr) return t("tomorrow") || "Tomorrow";
    return new Date(dueDate + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' });
  };

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

  // -- Progress Logic --
  const totalTasksToday = tasks.length;
  const activeTasks = tasks.filter(t => !t.done);
  const tasksLeftToday = activeTasks.length;
  const completedTasksCount = totalTasksToday - tasksLeftToday;
  const progressPercent = totalTasksToday === 0 ? 0 : (completedTasksCount / totalTasksToday) * 100;

  const renderProgressText = () => {
    if (totalTasksToday === 0) {
      return <>{t("NoTasksYet") || "Your day is a blank canvas. Let's add some tasks!"}</>;
    }
    if (tasksLeftToday === 0) {
      return <>{t("TasksDone") || "Amazing! You've crushed all your tasks."}</>;
    }
    if (tasksLeftToday === totalTasksToday) {
      return <><span style={{ color: accent, fontWeight: 700 }}>{tasksLeftToday}</span> {t("TasksWaiting") || "tasks waiting. Let's get started!"}</>;
    }
    if (tasksLeftToday === 1) {
      return <><span style={{ color: accent, fontWeight: 700 }}>1</span> {t("taskRemaining") || "task remaining. You're almost there!"}</>;
    }
    return <><span style={{ color: accent, fontWeight: 700 }}>{tasksLeftToday}</span> {t("tasksToGo") || "tasks to go. Keep up the good work!"}</>;
  };

  const handleDeleteTask = (task) => {
    deleteTask(task.id);
    setDeletedTaskInfo(task);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setDeletedTaskInfo(null);
    }, 5000);
  };

  const undoDelete = () => {
    if (deletedTaskInfo) {
      restoreTask(deletedTaskInfo);
      setDeletedTaskInfo(null);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    }
  };

  return (
    <div className="flex flex-col items-center mt-12 pb-24 animate-fade-in w-full px-4">
      <div className="w-full max-w-4xl">

        {/* Header and Progress Indicator */}
        <div id="tour-nav-tasks" className="flex items-start justify-between mb-10 w-full">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold" style={{ color: accent }}>{t("tasks")}</h1>
            <div className="inline-block mt-2">
              <p className="text-sm mb-3" style={{ color: subText }}>
                {renderProgressText()}
              </p>
              {/* Progress Bar Indicator */}
              {totalTasksToday > 0 && (
                <div className="w-full h-1.5 rounded-full relative mt-1" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full transition-all duration-500 relative z-10"
                    style={{ 
                      backgroundColor: accent,
                      boxShadow: progressPercent === 100 ? `0 0 12px ${accent}` : "none"
                    }}
                  />
                  <AnimatePresence>
                    {progressPercent === 100 && (
                      <>
                        <motion.div
                          initial={{ opacity: 0.6, scaleX: 1, scaleY: 1 }}
                          animate={{ opacity: 0, scaleX: 1.05, scaleY: 3 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                          className="absolute top-0 left-0 w-full h-full rounded-full z-0 pointer-events-none"
                          style={{ backgroundColor: accent }}
                        />
                        {/* Particle Explosion */}
                        {[
                          { x: 40, y: -50, scale: 1.2, delay: 0 },
                          { x: 70, y: -20, scale: 0.8, delay: 0.05 },
                          { x: 80, y: 0, scale: 1.5, delay: 0 },
                          { x: 70, y: 20, scale: 0.9, delay: 0.1 },
                          { x: 40, y: 50, scale: 1.1, delay: 0.05 },
                          { x: -20, y: -60, scale: 1.0, delay: 0.15 },
                          { x: -40, y: -30, scale: 1.3, delay: 0.05 },
                          { x: -40, y: 30, scale: 1.3, delay: 0 },
                          { x: -20, y: 60, scale: 1.0, delay: 0.1 },
                          { x: 0, y: -70, scale: 0.8, delay: 0 },
                          { x: 0, y: 70, scale: 0.8, delay: 0.05 },
                          { x: 30, y: -25, scale: 1.4, delay: 0.1 },
                          { x: -10, y: -30, scale: 0.7, delay: 0 },
                        ].map((particle, i) => (
                          <motion.div
                            key={`particle-${i}`}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                            animate={{ 
                              x: lang === 'ar' ? -particle.x : particle.x, 
                              y: particle.y, 
                              opacity: [1, 1, 0],
                              scale: [0, particle.scale, 0]
                            }}
                            transition={{ duration: 0.7, delay: 0.5 + particle.delay, ease: "easeOut" }}
                            className={`absolute top-1/2 pointer-events-none z-50 w-1.5 h-1.5 rounded-full ${lang === 'ar' ? 'left-0' : 'right-0'}`}
                            style={{ 
                              backgroundColor: accent, 
                              marginTop: "-3px", 
                              [lang === 'ar' ? 'marginLeft' : 'marginRight']: "-3px" 
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black transition-all duration-300 active:scale-95 hover:scale-105 group"
            style={{
              backgroundColor: accent,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${accent}40`
            }}
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            {t("newTask") || "New Task"}
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 ">
            {["all", "urgent", "important", "optional"].map((cat) => {
              const activeLabelsCount = new Set(tasks.map(t => t.priority)).size;
              if (cat === "all" && activeLabelsCount < 2) return null;
              if (cat !== "all" && !tasks.some(t => t.priority === cat)) return null;

              const active = filter === cat;
              const colors = {
                all: accent,
                urgent: "#ef4444",
                important: "#f59e0b",
                optional: "#22c55e"
              };
              const color = colors[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all duration-200 whitespace-nowrap"
                  style={{
                    border: `1.5px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                    backgroundColor: active ? `${color}15` : "transparent",
                    color: color,
                    transform: active ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  {t(cat)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {tasks.some(tk => tk.done) && (
              <button onClick={clearCompleted} className="text-xs font-bold transition opacity-70 hover:opacity-100 uppercase tracking-wider" style={{ color: accent }}>
                {t("clearCompleted")}
              </button>
            )}
          </div>
        </div>

        {/* Animated Task List */}
        <div className="flex flex-col gap-3 relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-12 opacity-50"
                style={{ color: subText }}
              >
                {t("no tasks yet")}
              </motion.div>
            )}

            {filteredTasks.map(task => {
              const isOverdue = task.dueDate && task.dueDate < todayStr && !task.done;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: task.done ? 0.6 : 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  key={task.id}
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-3xl border transition-colors relative"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
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

                  <div className="flex-1 overflow-hidden ml-2 cursor-pointer" onClick={() => setTaskToEdit(task)}>
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
                        onClick={() => handleDeleteTask(task)}
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
      </div>

      {/* NEW TASK MODAL */}
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

            <form ref={newFormRef} onSubmit={handleAddTask} className="flex flex-col gap-4 w-72">
              <input
                autoFocus
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder={t("forExample") || "E.g., Finish report..."}
                className="w-full px-4 py-2 rounded outline-none text-center"
                style={{ backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb", color: text }}
              />

              <textarea
                value={newTaskNotes}
                onChange={e => setNewTaskNotes(e.target.value)}
                placeholder={t("optionalNote") || "Notes (optional)..."}
                className="w-full px-4 py-2 rounded outline-none text-center text-sm resize-none"
                rows={2}
                style={{ backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb", color: text }}
              />

              {/* Priority Selection */}
              <div className="flex justify-center gap-2">
                {["important", "urgent", "optional"].map((cat) => {
                  const active = newTaskPriority === cat;
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
                      onClick={() => setNewTaskPriority(cat)}
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
              <div className="flex justify-center mt-2 relative z-50">
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
                className="relative group w-full py-2.5 mt-4 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
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
              className="relative group text-sm font-medium transition-all duration-300 mt-2"
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
        </div>, document.body)}

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
            className="flex flex-col items-center gap-6 px-10 py-12 rounded-3xl border relative"
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
              ref={editFormRef}
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskToEdit.text.trim()) return;
                updateTask(taskToEdit.id, taskToEdit);
                setTaskToEdit(null);
              }}
              className="flex flex-col gap-4 w-72"
            >
              <input
                autoFocus
                value={taskToEdit.text}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, text: e.target.value })}
                placeholder={t("whatToCall")}
                className="w-full px-4 py-2 rounded outline-none text-center"
                style={{ backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb", color: text }}
              />

              <textarea
                value={taskToEdit.notes || ""}
                onChange={(e) => setTaskToEdit({ ...taskToEdit, notes: e.target.value })}
                placeholder={t("notesOptional") || "Notes (optional)..."}
                className="w-full px-4 py-2 rounded outline-none text-center text-sm resize-none"
                rows={2}
                style={{ backgroundColor: isDark ? "#3a3a3a" : "#e5e7eb", color: text }}
              />

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
              <div className="flex justify-center mt-2 relative z-50">
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
                        <button type="button" onClick={(e) => { e.preventDefault(); setTaskToEdit({ ...taskToEdit, dueDate: "" }); setShowEditDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: subText }}>{t("clear")}</button>
                        <button type="button" onClick={(e) => { e.preventDefault(); setTaskToEdit({ ...taskToEdit, dueDate: todayStr }); setShowEditDateMenu(false); }} className="text-xs font-bold transition hover:opacity-70" style={{ color: accent }}>{t("today")}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                className="relative group w-full py-2.5 mt-4 rounded-xl font-bold overflow-hidden transition-all duration-200 active:scale-95"
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
                  {t("save") || "Save"}
                </span>
                <span className="relative z-10 block group-hover:opacity-0 transition-opacity duration-200 text-center">
                  {t("save") || "Save"}
                </span>
              </button>
            </form>

            <button
              onClick={() => {
                setTaskToEdit(null);
                setShowEditPriorityMenu(false);
                setShowEditDateMenu(false);
              }}
              className="relative group text-sm font-medium transition-all duration-300 mt-2"
              style={{ color: subText }}
            >
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.8)" }}
              >
                {t("cancel") || "Cancel"}
              </span>
              <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
                {t("cancel") || "Cancel"}
              </span>
            </button>
          </div>
        </div>, document.body)}

      {/* TOAST UNDO SYSTEM */}
      <div className="fixed bottom-10 inset-x-0 flex justify-center z-50 pointer-events-none">
        <AnimatePresence>
          {deletedTaskInfo && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pl-6 pr-3 py-2 rounded-full shadow-xl text-sm font-medium whitespace-nowrap pointer-events-auto flex items-center gap-4"
              style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
            >
              <span>{t("taskDeleted") || "Task deleted"}</span>
              <button
                onClick={undoDelete}
                className="px-3 py-1.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)" }}
              >
                {t("undo") || "Undo"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
