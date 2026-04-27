// Notes Page
import { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { useLanguage } from "../Context/LanguageContext";
import { getTokens } from "../theme/tokens";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function Notes() {
  const { isDark } = useTheme();
  const { t, lang } = useLanguage();
  const { accent, subText, cardBg, text, borderColor } = getTokens(isDark);
  const inputBg = isDark ? "#3a3a3a" : "#f3f4f6";

  const presetColors = [
    "#3b82f6", "#8b5cf6", "#ec4899",
    "#ef4444", "#f59e0b", "#10b981",
    "#06b6d4", "#6366f1", "#000000"
  ];

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const [emptyStateText] = useState(() => ({
    primary: getRandom(t("notesEmptyPrimary")),
    secondary: getRandom(t("notesEmptySecondary")),
    randomLine: getRandom(t("notesEmptyRandom")),
  }));
  const STORAGE_KEY = "notes_app";
  const LABELS_KEY = "notes_labels";

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [labels, setLabels] = useState(() => {
    const saved = localStorage.getItem(LABELS_KEY);
    return saved ? JSON.parse(saved) : [
      { name: "general", color: accent },
      { name: "ideas", color: "#8b5cf6" },
      { name: "tasks", color: "#10b981" },
      { name: "important", color: "#ef4444" }
    ]
  })

  const [showLabelCreator, setShowLabelCreator] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteLabel, setNoteLabel] = useState("general");

  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
  }, [labels]);

  const getLabelColor = (labelName) => {
    const found = labels.find(l => l.name === labelName);
    return found ? found.color : accent;
  };

  const [selectedLabel, setSelectedLabel] = useState("all");

  const labelNames = [
    ...new Set(notes.map(n => n.label || "general"))
  ];

  const activeLabels =
    notes.length === 0
      ? []
      : labelNames.length > 1
        ? ["all", ...labelNames]
        : labelNames;

  const filteredNotes =
    selectedLabel === "all"
      ? notes
      : notes.filter(n => (n.label || "general") === selectedLabel);

  const handleOpenEdit = (note = null) => {
    if (note) {
      setEditingId(note.id);
      setNoteTitle(note.title);
      setNoteDesc(note.desc);
      setNoteLabel(note.label || "general");
    } else {
      setEditingId(null);
      setNoteTitle("");
      setNoteDesc("");
      setNoteLabel("general");
    }
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim()) return;

    let newNotes;

    if (editingId) {
      newNotes = notes.map(n =>
        n.id === editingId
          ? { ...n, title: noteTitle, desc: noteDesc, label: noteLabel.trim().toLowerCase() }
          : n
      );
    } else {
      newNotes = [
        {
          id: Date.now(),
          title: noteTitle,
          desc: noteDesc,
          label: noteLabel.trim().toLowerCase(),
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        ...notes
      ];
    }

    setNotes(newNotes);
    setShowEditModal(false);
    setSelectedNote(null);
  };

  const handleDelete = (id) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    setSelectedNote(null);
  };

  return (
    <div className="flex justify-center mt-12 pb-24 animate-fade-in">
      <div className="w-full max-w-4xl px-6">
        {/* HEADER */}
        <div id="tour-nav-notes" className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: accent }}>
            {t("notes")}
          </h2>

          <button
            onClick={() => handleOpenEdit()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 hover:scale-105 group"
            style={{
              backgroundColor: accent,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${accent}40`
            }}
          >
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t("newNote")}
          </button>


        </div>

        {/* LABELS RAW (FILTERING) */}
        <div className="flex flex-wrap gap-3 mb-8">
          {activeLabels.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-8">
              {activeLabels.map(label => {
                const active = selectedLabel === label;
                const color = label === "all" ? accent : getLabelColor(label);

                return (
                  <button
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all duration-200"
                    style={{
                      border: `1.5px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                      backgroundColor: active ? `${color}15` : "transparent",
                      color: color,
                      transform: active ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    {t(label)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredNotes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="col-span-full flex flex-col items-center justify-center py-24 text-center"
            >

              {/* ICON */}
              <div className="mb-6 opacity-70 ">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8">
                  <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                  <path d="M14 3v5h5" />
                </svg>
              </div>

              {/* PRIMARY */}
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: accent }}
              >
                {emptyStateText.primary}
              </h2>

              {/* SECONDARY */}
              <p
                className="text-sm mb-3"
                style={{ color: subText }}
              >
                {emptyStateText.secondary}
              </p>

              {/* RANDOM LINE */}
              <span
                className="text-xs tracking-wide opacity-60"
                style={{ color: subText }}
              >
                {emptyStateText.randomLine}
              </span>

            </motion.div>
          )}

          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{
                boxShadow: `0 0 25px ${getLabelColor(note.label)}30`,
                borderColor: getLabelColor(note.label)
              }}
              onClick={() => setSelectedNote(note)}
              className="p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between"
              style={{ backgroundColor: cardBg, borderColor: borderColor }}
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div className="flex flex-col leading-tight">
                    <h3
                      className="text-lg font-bold"
                      style={{ color: text }}
                    >
                      {note.title}
                    </h3>

                    {note.date && (
                      <span
                        className="text-[10px] font-medium"
                        style={{ color: subText }}
                      >
                        {note.date}
                      </span>
                    )}
                  </div>

                  <span
                    className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap"
                    style={{
                      backgroundColor: `${getLabelColor(note.label)}15`,
                      color: getLabelColor(note.label),
                      border: `1px solid ${getLabelColor(note.label)}50`
                    }}
                  >
                    {t(note.label || "general")}
                  </span>
                </div>

                <p
                  className="text-sm line-clamp-3 leading-relaxed"
                  style={{ color: subText }}
                >
                  {note.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {selectedNote && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md animate-fade-in"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
          onClick={() => setSelectedNote(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="rounded-3xl p-8 w-[500px] max-w-[90vw] border flex flex-col relative"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${getLabelColor(selectedNote.label)}20`
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold pr-4" style={{ color: accent }}>
                  {selectedNote.title}
                </h3>

                {selectedNote.date && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: subText }}>
                    {selectedNote.date}
                  </p>
                )}
              </div>

              <span
                className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap"
                style={{
                  backgroundColor: `${getLabelColor(selectedNote.label)}15`,
                  color: getLabelColor(selectedNote.label),
                  border: `1px solid ${getLabelColor(selectedNote.label)}50`
                }}
              >
                {t(selectedNote.label || "general")}
              </span>
            </div>

            <p
              className="text-[15px] leading-relaxed mb-10 whitespace-pre-wrap overflow-y-auto max-h-[40vh]"
              style={{ color: text }}
            >
              {selectedNote.desc}
            </p>

            <div
              className="flex justify-end gap-3 pt-4 border-t"
              style={{ borderColor: borderColor }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDelete(selectedNote.id)}
                className="px-4 py-2 text-sm font-bold rounded-xl transition-colors hover:bg-red-500/10 text-red-500"
              >
                {t("delete")}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${accent}40` }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedNote(null);
                  handleOpenEdit(selectedNote);
                }}
                className="px-5 py-2 text-sm font-bold rounded-xl shadow-sm transition-colors"
                style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
              >
                {t("editNote")}
              </motion.button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {showEditModal && createPortal(
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center backdrop-blur-md animate-fade-in"
          style={{ backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="rounded-3xl px-8 py-8 w-[420px] max-w-[90vw] border flex flex-col items-center shadow-2xl"
            style={{ backgroundColor: cardBg, color: text, borderColor: borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6" style={{ color: accent }}>
              {t(editingId ? "editNote" : "newNote")}
            </h3>

            {/* Title */}
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder={t("noteTitle")}
              className="w-full px-4 py-3 rounded-xl mb-4 text-sm font-medium outline-none transition-colors border"
              style={{
                backgroundColor: inputBg,
                color: text,
                borderColor: noteTitle.trim() ? accent : "transparent"
              }}
              autoFocus
            />

            {/* Description */}
            <textarea
              value={noteDesc}
              onChange={(e) => setNoteDesc(e.target.value)}
              placeholder={t("noteDescPlaceholder")}
              className="w-full h-40 px-4 py-3 rounded-xl mb-6 text-sm outline-none resize-none transition-colors border"
              style={{
                backgroundColor: inputBg,
                color: text,
                borderColor: noteDesc.trim() ? accent : "transparent"
              }}
            />

            {/* Label picker */}
            <div className="flex items-center gap-2 mb-3 w-full">
              <p className="text-xs font-bold tracking-wider uppercase" style={{ color: subText }}>
                {t("label")}
              </p>

              {/* ADD */}
              <button
                onClick={() => setShowLabelCreator(prev => !prev)}
                className="text-sm font-bold px-1 opacity-70 hover:opacity-100 transition"
                style={{ color: accent }}
              >
                +
              </button>

              {/* DELETE */}
              <button
                onClick={() => {
                  setLabels(prev => prev.filter(l => l.name !== noteLabel));
                  setNoteLabel("general");
                }}
                className="ml-auto text-sm font-bold px-1 opacity-70 hover:opacity-100 transition"
                style={{ color: "#ef4444" }}
              >
                -
              </button>
            </div>

            {showLabelCreator && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4 w-full"
              >
                {/* Label input */}
                <input
                  placeholder={t("pressEnterToAdd") || "Press Enter to add ..."}
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none border"
                  style={{ backgroundColor: inputBg, color: text, borderColor }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const name = newLabelName.trim().toLowerCase();
                      if (!name) return;
                      if (labels.some(l => l.name === name)) return;

                      setLabels(prev => [...prev, { name, color: newLabelColor }]);
                      setNoteLabel(name);

                      setNewLabelName("");
                      setShowLabelCreator(false);
                    }
                  }}
                />

                {/* Color dropdown */}
                <div className="relative">
                  {/* Selected color */}
                  <div
                    onClick={() => setShowColorPicker(prev => !prev)}
                    className="w-6 h-6 rounded-full cursor-pointer"
                    style={{
                      backgroundColor: newLabelColor,
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.1)"
                    }}
                  />

                  {/* Dropdown */}
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-8 left-0 flex gap-2 p-2 rounded-xl border shadow-lg z-50"
                      style={{ backgroundColor: cardBg, borderColor }}
                    >
                      {presetColors.map(c => (
                        <div
                          key={c}
                          onClick={() => {
                            setNewLabelColor(c);
                            setShowColorPicker(false);
                          }}
                          className="w-5 h-5 rounded-full cursor-pointer"
                          style={{
                            backgroundColor: c,
                            border: newLabelColor === c ? "2px solid white" : "2px solid transparent",
                            boxShadow: newLabelColor === c ? `0 0 0 2px ${c}` : "none"
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="flex flex-wrap gap-2 mb-8 w-full">
              {labels.map(label => {
                const active = noteLabel === label.name;
                const color = getLabelColor(label.name);

                return (
                  <button
                    key={label.name}
                    onClick={() => setNoteLabel(label.name)}
                    className="px-3 py-1.5 rounded-full text-xs transition font-bold uppercase"
                    style={{
                      border: `1.5px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                      backgroundColor: active ? `${color}15` : "transparent",
                      color: color,
                    }}
                  >
                    {t(label.name)}
                  </button>
                );
              })}
            </div>

            {/* Save */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: `0 0 15px ${accent}40` }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold shadow-md transition-all"
              style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
              onClick={handleSave}
            >
              {t("saveNote")}
            </motion.button>

            {/* Cancel */}
            <button
              className="mt-5 text-sm font-medium opacity-50 hover:opacity-100 transition"
              onClick={() => setShowEditModal(false)}
            >
              {t("cancel")}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
