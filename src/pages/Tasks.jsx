import { useState, useEffect, useRef } from "react";
import { useTheme } from "../Context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Tasks() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const accent = isDark ? "#d4af37" : "#2563eb";
  const bg = isDark ? "#1f1f1f" : "#f2f4f8";
  const cardBg = isDark ? "#2a2a2a" : "#ffffff";
  const text = isDark ? "#ffffff" : "#1a1a1a";
  const subText = isDark ? "#aaa" : "#6b7280";
  const borderColor = isDark ? "#444" : "#e2e8f0";

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("streak_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("important");
  const [newTaskDate, setNewTaskDate] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Custom Dropdown UI States
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [calDate, setCalDate] = useState(new Date());

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("streak_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Handle clicking outside custom menus to close them safely
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setShowPriorityMenu(false);
        setShowDateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -- Helpers --
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      done: false,
      priority: newTaskPriority, // important, urgent, optional
      dueDate: newTaskDate || null
    };

    setTasks([newTask, ...tasks]);
    setNewTaskText("");
    setNewTaskPriority("important");
    setNewTaskDate("");
    setShowDateMenu(false);
    setShowPriorityMenu(false);
  };

  const toggleDone = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const clearCompleted = () => setTasks(tasks.filter(t => !t.done));

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEditing = (id) => {
    setEditingId(null);
    if (!editText.trim()) return deleteTask(id);
    setTasks(tasks.map(t => t.id === id ? { ...t, text: editText.trim() } : t));
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") saveEditing(id);
    if (e.key === "Escape") setEditingId(null);
  };

  // -- Sorting --
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1; 
    
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    const pWeight = { urgent: 3, important: 2, optional: 1 };
    if (pWeight[a.priority] !== pWeight[b.priority]) {
       return pWeight[b.priority] - pWeight[a.priority];
    }
    return b.id - a.id; 
  });

  const getPriorityColor = (p) => {
    if (p === "urgent") return "#ef4444"; 
    if (p === "important") return "#f59e0b"; 
    return "#22c55e"; 
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // --- Calendar Math ---
  const curYear = calDate.getFullYear();
  const curMonth = calDate.getMonth();
  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = (e) => { e.preventDefault(); setCalDate(new Date(curYear, curMonth - 1, 1)); };
  const handleNextMonth = (e) => { e.preventDefault(); setCalDate(new Date(curYear, curMonth + 1, 1)); };

  const handleDateSelect = (day) => {
    const m = String(curMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setNewTaskDate(`${curYear}-${m}-${d}`);
    setShowDateMenu(false);
  };

  return (
    <div className="flex flex-col items-center mt-12 pb-24 animate-fade-in w-full px-4">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <h1 className="text-3xl font-bold" style={{ color: accent }}>Tasks</h1>
          {tasks.some(t => t.done) && (
            <button 
              onClick={clearCompleted}
              className="text-sm font-medium transition opacity-70 hover:opacity-100 mb-1"
              style={{ color: accent }}
            >
              Clear Completed
            </button>
          )}
        </div>

        {/* Add Task Box */}
        <form 
          ref={formRef}
          onSubmit={handleAddTask}
          className="w-full p-4 rounded-xl mb-8 border flex flex-col md:flex-row gap-4 md:items-center transition-colors shadow-sm relative z-40"
          style={{ 
            backgroundColor: cardBg, 
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          }}
        >
          <input 
             type="text"
             placeholder="What needs to be done?"
             value={newTaskText}
             onChange={e => setNewTaskText(e.target.value)}
             className="flex-1 bg-transparent outline-none text-lg md:pl-2"
             style={{ color: text }}
          />
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             
             {/* --- CUSTOM DATE PICKER BUTTON --- */}
             <div className="relative">
               <div 
                 onClick={() => { setShowDateMenu(!showDateMenu); setShowPriorityMenu(false); }}
                 className="flex items-center justify-center px-4 py-2 rounded-xl transition cursor-pointer overflow-hidden border select-none"
                 style={{ 
                   backgroundColor: showDateMenu ? (isDark ? "#444" : "#e2e8f0") : (isDark ? "#333" : "#f8fafc"),
                   borderColor: showDateMenu ? accent : (isDark ? "#444" : "#e2e8f0"),
                 }}
               >
                  {newTaskDate ? (
                     <span className="text-sm font-bold tracking-wider" style={{ color: text }}>{newTaskDate}</span>
                  ) : (
                     <div className="flex items-center gap-2 text-sm font-bold" style={{ color: subText }}>
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       Date
                     </div>
                  )}
               </div>

               {/* Custom Calendar Popup */}
               <AnimatePresence>
                  {showDateMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-12 left-0 md:-left-16 w-64 p-4 rounded-3xl border shadow-2xl z-50 overflow-hidden"
                      style={{ backgroundColor: cardBg, borderColor: isDark ? "#444" : "#e2e8f0" }}
                    >
                      {/* Calendar Header */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-sm" style={{ color: text }}>{monthNames[curMonth]} {curYear}</span>
                        <div className="flex gap-2">
                          <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition">
                            <svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-500/20 transition">
                            <svg className="w-4 h-4" style={{ color: text }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Day Labels */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2 uppercase" style={{ color: subText }}>
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
                      </div>

                      {/* Day Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`blank-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const m = String(curMonth + 1).padStart(2, '0');
                          const d = String(day).padStart(2, '0');
                          const dateStr = `${curYear}-${m}-${d}`;
                          const isSelected = newTaskDate === dateStr;
                          const isCalToday = todayStr === dateStr;

                          return (
                            <button
                              key={day}
                              onClick={(e) => { e.preventDefault(); handleDateSelect(day); }}
                              className="w-full aspect-square flex items-center justify-center rounded-full text-xs font-medium transition-all"
                              style={{
                                backgroundColor: isSelected ? accent : (isCalToday ? `${accent}30` : "transparent"),
                                color: isSelected ? (isDark ? "#000" : "#fff") : text,
                                border: isCalToday && !isSelected ? `1px solid ${accent}` : "1px solid transparent"
                              }}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex justify-between items-center mt-4 pt-3 border-t" style={{ borderColor: isDark ? "#444" : "#e2e8f0" }}>
                        <button 
                          onClick={(e) => { e.preventDefault(); setNewTaskDate(""); setShowDateMenu(false); }}
                          className="text-xs font-bold transition hover:opacity-70" style={{ color: subText }}
                        >
                          Clear
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); setNewTaskDate(todayStr); setShowDateMenu(false); }}
                          className="text-xs font-bold transition hover:opacity-70" style={{ color: accent }}
                        >
                          Today
                        </button>
                      </div>
                    </motion.div>
                  )}
               </AnimatePresence>
             </div>

             {/* --- CUSTOM PRIORITY DROPDOWN --- */}
             <div className="relative">
               <div 
                 onClick={() => { setShowPriorityMenu(!showPriorityMenu); setShowDateMenu(false); }}
                 className="flex items-center justify-between gap-3 text-sm px-4 py-2 rounded-xl outline-none cursor-pointer font-bold border transition-colors select-none"
                 style={{ 
                   backgroundColor: showPriorityMenu ? (isDark ? "#444" : "#e2e8f0") : (isDark ? "#333" : "#f8fafc"),
                   borderColor: showPriorityMenu ? getPriorityColor(newTaskPriority) : (isDark ? "#444" : "#e2e8f0"),
                   color: getPriorityColor(newTaskPriority)
                 }}
               >
                 <span className="capitalize">{newTaskPriority}</span>
                 <motion.svg animate={{ rotate: showPriorityMenu ? 180 : 0 }} className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                 </motion.svg>
               </div>

               <AnimatePresence>
                 {showPriorityMenu && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     transition={{ duration: 0.15 }}
                     className="absolute top-12 right-0 w-36 p-2 rounded-3xl border shadow-2xl z-50 overflow-hidden flex flex-col gap-1"
                     style={{ backgroundColor: cardBg, borderColor: isDark ? "#444" : "#e2e8f0" }}
                   >
                     {["urgent", "important", "optional"].map(p => (
                       <div 
                         key={p}
                         onClick={() => { setNewTaskPriority(p); setShowPriorityMenu(false); }}
                         className="px-4 py-2 text-sm font-bold cursor-pointer transition capitalize rounded-xl hover:brightness-110"
                         style={{ 
                           color: getPriorityColor(p), 
                           backgroundColor: newTaskPriority === p ? (isDark ? "#333" : "#f1f5f9") : "transparent" 
                         }}
                       >
                         {p}
                       </div>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             <button 
               type="submit"
               className="px-6 py-2 rounded-xl font-bold transition-all shadow-lg active:scale-95"
               style={{ 
                 backgroundColor: newTaskText.trim() ? accent : (isDark ? "#444" : "#e5e7eb"), 
                 color: newTaskText.trim() ? (isDark ? "#000" : "#fff") : subText,
                 opacity: newTaskText.trim() ? 1 : 0.6,
                 boxShadow: newTaskText.trim() ? `0 4px 15px ${accent}40` : "none"
               }}
               disabled={!newTaskText.trim()}
             >
               Add
             </button>
          </div>
        </form>

        {/* Animated Task List */}
        <div className="flex flex-col gap-3 relative z-10 text-wrap">
          <AnimatePresence mode="popLayout">
            {sortedTasks.length === 0 && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="text-center py-12 opacity-50" 
                 style={{ color: subText }}
               >
                 No tasks yet. You're all caught up!
               </motion.div>
            )}

            {sortedTasks.map(task => {
               const isOverdue = task.dueDate && task.dueDate < todayStr && !task.done;
               const isToday = task.dueDate === todayStr && !task.done;
               
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
                   {/* Checkbox */}
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

                   {/* Title Segment */}
                   <div className="flex-1 overflow-hidden ml-2" onDoubleClick={() => startEditing(task)}>
                     {editingId === task.id ? (
                       <input 
                         autoFocus
                         className="w-full bg-transparent outline-none text-xl font-medium"
                         style={{ color: text }}
                         value={editText}
                         onChange={e => setEditText(e.target.value)}
                         onBlur={() => saveEditing(task.id)}
                         onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                       />
                     ) : (
                       <span 
                         className={`text-xl font-medium block truncate transition-colors ${task.done ? "line-through" : ""}`}
                         style={{ color: task.done ? subText : getPriorityColor(task.priority) }}
                       >
                         {task.text}
                       </span>
                     )}
                   </div>

                   {/* Meta & Actions */}
                   <div className="flex items-center justify-between md:justify-end gap-6 ml-10 md:ml-0">
                     {task.dueDate && (
                       <span 
                         className="text-xs px-3 py-1.5 rounded-xl font-bold tracking-wide shadow-sm"
                         style={{ 
                           color: task.done ? subText : (isOverdue ? "#ef4444" : isToday ? accent : subText),
                           backgroundColor: task.done ? "transparent" : (isOverdue ? "rgba(239, 68, 68, 0.15)" : isToday ? `${accent}20` : (isDark ? "#333" : "#f1f5f9"))
                         }}
                       >
                         {task.dueDate}
                       </span>
                     )}

                     <button 
                       className="opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                       style={{ color: subText }}
                       onClick={() => deleteTask(task.id)}
                       title="Delete task"
                     >
                       <svg className="w-5 h-5 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                     </button>
                   </div>
                 </motion.div>
               );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
