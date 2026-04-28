import { useState, useEffect } from "react";
import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

// 📥 Loads directly from the hardcoded local file!
import initialNotes from "../data/devNotes.json";

export default function DevNotes() {
    const { isDark } = useTheme();
    const { accent, subText, cardBg, text, borderColor } = getTokens(isDark);
    const inputBg = isDark ? "#3a3a3a" : "#f3f4f6";

    const [notes, setNotes] = useState(initialNotes);
    const [selectedNote, setSelectedNote] = useState(null); // The small window when clicking a note
    const [showEditModal, setShowEditModal] = useState(false); // The form to create/edit
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [noteTitle, setNoteTitle] = useState("");
    const [noteDesc, setNoteDesc] = useState("");
    const [noteStatus, setNoteStatus] = useState("thinking");
    const [selectedLabel, setSelectedLabel] = useState("all");

    const statuses = ["done", "under developing", "canceled", "thinking", "on hold", "working on", "imporvements"];

    const getStatusColor = (status) => {
        switch (status) {
            case "done": return "#10b981"; // Green
            case "under developing": return "#3b82f6"; // Blue
            case "canceled": return "#ef4444"; // Red
            case "thinking": return "#f59e0b"; // Yellow
            case "on hold": return "#8b5cf6"; // Purple
            case "working on": return "#6B6969" //black
            case "imporvements": return "#009C9C" //Cyan
            default: return accent;
        }
    };

    // Keep state in sync if you edit the JSON file manually in VSCode
    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    // 💾 Saves directly to your VSCode file via our custom Vite Plugin!
    const saveToFile = async (newNotes) => {
        setNotes(newNotes);
        try {
            await fetch('/api/save-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotes, null, 2) // Pretty print JSON
            });
        } catch (e) {
            console.error("Failed to save to file", e);
        }
    };

    const handleOpenEdit = (note = null) => {
        if (note) {
            setEditingId(note.id);
            setNoteTitle(note.title);
            setNoteDesc(note.desc);
            setNoteStatus(note.status);
        } else {
            setEditingId(null);
            setNoteTitle("");
            setNoteDesc("");
            setNoteStatus("thinking");
        }
        setShowEditModal(true);
    };

    const handleSave = () => {
        if (!noteTitle.trim()) return;

        let newNotes;
        if (editingId) {
            newNotes = notes.map(n => n.id === editingId ? { ...n, title: noteTitle, desc: noteDesc, status: noteStatus } : n);
        } else {
            const dateStr = new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            newNotes = [{ id: Date.now(), title: noteTitle, desc: noteDesc, status: noteStatus, date: dateStr }, ...notes];
        }

        saveToFile(newNotes);
        setShowEditModal(false);
        setSelectedNote(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this note?")) {
            const newNotes = notes.filter(n => n.id !== id);
            saveToFile(newNotes);
            setSelectedNote(null);
        }
    };

    const activeLabels = ["all", ...new Set(notes.map(note => note.status))];
    const filteredNotes = selectedLabel === "all" ? notes : notes.filter(n => n.status === selectedLabel);

    return (
        <div className="flex justify-center mt-12 pb-24 animate-fade-in">
            <div className="w-full max-w-4xl px-6">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold" style={{ color: accent }}>Developer Notes</h2>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${accent}40` }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenEdit()}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                        style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                    >
                        + New Note
                    </motion.button>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {activeLabels.map(label => {
                        const active = selectedLabel === label;
                        const color = label === "all" ? accent : getStatusColor(label);
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
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* 1. OUTSIDE VIEW: Grid of notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredNotes.length === 0 && (
                        <div className="col-span-full text-center py-12" style={{ color: subText }}>
                            No notes found.
                        </div>
                    )}
                    {filteredNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            whileHover={{
                                boxShadow: `0 0 25px ${getStatusColor(note.status)}30`,
                                borderColor: getStatusColor(note.status)
                            }}
                            onClick={() => setSelectedNote(note)}
                            className="p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between"
                            style={{ backgroundColor: cardBg, borderColor: borderColor }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3 gap-4">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold line-clamp-1" style={{ color: text }}>{note.title}</h3>
                                        {note.date && <span className="text-[10px] mt-1 font-medium" style={{ color: subText }}>{note.date}</span>}
                                    </div>
                                    <span
                                        className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap"
                                        style={{
                                            backgroundColor: `${getStatusColor(note.status)}15`,
                                            color: getStatusColor(note.status),
                                            border: `1px solid ${getStatusColor(note.status)}50`
                                        }}
                                    >
                                        {note.status}
                                    </span>
                                </div>
                                <p className="text-sm line-clamp-3 leading-relaxed" style={{ color: subText }}>
                                    {note.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 2. CLICKED VIEW: The small window displaying the full note */}
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
                            boxShadow: `0 20px 50px rgba(0,0,0,0.3), 0 0 40px ${getStatusColor(selectedNote.status)}20`
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold pr-4" style={{ color: accent }}>{selectedNote.title}</h3>
                                {selectedNote.date && <p className="text-xs mt-1.5 font-medium" style={{ color: subText }}>{selectedNote.date}</p>}
                            </div>
                            <span
                                className="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap"
                                style={{
                                    backgroundColor: `${getStatusColor(selectedNote.status)}15`,
                                    color: getStatusColor(selectedNote.status),
                                    border: `1px solid ${getStatusColor(selectedNote.status)}50`
                                }}
                            >
                                {selectedNote.status}
                            </span>
                        </div>

                        <p className="text-[15px] leading-relaxed mb-10 whitespace-pre-wrap overflow-y-auto max-h-[40vh]" style={{ color: text }}>
                            {selectedNote.desc}
                        </p>

                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: borderColor }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(selectedNote.id)}
                                className="px-4 py-2 text-sm font-bold rounded-xl transition-colors hover:bg-red-500/10 text-red-500"
                            >
                                Delete
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${accent}40` }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setSelectedNote(null); handleOpenEdit(selectedNote); }}
                                className="px-5 py-2 text-sm font-bold rounded-xl shadow-sm transition-colors"
                                style={{ backgroundColor: accent, color: isDark ? "#000" : "#fff" }}
                            >
                                Edit Note
                            </motion.button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* 3. EDIT/NEW MODAL: The form to type your notes */}
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
                            {editingId ? "Edit Note" : "New Note"}
                        </h3>

                        <input
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Note Title"
                            className="w-full px-4 py-3 rounded-xl mb-4 text-sm font-medium outline-none transition-colors border"
                            style={{ backgroundColor: inputBg, color: text, borderColor: noteTitle.trim() ? accent : 'transparent' }}
                            autoFocus
                        />

                        <textarea
                            value={noteDesc}
                            onChange={(e) => setNoteDesc(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full h-40 px-4 py-3 rounded-xl mb-6 text-sm outline-none resize-none transition-colors border"
                            style={{ backgroundColor: inputBg, color: text, borderColor: noteDesc.trim() ? accent : 'transparent' }}
                        />

                        {/* Status Label Picker */}
                        <p className="text-xs font-bold tracking-wider uppercase mb-3 self-start" style={{ color: subText }}>Label</p>
                        <div className="flex flex-wrap gap-2 mb-8 w-full">
                            {statuses.map(status => {
                                const active = noteStatus === status;
                                const color = getStatusColor(status);
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setNoteStatus(status)}
                                        className="px-3 py-1.5 rounded-full text-xs transition font-bold uppercase"
                                        style={{
                                            border: `1.5px solid ${active ? color : (isDark ? "#444" : "#cbd5e1")}`,
                                            backgroundColor: active ? `${color}15` : "transparent",
                                            color: color,
                                        }}
                                    >
                                        {status}
                                    </button>
                                );
                            })}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: `0 0 15px ${accent}40` }}
                            whileTap={{ scale: 0.98 }}
                            className="relative group w-full py-3 rounded-xl font-bold overflow-hidden transition-all duration-200 shadow-md mt-2"
                            style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
                            onClick={handleSave}
                        >
                            Save Note
                        </motion.button>

                        <button
                            className="mt-5 text-sm font-medium opacity-50 hover:opacity-100 transition"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
