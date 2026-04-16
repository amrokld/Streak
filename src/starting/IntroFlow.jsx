import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../Context/LanguageContext";
import { useTheme } from "../Context/ThemeContext";
import { getTokens } from "../theme/tokens";
import { useHabits } from "../Context/HabitContext";

export default function IntroFlow({ onFinish }) {
  const [step, setStep] = useState(0);
  const [tourActive, setTourActive] = useState(false);

  const toggleEditDay = (day) => {
    setEditDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };


  const { isDark } = useTheme();
  const { cardBg, text } = getTokens(isDark);
  const { t } = useLanguage();

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleStartTour = () => {
    setTourActive(true);
    // TODO: Put your actual "small instructions" logic here! 
    // You can trigger your driver.js or custom tooltips here.
    // Once the user finishes the tour, run:
    // setTourActive(false); 
    // setStep(3); 

    // For demonstration, simulating tour completing after 4 seconds:
    setTimeout(() => {
      setTourActive(false);
      setStep(3);
    }, 4000);
  };

  // If tour is active, hide the intro window!
  if (tourActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] p-8 rounded-[32px] relative overflow-hidden ring-1 ring-white/10"
        style={{
          backgroundColor: cardBg,
          color: text,
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.8)' : '0 20px 40px rgba(0,0,0,0.15)'
        }}
      >
        <AnimatePresence mode="wait">
          {step === 0 && <Welcome key="0" next={next} />}
          {step === 1 && <ThemeAndLanguage key="1" next={next} back={back} />}
          {step === 2 && <Username key="2" next={next} back={back} />}
          {step === 3 && <AppIntroOptions key="3" next={next} back={back} onStartTour={handleStartTour} />}
          {step === 4 && <CreateFirstHabit key="4" next={next} />}
          {step === 5 && <Finish key="5" onFinish={onFinish} />}
        </AnimatePresence>

        {/* Progress Display */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-6 opacity-100" : "w-1.5 opacity-30"}`}
              style={{ backgroundColor: getTokens(isDark).accent }}
            />
          ))}
        </div>

      </motion.div>
    </div>
  );
}

{/* 1. Welcome - Styled Logo */ }
function Welcome({ next }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="mb-6 cursor-default mt-6"
      >
        <span
          className="text-6xl font-bold transition-all duration-300"
          style={{
            fontFamily: "Space Grotesk",
            letterSpacing: "0.06em",
            color: accent,
          }}
          onMouseEnter={(e) => e.currentTarget.style.textShadow = `0 0 15px ${accent}aa`}
          onMouseLeave={(e) => e.currentTarget.style.textShadow = "none"}
        >
          {t("appName") || "STREAK"}
        </span>
      </motion.div>

      <p className="mb-10 text-center text-sm font-medium" style={{ color: subText }}>
        {t("introWelcomeMsg")}
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={next}
        className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-lg"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("continue")}
      </motion.button>
    </motion.div>
  );
}

{/* 2. Theme & Lang Selection */ }
function ThemeAndLanguage({ next, back }) {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { accent, text, subText, cardBg } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: accent }}>
        {t("setupEnvMsg")}
      </h2>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: subText }}>
            {t("languageLabel")}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setLang('en')}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: lang === 'en' ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: lang === 'en' ? `${accent}15` : 'transparent',
                color: lang === 'en' ? accent : subText
              }}
              onMouseEnter={(e) => { if (lang !== 'en') e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (lang !== 'en') e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              English
            </button>
            <button
              onClick={() => setLang('ar')}
              className="flex-1 py-2 px-3 rounded-lg border text-sm font-bold transition-all"
              style={{
                fontFamily: "'Cairo', sans-serif",
                borderColor: lang === 'ar' ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: lang === 'ar' ? `${accent}15` : 'transparent',
                color: lang === 'ar' ? accent : subText
              }}
              onMouseEnter={(e) => { if (lang !== 'ar') e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (lang !== 'ar') e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              العربية
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: subText }}>
            {t("themeLabel")}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => isDark && toggleTheme()}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: !isDark ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: !isDark ? `${accent}15` : 'transparent',
                color: !isDark ? accent : subText
              }}
              onMouseEnter={(e) => { if (isDark) e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (isDark) e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              {t("lightTheme")}
            </button>
            <button
              onClick={() => !isDark && toggleTheme()}
              className="flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-all"
              style={{
                borderColor: isDark ? accent : (isDark ? '#444' : '#e5e7eb'),
                backgroundColor: isDark ? `${accent}15` : 'transparent',
                color: isDark ? accent : subText
              }}
              onMouseEnter={(e) => { if (!isDark) e.currentTarget.style.borderColor = accent }}
              onMouseLeave={(e) => { if (!isDark) e.currentTarget.style.borderColor = isDark ? '#444' : '#e5e7eb' }}
            >
              {t("darkTheme")}
            </button>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={next}
        className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-lg"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("continue")}
      </motion.button>
    </motion.div>
  );
}

{/* 2.5 Username Selection */ }
function Username({ next, back }) {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, text, subText, inputBg, cardBg } = getTokens(isDark);

  // Connect directly to local storage!
  const [name, setName] = useState(localStorage.getItem('username') || "");

  const handleContinue = () => {
    if (name.trim()) {
      localStorage.setItem("username", name.trim());
      next();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: accent }}>
        {t("whatToCall")}
      </h2>
      <p className="text-sm mb-8 text-center" style={{ color: subText }}>
        {t("changeFromSettings")}
      </p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
        autoFocus
        className="w-full mb-8 py-4 rounded-xl text-center text-lg font-medium outline-none transition-colors border"
        placeholder={t("yourName")}
        style={{
          backgroundColor: inputBg,
          color: text,
          borderColor: name.trim() ? accent : 'transparent'
        }}
      />

      <div className="flex gap-4">

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={!name.trim()}
          className="flex-1 py-3.5 rounded-xl font-bold transition-opacity disabled:opacity-50 shadow-lg"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("continue")}
        </motion.button>
      </div>
    </motion.div>
  );
}


{/* 3. App Intro (Triggers the global tour) */ }
function AppIntroOptions({ next, back, onStartTour }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, text, subText, cardBg } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
      <h2 className="text-2xl font-bold mb-4" style={{ color: accent }}>
        {t("quickTourTitle")}
      </h2>
      <p className="text-sm mb-10" style={{ color: subText }}>
        {t("quickTourDesc")}
      </p>

      <div className="flex flex-col gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onStartTour}
          className="w-full py-3.5 rounded-xl font-bold transition-colors shadow-md"
          style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
        >
          {t("startTourBtn")}
        </motion.button>

      </div>

      <button
        onClick={next}
        className="mt-6 mx-auto block text-xs font-medium opacity-50 hover:opacity-100 transition-opacity"
      >
        {t("skipBtn")}
      </button>
    </motion.div>
  );
}

{/* 4. Create First Habit */ }
function CreateFirstHabit({ next }) {
  const { isDark } = useTheme();
  const { lang, t } = useLanguage();
  const { text, subText, accent, inputBg } = getTokens(isDark);
  const { addHabit } = useHabits(); // Access the habit creation tool

  // 1. Move the State & Constants HERE (Inside the component)
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("urgent");
  const [frequency, setFrequency] = useState("daily");
  const [editDays, setEditDays] = useState([]);

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_LABELS = { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

  const toggleEditDay = (day) => {
    setEditDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const categories = [
    { id: "important", label: t("important"), color: "#f59e0b" },
    { id: "urgent", label: t("urgent"), color: "#ef4444" },
    { id: "optional", label: t("optional"), color: "#10b981" }
  ];

  // 2. Updated handleCreate to actually save the habit
  const handleCreate = () => {
    if (!title.trim()) return;

    addHabit({
      id: Date.now(),
      name: title.trim(),
      category: priority,
      streak: 0,
      longestStreak: 0,
      completedDays: [],
      lastCheck: null,
      frequency: frequency,
      days: frequency === "custom" ? editDays : []
    });

    next();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-1.5 text-center mt-2" style={{ color: accent }}>
        {t("whatToTrack")}
      </h2>
      <p className="text-xs mb-6 text-center" style={{ color: subText }}>
        {t("oneHabit")}
      </p>

      <input
        type="text"
        value={title}
        autoFocus
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("habitPlaceholder")}
        className="w-full text-center px-4 py-4 rounded-xl mb-4 focus:outline-none transition-colors border"
        style={{
          backgroundColor: inputBg,
          color: text,
          borderColor: title.trim() ? accent : 'transparent'
        }}
      />

      {/* Priority Chips */}
      <div className="flex justify-center gap-2 mb-6 w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setPriority(cat.id)}
            onMouseEnter={(e) => {
              if (priority !== cat.id) {
                e.currentTarget.style.backgroundColor = `${cat.color}25`;
                e.currentTarget.style.color = cat.color;
              }
            }}
            onMouseLeave={(e) => {
              if (priority !== cat.id) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = subText;
              }
            }}
            className="flex-1 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200"
            style={{
              backgroundColor: priority === cat.id ? `${cat.color}25` : 'transparent',
              color: priority === cat.id ? cat.color : subText,
              border: `1.5px solid ${priority === cat.id ? cat.color : (isDark ? '#444' : '#e5e7eb')}`
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Frequency Toggle */}
      <div className="text-[10px] font-bold tracking-[0.2em] mb-2.5 text-center" style={{ color: subText }}>
        {lang === 'ar' ? 'التكرار' : 'FREQUENCY'}
      </div>
      <div className="flex flex-col items-center gap-2 mb-8 w-full">
        <div className="flex justify-center gap-3 w-full max-w-[200px]">
          {['daily', 'custom'].map((freq) => (
            <button
              key={freq}
              onClick={() => setFrequency(freq)}
              onMouseEnter={(e) => {
                if (frequency !== freq) e.currentTarget.style.backgroundColor = `${accent}20`;
              }}
              onMouseLeave={(e) => {
                if (frequency !== freq) e.currentTarget.style.backgroundColor = "transparent";
              }}
              className="flex-1 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: frequency === freq ? `${accent}20` : 'transparent',
                color: frequency === freq ? accent : subText,
                border: `1.5px solid ${frequency === freq ? accent : (isDark ? '#444' : '#e5e7eb')}`
              }}
            >
              {t(freq) || freq}
            </button>
          ))}
        </div>

        {/* Custom Days - Shows under Buttons */}
        {frequency === "custom" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-1 mt-2">
            {DAY_KEYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleEditDay(day)}
                className="w-8 h-8 rounded-full text-[11px] font-bold transition-all duration-200"
                style={{
                  border: `1.5px solid ${editDays.includes(day) ? accent : (isDark ? "#444" : "#cbd5e1")}`,
                  backgroundColor: editDays.includes(day) ? accent : "transparent",
                  color: editDays.includes(day) ? (isDark ? "#000" : "#fff") : subText,
                }}
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreate}
        className="w-full py-3.5 rounded-xl font-bold transition-all"
        style={{
          border: `1.5px solid ${title.trim() ? accent : (isDark ? "#444" : "#cbd5e1")}`,
          color: title.trim() ? (isDark ? '#000' : '#fff') : text,
          backgroundColor: title.trim() ? accent : "transparent"
        }}
      >
        {t("create")}
      </motion.button>

      <button
        onClick={next}
        className="mt-5 mx-auto block text-xs font-medium opacity-50 hover:opacity-100 transition-opacity"
      >
        {t("skipBtn")}
      </button>
    </motion.div>
  );
}


{/* 5. Finish Slide */ }
function Finish({ onFinish }) {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { accent, subText } = getTokens(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: accent }}>
        {t("readyTitle")}
      </h2>
      <p className="text-sm mb-10 text-center" style={{ color: subText }}>
        {t("readyDesc")}
      </p>

      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onFinish}
        className="w-full py-3.5 rounded-xl font-bold transition-all shadow-md mt-4"
        style={{ backgroundColor: accent, color: isDark ? '#000' : '#fff' }}
      >
        {t("startAppBtn")}
      </motion.button>
    </motion.div>
  );
}
